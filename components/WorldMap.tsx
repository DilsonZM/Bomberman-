
import React, { useState, useEffect, useRef } from 'react';

const PLANETS = [
  { id: 1, name: 'NEO-TERRA', color: 'text-indigo-400', glow: 'shadow-indigo-500', bg: 'from-indigo-900/40 to-blue-900/40' },
  { id: 2, name: 'CRYOSTATION', color: 'text-cyan-400', glow: 'shadow-cyan-500', bg: 'from-cyan-900/40 to-slate-900/40' },
  { id: 3, name: 'PYROCORE', color: 'text-orange-400', glow: 'shadow-orange-500', bg: 'from-orange-900/40 to-red-900/40' },
  { id: 4, name: 'MECHAPRIME', color: 'text-zinc-400', glow: 'shadow-zinc-500', bg: 'from-zinc-800/40 to-zinc-900/40' },
  { id: 5, name: 'NEXUS', color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500', bg: 'from-purple-900/40 to-black/40' }
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
  const [scrollTop, setScrollTop] = useState(0);
  const currentLevelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Scroll automático al nivel actual
    setTimeout(() => {
      if (currentLevelRef.current) {
        currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  }, []);

  const handleDevClick = () => {
    setDevModeActive(true);
    onUnlockAll();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Fondo Táctico Dinámico (Reactivo al Scroll)
  const TacticalBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
      {/* 1. Grid de fondo */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `perspective(1000px) rotateX(20deg) translateY(${scrollTop * 0.1}px)`, // Grid se mueve ligeramente
        }}
      />

      {/* 2. Geometría Morpher Reactiva */}
      {/* Figura 1: Cian - Rota y cambia de redondez */}
      <div 
        className="absolute top-1/2 left-1/2 w-[90vw] h-[90vw] border border-cyan-500/10 transition-transform duration-75 ease-linear will-change-transform"
        style={{
          transform: `translate(-50%, -50%) rotate(${scrollTop * 0.15}deg) scale(${1 + Math.sin(scrollTop * 0.002) * 0.2})`,
          borderRadius: `${40 + Math.sin(scrollTop * 0.005) * 20}%` // Cambia de forma con el scroll
        }}
      />
      
      {/* Figura 2: Púrpura - Rota al revés y parpadea forma */}
      <div 
        className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] border border-purple-500/10 transition-transform duration-75 ease-linear will-change-transform"
        style={{
          transform: `translate(-50%, -50%) rotate(${-scrollTop * 0.2}deg)`,
          borderRadius: `${50 + Math.cos(scrollTop * 0.008) * 30}%` // Morphing más agresivo
        }}
      />

      {/* Figura 3: Núcleo Central */}
      <div 
         className="absolute top-1/2 left-1/2 w-[30vw] h-[30vw] border-2 border-dashed border-white/5 rounded-full transition-all duration-75"
         style={{
           transform: `translate(-50%, -50%) rotate(${scrollTop * 0.05}deg) scale(${0.8 + scrollTop * 0.0005})`
         }}
      />

      {/* 3. Scanlines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-40 pointer-events-none" />
      
      {/* 4. Viñeta */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] opacity-90" />
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden flex flex-col items-center pb-24 scroll-smooth"
      onScroll={handleScroll}
    >
      <TacticalBackground />

      <div className="w-full max-w-md relative min-h-screen pt-20 z-10">
        
        {/* Header Flotante */}
        <div className="fixed top-0 left-0 right-0 z-[110] bg-black/80 backdrop-blur-xl border-b border-white/10 p-4 flex justify-between items-center shadow-2xl max-w-md mx-auto">
          <div className="flex flex-col">
            <h2 className="font-game text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
              GALAXY MAP
            </h2>
            <button 
              onClick={handleDevClick}
              className="text-[9px] text-zinc-500 hover:text-cyan-400 font-digital tracking-widest uppercase text-left transition-colors"
            >
              {devModeActive || unlockedLevel >= 25 ? "⚡ DEBUG ACCESS GRANTED" : "🔒 SECURE CONNECTION"}
            </button>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest mb-0.5">HIGH SCORE</span>
             <div className="px-3 py-1 bg-purple-900/20 border border-purple-500/30 rounded font-digital text-cyan-300 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
               {highScore.toLocaleString()}
             </div>
          </div>
        </div>

        {/* Lista de Niveles */}
        <div className="relative flex flex-col items-center gap-10 py-12 px-4">
          
          {allLevels.map((lvl, index) => {
            const planetIdx = Math.floor((lvl - 1) / 5);
            const planet = PLANETS[planetIdx];
            const isSubLevel5 = (lvl - 1) % 5 === 4;
            const isUnlocked = lvl <= unlockedLevel || devModeActive;
            const isCurrent = lvl === unlockedLevel && !devModeActive;
            
            // Offset sinusoidal para crear el camino en zig-zag
            const offset = Math.sin(lvl * 1.5) * 80;
            
            // Calculamos posición del siguiente nivel para dibujar línea
            const showLineToNext = index < allLevels.length - 1;
            const nextOffset = showLineToNext ? Math.sin(allLevels[index + 1] * 1.5) * 80 : 0;
            const isNextUnlocked = (lvl - 1) <= unlockedLevel || devModeActive;

            return (
              <React.Fragment key={lvl}>
                {/* Cabecera de Sector (Solo aparece cada 5 niveles) */}
                {isSubLevel5 && (
                  <div className={`w-full relative mb-8 mt-4 group`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${planet.bg} skew-y-1 transform rounded-xl blur-sm`}></div>
                    <div className="relative bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-2xl overflow-hidden">
                      <div className="absolute right-0 top-0 text-[80px] opacity-10 font-black leading-none pointer-events-none -mr-4 -mt-4 text-white">
                        {planet.id}
                      </div>
                      <div className="z-10">
                        <div className={`text-[10px] font-digital tracking-[0.4em] uppercase ${planet.color} mb-1`}>SECTOR {planet.id}</div>
                        <div className="text-2xl font-game text-white italic drop-shadow-md">{planet.name}</div>
                      </div>
                      <div className="h-10 w-10 border border-white/20 rounded-full flex items-center justify-center bg-white/5 z-10">
                        {isUnlocked ? '📡' : '🔒'}
                      </div>
                      
                      {/* Barra de progreso decorativa */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div className={`h-full bg-current ${planet.color} w-2/3 shadow-[0_0_10px_currentColor]`}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative z-10" style={{ transform: `translateX(${offset}px)` }}>
                  {/* Línea de conexión al siguiente nodo */}
                  {showLineToNext && (
                    <div 
                       className={`absolute top-10 left-1/2 w-0.5 h-28 origin-top -z-10 transition-colors duration-500
                         ${isUnlocked && isNextUnlocked ? 'bg-cyan-500 shadow-[0_0_8px_cyan]' : 'bg-zinc-800'}`}
                       style={{ 
                         height: '100px', // Distancia fija aproximada
                         transform: `rotate(${ (offset - nextOffset) > 0 ? '20deg' : '-20deg' }) scaleY(1.2)`
                       }}
                    ></div>
                  )}

                  {/* Botón de Nivel - LÓGICA DE ESTILO MEJORADA */}
                  <button
                    ref={isCurrent ? currentLevelRef : null}
                    onClick={() => isUnlocked && onSelectLevel(lvl)}
                    className={`
                      relative w-16 h-16 rounded-lg rotate-45 flex items-center justify-center border-2 transition-all duration-300 overflow-hidden
                      ${isCurrent 
                        ? 'bg-indigo-600 border-white scale-125 shadow-[0_0_40px_rgba(79,70,229,0.8)] z-30 animate-pulse-slow' 
                        : isUnlocked 
                          ? 'bg-zinc-900 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-cyan-300 hover:scale-110 hover:shadow-[0_0_25px_cyan]' 
                          : 'bg-[#080808] border-red-900/20 shadow-none cursor-not-allowed opacity-90'}
                    `}
                  >
                    {/* Contenido enderezado (-rotate-45) */}
                    <div className="-rotate-45 flex flex-col items-center justify-center w-full h-full relative z-10">
                       
                       {/* CONTENIDO DESBLOQUEADO */}
                       {isUnlocked && (
                         <>
                           {isCurrent && (
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white text-black text-[8px] font-bold rounded-full animate-bounce">
                               START
                             </div>
                           )}
                           <span className={`text-[8px] font-digital uppercase mb-[-2px] ${isCurrent ? 'text-white' : 'text-cyan-400'}`}>
                             LVL
                           </span>
                           <span className={`font-game text-xl leading-none ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                             {lvl}
                           </span>
                         </>
                       )}

                       {/* CONTENIDO BLOQUEADO (DISEÑO MEJORADO) */}
                       {!isUnlocked && (
                         <>
                           {/* Patrón de rayas de seguridad de fondo */}
                           <div 
                              className="absolute inset-0 opacity-20 pointer-events-none" 
                              style={{ 
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #450a0a 2px, #450a0a 4px)',
                                transform: 'rotate(45deg) scale(2)' // Contrarrestar rotación padre
                              }} 
                           />
                           
                           <div className="flex flex-col items-center opacity-50">
                             <div className="text-red-800 font-black text-lg leading-none mb-1">×</div>
                             <span className="text-[6px] text-red-900/80 font-digital tracking-widest uppercase">LOCKED</span>
                           </div>
                         </>
                       )}
                    </div>
                  </button>
                  
                  {/* Número decorativo lateral */}
                  {isUnlocked && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-20 text-[8px] font-digital text-cyan-500/30 tracking-widest whitespace-nowrap pointer-events-none">
                      COORD {lvl * 128}.{lvl * 64}
                    </div>
                  )}
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
