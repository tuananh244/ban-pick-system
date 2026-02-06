import React, { useState, useEffect, useMemo } from 'react';
import type { Weapon } from "../../types/weapons";
import { loadWeapons } from "../../loader/loadWeapons";

const PATHS = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance', 'Elation'];

interface Props {
  role: 'admin' | 'player';
  side: 'p1' | 'p2' | 'admin';
  turn: 'p1' | 'p2';
  phase: 'BAN' | 'PICK';
  onSelect: (weapon: Weapon) => void;
  disabledIds?: string[];
}

const WeaponGridBanPick: React.FC<Props> = ({ role, side, turn, phase, onSelect, disabledIds = [] }) => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [preSelected, setPreSelected] = useState<Weapon | null>(null);

  const isMyTurn = role === 'admin' || side === turn;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadWeapons();
        setWeapons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load weapons error:", err);
        setWeapons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset lựa chọn khi đổi lượt
  useEffect(() => {
    setPreSelected(null);
  }, [turn, phase]);

  const safeDisabledIds = useMemo(() => Array.isArray(disabledIds) ? disabledIds : [], [disabledIds]);

  // --- LOGIC FILTER ---
  const filtered = useMemo(() => {
    return weapons.filter(w => {
      const matchName = w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchPath = selectedPath ? w.path === selectedPath : true;
      return matchName && matchPath;
    });
  }, [searchTerm, selectedPath, weapons]);

  return (
    <div className="flex-1 rounded-[1.5rem] border border-white/10 bg-[#0b0e14]/90 flex flex-col overflow-hidden backdrop-blur-md shadow-2xl relative">
      
      {/* CSS SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
      `}</style>

      {/* FILTER AREA */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#11141b]/50 shrink-0 flex justify-between items-center gap-4 z-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSelectedPath(null)} 
            className={`h-7 px-3 rounded text-[9px] font-black border transition-all ${!selectedPath ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-transparent text-gray-500 border-gray-700'}`}
          >
            ALL
          </button>
          <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[50vw]">
            {PATHS.map(pa => (
              <button 
                key={pa} 
                onClick={() => setSelectedPath(selectedPath === pa ? null : pa)} 
                className={`w-7 h-7 rounded-md p-1 shrink-0 transition-all border ${selectedPath === pa ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-transparent border-transparent hover:border-gray-700 opacity-50 hover:opacity-100'}`}
              >
                <img src={`/images/path/${pa}.png`} className="w-full h-full object-contain brightness-125" alt={pa} />
              </button>
            ))}
          </div>
        </div>

        <input 
          type="text" 
          placeholder="SEARCH LC..."
          className="bg-[#0b0d12] border border-gray-800 rounded px-3 py-1 text-[10px] font-black outline-none focus:border-cyan-500 w-36 uppercase text-white transition-all focus:bg-black"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRID AREA */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0b0e14]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-cyan-500 font-black italic animate-pulse text-xs tracking-widest">LOADING LIGHT CONES...</div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 pb-20">
            {filtered.map((w) => {
              const isLocked = safeDisabledIds.includes(w.id);
              const isSelected = preSelected?.id === w.id;
              
              // --- THEME CONFIGURATION ---
              let theme;
              switch (w.rarity) {
                case 5:
                  theme = {
                    border: "border-[#d4af37]", 
                    bgGradient: "bg-gradient-to-b from-[#1f1605] to-[#000000]",
                    textColor: "text-[#ffd700]",
                    shadow: "shadow-[0_0_15px_rgba(255,215,0,0.3)]",
                    overlay: "from-yellow-900",
                    barColor: "bg-yellow-500 shadow-[0_0_5px_#eab308]"
                  };
                  break;
                case 4:
                  theme = {
                    border: "border-[#7c3aed]", 
                    bgGradient: "bg-gradient-to-b from-[#110e1c] to-[#000000]",
                    textColor: "text-[#c4b5fd]",
                    shadow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                    overlay: "from-purple-950",
                    barColor: "bg-purple-500 shadow-[0_0_5px_#a855f7]"
                  };
                  break;
                default: // 3 Sao -> Xanh Dương
                  theme = {
                    border: "border-[#0ea5e9]", 
                    bgGradient: "bg-gradient-to-b from-[#0c1620] to-[#000000]",
                    textColor: "text-[#7dd3fc]",
                    shadow: "shadow-[0_0_15px_rgba(14,165,233,0.3)]",
                    overlay: "from-sky-950",
                    barColor: "bg-sky-500 shadow-[0_0_5px_#0ea5e9]"
                  };
              }

              // Hiệu ứng chọn (Pick/Ban)
              const selectionGlow = phase === 'PICK' 
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-105 z-10' 
                : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105 z-10';

              return (
                <div 
                  key={w.id}
                  onClick={() => isMyTurn && !isLocked && setPreSelected(w)}
                  className={`
                    relative transition-all duration-200 aspect-[4/5] rounded-lg cursor-pointer select-none group
                    ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}
                    ${isMyTurn && !isLocked ? 'hover:-translate-y-1 hover:z-20' : ''}
                  `}
                >
                   {/* CARD CONTAINER */}
                   <div className={`
                    w-full h-full rounded-lg overflow-hidden border-[1.5px] bg-black
                    transition-all duration-300
                    ${isSelected ? selectionGlow : `${theme.border} ${isMyTurn && !isLocked ? 'group-hover:brightness-125' : ''}`}
                  `}>

                    {/* BACKGROUND GRADIENT */}
                    <div className={`absolute inset-0 ${theme.bgGradient}`} />
                    <div className={`absolute inset-0 opacity-30 bg-gradient-to-t ${theme.overlay} to-transparent`} />

                    {/* IMAGE */}
                    <img 
                      src={`/images/weapons/${w.imageFile}`} 
                      className={`
                        absolute inset-0 w-full h-full object-cover transition-transform duration-500
                        ${isMyTurn && !isLocked ? 'group-hover:scale-110' : ''}
                        ${isSelected ? 'scale-110' : ''}
                      `} 
                      alt={w.name}
                      onError={(e) => { e.currentTarget.src = '/weapons/placeholder.png' }}
                    />
                    
                    {/* GRADIENT ĐÁY */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* PATH ICON (Góc phải trên) */}
                    <div className="absolute top-1 right-1">
                       <div className="w-5 h-5 bg-black/60 backdrop-blur-sm rounded-full p-1 border border-white/10 shadow flex items-center justify-center">
                          <img src={`/images/path/${w.path}.png`} className="w-full h-full object-contain brightness-125" alt="path" />
                       </div>
                    </div>

                    {/* LOCKED OVERLAY */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                         <div className="border border-white/20 bg-black/50 p-1 rounded-full">
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-gray-400" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      </div>
                    )}

                    {/* NAME & RARITY BAR */}
                    <div className="absolute bottom-1.5 left-0 w-full px-1 text-center z-10">
                      <div className={`text-[9px] font-black uppercase tracking-tighter truncate drop-shadow-md ${isSelected ? 'text-white' : theme.textColor}`}>
                        {w.name}
                      </div>
                      {/* Thanh màu dưới tên (phân biệt rarity) */}
                      <div className={`h-[1.5px] w-1/2 mx-auto mt-0.5 rounded-full ${isSelected ? 'bg-white shadow-[0_0_5px_white]' : theme.barColor}`} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM BUTTON */}
      {isMyTurn && preSelected && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => { onSelect(preSelected); setPreSelected(null); }}
            className={`
              group flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] 
              border-b-4 active:scale-95 active:border-b-0 translate-y-0 active:translate-y-1 transition-all
              ${phase === 'BAN' 
                ? 'bg-red-600 hover:bg-red-500 border-red-800 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                : 'bg-cyan-500 hover:bg-cyan-400 border-cyan-700 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'}
            `}
          >
            <div className="flex flex-col items-start leading-none">
              <span className={`text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5`}>
                {phase === 'BAN' ? 'RESTRICT LC' : 'CONFIRM LC'}
              </span>
              <span className="text-sm font-black uppercase italic truncate max-w-[150px]">{preSelected.name}</span>
            </div>
            
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${phase === 'BAN' ? 'bg-black/20 text-white' : 'bg-black/10 text-black'}`}>
              {phase === 'BAN' ? '✕' : '✓'}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default WeaponGridBanPick;