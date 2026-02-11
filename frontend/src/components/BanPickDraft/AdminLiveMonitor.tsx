import React from 'react';

interface MonitorProps {
  p1PreSelect: any;
  p2PreSelect: any;
  turn: 'p1' | 'p2';
  phase: string;
  gif: string;
}

export const AdminLiveMonitor: React.FC<MonitorProps> = ({ p1PreSelect, p2PreSelect, turn, phase, gif }) => {
  // Tự động xác định dữ liệu hiển thị dựa trên lượt (turn)
  const activeData = turn === 'p1' ? p1PreSelect : p2PreSelect;
  const isP1 = turn === 'p1';
  
  // Cấu hình giao diện theo đội (Team Theme)
  const teamTheme = {
    label: isP1 ? "ĐỘI 01" : "ĐỘI 02",
    color: isP1 ? "text-pink-500" : "text-cyan-400",
    border: isP1 ? "border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]" : "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
  };

  // Cấu hình giao diện theo độ hiếm (Rarity Theme)
  const isFiveStar = activeData?.rarity === 5;
  const rarityTheme = isFiveStar 
    ? {
        bg: "from-[#856a1f] to-[#1a1505]", // Vàng cam Trailblazer
        bar: "bg-[#ffcc66] shadow-[0_0_10px_#ffcc66]" // Thanh gạch sáng vàng
      }
    : {
        bg: "from-[#4c1d95] to-[#0f0a1a]", // Tím March 7th
        bar: "bg-[#c084fc] shadow-[0_0_10px_#c084fc]" // Thanh gạch sáng tím
      };

  return (
    <div className="flex flex-col h-full items-center justify-center bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden p-6 animate-in fade-in duration-500">
      
      {/* 1. NHÃN TRẠNG THÁI LINH HOẠT THEO LƯỢT */}
      <div className="flex flex-col items-center gap-2 mb-10">
        <div className="flex items-center gap-4">
            <div className={`h-[2px] w-12 rounded-full ${isP1 ? 'bg-pink-500' : 'bg-cyan-400'} opacity-50`} />
            <h2 className={`text-4xl font-black italic uppercase tracking-tighter transition-all duration-500 ${teamTheme.color}`}>
              {teamTheme.label} - ĐANG CHỌN
            </h2>
            <div className={`h-[2px] w-12 rounded-full ${isP1 ? 'bg-pink-500' : 'bg-cyan-400'} opacity-50`} />
        </div>
        <div className="text-white/20 font-bold text-[10px] tracking-[0.4em] uppercase bg-white/5 px-6 py-1 rounded-full border border-white/5">
           Giai đoạn: {phase.replace('_', ' ')}
        </div>
      </div>

      {/* 2. SLOT HIỂN THỊ DUY NHẤT Ở TRUNG TÂM */}
      <div className={`relative w-72 aspect-[2/3] rounded-[2.5rem] border-4 transition-all duration-500 overflow-hidden ${teamTheme.border}`}>
        {activeData ? (
          <>
            {/* Background Gradient theo Rarity */}
            <div className={`absolute inset-0 bg-gradient-to-br ${rarityTheme.bg}`} />
            
            {/* Ảnh chân dung lớn */}
            <img 
              src={activeData.image || `/images/weapons/${activeData.imageFile}`} 
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" 
              alt="active-monitor" 
            />
            
            {/* Phủ bóng đáy để làm nổi tên */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />
            
            {/* Tên và Rarity Bar */}
            <div className="absolute bottom-8 inset-x-0 text-center px-4 flex flex-col items-center">
              <div className="text-white font-black uppercase italic text-3xl drop-shadow-[0_2px_15px_rgba(0,0,0,1)] truncate w-full mb-2">
                {activeData.name}
              </div>
              {/* Thanh gạch ngang phát sáng chuẩn HSR */}
              <div className={`h-[5px] w-24 rounded-full transition-all duration-500 ${rarityTheme.bar}`} />
            </div>
          </>
        ) : (
          /* Trạng thái trống: Hiện GIF chờ của bạn */
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 animate-pulse">
            <img src={gif} className="w-32 h-32 object-contain opacity-30 mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" alt="waiting-gif" />
            <span className="text-white/20 font-black uppercase text-[11px] tracking-[0.3em] text-center leading-relaxed">
              Đang chờ người chơi <br/> ngắm nhân vật...
            </span>
          </div>
        )}
      </div>

      {/* 3. TRANG TRÍ FOOTER */}
      <div className="mt-10 flex items-center gap-4 opacity-10 font-black italic text-white text-5xl select-none">
         <span>LIVE</span>
         <div className={`w-3 h-3 rounded-full animate-ping ${isP1 ? 'bg-pink-500' : 'bg-cyan-400'}`} />
         <span>DRAFT</span>
      </div>
    </div>
  );
};