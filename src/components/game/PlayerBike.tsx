import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useGameStore } from "../../store";
import * as THREE from "three";
import { audioManager } from "../../audio";

export const globalPlayerState = {
  x: 0,
  z: 0,
  speed: 0,
  crashed: false,
  triggerCrash: (x: number, y: number, z: number) => {}
};

const LERP_SPEED = 10;
const MAX_X = 8;
const BIKE_TILT = 0.5;

function CrashEffect({ position }: { position: THREE.Vector3 }) {
  const particlesCount = 50;
  const positions = useMemo(() => {
    const arr = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      arr[i * 3] = position.x + (Math.random() - 0.5) * 2;
      arr[i * 3 + 1] = position.y + Math.random() * 2;
      arr[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
    }
    return arr;
  }, [position]);

  const materials = useRef<THREE.PointsMaterial>(null);

  useFrame((_, delta) => {
    if (materials.current) {
      materials.current.size = Math.max(
        0,
        materials.current.size - delta * 0.5,
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materials}
        size={0.5}
        color="#ffa500"
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function DismemberedBike({
  color,
  position,
  velocity,
}: {
  color: string;
  position: THREE.Vector3;
  velocity: number;
}) {
  // Break the bike into physical parts when crashed
  const speed = velocity * 0.5;
  return (
    <group position={position}>
      <CrashEffect position={new THREE.Vector3(0, 0, 0)} />
      {/* Bike Chassis */}
      <RigidBody
        colliders="cuboid"
        linearVelocity={[0, speed * 0.2, -speed]}
        angularVelocity={[Math.random(), Math.random(), Math.random()]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.8, 1.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
      {/* Front Wheel */}
      <RigidBody
        colliders="hull"
        linearVelocity={[(Math.random() - 0.5) * 5, speed * 0.5, -speed * 1.2]}
        angularVelocity={[10, 0, 0]}
      >
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </RigidBody>
      {/* Back Wheel */}
      <RigidBody
        colliders="hull"
        linearVelocity={[(Math.random() - 0.5) * 5, speed * 0.3, -speed * 0.8]}
        angularVelocity={[10, 0, 0]}
      >
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </RigidBody>

      {/* Ragdoll Rider Parts */}
      {/* Head */}
      <RigidBody
        colliders="ball"
        linearVelocity={[(Math.random() - 0.5) * 10, speed * 0.8, -speed * 1.5]}
        angularVelocity={[
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10,
        ]}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.25]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
      </RigidBody>
      {/* Torso */}
      <RigidBody
        colliders="cuboid"
        linearVelocity={[(Math.random() - 0.5) * 8, speed * 0.6, -speed * 1.3]}
        angularVelocity={[
          Math.random() * 5,
          Math.random() * 5,
          Math.random() * 5,
        ]}
      >
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.8, 0.3]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </RigidBody>
    </group>
  );
}

export function PlayerBike({
  controls,
  speedRef,
  crashed,
  onCrash,
  crashPos,
}: {
  controls: { left: boolean; right: boolean; up: boolean; down: boolean };
  speedRef: React.MutableRefObject<number>;
  crashed: boolean;
  onCrash: (pos: THREE.Vector3) => void;
  crashPos: THREE.Vector3;
}) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);

  const { currentBikeId, bikes, appState } = useGameStore();
  const bike = bikes.find((b) => b.id === currentBikeId) || bikes[0];
  const handling = bike.handling * 0.1; // Adjust turning speed

  // Internal state for smooth movement
  const targetX = useRef(0);
  const currentX = useRef(0);
  const targetTilt = useRef(0);
  const currentTilt = useRef(0);

  useEffect(() => {
    globalPlayerState.crashed = crashed;
    globalPlayerState.triggerCrash = (x, y, z) => {
       if (!crashed) {
          audioManager.playCrash();
          onCrash(new THREE.Vector3(x, y, z));
       }
    };
    if (crashed) {
      audioManager.stopEngine();
    }
  }, [crashed, onCrash]);

  useFrame((_, delta) => {
    if (crashed || appState === "paused") {
      if (appState === "paused") audioManager.stopEngine();
      return;
    }

    // Acceleration logic
    if (controls.up) {
      speedRef.current += delta * 25; // Accelerate
    } else if (controls.down) {
      speedRef.current -= delta * 50; // Brake
    } else {
      speedRef.current -= delta * 5; // Natural friction
    }

    const minSpeed = 10;
    speedRef.current = THREE.MathUtils.clamp(
      speedRef.current,
      minSpeed,
      bike.speed,
    );

    // Audio
    audioManager.updateEngine(speedRef.current, bike.speed, controls.up);

    // Movement logic
    if (controls.left) {
      targetX.current -= handling * delta;
      targetTilt.current = BIKE_TILT;
    } else if (controls.right) {
      targetX.current += handling * delta;
      targetTilt.current = -BIKE_TILT;
    } else {
      targetTilt.current = 0;
    }

    // clamping x to road bounds
    targetX.current = Math.max(-MAX_X, Math.min(MAX_X, targetX.current));

    // Smooth lerp
    currentX.current = THREE.MathUtils.lerp(
      currentX.current,
      targetX.current,
      LERP_SPEED * delta,
    );
    currentTilt.current = THREE.MathUtils.lerp(
      currentTilt.current,
      targetTilt.current,
      LERP_SPEED * delta,
    );

    globalPlayerState.x = currentX.current;
    globalPlayerState.speed = speedRef.current;

    if (bodyRef.current) {
      bodyRef.current.setNextKinematicTranslation({
        x: currentX.current,
        y: 0.5,
        z: 0,
      });
    }

    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.z = currentTilt.current;
      // Slight forward tilt based on speed
      meshGroupRef.current.rotation.x = speedRef.current * 0.001;
    }
  });

  if (crashed) {
    return (
      <DismemberedBike
        color={bike.color}
        position={crashPos}
        velocity={speedRef.current}
      />
    );
  }

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
    >
      <CuboidCollider
        args={[0.4, 0.6, 1.0]}
        sensor={true}
        name="playerCrashSensor"
      />
      <CuboidCollider
        args={[1.5, 1.0, 3.0]}
        sensor={true}
        name="playerNearMissSensor"
      />

      <group ref={meshGroupRef}>
        <group position={[0, 0, 0]}>
          {/* Main Body / Engine block */}
          <mesh castShadow position={[0, 0.1, 0.1]}>
            <boxGeometry args={[0.35, 0.5, 0.8]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>

          {/* Fuel Tank */}
          <mesh castShadow position={[0, 0.5, -0.3]}>
            <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
            <meshStandardMaterial color={bike.color} roughness={0.2} metalness={0.6} />
          </mesh>
          
          {/* Seat */}
          <mesh castShadow position={[0, 0.45, 0.3]}>
            <boxGeometry args={[0.3, 0.1, 0.6]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
          </mesh>

          {/* Exhaust */}
          <mesh castShadow position={[0.25, -0.1, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 1.0, 8]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Headlight */}
          <mesh position={[0, 0.4, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
          </mesh>

          {/* Handlebars */}
          <mesh castShadow position={[0, 0.65, -0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
            <meshStandardMaterial color="#111" />
          </mesh>

          {/* Front Fairing */}
          <mesh castShadow position={[0, 0.3, -0.8]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.45, 0.5, 0.5]} />
            <meshStandardMaterial
              color={bike.color}
              roughness={0.2}
              metalness={0.5}
            />
          </mesh>

          {/* Wheels */}
          <mesh
            castShadow
            rotation={[0, 0, Math.PI / 2]}
            position={[0, -0.1, -0.8]}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.2, 24]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh
            castShadow
            rotation={[0, 0, Math.PI / 2]}
            position={[0, -0.1, 0.8]}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.25, 24]} />
            <meshStandardMaterial color="#111" />
          </mesh>

          {/* Wheel Rims */}
          <mesh
            castShadow
            rotation={[0, 0, Math.PI / 2]}
            position={[0, -0.1, -0.8]}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.21, 16]} />
            <meshStandardMaterial color="#888" metalness={0.8} />
          </mesh>
          <mesh
            castShadow
            rotation={[0, 0, Math.PI / 2]}
            position={[0, -0.1, 0.8]}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.26, 16]} />
            <meshStandardMaterial color="#888" metalness={0.8} />
          </mesh>
        </group>

        {/* Simple Rider Mesh */}
        <group position={[0, 0.5, 0]} rotation={[0.4, 0, 0]}>
          {/* Torso */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.7, 0.3]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#ffccaa" />
          </mesh>
          {/* Helmet */}
          <mesh castShadow position={[0, 0.5, -0.05]}>
            <sphereGeometry args={[0.22]} />
            <meshStandardMaterial color={bike.color} />
          </mesh>
          {/* Arms */}
          <mesh
            castShadow
            position={[-0.25, 0.1, -0.2]}
            rotation={[-0.8, 0, 0.2]}
          >
            <cylinderGeometry args={[0.06, 0.06, 0.6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh
            castShadow
            position={[0.25, 0.1, -0.2]}
            rotation={[-0.8, 0, -0.2]}
          >
            <cylinderGeometry args={[0.06, 0.06, 0.6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>

        {/* Headlight */}
        <pointLight
          position={[0, 0, -1]}
          intensity={2}
          color="#fff"
          distance={10}
          visible={true}
        />
        <mesh position={[0, 0.1, -1.06]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshBasicMaterial color="#ffffee" />
        </mesh>
        <spotLight
          position={[0, 0, -1]}
          angle={0.4}
          penumbra={0.5}
          intensity={5}
          distance={50}
          color="#ffffee"
        />
      </group>
    </RigidBody>
  );
}
