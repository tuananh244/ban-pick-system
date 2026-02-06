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
  disabledIds?: number[]; // Các ID đã bị Ban hoặc Pick trước đó
}

const CharacterGridBanPick: React.FC<Props> = ({ role, side, turn, phase, onSelect, disabledIds = [] }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [preSelected, setPreSelected] = useState<Character | null>(null);

  // Kiểm tra xem có phải lượt của mình không
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

  // Reset lựa chọn tạm thời khi đổi lượt
  useEffect(() => {
    setPreSelected(null);
  }, [turn, phase]);

  const safeDisabledIds = useMemo(() => Array.isArray(disabledIds) ? disabledIds : [], [disabledIds]);

  // --- LOGIC FILTER ---
  const filtered = useMemo(() => {
    return characters.filter(c => {
      const matchName = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchElement = selectedElement ? c.elementEn === selectedElement : true;
      const matchPath = selectedPath ? c.pathEn === selectedPath : true;
      return matchName && matchElement && matchPath;
    });
  }, [searchTerm, selectedElement, selectedPath, characters]);

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
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 pb-20">
            {filtered.map((char) => {
              const isLocked = safeDisabledIds.includes(Number(char.id)) || (char.id && safeDisabledIds.includes(char.id as any));
              const isSelected = preSelected?.id === char.id;
              const isFiveStar = char.rarity === 5;
              
              // --- THEME MÀU SẮC (Giống CharacterCard) ---
              const theme = isFiveStar 
                ? {
                    border: "border-[#d4af37]", 
                    bgGradient: "bg-gradient-to-b from-[#1f1605] to-[#000000]",
                    textColor: "text-[#ffd700]",
                    shadow: "shadow-[0_0_15px_rgba(255,215,0,0.3)]",
                    overlay: "from-yellow-900"
                  }
                : {
                    border: "border-[#7c3aed]", 
                    bgGradient: "bg-gradient-to-b from-[#110e1c] to-[#000000]",
                    textColor: "text-[#c4b5fd]",
                    shadow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
                    overlay: "from-purple-950"
                  };

              // --- HIỆU ỨNG KHI ĐƯỢC CHỌN (PRE-SELECTED) ---
              // Pick -> Xanh Cyan / Ban -> Đỏ
              const selectionGlow = phase === 'PICK' 
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] scale-105 z-10' 
                : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105 z-10';

              return (
                <div 
                  key={char.id}
                  onClick={() => isMyTurn && !isLocked && setPreSelected(char)}
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
                      src={char.image} 
                      className={`
                        absolute inset-0 w-full h-full object-cover transition-transform duration-500
                        ${isMyTurn && !isLocked ? 'group-hover:scale-110' : ''}
                        ${isSelected ? 'scale-110' : ''}
                      `} 
                      alt={char.name} 
                    />
                    
                    {/* GRADIENT ĐÁY (Làm nổi tên) */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* ICONS (TOP RIGHT - Chuẩn format CharacterCard) */}
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                       <div className="w-4 h-4 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 shadow flex items-center justify-center">
                          <img src={`/images/types/${char.elementEn}.png`} className="w-full h-full object-contain" alt="ele" />
                       </div>
                       <div className="w-4 h-4 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 shadow flex items-center justify-center">
                          <img src={`/images/path/${char.pathEn}.png`} className="w-full h-full object-contain" alt="path" />
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
                        {char.name}
                      </div>
                      {/* Thanh màu dưới tên */}
                      <div className={`h-[1.5px] w-1/2 mx-auto mt-0.5 rounded-full ${isFiveStar ? 'bg-yellow-500' : 'bg-purple-500'} ${isSelected ? 'bg-white shadow-[0_0_5px_white]' : ''}`} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM BUTTON (Nổi lên khi chọn) */}
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
                {phase === 'BAN' ? 'CONFIRM BAN' : 'CONFIRM PICK'}
              </span>
              <span className="text-sm font-black uppercase italic truncate max-w-[120px]">{preSelected.name}</span>
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

export default CharacterGridBanPick;