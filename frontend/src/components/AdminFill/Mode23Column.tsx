import React from 'react';
import { RarityBorder, LockedOverlay } from './TeamShared';

const Mode23Column = ({ 
  side, 
  teamIndex, 
  teamMembers, 
  config, 
  mode, 
  onSlotClick, 
  onTurnUpdate, 
  onClearStatusUpdate, 
  onConfigUpdate, 
  useAV 
}: any) => {
  const isMode3 = mode === 3 || mode === 4;
  const currentTurns = config?.turns ?? 5;
  const currentAV = config?.av ?? 0;
  const isCleared = config?.isCleared ?? true;
  const hasTalent = config?.hasCastoriceTalent ?? false; 
  const deadCount = config?.deadCount || 0;
  
  const isP1 = side === 'p1';
  const textColor = isP1 ? 'text-pink-400' : 'text-cyan-400';
  const pinkColor = '#ec4899';
  const cyanColor = '#22d3ee';

  return (
    <div className="flex flex-col gap-6">
      <style dangerouslySetInnerHTML={{ __html: `
        .raw-slider {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 100% !important;
          background: transparent !important;
          outline: none !important;
          cursor: pointer !important;
          position: relative !important;
          z-index: 10 !important;
        }
        .raw-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
        }
        .slider-p1::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          height: 18px !important;
          width: 18px !important;
          border-radius: 50% !important;
          background: ${pinkColor} !important;
          border: 2px solid white !important;
          margin-top: -6px !important;
          box-shadow: 0 0 10px ${pinkColor}aa !important;
        }
        .slider-p2::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          height: 18px !important;
          width: 18px !important;
          border-radius: 50% !important;
          background: ${cyanColor} !important;
          border: 2px solid white !important;
          margin-top: -6px !important;
          box-shadow: 0 0 10px ${cyanColor}aa !important;
        }
      `}} />

      {/* GRID NHÂN VẬT */}
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(slotIndex => {
          const char = teamMembers[slotIndex];
          const isDrafted = char && !char.isFilled;

          return (
            <div key={slotIndex} onClick={() => onSlotClick(side, teamIndex, slotIndex, char)}
              className={`aspect-[3/4.6] rounded-xl border relative bg-[#080a0f] overflow-hidden transition-all duration-300 group/slot 
              ${char && !isDrafted ? (isP1 ? 'border-pink-500/50' : 'border-cyan-500/50') + ' cursor-pointer hover:scale-[1.03] z-20' : 'border-white/5'}`}>
              {char ? (
                <>
                  <img src={char.image} className="w-full h-full object-cover scale-[1.01]" alt={char.name} />
                  <RarityBorder rarity={char.rarity} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-0 w-full p-2 flex flex-col z-10 gap-1">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex justify-between items-center bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 border border-white/10 text-[10px]">
                        <span className="text-gray-400 font-bold italic">E</span>
                        <span className={`${textColor} font-black`}>{char.eidolon ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 border border-white/10 text-[10px]">
                        <span className="text-gray-400 font-bold italic">S</span>
                        <span className="text-orange-400 font-black">{char.weaponRank ?? 1}</span>
                      </div>
                    </div>
                    <div className="text-center font-black text-white truncate uppercase text-[12px] mt-1 drop-shadow-md">{char.name}</div>
                  </div>
                  {isDrafted && mode === 2 && <LockedOverlay />}
                </>
              ) : <div className="w-full h-full flex items-center justify-center text-white/5 text-3xl">+</div>}
            </div>
          );
        })}
      </div>

      {isMode3 && (
        <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-4">
          
          {/* 1. KẾT QUẢ TRẬN ĐẤU */}
          <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Kết quả trận đấu</span>
            <div className="flex gap-1">
              <button
                onClick={() => onClearStatusUpdate(side, teamIndex, true)}
                className={`px-3 py-1 rounded text-[9px] font-black transition-all border ${isCleared ? 'bg-green-500 border-green-400 text-white shadow-lg' : 'bg-transparent border-white/10 text-white/20 hover:text-white'}`}
              >
                CLEARED
              </button>
              <button
                onClick={() => onClearStatusUpdate(side, teamIndex, false)}
                className={`px-3 py-1 rounded text-[9px] font-black transition-all border ${!isCleared ? 'bg-red-500 border-red-400 text-white shadow-lg' : 'bg-transparent border-white/10 text-white/20 hover:text-white'}`}
              >
                FAILED
              </button>
            </div>
          </div>

          {/* 2. CHỌN SỐ NGƯỜI CHẾT (Bị khóa và làm mờ nếu FAILED) */}
          <div className={`flex flex-col gap-2 bg-black/20 p-2 rounded-lg border border-white/5 transition-all ${!isCleared ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Số người chết</span>
              <span className="text-[10px] font-bold text-red-500">
                {isCleared && deadCount > 0 ? `+${deadCount * 3} điểm` : '0 điểm'}
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  disabled={!isCleared}
                  onClick={() => onConfigUpdate(side, teamIndex, { deadCount: num })}
                  className={`flex-1 py-1.5 rounded font-black text-[11px] transition-all border ${
                    deadCount === num 
                    ? (num === 0 ? 'bg-gray-600 border-gray-400' : 'bg-red-600 border-red-400 shadow-lg') 
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  } ${deadCount === num ? 'text-white' : ''}`}
                >
                  {num} {num === 0 ? 'NONE' : 'DEAD'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. NÚT THIÊN PHÚ BÉ GẠO */}
          <button
            onClick={() => onConfigUpdate(side, teamIndex, { hasCastoriceTalent: !hasTalent })}
            className={`w-full py-2.5 rounded-lg border text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3
              ${hasTalent 
                ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]' 
                : 'bg-black/40 border-white/5 text-white/20 hover:border-white/20'}`}
          >
            <span className={`text-sm ${hasTalent ? 'animate-pulse' : ''}`}>✦</span>
            Thiên phú bé Gạo: {hasTalent ? 'ĐÃ KÍCH HOẠ (+2đ)' : 'KHÔNG CÓ'}
          </button>

          {/* 4. HIỂN THỊ CHỈ SỐ (TURNS/AV) */}
          <div className="flex justify-between items-center px-1 mt-1">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {useAV ? 'Action Value (AV)' : 'Số vòng đi (Turns)'}
            </span>
            <span className={`font-black text-sm ${!isCleared ? 'text-red-500' : (useAV ? 'text-amber-400' : (currentTurns === 0 ? 'text-green-400' : textColor))}`}>
              {!isCleared 
                ? 'FAILED' 
                : (useAV 
                    ? `${currentAV} AV` 
                    : (currentTurns === 0 ? '0 TURNS (-5đ)' : `${currentTurns} TURNS`)
                  )
              }
            </span>
          </div>

          {/* 5. KHU VỰC NHẬP LIỆU (Làm mờ nếu FAILED) */}
          <div className={`flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-white/5 transition-all ${!isCleared ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
            {!useAV ? (
              <>
                <button 
                  disabled={!isCleared}
                  onClick={() => onTurnUpdate(side, teamIndex, -1)} 
                  className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-red-500/20 rounded text-red-400 font-bold transition-all"
                >
                  -
                </button>
                <input 
                  disabled={!isCleared}
                  type="range" min="0" max="20" 
                  value={currentTurns} 
                  onChange={(e) => onTurnUpdate(side, teamIndex, parseInt(e.target.value) - currentTurns)} 
                  className={`flex-1 raw-slider slider-${side}`} 
                />
                <button 
                  disabled={!isCleared}
                  onClick={() => onTurnUpdate(side, teamIndex, 1)} 
                  className={`w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-green-500/20 rounded ${textColor} font-bold transition-all`}
                >
                  +
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center gap-3 px-2">
                <span className="text-[10px] font-black text-white/20 italic uppercase tracking-tighter">Nhập AV:</span>
                <input 
                  disabled={!isCleared}
                  type="number"
                  placeholder="0"
                  value={currentAV || ''}
                  onChange={(e) => onConfigUpdate(side, teamIndex, { av: parseFloat(e.target.value) || 0 })}
                  className="flex-1 bg-black/60 border border-white/10 rounded px-3 py-1.5 text-sm font-black text-amber-400 outline-none focus:border-amber-500/50 transition-all text-right"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mode23Column;