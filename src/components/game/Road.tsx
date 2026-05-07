import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Road({ speedRef, color, isPlaying }: { speedRef: React.MutableRefObject<number>, color: string, isPlaying: boolean }) {
  const lineMatRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const lineTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 64, 256);
    ctx.fillStyle = 'white';
    ctx.fillRect(16, 0, 32, 128); // Dashed line
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 20); // Repeat along length
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    if (lineTexture) {
      lineTexture.offset.y -= (speedRef.current * delta) * 0.05;
    }
  });

  return (
    <group>
      {/* Asphalt */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -50]}>
        <planeGeometry args={[20, 300]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      
      {/* Dashed Center Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, -50]}>
        <planeGeometry args={[0.5, 300]} />
        <meshBasicMaterial ref={lineMatRef} map={lineTexture} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
