import { useGameStore } from '../store';
import { Settings, Trophy, Wrench, Play, Info, Volume2, VolumeX, Camera } from 'lucide-react';
import { audioManager } from '../audio';
import { translations } from '../i18n';

export default function MainMenu() {
  const { setAppState, money, setTimeOfDay, timeOfDay, currentTrackId, setCurrentTrack, tracks, highScores, language, setLanguage, audioEnabled, setAudioEnabled, cameraView, setCameraView } = useGameStore();
  const highestScore = highScores.length > 0 ? highScores[0].score : 0;
  const t = translations[language];

  const handleStart = () => {
    audioManager.init();
    audioManager.resume();
    if (audioEnabled) {
      audioManager.startBGM();
    }
    setAppState('playing');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const cycleCamera = () => {
    const views: Array<'thirdPerson' | 'firstPerson' | 'far'> = ['thirdPerson', 'firstPerson', 'far'];
    const nextIdx = (views.indexOf(cameraView) + 1) % views.length;
    setCameraView(views[nextIdx]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full p-4 overflow-y-auto relative bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-yellow-400 bg-black/50 px-4 py-2 rounded-full border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)] inline-block">
            ${money.toLocaleString()}
          </div>
          {highestScore > 0 && (
            <div className="text-xs font-bold text-gray-300 bg-black/40 px-3 py-1 rounded-full border border-gray-600 inline-block text-center mt-1">
              {t.highScore}: <span className="text-white">{Math.floor(highestScore).toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <button 
              onClick={toggleLanguage}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-600 text-white font-bold"
            >
              {language.toUpperCase()}
            </button>
            <button 
              onClick={toggleAudio}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-600 text-white"
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-red-400" />}
            </button>
            <button 
              onClick={() => setTimeOfDay(timeOfDay === 'day' ? 'night' : 'day')}
              className={`px-3 py-2 rounded-full border transition-colors flex items-center justify-center ${timeOfDay === 'day' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-indigo-900 border-indigo-700 text-gray-300'}`}
            >
              {timeOfDay === 'day' ? 'Day' : 'Night'}
            </button>
          </div>
          <button 
            onClick={cycleCamera}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-600 text-white text-xs font-bold uppercase"
          >
            <Camera size={14} /> {cameraView}
          </button>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl font-black italic mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 drop-shadow-lg text-center leading-tight py-4">
          KG RIDER
        </h1>
        <p className="text-gray-400 mb-8 tracking-widest text-sm uppercase">Endless Highway</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm mb-12">
        <button 
          onClick={handleStart}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl text-2xl transition-transform active:scale-95 shadow-[0_4px_20px_rgba(16,185,129,0.3)] border border-green-400/50"
        >
          <Play fill="currentColor" size={28} /> {t.play}
        </button>

        <button 
          onClick={() => setAppState('garage')}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors border border-gray-600"
        >
          <Wrench size={20} /> {t.garage}
        </button>

        <div className="flex gap-3">
          <button 
            onClick={() => setAppState('scoreboard')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl text-sm md:text-base transition-colors border border-gray-600"
          >
            <Trophy size={18} /> {t.scoreboard}
          </button>
          <button 
            onClick={() => setAppState('about')}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl text-sm md:text-base transition-colors border border-gray-600"
          >
            <Info size={18} /> {t.about}
          </button>
        </div>

        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-gray-700/50">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 text-center">Track</h3>
          <div className="flex justify-center gap-2">
            {tracks.map(track => (
              <button
                key={track.id}
                onClick={() => setCurrentTrack(track.id)}
                className={`flex-1 py-2 px-1 text-xs font-bold rounded ${currentTrackId === track.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                {track.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
