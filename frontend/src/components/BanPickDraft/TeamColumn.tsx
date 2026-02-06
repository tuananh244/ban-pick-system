import React from 'react';
// Import hàm dịch
import { translatePathToEn } from "../../utils/mapper";

interface Props {
  teamId: 'p1' | 'p2';
  picks: any[];
  configPk: number;
  turn: string;
  isModPhase: boolean;
  mySide: string;
  selectedSlot: number;
  setSelectedSlot: (i: number) => void;
  color: string;
  label: string;
}

export const TeamColumn: React.FC<Props> = ({
  teamId, picks, configPk, turn, isModPhase, mySide, selectedSlot, setSelectedSlot, color, label
}) => {
  const isBlur = turn !== teamId && !isModPhase;
  
  // Xác định màu sắc chủ đạo
  const isPink = color === 'pink-500';
  const borderColorClass = isPink ? 'border-pink-500' : 'border-cyan-400';
  const textColorClass = isPink ? 'text-pink-500' : 'text-cyan-400';
  
  // Màu hover của thanh cuộn (Hex code tương ứng với tailwind pink-500 / cyan-400)
  const scrollHoverColor = isPink ? '#ec4899' : '#22d3ee';

  return (
    <div className={`w-96 flex flex-col gap-2 transition-all duration-500 shrink-0 h-full ${isBlur ? 'opacity-60 grayscale blur-[1px]' : 'opacity-100'}`}>
      
      {/* CSS SCROLLBAR RIÊNG CHO CỘT NÀY */}
      <style>{`
        /* Ẩn scrollbar mặc định cho đẹp */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px; /* Mỏng vừa đủ */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333; /* Màu xám tối mặc định */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${scrollHoverColor}; /* Hover đổi màu theo Team */
        }
      `}</style>

      {/* HEADER */}
      <div className={`flex items-end justify-between px-2 ${teamId === 'p2' ? 'flex-row-reverse' : ''} shrink-0 pb-2 border-b border-white/5`}>
        <h2 className={`text-4xl font-black italic uppercase ${textColorClass} tracking-tighter leading-none shadow-black drop-shadow-md`}>{label}</h2>
        <span className="text-xl font-black opacity-50 italic">{picks?.length || 0}/{configPk}</span>
      </div>
      
      {/* LIST (Đã có class custom-scrollbar) */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1 content-start pb-2">
        {[...Array(configPk)].map((_, i) => {
          const item = picks?.[i];
          const isPickingCurrent = !isModPhase && turn === teamId && picks.length === i;
          const isSelectedForTuning = isModPhase && mySide === teamId && selectedSlot === i;
          const canInteract = isModPhase && mySide === teamId;

          // Xây dựng class động
          let cardClass = `h-24 w-full flex ${teamId === 'p2' ? 'flex-row-reverse' : 'flex-row'} items-stretch relative overflow-hidden shrink-0 border transition-all duration-200 `;
          
          if (canInteract) cardClass += 'cursor-pointer hover:border-white/50 ';
          
          if (isSelectedForTuning) {
            cardClass += 'border-yellow-400 ring-1 ring-yellow-400 z-20 rounded-xl bg-black ';
          } else if (item) {
             const borderColor = isPink ? 'border-pink-500/20' : 'border-cyan-400/20';
             cardClass += `bg-[#0a0a0a] ${borderColor} rounded-xl `;
          } else {
            cardClass += 'bg-white/[0.02] border-white/5 border-dashed rounded-xl ';
          }

          if (isPickingCurrent) {
             cardClass += `${borderColorClass} shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-white/[0.05] `;
          }

          return (
            <div key={i} onClick={() => canInteract && setSelectedSlot(i)} className={cardClass}> 
              
              {item ? (
                <>
                  {/* Cột Tướng */}
                  <div className="w-1/2 relative border-r border-white/5 p-1.5 group">
                    <div className="w-full h-full rounded-lg overflow-hidden relative bg-black/50 flex items-center justify-center">
                      <img src={item.image} className="w-full h-full object-scale-down transition-transform duration-500 group-hover:scale-110 opacity-90" alt={item.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Path & Name Info */}
                      <div className="absolute top-1 left-1.5 right-1.5 flex flex-col items-start">
                        {/* ICON PATH */}
                        <div className="flex items-center gap-1 mb-0.5 opacity-70">
                           <img 
                             src={`/images/path/${translatePathToEn(item.path)}.png`} 
                             className="w-3 h-3 object-contain brightness-0 invert" 
                             alt={item.path} 
                           />
                           <p className="text-[7px] font-black uppercase text-white/80 leading-none">{item.path}</p>
                        </div>
                        <p className="text-[10px] font-black uppercase italic text-white leading-none truncate drop-shadow-md w-full">{item.name}</p>
                      </div>

                      <div className="absolute bottom-1 left-1">
                        <div className={`flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-black backdrop-blur-md border ${item.eidolon > 0 ? 'bg-cyan-500/90 border-cyan-400 text-black' : 'bg-black/60 border-white/10 text-white/40'}`}>
                          E{item.eidolon || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cột Nón Ánh Sáng */}
                  <div className="w-1/2 relative p-1.5 group">
                    <div className="w-full h-full rounded-lg overflow-hidden relative bg-black/50 border border-white/5 flex items-center justify-center">
                      {item.equippedWeapon ? (
                        <>
                          <img 
                             src={`/images/weapons/${item.equippedWeapon.imageFile}`} 
                             className="w-full h-full object-scale-down transition-transform duration-500 group-hover:scale-110 opacity-90" 
                             alt="" 
                             onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute top-1 right-1.5 left-1.5 text-right">
                             <p className="text-[7px] font-bold uppercase text-yellow-500 leading-none mb-0.5">LIGHT CONE</p>
                             <p className="text-[10px] font-bold uppercase text-white leading-none truncate opacity-90">{item.equippedWeapon.name}</p>
                          </div>
                          <div className="absolute bottom-1 right-1">
                             <div className={`flex items-center justify-center px-1.5 py-0.5 rounded text-[9px] font-black backdrop-blur-md border bg-yellow-600/90 border-yellow-400 text-black`}>
                               S{item.weaponRank || 1}
                             </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 group-hover:text-white/30 transition-colors">
                          <span className="text-xl font-thin opacity-50">+</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider">EQUIP</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPickingCurrent ? `${textColorClass} animate-pulse` : 'text-white/10'}`}>
                    {isPickingCurrent ? 'ĐANG CHỌN...' : `VỊ TRÍ ${i + 1}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};