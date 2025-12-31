
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  CellType, 
  GameStatus, 
  Position, 
  Bomb, 
  Enemy, 
  Explosion, 
  PlayerStats 
} from './types';
import { 
  GRID_WIDTH, 
  GRID_HEIGHT, 
  CELL_SIZE, 
  BOMB_DURATION, 
  EXPLOSION_DURATION, 
  INITIAL_PLAYER_STATS 
} from './constants';
import { generateMap, generateEnemies } from './gameLogic/mapGenerator';
import { soundSystem } from './utils/SoundSystem';
import Cell from './components/Cell';
import HUD from './components/HUD';
import TouchControls from './components/TouchControls';

const Game: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [level, setLevel] = useState(1);
  const [map, setMap] = useState<CellType[][]>([]);
  const [hiddenExit, setHiddenExit] = useState<Position | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [playerFacing, setPlayerFacing] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [dyingEnemies, setDyingEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [scale, setScale] = useState(0.8);
  const [activeTouchDir, setActiveTouchDir] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [shake, setShake] = useState(false);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const mapRef = useRef(map);
  const enemiesRef = useRef(enemies);
  const playerPosRef = useRef(playerPos);
  const bombsRef = useRef(bombs);
  const statusRef = useRef(status);
  const playerStatsRef = useRef(playerStats);
  const lastMoveTimeRef = useRef(0);
  const isDyingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('bomberman_high_score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (playerStats.score > highScore) {
      setHighScore(playerStats.score);
      localStorage.setItem('bomberman_high_score', playerStats.score.toString());
    }
  }, [playerStats.score, highScore]);

  useEffect(() => {
    let timer: number;
    if (status === GameStatus.PLAYING) {
      timer = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => { mapRef.current = map; }, [map]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { bombsRef.current = bombs; }, [bombs]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { playerStatsRef.current = playerStats; }, [playerStats]);
  useEffect(() => { isDyingRef.current = isDying; }, [isDying]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const boardWidth = GRID_WIDTH * CELL_SIZE + 32;
      const boardHeight = GRID_HEIGHT * CELL_SIZE + 32;
      const availableHeight = screenHeight * 0.4; 
      const newScale = Math.min(1.0, (screenWidth - 20) / boardWidth, availableHeight / boardHeight);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlayerDeath = useCallback(() => {
    if (isDyingRef.current) return;
    setIsDying(true);
    soundSystem.playDeath();
    
    setTimeout(() => {
      setPlayerStats(s => {
        const nextLives = s.lives - 1;
        if (nextLives <= 0) setStatus(GameStatus.GAME_OVER);
        return { ...s, lives: nextLives };
      });
      setPlayerPos({ x: 1, y: 1 });
      setIsDying(false);
    }, 800);
  }, []);

  const triggerExplosion = useCallback((bomb: Bomb) => {
    soundSystem.playExplosion();
    setShake(true);
    setTimeout(() => setShake(false), 200);

    const now = Date.now();
    const newExplosions: Explosion[] = [{
      id: `exp-${now}-${bomb.id}-center`,
      x: bomb.x, y: bomb.y,
      type: 'center',
      expiresAt: now + EXPLOSION_DURATION
    }];
    
    const directions = [
      { dx: 0, dy: -1, type: 'vertical' }, 
      { dx: 0, dy: 1, type: 'vertical' }, 
      { dx: -1, dy: 0, type: 'horizontal' }, 
      { dx: 1, dy: 0, type: 'horizontal' }
    ];
    
    const updatedMap = [...mapRef.current.map(row => [...row])];
    let scoreGained = 0;
    const bombsToTrigger: string[] = [];

    directions.forEach(({ dx, dy, type }) => {
      for (let r = 1; r <= bomb.range; r++) {
        const nx = bomb.x + dx * r;
        const ny = bomb.y + dy * r;
        if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) break;
        
        const cell = updatedMap[ny][nx];
        if (cell === CellType.WALL) break;
        
        newExplosions.push({ 
          id: `exp-${now}-${bomb.id}-${nx}-${ny}`, 
          x: nx, y: ny, 
          type: type as any, 
          expiresAt: now + EXPLOSION_DURATION 
        });

        const hitBomb = bombsRef.current.find(b => b.x === nx && b.y === ny);
        if (hitBomb && hitBomb.id !== bomb.id) {
          bombsToTrigger.push(hitBomb.id);
        }

        if (cell === CellType.BRICK) {
          if (hiddenExit?.x === nx && hiddenExit?.y === ny) {
            updatedMap[ny][nx] = CellType.EXIT;
          } else {
            const rand = Math.random();
            if (rand < 0.10) updatedMap[ny][nx] = CellType.POWERUP_BOMBS;
            else if (rand < 0.20) updatedMap[ny][nx] = CellType.POWERUP_RANGE;
            else if (rand < 0.25) updatedMap[ny][nx] = CellType.POWERUP_SPEED;
            else if (rand < 0.30) updatedMap[ny][nx] = CellType.POWERUP_DANGER;
            else if (rand < 0.32) updatedMap[ny][nx] = CellType.POWERUP_LIFE;
            else updatedMap[ny][nx] = CellType.EMPTY;
          }
          scoreGained += 25;
          break;
        }
      }
    });

    setExplosions(prev => [...prev, ...newExplosions]);
    setMap(updatedMap);
    setPlayerStats(s => ({ ...s, score: s.score + scoreGained }));
    
    if (newExplosions.some(e => e.x === playerPosRef.current.x && e.y === playerPosRef.current.y)) {
      handlePlayerDeath();
    }
    
    setEnemies(prev => {
      const hit = prev.filter(en => newExplosions.some(e => e.x === en.x && e.y === en.y));
      const remaining = prev.filter(en => !newExplosions.some(e => e.x === en.x && e.y === en.y));
      
      if (hit.length > 0) {
        soundSystem.playEnemyDeath();
        setDyingEnemies(d => [...d, ...hit]);
        setTimeout(() => {
          setDyingEnemies(d => d.filter(de => !hit.find(h => h.id === de.id)));
        }, 600);
        
        setPlayerStats(s => ({ ...s, score: s.score + hit.length * 500 }));
      }
      return remaining;
    });

    if (bombsToTrigger.length > 0) {
      setBombs(prev => prev.map(b => bombsToTrigger.includes(b.id) ? { ...b, timer: now } : b));
    }
  }, [hiddenExit, handlePlayerDeath]);

  const initLevel = useCallback((lvl: number, resetStats: boolean = false) => {
    const { map: newMap, exitPos } = generateMap(lvl);
    const newEnemies = generateEnemies(lvl, newMap);
    setMap(newMap);
    setHiddenExit(exitPos);
    setEnemies(newEnemies);
    setDyingEnemies([]);
    setPlayerPos({ x: 1, y: 1 });
    setBombs([]);
    setExplosions([]);
    setIsDying(false);
    setLevel(lvl);
    setElapsedTime(0);
    
    if (resetStats) {
      setPlayerStats(INITIAL_PLAYER_STATS);
    } else {
      setPlayerStats(s => ({
        ...s,
        maxBombs: INITIAL_PLAYER_STATS.maxBombs,
        range: INITIAL_PLAYER_STATS.range,
        speed: INITIAL_PLAYER_STATS.speed,
        dangerSensorUses: INITIAL_PLAYER_STATS.dangerSensorUses
      }));
    }
    
    setStatus(GameStatus.PLAYING);
  }, []);

  const plantBomb = useCallback(() => {
    if (statusRef.current !== GameStatus.PLAYING || isDyingRef.current) return;
    const now = Date.now();
    if (bombsRef.current.length < playerStatsRef.current.maxBombs) {
      if (!bombsRef.current.some(b => b.x === playerPosRef.current.x && b.y === playerPosRef.current.y)) {
        soundSystem.playPlant();
        const showDanger = playerStatsRef.current.dangerSensorUses > 0;
        
        setBombs(prev => [...prev, {
          id: `bomb-${now}`,
          x: playerPosRef.current.x,
          y: playerPosRef.current.y,
          timer: now + BOMB_DURATION,
          range: playerStatsRef.current.range,
          ownerId: 'player',
          showDanger
        }]);

        if (showDanger) {
          setPlayerStats(s => ({ ...s, dangerSensorUses: s.dangerSensorUses - 1 }));
        }
      }
    }
  }, []);

  const performMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (statusRef.current !== GameStatus.PLAYING || isDyingRef.current) return false;
    const now = Date.now();
    
    if (now - lastMoveTimeRef.current < playerStatsRef.current.speed) return false;

    let nx = playerPosRef.current.x;
    let ny = playerPosRef.current.y;
    
    if (dir === 'left') { setPlayerFacing('left'); nx--; }
    else if (dir === 'right') { setPlayerFacing('right'); nx++; }
    else if (dir === 'up') ny--;
    else if (dir === 'down') ny++;

    const cell = mapRef.current[ny]?.[nx];
    const isOccupiedByBomb = bombsRef.current.some(b => b.x === nx && b.y === ny);
    
    if (cell && cell !== CellType.WALL && cell !== CellType.BRICK && !isOccupiedByBomb) {
      lastMoveTimeRef.current = now;
      soundSystem.playMove();
      
      const isPowerUp = [
        CellType.POWERUP_BOMBS, 
        CellType.POWERUP_RANGE, 
        CellType.POWERUP_SPEED, 
        CellType.POWERUP_LIFE, 
        CellType.POWERUP_DANGER
      ].includes(cell);
      
      if (isPowerUp) {
        soundSystem.playPowerUp();
        if (cell === CellType.POWERUP_BOMBS) setPlayerStats(s => ({ ...s, maxBombs: s.maxBombs + 1, score: s.score + 200 }));
        else if (cell === CellType.POWERUP_RANGE) setPlayerStats(s => ({ ...s, range: s.range + 1, score: s.score + 200 }));
        else if (cell === CellType.POWERUP_SPEED) setPlayerStats(s => ({ ...s, speed: Math.max(100, s.speed - 15), score: s.score + 200 }));
        else if (cell === CellType.POWERUP_LIFE) setPlayerStats(s => ({ ...s, lives: Math.min(5, s.lives + 1), score: s.score + 500 }));
        else if (cell === CellType.POWERUP_DANGER) setPlayerStats(s => ({ ...s, dangerSensorUses: s.dangerSensorUses + 5, score: s.score + 300 }));
        
        setMap(m => {
          const nm = [...m.map(r => [...r])];
          nm[ny][nx] = CellType.EMPTY;
          return nm;
        });
      }
      
      if (cell === CellType.EXIT && enemiesRef.current.length === 0) {
        setStatus(GameStatus.LEVEL_COMPLETE);
      }

      setPlayerPos({ x: nx, y: ny });
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), Math.min(playerStatsRef.current.speed, 150));
      
      if (enemiesRef.current.some(en => en.x === nx && en.y === ny)) {
        handlePlayerDeath();
      }
      return true;
    }
    return false;
  }, [handlePlayerDeath]);

  const dangerTiles = useMemo(() => {
    const tiles = new Set<string>();
    bombs.forEach(bomb => {
      if (!bomb.showDanger) return;
      tiles.add(`${bomb.x},${bomb.y}`);
      const directions = [{dx:0, dy:-1}, {dx:0, dy:1}, {dx:-1, dy:0}, {dx:1, dy:0}];
      directions.forEach(({dx, dy}) => {
        for (let r = 1; r <= bomb.range; r++) {
          const nx = bomb.x + dx * r;
          const ny = bomb.y + dy * r;
          if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) break;
          const cell = map[ny][nx];
          if (cell === CellType.WALL) break;
          tiles.add(`${nx},${ny}`);
          if (cell === CellType.BRICK) break;
        }
      });
    });
    return Array.from(tiles).map(s => {
      const [x, y] = s.split(',').map(Number);
      return { x, y };
    });
  }, [bombs, map]);

  useEffect(() => {
    if (!activeTouchDir || status !== GameStatus.PLAYING) return;
    let timer: number;
    const tick = () => {
      performMove(activeTouchDir);
      timer = window.setTimeout(tick, 16);
    };
    tick();
    return () => clearTimeout(timer);
  }, [activeTouchDir, status, performMove]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ') plantBomb();
      else if (['ArrowUp', 'w'].includes(e.key)) performMove('up');
      else if (['ArrowDown', 's'].includes(e.key)) performMove('down');
      else if (['ArrowLeft', 'a'].includes(e.key)) performMove('left');
      else if (['ArrowRight', 'd'].includes(e.key)) performMove('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [performMove, plantBomb]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setExplosions(prev => prev.filter(e => e.expiresAt > now));
      setBombs(prev => {
        const exploding = prev.filter(b => b.timer <= now);
        const remaining = prev.filter(b => b.timer > now);
        exploding.forEach(triggerExplosion);
        return remaining;
      });

      if (statusRef.current === GameStatus.PLAYING) {
        setEnemies(prev => prev.map(en => {
          if (now - en.lastMove < 800) return en;
          const directions = [{dx:0, dy:-1}, {dx:0, dy:1}, {dx:-1, dy:0}, {dx:1, dy:0}];
          
          const validMoves = directions.filter(d => {
            const nx = en.x + d.dx, ny = en.y + d.dy;
            const cell = mapRef.current[ny]?.[nx];
            if (!cell) return false;
            if (cell === CellType.WALL) return false;
            if (cell === CellType.BRICK && !en.canPassBricks) return false;
            const isOccupiedByBomb = bombsRef.current.some(b => b.x === nx && b.y === ny);
            return !isOccupiedByBomb;
          });

          if (validMoves.length === 0) return en;
          const move = validMoves[Math.floor(Math.random() * validMoves.length)];
          const nx = en.x + move.dx, ny = en.y + move.dy;
          if (nx === playerPosRef.current.x && ny === playerPosRef.current.y) handlePlayerDeath();
          return { ...en, x: nx, y: ny, lastMove: now };
        }));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [triggerExplosion, handlePlayerDeath]);

  return (
    <div className="flex flex-col w-full h-full justify-between items-center overflow-hidden touch-none fixed inset-0">
      <HUD 
        level={level} 
        stats={playerStats} 
        enemiesRemaining={enemies.length} 
        elapsedTime={elapsedTime} 
        highScore={highScore}
      />
      
      <div className={`flex-grow flex items-center justify-center w-full px-2 overflow-hidden ${shake ? 'screen-shake' : ''}`}>
        <div 
          className="relative bg-zinc-900 p-2 border-[6px] border-[#222228] rounded-3xl shadow-[0_40px_150px_rgba(0,0,0,1)] origin-center transition-transform duration-300"
          style={{ 
            width: GRID_WIDTH * CELL_SIZE + 16, 
            height: GRID_HEIGHT * CELL_SIZE + 16,
            transform: `scale(${scale})`
          }}
        >
          <div className="grid overflow-hidden bg-zinc-950 rounded-xl" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)` }}>
            {map.map((row, y) => row.map((cell, x) => <Cell key={`${x}-${y}`} type={cell} />))}
          </div>

          {dangerTiles.map((tile, i) => (
            <div key={`danger-${i}`} className="absolute z-0 bg-red-600/30 animate-pulse pointer-events-none rounded-sm border border-red-500/20" 
                 style={{ width: CELL_SIZE, height: CELL_SIZE, left: tile.x * CELL_SIZE + 8, top: tile.y * CELL_SIZE + 8 }} />
          ))}

          {bombs.map(bomb => (
            <div key={bomb.id} className="absolute z-10 flex items-center justify-center" 
                 style={{ width: CELL_SIZE, height: CELL_SIZE, left: bomb.x * CELL_SIZE + 8, top: bomb.y * CELL_SIZE + 8 }}>
              <div className="relative w-10 h-10 bg-zinc-950 rounded-full shadow-2xl border-2 border-zinc-800 animate-pulse">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-zinc-700 rounded-full"></div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full blur-[2px] animate-[pulse-fuse_0.4s_infinite]"></div>
              </div>
            </div>
          ))}

          {explosions.map(exp => (
            <div key={exp.id} className="absolute z-20 animate-explode flex items-center justify-center" 
                 style={{ width: CELL_SIZE, height: CELL_SIZE, left: exp.x * CELL_SIZE + 8, top: exp.y * CELL_SIZE + 8 }}>
              <div className={`w-full h-full rounded-md ${exp.type === 'center' ? 'bg-gradient-to-br from-yellow-100 via-orange-400 to-red-600 shadow-[0_0_50px_orange]' : 'bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_20px_red]'}`} />
            </div>
          ))}

          <div className={`absolute z-30 transition-all duration-150 flex items-center justify-center ${isDying ? 'animate-die' : isMoving ? 'animate-walk' : 'animate-idle'}`} 
               style={{ 
                 width: CELL_SIZE, height: CELL_SIZE, 
                 left: playerPos.x * CELL_SIZE + 8, 
                 top: playerPos.y * CELL_SIZE + 8,
                 transform: `scaleX(${playerFacing === 'right' ? 1 : -1})`
               }}>
            <div className="relative w-10 h-12 bg-indigo-600 rounded-xl border-2 border-indigo-300 shadow-2xl">
               <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-5 bg-zinc-900 rounded-lg border border-indigo-400/40 flex items-center justify-center gap-2 p-1">
                 <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_cyan]"></div>
                 <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_10px_cyan]"></div>
               </div>
               <div className="absolute -left-2 top-3 w-2.5 h-7 bg-indigo-800 rounded-l-xl shadow-inner border-r border-indigo-500/30"></div>
            </div>
          </div>

          {/* Enemigos activos */}
          {enemies.map(en => (
            <div key={en.id} className="absolute z-40 transition-all duration-700 flex items-center justify-center animate-enemy" 
                 style={{ width: CELL_SIZE, height: CELL_SIZE, left: en.x * CELL_SIZE + 8, top: en.y * CELL_SIZE + 8 }}>
              <div className={`relative w-10 h-10 ${en.type === 'ghost' ? 'bg-purple-600 opacity-70 border-purple-300 shadow-[0_0_25px_purple]' : 'bg-rose-600 border-rose-400 shadow-[0_0_25px_rgba(225,29,72,0.7)]'} rounded-full border-2 flex flex-col items-center transition-colors duration-500`}>
                 <div className="mt-2.5 flex gap-2">
                    <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                       <div className="w-1 h-1 bg-black rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                       <div className="w-1 h-1 bg-black rounded-full animate-pulse"></div>
                    </div>
                 </div>
                 <div className="absolute -bottom-2 flex gap-1.5">
                    <div className={`w-2 h-3 ${en.type === 'ghost' ? 'bg-purple-900' : 'bg-rose-800'} rounded-full transform rotate-12`}></div>
                    <div className={`w-2 h-3 ${en.type === 'ghost' ? 'bg-purple-900' : 'bg-rose-800'} rounded-full transform -rotate-12`}></div>
                 </div>
              </div>
            </div>
          ))}

          {/* Enemigos en animación de muerte - Renderizados arriba con z-50 */}
          {dyingEnemies.map(en => (
            <div key={`dying-${en.id}`} className="absolute z-50 flex items-center justify-center animate-enemy-die" 
                 style={{ width: CELL_SIZE, height: CELL_SIZE, left: en.x * CELL_SIZE + 8, top: en.y * CELL_SIZE + 8 }}>
              <div className={`relative w-10 h-10 ${en.type === 'ghost' ? 'bg-purple-600' : 'bg-rose-600'} rounded-full border-2 border-white/80 shadow-[0_0_40px_white] flex flex-col items-center`}>
                 <div className="mt-2.5 flex gap-2">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                 </div>
              </div>
            </div>
          ))}

          {status !== GameStatus.PLAYING && (
            <Overlay 
              title={status === GameStatus.MENU ? "BOMBERMAN" : status === GameStatus.LEVEL_COMPLETE ? "SECTOR CLEAR" : "SYSTEM FAILURE"} 
              subtitle={status !== GameStatus.MENU ? `SCORE: ${playerStats.score} | TIME: ${elapsedTime}s` : "COLLECT CORES, SURVIVE THE GHOSTS"}
              buttonText={status === GameStatus.MENU ? "LAUNCH" : status === GameStatus.LEVEL_COMPLETE ? "NEXT CORE" : "REBOOT"} 
              onClick={() => status === GameStatus.LEVEL_COMPLETE ? initLevel(level + 1) : initLevel(1, true)} 
              color={status === GameStatus.GAME_OVER ? "bg-rose-950/90" : "bg-black/95"}
            />
          )}
        </div>
      </div>

      <TouchControls onMove={setActiveTouchDir} onBomb={plantBomb} />
    </div>
  );
};

const Overlay = ({ title, subtitle, buttonText, onClick, color }: any) => (
  <div className={`absolute inset-0 z-[60] flex flex-col items-center justify-center ${color} backdrop-blur-3xl rounded-2xl border-4 border-white/5 shadow-2xl`}>
    <h1 className="text-7xl font-game mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-700 italic tracking-tighter drop-shadow-2xl text-center px-4">{title}</h1>
    {subtitle && <p className="text-xl mb-14 text-indigo-300 font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] text-center px-4">{subtitle}</p>}
    <button className="group relative px-20 py-8 bg-indigo-700 hover:bg-indigo-600 transition-all rounded-full overflow-hidden shadow-[0_20px_80px_rgba(67,56,202,0.6)] active:scale-90" onClick={onClick}>
       <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
       <span className="relative text-white font-game text-4xl tracking-widest">{buttonText}</span>
    </button>
  </div>
);

export default Game;
