import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../store';
import * as THREE from 'three';
import { Environment, Sky, ContactShadows } from '@react-three/drei';
import { PlayerBike, globalPlayerState } from './PlayerBike';
import { TrafficManager } from './TrafficManager';
import { SceneryManager } from './SceneryManager';
import { Road } from './Road';

export function Scene({ controls }: { controls: { left: boolean; right: boolean; up: boolean; down: boolean; } }) {
  const { appState, currentTrackId, tracks, timeOfDay, score, setScore, setAppState, cameraView } = useGameStore();
  const track = tracks.find(t => t.id === currentTrackId) || tracks[0];

  const speedRef = useRef(30); // Units per second
  const [crashed, setCrashed] = useState(false);
  const crashPos = useRef(new THREE.Vector3());
  const { camera } = useThree();

  // Lighting based on day/night
  const isNight = timeOfDay === 'night';
  const ambientIntensity = isNight ? 0.2 : 0.8;
  const sunPosition = isNight ? [0, -10, 0] : [100, 50, 100];

  useFrame((state, delta) => {
    // Camera logic
    const px = globalPlayerState.x || 0;
    
    if (cameraView === 'thirdPerson') {
      camera.position.lerp(new THREE.Vector3(px * 0.3, 3, 7), 5 * delta);
      camera.lookAt(px * 0.1, 0, -5);
    } else if (cameraView === 'firstPerson') {
      camera.position.lerp(new THREE.Vector3(px, 1.2, 0.2), 10 * delta);
      camera.lookAt(px, 1.0, -10);
    } else if (cameraView === 'far') {
      camera.position.lerp(new THREE.Vector3(px * 0.5, 6, 12), 3 * delta);
      camera.lookAt(0, 0, -2);
    }

    if (appState !== 'playing' || crashed) return;
    
    // Score update
    setScore(score + (speedRef.current * delta) * 0.1);
  });

  const handleCrash = (position: THREE.Vector3) => {
    if (crashed) return;
    setCrashed(true);
    crashPos.current.copy(position);
    setTimeout(() => {
      setAppState('gameover');
    }, 2500); // Wait 2.5s to watch the ragdoll fly
  };

  return (
    <>
      <color attach="background" args={[isNight ? '#050510' : '#87CEEB']} />
      
      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        castShadow 
        position={sunPosition as any} 
        intensity={isNight ? 0 : 1.5} 
        shadow-mapSize={[2048, 2048]} 
      />
      {isNight && (
        <pointLight position={[0, 10, -50]} intensity={2} color="#4466ff" distance={100} />
      )}

      {/* Environment */}
      {!isNight && <Sky sunPosition={sunPosition as any} distance={400000} />}
      <Environment preset={isNight ? 'night' : 'city'} />
      <fog attach="fog" args={[isNight ? '#050510' : '#87CEEB', 20, 150]} />

      {/* World Elements */}
      <Road speedRef={speedRef} color={track.roadColor} isPlaying={appState === 'playing' && !crashed} />
      <SceneryManager speedRef={speedRef} track={track} isPlaying={appState === 'playing' && !crashed} />
      <TrafficManager speedRef={speedRef} isPlaying={appState === 'playing' && !crashed} />

      {/* Player Setup */}
      <PlayerBike 
        controls={controls} 
        speedRef={speedRef} 
        crashed={crashed} 
        onCrash={handleCrash} 
        crashPos={crashPos.current}
      />
    </>
  );
}
