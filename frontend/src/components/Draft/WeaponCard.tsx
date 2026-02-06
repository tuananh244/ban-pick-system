import React from 'react';
import type { Weapon } from "../../types/weapons";

interface Props {
  weapon: Weapon;
}

export const WeaponCard: React.FC<Props> = ({ weapon }) => {
  const imagePath = `/images/weapons/${weapon.imageFile}`;
  const pathIconPath = `/images/path/${weapon.path}.png`;

  // --- CẤU HÌNH THEME THEO RARITY ---
  let theme;
  switch (weapon.rarity) {
    case 5:
      theme = {
        // 5 SAO: Tông Vàng Gold
        border: "border-[#d4af37]", 
        hoverBorder: "group-hover:border-[#ffe57f]",
        shadow: "group-hover:shadow-[0_0_20px_rgba(255,215,0,0.6)]",
        bgGradient: "bg-gradient-to-b from-[#1f1605] to-[#000000]", 
        textColor: "text-[#ffd700]",
        shine: "via-[#ffd700]/20",
        bgOverlay: "from-yellow-900",
        barColor: "bg-yellow-500 shadow-[0_0_5px_#eab308]"
      };
      break;
    case 4:
      theme = {
        // 4 SAO: Tông Tím Neon
        border: "border-[#7c3aed]", 
        hoverBorder: "group-hover:border-[#a78bfa]",
        shadow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]",
        bgGradient: "bg-gradient-to-b from-[#110e1c] to-[#000000]",
        textColor: "text-[#c4b5fd]",
        shine: "via-[#a78bfa]/20",
        bgOverlay: "from-purple-950",
        barColor: "bg-purple-500 shadow-[0_0_5px_#a855f7]"
      };
      break;
    default:
      theme = {
        // 3 SAO: Tông Xanh Dương (Blue)
        border: "border-[#0ea5e9]", 
        hoverBorder: "group-hover:border-[#7dd3fc]",
        shadow: "group-hover:shadow-[0_0_20px_rgba(14,165,233,0.6)]",
        bgGradient: "bg-gradient-to-b from-[#0c1620] to-[#000000]",
        textColor: "text-[#7dd3fc]",
        shine: "via-[#38bdf8]/20",
        bgOverlay: "from-sky-950",
        barColor: "bg-sky-500 shadow-[0_0_5px_#0ea5e9]"
      };
  }

  // Hàm format số gọn gàng
  const formatNumber = (num: number) => parseFloat(Number(num).toFixed(2));

  return (
    // CONTAINER: Giữ tỉ lệ, xử lý hover phóng to
    <div className={`
      relative group cursor-pointer w-full select-none
      transition-all duration-300 ease-out
      hover:scale-[1.05] hover:-translate-y-1 hover:z-50
    `}>
      
      {/* KHUNG CARD CHÍNH */}
      <div className={`
        relative overflow-hidden rounded-lg
        border-[1.5px] ${theme.border} ${theme.hoverBorder}
        ${theme.bgGradient} ${theme.shadow}
        transition-all duration-300 shadow-lg
      `}>

        {/* --- PHẦN 1: ẢNH & THÔNG TIN (Tỉ lệ 4:5 để thon gọn) --- */}
        <div className="relative aspect-[4/5] overflow-hidden">
          
          {/* Lớp nền màu theo cấp sao (Mờ phía sau ảnh) */}
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-t ${theme.bgOverlay} to-transparent`} />

          {/* Ảnh Vũ Khí */}
          <img 
            src={imagePath} 
            alt={weapon.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/weapons/placeholder.png' }}
          />

          {/* Gradient đen ở đáy để làm nổi tên */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#000000] via-black/50 to-transparent" />

          {/* Icon Vận Mệnh (Góc trên phải) */}
          <div className="absolute top-1 right-1 z-10">
            <div className="w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full p-1 border border-white/10 shadow flex items-center justify-center">
              <img src={pathIconPath} alt={weapon.path} className="w-full h-full object-contain brightness-125" />
            </div>
          </div>

          {/* Tên Vũ Khí */}
          <div className="absolute bottom-1.5 left-0 w-full px-1 text-center z-20">
             <h3 className={`
               text-[10px] sm:text-[11px] font-black uppercase tracking-tighter truncate
               drop-shadow-[0_2px_2px_rgba(0,0,0,1)]
               transition-colors duration-300
               ${theme.textColor} group-hover:text-white
             `}>
               {weapon.name}
             </h3>
             {/* Thanh màu nhỏ dưới tên */}
             <div className={`h-[2px] w-1/2 mx-auto mt-0.5 rounded-full ${theme.barColor}`} />
          </div>
        </div>

        {/* --- PHẦN 2: THANH CHỈ SỐ (S1 - S5) --- */}
        <div className="bg-[#050505] border-t border-white/5 py-1 relative z-20">
          {/* Grid 6 cột: 1 cột rỗng (S0) + 5 cột (S1-S5) */}
          {/* Lưu ý: Stats của Weapon thường tính từ S1 (index 1) đến S5 (index 5) */}
          <div className="grid grid-cols-5 divide-x divide-white/5"> 
            {[1, 2, 3, 4, 5].map((sLevel) => {
               // Lấy giá trị từ mảng stats (stats[1] là S1)
               const val = weapon.stats && weapon.stats[sLevel] ? weapon.stats[sLevel] : 0;
               const displayVal = formatNumber(val);
               const isActive = displayVal > 0;
               
               return (
                 <div key={sLevel} className="flex flex-col items-center justify-center py-0.5">
                   {/* Label S1-S5 */}
                   <span className="text-[8px] text-gray-500 font-bold uppercase leading-none mb-0.5">
                     S{sLevel}
                   </span>
                   
                   {/* Giá trị */}
                   <span className={`
                     text-[9px] sm:text-[10px] font-bold leading-none
                     ${isActive 
                       ? `${theme.textColor} drop-shadow` 
                       : 'text-gray-800'} 
                   `}>
                     {displayVal}
                   </span>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Hiệu ứng Shine lướt qua khi hover */}
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent ${theme.shine} to-transparent -translate-x-[200%] skew-x-12 transition-transform duration-700 ease-in-out group-hover:translate-x-[200%] pointer-events-none`} />
      </div>
    </div>
  );
};