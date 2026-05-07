import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store';
import { audioManager } from '../../audio';
import { globalPlayerState } from './PlayerBike';

const SPAWN_Z = -150;
const DESPAWN_Z = 20;

type CarData = {
  id: number;
  x: number;
  z: number;
  speed: number;
  color: string;
};

const CAR_COLORS = ['#ff2222', '#22ff22', '#2222ff', '#ffffff', '#ddaa22', '#cc22bb'];
const LANES = [-6, -2, 2, 6];

function TrafficCar({ data, speedRef }: { data: CarData; speedRef: React.MutableRefObject<number> }) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const passed = useRef(false);
  const addMoney = useGameStore(s => s.addMoney);
  
  useFrame((_, delta) => {
    if (!bodyRef.current) return;
    if (useGameStore.getState().appState === 'paused' || useGameStore.getState().appState === 'gameover') {
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }
    
    // Relative speed towards player (+Z) = roadSpeed - carSpeed
    const relativeSpeed = speedRef.current - data.speed;
    
    // Set velocity
    bodyRef.current.setLinvel({ x: 0, y: 0, z: relativeSpeed }, true);

    const pos = bodyRef.current.translation();
    const currentZ = pos.z;
    const currentX = pos.x;

    // Manual rigid collision check
    if (!globalPlayerState.crashed) {
       const dx = Math.abs(currentX - globalPlayerState.x);
       const dz = Math.abs(currentZ - globalPlayerState.z);

       // approximate bounding boxes:
       // bike: w: 0.8, l: 3.2
       // car: w: 1.8, l: 4.0
       // centers distance threshold: X: ~1.3, Z: ~3.6
       if (dx < 1.3 && dz < 3.2) {
          globalPlayerState.triggerCrash(globalPlayerState.x, 0.5, 0);
       } else if (dx < 2.5 && dz < 4.0) {
          // near miss
       }
    }

    // Check if player overtakes the car
    if (!passed.current && currentZ > 0 && relativeSpeed > 0 && !globalPlayerState.crashed) {
       passed.current = true;
       audioManager.playCoin();
       addMoney(1);
    }
  });

  return (
    <RigidBody 
      ref={bodyRef} 
      name="traffic" 
      type="dynamic" 
      lockRotations 
      enabledTranslations={[false, false, true]}
      gravityScale={0}
      colliders={false} 
      position={[data.x, 0.5, data.z]}
    >
      <CuboidCollider args={[0.9, 0.6, 2.0]} name="traffic" />
      <group position={[0, -0.2, 0]}>
        {/* Main Body */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.8, 4.2]} />
          <meshStandardMaterial color={data.color} roughness={0.4} metalness={0.6} />
        </mesh>
        
        {/* Cabin */}
        <mesh castShadow position={[0, 1.0, -0.2]}>
          <boxGeometry args={[1.5, 0.5, 2.0]} />
          <meshStandardMaterial color="#222" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 1.01, 0.81]} rotation={[0.4, 0, 0]}>
          <planeGeometry args={[1.4, 0.6]} />
          <meshStandardMaterial color="#000" />
        </mesh>

        {/* Wheels */}
        <mesh castShadow position={[-0.95, 0.2, 1.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh castShadow position={[0.95, 0.2, 1.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh castShadow position={[-0.95, 0.2, -1.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh castShadow position={[0.95, 0.2, -1.3]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Headlights */}
        <mesh position={[-0.6, 0.5, -2.11]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#ffffee" />
        </mesh>
        <mesh position={[0.6, 0.5, -2.11]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#ffffee" />
        </mesh>

        {/* Taillights */}
        <mesh position={[-0.6, 0.5, 2.11]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <mesh position={[0.6, 0.5, 2.11]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </RigidBody>
  );
}

export function TrafficManager({ speedRef, isPlaying }: { speedRef: React.MutableRefObject<number>, isPlaying: boolean }) {
  const [cars, setCars] = useState<CarData[]>([]);
  const lastSpawnZ = useRef(0);
  const carIdCounter = useRef(0);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    // Simulate distance traveled by moving everything backward relatively
    const distanceTraveled = speedRef.current * delta;
    
    // Spawn logic based on virtual distance
    lastSpawnZ.current -= distanceTraveled;
    
    // Determine spawn parameters based on difficulty
    const diff = useGameStore.getState().difficulty;
    let spawnInterval = 30;
    let maxCarsToSpawn = 2;
    let minCarsToSpawn = 1;

    if (diff === 'easy') {
      spawnInterval = 50;
      maxCarsToSpawn = 1;
      minCarsToSpawn = 1;
    } else if (diff === 'hard') {
      spawnInterval = 20;
      maxCarsToSpawn = 3;
      minCarsToSpawn = 2;
    }

    if (lastSpawnZ.current < -spawnInterval) { // Spawn every X units
      lastSpawnZ.current = 0;
      
      const numCarsToSpawn = Math.floor(Math.random() * (maxCarsToSpawn - minCarsToSpawn + 1)) + minCarsToSpawn;
      const availableLanes = [...LANES];
      
      const newCars: CarData[] = [];
      for(let i=0; i<numCarsToSpawn; i++) {
        const laneIdx = Math.floor(Math.random() * availableLanes.length);
        const laneX = availableLanes.splice(laneIdx, 1)[0];
        
        // Use a lane-specific constant speed so cars in the same lane never catch up and clump
        let laneSpeed = 20;
        if (laneX === -6) laneSpeed = 15;
        if (laneX === -2) laneSpeed = 20;
        if (laneX === 2) laneSpeed = 25;
        if (laneX === 6) laneSpeed = 30;
        
        newCars.push({
          id: carIdCounter.current++,
          x: laneX,
          z: SPAWN_Z,
          speed: laneSpeed,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
        });
      }

      // We can't easily read individual car Zs without an array of refs, 
      // but we can estimate their lifetime distance, or keep up to 40 cars
      setCars(prev => {
         const updated = [...prev, ...newCars];
         // Keep more cars in memory so they don't pop out early if relative speed is slow
         // 40 is a safe threshold since maximum density is around ~30 on typical worst-case difference
         return updated.slice(-40);
      });
    }
  });

  return (
    <group>
      {cars.map(c => (
        <TrafficCar key={c.id} data={c} speedRef={speedRef} />
      ))}
    </group>
  );
}
