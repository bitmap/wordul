import { WORD_LENGTH, TOTAL_GUESSES } from "./constants";
import type { Guess } from "./types/guess";

/** An array of empty guesses (one row) */
const emptyGuesses: Guess[] = Array.from(
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
const initialGrid: Guess[][] = new Array(TOTAL_GUESSES).fill(emptyGuesses);

interface State {
  currentGuess: number;
  guesses: Guess[][];
  guessedCorrect: boolean;
  guessedTooMany: boolean;
  errorText: string;
}

export const enum Actions {
  SET_CURRENT_GUESS,
  SET_CORRECT,
  SET_TOO_MANY,
  SET_ERROR,
  RESET,
}

export const initialState: State = {
  currentGuess: 0,
  guesses: initialGrid,
  guessedCorrect: false,
  guessedTooMany: false,
  errorText: "",
};

export const reducer = (
  state: State,
  action:
    | { type: Actions.SET_CURRENT_GUESS; payload: Guess[] }
    | { type: Actions.SET_CORRECT }
    | { type: Actions.SET_TOO_MANY }
    | { type: Actions.SET_ERROR; payload: string }
    | { type: Actions.RESET; }
) => {
  switch (action.type) {
    case Actions.SET_CURRENT_GUESS:
      const guesses = [...state.guesses];
      guesses[state.currentGuess] = action.payload;
      return {
        ...state,
        guesses,
        currentGuess: state.currentGuess + 1,
      };
    case Actions.SET_CORRECT:
      return {
        ...state,
        guessedCorrect: true,
      };
    case Actions.SET_TOO_MANY:
      return {
        ...state,
        guessedTooMany: true,
      };
    case Actions.SET_ERROR:
      return {
        ...state,
        errorText: action.payload,
      };
    case Actions.RESET:
      return {
        ...initialState
      };

    default:
      return { ...state };
  }
};
