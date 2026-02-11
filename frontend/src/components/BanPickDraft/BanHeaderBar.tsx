interface BanItem {
  id: string;
  name: string;
  image?: string;
  imageFile?: string;
  rarity?: number; // 4 hoặc 5
}

interface Props {
  p1CharBans: BanItem[];
  p2CharBans: BanItem[];
  p1WeaponBans: BanItem[];
  p2WeaponBans: BanItem[];
  config: { cb: number; wb: number };
}

// Sub-component hiển thị từng ô Ban lẻ
const LargeBanSlot = ({ item, color }: { item?: BanItem, color: string }) => {
  return (
    <div 
      className={`relative h-12 w-12 flex items-center justify-center group cursor-pointer transition-all mx-1 rounded-sm border-[1.5px]
        ${item 
          ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
          : 'border-white/10 opacity-30'}
      `}
    >
      {item ? (
        <>
          {/* KHUNG ẢNH (BỊ CLIP BỞI OVERFLOW-HIDDEN) */}
          <div className={`relative w-full h-full p-[1.5px] overflow-visible ${
            item.rarity === 5 ? 'bg-gradient-to-b from-[#f2d07d] to-[#997631]' : 'bg-gradient-to-b from-[#b189f5] to-[#5a3894]'
          }`}>
            <div className="relative w-full h-full overflow-hidden bg-[#0a0c14]">
              <img 
                src={item.image || `/images/weapons/${item.imageFile}`} 
                className="w-full h-full object-cover object-top brightness-[0.85] group-hover:brightness-110 group-hover:scale-110 transition-all duration-500" 
                alt={item.name}
              />
              
              {/* Lớp phủ gradient ở đáy ảnh */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Label LOCKED cố định ở dưới ảnh */}
              <div className="absolute bottom-0 inset-x-0 py-0.5 bg-red-600/20 backdrop-blur-[1px] flex items-center justify-center border-t border-red-600/30">
                <span className="text-[6px] font-black tracking-[0.2em] text-red-500 uppercase">
                  LOCKED
                </span>
              </div>
            </div>
          </div>

          {/* THẺ TÊN (NẰM NGOÀI KHUNG ẢNH - KHÔNG BỊ CẮT) */}
          <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[110] translate-y-[-5px] group-hover:translate-y-0">
            {/* Mũi tên nhỏ trỏ lên */}
            <div className={`mx-auto w-2 h-2 rotate-45 border-l border-t mb-[-5px] bg-black/90 
              ${color === 'pink-500' ? 'border-pink-500/50' : 'border-cyan-400/50'}`} 
            />
            
            <div className={`
              px-3 py-1.5 rounded-sm backdrop-blur-xl bg-black/90 border border-white/10 border-b-2 shadow-2xl
              ${color === 'pink-500' ? 'border-b-pink-500 shadow-pink-500/20' : 'border-b-cyan-400 shadow-cyan-400/20'}
            `}>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] font-black text-white whitespace-nowrap uppercase tracking-widest leading-none">
                  {item.name}
                </span>
                <span className={`text-[6px] font-bold ${item.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'}`}>
                  {item.rarity === 5 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐'}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Trạng thái ô trống */
        <div className="w-full h-full flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const BanHeaderBar: React.FC<Props> = ({ p1CharBans, p2CharBans, p1WeaponBans, p2WeaponBans, config }) => {
  if (config.cb === 0 && config.wb === 0) return null;
  
  const charSlots = Math.ceil(config.cb / 2);
  const wpnSlots = Math.ceil(config.wb / 2);

  const BanGroup = ({ title, items, slots, color }: { title: string, items: BanItem[], slots: number, color: string }) => (
    <div className="flex items-center gap-2">
      <span className={`text-[9px] font-black uppercase tracking-tighter italic ${color === 'pink-500' ? 'text-pink-500/50' : 'text-cyan-400/50'}`}>
        {title}
      </span>
      <div className="flex items-center">
        {[...Array(slots)].map((_, i) => (
          <LargeBanSlot key={`${title}-${i}`} item={items[i]} color={color} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-16 bg-[#020408] border-y border-white/5 flex items-center justify-between shrink-0 relative z-50 px-4 select-none shadow-2xl">
      
      {/* P1 - LEFT */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6">
          {config.cb > 0 && <BanGroup title="NV" items={p1CharBans} slots={charSlots} color="pink-500" />}
          {config.wb > 0 && <BanGroup title="NÓN" items={p1WeaponBans} slots={wpnSlots} color="pink-500" />}
        </div>
      </div>

      {/* CENTER DECORATION */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-10 pointer-events-none">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-red-600" />
          <span className="text-[10px] font-black italic tracking-[0.8em] text-red-500">BANNED</span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-red-600" />
      </div>

      {/* P2 - RIGHT */}
      <div className="flex items-center gap-8 flex-row-reverse">
        <div className="flex items-center gap-6 flex-row-reverse">
          {config.cb > 0 && <BanGroup title="NV" items={p2CharBans} slots={charSlots} color="cyan-400" />}
          {config.wb > 0 && <BanGroup title="NÓN" items={p2WeaponBans} slots={wpnSlots} color="cyan-400" />}
        </div>
      </div>

      {/* LED DECORATION BOTTOM */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0" />
    </div>
  );
};