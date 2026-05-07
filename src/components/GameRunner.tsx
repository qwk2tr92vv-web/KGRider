import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Scene } from './game/Scene';
import { HUD } from './HUD';
import GameOverScreen from './GameOverScreen';

import { Pause, Play, Home } from 'lucide-react';

export default function GameRunner() {
  const { appState, setAppState, gameId } = useGameStore();
  const [controls, setControls] = useState({ left: false, right: false, up: false, down: false });

  // Handle keyboard for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAppState(appState === 'playing' ? 'paused' : 'playing');
      if (e.key === 'ArrowLeft' || e.key === 'a') setControls(c => ({ ...c, left: true }));
      if (e.key === 'ArrowRight' || e.key === 'd') setControls(c => ({ ...c, right: true }));
      if (e.key === 'ArrowUp' || e.key === 'w') setControls(c => ({ ...c, up: true }));
      if (e.key === 'ArrowDown' || e.key === 's') setControls(c => ({ ...c, down: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setControls(c => ({ ...c, left: false }));
      if (e.key === 'ArrowRight' || e.key === 'd') setControls(c => ({ ...c, right: false }));
      if (e.key === 'ArrowUp' || e.key === 'w') setControls(c => ({ ...c, up: false }));
      if (e.key === 'ArrowDown' || e.key === 's') setControls(c => ({ ...c, down: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [appState, setAppState]);

  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>
      <Canvas key={gameId} shadows camera={{ position: [0, 4, 10], fov: 60 }}>
        <Physics paused={appState === 'paused'}>
          <Scene controls={controls} />
        </Physics>
      </Canvas>

      {/* Touch Controls Layer */}
      {appState === 'playing' && (
        <div className="absolute inset-x-0 bottom-0 top-20 z-10 pointer-events-none flex flex-col justify-end pb-8 px-4">
          <div className="flex justify-between items-end w-full">
            <div className="flex gap-4 pointer-events-auto">
              <button 
                className="w-16 h-16 bg-white/20 active:bg-white/40 rounded-full flex items-center justify-center backdrop-blur border border-white/30 text-white font-black text-2xl select-none"
                onPointerDown={() => setControls(c => ({ ...c, left: true }))}
                onPointerUp={() => setControls(c => ({ ...c, left: false }))}
                onPointerLeave={() => setControls(c => ({ ...c, left: false }))}
                onTouchStart={(e) => { e.preventDefault(); setControls(c => ({ ...c, left: true })) }}
                onTouchEnd={(e) => { e.preventDefault(); setControls(c => ({ ...c, left: false })) }}
              >◀</button>
              <button 
                className="w-16 h-16 bg-white/20 active:bg-white/40 rounded-full flex items-center justify-center backdrop-blur border border-white/30 text-white font-black text-2xl select-none"
                onPointerDown={() => setControls(c => ({ ...c, right: true }))}
                onPointerUp={() => setControls(c => ({ ...c, right: false }))}
                onPointerLeave={() => setControls(c => ({ ...c, right: false }))}
                onTouchStart={(e) => { e.preventDefault(); setControls(c => ({ ...c, right: true })) }}
                onTouchEnd={(e) => { e.preventDefault(); setControls(c => ({ ...c, right: false })) }}
              >▶</button>
            </div>
            
            <div className="flex gap-4 pointer-events-auto">
              <button 
                className="w-16 h-16 bg-red-500/40 active:bg-red-500/60 rounded-full flex items-center justify-center backdrop-blur border border-red-500/50 text-white font-bold select-none"
                onPointerDown={() => setControls(c => ({ ...c, down: true }))}
                onPointerUp={() => setControls(c => ({ ...c, down: false }))}
                onPointerLeave={() => setControls(c => ({ ...c, down: false }))}
                onTouchStart={(e) => { e.preventDefault(); setControls(c => ({ ...c, down: true })) }}
                onTouchEnd={(e) => { e.preventDefault(); setControls(c => ({ ...c, down: false })) }}
              >BRAKE</button>
              <button 
                className="w-16 h-16 bg-green-500/40 active:bg-green-500/60 transition-colors rounded-full flex items-center justify-center backdrop-blur border border-green-500/50 text-white font-bold select-none"
                onPointerDown={() => setControls(c => ({ ...c, up: true }))}
                onPointerUp={() => setControls(c => ({ ...c, up: false }))}
                onPointerLeave={() => setControls(c => ({ ...c, up: false }))}
                onTouchStart={(e) => { e.preventDefault(); setControls(c => ({ ...c, up: true })) }}
                onTouchEnd={(e) => { e.preventDefault(); setControls(c => ({ ...c, up: false })) }}
              >GAS</button>
            </div>
          </div>
        </div>
      )}

      {/* HUD Layer */}
      {(appState === 'playing' || appState === 'paused') && <HUD />}

      {/* Pause Menu */}
      {appState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur z-30 flex flex-col items-center justify-center">
          <h2 className="text-5xl font-black italic text-white tracking-tighter mb-8">PAUSED</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setAppState('playing')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold py-4 px-8 rounded-xl transition-transform active:scale-95"
            >
              <Play fill="currentColor" size={24} /> RESUME
            </button>
            <button 
              onClick={() => setAppState('menu')}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 border border-gray-700"
            >
              <Home size={24} /> QUIT TO MENU
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {appState === 'gameover' && <GameOverScreen />}
    </div>
  );
}
