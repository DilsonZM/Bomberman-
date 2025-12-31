
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

export type SkinId = 'classic' | 'emerald' | 'dragon' | 'crimson' | 'gold' | 'void';

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
  { id: 'classic', name: 'Classic', color: 'bg-indigo-600', borderColor: 'border-indigo-300', glowColor: 'shadow-indigo-500/50', requiredScore: 0, ledColor: 'bg-rose-500' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600', borderColor: 'border-emerald-300', glowColor: 'shadow-emerald-500/50', requiredScore: 5000, ledColor: 'bg-emerald-400' },
  { id: 'dragon', name: 'Dragon', color: 'bg-green-800', borderColor: 'border-orange-500', glowColor: 'shadow-orange-600/50', requiredScore: 12000, emoji: '🐲', ledColor: 'bg-orange-500' },
  { id: 'crimson', name: 'Crimson', color: 'bg-rose-600', borderColor: 'border-rose-300', glowColor: 'shadow-rose-500/50', requiredScore: 25000, ledColor: 'bg-white' },
  { id: 'gold', name: 'Gold', color: 'bg-amber-500', borderColor: 'border-amber-200', glowColor: 'shadow-amber-400/50', requiredScore: 50000, ledColor: 'bg-white' },
  { id: 'void', name: 'Void', color: 'bg-zinc-950', borderColor: 'border-purple-500', glowColor: 'shadow-purple-700/80', requiredScore: 100000, emoji: '🌌', ledColor: 'bg-cyan-400' },
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
