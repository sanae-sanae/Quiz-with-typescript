import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProcessedQuestion, PlayerData, QuizResults } from "../types";
import { LOCAL_STORAGE_KEYS } from "../constants";

interface QuizState {
  playerName: string;
  isNameSet: boolean;
  questions: ProcessedQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  answers: Record<number, string>; 
  
  isLoading: boolean;
  isQuizStarted: boolean;
  isQuizCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  quizHistory: QuizResults[];
  setPlayerName: (name: string) => void;
  setQuestions: (questions: ProcessedQuestion[]) => void;
  startQuiz: () => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  selectAnswer: (answer: string) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  loadSavedProgress: () => boolean;
}

export const useQuiz = create<QuizState>()(
  persist(
    (set, get) => ({
      playerName: "",
      isNameSet: false,
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      answers: {},
      isLoading: false,
      isQuizStarted: false,
      isQuizCompleted: false,
      startTime: null,
      endTime: null,
      quizHistory: [],
      setPlayerName: (name: string) => {
        set({ playerName: name, isNameSet: true });
        const playerData: PlayerData = {
          name,
          lastCompletedQuestion: -1,
          score: 0,
        };
        localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
      },

      setQuestions: (questions: ProcessedQuestion[]) => {
        set({ questions, isLoading: false });
      },
      startQuiz: () => {
        set({ 
          isQuizStarted: true, 
          startTime: Date.now(),
          currentQuestionIndex: 0,
          answers: {},
          isQuizCompleted: false,
          endTime: null
        });
      },
      goToNextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({ 
            currentQuestionIndex: currentQuestionIndex + 1,
            selectedAnswer: null 
          });
          const playerDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_DATA);
          if (playerDataStr) {
            const playerData: PlayerData = JSON.parse(playerDataStr);
            playerData.lastCompletedQuestion = currentQuestionIndex;
            localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
          }
        }
      },
      goToPreviousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ 
            currentQuestionIndex: currentQuestionIndex - 1,
            selectedAnswer: null 
          });
        }
      },
      selectAnswer: (answer: string) => {
        const { currentQuestionIndex, questions, answers } = get();
        const currentQuestion = questions[currentQuestionIndex];
        
        set({ 
          selectedAnswer: answer,
          answers: { 
            ...answers, 
            [currentQuestion.id]: answer 
          }
        });
      },
      submitQuiz: () => {
        const { questions, answers, playerName, startTime } = get();
        const endTime = Date.now();
        
        // Calculate score
        let score = 0;
        questions.forEach(question => {
          if (answers[question.id] === question.correct_answer) {
            score++;
          }
        });
        const results: QuizResults = {
          playerName,
          score,
          totalQuestions: questions.length,
          timeTaken: startTime ? (endTime - startTime) / 1000 : 0,
          date: new Date().toISOString(),
        };
        set(state => ({ 
          isQuizCompleted: true, 
          endTime,
          quizHistory: [...state.quizHistory, results]
        }));
        const playerDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_DATA);
        if (playerDataStr) {
          const playerData: PlayerData = JSON.parse(playerDataStr);
          playerData.lastCompletedQuestion = -1;
          playerData.score = score;
          localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
        }
        const historyStr = localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY);
        const history = historyStr ? JSON.parse(historyStr) : [];
        history.push(results);
        localStorage.setItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
      },

      resetQuiz: () => {
        set({ 
          currentQuestionIndex: 0,
          selectedAnswer: null,
          answers: {},
          isQuizStarted: false,
          isQuizCompleted: false,
          startTime: null,
          endTime: null
        });
      },
      loadSavedProgress: () => {
        const playerDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_DATA);
        if (playerDataStr) {
          const playerData: PlayerData = JSON.parse(playerDataStr);
          if (playerData.name) {
            set({ 
              playerName: playerData.name,
              isNameSet: true 
            });
          }
          if (playerData.lastCompletedQuestion >= 0) {
            set({ 
              currentQuestionIndex: playerData.lastCompletedQuestion + 1
            });
            return true;
          }
        }
        const historyStr = localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY);
        if (historyStr) {
          set({ quizHistory: JSON.parse(historyStr) });
        }
        
        return false;
      }
    }),
    {
      name: "quiz-storage",
      partialize: (state) => ({
        playerName: state.playerName,
        isNameSet: state.isNameSet,
        quizHistory: state.quizHistory
      }),
    }
  )
);
