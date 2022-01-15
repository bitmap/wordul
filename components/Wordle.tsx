import { useEffect, useRef, useState } from "react";
import { classNames } from "../lib/utils";
import { answerList, allowList } from "../lib/words";
import styles from "../styles/Wordle.module.css";

interface Guess {
  /** The index of the letter in the string */
  index: number;
  /** The letter */
  value: string;
  /** Letter is in the correct index */
  isCorrect: boolean;
  /** Letter is in answer, but not in correct index */
  isIncluded: boolean;
  /** Letter is not empty */
  isEmpty: boolean;
}

type GuessRow = Guess[];

// Constants
const FORM_NAME = "GUESS";
const WORD_LENGTH = 5;
const TOTAL_GUESSES = 6;
const ALL_WORDS = answerList.concat(allowList);
const ANSWER = answerList[Math.floor(Math.random() * answerList.length)];

/** An array of empty guesses (one row) */
const emptyGuesses: GuessRow = Array.from(
  { length: WORD_LENGTH },
  (value: string = "", index: number): Guess => ({
    index,
    value,
    isCorrect: false,
    isIncluded: false,
    isEmpty: true,
  })
);

/** Initial grid state */
const initialState: GuessRow[] = new Array(TOTAL_GUESSES).fill(emptyGuesses);

/** Compares user's guess to the answer and creates a new `GuessRow` for the grid. */
export function makeGuess(guess: string, answer: string): GuessRow {
  // Split the string and map each letter to a Guess
  return guess.split("").map<Guess>((value, index) => {
    const isCorrect = answer.charAt(index) === value;
    const isIncluded = answer.includes(value);
    const isEmpty = !Boolean(value);

    return {
      index,
      value,
      isCorrect,
      isIncluded,
      isEmpty,
    };
  });
}

/** Grid of letters */
function TileGrid({ guesses }: { guesses: GuessRow[] }) {
  return (
    <div className={styles.grid}>
      {guesses.map((letters) =>
        letters.map((letter, index) => (
          <div
            key={index}
            className={classNames(
              styles.tile,
              letter.isIncluded && styles.isIncluded,
              letter.isCorrect && styles.isCorrect,
              letter.isEmpty && styles.isEmpty
            )}
          >
            {letter.value}
          </div>
        ))
      )}
    </div>
  );
}

/** Wordle: A word game */
export default function Wordle() {
  const [currentGuess, setCurrentGuess] = useState(0);
  const [guesses, setGuesses] = useState(initialState);
  const [guessedCorrect, setGuessedCorrect] = useState(false);
  const [guessedTooMany, setGuessedTooMany] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Input ref used to focus when game initilaizes
  const input = useRef<HTMLInputElement>(null);

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const guess = (formData.get(FORM_NAME) as string).toLowerCase();

    // Make sure word is the exact length
    if (guess.length !== WORD_LENGTH) {
      setErrorText(`Guess must be ${WORD_LENGTH} letters`);
    }

    // Make sure word is valid
    else if (!ALL_WORDS.includes(guess)) {
      setErrorText(`"${guess.toUpperCase()}" is not a valid word!`);
    }

    // Update the grid with the user's guess
    else {
      setGuesses((prevState) => {
        const newState = [...prevState];
        newState[currentGuess] = makeGuess(guess, ANSWER);
        return newState;
      });

      // Increment currentGuess
      setCurrentGuess((prevState) => prevState + 1);
    }

    // Reset form
    form.reset();
  };

  // Focus on the input element on mount
  useEffect(() => {
    input.current?.focus();
  }, []);

  // Game side-effects
  useEffect(() => {
    // Out of guesses
    if (currentGuess >= TOTAL_GUESSES) {
      setGuessedTooMany(true);
    }

    // Check if last guess was correct
    if (guesses[currentGuess - 1]?.every((guess) => guess.isCorrect)) {
      setGuessedCorrect(true);
    }
  }, [guesses, currentGuess]);

  // Hide error text after a few seconds
  useEffect(() => {
    if (errorText) {
      const timeout = setTimeout(() => {
        setErrorText("");
      }, 2500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [errorText]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wordle</h1>
        <Help />
      </header>

      {/* The grid */}
      <TileGrid guesses={guesses} />

      {/* The form and messages */}
      <div className={styles.footer}>
        {guessedTooMany || guessedCorrect ? (
          <div>
            {guessedCorrect ? (
              "Nice! You got it! 👏"
            ) : guessedTooMany ? (
              <strong>{ANSWER.toUpperCase()}</strong>
            ) : null}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={styles.form}
            autoComplete="off"
          >
            <label htmlFor={FORM_NAME}>Guess:</label>
            <input
              ref={input}
              type="text"
              maxLength={5}
              id={FORM_NAME}
              name={FORM_NAME}
            />
            <button className={styles.button}>Enter</button>
            {Boolean(errorText) && (
              <div className={styles.error}>{errorText}</div>
            )}
          </form>
        )}
      </div>
    </main>
  );
}

/**
 * Instructions
 */
function Help() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button className={styles.help} onClick={() => setShowHelp(true)}>
        ?
      </button>
      {showHelp && (
        <div className={styles.takeover}>
          <div className={styles.container}>
            <h1>Guess the word</h1>
            <p>
              Each guess must be a valid <strong>{WORD_LENGTH}</strong> letter
              word. Hit the enter button to submit.
            </p>
            <p>
              After each guess, the color of the tiles will change to show how
              close your guess was to the word.
            </p>
            <h2>For example:</h2>
            <p>
              The letters &quot;T&quot;, &quot;E&quot;, and &quot;R&quot; are in
              the word, but they are not in the correct spot.
            </p>
            <TileGrid guesses={[makeGuess("tiger", "alert")]} />

            <p>
              The letters &quot;A&quot; and &quot;L&quot; are correct. The
              letters &quot;T&quot;, &quot;E&quot;, and &quot;R&quot; are still
              not the correct spot.
            </p>
            <TileGrid guesses={[makeGuess("alter", "alert")]} />

            <p>The correct word ANSWER is &quot;ALERT&quot;</p>
            <TileGrid guesses={[makeGuess("alert", "alert")]} />

            <p>
              You must guess the correct word in{" "}
              <strong>{TOTAL_GUESSES} tries or less.</strong> Have fun!
            </p>

            <div className={styles.footer}>
              <button
                onClick={() => setShowHelp(false)}
                className={styles.button}
              >
                Thanks, I got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
