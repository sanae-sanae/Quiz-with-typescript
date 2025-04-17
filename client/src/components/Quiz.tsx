import { useEffect, useState, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useQuiz } from "../lib/stores/useQuiz";
import { useTrivia } from "../lib/hooks/useTrivia";
import { QuizParams } from "../lib/types";
import { DEFAULT_QUIZ_PARAMS } from "../lib/constants";
import { Scene } from "./three/Scene";
import ProgressBar from "./ProgressBar";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Loader } from "lucide-react";

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse quiz parameters from URL
  const quizParams: QuizParams = {
    amount: parseInt(searchParams.get("amount") || DEFAULT_QUIZ_PARAMS.amount.toString()),
    category: parseInt(searchParams.get("category") || "0") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    type: searchParams.get("type") || undefined,
  };
  
  // Get quiz state from store
  const { 
    playerName, 
    isNameSet,
    questions, 
    currentQuestionIndex,
    setQuestions,
    startQuiz,
    isQuizStarted,
    answers,
    selectAnswer,
    selectedAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    submitQuiz,
    isQuizCompleted
  } = useQuiz();
  
  // Get questions from API
  const { data, isLoading, error } = useTrivia(quizParams);
  
  // Local state for animation
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  
  // Redirect to welcome if no name is set
  useEffect(() => {
    if (!isNameSet) {
      navigate("/");
      return;
    }
    
    // If quiz is completed, navigate to results
    if (isQuizCompleted) {
      navigate("/results");
      return;
    }
    
    // Set questions if available
    if (data && !isLoading) {
      setQuestions(data);
      if (!isQuizStarted) {
        startQuiz();
      }
    }
  }, [
    isNameSet, 
    navigate, 
    data, 
    isLoading, 
    setQuestions, 
    startQuiz, 
    isQuizStarted,
    isQuizCompleted
  ]);
  
  // Handle API error
  useEffect(() => {
    if (error) {
      toast.error(`Error loading questions: ${error.message}`);
    }
  }, [error]);
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle answer selection
  const handleSelectAnswer = (answer: string) => {
    setIsAnswerSelected(true);
    selectAnswer(answer);
    
    // Short delay before allowing next question
    setTimeout(() => {
      setIsAnswerSelected(false);
    }, 1000);
  };
  
  // Handle navigation to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToNextQuestion();
    } else {
      // On last question, show confirmation before submitting
      if (confirm("You've reached the end of the quiz. Submit your answers?")) {
        submitQuiz();
        navigate("/results");
      }
    }
  };
  
  // Loading state
  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900">
        <div className="flex flex-col items-center">
          <Loader className="w-10 h-10 text-white animate-spin" />
          <h2 className="mt-4 text-xl font-semibold text-white">Loading questions...</h2>
        </div>
      </div>
    );
  }
  
  // Calculate whether all questions have been answered
  const allQuestionsAnswered = questions.every((q) => answers[q.id]);
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene 
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              isAnswerSelected={isAnswerSelected}
              questionNumber={currentQuestionIndex + 1}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Quiz Interface */}
      <div className="relative z-10 min-h-screen flex flex-col p-4 pt-16">
        {/* Player info and progress */}
        <div className="fixed top-0 left-0 right-0 p-4 bg-gradient-to-b from-gray-900/80 to-transparent z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-semibold">Player: {playerName}</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (confirm("Are you sure you want to quit? Your progress will be saved.")) {
                  navigate("/");
                }
              }}
              className="text-white border-white/30 bg-white/10 hover:bg-white/20"
            >
              Quit Quiz
            </Button>
          </div>
          
          <ProgressBar 
            currentQuestion={currentQuestionIndex} 
            totalQuestions={questions.length} 
          />
        </div>
        
        {/* Question Card */}
        <div className="mt-auto mb-4">
          <Card className="w-full bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                <span className="text-indigo-600">Question {currentQuestionIndex + 1}:</span> {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {currentQuestion.all_answers.map((answer, index) => {
                  const isSelected = answers[currentQuestion.id] === answer;
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className={`justify-start text-left h-auto py-3 ${
                        isSelected 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                          : "hover:bg-indigo-100"
                      }`}
                      onClick={() => handleSelectAnswer(answer)}
                      disabled={isAnswerSelected}
                    >
                      {answer}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0 || isAnswerSelected}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleNextQuestion}
                  disabled={!answers[currentQuestion.id] || isAnswerSelected}
                >
                  {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
                </Button>
                
                {currentQuestionIndex === questions.length - 1 && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      submitQuiz();
                      navigate("/results");
                    }}
                    disabled={!allQuestionsAnswered || isAnswerSelected}
                  >
                    Submit Quiz
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
