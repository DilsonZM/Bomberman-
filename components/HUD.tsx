
import React from 'react';
import { PlayerStats } from '../types';

interface HUDProps {
  level: number;
  stats: PlayerStats;
  enemiesRemaining: number;
  elapsedTime: number;
  highScore: number;
  onPause: () => void;
  isPaused: boolean;
  showPause: boolean;
  shieldEndTime: number;
  shieldMaxDuration: number;
}

const HUD: React.FC<HUDProps> = ({ level, stats, enemiesRemaining, elapsedTime, highScore, onPause, isPaused, showPause, shieldEndTime, shieldMaxDuration }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labelBase = "text-zinc-500 text-[6px] font-black uppercase tracking-widest mb-0.5";
  
  const now = Date.now();
  const timeLeft = Math.max(0, shieldEndTime - now);
  const percentage = shieldMaxDuration > 0 ? (timeLeft / shieldMaxDuration) * 100 : 0;
  const isShieldActive = timeLeft > 0;
  const isLow = percentage < 25;

  const MAX_SEGMENTS = 6;
  const bombsVisual = Math.min(MAX_SEGMENTS, stats.maxBombs);
  const rangeVisual = Math.min(MAX_SEGMENTS, stats.range);
  const speedItemsTaken = Math.floor((180 - stats.speed) / 15); 
  const speedVisual = Math.min(MAX_SEGMENTS, speedItemsTaken + 1);
  const livesVisual = Math.min(MAX_SEGMENTS, stats.lives);
  const radarVisual = Math.min(MAX_SEGMENTS, stats.dangerSensorUses);

  const StatRow = ({ icon, value, max, color, glow, label }: { icon: string, value: number, max: number, color: string, glow: string, label?: string }) => (
    <div className="flex flex-col w-full">
      {label && <span className={labelBase}>{label}</span>}
      <div className="flex items-center gap-2 h-3">
        <div className="text-[10px] w-3 flex justify-center filter drop-shadow-md z-10">{icon}</div>
        <div className="flex gap-[2px] h-2 flex-1">
          {Array.from({ length: max }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-[1px] transition-all duration-300 ${
                i < value 
                  ? `${color} ${glow}` 
                  : 'bg-zinc-800/40 border border-white/5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-white/10 flex flex-col gap-1 p-2 pb-3 shadow-2xl z-[100] relative select-none">
      
      {/* --- FILA SUPERIOR: META-DATA & TIEMPO --- */}
      <div className="grid grid-cols-3 items-center w-full px-1 mb-2">
        
        {/* IZQUIERDA: SECTOR Y SCORE */}
        <div className="flex gap-4 items-center">
          <div className="flex flex-col relative pl-2">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
             <span className="text-[9px] font-black text-indigo-300 tracking-[0.2em] leading-none mb-0.5">SECTOR</span>
             <span className="text-2xl font-game italic text-white drop-shadow-[0_0_10px_rgba(99,102,241,0.8)] leading-none">
               0{level}
             </span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className={labelBase}>SCORE</span>
            <span className="text-xs font-digital text-indigo-100">{stats.score.toLocaleString()}</span>
          </div>
        </div>

        {/* CENTRO: RELOJ RETRO MODERNO */}
        <div className="flex justify-center -mt-1">
          <div className="relative bg-black rounded border-2 border-zinc-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] px-4 py-1 flex flex-col items-center">
             <span className="absolute -top-2 bg-zinc-900 px-1 text-[7px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-700 rounded-sm">TIMER</span>
             <span className={`text-2xl font-digital tracking-widest drop-shadow-[0_0_8px_currentColor] ${elapsedTime > 300 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
              {formatTime(elapsedTime)}
            </span>
            {/* Scanlines decorativas */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
          </div>
        </div>

        {/* DERECHA: ENEMIGOS */}
        <div className="flex items-center justify-end gap-3">
          <div className="flex flex-col items-end">
             <span className="text-[8px] text-rose-500 font-black uppercase tracking-wider">HOSTILES</span>
             <div className="flex items-baseline gap-1">
               <span className="text-2xl font-game text-rose-500 leading-none drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                 {enemiesRemaining}
               </span>
               <span className="text-[8px] text-rose-800 font-bold">LEFT</span>
             </div>
          </div>
          
          {showPause && (
            <button 
              onClick={onPause}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg active:scale-95 transition-all shadow-lg"
            >
              {isPaused ? (
                <svg className="w-4 h-4 fill-emerald-400" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* --- FILA INFERIOR: ÍTEMS --- */}
      <div className="relative w-full bg-zinc-900/80 rounded border border-white/5 flex flex-col py-2 px-3 gap-2 overflow-hidden shadow-inner">
        {/* Barra Escudo */}
        {isShieldActive && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-zinc-800/50 z-0">
             <div 
               className={`h-full transition-all duration-200 ease-linear shadow-[0_0_10px_currentColor] ${isLow ? 'bg-red-500 animate-pulse' : 'bg-sky-500'}`}
               style={{ width: `${percentage}%` }}
             />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-2">
           <StatRow icon="❤️" value={livesVisual} max={MAX_SEGMENTS} color="bg-fuchsia-500" glow="shadow-[0_0_6px_rgba(217,70,239,0.8)]" label="VITAL SYSTEM" />
           <StatRow icon="📡" value={radarVisual} max={MAX_SEGMENTS} color="bg-amber-500" glow="shadow-[0_0_6px_rgba(245,158,11,0.8)]" label="SENSOR ARRAY" />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-0.5">
           <StatRow icon="💣" value={bombsVisual} max={MAX_SEGMENTS} color="bg-rose-500" glow="shadow-[0_0_5px_rgba(244,63,94,0.8)]" />
           <StatRow icon="🔥" value={rangeVisual} max={MAX_SEGMENTS} color="bg-blue-500" glow="shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
           <StatRow icon="⚡" value={speedVisual} max={MAX_SEGMENTS} color="bg-emerald-500" glow="shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
    </div>
  );
};

export default HUD;
