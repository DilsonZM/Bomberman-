
import { CellType, Position, Enemy } from '../types';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants';

// Configuración específica por nivel
const LEVEL_CONFIGS: any = {
  // MUNDO 1: NEO-TERRA
  1: { brickChance: 0.15, enemies: 1, types: ['blob'], speed: 1000 }, 
  2: { brickChance: 0.25, enemies: 3, types: ['blob'], speed: 900 },
  3: { brickChance: 0.35, enemies: 4, types: ['blob', 'bat'], speed: 850 },
  4: { brickChance: 0.45, enemies: 5, types: ['bat'], speed: 800 },
  5: { brickChance: 0.30, enemies: 4, types: ['boss', 'blob', 'blob', 'bat'], speed: 600 }, // Jefe + Minions

  // MUNDO 2: CRYOSTATION
  6: { brickChance: 0.30, enemies: 3, types: ['slider'], speed: 850, ice: true }, 
  7: { brickChance: 0.40, enemies: 4, types: ['slider', 'bat'], speed: 750, ice: true },
  8: { brickChance: 0.40, enemies: 5, types: ['blob', 'slider'], speed: 700, ice: true },
  9: { brickChance: 0.50, enemies: 6, types: ['bat', 'slider'], speed: 600, ice: true },
  10: { brickChance: 0.30, enemies: 5, types: ['boss', 'slider', 'slider', 'bat'], speed: 500, ice: true }, // Jefe + Minions

  // MUNDO 3: PYROCORE
  11: { brickChance: 0.30, enemies: 4, types: ['blob', 'ghost'], speed: 800, lava: true }, 
  12: { brickChance: 0.35, enemies: 5, types: ['bat', 'ghost'], speed: 750, lava: true },
  13: { brickChance: 0.20, enemies: 5, types: ['ghost'], speed: 850, lava: true }, 
  14: { brickChance: 0.15, enemies: 7, types: ['blob', 'bat', 'ghost'], speed: 650, lava: true }, 
  15: { brickChance: 0.20, enemies: 6, types: ['boss', 'ghost', 'ghost', 'bat'], speed: 600, lava: true }, // Jefe + Minions

  // MUNDO 4: MECHAPRIME
  16: { brickChance: 0.60, enemies: 4, types: ['mecha'], speed: 800 }, 
  17: { brickChance: 0.50, enemies: 5, types: ['mecha', 'slider'], speed: 700 },
  18: { brickChance: 0.60, enemies: 6, types: ['ghost', 'mecha'], speed: 600, key: true }, 
  19: { brickChance: 0.70, enemies: 7, types: ['mecha'], speed: 500 }, 
  20: { brickChance: 0.40, enemies: 6, types: ['boss', 'mecha', 'mecha', 'mecha'], speed: 450 }, // Jefe + Minions

  // MUNDO 5: NEXUS
  21: { brickChance: 0.40, enemies: 6, types: ['blob', 'slider', 'bat', 'mecha'], speed: 600 }, 
  22: { brickChance: 0.70, enemies: 8, types: ['bat', 'ghost'], speed: 300 }, 
  23: { brickChance: 0.10, enemies: 6, types: ['ghost'], speed: 500, void: true }, 
  24: { brickChance: 0.30, enemies: 10, types: ['mecha', 'slider', 'ghost'], speed: 500 }, // Horda masiva
  25: { brickChance: 0.20, enemies: 8, types: ['boss', 'ghost', 'mecha', 'slider'], speed: 250 } // Jefe final + caos
};

export const generateMap = (level: number) => {
  const config = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[25];
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
          const rand = Math.random();
          if (rand < config.brickChance) {
            row.push(CellType.BRICK);
          } else {
            if (config.ice && Math.random() < 0.4) row.push(CellType.ICE);
            else if (config.lava && Math.random() < 0.3) row.push(CellType.LAVA);
            else row.push(CellType.EMPTY);
          }
        }
      }
    }
    map.push(row);
  }

  let exitPos: Position = { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
  const bricks: Position[] = [];
  map.forEach((row, y) => row.forEach((cell, x) => {
    if (cell === CellType.BRICK) bricks.push({ x, y });
  }));

  if (level === 1) {
    map[GRID_HEIGHT - 2][GRID_WIDTH - 2] = CellType.EXIT;
    exitPos = { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
  } else if (bricks.length > 0) {
    const exitIndex = Math.floor(Math.random() * bricks.length);
    exitPos = bricks[exitIndex];
    
    if (config.key) {
      let keyIndex = Math.floor(Math.random() * bricks.length);
      while (keyIndex === exitIndex && bricks.length > 1) {
        keyIndex = Math.floor(Math.random() * bricks.length);
      }
    }
  }

  return { map, exitPos };
};

export const generateEnemies = (level: number, map: CellType[][]): Enemy[] => {
  const config = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[25];
  const enemies: Enemy[] = [];
  const emptyCells: Position[] = [];
  
  map.forEach((row, y) => row.forEach((cell, x) => {
    // Spawnear enemigos un poco más lejos para evitar muertes instantáneas
    if ((cell === CellType.EMPTY || cell === CellType.ICE) && (x > 4 || y > 4)) {
      emptyCells.push({ x, y });
    }
  }));

  // Asegurar spawn aunque haya pocas celdas (fallback)
  if (emptyCells.length < config.enemies) {
     map.forEach((row, y) => row.forEach((cell, x) => {
      if ((cell === CellType.EMPTY) && (x > 2 || y > 2) && !emptyCells.some(e => e.x === x && e.y === y)) {
        emptyCells.push({ x, y });
      }
    }));
  }

  for (let i = 0; i < config.enemies && emptyCells.length > 0; i++) {
    const idx = Math.floor(Math.random() * emptyCells.length);
    const pos = emptyCells.splice(idx, 1)[0];
    
    let type = config.types[i % config.types.length];
    
    if (config.types.includes('boss') && i === 0) type = 'boss';

    enemies.push({
      id: `en-${Date.now()}-${i}`,
      x: pos.x,
      y: pos.y,
      prevX: pos.x, // Init
      prevY: pos.y, // Init
      type: type,
      canPassBricks: type === 'ghost' || type === 'boss',
      speed: config.speed + (Math.random() * 100),
      lastMove: Date.now() + (Math.random() * 500)
    });
  }

  return enemies;
};
