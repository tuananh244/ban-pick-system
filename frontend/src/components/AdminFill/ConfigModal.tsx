import React, { useState, useMemo, useEffect } from 'react';
import { translatePathToEn } from "../../utils/mapper";

// --- HELPERS ---
const PATHS = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance', 'Elation'];

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

interface Props {
  mode: number;
  char: any;
  weapons: any[];
  bannedWeaponIds: Set<any>;
  onClose: () => void;
  onUpdate: (updates: any) => void;
}

const ConfigModal: React.FC<Props> = ({ mode, char, weapons, bannedWeaponIds, onClose, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null); 

  useEffect(() => {
    if (char?.path) {
       const pathEn = translatePathToEn(char.path);
       if (PATHS.includes(pathEn)) {
          setSelectedPath(pathEn);
       } else {
          setSelectedPath(null);
       }
       setSearchTerm('');
       setSelectedRarity(null);
    }
  }, [char.id]);

  // --- THEME HELPER (MÀU CHỮ THEO ĐỘ HIẾM) ---
  const getTheme = (rarity: number) => {
    switch (rarity) {
      case 5: return { 
          border: 'border-[#d4af37]', 
          shadow: 'shadow-[0_0_15px_rgba(255,215,0,0.4)]', 
          text: 'text-[#ffd700]', // Vàng
          bg: 'bg-[#1f1605]' 
      };
      case 4: return { 
          border: 'border-[#7c3aed]', 
          shadow: 'shadow-[0_0_15px_rgba(124,58,237,0.4)]', 
          text: 'text-[#c4b5fd]', // Tím nhạt
          bg: 'bg-[#110e1c]' 
      };
      default: return { 
          border: 'border-[#0ea5e9]', 
          shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.4)]', 
          text: 'text-[#7dd3fc]', // Xanh dương
          bg: 'bg-[#0c1620]' 
      };
    }
  };

  const filteredWeapons = useMemo(() => {
    return weapons.filter(w => {
      if (bannedWeaponIds.has(w.id)) return false;
      const matchName = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      const weaponPathEn = translatePathToEn(w.path);
      const matchPath = selectedPath ? weaponPathEn === selectedPath : true;
      const matchRarity = selectedRarity ? w.rarity === selectedRarity : true;
      return matchName && matchPath && matchRarity;
    });
  }, [weapons, searchTerm, selectedPath, selectedRarity, bannedWeaponIds]);

  if (mode !== 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div 
            className="flex flex-row h-[600px] w-[950px] bg-[#0b0e14]/95 border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl backdrop-blur-xl relative"
            onClick={e => e.stopPropagation()}
        >
      
      <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 bg-red-600/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-110 border border-white/20">✕</button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>

      {/* LEFT COLUMN: EIDOLON */}
      <div className="w-20 bg-[#080a0f] border-r border-white/5 flex flex-col items-center py-4 shrink-0 z-10 relative">
        <span className="text-[14px] font-black text-white/20 uppercase -rotate-90 py-10 tracking-[0.2em] whitespace-nowrap absolute top-10 left-1/2 -translate-x-1/2 origin-center select-none">EIDOLON</span>
        <div className="flex-1 flex flex-col justify-end gap-2 w-full px-2 pb-2">
          {[6, 5, 4, 3, 2, 1, 0].map(lvl => {
             const isActive = (char.eidolon || 0) === lvl;
             return (
              <button
                key={lvl}
                onClick={() => onUpdate({ eidolon: lvl })}
                className={`aspect-square w-full rounded-lg flex items-center justify-center font-black text-sm transition-all duration-200 border relative group ${isActive ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105 z-10' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-white'}`}
              >
                {lvl}
                {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg" />}
              </button>
             );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[#11141b] to-[#0b0e14]">
        
        {/* HEADER */}
        <div className="flex flex-col border-b border-white/5 bg-[#14171f] p-4 gap-4 shrink-0 shadow-lg z-20">
          <div className="flex items-end justify-between gap-4 mr-8"> 
             
             {/* Unit Info */}
             <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
               <div className="w-16 h-16 rounded-xl border border-white/20 overflow-hidden shadow-lg shrink-0 bg-black">
                  <img src={char.image} className="w-full h-full object-cover" alt={char.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
               </div>
               <div className="flex flex-col min-w-0">
                   <div className="flex items-center gap-2 mb-1 opacity-50">
                      <img src={`/images/path/${translatePathToEn(char.path)}.png`} className="w-5 h-5 object-contain brightness-0 invert" alt={char.path} onError={(e) => e.currentTarget.style.display='none'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">{translatePathToEn(char.path)}</span>
                   </div>
                   <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none drop-shadow-lg truncate" title={char.name}>{char.name}</h3>
               </div>
             </div>

             {/* Filters */}
             <div className="flex flex-col items-end gap-2 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="flex gap-1">
                   {[5, 4, 3].map(r => (
                     <button key={r} onClick={() => setSelectedRarity(selectedRarity === r ? null : r)} className={`h-6 w-8 rounded text-[10px] font-black border transition-all flex items-center justify-center gap-0.5 ${selectedRarity === r ? (r === 5 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : r === 4 ? 'bg-purple-500/20 text-purple-400 border-purple-500' : 'bg-blue-500/20 text-blue-400 border-blue-500') : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}`}>{r}★</button>
                   ))}
                 </div>
                 <div className="w-[1px] h-4 bg-white/10" />
                 <div className="flex gap-1">
                     <button onClick={() => setSelectedPath(null)} className={`h-6 px-2 rounded text-[9px] font-black border transition-all ${!selectedPath ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'}`}>ALL</button>
                     {PATHS.map(p => (
                        <button key={p} onClick={() => setSelectedPath(selectedPath === p ? null : p)} className={`w-6 h-6 p-1 rounded border transition-all ${selectedPath === p ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-white/10 hover:border-white/30 opacity-40 hover:opacity-100'}`} title={p}>
                          <img src={`/images/path/${p}.png`} className={`w-full h-full object-contain ${selectedPath === p ? 'brightness-0' : 'brightness-0 invert'}`} alt={p} />
                        </button>
                     ))}
                 </div>
               </div>
               <input type="text" placeholder="SEARCH LIGHT CONE..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-[10px] text-white outline-none focus:border-cyan-500 w-full uppercase font-bold tracking-wider" />
             </div>
          </div>

          {/* EQUIPPED WEAPON INFO */}
          {char.equippedWeapon && (
            <div className="flex items-center justify-between bg-black/20 rounded-lg p-2 border border-white/5 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-white/10 overflow-hidden shrink-0">
                     <img src={char.equippedWeapon.image} className="w-full h-full object-cover" alt="LC" />
                  </div>
                  <div className="flex flex-col leading-none">
                     <span className="text-[8px] font-bold text-gray-500 uppercase">EQUIPPED</span>
                     {/* --- SỬA Ở ĐÂY: Áp dụng màu chữ theo độ hiếm --- */}
                     <span className={`text-xs font-black uppercase truncate max-w-[200px] ${getTheme(char.equippedWeapon.rarity).text}`}>
                        {char.equippedWeapon.name}
                     </span>
                  </div>
               </div>
               
               <div className="flex gap-2 items-center">
                 <span className="text-[9px] font-black text-gray-500 mr-1">SUPERIMPOSE</span>
                 <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(rank => (
                        <button key={rank} onClick={() => onUpdate({ weaponRank: rank })} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all border ${(char.weaponRank || 1) === rank ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-transparent border-white/10 text-gray-600 hover:text-white hover:border-white/30'}`}>{rank}</button>
                    ))}
                 </div>
                 <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                 <button onClick={() => onUpdate({ equippedWeapon: null, weaponRank: 1 })} className="w-6 h-6 rounded bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all" title="Unequip">✕</button>
               </div>
            </div>
          )}
        </div>

        {/* WEAPON GRID */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
           {filteredWeapons.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
                 <span className="text-4xl mb-2">∅</span>
                 <p className="text-xs font-bold uppercase tracking-widest">No Light Cones Found</p>
              </div>
           ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 pb-10">
                 {filteredWeapons.map((wpn) => {
                    const isEquipped = char.equippedWeapon?.id === wpn.id;
                    const theme = getTheme(wpn.rarity);

                    return (
                      <button
                        key={wpn.id}
                        onClick={() => onUpdate({ equippedWeapon: wpn, weaponRank: 1 })}
                        className={`
                          relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-200 group flex flex-col select-none
                          ${isEquipped 
                             ? `${theme.border} ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-[0.98] z-10` 
                             : 'border-white/5 opacity-60 hover:opacity-100 hover:scale-[1.03] hover:border-white/30 hover:z-10'}
                          ${theme.bg}
                        `}
                      >
                          <img 
                            src={wpn.image} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            alt={wpn.name}
                            onError={(e) => {
                                e.currentTarget.src = `/images/weapons/${wpn.imageFile || ''}`;
                                e.currentTarget.onerror = () => { e.currentTarget.style.display = 'none'; };
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                          <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-10">
                             {[...Array(wpn.rarity)].map((_, i) => (
                               <div key={i} className={theme.text}><StarIcon /></div>
                             ))}
                          </div>
                          
                          {/* TÊN NÓN ÁNH SÁNG - ÁP DỤNG MÀU THEO ĐỘ HIẾM */}
                          <div className="absolute bottom-0 inset-x-0 p-1.5 z-10">
                            <p className={`text-[8px] font-black uppercase text-center leading-tight line-clamp-2 ${theme.text} drop-shadow-md`}>
                              {wpn.name}
                            </p>
                          </div>

                          {isEquipped && (
                            <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none" />
                          )}
                      </button>
                    );
                 })}
              </div>
           )}
        </div>

      </div>
    </div>
    </div>
  );
};

export default ConfigModal;