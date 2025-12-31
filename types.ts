
export enum CellType {
  EMPTY = 'EMPTY',
  WALL = 'WALL',           // Indestructible
  BRICK = 'BRICK',         // Destructible
  EXIT = 'EXIT',           // Door to next level
  ICE = 'ICE',             // Slippery floor
  LAVA = 'LAVA',           // Dangerous floor
  KEY = 'KEY',             // Required for exit
  GATE = 'GATE',           // Locked door
  POWERUP_RANGE = 'RANGE',
  POWERUP_BOMBS = 'BOMBS',
  POWERUP_SPEED = 'SPEED',
  POWERUP_LIFE = 'LIFE',
  POWERUP_DANGER = 'DANGER',
  POWERUP_VEST = 'VEST'    // New Shield Item
}

export enum GameStatus {
  MENU = 'MENU',
  MAP = 'MAP',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  GAME_WIN = 'GAME_WIN'
}

export type SkinId = 'classic' | 'emerald' | 'dragon' | 'samurai' | 'neon' | 'void' | 'ghost';

export interface Skin {
  id: SkinId;
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  requiredScore: number;
  emoji?: string;
  ledColor: string;
}

export const SKINS: Skin[] = [
  { id: 'classic', name: 'Bomber Bot', color: 'bg-indigo-600', borderColor: 'border-indigo-300', glowColor: 'shadow-indigo-500/50', requiredScore: 0, ledColor: 'bg-rose-500' },
  { id: 'neon', name: 'Cyber Neon', color: 'bg-zinc-900', borderColor: 'border-cyan-400', glowColor: 'shadow-cyan-500/80', requiredScore: 5000, ledColor: 'bg-cyan-400' },
  { id: 'emerald', name: 'Golem', color: 'bg-emerald-600', borderColor: 'border-emerald-300', glowColor: 'shadow-emerald-500/50', requiredScore: 10000, ledColor: 'bg-emerald-400' },
  { id: 'dragon', name: 'Draco', color: 'bg-green-800', borderColor: 'border-orange-500', glowColor: 'shadow-orange-600/50', requiredScore: 20000, emoji: '🐲', ledColor: 'bg-orange-500' },
  { id: 'samurai', name: 'Ronin', color: 'bg-red-700', borderColor: 'border-amber-400', glowColor: 'shadow-red-600/50', requiredScore: 35000, ledColor: 'bg-amber-300' },
  { id: 'ghost', name: 'Specter', color: 'bg-slate-300', borderColor: 'border-slate-100', glowColor: 'shadow-white/40', requiredScore: 50000, ledColor: 'bg-purple-500' },
  { id: 'void', name: 'Singularity', color: 'bg-zinc-950', borderColor: 'border-purple-500', glowColor: 'shadow-purple-700/80', requiredScore: 100000, emoji: '🌌', ledColor: 'bg-fuchsia-400' },
];

export interface Position {
  x: number;
  y: number;
}

export interface Bomb {
  id: string;
  x: number;
  y: number;
  timer: number;
  range: number;
  ownerId: string;
  showDanger?: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  prevX?: number; // Para interpolación de hitbox
  prevY?: number; // Para interpolación de hitbox
  type: 'blob' | 'bat' | 'slider' | 'ghost' | 'mecha' | 'boss';
  canPassBricks: boolean;
  lastMove: number;
  speed: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  type: 'center' | 'vertical' | 'horizontal';
  expiresAt: number;
}

export interface PlayerStats {
  score: number;
  lives: number;
  maxBombs: number;
  range: number;
  speed: number; 
  dangerSensorUses: number;
  hasKey: boolean;
}
