
import React from 'react';
import { PlayerStats } from '../types';

interface HUDProps {
  level: number;
  stats: PlayerStats;
  enemiesRemaining: number;
  elapsedTime: number;
  highScore: number;
}

const HUD: React.FC<HUDProps> = ({ level, stats, enemiesRemaining, elapsedTime, highScore }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labelStyle = "text-zinc-500 text-[9px] font-black uppercase tracking-tighter h-3 flex items-center";

  return (
    <div className="w-full bg-zinc-900/80 backdrop-blur-2xl border-b border-white/10 flex flex-col gap-3 p-3 px-6 shadow-2xl">
      {/* Línea 1: Info General */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-start">
            <span className={labelStyle}>Sector</span>
            <div className="bg-indigo-600 px-3 py-0.5 rounded-md border border-indigo-400 mt-0.5">
              <span className="text-xl font-game leading-none">0{level}</span>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className={labelStyle}>Record</span>
            <span className="text-sm font-game text-zinc-400 mt-1">{highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className={labelStyle}>Current Score</span>
          <span className="text-2xl font-game text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mt-0.5">{stats.score.toLocaleString()}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className={labelStyle}>Targets</span>
          <span className="text-2xl font-game text-rose-500 mt-0.5">{enemiesRemaining}</span>
        </div>
      </div>

      {/* Línea 2: Stats de Juego */}
      <div className="flex justify-between items-center bg-black/30 rounded-xl p-2 px-4 border border-white/5">
        <div className="flex flex-col items-start gap-0.5">
          <span className={labelStyle}>Energy</span>
          <div className="flex gap-1 h-5 items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-2.5 h-4 rounded-[2px] border ${i < stats.lives ? 'bg-rose-500 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-white/5 border-white/10'}`}></div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className={labelStyle}>Clock</span>
            <span className="text-lg font-game text-cyan-400 font-mono tracking-tighter mt-0.5">{formatTime(elapsedTime)}</span>
          </div>
          
          <div className="w-px h-8 bg-white/10 self-center"></div>
          
          <div className="flex flex-col items-center min-w-[70px]">
            <span className={labelStyle}>Radar Units</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < (stats.dangerSensorUses % 6) ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]' : 'bg-white/10'}`}></div>
                ))}
              </div>
              {stats.dangerSensorUses > 5 && (
                <span className="text-[11px] font-black text-amber-500 font-game">x{Math.floor(stats.dangerSensorUses/5) + 1}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
