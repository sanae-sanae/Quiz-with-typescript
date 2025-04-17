import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  className?: string;
}

export default function ProgressBar({ 
  currentQuestion, 
  totalQuestions,
  className 
}: ProgressBarProps) {
  // Calculate progress percentage
  const progress = Math.floor((currentQuestion / totalQuestions) * 100);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-1 text-xs font-medium text-white">
        <span>Question {currentQuestion + 1} of {totalQuestions}</span>
        <span>{progress}% Complete</span>
      </div>
      
      <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
