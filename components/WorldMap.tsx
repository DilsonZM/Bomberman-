
import React, { useState, useEffect, useRef } from 'react';

const PLANETS = [
  { id: 1, name: 'NEO-TERRA', color: 'from-blue-900 to-indigo-950', icon: '🌍' },
  { id: 2, name: 'CRYOSTATION', color: 'from-cyan-900 to-blue-900', icon: '❄️' },
  { id: 3, name: 'PYROCORE', color: 'from-red-950 to-orange-950', icon: '🌋' },
  { id: 4, name: 'MECHAPRIME', color: 'from-zinc-900 to-zinc-950', icon: '🏭' },
  { id: 5, name: 'NEXUS', color: 'from-purple-950 to-black', icon: '👑' }
];

interface WorldMapProps {
  unlockedLevel: number;
  onSelectLevel: (lvl: number) => void;
  highScore: number;
  onUnlockAll: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ unlockedLevel, onSelectLevel, highScore, onUnlockAll }) => {
  const allLevels = Array.from({ length: 25 }, (_, i) => i + 1).reverse();
  const [devModeActive, setDevModeActive] = useState(false);
  const currentLevelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Auto-scroll al nivel actual con un pequeño delay para asegurar renderizado
    setTimeout(() => {
      if (currentLevelRef.current) {
        currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  const handleDevClick = () => {
    setDevModeActive(true);
    onUnlockAll();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden flex flex-col items-center pb-24 scroll-smooth">
      <div className="w-full max-w-md relative min-h-screen pt-12">
        
        {/* Header estático */}
        <div className="sticky top-0 z-[110] w-full bg-black/60 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="font-game text-xl text-indigo-400 italic">STAR SECTOR</h2>
            <button 
              onClick={handleDevClick}
              className="text-[9px] text-zinc-600 hover:text-green-500 font-bold uppercase mt-1 border border-zinc-800 px-2 py-0.5 rounded"
            >
              {devModeActive || unlockedLevel >= 25 ? "⚡ DEV: UNLOCKED" : "🔒 DEV MODE"}
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Best Score</span>
            <span className="font-game text-sm">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Decoración espacial */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full animate-pulse" 
              style={{ 
                width: Math.random() * 3, 
                height: Math.random() * 3, 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 500}%` 
              }} 
            />
          ))}
        </div>

        {/* Path vertical de niveles */}
        <div className="relative flex flex-col items-center gap-12 py-12">
          {allLevels.map((lvl) => {
            const planetIdx = Math.floor((lvl - 1) / 5);
            const planet = PLANETS[planetIdx];
            const isSubLevel5 = (lvl - 1) % 5 === 4;
            const isUnlocked = lvl <= unlockedLevel || devModeActive;
            const isCurrent = lvl === unlockedLevel && !devModeActive;
            
            // Zig-zag offset
            const offset = Math.sin(lvl * 1.5) * 60;

            return (
              <React.Fragment key={lvl}>
                {isSubLevel5 && (
                  <div className={`w-11/12 p-6 rounded-3xl bg-gradient-to-r ${planet.color} border-2 border-white/10 shadow-2xl mt-8 mb-4 relative overflow-hidden group`}>
                    <div className="absolute -right-4 -top-4 text-6xl opacity-20 group-hover:scale-125 transition-transform duration-700">{planet.icon}</div>
                    <h3 className="text-zinc-400 text-[10px] font-black tracking-[0.3em] mb-1">PLANETA 0{planet.id}</h3>
                    <div className="text-2xl font-game text-white italic drop-shadow-lg">{planet.name}</div>
                  </div>
                )}

                <div className="relative" style={{ transform: `translateX(${offset}px)` }}>
                  {lvl > 1 && (
                    <div className={`absolute top-16 left-1/2 -translate-x-1/2 w-1.5 h-12 border-l-2 border-dashed ${isUnlocked ? 'border-indigo-500/50' : 'border-zinc-800'}`} />
                  )}

                  <button
                    ref={isCurrent ? currentLevelRef : null}
                    onClick={() => isUnlocked && onSelectLevel(lvl)}
                    className={`
                      relative w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300
                      ${isCurrent ? 'bg-indigo-600 border-white scale-125 shadow-[0_0_30px_rgba(79,70,229,1)] z-10' : 
                        isUnlocked ? 'bg-zinc-800 border-indigo-400 shadow-xl active:scale-95 hover:border-white' : 
                        'bg-zinc-950 border-zinc-800 opacity-60 grayscale cursor-not-allowed'}
                    `}
                  >
                    {isCurrent && <div className="absolute -top-3 w-3 h-3 bg-white rounded-full animate-ping" />}
                    <span className={`text-[10px] font-black uppercase ${isUnlocked ? 'text-indigo-300' : 'text-zinc-600'}`}>S{lvl}</span>
                    <span className="font-game text-lg leading-none">{((lvl - 1) % 5) + 1}</span>
                    
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 fill-zinc-600" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg>
                      </div>
                    )}
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
