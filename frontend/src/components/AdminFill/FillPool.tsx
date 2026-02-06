import React, { useState, useMemo } from 'react';
import type { Character } from '../../types/characters';

// --- CONSTANTS ---
const ELEMENTS = ['Physical', 'Fire', 'Ice', 'Lightning', 'Wind', 'Quantum', 'Imaginary'];
const PATHS = ['Destruction', 'Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance', 'Remembrance', 'Elation'];

// --- SUB-COMPONENT: CHARACTER CARD ---
interface CardProps {
    character: Character;
    isOwned: boolean;
    disabled: boolean;
    onClick: () => void;
}

const CharacterCard: React.FC<CardProps> = ({ character, isOwned, disabled, onClick }) => {
    const isFiveStar = character.rarity === 5;
    const elementEn = character.elementEn || character.element?.toLowerCase() || 'unknown';
    const pathEn = character.pathEn || character.path?.toLowerCase() || 'unknown';

    // --- THEME ---
    const theme = isFiveStar 
        ? {
            border: "border-[#d4af37]", 
            bgGradient: "bg-gradient-to-b from-[#1f1605] to-[#000000]",
            textColor: "text-[#ffd700]",
            overlay: "from-yellow-900"
          }
        : {
            border: "border-[#7c3aed]", 
            bgGradient: "bg-gradient-to-b from-[#110e1c] to-[#000000]",
            textColor: "text-[#c4b5fd]",
            overlay: "from-purple-950"
          };

    // Logic: Nếu đã sở hữu (bởi phe mình) hoặc bị disable (chưa chọn slot) thì không tương tác
    const isInteractive = !isOwned && !disabled;

    return (
        <div 
            onClick={isInteractive ? onClick : undefined}
            className={`
                relative transition-all duration-200 aspect-[4/5] rounded-lg select-none group
                ${isInteractive 
                    ? 'cursor-pointer hover:-translate-y-1 hover:z-20' 
                    : 'cursor-not-allowed opacity-50 grayscale'
                }
            `}
        >
            <div className={`
                w-full h-full rounded-lg overflow-hidden border-[1.5px] bg-black
                transition-all duration-300
                ${theme.border} ${isInteractive ? 'group-hover:brightness-125' : ''}
            `}>
                {/* Background */}
                <div className={`absolute inset-0 ${theme.bgGradient}`} />
                <div className={`absolute inset-0 opacity-30 bg-gradient-to-t ${theme.overlay} to-transparent`} />
                
                {/* Image */}
                <img 
                    src={character.image} 
                    className={`
                        absolute inset-0 w-full h-full object-cover transition-transform duration-500
                        ${isInteractive ? 'group-hover:scale-110' : ''}
                    `} 
                    loading="lazy"
                    alt={character.name} 
                />
                
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Icons (White) */}
                <div className="absolute top-1 right-1 flex flex-col gap-1">
                    <div className="w-4 h-4 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 shadow flex items-center justify-center">
                        <img src={`/images/types/${elementEn}.png`} className="w-full h-full object-contain" alt="ele" onError={(e) => e.currentTarget.style.display='none'} />
                    </div>
                    <div className="w-4 h-4 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 shadow flex items-center justify-center">
                        <img 
                            src={`/images/path/${pathEn}.png`} 
                            className="w-full h-full object-contain brightness-0 invert" 
                            alt="path" 
                            onError={(e) => e.currentTarget.style.display='none'} 
                        />
                    </div>
                </div>

                {/* Used Overlay */}
                {isOwned && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                         <span className="text-[10px] font-black border border-white/30 text-white/70 px-2 py-0.5 -rotate-12 bg-black uppercase tracking-widest">
                            USED
                        </span>
                    </div>
                )}

                {/* Info */}
                <div className="absolute bottom-1.5 left-0 w-full px-1 text-center z-10">
                    <div className={`text-[9px] font-black uppercase tracking-tighter truncate drop-shadow-md ${theme.textColor}`}>
                        {character.name}
                    </div>
                    <div className={`h-[1.5px] w-1/2 mx-auto mt-0.5 rounded-full ${isFiveStar ? 'bg-yellow-500' : 'bg-purple-500'}`} />
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface Props {
    allChars: Character[];
    roomData: any;
    selectedSlot: { teamSide: 'p1' | 'p2', teamIndex: number, slotIndex: number } | null;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    selectedPath: string | null;
    setSelectedPath: (p: string | null) => void;
    onPoolClick: (char: Character) => void;
}

const FillPool: React.FC<Props> = ({ 
    allChars, roomData, selectedSlot, searchTerm, setSearchTerm, selectedPath, setSelectedPath, onPoolClick 
}) => {
    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    // =================================================================================
    // 1. SỬA LỖI Ở ĐÂY: LOGIC LỌC (FILTER)
    // =================================================================================
    const availablePool = useMemo(() => {
        if (!roomData || !allChars.length) return [];
        const { p1CharBans=[], p2CharBans=[], p1Picks=[], p2Picks=[] } = roomData;
        
        // CHỈ thêm vào danh sách loại bỏ những con đã BAN hoặc đã PICK (DRAFT).
        // TUYỆT ĐỐI KHÔNG thêm p1FinalTeams hay p2FinalTeams vào đây.
        const unavailableIds = new Set([
            ...p1CharBans.map((c: any) => c.id), 
            ...p2CharBans.map((c: any) => c.id),
            ...p1Picks.map((c: any) => c.id), 
            ...p2Picks.map((c: any) => c.id)
        ]);

        return allChars.filter(c => {
            // Nếu nằm trong danh sách cấm/đã pick (Draft) -> Ẩn
            if (unavailableIds.has(c.id)) return false;

            // Bộ lọc tìm kiếm
            if (!c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            
            // Bộ lọc Path
            if (selectedPath && selectedPath !== 'ALL') {
                const charPath = c.pathEn || c.path; 
                if (charPath?.toLowerCase() !== selectedPath.toLowerCase()) return false;
            }
            
            // Bộ lọc Element
            if (selectedElement && selectedElement !== 'ALL') {
                const charElement = c.elementEn || c.element;
                if (charElement?.toLowerCase() !== selectedElement.toLowerCase()) return false;
            }
            return true;
        });
    }, [allChars, roomData, searchTerm, selectedPath, selectedElement]);

    // =================================================================================
    // 2. SỬA LỖI Ở ĐÂY: KIỂM TRA SỞ HỮU (IS OWNED)
    // =================================================================================
    const isCharacterOwnedInTeam = (charId: string) => {
        if (!selectedSlot) return false;

        const side = selectedSlot.teamSide; // 'p1' hoặc 'p2'
        
        // Chỉ lấy danh sách team FILL của PHE ĐANG CHỌN
        const fillTeams = side === 'p1' ? roomData.p1FinalTeams : roomData.p2FinalTeams;

        // Flatten mảng team
        const mySideFillChars = (fillTeams || []).flat();

        // Chỉ trả về true nếu PHE NÀY đã có con đó.
        // Việc PHE KIA có hay chưa không ảnh hưởng.
        return mySideFillChars.some((x: any) => x && x.id === charId);
    };

    return (
        <div className="flex-1 rounded-[1.5rem] border border-white/10 bg-[#0b0e14]/90 flex flex-col overflow-hidden backdrop-blur-md shadow-2xl relative h-full">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
            `}</style>

            {/* HEADER FILTER */}
            <div className="px-4 py-3 border-b border-white/5 bg-[#11141b]/50 shrink-0 flex flex-col gap-2 z-20">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedElement(null)} className={`h-6 px-2 rounded text-[9px] font-black border transition-all ${!selectedElement ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-transparent text-gray-500 border-gray-700'}`}>ALL</button>
                        <div className="flex gap-1">
                            {ELEMENTS.map(el => (
                                <button key={el} onClick={() => setSelectedElement(selectedElement === el ? null : el)} className={`w-8 h-8 rounded-md p-1 transition-all border ${selectedElement === el ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-transparent border-transparent hover:border-gray-700 opacity-50 hover:opacity-100'}`} title={el}>
                                    <img src={`/images/types/${el}.png`} className="w-full h-full object-contain" alt={el} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <input type="text" placeholder="SEARCH..." className="bg-[#0b0d12] border border-gray-800 rounded px-3 py-1 text-[10px] font-black outline-none focus:border-cyan-500 w-32 uppercase text-white transition-all focus:bg-black font-mono" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedPath(null)} className={`h-6 px-2 rounded text-[9px] font-black border transition-all ${!selectedPath ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-transparent text-gray-500 border-gray-700'}`}>ALL</button>
                    <div className="flex gap-1">
                        {PATHS.map(pa => (
                            <button key={pa} onClick={() => setSelectedPath(selectedPath === pa ? null : pa)} className={`w-8 h-8 rounded-md p-1 transition-all border ${selectedPath === pa ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'bg-transparent border-transparent hover:border-gray-700 opacity-50 hover:opacity-100'}`} title={pa}>
                                <img src={`/images/path/${pa}.png`} className="w-full h-full object-contain brightness-0 invert" alt={pa} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* BLOCKING OVERLAY */}
            {!selectedSlot && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-[3px] cursor-not-allowed animate-fade-in">
                    <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-pulse flex items-center gap-3 select-none">
                        <span className="text-2xl">⚠️</span> Hãy chọn một vị trí trong đội trước khi chọn nhân vật!
                    </div>
                </div>
            )}

            {/* GRID */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0b0e14]">
                {availablePool.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                        <span className="text-xs font-mono uppercase">No characters found</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 pb-20">
                        {availablePool.map(c => {
                            // Biến isOwned này chỉ True nếu PHE ĐANG CHỌN (selectedSlot.teamSide) đã sở hữu.
                            // Nếu phe kia sở hữu, biến này vẫn False -> Card vẫn sáng -> Chọn được.
                            const isOwned = isCharacterOwnedInTeam(c.id);
                            
                            return (
                                <CharacterCard 
                                    key={c.id}
                                    character={c}
                                    isOwned={isOwned}
                                    disabled={!selectedSlot} 
                                    onClick={() => selectedSlot && onPoolClick(c)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FillPool;