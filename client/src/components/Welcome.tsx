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

export default function Welcome() {
  const navigate = useNavigate();
  const { playerName, isNameSet, setPlayerName, loadSavedProgress } = useQuiz();
  const { backgroundMusic, toggleMute, isMuted } = useAudio();
  
  const [name, setName] = useState(playerName || "");
  const [quizParams, setQuizParams] = useState<QuizParams>(DEFAULT_QUIZ_PARAMS);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Load saved progress if available
  useEffect(() => {
    const hasProgress = loadSavedProgress();
    setHasSavedProgress(hasProgress);
    
    // Try to play background music when component mounts
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, [loadSavedProgress, backgroundMusic, isMuted]);
  
  // Handle quiz start
  const handleStartQuiz = () => {
    if (!name.trim()) {
      toast.error("Please enter your name to start the quiz");
      return;
    }
    
    // Set player name if not already set
    if (!isNameSet || playerName !== name) {
      setPlayerName(name);
    }
    
    // Store quiz parameters in URL search params
    const params = new URLSearchParams();
    params.append("amount", quizParams.amount.toString());
    if (quizParams.category) params.append("category", quizParams.category.toString());
    if (quizParams.difficulty) params.append("difficulty", quizParams.difficulty);
    if (quizParams.type) params.append("type", quizParams.type);
    
    // Navigate to quiz
    navigate(`/quiz?${params.toString()}`);
  };
  
  // Handle parameter changes
  const handleParamChange = (
    key: keyof QuizParams, 
    value: string | number
  ) => {
    setQuizParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }}>
          <Environment rotationSpeed={0.2} />
        </Canvas>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">3D Trivia Quiz</CardTitle>
            <CardDescription className="text-center">
              Test your knowledge in an immersive 3D environment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            {/* Quiz Settings */}
            <div className="space-y-2">
              <Label htmlFor="amount">Number of Questions</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="50"
                value={quizParams.amount}
                onChange={(e) => handleParamChange("amount", parseInt(e.target.value) || 10)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={quizParams.category?.toString() || "0"}
                onValueChange={(value) => handleParamChange("category", parseInt(value))}
              >
                <option value="0">Any Category</option>
                {TRIVIA_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  id="difficulty"
                  value={quizParams.difficulty || ""}
                  onValueChange={(value) => handleParamChange("difficulty", value)}
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Question Type</Label>
                <Select
                  id="type"
                  value={quizParams.type || ""}
                  onValueChange={(value) => handleParamChange("type", value)}
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handleStartQuiz} 
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600"
            >
              Start New Quiz
            </Button>
            
            {hasSavedProgress && (
              <Button 
                onClick={() => navigate("/quiz")}
                variant="outline" 
                className="w-full"
              >
                Continue Previous Quiz
              </Button>
            )}
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              className="mt-2"
            >
              Sound: {isMuted ? "Off" : "On"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
