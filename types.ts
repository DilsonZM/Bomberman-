
export enum CellType {
  EMPTY = 'EMPTY',
  WALL = 'WALL',           // Indestructible
  BRICK = 'BRICK',         // Destructible
  EXIT = 'EXIT',           // Door to next level
  POWERUP_RANGE = 'RANGE',
  POWERUP_BOMBS = 'BOMBS',
  POWERUP_SPEED = 'SPEED',
  POWERUP_LIFE = 'LIFE',
  POWERUP_DANGER = 'DANGER' // New: Danger Radar item
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  GAME_WIN = 'GAME_WIN'
}

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
  showDanger?: boolean; // If this specific bomb should highlight its range
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  type: 'basic' | 'fast' | 'smart';
  lastMove: number;
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
  dangerSensorUses: number; // New: counts how many bombs will show danger range
}
