
import React from 'react';
import { CellType } from '../types';
import { CELL_SIZE, WORLD_THEMES, POWERUP_COLORS } from '../constants';

interface CellProps {
  type: CellType;
  world?: number;
}

const Cell: React.FC<CellProps> = ({ type, world = 1 }) => {
  const theme = WORLD_THEMES[world as keyof typeof WORLD_THEMES] || WORLD_THEMES[1];
  
  const getBaseClass = () => {
    switch (type) {
      case CellType.WALL: return `${theme.wall} border-b-[6px] border-r-[6px] shadow-xl rounded-sm`;
      case CellType.BRICK: return `bg-gradient-to-br ${theme.brick} border-2 shadow-lg rounded-md`;
      case CellType.EXIT: return `bg-indigo-600 border-4 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.8)] animate-pulse`;
      case CellType.ICE: return `bg-cyan-200/40 border-cyan-100 shadow-inner rounded-sm`;
      case CellType.LAVA: return `bg-orange-600/60 border-orange-400 animate-pulse rounded-sm`;
      case CellType.KEY: return `bg-yellow-400 border-2 border-yellow-200 shadow-lg rounded-full`;
      case CellType.GATE: return `bg-zinc-800 border-4 border-zinc-600 shadow-inner`;
      case CellType.EMPTY: return `${theme.empty} border-[0.5px] border-white/5 shadow-inner`;
      default: return POWERUP_COLORS[type as keyof typeof POWERUP_COLORS] || 'bg-transparent';
    }
  };

  const renderContent = () => {
    switch (type) {
      case CellType.BRICK:
        return (
          <div className="w-full h-full flex flex-col justify-around p-1 opacity-80">
            <div className="flex gap-1"><div className="h-1.5 w-full bg-black/20 rounded-full"></div><div className="h-1.5 w-1/2 bg-black/20 rounded-full"></div></div>
            <div className="flex gap-1"><div className="h-1.5 w-1/3 bg-black/20 rounded-full"></div><div className="h-1.5 w-full bg-black/20 rounded-full"></div></div>
            <div className="flex gap-1"><div className="h-1.5 w-full bg-black/20 rounded-full"></div><div className="h-1.5 w-2/3 bg-black/20 rounded-full"></div></div>
          </div>
        );
      case CellType.WALL:
        return (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
        );
      case CellType.ICE:
        return <div className="w-full h-full bg-white/10 blur-[1px]"></div>;
      case CellType.LAVA:
        return <div className="w-full h-full bg-red-500/20 blur-[2px] animate-pulse"></div>;
      case CellType.POWERUP_RANGE: return <div className="animate-bounce text-2xl drop-shadow-lg">🔥</div>;
      case CellType.POWERUP_BOMBS: return <div className="animate-bounce text-2xl drop-shadow-lg">💣</div>;
      case CellType.POWERUP_SPEED: return <div className="animate-bounce text-2xl drop-shadow-lg">⚡</div>;
      case CellType.POWERUP_LIFE: return <div className="animate-pulse text-2xl drop-shadow-lg">❤️</div>;
      case CellType.POWERUP_DANGER: return <div className="animate-pulse text-2xl drop-shadow-lg">📡</div>;
      case CellType.POWERUP_VEST: return <div className="animate-pulse text-2xl drop-shadow-lg">🛡️</div>;
      case CellType.KEY: return <div className="animate-bounce text-2xl drop-shadow-lg">🔑</div>;
      case CellType.EXIT: 
        return (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-[10px] font-black text-white leading-tight">CORE</div>
            <div className="w-4 h-4 rounded-full bg-white/50 blur-sm"></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 ${getBaseClass()}`}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    >
      {renderContent()}
    </div>
  );
};

export default React.memo(Cell);
