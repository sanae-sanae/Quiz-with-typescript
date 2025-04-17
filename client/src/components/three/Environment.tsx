import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Stars } from "@react-three/drei";
import * as THREE from "three";

interface EnvironmentProps {
  rotationSpeed?: number;
}

export function Environment({ rotationSpeed = 0.05 }: EnvironmentProps) {
  // References for animated objects
  const starsRef = useRef<THREE.Group>(null);
  const platformRef = useRef<THREE.Group>(null);
  const cubesRef = useRef<THREE.InstancedMesh>(null);
  
  // Load textures
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Create a dummy object for instanced mesh manipulations
  const dummy = useRef(new THREE.Object3D()).current;
  const cubeCount = 50;
  
  // Setup cube positions
  const setupCubes = () => {
    if (cubesRef.current) {
      for (let i = 0; i < cubeCount; i++) {
        // Random position in a sphere
        const radius = 15 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        dummy.position.set(x, y, z);
        
        // Random rotation
        dummy.rotation.set(
          Math.random() * Math.PI, 
          Math.random() * Math.PI, 
          Math.random() * Math.PI
        );
        
        // Random scale
        const scale = 0.1 + Math.random() * 0.3;
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        cubesRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      cubesRef.current.instanceMatrix.needsUpdate = true;
    }
  };
  
  // Animate the environment
  useFrame((state, delta) => {
    // Rotate stars
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * rotationSpeed * 0.2;
    }
    
    // Rotate platform
    if (platformRef.current) {
      platformRef.current.rotation.y += delta * rotationSpeed;
    }
    
    // Animate floating cubes
    if (cubesRef.current) {
      for (let i = 0; i < cubeCount; i++) {
        cubesRef.current.getMatrixAt(i, dummy.matrix);
        
        // Extract position, rotation, and scale
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        
        dummy.matrix.decompose(position, rotation, scale);
        
        // Update rotation
        const rotObj = new THREE.Euler().setFromQuaternion(rotation);
        rotObj.y += delta * 0.2 * (i % 2 ? 1 : -1);
        
        // Add slight oscillation to position
        position.y += Math.sin(state.clock.elapsedTime * 0.5 + i) * delta * 0.1;
        
        // Recompose matrix
        dummy.position.copy(position);
        dummy.rotation.copy(rotObj);
        dummy.scale.copy(scale);
        dummy.updateMatrix();
        
        cubesRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      cubesRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  // Initialize cubes on first render
  if (cubesRef.current && !cubesRef.current.instanceMatrix.needsUpdate) {
    setupCubes();
  }
  
  return (
    <>
      {/* Ambient and directional lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Stars background */}
      <group ref={starsRef}>
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={1} 
        />
      </group>
      
      {/* Floating platform */}
      <group ref={platformRef} position={[0, -5, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[10, 8, 1, 32]} />
          <meshStandardMaterial 
            map={woodTexture}
            color="#4361ee" 
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </group>
      
      {/* Decorative floating cubes */}
      <instancedMesh 
        ref={cubesRef} 
        args={[undefined, undefined, cubeCount]}
        castShadow
      >
        <boxGeometry />
        <meshStandardMaterial 
          color="#4cc9f0" 
          roughness={0.2}
          metalness={0.8}
          emissive="#3a0ca3"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
      
      {/* Fog for depth effect */}
      <fog attach="fog" args={["#070b34", 15, 80]} />
    </>
  );
}
