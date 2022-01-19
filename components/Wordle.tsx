import { useEffect, useReducer, useRef, useState } from "react";
import { WORD_LENGTH, TOTAL_GUESSES } from "../lib/constants";
import { answerList, allowList } from "../lib/words";
import { reducer, initialState, Actions } from "../lib/state";
import { classNames } from "../lib/utils";
import type { Guess } from "../lib/types/guess";
import styles from "../styles/Wordle.module.css";

// Constants
const FORM_NAME = "GUESS";
const ALL_WORDS = answerList.concat(allowList);
const ANSWER = answerList[Math.floor(Math.random() * answerList.length)];

/** Compares user's guess to the answer and creates a new `GuessRow` for the grid. */
export function makeGuess(guess: string, answer: string): Guess[] {
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
function TileGrid({ guesses }: { guesses: Guess[][] }) {
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
  const [state, dispatch] = useReducer(reducer, initialState);

  // Input ref used to focus when game initilaizes
  const input = useRef<HTMLInputElement>(null);

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const guess = (formData.get(FORM_NAME) as string).toLowerCase();

    // Make sure word is the exact length
    if (guess.length !== WORD_LENGTH) {
      dispatch({
        type: Actions.SET_ERROR,
        payload: `Guess must be ${WORD_LENGTH} letters`,
      });
    }

    // Make sure word is valid
    else if (!ALL_WORDS.includes(guess)) {
      dispatch({
        type: Actions.SET_ERROR,
        payload: `"${guess.toUpperCase()}" is not a valid word!`,
      });
    }

    // Update the grid with the user's guess
    else {
      const newGuess = makeGuess(guess, ANSWER);
      dispatch({ type: Actions.SET_CURRENT_GUESS, payload: newGuess });
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
    const lastGuess = state.guesses[state.currentGuess - 1];

    // Check if last guess was correct
    if (lastGuess?.every((guess) => guess.isCorrect)) {
      dispatch({ type: Actions.SET_CORRECT });
    }

    // Out of guesses
    if (state.currentGuess >= TOTAL_GUESSES) {
      dispatch({ type: Actions.SET_TOO_MANY });
    }
  }, [state.currentGuess, state.guesses]);

  // Hide error text after a few seconds
  useEffect(() => {
    if (state.errorText) {
      const timeout = setTimeout(() => {
        dispatch({ type: Actions.SET_ERROR, payload: "" });
      }, 2500);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [state.errorText]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wordle</h1>
        <Help />
      </header>

      {/* The grid */}
      <TileGrid guesses={state.guesses} />

      {/* The form and messages */}
      <div className={styles.footer}>
        {state.guessedTooMany || state.guessedCorrect ? (
          <div>
            {state.guessedCorrect ? (
              "Nice! You got it! 👏"
            ) : state.guessedTooMany ? (
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
            {Boolean(state.errorText) && (
              <div className={styles.error}>{state.errorText}</div>
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
