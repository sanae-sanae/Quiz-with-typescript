import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment as ThreeEnvironment, OrbitControls, Text } from "@react-three/drei";
import { ProcessedQuestion } from "@/lib/types";
import { useAudio } from "@/lib/stores/useAudio";
import * as THREE from "three";
import { MathUtils } from "three";

interface SceneProps {
  currentQuestion: ProcessedQuestion;
  selectedAnswer: string | null;
  isAnswerSelected: boolean;
  questionNumber: number;
}

export function Scene({ 
  currentQuestion, 
  selectedAnswer, 
  isAnswerSelected,
  questionNumber 
}: SceneProps) {
  const { scene, camera } = useThree();
  const { playHit } = useAudio();

  // References for animated elements
  const floatingCardRef = useRef<THREE.Group>(null);
  const quizPlatformRef = useRef<THREE.Mesh>(null);
  
  // Setup scene
  useEffect(() => {
    // Set background color
    scene.background = new THREE.Color("#0a1128");
    
    // Set camera position
    camera.position.set(0, 3, 8);
    
    // Check if answer is selected and play sound
    if (isAnswerSelected && selectedAnswer) {
      playHit();
    }
  }, [scene, camera, isAnswerSelected, selectedAnswer, playHit]);
  
  // Animate elements
  useFrame((state, delta) => {
    // Animate floating card
    if (floatingCardRef.current) {
      floatingCardRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime) * 0.2;
      floatingCardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    
    // Animate platform
    if (quizPlatformRef.current) {
      quizPlatformRef.current.rotation.y += delta * 0.05;
    }
  });
  
  // Determine if selected answer is correct
  const isSelectedAnswerCorrect = selectedAnswer === currentQuestion.correct_answer;
  
  return (
    <>
      {/* Environment and Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <ThreeEnvironment preset="sunset" />
      
      {/* Orbit controls for user interaction */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minPolarAngle={Math.PI / 6}
      />
      
      {/* Quiz Platform */}
      <group position={[0, -1, 0]}>
        <mesh 
          ref={quizPlatformRef} 
          receiveShadow
          position={[0, 0, 0]}
        >
          <cylinderGeometry args={[5, 5, 0.5, 32]} />
          <meshStandardMaterial 
            color="#3a0ca3" 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Decorative elements */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <mesh 
              key={i}
              position={[x, 0.5, z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.5, 1 + Math.sin(i) * 0.5, 0.5]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#4361ee" : "#3f37c9"} 
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Floating Card with Question Number */}
      <group ref={floatingCardRef} position={[0, 3, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshStandardMaterial 
            color="#4895ef" 
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.4}
          maxWidth={2.5}
          lineHeight={1.2}
          color="#ffffff"
          textAlign="center"
        >
          {`Question ${questionNumber}`}
        </Text>
      </group>
      
      {/* Display answer result when selected */}
      {isAnswerSelected && selectedAnswer && (
        <>
          <pointLight
            position={[0, 2, 2]}
            intensity={10}
            color={isSelectedAnswerCorrect ? "#4ade80" : "#ef4444"}
          />
          
          <Text
            position={[0, 1, 0]}
            fontSize={0.8}
            color={isSelectedAnswerCorrect ? "#4ade80" : "#ef4444"}
            anchorX="center"
            anchorY="middle"
          >
            {isSelectedAnswerCorrect ? "Correct!" : "Incorrect!"}
          </Text>
          
          {/* Particle effect for answer feedback */}
          <ParticleEffect 
            count={50} 
            color={isSelectedAnswerCorrect ? "#4ade80" : "#ef4444"} 
          />
        </>
      )}
      
      {/* Category indicator */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`Category: ${currentQuestion.category}`}
      </Text>
    </>
  );
}

// Particle effect component for visual feedback
function ParticleEffect({ count = 20, color = "#ffffff" }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D()).current;
  
  // Create matrices for initial particle positions
  useEffect(() => {
    if (mesh.current) {
      for (let i = 0; i < count; i++) {
        // Random position around center
        dummy.position.set(
          MathUtils.randFloatSpread(6),
          MathUtils.randFloatSpread(6) + 2,
          MathUtils.randFloatSpread(6)
        );
        
        // Random scale
        const scale = 0.1 + Math.random() * 0.2;
        dummy.scale.set(scale, scale, scale);
        
        // Apply transformation
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [count, dummy]);
  
  // Animate particles
  useFrame((state) => {
    if (mesh.current) {
      for (let i = 0; i < count; i++) {
        mesh.current.getMatrixAt(i, dummy.matrix);
        dummy.position.y += (Math.sin(i + state.clock.elapsedTime) * 0.01) + 0.01;
        dummy.rotation.y += 0.01;
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={2}
      />
    </instancedMesh>
  );
}
