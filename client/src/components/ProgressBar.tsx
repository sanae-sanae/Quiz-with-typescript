import { motion } from "framer-motion";
import { cn } from "../lib/utils";

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
      <div className="flex justify-between mb-2 text-sm font-medium text-white">
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          key={currentQuestion}
          transition={{ duration: 0.3 }}
          className="flex items-center bg-blue-900/50 px-3 py-1 rounded-full"
        >
          Question {currentQuestion + 1} sur {totalQuestions}
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          key={progress}
          transition={{ duration: 0.3 }}
          className="flex items-center bg-blue-900/50 px-3 py-1 rounded-full"
        >
          {progress}% Complété
        </motion.span>
      </div>
      
      <div className="w-full h-3 bg-gray-800/70 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Animated glowing effect */}
          <motion.div 
            className="absolute inset-0 bg-white/30"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              x: ["-100%", "100%"]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
          />
          
          {/* Little dots for milestone markers */}
          {Array.from({ length: 5 }).map((_, i) => {
            const milestone = Math.round((i + 1) * (totalQuestions / 5)) - 1;
            const milestonePercent = Math.round((milestone / totalQuestions) * 100);
            const isActive = currentQuestion >= milestone;
            
            return (
              <motion.div 
                key={i}
                className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${
                  isActive ? 'bg-white shadow-[0_0_5px_white]' : 'bg-white/30'
                }`}
                style={{ left: `${milestonePercent}%` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.3 }}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
