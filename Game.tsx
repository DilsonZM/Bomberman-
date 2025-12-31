
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  CellType, 
  GameStatus, 
  Position, 
  Bomb, 
  Enemy, 
  Explosion, 
  PlayerStats,
  SkinId,
  SKINS
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
import WorldMap from './components/WorldMap';

const Game: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [currentSkinId, setCurrentSkinId] = useState<SkinId>('classic');
  const [level, setLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [map, setMap] = useState<CellType[][]>([]);
  const [hiddenExit, setHiddenExit] = useState<Position | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [playerFacing, setPlayerFacing] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const [isExiting, setIsExiting] = useState(false); 
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [dyingEnemies, setDyingEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [scale, setScale] = useState(0.8);
  const [activeTouchDir, setActiveTouchDir] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [shake, setShake] = useState(false);
  const [debugUnlockedSkins, setDebugUnlockedSkins] = useState(false);
  
  const [shieldEndTime, setShieldEndTime] = useState(0);
  const [shieldMaxDuration, setShieldMaxDuration] = useState(0);
  
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
  const shieldEndTimeRef = useRef(0);
  const isExitingRef = useRef(false);

  const currentPlanet = Math.floor((level - 1) / 5) + 1;
  const currentWorld = Math.min(5, currentPlanet);
  const currentSkin = useMemo(() => SKINS.find(s => s.id === currentSkinId) || SKINS[0], [currentSkinId]);

  useEffect(() => {
    const saved = localStorage.getItem('bomberman_high_score');
    if (saved) setHighScore(parseInt(saved, 10));
    
    const savedUnlocked = localStorage.getItem('bomberman_unlocked_level');
    if (savedUnlocked) setUnlockedLevel(parseInt(savedUnlocked, 10));

    const savedSkin = localStorage.getItem('bomberman_skin') as SkinId;
    if (savedSkin && SKINS.some(s => s.id === savedSkin)) setCurrentSkinId(savedSkin);
  }, []);

  useEffect(() => {
    if (playerStats.score > highScore) {
      setHighScore(playerStats.score);
      localStorage.setItem('bomberman_high_score', playerStats.score.toString());
    }
  }, [playerStats.score, highScore]);

  useEffect(() => {
    let timer: number;
    if (status === GameStatus.PLAYING && !isExiting) {
      timer = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, isExiting]);

  useEffect(() => { mapRef.current = map; }, [map]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { bombsRef.current = bombs; }, [bombs]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { playerStatsRef.current = playerStats; }, [playerStats]);
  useEffect(() => { isDyingRef.current = isDying; }, [isDying]);
  useEffect(() => { shieldEndTimeRef.current = shieldEndTime; }, [shieldEndTime]);
  useEffect(() => { isExitingRef.current = isExiting; }, [isExiting]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const boardWidth = GRID_WIDTH * CELL_SIZE + 32;
      const boardHeight = GRID_HEIGHT * CELL_SIZE + 32;
      const availableHeight = screenHeight * 0.45; 
      const newScale = Math.min(1.0, (screenWidth - 20) / boardWidth, availableHeight / boardHeight);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlayerDeath = useCallback(() => {
    if (isDyingRef.current || isExitingRef.current) return;
    if (Date.now() < shieldEndTimeRef.current) return;

    setIsDying(true);
    soundSystem.playDeath();
    
    setTimeout(() => {
      setPlayerStats(s => {
        const nextLives = Math.max(0, s.lives - 1);
        if (nextLives <= 0) {
          setStatus(GameStatus.GAME_OVER);
          return s; // No importa, game over
        }
        return { 
          ...INITIAL_PLAYER_STATS, 
          score: s.score, 
          lives: nextLives 
        };
      });
      
      setPlayerPos({ x: 1, y: 1 });
      setIsDying(false);
      setPlayerFacing('down'); // Reset facing on respawn
      
      const duration = 3000;
      setShieldEndTime(Date.now() + duration);
      setShieldMaxDuration(duration);
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
    
    const directions = [{ dx: 0, dy: -1, type: 'vertical' }, { dx: 0, dy: 1, type: 'vertical' }, { dx: -1, dy: 0, type: 'horizontal' }, { dx: 1, dy: 0, type: 'horizontal' }];
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
        newExplosions.push({ id: `exp-${now}-${bomb.id}-${nx}-${ny}`, x: nx, y: ny, type: type as any, expiresAt: now + EXPLOSION_DURATION });
        const hitBomb = bombsRef.current.find(b => b.x === nx && b.y === ny);
        if (hitBomb && hitBomb.id !== bomb.id) bombsToTrigger.push(hitBomb.id);
        
        if (cell === CellType.BRICK) {
          if (hiddenExit?.x === nx && hiddenExit?.y === ny) {
            updatedMap[ny][nx] = CellType.EXIT;
          } else {
            const rand = Math.random();
            const isMechaPlanet = currentPlanet === 4;
            if (isMechaPlanet && !playerStatsRef.current.hasKey && rand < 0.15) {
               updatedMap[ny][nx] = CellType.KEY;
            } else if (rand < 0.12) updatedMap[ny][nx] = CellType.POWERUP_BOMBS;
            else if (rand < 0.24) updatedMap[ny][nx] = CellType.POWERUP_RANGE;
            else if (rand < 0.30) updatedMap[ny][nx] = CellType.POWERUP_SPEED;
            else if (rand < 0.35) updatedMap[ny][nx] = CellType.POWERUP_DANGER;
            else if (rand < 0.37) updatedMap[ny][nx] = CellType.POWERUP_LIFE;
            else if (rand < 0.40) updatedMap[ny][nx] = CellType.POWERUP_VEST;
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
    
    if (newExplosions.some(e => e.x === playerPosRef.current.x && e.y === playerPosRef.current.y)) handlePlayerDeath();
    
    setEnemies(prev => {
      const hit = prev.filter(en => {
        const isDirectHit = newExplosions.some(e => e.x === en.x && e.y === en.y);
        let isTransitionHit = false;
        if (en.prevX !== undefined && en.prevY !== undefined) {
           const timeSinceMove = now - en.lastMove;
           if (timeSinceMove < 500) {
             isTransitionHit = newExplosions.some(e => e.x === en.prevX && e.y === en.prevY);
           }
        }
        return isDirectHit || isTransitionHit;
      });

      const remaining = prev.filter(en => !hit.some(h => h.id === en.id));
      if (hit.length > 0) {
        soundSystem.playEnemyDeath();
        setDyingEnemies(d => [...d, ...hit]);
        setTimeout(() => setDyingEnemies(d => d.filter(de => !hit.find(h => h.id === de.id))), 800);
        setPlayerStats(s => ({ ...s, score: s.score + hit.length * 500 }));
      }
      return remaining;
    });

    if (bombsToTrigger.length > 0) setBombs(prev => prev.map(b => bombsToTrigger.includes(b.id) ? { ...b, timer: now } : b));
  }, [hiddenExit, handlePlayerDeath, currentPlanet]);

  const initLevel = useCallback((lvl: number, resetStats: boolean = false) => {
    // Generación de mapa ahora es más robusta (ver cambios en mapGenerator)
    const { map: newMap, exitPos } = generateMap(lvl);
    const newEnemies = generateEnemies(lvl, newMap);
    setMap(newMap);
    setHiddenExit(exitPos);
    setEnemies(newEnemies);
    setDyingEnemies([]);
    setPlayerPos({ x: 1, y: 1 });
    setPlayerFacing('down');
    setBombs([]);
    setExplosions([]);
    setIsDying(false);
    setIsExiting(false);
    setLevel(lvl);
    setElapsedTime(0);
    const duration = 5000;
    setShieldEndTime(Date.now() + duration);
    setShieldMaxDuration(duration);
    
    if (resetStats) setPlayerStats(INITIAL_PLAYER_STATS);
    else setPlayerStats(s => ({ 
      ...s, 
      hasKey: false, 
      maxBombs: s.maxBombs, 
      range: s.range, 
      speed: s.speed, 
      dangerSensorUses: s.dangerSensorUses 
    }));
    setStatus(GameStatus.PLAYING);
  }, []);

  const completeLevel = useCallback(() => {
    const nextLevel = level + 1;
    if (nextLevel > unlockedLevel) {
      setUnlockedLevel(nextLevel);
      localStorage.setItem('bomberman_unlocked_level', nextLevel.toString());
    }
    setStatus(GameStatus.LEVEL_COMPLETE);
  }, [level, unlockedLevel]);

  const triggerExitSequence = useCallback(() => {
    if (isExitingRef.current) return;
    setIsExiting(true);
    soundSystem.playPowerUp();
    setTimeout(() => {
      completeLevel();
    }, 1500);
  }, [completeLevel]);

  const plantBomb = useCallback(() => {
    if (statusRef.current !== GameStatus.PLAYING || isDyingRef.current || isExitingRef.current) return;
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
        if (showDanger) setPlayerStats(s => ({ ...s, dangerSensorUses: Math.max(0, s.dangerSensorUses - 1) }));
      }
    }
  }, []);

  const performMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (statusRef.current !== GameStatus.PLAYING || isDyingRef.current || isExitingRef.current) return false;
    const now = Date.now();
    if (now - lastMoveTimeRef.current < playerStatsRef.current.speed) return false;

    // ACTUALIZACIÓN: Lógica de orientación estricta
    let nx = playerPosRef.current.x, ny = playerPosRef.current.y;
    setPlayerFacing(dir); // Ahora actualizamos facing para cualquier dirección

    if (dir === 'left') nx--;
    else if (dir === 'right') nx++;
    else if (dir === 'up') ny--;
    else if (dir === 'down') ny++;

    const cell = mapRef.current[ny]?.[nx];
    const isOccupiedByBomb = bombsRef.current.some(b => b.x === nx && b.y === ny);
    
    if (cell && cell !== CellType.WALL && cell !== CellType.BRICK && !isOccupiedByBomb) {
      lastMoveTimeRef.current = now;
      soundSystem.playMove();
      
      const isPowerUp = [CellType.POWERUP_BOMBS, CellType.POWERUP_RANGE, CellType.POWERUP_SPEED, CellType.POWERUP_LIFE, CellType.POWERUP_DANGER, CellType.POWERUP_VEST].includes(cell);
      if (isPowerUp) {
        soundSystem.playPowerUp();
        if (cell === CellType.POWERUP_BOMBS) setPlayerStats(s => ({ ...s, maxBombs: s.maxBombs + 1, score: s.score + 200 }));
        else if (cell === CellType.POWERUP_RANGE) setPlayerStats(s => ({ ...s, range: s.range + 1, score: s.score + 200 }));
        else if (cell === CellType.POWERUP_SPEED) setPlayerStats(s => ({ ...s, speed: Math.max(80, s.speed - 15), score: s.score + 200 }));
        else if (cell === CellType.POWERUP_LIFE) setPlayerStats(s => ({ ...s, lives: Math.min(5, s.lives + 1), score: s.score + 500 }));
        else if (cell === CellType.POWERUP_DANGER) setPlayerStats(s => ({ ...s, dangerSensorUses: s.dangerSensorUses + 5, score: s.score + 300 }));
        else if (cell === CellType.POWERUP_VEST) {
           const duration = 30000;
           setShieldEndTime(Date.now() + duration);
           setShieldMaxDuration(duration); 
           setPlayerStats(s => ({ ...s, score: s.score + 500 }));
        }
        setMap(m => { const nm = [...m.map(r => [...r])]; nm[ny][nx] = CellType.EMPTY; return nm; });
      }

      if (cell === CellType.KEY) {
        soundSystem.playPowerUp();
        setPlayerStats(s => ({ ...s, hasKey: true, score: s.score + 1000 }));
        setMap(m => { const nm = [...m.map(r => [...r])]; nm[ny][nx] = CellType.EMPTY; return nm; });
      }

      if (cell === CellType.LAVA && Date.now() > shieldEndTimeRef.current) handlePlayerDeath();
      
      if (cell === CellType.EXIT && enemiesRef.current.length === 0) {
        if (currentPlanet === 4 && !playerStatsRef.current.hasKey) {
          // Bloqueado
        } else {
          setPlayerPos({ x: nx, y: ny }); 
          triggerExitSequence();
          return true;
        }
      }

      setPlayerPos({ x: nx, y: ny });
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), 150);

      if (cell === CellType.ICE) setTimeout(() => performMove(dir), 100);
      
      if (enemiesRef.current.some(en => en.x === nx && en.y === ny)) handlePlayerDeath();
      return true;
    }
    return false;
  }, [handlePlayerDeath, currentPlanet, triggerExitSequence]);

  const togglePause = useCallback(() => {
    if (statusRef.current === GameStatus.PLAYING) setStatus(GameStatus.PAUSED);
    else if (statusRef.current === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  }, []);

  const changeSkin = (skinId: SkinId) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin && (debugUnlockedSkins || highScore >= skin.requiredScore)) {
      setCurrentSkinId(skinId);
      localStorage.setItem('bomberman_skin', skinId);
    }
  };

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
      if (e.key === 'p' || e.key === 'Escape') togglePause();
      if (statusRef.current !== GameStatus.PLAYING) return;
      if (e.key === ' ') plantBomb();
      else if (['ArrowUp', 'w'].includes(e.key)) performMove('up');
      else if (['ArrowDown', 's'].includes(e.key)) performMove('down');
      else if (['ArrowLeft', 'a'].includes(e.key)) performMove('left');
      else if (['ArrowRight', 'd'].includes(e.key)) performMove('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [performMove, plantBomb, togglePause]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (statusRef.current !== GameStatus.PLAYING) return;
      const now = Date.now();
      setExplosions(prev => prev.filter(e => e.expiresAt > now));
      setBombs(prev => {
        const exploding = prev.filter(b => b.timer <= now);
        const remaining = prev.filter(b => b.timer > now);
        exploding.forEach(triggerExplosion);
        return remaining;
      });
      setEnemies(prev => prev.map(en => {
        if (now - en.lastMove < en.speed) return en;
        const directions = [{dx:0, dy:-1}, {dx:0, dy:1}, {dx:-1, dy:0}, {dx:1, dy:0}];
        const validMoves = directions.filter(d => {
          const nx = en.x + d.dx, ny = en.y + d.dy;
          const cell = mapRef.current[ny]?.[nx];
          if (!cell || cell === CellType.WALL) return false;
          if (cell === CellType.BRICK && !en.canPassBricks) return false;
          return !bombsRef.current.some(b => b.x === nx && b.y === ny);
        });
        if (validMoves.length === 0) return en;
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        const nx = en.x + move.dx, ny = en.y + move.dy;
        if (nx === playerPosRef.current.x && ny === playerPosRef.current.y) handlePlayerDeath();
        return { ...en, x: nx, y: ny, prevX: en.x, prevY: en.y, lastMove: now };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, [triggerExplosion, handlePlayerDeath]);

  if (status === GameStatus.MENU || status === GameStatus.MAP) {
    return (
      <WorldMap 
        unlockedLevel={unlockedLevel} 
        onSelectLevel={(lvl) => { setLevel(lvl); initLevel(lvl, true); }} 
        highScore={highScore}
        onUnlockAll={() => { setUnlockedLevel(25); setDebugUnlockedSkins(true); }}
      />
    );
  }

  // --- RENDERIZADOR AVANZADO 4 DIRECCIONES ---
  const renderPlayer = () => {
    const isShieldActive = Date.now() < shieldEndTime;
    const isBack = playerFacing === 'up';
    const isSide = playerFacing === 'left' || playerFacing === 'right';
    
    // LOGICA DE FLIP SOLIDA: Invertimos el eje X si mira a la izquierda.
    // Void skin es la única excepción porque es simétrica/circular.
    const shouldFlip = playerFacing === 'left' && currentSkinId !== 'void';
    
    // ELEMENTOS COMUNES DE UI PLAYER
    const shieldOverlay = isShieldActive && !isExiting ? (
      <div className="absolute -inset-2 bg-sky-500/20 rounded-full border-2 border-sky-400/40 shadow-[0_0_15px_#38bdf8] animate-pulse pointer-events-none z-50"></div>
    ) : null;
    const keyIndicator = playerStats.hasKey && !isExiting ? <div className="absolute -left-2 -top-2 text-xs z-50 animate-bounce">🔑</div> : null;

    // CONTENIDO ESPECÍFICO DE LA SKIN
    const skinContent = (() => {
      switch (currentSkinId) {
        case 'dragon':
          return (
             <div className="relative w-10 h-10">
                {/* Partículas de fuego solo de frente o lado */}
                {!isExiting && !isBack && (
                  <div className="absolute top-1/2 -right-6 w-2 h-2 bg-orange-500 rounded-full blur-[2px] opacity-0 dragon-particle"></div>
                )}
                
                {/* Cola */}
                <div className={`absolute ${isBack ? 'bottom-0 left-1/2 -translate-x-1/2 w-2 h-6' : 'bottom-1 -left-3 w-4 h-3 origin-right rotate-12'} bg-green-700 rounded-full`}></div>
                
                {/* Cuerpo */}
                <div className="absolute bottom-0 left-1 w-7 h-7 bg-green-700 rounded-full border border-green-900 shadow-inner z-10">
                   {!isBack && <div className="absolute top-1 left-2 w-4 h-4 bg-yellow-200/40 rounded-full blur-[1px]"></div>}
                   {isBack && <div className="absolute top-1 left-2 w-3 h-5 bg-green-800 rounded-full blur-[1px]"></div>}
                </div>
                
                {/* Alas - LÓGICA MEJORADA */}
                {/* Espalda: Plegadas arriba */}
                {isBack && (
                  <>
                    <div className="absolute top-2 -left-3 w-4 h-6 bg-orange-500 clip-path-triangle rotate-[-10deg] z-0"></div>
                    <div className="absolute top-2 -right-3 w-4 h-6 bg-orange-500 clip-path-triangle rotate-[10deg] z-0"></div>
                  </>
                )}
                {/* Perfil (Izquierda/Derecha): Una ala visible */}
                {isSide && (
                   <div className="absolute top-3 -left-2 w-3 h-4 bg-orange-500 clip-path-triangle rotate-[260deg] z-0"></div>
                )}
                {/* Frente (Abajo): Alas abiertas completas y visibles */}
                {!isBack && !isSide && (
                   <>
                     <div className="absolute top-2 -left-3 w-5 h-7 bg-orange-500 clip-path-triangle rotate-[-45deg] z-0 border-l border-orange-700"></div>
                     <div className="absolute top-2 -right-3 w-5 h-7 bg-orange-500 clip-path-triangle rotate-[45deg] z-0 border-r border-orange-700"></div>
                   </>
                )}
                
                {/* Cabeza */}
                <div className="absolute -top-1 left-1 w-8 h-8 bg-green-600 rounded-xl border border-green-800 flex items-center justify-center shadow-lg z-20">
                   {!isBack && (
                     <>
                       {/* Hocico */}
                       <div className={`absolute top-3 ${isSide ? '-right-1 w-2' : 'left-1/2 -translate-x-1/2 w-4'} h-3 bg-green-500 rounded-md`}></div>
                       {/* Ojos */}
                       <div className={`absolute top-2 ${isSide ? 'right-1' : 'right-1.5'} w-2 h-2 bg-yellow-300 border border-black shadow-[0_0_5px_yellow]`}></div>
                       {!isSide && <div className="absolute top-2 left-1.5 w-2 h-2 bg-yellow-300 border border-black shadow-[0_0_5px_yellow]"></div>}
                     </>
                   )}
                   {/* Cuernos */}
                   <div className="absolute -top-2 left-0 w-2 h-3 bg-orange-300 clip-path-triangle -rotate-12"></div>
                   <div className="absolute -top-2 right-2 w-2 h-3 bg-orange-300 clip-path-triangle rotate-12"></div>
                </div>
             </div>
          );

        case 'samurai':
          return (
              <div className="relative w-10 h-10 flex flex-col items-center">
                 {/* Casco Kabuto */}
                 <div className="absolute -top-3 w-10 h-6 bg-red-800 rounded-t-lg z-20 flex justify-center">
                    <div className="absolute -top-3 w-6 h-6 border-b-4 border-yellow-400 rounded-full"></div>
                    {!isBack && <div className="absolute -top-1 w-2 h-3 bg-yellow-400 clip-path-triangle"></div>}
                 </div>
                 {/* Cabeza */}
                 <div className="w-7 h-7 bg-black rounded-lg border border-red-900 z-10 flex items-center justify-center relative top-2">
                    {!isBack && (
                      <div className={`flex gap-1 mt-1 ${isSide ? 'pl-2' : ''}`}>
                        <div className="w-2 h-1 bg-yellow-400 shadow-[0_0_5px_yellow]"></div>
                        {!isSide && <div className="w-2 h-1 bg-yellow-400 shadow-[0_0_5px_yellow]"></div>}
                      </div>
                    )}
                 </div>
                 {/* Cuerpo */}
                 <div className="absolute bottom-0 w-8 h-5 bg-red-700 rounded-b-lg border-2 border-red-900 z-0 flex flex-col items-center">
                    {!isBack ? (
                      <div className="absolute inset-x-0 top-1 h-0.5 bg-yellow-600"></div>
                    ) : (
                      <div className="w-4 h-full bg-red-800 border-x border-red-950"></div>
                    )}
                 </div>
              </div>
          );

        case 'neon':
          return (
              <div className="relative w-9 h-11 flex flex-col items-center">
                <div className="w-8 h-8 bg-black rounded-lg border-2 border-cyan-400 shadow-[0_0_10px_cyan] z-10 overflow-hidden relative">
                   {!isBack && <div className="absolute top-2 w-full h-2 bg-cyan-400 animate-pulse"></div>}
                   {isBack && <div className="absolute top-2 left-2 w-4 h-4 bg-zinc-800 border border-cyan-400/50 rounded-full"></div>}
                </div>
                <div className="w-6 h-4 bg-zinc-900 border-x-2 border-cyan-400 -mt-1 z-0 relative">
                   {isBack && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-600 rounded-full animate-ping"></div>}
                </div>
                <div className="flex gap-1 -mt-1">
                   <div className="w-2 h-3 bg-black border-b-2 border-cyan-400"></div>
                   <div className="w-2 h-3 bg-black border-b-2 border-cyan-400"></div>
                </div>
              </div>
          );

        case 'ghost':
          return (
             <div className={`relative w-10 h-12 opacity-80 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] ${!isExiting ? 'animate-float' : ''}`}>
                <div className="w-full h-full bg-slate-200 rounded-t-full relative z-10 flex flex-col items-center pt-3 overflow-hidden">
                   {!isBack && (
                     <div className={`flex gap-2 mb-2 relative ${isSide ? 'left-2' : ''}`}> 
                       <div className="w-2 h-2 bg-black rounded-full opacity-80"></div>
                       {!isSide && <div className="w-2 h-2 bg-black rounded-full opacity-80"></div>}
                     </div>
                   )}
                   <div className="absolute bottom-0 w-full h-3 bg-slate-200 flex justify-between">
                     <div className="w-3 h-3 bg-black/0 rounded-full -mb-2 border-t-4 border-slate-200"></div>
                   </div>
                </div>
             </div>
          );

        case 'void':
          return (
             <div className="relative w-10 h-10 flex items-center justify-center">
               <div className="absolute w-6 h-6 bg-black rounded-full shadow-[0_0_15px_purple] z-20"></div>
               <div className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan] z-30 animate-pulse transition-transform duration-200" 
                    style={{ 
                      transform: 
                        playerFacing === 'right' ? 'translateX(4px)' : 
                        playerFacing === 'left' ? 'translateX(-4px)' :
                        playerFacing === 'up' ? 'translateY(-4px)' : 
                        'translateY(2px)'
                    }}></div>
               <div className="absolute w-10 h-10 border-2 border-purple-600 rounded-full opacity-80 animate-void z-10 border-t-transparent border-l-transparent"></div>
               <div className="absolute w-12 h-12 border border-purple-900/50 rounded-full animate-void z-0" style={{ animationDirection: 'reverse' }}></div>
             </div>
          );

        case 'emerald':
          return (
              <div className="relative w-9 h-11 flex flex-col items-center">
                <div className="w-8 h-7 bg-emerald-600 rounded-sm border-2 border-emerald-300 shadow-lg flex items-center justify-center relative">
                   {!isBack && <div className={`w-4 h-2 bg-yellow-300 shadow-[0_0_5px_yellow] relative ${isSide ? 'left-2' : ''}`}></div>}
                   {isBack && <div className="w-full h-full bg-emerald-700 opacity-50"></div>}
                </div>
                <div className="w-7 h-5 bg-emerald-800 -mt-1 rounded-b-lg border-2 border-emerald-500">
                   {isBack && <div className="w-2 h-4 bg-emerald-900 mx-auto"></div>}
                </div>
              </div>
          );

        case 'classic':
        default:
          return (
            <div className="relative w-9 h-11 flex flex-col items-center">
               <div className="absolute -top-2 w-1 h-2 bg-pink-500 z-0"></div>
               <div className="absolute -top-3 w-2 h-2 bg-pink-500 rounded-full shadow-sm z-0"></div>
               <div className="w-8 h-7 bg-white rounded-lg border-2 border-zinc-300 shadow-lg relative z-10 flex items-center justify-center overflow-hidden">
                 {!isBack && (
                   <div className={`flex gap-1 relative ${isSide ? 'left-2' : ''}`}>
                     <div className="w-1 h-3 bg-black rounded-full"></div>
                     {!isSide && <div className="w-1 h-3 bg-black rounded-full"></div>}
                   </div>
                 )}
                 {isBack && <div className="w-4 h-4 bg-zinc-100 rounded-full blur-[1px]"></div>}
               </div>
               <div className="w-6 h-4 bg-blue-600 rounded-b-md border-x border-b border-blue-800 -mt-1 z-0 relative">
                  <div className="absolute top-2 w-full h-1 bg-black"></div>
                  {!isBack && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-yellow-400"></div>}
                  {isBack && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3 bg-blue-800 rounded-sm"></div>}
               </div>
               <div className={`flex gap-1 -mt-1 ${isSide ? 'flex-col -mt-2' : ''}`}>
                  <div className="w-2.5 h-3 bg-pink-500 rounded-b-md border border-pink-700"></div>
                  <div className="w-2.5 h-3 bg-pink-500 rounded-b-md border border-pink-700"></div>
               </div>
            </div>
          );
      }
    })();

    return (
      <div 
        className={`absolute z-30 flex items-center justify-center transition-[top,left] duration-150 ${isExiting ? 'animate-enter-portal' : isDying ? 'animate-die' : ''}`}
        style={{ width: CELL_SIZE, height: CELL_SIZE, left: playerPos.x * CELL_SIZE + 8, top: playerPos.y * CELL_SIZE + 8 }}
      >
        {/* Contenedor de Orientación (Flip) - Separado de la animación de caminar para evitar conflictos */}
        <div 
          style={{ 
            transform: shouldFlip ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 0.1s linear' // Transición rápida para el giro
          }}
          className="w-full h-full flex items-center justify-center"
        >
           {/* Contenedor de Animación (Caminar) - Aplica rotación/rebote independientemente del Flip */}
           <div className={`${isMoving ? 'animate-walk' : 'animate-idle'} flex items-center justify-center`}>
              {shieldOverlay}
              {keyIndicator}
              {skinContent}
           </div>
        </div>
      </div>
    );
  };

  const renderEnemy = (en: Enemy) => {
    // ... (El renderizado de enemigos se mantiene igual que en el archivo original)
    if (en.type === 'blob') {
      return (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-green-500 rounded-full blur-[2px] opacity-60 animate-pulse"></div>
          <div className="relative w-8 h-8 bg-green-600 rounded-[40%] rounded-tl-sm border-2 border-green-400 shadow-[0_0_10px_green]">
            <div className="absolute top-2 left-1 w-2 h-2 bg-yellow-300 rounded-full border border-black flex items-center justify-center"><div className="w-0.5 h-1 bg-black rounded-full"></div></div>
            <div className="absolute top-1 right-2 w-3 h-3 bg-yellow-300 rounded-full border border-black flex items-center justify-center"><div className="w-0.5 h-1.5 bg-black rounded-full"></div></div>
            <div className="absolute bottom-2 left-3 w-1.5 h-1.5 bg-yellow-300 rounded-full border border-black"></div>
            <div className="absolute bottom-1 right-1 w-4 h-2 bg-black/60 rounded-b-lg border-t border-green-800"></div>
          </div>
        </div>
      );
    } else if (en.type === 'bat') {
      return (
        <div className="relative w-12 h-8 flex items-center justify-center animate-walk drop-shadow-[0_0_3px_#ef4444]">
          <div className="absolute -left-2 top-0 w-6 h-6 bg-zinc-900 rotate-45 border-l border-zinc-700"></div>
          <div className="absolute -right-2 top-0 w-6 h-6 bg-zinc-900 -rotate-45 border-r border-zinc-700"></div>
          <div className="relative w-5 h-5 bg-zinc-800 rounded-full border border-zinc-600 z-10 flex flex-col items-center">
             <div className="flex gap-1 mt-1">
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_red] animate-pulse"></div>
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_red] animate-pulse"></div>
             </div>
             <div className="w-2 h-0.5 bg-white mt-0.5 rounded-full"></div>
          </div>
        </div>
      );
    } else if (en.type === 'slider') {
      return (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="w-8 h-8 bg-cyan-900 rotate-45 border-2 border-cyan-400 shadow-[0_0_15px_cyan] flex items-center justify-center overflow-hidden">
             <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rotate-45"></div>
             <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rotate-45"></div>
             <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rotate-45"></div>
             <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rotate-45"></div>
             <div className="w-4 h-4 bg-black rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
             </div>
          </div>
        </div>
      );
    } else if (en.type === 'ghost') {
      return (
        <div className="relative w-9 h-10 flex flex-col items-center">
           <div className="w-full h-8 bg-purple-900/80 rounded-t-full border border-purple-400/50 shadow-[0_0_20px_purple] backdrop-blur-sm relative z-10">
              <div className="absolute top-3 left-2 w-2 h-3 bg-black rounded-full rotate-12 opacity-80"></div>
              <div className="absolute top-3 right-2 w-2 h-3 bg-black rounded-full -rotate-12 opacity-80"></div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3 h-1 bg-black rounded-full"></div>
           </div>
           <div className="w-full h-3 flex justify-between -mt-1 opacity-80">
              <div className="w-2 h-3 bg-purple-900 rounded-b-full"></div>
              <div className="w-2 h-3 bg-purple-900 rounded-b-full"></div>
              <div className="w-2 h-3 bg-purple-900 rounded-b-full"></div>
           </div>
        </div>
      );
    } else if (en.type === 'mecha') {
      return (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute w-12 h-1 bg-zinc-600 rotate-45"></div>
          <div className="absolute w-12 h-1 bg-zinc-600 -rotate-45"></div>
          <div className="relative w-8 h-8 bg-zinc-300 border-2 border-zinc-500 rounded-sm shadow-xl flex items-center justify-center z-10">
             <div className="w-6 h-2 bg-black absolute top-1"></div>
             <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_red] border-2 border-red-900 animate-pulse z-20"></div>
             <div className="absolute -right-2 top-0 w-1 h-4 bg-zinc-400"></div>
             <div className="absolute -right-2 -top-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>
      );
    } else if (en.type === 'boss') {
      return (
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 bg-black rounded-full border-4 border-red-600 shadow-[0_0_30px_red] animate-pulse"></div>
          <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
             <div className="flex gap-3 mb-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black shadow-[0_0_5px_yellow]"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full border border-black shadow-[0_0_5px_yellow]"></div>
             </div>
             <div className="w-8 h-2 bg-red-900 rounded-full mb-1"></div>
             <div className="flex gap-0.5">
                <div className="w-1 h-2 bg-white clip-path-triangle"></div>
                <div className="w-1 h-2 bg-white clip-path-triangle"></div>
                <div className="w-1 h-2 bg-white clip-path-triangle"></div>
                <div className="w-1 h-2 bg-white clip-path-triangle"></div>
             </div>
          </div>
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-800 rotate-45"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-800 rotate-45"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col w-full h-full justify-between items-center overflow-hidden touch-none fixed inset-0">
      <HUD 
        level={level} stats={playerStats} enemiesRemaining={enemies.length} 
        elapsedTime={elapsedTime} highScore={highScore} onPause={togglePause}
        isPaused={status === GameStatus.PAUSED} showPause={status === GameStatus.PLAYING || status === GameStatus.PAUSED}
        shieldEndTime={shieldEndTime}
        shieldMaxDuration={shieldMaxDuration}
      />
      
      <div className={`flex-grow flex items-center justify-center w-full px-2 overflow-hidden ${shake ? 'screen-shake' : ''}`}>
        <div 
          className="relative bg-zinc-900 p-2 border-[6px] border-[#222228] rounded-3xl shadow-[0_40px_150px_rgba(0,0,0,1)] origin-center transition-transform duration-300"
          style={{ width: GRID_WIDTH * CELL_SIZE + 16, height: GRID_HEIGHT * CELL_SIZE + 16, transform: `scale(${scale})` }}
        >
          <div className="grid overflow-hidden bg-zinc-950 rounded-xl" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)` }}>
            {map.map((row, y) => row.map((cell, x) => <Cell key={`${x}-${y}`} type={cell} world={currentWorld} />))}
          </div>

          {/* Bombas y Radar Visual */}
          {bombs.map(bomb => (
            <React.Fragment key={bomb.id}>
              {bomb.showDanger && (
                 <>
                   <div 
                     className="absolute z-0 bg-red-500/20 animate-pulse border-x border-red-500/30"
                     style={{
                        left: bomb.x * CELL_SIZE + 8,
                        top: Math.max(8, (bomb.y - bomb.range) * CELL_SIZE + 8),
                        width: CELL_SIZE,
                        height: (Math.min(GRID_HEIGHT, bomb.y + bomb.range + 1) - Math.max(0, bomb.y - bomb.range)) * CELL_SIZE
                     }}
                   />
                   <div 
                     className="absolute z-0 bg-red-500/20 animate-pulse border-y border-red-500/30"
                     style={{
                        top: bomb.y * CELL_SIZE + 8,
                        left: Math.max(8, (bomb.x - bomb.range) * CELL_SIZE + 8),
                        height: CELL_SIZE,
                        width: (Math.min(GRID_WIDTH, bomb.x + bomb.range + 1) - Math.max(0, bomb.x - bomb.range)) * CELL_SIZE
                     }}
                   />
                 </>
              )}
              
              <div className="absolute z-10 flex items-center justify-center" style={{ width: CELL_SIZE, height: CELL_SIZE, left: bomb.x * CELL_SIZE + 8, top: bomb.y * CELL_SIZE + 8 }}>
                <div className="relative w-10 h-10 bg-zinc-950 rounded-full shadow-2xl border-2 border-zinc-800 animate-pulse">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-zinc-700 rounded-full"></div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full blur-[2px] animate-[pulse-fuse_0.4s_infinite]"></div>
                </div>
              </div>
            </React.Fragment>
          ))}

          {explosions.map(exp => (
            <div key={exp.id} className="absolute z-20 flex items-center justify-center overflow-visible" style={{ width: CELL_SIZE, height: CELL_SIZE, left: exp.x * CELL_SIZE + 8, top: exp.y * CELL_SIZE + 8 }}>
              <div className="relative w-full h-full flex items-center justify-center">
                 <div className={`absolute w-[120%] h-[120%] rounded-full mix-blend-screen animate-fire ${exp.type === 'center' ? 'bg-orange-500 blur-md' : 'bg-red-600 blur-sm'}`} />
                 <div className={`absolute w-[80%] h-[80%] rounded-md animate-fire ${exp.type === 'center' ? 'bg-yellow-200' : 'bg-orange-400'}`} />
                 {Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="fire-particle" style={{ '--tx': `${(Math.random() - 0.5) * 80}px`, '--ty': `${(Math.random() - 0.5) * 80}px`, animationDelay: `${Math.random() * 0.2}s` } as any} />
                 ))}
              </div>
            </div>
          ))}

          {/* PLAYER RENDER */}
          {renderPlayer()}

          {enemies.map(en => (
            <div key={en.id} className="absolute z-40 transition-all duration-500 flex items-center justify-center" 
                 style={{ width: CELL_SIZE, height: CELL_SIZE, left: en.x * CELL_SIZE + 8, top: en.y * CELL_SIZE + 8 }}>
               {renderEnemy(en)}
            </div>
          ))}
          
          {dyingEnemies.map(en => (
             <div key={en.id} className="absolute z-50 flex items-center justify-center animate-die" 
                  style={{ width: CELL_SIZE, height: CELL_SIZE, left: en.x * CELL_SIZE + 8, top: en.y * CELL_SIZE + 8 }}>
                {renderEnemy(en)}
             </div>
          ))}

          {status !== GameStatus.PLAYING && (
            <Overlay 
              status={status}
              title={status === GameStatus.LEVEL_COMPLETE ? "SECTOR CLEARED" : status === GameStatus.PAUSED ? "SYSTEM PAUSED" : status === GameStatus.GAME_OVER ? "CRITICAL FAILURE" : "WINNER"} 
              subtitle={`SCORE: ${playerStats.score} | TIME: ${elapsedTime}s`}
              buttonText={status === GameStatus.LEVEL_COMPLETE ? "INIT NEXT SECTOR" : status === GameStatus.PAUSED ? "RESUME MISSION" : "RETRY SECTOR"} 
              secondaryButtonText="GALAXY MAP"
              onSecondaryClick={() => setStatus(GameStatus.MENU)}
              onClick={() => { 
                if (status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING); 
                else if (status === GameStatus.LEVEL_COMPLETE) initLevel(level + 1); 
                else initLevel(level, false); 
              }} 
              showSkins={status === GameStatus.PAUSED} 
              currentSkinId={currentSkinId} 
              onSkinSelect={changeSkin} 
              highScore={highScore}
              debugSkins={debugUnlockedSkins}
              currentPlanet={currentPlanet}
              level={level}
              score={playerStats.score}
              time={elapsedTime}
            />
          )}
        </div>
      </div>
      <TouchControls onMove={setActiveTouchDir} onBomb={plantBomb} />
    </div>
  );
};

// Componente para el Resumen Retro Moderno del Nivel
const LevelSummary = ({ level, score, time }: { level: number, score: number, time: number }) => (
  <div className="w-full bg-zinc-900/90 border border-green-500/30 p-4 rounded-lg mb-6 font-digital text-green-400 relative overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.1)]">
    <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-20"></div>
    <div className="flex justify-between items-center border-b border-green-500/30 pb-2 mb-3">
      <span className="text-xs tracking-widest uppercase">MISSION REPORT</span>
      <span className="text-xs">LOG #00{level}</span>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm uppercase text-green-600">Time Elapsed</span>
        <span className="text-xl tracking-wider">{time.toFixed(2)}s</span>
      </div>
      <div className="h-1 bg-green-900/50 w-full rounded-full overflow-hidden">
         <div className="h-full bg-green-500 w-[70%] shadow-[0_0_10px_green]"></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm uppercase text-green-600">Total Score</span>
        <span className="text-xl tracking-wider">{score.toLocaleString()}</span>
      </div>
       <div className="h-1 bg-green-900/50 w-full rounded-full overflow-hidden">
         <div className="h-full bg-green-500 w-[45%] shadow-[0_0_10px_green]"></div>
      </div>
      
      <div className="flex justify-between items-center pt-2 text-xs text-green-700">
        <span>STATUS</span>
        <span className="animate-pulse">COMPLETED</span>
      </div>
    </div>
  </div>
);

const Overlay = ({ status, title, subtitle, buttonText, secondaryButtonText, onClick, onSecondaryClick, showSkins, currentSkinId, onSkinSelect, highScore, debugSkins, currentPlanet, level, score, time }: any) => {
  const isLevelComplete = status === GameStatus.LEVEL_COMPLETE;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl rounded-2xl border-4 border-white/10 shadow-2xl p-6 overflow-y-auto">
      
      {!isLevelComplete && (
        <>
          <h1 className="text-4xl font-game mb-2 text-white italic tracking-tighter drop-shadow-2xl text-center uppercase">{title}</h1>
          <p className="text-xs mb-8 text-indigo-400 font-bold uppercase tracking-widest text-center">{subtitle}</p>
        </>
      )}

      {isLevelComplete && (
         <LevelSummary level={level} score={score} time={time} />
      )}
      
      <div className="flex flex-col gap-4 w-full max-w-[200px] mb-8">
        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-game text-xl tracking-widest shadow-xl active:scale-95 transition-transform border border-indigo-400/50" onClick={onClick}>
          {buttonText}
        </button>

        {secondaryButtonText && (
          <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full font-game text-sm tracking-widest shadow-xl active:scale-95 transition-transform border border-zinc-600" onClick={onSecondaryClick}>
            {secondaryButtonText}
          </button>
        )}
      </div>

      {showSkins && (
        <div className="mb-8 w-full flex flex-col items-center max-w-sm">
          <span className="text-[10px] text-zinc-500 font-black uppercase mb-4 tracking-[0.2em]">Personalización</span>
          <div className="grid grid-cols-3 gap-6">
            {SKINS.map(skin => {
              const isLocked = !debugSkins && highScore < skin.requiredScore;
              return (
                <div key={skin.id} className="flex flex-col items-center gap-1">
                  <button 
                    onClick={() => !isLocked && onSkinSelect(skin.id)}
                    className={`relative w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${skin.color} ${skin.borderColor} ${skin.glowColor} ${currentSkinId === skin.id ? 'scale-110 border-white' : ''} ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                  >
                    {isLocked ? <svg className="w-5 h-5 fill-zinc-400" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg> : skin.emoji}
                    {!isLocked && <div className={`absolute -top-1 right-1 w-2 h-2 ${skin.ledColor} rounded-full animate-led`}></div>}
                  </button>
                  <span className={`text-[7px] font-black uppercase ${isLocked ? 'text-rose-500' : 'text-zinc-400'}`}>{isLocked ? `REQ: ${skin.requiredScore}` : skin.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
