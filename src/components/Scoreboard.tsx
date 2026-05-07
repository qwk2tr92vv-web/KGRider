import { useGameStore } from '../store';
import { ArrowLeft, Medal } from 'lucide-react';

export default function Scoreboard() {
  const { setAppState, highScores } = useGameStore();

  return (
    <div className="flex flex-col w-full h-full bg-gray-900">
      <div className="p-4 bg-gray-900/90 backdrop-blur border-b border-gray-800 flex items-center justify-between shrink-0">
        <button 
          onClick={() => setAppState('menu')}
          className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black italic tracking-wider text-white">HIGH SCORES</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto max-w-2xl mx-auto w-full">
        {highScores.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <Medal size={48} className="mb-4 opacity-50" />
            <p>No high scores yet.</p>
            <p className="text-sm mt-2">Start riding to set a record!</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {highScores.map((score, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-4 rounded-xl border ${idx === 0 ? 'border-yellow-500/50 bg-yellow-900/20' : idx === 1 ? 'border-gray-400/50 bg-gray-800/50' : idx === 2 ? 'border-orange-700/50 bg-orange-900/20' : 'border-gray-800 bg-black/40'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-600 text-black' : 'bg-gray-800 text-gray-400'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{score.name}</h3>
                    <p className="text-xs text-gray-500">{new Date(score.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-2xl font-black font-mono tracking-tighter">
                  {score.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
