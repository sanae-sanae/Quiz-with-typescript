import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useQuiz } from "../lib/stores/useQuiz";
import { useAudio } from "../lib/stores/useAudio";
import { Environment } from "./three/Environment";
import { DEFAULT_QUIZ_PARAMS, TRIVIA_CATEGORIES, DIFFICULTY_LEVELS, QUESTION_TYPES } from "../lib/constants";
import { QuizParams } from "../lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { VolumeX, Volume2, Play, BookOpen, ChevronRight, Brain, Settings2 } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const { playerName, isNameSet, setPlayerName, loadSavedProgress } = useQuiz();
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  
  const [name, setName] = useState(playerName || "");
  const [quizParams, setQuizParams] = useState<QuizParams>(DEFAULT_QUIZ_PARAMS);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  useEffect(() => {
    const hasProgress = loadSavedProgress();
    setHasSavedProgress(hasProgress);
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, [loadSavedProgress, backgroundMusic, isMuted]);
  const handleStartQuiz = () => {
    if (!name.trim()) {
      toast.error("Veuillez entrer votre nom pour commencer le quiz", {
        position: "top-center",
        duration: 3000,
        style: {
          background: "rgba(239, 68, 68, 0.9)",
          color: "white",
          border: "none",
        },
        icon: "⚠️",
      });
      return;
    }
    if (!isNameSet || playerName !== name) {
      setPlayerName(name);
    }
    const params = new URLSearchParams();
    params.append("amount", quizParams.amount.toString());
    if (quizParams.category) params.append("category", quizParams.category.toString());
    if (quizParams.difficulty) params.append("difficulty", quizParams.difficulty);
    if (quizParams.type) params.append("type", quizParams.type);
    toast.success("Préparation du quiz...", {
      position: "top-center",
      duration: 1500,
      style: {
        background: "rgba(34, 197, 94, 0.9)",
        color: "white",
        border: "none",
      },
      icon: "🚀",
    });
    setTimeout(() => {
      navigate(`/quiz?${params.toString()}`);
    }, 1000);
  };
  const handleParamChange = (
    key: keyof QuizParams, 
    value: string | number
  ) => {
    setQuizParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };
  
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-gradient-to-b from-indigo-950 to-black">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Environment rotationSpeed={0.2} />
        </Canvas>
      </div>
      
      {/* Animated particles overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{ 
              y: ["0%", "100%"],
              transition: {
                duration: Math.random() * 15 + 20,
                repeat: Infinity,
                ease: "linear",
              }
            }}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
              boxShadow: "0 0 10px 2px rgba(255,255,255,0.3)"
            }}
          />
        ))}
      </div>
      
      {/* Logo and Title */}
      <motion.div 
        className="absolute top-10 left-0 right-0 z-10 flex flex-col items-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <motion.div 
          className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 shadow-lg mb-4"
          whileHover={{ rotate: 360, transition: { duration: 1.5 } }}
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Quiz Cosmique
          </span>
        </h1>
        <p className="text-blue-200 mt-2 text-center max-w-md px-4">
          Testez vos connaissances dans un environnement 3D immersif
        </p>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <Card className="bg-black/20 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(56,189,248,0.2)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 z-0"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-3xl font-bold text-center text-white">
                {showSettings ? "Paramètres du Quiz" : "Bienvenue"}
              </CardTitle>
              <CardDescription className="text-center text-blue-200">
                {showSettings 
                  ? "Personnalisez votre expérience" 
                  : "Prêt à tester vos connaissances?"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {!showSettings ? (
                <motion.div 
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="name" className="text-white">Votre Nom</Label>
                    <Input
                      id="name"
                      placeholder="Entrez votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
                      required
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex justify-between">
                    <div className="flex items-center space-x-2 text-sm text-blue-200">
                      <BookOpen className="w-4 h-4" />
                      <span>{quizParams.amount} questions</span>
                    </div>
                    
                    <motion.button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center space-x-1 text-sm text-blue-300 hover:text-blue-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Settings2 className="w-4 h-4" />
                      <span>Paramètres</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="amount" className="text-white">Nombre de Questions</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={quizParams.amount}
                        onChange={(e) => handleParamChange("amount", parseInt(e.target.value) || 10)}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-blue-200 mt-1">
                        <span>5</span>
                        <span>{quizParams.amount}</span>
                        <span>50</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="category" className="text-white">Catégorie</Label>
                    <div className="relative">
                      <select
                        id="category"
                        value={quizParams.category?.toString() || "0"}
                        onChange={(e) => handleParamChange("category", parseInt(e.target.value))}
                        className="w-full py-2 px-3 rounded-md border border-white/20 bg-white/10 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                      >
                        <option value="0">Toute Catégorie</option>
                        {TRIVIA_CATEGORIES.map((category) => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-white">Difficulté</Label>
                      <div className="relative">
                        <select
                          id="difficulty"
                          value={quizParams.difficulty || ""}
                          onChange={(e) => handleParamChange("difficulty", e.target.value)}
                          className="w-full py-2 px-3 rounded-md border border-white/20 bg-white/10 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                        >
                          {DIFFICULTY_LEVELS.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-white">Type de Question</Label>
                      <div className="relative">
                        <select
                          id="type"
                          value={quizParams.type || ""}
                          onChange={(e) => handleParamChange("type", e.target.value)}
                          className="w-full py-2 px-3 rounded-md border border-white/20 bg-white/10 text-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button 
                      onClick={() => setShowSettings(false)}
                      variant="ghost" 
                      className="w-full text-blue-300 hover:text-blue-100 hover:bg-blue-800/20"
                    >
                      Retour
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
            
            <CardFooter className="relative z-10 flex flex-col space-y-3">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="w-full"
              >
                <motion.button
                  onClick={handleStartQuiz}
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center justify-center space-x-2 hover:shadow-[0_0_20px_rgba(37,99,235,0.7)] transition-shadow"
                >
                  <Play className="w-5 h-5" />
                  <span>Commencer le Quiz</span>
                </motion.button>
              </motion.div>
              
              {hasSavedProgress && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full"
                >
                  <motion.button
                    onClick={() => navigate("/quiz")}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                    className="w-full py-3 px-4 bg-white/10 border border-white/30 text-white font-medium rounded-md flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                    <span>Continuer le Quiz Précédent</span>
                  </motion.button>
                </motion.div>
              )}
              
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  onClick={toggleMute}
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                  className="mt-2 text-blue-300 hover:text-blue-100 transition-colors flex items-center space-x-2 mx-auto"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>Son: {isMuted ? "Off" : "On"}</span>
                </motion.button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
