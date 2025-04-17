import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useQuiz } from "../lib/stores/useQuiz";
import { useAudio } from "../lib/stores/useAudio";
import { Environment } from "./three/Environment";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { formatDistanceToNow } from "date-fns";
import Confetti from "react-confetti";

export default function QuizResults() {
  const navigate = useNavigate();
  const { 
    playerName, 
    isQuizCompleted,
    questions, 
    answers,
    quizHistory,
    resetQuiz,
    startTime,
    endTime
  } = useQuiz();
  
  const { playSuccess } = useAudio();
  
  // Get the latest quiz result
  const latestResult = quizHistory[quizHistory.length - 1];
  
  // Calculate score if we have questions and answers
  const score = questions.length > 0 
    ? questions.reduce((acc, question) => {
        return acc + (answers[question.id] === question.correct_answer ? 1 : 0);
      }, 0)
    : latestResult?.score || 0;
    
  const totalQuestions = questions.length || latestResult?.totalQuestions || 0;
  const scorePercentage = Math.round((score / totalQuestions) * 100);
  
  // Calculate time taken
  const timeTaken = startTime && endTime 
    ? Math.floor((endTime - startTime) / 1000) 
    : latestResult?.timeTaken || 0;
  
  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Determine performance message
  const getPerformanceMessage = () => {
    if (scorePercentage >= 90) return "Excellent! You're a trivia master!";
    if (scorePercentage >= 70) return "Great job! You know your stuff!";
    if (scorePercentage >= 50) return "Good effort! Keep practicing!";
    return "Keep learning! You'll do better next time!";
  };
  
  // Play success sound on component mount
  useEffect(() => {
    if (scorePercentage >= 50) {
      playSuccess();
    }
    
    // Redirect if no quiz completed
    if (!isQuizCompleted && quizHistory.length === 0) {
      navigate("/");
    }
  }, [isQuizCompleted, navigate, playSuccess, quizHistory.length, scorePercentage]);
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Success confetti for good scores */}
      {scorePercentage >= 70 && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Environment rotationSpeed={0.1} />
        </Canvas>
      </div>
      
      {/* Results Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Quiz Results
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {playerName}'s Score
              </h2>
              <div className="flex items-center justify-center text-5xl font-bold text-indigo-600 mb-2">
                {score} / {totalQuestions}
              </div>
              <Progress value={scorePercentage} className="h-4" />
              <p className="mt-2 text-gray-600">{scorePercentage}%</p>
            </div>
            
            <div className="space-y-3 text-center">
              <p className="text-lg font-medium">{getPerformanceMessage()}</p>
              <p className="text-gray-600">Time taken: {formatTime(timeTaken)}</p>
              
              {quizHistory.length > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Previous Quizzes</h3>
                  <div className="space-y-2">
                    {quizHistory.slice(-5).reverse().map((result, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <p>
                          {formatDistanceToNow(new Date(result.date), { addSuffix: true })}: 
                          {' '}{result.score}/{result.totalQuestions} 
                          {' '}({Math.round((result.score / result.totalQuestions) * 100)}%)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={() => {
                resetQuiz();
                navigate("/");
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600"
            >
              Start New Quiz
            </Button>
            
            {questions.length > 0 && (
              <Button 
                onClick={() => {
                  navigate("/quiz");
                }}
                variant="outline"
                className="w-full"
              >
                Review Answers
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
