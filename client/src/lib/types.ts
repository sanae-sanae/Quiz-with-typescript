// Question types based on the Trivia API response format
export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface ProcessedQuestion extends TriviaQuestion {
  id: number;
  all_answers: string[]; // Shuffled array of all answers
}

export interface QuizParams {
  amount: number;
  category?: number;
  difficulty?: string;
  type?: string;
}

export interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

export interface PlayerData {
  name: string;
  lastCompletedQuestion: number;
  score: number;
}

export interface QuizResults {
  playerName: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  date: string;
}

// Types for keyboard controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  interact = 'interact',
}
