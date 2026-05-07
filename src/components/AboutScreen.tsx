import { useGameStore } from '../store';
import { translations } from '../i18n';
import { ArrowLeft, Info } from 'lucide-react';

export default function AboutScreen() {
  const { setAppState, language } = useGameStore();
  const t = translations[language];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-2xl flex flex-col items-center">
        <Info size={48} className="text-blue-500 mb-4" />
        <h2 className="text-3xl font-black text-white mb-4 uppercase">{t.about}</h2>
        <p className="text-gray-300 text-center mb-8 leading-relaxed">
          {t.aboutText}
        </p>

        <button 
          onClick={() => setAppState('menu')}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full"
        >
          <ArrowLeft size={20} /> {t.back}
        </button>
      </div>
    </div>
  );
}
