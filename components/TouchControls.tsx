
import React from 'react';

interface TouchControlsProps {
  onMove: (dir: 'up' | 'down' | 'left' | 'right' | null) => void;
  onBomb: () => void;
}

const TouchControls: React.FC<TouchControlsProps> = ({ onMove, onBomb }) => {
  // Función auxiliar para detener el movimiento de forma segura
  const stopMove = (e: React.PointerEvent) => {
    e.preventDefault();
    onMove(null);
  };

  return (
    <div className="w-full bg-zinc-900/95 backdrop-blur-xl border-t-4 border-zinc-800 px-2 py-6 pb-12 flex justify-between items-center pointer-events-auto select-none safe-area-bottom shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
      
      {/* SNES D-PAD GIGANTE (Cruceta) */}
      <div className="relative w-56 h-56 flex items-center justify-center ml-2" onContextMenu={(e) => e.preventDefault()}>
        {/* Fondo de la cruceta */}
        <div className="absolute w-52 h-52 bg-zinc-800/50 rounded-full shadow-inner border-2 border-zinc-700/30"></div>
        
        {/* Estructura de la cruceta */}
        <div className="relative w-48 h-48 grid grid-cols-3 grid-rows-3 gap-1">
          <div />
          {/* ARRIBA */}
          <button 
            onPointerDown={(e) => { e.preventDefault(); onMove('up'); }}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            onPointerCancel={stopMove}
            className="bg-zinc-700 active:bg-zinc-500 rounded-t-xl shadow-2xl flex items-center justify-center border-b-8 border-zinc-950 active:border-b-0 active:translate-y-2 transition-all"
          >
            <span className="text-zinc-200 text-4xl">▲</span>
          </button>
          <div />

          {/* IZQUIERDA */}
          <button 
            onPointerDown={(e) => { e.preventDefault(); onMove('left'); }}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            onPointerCancel={stopMove}
            className="bg-zinc-700 active:bg-zinc-500 rounded-l-xl shadow-2xl flex items-center justify-center border-r-8 border-zinc-950 active:border-r-0 active:translate-x-2 transition-all"
          >
            <span className="text-zinc-200 text-4xl">◀</span>
          </button>
          
          {/* CENTRO */}
          <div className="bg-zinc-700 flex items-center justify-center border-zinc-950">
            <div className="w-6 h-6 bg-zinc-900 rounded-full shadow-inner opacity-40"></div>
          </div>

          {/* DERECHA */}
          <button 
            onPointerDown={(e) => { e.preventDefault(); onMove('right'); }}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            onPointerCancel={stopMove}
            className="bg-zinc-700 active:bg-zinc-500 rounded-r-xl shadow-2xl flex items-center justify-center border-l-8 border-zinc-950 active:border-l-0 active:-translate-x-2 transition-all"
          >
            <span className="text-zinc-200 text-4xl">▶</span>
          </button>

          <div />
          {/* ABAJO */}
          <button 
            onPointerDown={(e) => { e.preventDefault(); onMove('down'); }}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            onPointerCancel={stopMove}
            className="bg-zinc-700 active:bg-zinc-500 rounded-b-xl shadow-2xl flex items-center justify-center border-t-8 border-zinc-950 active:border-t-0 active:-translate-y-2 transition-all"
          >
            <span className="text-zinc-200 text-4xl">▼</span>
          </button>
          <div />
        </div>
      </div>

      {/* PANEL DE ACCIÓN */}
      <div className="flex flex-col items-center gap-4 pr-6">
        <div className="bg-zinc-800/80 p-5 rounded-[40px] rotate-6 shadow-2xl border border-zinc-700/50">
           <button 
            onPointerDown={(e) => { e.preventDefault(); onBomb(); }}
            className="w-28 h-28 bg-red-600 active:bg-red-400 border-b-[10px] border-red-900 active:border-b-0 active:translate-y-2 rounded-full shadow-[0_15px_30px_rgba(220,38,38,0.4)] flex items-center justify-center transition-all group"
          >
            <div className="flex flex-col items-center">
              <span className="text-white font-black text-4xl italic tracking-tighter group-active:scale-90">B</span>
              <span className="text-xs text-white/60 font-bold -mt-1 uppercase">Bomb</span>
            </div>
          </button>
        </div>
        <div className="flex gap-4 opacity-40">
           <div className="w-10 h-3 bg-zinc-700 rounded-full rotate-[ -20deg ] shadow-inner"></div>
           <div className="w-10 h-3 bg-zinc-700 rounded-full rotate-[ -20deg ] shadow-inner"></div>
        </div>
      </div>

    </div>
  );
};

export default TouchControls;
