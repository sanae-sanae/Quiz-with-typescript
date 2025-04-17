import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAudio } from "./lib/stores/useAudio";
import { KeyboardControls } from "@react-three/drei";
import { Toaster } from "sonner";

// Lazy load components for better performance
const Welcome = lazy(() => import("./components/Welcome"));
const Quiz = lazy(() => import("./components/Quiz"));
const QuizResults = lazy(() => import("./components/QuizResults"));
const NotFound = lazy(() => import("./pages/not-found"));

// Define keyboard controls for the 3D environment
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "interact", keys: ["KeyE", "Space"] },
];

function App() {
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Initialize audio elements
  useEffect(() => {
    // Background music
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    // Sound effects
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.5;
    setSuccessSound(success);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <KeyboardControls map={controls}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<QuizResults />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-center" richColors />
    </KeyboardControls>
  );
}

// Simple loading screen while components are being loaded
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-blue-300 rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-semibold text-white">Loading...</h2>
      </div>
    </div>
  );
}

export default App;
