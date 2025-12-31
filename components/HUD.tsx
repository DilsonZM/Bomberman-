
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
}

const HUD: React.FC<HUDProps> = ({ level, stats, enemiesRemaining, elapsedTime, highScore, onPause, isPaused, showPause }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const labelBase = "text-zinc-500 text-[9px] font-black uppercase tracking-widest h-5 flex items-center";
  
  return (
    <div className="w-full bg-zinc-900/95 backdrop-blur-3xl border-b border-white/10 flex flex-col gap-3 p-4 px-6 shadow-2xl z-[100]">
      
      <div className="flex justify-between items-start">
        <div className="flex gap-8">
          <div className="flex flex-col items-start">
            <div className={labelBase}>Sector</div>
            <div className="h-9 flex items-center mt-0.5">
              <div className="bg-indigo-600 px-3 py-1 rounded border border-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                <span className="text-xl font-game text-white leading-none">0{level}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-start">
            <div className={labelBase}>Hi-Score</div>
            <div className="h-9 flex items-center mt-0.5">
              <span className="text-base font-game text-zinc-400 tracking-wider">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={labelBase}>Current Score</div>
          <div className="h-9 flex items-center mt-0.5">
            <span className="text-3xl font-game text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] tracking-tighter">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex flex-col items-end">
            <div className={labelBase}>Targets</div>
            <div className="h-9 flex items-center mt-0.5">
              <span className="text-3xl font-game text-rose-500 tracking-tighter">{enemiesRemaining}</span>
            </div>
          </div>
          
          {showPause && (
            <button 
              onClick={onPause}
              className="mt-5 p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg transition-colors active:scale-95"
            >
              {isPaused ? (
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 bg-black/50 rounded-2xl p-3 px-6 border border-white/5 items-center">
        <div className="flex flex-col items-start">
          <div className={labelBase}>Energy</div>
          <div className="h-10 flex items-center mt-1">
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-7 rounded-sm border ${
                    i < stats.lives 
                      ? 'bg-rose-500 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse' 
                      : 'bg-white/5 border-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center border-x border-white/10 px-4">
          <div className={labelBase}>Clock</div>
          <div className="h-10 flex items-center mt-1">
            <span className="text-2xl font-game text-cyan-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className={labelBase}>Radar</div>
          <div className="h-10 flex items-center mt-1 gap-3">
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full border border-white/10 ${
                    i < (stats.dangerSensorUses % 6) 
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                      : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
            {stats.dangerSensorUses > 5 && (
              <span className="text-[10px] font-black text-amber-500 font-game italic">
                x{Math.floor(stats.dangerSensorUses / 5) + 1}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
