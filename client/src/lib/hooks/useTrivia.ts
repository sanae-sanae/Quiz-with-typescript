import { useQuery } from '@tanstack/react-query';
import { QuizParams, TriviaResponse, ProcessedQuestion } from '../types';
import { TRIVIA_API_BASE_URL } from '../constants';

export function useTrivia(params: QuizParams) {
  return useQuery({
    queryKey: ['trivia', params],
    queryFn: async () => {
      
      const url = new URL(TRIVIA_API_BASE_URL);
      
      
      url.searchParams.append('amount', params.amount.toString());
      
     
      if (params.category && params.category > 0) {
        url.searchParams.append('category', params.category.toString());
      }
      
      if (params.difficulty && params.difficulty !== '') {
        url.searchParams.append('difficulty', params.difficulty);
      }
      
      if (params.type && params.type !== '') {
        url.searchParams.append('type', params.type);
      }
      
     
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trivia questions: ${response.statusText}`);
      }
      
      
      const data: TriviaResponse = await response.json();
      
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
      
      
      return processQuestions(data.results);
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity, 
    retry: 1,
  });
}


function processQuestions(questions: TriviaResponse['results']): ProcessedQuestion[] {
  return questions.map((question, index) => {
    
    const decodedQuestion = decodeHtmlEntities(question.question);
    const decodedCorrectAnswer = decodeHtmlEntities(question.correct_answer);
    const decodedIncorrectAnswers = question.incorrect_answers.map(decodeHtmlEntities);
    
    
    const allAnswers = [decodedCorrectAnswer, ...decodedIncorrectAnswers];
    const shuffledAnswers = shuffleArray(allAnswers);
    
   
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


function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


function decodeHtmlEntities(text: string): string {
  const element = document.createElement('div');
  element.innerHTML = text;
  return element.textContent || text;
}
