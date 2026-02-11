import React from 'react';

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

// Component Icon Tinh hồn SVG
const EidolonIcon = () => (
  <svg viewBox="0 0 10 8" className="w-4 h-4 fill-white/90">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M7.085 2.46 5.188 3.676l.103-2.25L7.187.211zm-.44-.253-.967.62.052-1.148.967-.62zm-1.936-.782L2.812.211l.103 2.25 1.897 1.214zM7.085 5.54 5.188 4.325l.103 2.25 1.896 1.214zM.625 4l2-1.036 2 1.036-2 1.036zm6.75-1.036L5.375 4l2 1.036 2-1.036zM2.812 7.79l.103-2.25 1.897-1.214-.103 2.25z" 
    />
  </svg>
);

// Component Icon Sao 5 cánh cho Nón
const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-yellow-500 shadow-sm">
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.869 1.4-8.168L.132 9.21l8.2-1.192z" />
  </svg>
);

export const TeamColumn: React.FC<Props> = ({
  teamId, picks, configPk, turn, isModPhase, mySide, selectedSlot, setSelectedSlot, color, label
}) => {
  const isBlur = turn !== teamId && !isModPhase;
  const isPink = color === 'pink-500';
  const textColorClass = isPink ? 'text-pink-500' : 'text-cyan-400';
  const scrollHoverColor = isPink ? '#ec4899' : '#22d3ee';

  return (
    <div className={`w-[380px] flex flex-col gap-2 transition-all duration-500 shrink-0 h-full ${isBlur ? 'opacity-60 grayscale blur-[1px]' : 'opacity-100'}`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${scrollHoverColor}; }
      `}</style>

      {/* HEADER */}
      <div className={`flex items-end justify-between px-2 ${teamId === 'p2' ? 'flex-row-reverse' : ''} shrink-0 pb-1.5 border-b border-white/5`}>
        <h2 className={`text-2xl font-black italic uppercase ${textColorClass} tracking-tighter leading-none`}>{label}</h2>
        <span className="text-base font-black opacity-30 italic">{picks?.length || 0}/{configPk}</span>
      </div>
      
      {/* GRID NHÂN VẬT (2 CỘT) */}
      <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-2.5 overflow-y-auto custom-scrollbar pr-1 content-start pb-4">
        {[...Array(configPk)].map((_, i) => {
          const item = picks?.[i];
          const isPickingCurrent = !isModPhase && turn === teamId && picks.length === i;
          const isSelected = isModPhase && mySide === teamId && selectedSlot === i;
          const canInteract = isModPhase && mySide === teamId;

          const is5Star = item?.rarity === 5 || !item?.rarity; 
          const rarityGradient = is5Star 
            ? 'from-[#c3965e] to-[#ead3ad]' 
            : 'from-[#8e52c9] to-[#d7b1f5]';

          let containerClass = `h-[230px] w-full flex flex-col items-stretch relative shrink-0 transition-all duration-200 border rounded-sm `;
          
          if (isSelected) containerClass += 'border-yellow-400 bg-[#1a1a1a] z-10 ring-1 ring-yellow-400/50 ';
          else if (item) containerClass += 'border-white/10 bg-[#0a0a0a] ';
          else containerClass += 'border-white/5 border-dashed bg-white/[0.01] ';

          return (
            <div 
              key={i} 
              onClick={() => canInteract && setSelectedSlot(i)} 
              className={`${containerClass} ${canInteract ? 'cursor-pointer hover:border-white/20' : ''}`}
            > 
              
              {item ? (
                <>
                  {/* PORTRAIT NHÂN VẬT */}
                  <div className={`h-[70%] relative bg-gradient-to-br ${rarityGradient} overflow-hidden`}>
                    <img 
                      src={item.image} 
                      className="absolute inset-0 w-full h-full object-cover object-[center_15%] scale-105" 
                      alt={item.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    
                    {/* Icon Nguyên tố */}
                    <div className="absolute top-1 left-1">
                      <div className="w-8 h-8 bg-black/40 backdrop-blur-sm p-1 rounded-full border border-white/10 shadow-lg">
                         <img src={`/images/types/${item.elementEn || 'Physical'}.png`} className="w-full h-full object-contain" alt="element" />
                      </div>
                    </div>

                    {/* Badge Tinh hồn (SVG + Số sát nhau) */}
                    <div className="absolute top-1 right-1">
                      <div className="bg-black/60 px-2 py-0.5 rounded border border-white/10 flex items-center gap-0.5 shadow-lg">
                        <EidolonIcon />
                        <span className="text-[11px] font-black italic text-white leading-none">{item.eidolon || 0}</span>
                      </div>
                    </div>

                    {/* Character Name */}
                    <div className="absolute bottom-1 inset-x-0 text-center px-1">
                      <p className="text-white text-[10px] font-black uppercase tracking-tighter drop-shadow-md truncate">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  {/* THÔNG TIN NÓN ÁNH SÁNG */}
                  <div className="flex-1 flex items-center p-2 bg-[#111] relative">
                    {item.equippedWeapon ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="relative w-11 h-14 shrink-0">
                          {/* Rank tích tầng - LÀM TO RA w-5 h-5 */}
                          <div className="absolute -top-1.5 -left-1.5 z-10 w-5 h-5 bg-[#d4af37] flex items-center justify-center border border-black rounded-full shadow-lg">
                            <span className="text-[10px] font-black text-black leading-none">
                              {item.weaponRank || 1}
                            </span>
                          </div>
                          <img 
                            src={`/images/weapons/${item.equippedWeapon.imageFile}`} 
                            className="w-full h-full object-cover border border-white/10 rounded-sm shadow-sm" 
                            alt="" 
                          />
                        </div>
                        
                        {/* Weapon Info Area */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <p className="text-[10px] font-bold text-white/90 leading-tight truncate drop-shadow-md">
                             {item.equippedWeapon.name}
                           </p>
                           {/* Rarity row: Số sao + SVG Star */}
                           <div className="flex items-center gap-0.5 mt-0.5">
                              <span className="text-[9px] font-black text-yellow-500/80 leading-none">
                                {item.equippedWeapon.rarity || 5}
                              </span>
                              <StarIcon />
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center opacity-10">
                         <span className="text-sm font-thin leading-none">+</span>
                         <span className="text-[7px] font-bold uppercase tracking-widest">NÓN</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* SLOT TRỐNG */
                <div className="w-full h-full flex items-center justify-center bg-white/[0.01]">
                  <div className={`text-[9px] font-black uppercase tracking-[0.15em] text-center px-2 ${isPickingCurrent ? `${textColorClass} animate-pulse` : 'text-white/5'}`}>
                    {isPickingCurrent ? 'ĐANG CHỌN...' : `VỊ TRÍ ${i + 1}`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};