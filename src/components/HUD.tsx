import { useGameStore } from '../store';
import { Coins, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { globalPlayerState } from './game/PlayerBike';

export function HUD() {
  const { score, money, highScores } = useGameStore();
  const highestScore = highScores.length > 0 ? highScores[0].score : 0;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-20">
      <div className="flex flex-col gap-2">
        <div className="bg-black/50 backdrop-blur rounded-2xl p-3 border border-gray-700/50 min-w-[120px]">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 flex justify-between">
            <span>Score</span>
            <span className="text-yellow-500">HI: {Math.floor(highestScore).toLocaleString()}</span>
          </div>
          <div className="text-3xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {Math.floor(score).toLocaleString()}
          </div>
        </div>
        <button 
          onClick={() => useGameStore.getState().setAppState('paused')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-full px-4 py-2 border border-white/20 font-bold text-white pointer-events-auto transition-colors w-max"
        >
          PAUSE
        </button>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="bg-black/50 backdrop-blur rounded-full px-4 py-2 border border-yellow-500/30 flex items-center gap-2">
          <Coins size={16} className="text-yellow-400" />
          <span className="font-bold text-yellow-400">${money.toLocaleString()}</span>
        </div>
        
        <Speedometer />
      </div>
    </div>
  );
}

function Speedometer() {
  const { appState } = useGameStore();
  const [speed, setSpeed] = useState(30);

  useEffect(() => {
    let animationFrame: number;
    
    const updateSpeed = () => {
      if (appState === 'playing') {
        let currentRealSpeed = globalPlayerState.speed || 0;
        
        // Random jitter for realism when moving fast
        const jitter = currentRealSpeed > 5 ? (Math.random() * 2 - 1) : 0;
        setSpeed(Math.max(0, Math.floor(currentRealSpeed * 2.2 + jitter))); // Convert internal speed to "MPH"
      } else if (appState === 'gameover' || globalPlayerState.crashed) {
        setSpeed(0);
      }
      animationFrame = requestAnimationFrame(updateSpeed);
    };
    
    animationFrame = requestAnimationFrame(updateSpeed);

    return () => cancelAnimationFrame(animationFrame);
  }, [appState]);

  return (
    <div className="bg-black/50 backdrop-blur rounded-full px-4 py-2 border border-blue-500/30 flex items-center gap-2 mt-2">
      <Zap size={16} className="text-blue-400" />
      <span className="font-bold text-blue-400 font-mono text-xl w-12 text-right">{speed}</span>
      <span className="text-xs text-blue-400/70 font-bold tracking-widest">KM/H</span>
    </div>
  );
}
