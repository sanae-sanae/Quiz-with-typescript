import { useQuery } from '@tanstack/react-query';
import { QuizParams, TriviaResponse, ProcessedQuestion } from '../types';
import { TRIVIA_API_BASE_URL } from '../constants';

/**
 * Custom hook to fetch and process trivia questions from Open Trivia Database
 */
export function useTrivia(params: QuizParams) {
  return useQuery({
    queryKey: ['trivia', params],
    queryFn: async () => {
      // Build the API URL with query parameters
      const url = new URL(TRIVIA_API_BASE_URL);
      
      // Add amount parameter
      url.searchParams.append('amount', params.amount.toString());
      
      // Add optional parameters if provided
      if (params.category && params.category > 0) {
        url.searchParams.append('category', params.category.toString());
      }
      
      if (params.difficulty && params.difficulty !== '') {
        url.searchParams.append('difficulty', params.difficulty);
      }
      
      if (params.type && params.type !== '') {
        url.searchParams.append('type', params.type);
      }
      
      // Fetch the data
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trivia questions: ${response.statusText}`);
      }
      
      // Parse the response
      const data: TriviaResponse = await response.json();
      
      // Check for API errors
      if (data.response_code !== 0) {
        // Handle API response codes
        // 0: Success
        // 1: No Results
        // 2: Invalid Parameter
        // 3: Token Not Found
        // 4: Token Empty
        
        let errorMessage = 'Unknown error occurred';
        
        switch (data.response_code) {
          case 1:
            errorMessage = 'No results found. Try different parameters.';
            break;
          case 2:
            errorMessage = 'Invalid parameters. Please check your query.';
            break;
          case 3:
            errorMessage = 'Session token not found.';
            break;
          case 4:
            errorMessage = 'No questions available for the specified criteria.';
            break;
        }
        
        throw new Error(errorMessage);
      }
      
      // Process the questions
      return processQuestions(data.results);
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Don't refetch the same quiz
    retry: 1,
  });
}

/**
 * Process raw questions from the API
 * - Decode HTML entities
 * - Shuffle answers
 * - Add IDs for tracking
 */
function processQuestions(questions: TriviaResponse['results']): ProcessedQuestion[] {
  return questions.map((question, index) => {
    // HTML decode the question and answers
    const decodedQuestion = decodeHtmlEntities(question.question);
    const decodedCorrectAnswer = decodeHtmlEntities(question.correct_answer);
    const decodedIncorrectAnswers = question.incorrect_answers.map(decodeHtmlEntities);
    
    // Combine and shuffle all answers
    const allAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
    const shuffledAnswers = shuffleArray(allAnswers);
    
    // Return processed question
    return {
      ...question,
      id: index,
      question: decodedQuestion,
      correct_answer: decodedCorrectAnswer,
      incorrect_answers: decodedIncorrectAnswers,
      all_answers: shuffledAnswers,
    };
  });
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Decode HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
  const element = document.createElement('div');
  element.innerHTML = text;
  return element.textContent || text;
}
