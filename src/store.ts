import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Bike = {
  id: string;
  name: string;
  price: number;
  speed: number;
  handling: number;
  color: string;
  modelType: 'sport' | 'cruiser' | 'dirt';
  unlocked: boolean;
  level: { speed: number; handling: number };
};

export type Track = {
  id: string;
  name: string;
  envColor: string;
  roadColor: string;
  treeColor: string;
};

export type HighScore = {
  name: string;
  score: number;
  date: string;
};

interface GameState {
  appState: 'menu' | 'garage' | 'playing' | 'gameover' | 'scoreboard' | 'paused' | 'about';
  setAppState: (state: 'menu' | 'garage' | 'playing' | 'gameover' | 'scoreboard' | 'paused' | 'about') => void;
  
  language: 'en' | 'tr';
  setLanguage: (lang: 'en' | 'tr') => void;

  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;

  cameraView: 'thirdPerson' | 'firstPerson' | 'far';
  setCameraView: (view: 'thirdPerson' | 'firstPerson' | 'far') => void;

  gameId: number;
  incrementGameId: () => void;

  money: number;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;

  bikes: Bike[];
  currentBikeId: string;
  unlockBike: (id: string) => void;
  setCurrentBike: (id: string) => void;
  upgradeBike: (id: string, type: 'speed' | 'handling') => void;

  tracks: Track[];
  currentTrackId: string;
  setCurrentTrack: (id: string) => void;

  timeOfDay: 'day' | 'night';
  setTimeOfDay: (time: 'day' | 'night') => void;

  score: number;
  setScore: (score: number) => void;

  highScores: HighScore[];
  addHighScore: (score: HighScore) => void;
}

const initialBikes: Bike[] = [
  { id: 'b1', name: 'Moped', price: 0, speed: 50, handling: 50, color: '#ff4444', modelType: 'sport', unlocked: true, level: { speed: 1, handling: 1 } },
  { id: 'b2', name: 'Street Fighter', price: 1000, speed: 70, handling: 70, color: '#44ff44', modelType: 'sport', unlocked: false, level: { speed: 1, handling: 1 } },
  { id: 'b3', name: 'Cruiser', price: 2500, speed: 60, handling: 90, color: '#4444ff', modelType: 'cruiser', unlocked: false, level: { speed: 1, handling: 1 } },
  { id: 'b4', name: 'Superbike', price: 5000, speed: 100, handling: 80, color: '#ffff44', modelType: 'sport', unlocked: false, level: { speed: 1, handling: 1 } },
];

const initialTracks: Track[] = [
  { id: 't1', name: 'Forest Highway', envColor: '#2d4c1e', roadColor: '#333333', treeColor: '#1a3300' },
  { id: 't2', name: 'Desert Route', envColor: '#ccaa66', roadColor: '#444444', treeColor: '#8b6914' },
  { id: 't3', name: 'Snowy Peak', envColor: '#eeeeee', roadColor: '#cccccc', treeColor: '#ffffff' },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      appState: 'menu',
      setAppState: (state) => set({ appState: state }),

      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      audioEnabled: true,
      setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),

      cameraView: 'thirdPerson',
      setCameraView: (view) => set({ cameraView: view }),

      gameId: 0,
      incrementGameId: () => set((state) => ({ gameId: state.gameId + 1 })),

      money: 0,
      addMoney: (amount) => set((state) => ({ money: state.money + amount })),
      spendMoney: (amount) => {
        if (get().money >= amount) {
          set((state) => ({ money: state.money - amount }));
          return true;
        }
        return false;
      },

      bikes: initialBikes,
      currentBikeId: 'b1',
      unlockBike: (id) => set((state) => ({
        bikes: state.bikes.map(b => b.id === id ? { ...b, unlocked: true } : b)
      })),
      setCurrentBike: (id) => set({ currentBikeId: id }),
      upgradeBike: (id, type) => set((state) => {
        const cost = 200; // Simplified flat cost for now
        if (state.money >= cost) {
          return {
            money: state.money - cost,
            bikes: state.bikes.map(b => {
              if (b.id === id) {
                return {
                  ...b,
                  [type]: b[type] + 5,
                  level: { ...b.level, [type]: b.level[type] + 1 }
                };
              }
              return b;
            })
          };
        }
        return state;
      }),

      tracks: initialTracks,
      currentTrackId: 't1',
      setCurrentTrack: (id) => set({ currentTrackId: id }),

      timeOfDay: 'day',
      setTimeOfDay: (time) => set({ timeOfDay: time }),

      score: 0,
      setScore: (score) => set({ score }),

      highScores: [],
      addHighScore: (entry) => set((state) => {
        const newScores = [...state.highScores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
        return { highScores: newScores };
      }),
    }),
    {
      name: 'moto-game-storage',
      partialize: (state) => ({
        money: state.money,
        bikes: state.bikes,
        currentBikeId: state.currentBikeId,
        highScores: state.highScores,
      }),
    }
  )
);
