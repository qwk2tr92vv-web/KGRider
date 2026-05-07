import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Track } from '../../store';

const COUNT = 100;

export function SceneryManager({ speedRef, track, isPlaying }: { speedRef: React.MutableRefObject<number>, track: Track, isPlaying: boolean }) {
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const trunksRef = useRef<THREE.InstancedMesh>(null);
  
  // Create tree positions
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const trees = useMemo(() => {
    return Array.from({ length: COUNT }, () => ({
      x: (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 30), // On the sides
      y: 0,
      z: -300 + Math.random() * 350, // Spread along Z
      scale: 1 + Math.random() * 2,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!isPlaying || !leavesRef.current || !trunksRef.current) return;
    
    const speed = speedRef.current;
    
    for (let i = 0; i < COUNT; i++) {
      const tree = trees[i];
      tree.z += speed * delta;
      
      // Reset if passed user
      if (tree.z > 20) {
        tree.z -= 350;
        tree.x = (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 30);
      }
      
      // Leaves update
      dummy.position.set(tree.x, tree.y + 2.5 * tree.scale, tree.z); // Lift leaves
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      leavesRef.current.setMatrixAt(i, dummy.matrix);

      // Trunk update
      dummy.position.set(tree.x, tree.y + 0.5 * tree.scale, tree.z);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      trunksRef.current.setMatrixAt(i, dummy.matrix);
    }
    leavesRef.current.instanceMatrix.needsUpdate = true;
    trunksRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Ground expansion */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -50]}>
        <planeGeometry args={[200, 300]} />
        <meshStandardMaterial color={track.envColor} roughness={1} />
      </mesh>
      
      {/* Trees InstancedMesh */}
      <instancedMesh ref={leavesRef} args={[undefined, undefined, COUNT]} castShadow receiveShadow>
        <coneGeometry args={[1.5, 4, 8]} />
        <meshStandardMaterial color={track.treeColor} roughness={0.9} />
      </instancedMesh>
      
      {/* Tree Trunks */}
      <instancedMesh ref={trunksRef} args={[undefined, undefined, COUNT]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#3d2817" />
      </instancedMesh>
    </group>
  );
}
