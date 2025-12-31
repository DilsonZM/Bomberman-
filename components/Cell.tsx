
import React from 'react';
import { CellType } from '../types';
import { COLORS, CELL_SIZE } from '../constants';

interface CellProps {
  type: CellType;
}

const Cell: React.FC<CellProps> = ({ type }) => {
  const colorClass = COLORS[type] || 'bg-transparent';

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
      case CellType.POWERUP_RANGE: 
        return <div className="animate-bounce text-2xl drop-shadow-lg">🔥</div>;
      case CellType.POWERUP_BOMBS: 
        return <div className="animate-bounce text-2xl drop-shadow-lg">💣</div>;
      case CellType.POWERUP_SPEED: 
        return <div className="animate-bounce text-2xl drop-shadow-lg">⚡</div>;
      case CellType.POWERUP_LIFE: 
        return <div className="animate-pulse text-2xl drop-shadow-lg">❤️</div>;
      case CellType.POWERUP_DANGER: 
        return <div className="animate-pulse text-2xl drop-shadow-lg">📡</div>;
      case CellType.EXIT: 
        return (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="text-[10px] font-black text-white leading-tight">GALAXY</div>
            <div className="w-4 h-4 rounded-full bg-white/50 blur-sm"></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 ${colorClass}`}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
    >
      {renderContent()}
    </div>
  );
};

export default React.memo(Cell);
