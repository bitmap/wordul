export interface Guess {
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
