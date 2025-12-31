
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
  dangerSensorUses: 3,
  hasKey: false
};

export const WORLD_THEMES = {
  1: { // Neo-Terra
    wall: 'bg-[#2d2d35] border-[#121216]',
    brick: 'from-blue-700 to-indigo-900 border-indigo-950',
    empty: 'bg-[#1a1a1e]'
  },
  2: { // Cryostation
    wall: 'bg-slate-700 border-slate-900',
    brick: 'from-cyan-400 to-blue-600 border-blue-800',
    empty: 'bg-[#0f172a]',
    ice: 'bg-cyan-200/40 border-cyan-100 shadow-inner'
  },
  3: { // PyroCore
    wall: 'bg-zinc-800 border-black',
    brick: 'from-red-800 to-rose-950 border-black',
    empty: 'bg-[#180a0a]',
    lava: 'bg-orange-600/60 border-orange-400 animate-pulse'
  },
  4: { // MechaPrime
    wall: 'bg-zinc-700 border-zinc-900',
    brick: 'from-zinc-500 to-zinc-800 border-zinc-950',
    empty: 'bg-zinc-900'
  },
  5: { // Nexus
    wall: 'bg-purple-950 border-black',
    brick: 'from-indigo-900 to-purple-900 border-black',
    empty: 'bg-black'
  }
};

export const POWERUP_COLORS = {
  [ 'RANGE' ]: 'bg-blue-600 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  [ 'BOMBS' ]: 'bg-rose-600 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
  [ 'SPEED' ]: 'bg-emerald-600 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
  [ 'LIFE' ]: 'bg-fuchsia-600 border-fuchsia-300 shadow-[0_0_15px_rgba(192,38,211,0.5)]',
  [ 'DANGER' ]: 'bg-amber-600 border-amber-300 shadow-[0_0_15px_rgba(217,119,6,0.5)]',
  [ 'VEST' ]: 'bg-sky-600 border-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.5)]',
};
