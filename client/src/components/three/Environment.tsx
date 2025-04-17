import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { 
  useTexture, 
  Stars, 
  Sparkles, 
  Float, 
  useGLTF, 
  MeshDistortMaterial,
  MeshWobbleMaterial 
} from "@react-three/drei";
import * as THREE from "three";

interface EnvironmentProps {
  rotationSpeed?: number;
  intensity?: number;
}

export function Environment({ rotationSpeed = 0.05, intensity = 1.0 }: EnvironmentProps) {
  // References for animated objects
  const starsRef = useRef<THREE.Group>(null);
  const platformRef = useRef<THREE.Group>(null);
  const floatingObjectsRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const cubesRef = useRef<THREE.InstancedMesh>(null);
  
  // Access to the main scene
  const { scene } = useThree();
  
  // Load textures
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Materials
  const portalMaterial = useRef<THREE.ShaderMaterial | null>(null);
  
  // Portal shader
  const portalUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uColorA: { value: new THREE.Color('#4cc9f0') },
    uColorB: { value: new THREE.Color('#7209b7') }
  }), [intensity]);
  
  const portalVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const portalFragmentShader = `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vUv;
    
    //  Classic Perlin 3D Noise by Stefan Gustavson
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
    
    float cnoise(vec3 P){
      vec3 Pi0 = floor(P);
      vec3 Pi1 = Pi0 + vec3(1.0);
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec3 Pf0 = fract(P);
      vec3 Pf1 = Pf0 - vec3(1.0);
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;
    
      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);
    
      vec4 gx0 = ixy0 / 7.0;
      vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
      vec4 gx1 = ixy1 / 7.0;
      vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g100, g100), dot(g010, g010), dot(g110, g110)));
      g000 *= norm0.x;
      g100 *= norm0.y;
      g010 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g101, g101), dot(g011, g011), dot(g111, g111)));
      g001 *= norm1.x;
      g101 *= norm1.y;
      g011 *= norm1.z;
      g111 *= norm1.w;
    
      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);
    
      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
      return 2.2 * n_xyz;
    }
    
    void main() {
      // Create a circular mask with soft edges
      vec2 centeredUv = vUv - 0.5;
      float dist = length(centeredUv);
      float radialMask = smoothstep(0.5, 0.2, dist);
      
      // Create animated waves with Perlin noise
      float noiseScale = 2.0;
      float time = uTime * 0.2;
      float noise1 = cnoise(vec3(centeredUv * noiseScale, time)) * 0.5 + 0.5;
      float noise2 = cnoise(vec3(centeredUv * noiseScale * 2.0, time + 100.0)) * 0.5 + 0.5;
      
      // Create a swirling effect
      float swirl = atan(centeredUv.y, centeredUv.x) / (2.0 * 3.14159) + 0.5;
      swirl += time * 0.1;
      
      // Mix colors
      vec3 color = mix(uColorA, uColorB, noise1 * noise2);
      
      // Apply swirl and glow
      color += vec3(swirl * 0.1);
      color *= 1.0 + pow(radialMask, 2.0) * 2.0 * uIntensity;
      
      // Apply circular mask
      float alpha = radialMask;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;
  
  // Create a dummy object for instanced mesh manipulations
  const dummy = useRef(new THREE.Object3D()).current;
  const cubeCount = 75;
  
  // Setup cube positions
  const setupCubes = () => {
    if (cubesRef.current) {
      for (let i = 0; i < cubeCount; i++) {
        // Random position in a sphere
        const radius = 20 + Math.random() * 25;
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
        const scale = 0.1 + Math.random() * 0.4;
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        cubesRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      cubesRef.current.instanceMatrix.needsUpdate = true;
    }
  };
  
  // Setup objects in the scene on first render
  useEffect(() => {
    if (cubesRef.current && !cubesRef.current.instanceMatrix.needsUpdate) {
      setupCubes();
    }
    
    // Add some post-processing effects
    scene.fog = new THREE.FogExp2("#070b34", 0.015);
    
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  
  // Animate the environment
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Update portal shader
    if (portalRef.current && portalRef.current.material) {
      //@ts-ignore
      portalRef.current.material.uniforms.uTime.value = time;
    }
    
    // Rotate stars
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * rotationSpeed * 0.2;
    }
    
    // Rotate platform
    if (platformRef.current) {
      platformRef.current.rotation.y += delta * rotationSpeed;
      platformRef.current.position.y = -5 + Math.sin(time * 0.3) * 0.2;
    }
    
    // Move floating objects group
    if (floatingObjectsRef.current) {
      floatingObjectsRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
      floatingObjectsRef.current.position.y = Math.sin(time * 0.5) * 0.3;
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
        rotObj.x += delta * 0.1 * (i % 3 ? 1 : -1);
        rotObj.y += delta * 0.2 * (i % 2 ? 1 : -1);
        rotObj.z += delta * 0.1 * (i % 5 ? 1 : -1);
        
        // Add slight oscillation to position
        position.x += Math.sin(time * 0.3 + i * 0.5) * delta * 0.05;
        position.y += Math.sin(time * 0.5 + i * 0.7) * delta * 0.1;
        position.z += Math.sin(time * 0.4 + i * 0.3) * delta * 0.05;
        
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
  
  // Define type for Platonic props
  interface PlatonicProps {
    position: [number, number, number];
    geometry: THREE.BufferGeometry;
    material: JSX.Element;
    scale?: number;
  }
  
  // Generate different platonic solids for decorative shapes
  const Platonic = ({ position, geometry, material, scale = 1 }: PlatonicProps) => (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh 
        position={position} 
        scale={scale} 
        geometry={geometry} 
        material={material}
        castShadow
      />
    </Float>
  );
  
  // Collection of geometries
  const geometries = useMemo(() => [
    new THREE.TetrahedronGeometry(1),
    new THREE.OctahedronGeometry(1),
    new THREE.IcosahedronGeometry(1),
    new THREE.DodecahedronGeometry(1)
  ], []);
  
  // Collection of materials
  const materials = useMemo(() => [
    <MeshDistortMaterial 
      color="#4cc9f0" 
      speed={2}
      distort={0.3}
      radius={1}
    />,
    <MeshWobbleMaterial 
      color="#7209b7" 
      factor={0.4}
      speed={2}
    />,
    <meshStandardMaterial 
      color="#f72585" 
      roughness={0.2}
      metalness={0.8}
      emissive="#f72585"
      emissiveIntensity={0.4}
    />,
    <meshPhysicalMaterial 
      color="#3a0ca3" 
      clearcoat={1}
      clearcoatRoughness={0.1}
      metalness={0.9}
      roughness={0.2}
    />
  ], []);
  
  return (
    <>
      {/* Ambient and directional lights */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#4cc9f0" />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      
      {/* Stars background */}
      <group ref={starsRef}>
        <Stars 
          radius={100} 
          depth={50} 
          count={7000} 
          factor={4} 
          saturation={0.5} 
          fade 
          speed={1} 
        />
      </group>
      
      {/* Sparkles for magical effect */}
      <Sparkles 
        count={100} 
        scale={[30, 20, 30]} 
        size={2} 
        speed={0.3} 
        color="#4cc9f0" 
      />
      
      {/* Portal in the center */}
      <mesh 
        ref={portalRef} 
        position={[0, 0, -5]}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[5, 5, 32, 32]} />
        <shaderMaterial 
          ref={portalMaterial}
          vertexShader={portalVertexShader}
          fragmentShader={portalFragmentShader}
          uniforms={portalUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Floating platform */}
      <group ref={platformRef} position={[0, -5, 0]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[10, 8, 1, 32]} />
          <meshStandardMaterial 
            map={woodTexture}
            color="#4361ee" 
            metalness={0.3}
            roughness={0.7}
            emissive="#4361ee"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Platform glow */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[10.5, 8.5, 0.1, 32]} />
          <meshBasicMaterial 
            color="#4cc9f0" 
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
      
      {/* Floating decorative objects */}
      <group ref={floatingObjectsRef}>
        {/* Some platonic solids floating around */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 12;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(angle * 2) * 2;
          
          const geomIndex = i % geometries.length;
          const matIndex = i % materials.length;
          
          return (
            <Platonic 
              key={i}
              position={[x, y, z]}
              geometry={geometries[geomIndex]}
              material={materials[matIndex]}
              scale={0.6 + Math.random() * 0.4}
            />
          );
        })}
      </group>
      
      {/* Decorative floating cubes */}
      <instancedMesh 
        ref={cubesRef} 
        args={[undefined, undefined, cubeCount]}
        castShadow
      >
        <boxGeometry />
        <meshPhysicalMaterial 
          color="#4cc9f0" 
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#3a0ca3"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
        />
      </instancedMesh>
    </>
  );
}
