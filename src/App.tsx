/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGameStore } from './store';
import MainMenu from './components/MainMenu';
import Garage from './components/Garage';
import Scoreboard from './components/Scoreboard';
import GameRunner from './components/GameRunner';
import AboutScreen from './components/AboutScreen';

export default function App() {
  const appState = useGameStore((state) => state.appState);

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 text-white font-sans touch-none select-none">
      {appState === 'menu' && <MainMenu />}
      {appState === 'garage' && <Garage />}
      {appState === 'scoreboard' && <Scoreboard />}
      {appState === 'about' && <AboutScreen />}
      {(appState === 'playing' || appState === 'gameover' || appState === 'paused') && <GameRunner />}
    </div>
  );
}
