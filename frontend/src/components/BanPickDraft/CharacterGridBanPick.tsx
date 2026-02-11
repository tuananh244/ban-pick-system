import React, { useState, useEffect, useMemo } from 'react';
import type { Character } from "../../types/characters";
import { loadCharacters } from "../../loader/loadCharacters";

const ELEMENTS = ['Physical', 'Fire', 'Ice', 'Lightning', 'Wind', 'Quantum', 'Imaginary'];
const PATHS = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance', 'Elation'];

interface Props {
  role: 'admin' | 'player'; 
  side: 'p1' | 'p2' | 'admin'; 
  turn: 'p1' | 'p2';
  phase: 'BAN' | 'PICK';
  onSelect: (char: Character) => void;
  onHover?: (char: Character) => void; 
  disabledIds?: (number | string)[]; 
  p1PreSelectId?: string; 
  p2PreSelectId?: string; 
}

const CharacterGridBanPick: React.FC<Props> = ({ 
  role, side, turn, phase, onSelect, onHover, disabledIds = [], p1PreSelectId, p2PreSelectId 
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [preSelected, setPreSelected] = useState<Character | null>(null);

  const isMyTurn = role === 'admin' || side === turn;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadCharacters();
        setCharacters(Array.isArray(data) ? data : []);
      } catch (err) { 
        console.error("Load characters error:", err); 
        setCharacters([]);
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setPreSelected(null);
  }, [turn, phase]);

  const safeDisabledIds = useMemo(() => Array.isArray(disabledIds) ? disabledIds.map(String) : [], [disabledIds]);

  const filtered = useMemo(() => {
    return characters.filter(c => {
      const matchName = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchElement = selectedElement ? c.elementEn === selectedElement : true;
      const matchPath = selectedPath ? c.pathEn === selectedPath : true;
      return matchName && matchElement && matchPath;
    });
  }, [searchTerm, selectedElement, selectedPath, characters]);

  // --- HÀM XỬ LÝ KHI CLICK (GỬI PRE-SELECT NGAY) ---
  const handleCharacterClick = (char: Character) => {
    if (!isMyTurn || safeDisabledIds.includes(String(char.id))) return;

    // 1. Cập nhật giao diện tại chỗ (hiện nút Confirm)
    setPreSelected(char);

    // 2. Gửi tín hiệu socket thông qua callback onHover
    // (Trong DraftRoomBanPick, onHover đã được nối với sendAction("client_preselect", char))
    if (onHover) {
      onHover(char);
    }
  };

  return (
    <div className="flex-1 rounded-[1.5rem] border border-white/10 bg-[#0b0e14]/90 flex flex-col overflow-hidden backdrop-blur-md shadow-2xl relative">
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
      `}</style>

      {/* FILTER AREA */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#11141b]/50 shrink-0 flex flex-col gap-2 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedElement(null)} className={`h-6 px-2 rounded text-[9px] font-black border transition-all ${!selectedElement ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-transparent text-gray-500 border-gray-700'}`}>ALL</button>
            <div className="flex gap-1">
              {ELEMENTS.map(el => (
                <button key={el} onClick={() => setSelectedElement(selectedElement === el ? null : el)} className={`w-8 h-8 rounded-md p-1 transition-all border ${selectedElement === el ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-transparent border-transparent hover:border-gray-700 opacity-50 hover:opacity-100'}`}>
                  <img src={`/images/types/${el}.png`} className="w-full h-full object-contain" alt={el} />
                </button>
              ))}
            </div>
          </div>
          <input 
            type="text" placeholder="SEARCH..."
            className="bg-[#0b0d12] border border-gray-800 rounded px-3 py-1 text-[10px] font-black outline-none focus:border-cyan-500 w-32 uppercase text-white transition-all focus:bg-black"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedPath(null)} className={`h-6 px-2 rounded text-[9px] font-black border transition-all ${!selectedPath ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-transparent text-gray-500 border-gray-700'}`}>ALL</button>
          <div className="flex gap-1">
            {PATHS.map(pa => (
              <button key={pa} onClick={() => setSelectedPath(selectedPath === pa ? null : pa)} className={`w-8 h-8 rounded-md p-1 transition-all border ${selectedPath === pa ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-transparent border-transparent hover:border-gray-700 opacity-50 hover:opacity-100'}`}>
                <img src={`/images/path/${pa}.png`} className="w-full h-full object-contain brightness-125" alt={pa} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID AREA */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0b0e14]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-cyan-500 font-black italic animate-pulse text-xs tracking-widest">INITIALIZING DATABASE...</div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 pb-20">
            {filtered.map((char) => {
              const charIdStr = String(char.id);
              const isLocked = safeDisabledIds.includes(charIdStr);
              const isP1Pre = p1PreSelectId === charIdStr;
              const isP2Pre = p2PreSelectId === charIdStr;
              const isLocalSelected = preSelected?.id === char.id;
              const isFiveStar = char.rarity === 5;
              
              // --- MÀU SẮC NHẠT & VIỀN THEO HÌNH MẪU ---
              const rarityTheme = isFiveStar 
                ? {
                    border: "border-[#d4af37]", // Vàng
                    bgGradient: "bg-gradient-to-br from-[#d4af37]/10 to-[#000]/60", 
                    barColor: "bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)]",
                  }
                : {
                    border: "border-[#7c3aed]", // Tím
                    bgGradient: "bg-gradient-to-br from-[#7c3aed]/10 to-[#000]/60", 
                    barColor: "bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.8)]",
                  };

              let statusBorder = rarityTheme.border;
              let glowClass = "";

              if (isLocalSelected) {
                statusBorder = phase === 'PICK' ? 'border-cyan-400 border-[2.5px]' : 'border-red-500 border-[2.5px]';
                glowClass = phase === 'PICK' ? 'shadow-[0_0_15px_rgba(34,211,238,0.7)] scale-105' : 'shadow-[0_0_15px_rgba(239,68,68,0.7)] scale-105';
              } else if (isP1Pre) {
                statusBorder = 'border-pink-500 border-[2.5px]';
                glowClass = 'shadow-[0_0_12px_rgba(236,72,153,0.6)] scale-[1.02]';
              } else if (isP2Pre) {
                statusBorder = 'border-cyan-400 border-[2.5px]';
                glowClass = 'shadow-[0_0_12px_rgba(34,211,238,0.6)] scale-[1.02]';
              }

              return (
                <div 
                  key={char.id}
                  onClick={() => handleCharacterClick(char)}
                  className={`
                    relative transition-all duration-300 aspect-[2/3] cursor-pointer select-none group
                    ${isLocked ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-105 hover:brightness-110'}
                    ${glowClass}
                  `}
                >
                  <div className={`
                    w-full h-full rounded-xl overflow-hidden border-[1.5px] transition-all duration-300 relative
                    ${statusBorder} bg-[#0c0e12]
                  `}>
                    
                    <div className={`absolute inset-0 ${rarityTheme.bgGradient}`} />

                    <img 
                      src={char.image} 
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" 
                      alt={char.name} 
                    />
                    
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Badge Monitor (For Admin/Viewer) */}
                    {(isP1Pre || isP2Pre) && !isLocalSelected && (
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-sm text-[7px] font-black text-white uppercase shadow-lg ${isP1Pre ? 'bg-pink-500' : 'bg-cyan-400'}`}>
                        {isP1Pre ? 'P1' : 'P2'} TARGET
                      </div>
                    )}

                    {/* Character Name Area */}
                    <div className="absolute bottom-2 inset-x-0 px-2 flex flex-col items-center">
                      <h3 className="text-white font-black text-[11px] uppercase tracking-tighter drop-shadow-[0_2px_3px_rgba(0,0,0,1)] text-center">
                        {char.name}
                      </h3>
                      {/* Decorative Rarity Bar dưới tên */}
                      <div className={`h-[3px] w-1/2 mt-1 rounded-full ${rarityTheme.barColor}`} />
                    </div>

                    {/* Locked Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-white/30" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                    )}
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
              group flex items-center gap-4 pl-5 pr-4 py-3 rounded-2xl shadow-2xl 
              border-b-4 active:scale-95 active:border-b-0 translate-y-0 active:translate-y-1 transition-all
              ${phase === 'BAN' ? 'bg-red-600 border-red-800 text-white' : 'bg-cyan-500 border-cyan-700 text-black'}
            `}
          >
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">
                {phase === 'BAN' ? 'RESTRICT' : 'AUTHORIZE'}
              </span>
              <span className="text-lg font-black uppercase italic truncate max-w-[160px] tracking-tight">{preSelected.name}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner ${phase === 'BAN' ? 'bg-black/30 text-white' : 'bg-black/20 text-black'}`}>
              {phase === 'BAN' ? '✕' : '✓'}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterGridBanPick;