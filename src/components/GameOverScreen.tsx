import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { RotateCcw, Home, Trophy, Coins } from 'lucide-react';
import { translations } from '../i18n';
import { audioManager } from '../audio';

export default function GameOverScreen() {
  const { setAppState, score, setScore, addHighScore, addMoney, incrementGameId, language, audioEnabled } = useGameStore();
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const moneyEarnedRef = useRef(Math.floor(score / 50));
  const hasAddedMoney = useRef(false);
  const t = translations[language];

  useEffect(() => {
    if (!hasAddedMoney.current) {
      addMoney(moneyEarnedRef.current);
      hasAddedMoney.current = true;
    }
  }, [addMoney]);

  const handleSubmitScore = () => {
    if (!name.trim() || submitted) return;
    addHighScore({ name: name.trim().substring(0, 10) || 'RIDER', score: Math.floor(score), date: new Date().toISOString() });
    setSubmitted(true);
  };

  const handleRestart = () => {
    setScore(0);
    incrementGameId();
    if (audioEnabled) {
      audioManager.startBGM();
    }
    setAppState('playing');
  };

  const handleMenu = () => {
    setScore(0);
    incrementGameId();
    setAppState('menu');
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-red-500/50 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
        
        <h2 className="text-5xl font-black italic text-red-500 tracking-tighter mb-2">{t.gameover}!</h2>
        
        <div className="text-gray-400 mb-2 flex items-center justify-center gap-2">
          <span>{t.score.toUpperCase()}</span>
        </div>
        
        <div className="text-6xl font-black font-mono text-white mb-4">
          {Math.floor(score).toLocaleString()}
        </div>

        <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-500/10 px-4 py-2 rounded-full mb-6">
          <Coins size={18} />
          <span>+ ${moneyEarnedRef.current.toLocaleString()} EARNED</span>
        </div>

        <div className="w-full h-px bg-gray-800 mb-6" />

        {!submitted ? (
          <div className="w-full flex gap-2 mb-8">
            <input 
              type="text" 
              maxLength={10}
              placeholder="ENTER NAME" 
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase text-white"
            />
            <button 
              onClick={handleSubmitScore}
              disabled={!name.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white p-3 rounded-xl transition-colors shrink-0 font-bold"
            >
              SAVE
            </button>
          </div>
        ) : (
          <div className="mb-8 font-bold text-green-400 flex items-center justify-center gap-2">
            <Trophy size={20} /> SCORE SAVED
          </div>
        )}

        <div className="flex gap-4 w-full">
          <button 
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl transition-transform active:scale-95"
          >
            <RotateCcw size={20} /> {t.retry}
          </button>
          <button 
            onClick={handleMenu}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-transform active:scale-95 border border-gray-700"
          >
            <Home size={20} /> {t.menu}
          </button>
        </div>
      </div>
    </div>
  );
}
