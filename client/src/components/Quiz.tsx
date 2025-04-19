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
import { motion, AnimatePresence } from "framer-motion";
import { Loader, LogOut, ChevronLeft, ChevronRight, CheckCircle, Clock, HelpCircle } from "lucide-react";

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizParams: QuizParams = {
    amount: parseInt(searchParams.get("amount") || DEFAULT_QUIZ_PARAMS.amount.toString()),
    category: parseInt(searchParams.get("category") || "0") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    type: searchParams.get("type") || undefined,
  };
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
    isQuizCompleted,
    startTime
  } = useQuiz();

  const { data, isLoading, error } = useTrivia(quizParams);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    if (startTime && isQuizStarted && !isQuizCompleted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [startTime, isQuizStarted, isQuizCompleted]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  useEffect(() => {
    if (!isNameSet) {
      navigate("/");
      return;
    }
    if (isQuizCompleted) {
      navigate("/results");
      return;
    }
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
  useEffect(() => {
    if (error) {
      toast.error(`Erreur de chargement: ${error.message}`, {
        position: "top-center",
        duration: 5000,
        style: { 
          background: "rgba(239, 68, 68, 0.9)",
          color: "white",
          border: "none",
        },
        icon: "⚠️",
      });
    }
  }, [error]);
  const currentQuestion = questions[currentQuestionIndex];
  const handleSelectAnswer = (answer: string) => {
    setIsAnswerSelected(true);
    selectAnswer(answer);

    if (answer === currentQuestion.correct_answer) {
      toast.success("Bonne réponse!", {
        position: "top-center",
        duration: 1500,
        style: { 
          background: "rgba(34, 197, 94, 0.9)",
          color: "white",
          border: "none",
        },
        icon: "✅",
      });
    } else {
      toast.error("Mauvaise réponse", {
        position: "top-center",
        duration: 1500,
        style: { 
          background: "rgba(239, 68, 68, 0.9)",
          color: "white",
          border: "none",
        },
        icon: "❌",
      });
    }
  
    setTimeout(() => {
      setIsAnswerSelected(false);
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToNextQuestion();
    } else {
    
      toast.message("Souhaitez-vous terminer le quiz?", {
        position: "top-center",
        duration: 10000,
        action: {
          label: "Terminer et voir les résultats",
          onClick: () => {
            submitQuiz();
            navigate("/results");
          }
        },
        cancel: {
          label: "Pas encore",
          onClick: () => {}
        }
      });
    }
  };
  
  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-black overflow-hidden">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: 360,
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.5)",
                "0 0 40px rgba(99, 102, 241, 0.7)",
                "0 0 20px rgba(99, 102, 241, 0.5)"
              ]
            }}
            transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: "linear" }, boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
            className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Loader className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h2 
            className="mt-6 text-2xl font-bold text-white"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Chargement des questions...
          </motion.h2>
          
          <motion.p 
            className="mt-2 text-blue-300 text-center max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Préparation de votre expérience de quiz immersive
          </motion.p>
        </motion.div>
      </div>
    );
  }
  const allQuestionsAnswered = questions.every((q) => answers[q.id]);

  const getDifficultyColor = () => {
    switch (currentQuestion.difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-gradient-to-b from-indigo-950 to-black">
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
      <div className="relative z-10 min-h-screen flex flex-col p-4 pt-20">
        {/* Player info and progress */}
        <motion.div 
          className="fixed top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-indigo-950/50 to-transparent z-10 backdrop-blur-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold"
                  whileHover={{ scale: 1.1 }}
                >
                  {playerName.charAt(0).toUpperCase()}
                </motion.div>
                <motion.span 
                  className="text-white font-medium hidden md:block"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {playerName}
                </motion.span>
              </div>
              
              <div className="flex items-center space-x-2 bg-blue-900/40 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-blue-300" />
                <span className="text-white text-sm">{formatTime(elapsedTime)}</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-blue-900/40 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-blue-300" />
                <span className="text-white text-sm">
                  {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full hidden md:flex ${getDifficultyColor()}`}>
                <HelpCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm capitalize">
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                toast.message("Quitter le quiz?", {
                  position: "top-center",
                  duration: 5000,
                  action: {
                    label: "Quitter",
                    onClick: () => navigate("/")
                  },
                  cancel: {
                    label: "Continuer",
                    onClick: () => {}
                  }
                });
              }}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Quitter</span>
            </Button>
          </div>
          
          <ProgressBar 
            currentQuestion={currentQuestionIndex} 
            totalQuestions={questions.length} 
          />
        </motion.div>
        
        {/* Question Card */}
        <div className="mt-auto mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(56,189,248,0.2)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 z-0"></div>
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyColor()}`}>
                      {currentQuestion.category}
                    </div>
                  </div>
                  <CardTitle className="text-xl md:text-2xl text-white">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {currentQuestion.question}
                    </motion.span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.all_answers.map((answer, index) => {
                      const isSelected = answers[currentQuestion.id] === answer;
                      const isCorrect = answer === currentQuestion.correct_answer;
                      const showCorrect = isAnswerSelected && isSelected;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          whileHover={{ scale: isAnswerSelected ? 1 : 1.02 }}
                        >
                          <Button
                            variant="outline"
                            className={`justify-start text-left h-auto py-4 w-full relative overflow-hidden ${
                              isSelected 
                                ? "border-blue-500 bg-blue-500/20 text-white" 
                                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                            }`}
                            onClick={() => !isAnswerSelected && handleSelectAnswer(answer)}
                            disabled={isAnswerSelected}
                          >
                            {showCorrect && (
                              <motion.div 
                                className={`absolute inset-0 ${isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                              />
                            )}
                            
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                ${isSelected 
                                  ? (showCorrect && isCorrect) ? 'bg-green-500 text-white' 
                                  : (showCorrect && !isCorrect) ? 'bg-red-500 text-white'
                                  : 'bg-blue-600 text-white'
                                  : 'bg-white/10 text-white'
                                }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="flex-1">{answer}</span>
                            </div>
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
                
                <CardFooter className="relative z-10 flex justify-between pt-2 pb-4">
                  <Button
                    variant="ghost"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0 || isAnswerSelected}
                    className="text-white hover:bg-white/10 border border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Précédent
                  </Button>
                  
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion.id] || isAnswerSelected}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {currentQuestionIndex === questions.length - 1 ? "Terminer" : "Suivant"}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
