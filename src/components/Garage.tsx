import { useGameStore } from '../store';
import { ArrowLeft, Zap, Orbit, Lock, Unlock } from 'lucide-react';
import { translations } from '../i18n';

export default function Garage() {
  const { setAppState, money, bikes, currentBikeId, unlockBike, setCurrentBike, upgradeBike, spendMoney, language } = useGameStore();
  const currentBike = bikes.find(b => b.id === currentBikeId);
  const t = translations[language];

  const handleBuy = (id: string, price: number) => {
    if (spendMoney(price)) {
      unlockBike(id);
      setCurrentBike(id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 overflow-y-auto pb-8">
      <div className="sticky top-0 p-4 bg-gray-900/90 backdrop-blur border-b border-gray-800 flex items-center justify-between z-10">
        <button 
          onClick={() => setAppState('menu')}
          className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black italic tracking-wider text-white">{t.garage}</h2>
        <div className="text-lg font-bold text-yellow-400 bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30">
          ${money.toLocaleString()}
        </div>
      </div>

      <div className="p-4 grid gap-6 max-w-4xl mx-auto w-full">
        {bikes.map(bike => {
          const isSelected = bike.id === currentBikeId;
          const isAffordable = money >= bike.price;

          return (
            <div key={bike.id} className={`p-4 rounded-2xl border ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'} flex flex-col md:flex-row gap-6 relative overflow-hidden`}>
              <div 
                className="w-full md:w-48 h-32 rounded-xl flex items-center justify-center relative shadow-inner"
                style={{ backgroundColor: `${bike.color}22`, border: `2px solid ${bike.color}` }}
              >
                <div className="w-24 h-12 rounded-lg" style={{ backgroundColor: bike.color }} />
                {!bike.unlocked && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]"><Lock size={32} className="text-white/50" /></div>}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    {bike.name} 
                    {isSelected && <span className="text-xs bg-blue-600 px-2 py-1 rounded-full uppercase tracking-wider">{t.selected}</span>}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><Zap size={12}/> {t.speed} (Lv {bike.level.speed})</span>
                        <span>{bike.speed}/150</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(bike.speed / 150) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="flex items-center gap-1"><Orbit size={12}/> {t.handling} (Lv {bike.level.handling})</span>
                        <span>{bike.handling}/150</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(bike.handling / 150) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {!bike.unlocked ? (
                    <button 
                      onClick={() => handleBuy(bike.id, bike.price)}
                      disabled={!isAffordable}
                      className={`flex-1 py-2 rounded-lg font-bold flex flex-col items-center justify-center ${isAffordable ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gray-700 text-gray-500'}`}
                    >
                      <span className="text-xs uppercase opacity-70">{t.buy}</span>
                      <span>${bike.price.toLocaleString()}</span>
                    </button>
                  ) : (
                    <>
                      {!isSelected && (
                        <button 
                          onClick={() => setCurrentBike(bike.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                        >
                          {t.select}
                        </button>
                      )}
                      {isSelected && (
                        <>
                          <button 
                            onClick={() => upgradeBike(bike.id, 'speed')}
                            disabled={money < 200 || bike.level.speed >= 10}
                            className={`flex-[0.5] py-2 rounded-lg font-bold flex flex-col items-center justify-center text-xs ${money >= 200 && bike.level.speed < 10 ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-gray-700 text-gray-500'}`}
                          >
                            <span>{t.upgrade} SPD</span>
                            <span className="opacity-80">${bike.level.speed >= 10 ? t.max : '200'}</span>
                          </button>
                          <button 
                            onClick={() => upgradeBike(bike.id, 'handling')}
                            disabled={money < 200 || bike.level.handling >= 10}
                            className={`flex-[0.5] py-2 rounded-lg font-bold flex flex-col items-center justify-center text-xs ${money >= 200 && bike.level.handling < 10 ? 'bg-teal-600 text-white hover:bg-teal-500' : 'bg-gray-700 text-gray-500'}`}
                          >
                            <span>{t.upgrade} HND</span>
                            <span className="opacity-80">${bike.level.handling >= 10 ? t.max : '200'}</span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
