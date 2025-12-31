
import React from 'react';
import { PlayerStats } from '../types';

interface HUDProps {
  level: number;
  stats: PlayerStats;
  enemiesRemaining: number;
}

const HUD: React.FC<HUDProps> = ({ level, stats, enemiesRemaining }) => {
  return (
    <div className="flex flex-nowrap justify-between items-center bg-white/5 backdrop-blur-xl p-4 border-b border-white/10 w-full px-6 md:px-12">
      <div className="flex gap-8 items-baseline">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Sector</span>
          <span className="text-3xl font-game text-indigo-400">0{level}</span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Points</span>
          <span className="text-2xl font-game text-white">{stats.score.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-10 items-center">
        <div className="flex flex-col items-center">
           <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Energy</span>
           <div className="flex gap-1.5">
             {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className={`w-3 h-5 rounded-sm border ${i < stats.lives ? 'bg-rose-500 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-white/5 border-white/10'}`}></div>
             ))}
           </div>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Radar</span>
          <span className={`text-2xl font-game ${stats.dangerSensorUses > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
            {stats.dangerSensorUses}
          </span>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Targets</span>
          <span className="text-3xl font-game text-rose-500">{enemiesRemaining}</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;
