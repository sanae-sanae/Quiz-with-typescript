import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProcessedQuestion, PlayerData, QuizResults } from "../types";
import { LOCAL_STORAGE_KEYS } from "../constants";

interface QuizState {
  // Player data
  playerName: string;
  isNameSet: boolean;
  
  // Questions and progress
  questions: ProcessedQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  answers: Record<number, string>; // Maps question ID to selected answer
  
  // Quiz state
  isLoading: boolean;
  isQuizStarted: boolean;
  isQuizCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  
  // Quiz history
  quizHistory: QuizResults[];
  
  // Actions
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
      // Initial state
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
      
      // Set player name
      setPlayerName: (name: string) => {
        set({ playerName: name, isNameSet: true });
        
        // Save to localStorage
        const playerData: PlayerData = {
          name,
          lastCompletedQuestion: -1,
          score: 0,
        };
        localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
      },
      
      // Set questions for the quiz
      setQuestions: (questions: ProcessedQuestion[]) => {
        set({ questions, isLoading: false });
      },
      
      // Start the quiz
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
      
      // Navigate to the next question
      goToNextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({ 
            currentQuestionIndex: currentQuestionIndex + 1,
            selectedAnswer: null 
          });
          
          // Update progress in localStorage
          const playerDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_DATA);
          if (playerDataStr) {
            const playerData: PlayerData = JSON.parse(playerDataStr);
            playerData.lastCompletedQuestion = currentQuestionIndex;
            localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
          }
        }
      },
      
      // Navigate to the previous question
      goToPreviousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ 
            currentQuestionIndex: currentQuestionIndex - 1,
            selectedAnswer: null 
          });
        }
      },
      
      // Select an answer for the current question
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
      
      // Submit the quiz and calculate results
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
        
        // Create results object
        const results: QuizResults = {
          playerName,
          score,
          totalQuestions: questions.length,
          timeTaken: startTime ? (endTime - startTime) / 1000 : 0, // in seconds
          date: new Date().toISOString(),
        };
        
        // Update state
        set(state => ({ 
          isQuizCompleted: true, 
          endTime,
          quizHistory: [...state.quizHistory, results]
        }));
        
        // Clear progress in localStorage
        const playerDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_DATA);
        if (playerDataStr) {
          const playerData: PlayerData = JSON.parse(playerDataStr);
          playerData.lastCompletedQuestion = -1;
          playerData.score = score;
          localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_DATA, JSON.stringify(playerData));
        }
        
        // Save quiz history
        const historyStr = localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY);
        const history = historyStr ? JSON.parse(historyStr) : [];
        history.push(results);
        localStorage.setItem(LOCAL_STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
      },
      
      // Reset the quiz state
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
      
      // Load saved progress from localStorage
      loadSavedProgress: () => {
        const playerDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_DATA);
        if (playerDataStr) {
          const playerData: PlayerData = JSON.parse(playerDataStr);
          
          // Set player name if available
          if (playerData.name) {
            set({ 
              playerName: playerData.name,
              isNameSet: true 
            });
          }
          
          // Load progress if available
          if (playerData.lastCompletedQuestion >= 0) {
            set({ 
              currentQuestionIndex: playerData.lastCompletedQuestion + 1
            });
            return true;
          }
        }
        
        // Load quiz history
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
