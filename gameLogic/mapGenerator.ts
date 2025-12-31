
import { CellType, Position } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants';

export const generateMap = (level: number) => {
  const map: CellType[][] = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (x === 0 || x === GRID_WIDTH - 1 || y === 0 || y === GRID_HEIGHT - 1) {
        row.push(CellType.WALL);
      } 
      else if (x % 2 === 0 && y % 2 === 0) {
        row.push(CellType.WALL);
      } 
      else {
        if ((x <= 2 && y <= 1) || (x <= 1 && y <= 2)) {
          row.push(CellType.EMPTY);
        } else {
          const brickChance = 0.6 + (level * 0.05);
          row.push(Math.random() < brickChance ? CellType.BRICK : CellType.EMPTY);
        }
      }
    }
    map.push(row);
  }

  const bricks: Position[] = [];
  map.forEach((row, y) => row.forEach((cell, x) => {
    if (cell === CellType.BRICK) bricks.push({ x, y });
  }));
  
  if (bricks.length > 0) {
    const exitPos = bricks[Math.floor(Math.random() * bricks.length)];
    return { map, exitPos };
  }

  return { map, exitPos: { x: 1, y: 1 } };
};

export const generateEnemies = (level: number, map: CellType[][]) => {
  const count = 2 + level;
  const enemies = [];
  const emptyCells: Position[] = [];

  map.forEach((row, y) => row.forEach((cell, x) => {
    if (cell === CellType.EMPTY && (x > 4 || y > 4)) {
      emptyCells.push({ x, y });
    }
  }));

  for (let i = 0; i < count && emptyCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * emptyCells.length);
    const pos = emptyCells.splice(idx, 1)[0];
    enemies.push({
      id: `enemy-${Date.now()}-${i}`,
      x: pos.x,
      y: pos.y,
      type: 'basic' as const,
      lastMove: Date.now()
    });
  }

  return enemies;
};
