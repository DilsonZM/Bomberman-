
import React from 'react';
import Game from './Game';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Game />
      <div className="mt-8 text-zinc-500 text-sm flex flex-col items-center gap-2">
        <p>Use <b>WASD</b> or <b>Arrows</b> to move. Press <b>Space</b> to plant bombs.</p>
        <p>Clear all enemies to reveal the exit door!</p>
      </div>
    </div>
  );
};

export default App;
