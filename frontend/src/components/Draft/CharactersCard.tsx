import React from 'react';
import type { Character } from "../../types/characters";

interface Props {
  character: Character;
}

export const CharacterCard: React.FC<Props> = ({ character }) => {
  const isFiveStar = character.rarity === 5;
  
  // Icon hệ và vận mệnh
  const elementIconPath = `/images/types/${character.elementEn}.png`;
  const pathIconPath = `/images/path/${character.pathEn}.png`;

  // --- CẤU HÌNH MÀU SẮC THEO ĐỘ HIẾM (QUAN TRỌNG) ---
  const theme = isFiveStar 
    ? {
        // 5 SAO: Tông Vàng Gold -> Nền đen ánh vàng sậm
        border: "border-[#d4af37]", 
        hoverBorder: "group-hover:border-[#ffe57f]",
        shadow: "group-hover:shadow-[0_0_20px_rgba(255,215,0,0.6)]",
        // Đã chỉnh đậm hơn: Từ nâu vàng -> Đen tuyệt đối
        bgGradient: "bg-gradient-to-b from-[#1f1605] to-[#000000]", 
        textColor: "text-[#ffd700]",
        shine: "via-[#ffd700]/20"
      }
    : {
        // 4 SAO: Tông Tím -> Nền đen ánh tím sậm
        border: "border-[#7c3aed]", 
        hoverBorder: "group-hover:border-[#a78bfa]",
        shadow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]",
        // Đã chỉnh đậm hơn: Từ tím than -> Đen tuyệt đối
        bgGradient: "bg-gradient-to-b from-[#110e1c] to-[#000000]",
        textColor: "text-[#c4b5fd]",
        shine: "via-[#a78bfa]/20"
      };

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
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-t ${isFiveStar ? 'from-yellow-600' : 'from-purple-900'} to-transparent`} />

          {/* Ảnh Nhân Vật */}
          <img 
            src={character.image} 
            alt={character.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient đen ở đáy để làm nổi tên */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#09090b] via-black/40 to-transparent" />

          {/* Icon Hệ & Vận mệnh (Góc trên phải) */}
          <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
            <div className="w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 shadow flex items-center justify-center">
              <img src={elementIconPath} alt="ele" className="w-full h-full object-contain" />
            </div>
            <div className="w-6 h-6 bg-black/60 backdrop-blur-sm rounded-full p-0.5 border border-white/10 shadow flex items-center justify-center">
              <img src={pathIconPath} alt="path" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Tên Nhân Vật */}
          <div className="absolute bottom-1.5 left-0 w-full px-1 text-center z-20">
             <h3 className={`
               text-[10px] sm:text-[11px] font-black uppercase tracking-tighter truncate
               drop-shadow-[0_2px_2px_rgba(0,0,0,1)]
               transition-colors duration-300
               ${isFiveStar ? 'text-[#fff5c2] group-hover:text-white' : 'text-[#e9d5ff] group-hover:text-white'}
             `}>
               {character.name}
             </h3>
             {/* Thanh màu nhỏ dưới tên để nhấn mạnh độ hiếm */}
             <div className={`h-[2px] w-1/2 mx-auto mt-0.5 rounded-full ${isFiveStar ? 'bg-yellow-500 shadow-[0_0_5px_#eab308]' : 'bg-purple-500 shadow-[0_0_5px_#a855f7]'}`} />
          </div>
        </div>

        {/* --- PHẦN 2: THANH CHỈ SỐ (STATS) --- */}
        <div className="bg-[#0c0e12] border-t border-white/5 py-1 relative z-20">
          <div className="grid grid-cols-7 divide-x divide-white/5"> 
            {character.stats.map((val, i) => {
               const displayVal = formatNumber(val || 0);
               const isActive = displayVal > 0;
               
               return (
                 <div key={i} className="flex flex-col items-center justify-center py-0.5">
                   {/* Label E0-E6 */}
                   <span className="text-[10px] text-gray-500 font-bold uppercase leading-none mb-0.5">
                     E{i}
                   </span>
                   
                   {/* Giá trị */}
                   <span className={`
                     text-[9px] sm:text-[10px] font-bold leading-none
                     ${isActive 
                       ? `${theme.textColor} drop-shadow` // Dùng màu vàng/tím đã định nghĩa
                       : 'text-gray-700'}
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