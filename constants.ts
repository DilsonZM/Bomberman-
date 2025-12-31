
export const GRID_WIDTH = 15;
export const GRID_HEIGHT = 11;
export const CELL_SIZE = 48; // px

export const BOMB_DURATION = 2500; // ms
export const EXPLOSION_DURATION = 600; // ms
export const INITIAL_PLAYER_STATS = {
  score: 0,
  lives: 3,
  maxBombs: 1,
  range: 1,
  speed: 180,
  dangerSensorUses: 3 // Start with 3 radar uses
};

export const COLORS = {
  [ 'EMPTY' ]: 'bg-[#1a1a1e] border-[0.5px] border-white/5 shadow-inner',
  [ 'WALL' ]: 'bg-[#2d2d35] border-b-[6px] border-r-[6px] border-[#121216] shadow-xl rounded-sm',
  [ 'BRICK' ]: 'bg-gradient-to-br from-orange-700 to-orange-900 border-2 border-orange-950 shadow-lg rounded-md',
  [ 'EXIT' ]: 'bg-indigo-600 border-4 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.8)] animate-pulse',
  [ 'RANGE' ]: 'bg-blue-600 rounded-xl flex items-center justify-center border-2 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  [ 'BOMBS' ]: 'bg-rose-600 rounded-xl flex items-center justify-center border-2 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
  [ 'SPEED' ]: 'bg-emerald-600 rounded-xl flex items-center justify-center border-2 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  [ 'LIFE' ]: 'bg-fuchsia-600 rounded-xl flex items-center justify-center border-2 border-fuchsia-300 shadow-[0_0_15px_rgba(192,38,211,0.5)]',
  [ 'DANGER' ]: 'bg-amber-600 rounded-xl flex items-center justify-center border-2 border-amber-300 shadow-[0_0_15px_rgba(217,119,6,0.5)]',
};
