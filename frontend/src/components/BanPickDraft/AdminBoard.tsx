import React, { useState } from 'react';
import CharacterGridBanPick from './CharacterGridBanPick'; 
import WeaponGridBanPick from './WeaponGridBanPick';

interface Props {
  p1Ready: boolean;
  p2Ready: boolean;
  turn: string;
  onSendAction: (action: string, payload: any) => void;
}

export const AdminBoard: React.FC<Props> = ({ p1Ready, p2Ready, turn, onSendAction }) => {
  const [view, setView] = useState<'DASHBOARD' | 'VIEW_CHARS' | 'VIEW_WEAPONS'>('DASHBOARD');
  const [showModal, setShowModal] = useState(false);
  const bothReady = p1Ready && p2Ready;

  const [selectedTeamCount, setSelectedTeamCount] = useState<number | null>(null);

  // Ép kiểu turn về dạng hợp lệ
  const safeTurn = (turn === 'p1' || turn === 'p2') ? turn : 'p1';

  const handleCloseModal = () => {
      setShowModal(false);
      setSelectedTeamCount(null); // Reset lựa chọn về null
  };
    
  // --- RENDER VIEW: NHÂN VẬT & VŨ KHÍ ---
  if (view === 'VIEW_CHARS' || view === 'VIEW_WEAPONS') {
    return (
      <div className="flex flex-col h-full w-full bg-[#0b0e14] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER NHỎ (Để biết đang xem gì) */}
        <div className="shrink-0 py-2 px-4 bg-[#11141b] border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                {view === 'VIEW_CHARS' ? 'DATABASE: CHARACTERS' : 'DATABASE: LIGHT CONES'}
            </h3>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">READ ONLY MODE</span>
        </div>

        {/* CONTENT AREA (Chiếm hết khoảng trống còn lại) */}
        <div className="flex-1 overflow-hidden relative p-4 flex flex-col">
           {view === 'VIEW_CHARS' ? (
             <CharacterGridBanPick 
               role="admin" 
               side="admin" 
               turn={safeTurn} 
               phase="PICK" 
               onSelect={() => {}} 
               disabledIds={[]} 
             />
           ) : (
             <WeaponGridBanPick 
               role="admin" 
               side="admin" 
               turn={safeTurn} 
               phase="PICK" 
               onSelect={() => {}} 
               disabledIds={[]} 
             />
           )}
        </div>

        {/* FOOTER: NÚT QUAY LẠI (Nằm dưới cùng) */}
        <div className="shrink-0 p-4 border-t border-white/10 bg-[#0d0f14] z-50">
           <button 
             onClick={() => setView('DASHBOARD')} 
             className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg uppercase tracking-widest rounded-xl shadow-lg hover:shadow-red-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Quay lại Bảng Điều Khiển
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER VIEW: DASHBOARD CHÍNH ---
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 animate-in fade-in relative p-6">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-4xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest">
            ADMIN CONSOLE
        </h2>
        <div className="h-1 w-24 bg-cyan-500 mx-auto rounded-full shadow-[0_0_10px_#06b6d4]"></div>
      </div>
      
      {/* Status Bar */}
      <div className="flex gap-4 mb-4 w-full max-w-lg">
        <div className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${p1Ready ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">ĐỘI 1</span>
            <span className="text-lg font-black">{p1Ready ? 'SẴN SÀNG' : 'ĐANG CHỜ ...'}</span>
        </div>
        <div className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${p2Ready ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-white/30'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider">ĐỘI 2</span>
            <span className="text-lg font-black">{p2Ready ? 'SẴN SÀNG' : 'ĐANG CHỜ ...'}</span>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        
        {/* Nút Xem Database */}
        <button onClick={() => setView('VIEW_CHARS')} className="group h-24 bg-[#1a1d26] border border-white/10 hover:border-cyan-400 hover:bg-cyan-900/20 transition-all rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95">
            <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
            <span className="font-black uppercase text-xs tracking-widest text-gray-400 group-hover:text-cyan-400">Nhân vật</span>
        </button>
        <button onClick={() => setView('VIEW_WEAPONS')} className="group h-24 bg-[#1a1d26] border border-white/10 hover:border-yellow-400 hover:bg-yellow-900/20 transition-all rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95">
            <span className="text-2xl group-hover:scale-110 transition-transform">⚔️</span>
            <span className="font-black uppercase text-xs tracking-widest text-gray-400 group-hover:text-yellow-400">Nón ánh sáng</span>
        </button>
        
        {/* Nút Reset */}
        <button onClick={() => onSendAction("admin_unlock_players", {})} className="col-span-2 py-4 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-black uppercase tracking-[0.15em] hover:bg-orange-500 hover:text-white rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
          <span>🔓</span> Hủy bỏ sẵn sàng
        </button>

        {/* Nút Bắt đầu Pick Team */}
        <button 
          onClick={() => setShowModal(true)} 
          disabled={!bothReady} 
          className={`col-span-2 h-24 rounded-2xl font-black text-2xl uppercase tracking-[0.2em] transition-all duration-300 flex flex-col items-center justify-center border-2 
            ${bothReady 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(37,99,235,0.7)] cursor-pointer animate-pulse' 
                : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed grayscale'}`}
        >
          <div className="flex items-center gap-3">
            <span>Bước tiếp theo</span>
          </div>
        </button>
      </div>

      {/* MODAL CONFIG TEAM */}
      {showModal && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl text-center max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                
                <h3 className="text-2xl font-black text-white italic uppercase mb-2">Cài đặt cuối</h3>
                
                {/* LOGIC ĐIỀU KIỆN HIỂN THỊ */}
                {selectedTeamCount === null ? (
                    // TRẠNG THÁI 1: CHƯA CHỌN SỐ -> HIỆN GRID SỐ
                    <>
                        <p className="text-gray-400 mb-8 uppercase text-[10px] tracking-widest font-bold">Chọn số lượng đội</p>
                        
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {[1, 2, 3, 4].map(num => (
                                <button 
                                    key={num}
                                    // SỬA: Chỉ lưu vào state, chưa gửi action
                                    onClick={() => setSelectedTeamCount(num)}
                                    className="aspect-square rounded-xl bg-[#1a1d26] hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-400 transition-all flex flex-col items-center justify-center gap-1 group active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                                >
                                    <span className="text-3xl font-black">{num}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={handleCloseModal} className="w-full py-3 rounded-lg border border-red-900/50 text-red-500 font-bold uppercase text-xs hover:bg-red-950 hover:text-red-400 tracking-widest transition-colors">HỦY BỎ</button>
                    </>
                ) : (
                    // TRẠNG THÁI 2: ĐÃ CHỌN SỐ -> HIỆN XÁC NHẬN
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                        <p className="text-gray-400 uppercase text-[10px] tracking-widest font-bold mb-4">Xác nhận thiết lập</p>
                        
                        <div className="text-white text-lg font-bold mb-6">
                            Bạn có chắc muốn chọn <br/>
                            <span className="text-4xl text-cyan-400 font-black not-italic block my-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                                {selectedTeamCount} ĐỘI
                            </span>
                            cho mỗi người chơi?
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setSelectedTeamCount(null)} 
                                className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 font-bold uppercase text-xs hover:bg-white/10 hover:text-white transition-all"
                            >
                                Quay lại
                            </button>
                            
                            <button 
                                onClick={() => {
                                    onSendAction("admin_init_fill_phase", { teamCount: selectedTeamCount });
                                    handleCloseModal();
                                }}
                                className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};