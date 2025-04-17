import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Vector3 } from "three";
import { ProcessedQuestion } from "@/lib/types";

interface QuestionDisplayProps {
  question: ProcessedQuestion;
  position?: Vector3 | [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function QuestionDisplay({
  question,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}: QuestionDisplayProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Animate the question display
  useFrame((state) => {
    if (groupRef.current) {
      // Add a slight floating animation
      groupRef.current.position.y = 
        Array.isArray(position) 
          ? position[1] + Math.sin(state.clock.elapsedTime) * 0.1 
          : position.y + Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Add subtle rotation
      groupRef.current.rotation.y = 
        rotation[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={position instanceof Vector3 ? [position.x, position.y, position.z] : position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* Background panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshStandardMaterial 
          color="#4361ee" 
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Question text */}
      <Text
        position={[0, 0.5, 0.06]}
        fontSize={0.2}
        maxWidth={5}
        lineHeight={1.2}
        color="#ffffff"
        textAlign="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptug8zYS_SKggPNyC0IT4ttDfA.woff2"
      >
        {question.question}
      </Text>
      
      {/* Category and difficulty */}
      <Text
        position={[0, -1, 0.06]}
        fontSize={0.15}
        color="#cccccc"
        textAlign="center"
        anchorY="middle"
      >
        {`${question.category} • ${question.difficulty.toUpperCase()}`}
      </Text>
    </group>
  );
}
