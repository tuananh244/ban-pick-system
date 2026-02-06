import React, { useState } from 'react';

interface BanItem {
  id: string;
  name: string;
  image?: string;
  imageFile?: string;
}

interface Props {
  p1CharBans: BanItem[];
  p2CharBans: BanItem[];
  p1WeaponBans: BanItem[];
  p2WeaponBans: BanItem[];
  config: { cb: number; wb: number };
}

// Sub-component hiển thị 1 slot ban nhỏ
const MiniBanSlot = ({ item, color, label }: { item?: BanItem, color: string, label?: string }) => {
  // State để quản lý việc hiện tên
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`relative w-10 h-10 rounded border bg-black/50 flex items-center justify-center overflow-visible shrink-0 group cursor-pointer transition-all
        ${item ? `border-${color} shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:scale-105` : 'border-white/10'}
      `}
      // Sự kiện Click: Toggle tên
      onClick={() => item && setShowTooltip(!showTooltip)}
      // Sự kiện Rê chuột ra ngoài: Tắt tên
      onMouseLeave={() => setShowTooltip(false)}
    >
      {item ? (
        <>
          <img 
            src={item.image || `/images/weapons/${item.imageFile}`} 
            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all rounded-[3px]" 
            alt={item.name}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-red-500 font-bold text-lg drop-shadow-md">✕</span>
          </div>
          
          {/* --- TOOLTIP TÊN --- */}
          {/* Hiện khi Hover (group-hover) HOẶC khi Click (showTooltip) */}
          <div className={`
            absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[100]
            bg-[#0a0a0a] border border-white/20 text-white text-[9px] font-bold uppercase tracking-wider
            px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none
            transition-all duration-200
            ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}
          `}>
            {item.name}
            {/* Mũi tên nhỏ chỉ lên trên */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0a0a] border-t border-l border-white/20 rotate-45" />
          </div>
        </>
      ) : (
        <span className="text-[8px] text-white/10 select-none font-black">{label}</span>
      )}
    </div>
  );
};

export const BanHeaderBar: React.FC<Props> = ({ p1CharBans, p2CharBans, p1WeaponBans, p2WeaponBans, config }) => {
  // Nếu không có config ban nào thì ẩn luôn
  if (config.cb === 0 && config.wb === 0) return null;
  
  const charSlots = Math.ceil(config.cb / 2);
  const wpnSlots = Math.ceil(config.wb / 2);

  return (
    <div className="h-12 bg-[#080a10] border-b border-white/5 flex items-center justify-between px-6 shrink-0 shadow-lg relative z-40">
      
      {/* --- P1 BANS (LEFT) --- */}
      <div className="flex items-center gap-6">
         {/* Char Bans */}
         {config.cb > 0 && (
             <div className="flex items-center gap-1">
                 <span className="text-[9px] font-black text-pink-500/50 uppercase mr-2 tracking-widest">Cấm Nhân Vật</span>
                 {[...Array(charSlots)].map((_, i) => (
                    <MiniBanSlot key={`p1c-${i}`} item={p1CharBans[i]} color="pink-500" label="CH" />
                 ))}
             </div>
         )}
         {/* Divider */}
         {config.cb > 0 && config.wb > 0 && <div className="h-6 w-px bg-white/10" />}
         {/* Weapon Bans */}
         {config.wb > 0 && (
             <div className="flex items-center gap-1">
                 <span className="text-[9px] font-black text-pink-500/50 uppercase mr-2 tracking-widest">Cấm Nón</span>
                 {[...Array(wpnSlots)].map((_, i) => (
                    <MiniBanSlot key={`p1w-${i}`} item={p1WeaponBans[i]} color="pink-500" label="WP" />
                 ))}
             </div>
         )}
      </div>

      {/* --- CENTER TEXT --- */}
      <div className="absolute left-1/2 -translate-x-1/2 opacity-30">
        <div className="flex items-center gap-2">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-white" />
            <span className="text-[10px] font-black italic uppercase tracking-[0.3em]">RESTRICTED ZONE</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-white" />
        </div>
      </div>

      {/* --- P2 BANS (RIGHT) --- */}
      <div className="flex items-center gap-6 flex-row-reverse">
         {/* Char Bans */}
         {config.cb > 0 && (
             <div className="flex items-center gap-1 flex-row-reverse">
                 <span className="text-[9px] font-black text-cyan-400/50 uppercase ml-2 tracking-widest">Cấm nhân vật</span>
                 {[...Array(charSlots)].map((_, i) => (
                    <MiniBanSlot key={`p2c-${i}`} item={p2CharBans[i]} color="cyan-400" label="CH" />
                 ))}
             </div>
         )}
         {/* Divider */}
         {config.cb > 0 && config.wb > 0 && <div className="h-6 w-px bg-white/10" />}
         {/* Weapon Bans */}
         {config.wb > 0 && (
             <div className="flex items-center gap-1 flex-row-reverse">
                 <span className="text-[9px] font-black text-cyan-400/50 uppercase ml-2 tracking-widest">Cấm Nón</span>
                 {[...Array(wpnSlots)].map((_, i) => (
                    <MiniBanSlot key={`p2w-${i}`} item={p2WeaponBans[i]} color="cyan-400" label="WP" />
                 ))}
             </div>
         )}
      </div>
    </div>
  );
};