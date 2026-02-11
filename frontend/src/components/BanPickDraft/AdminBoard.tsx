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
  const [selectedTeamCount, setSelectedTeamCount] = useState<number | null>(null);
  
  const bothReady = p1Ready && p2Ready;
  const safeTurn = (turn === 'p1' || turn === 'p2') ? turn : 'p1';

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTeamCount(null);
  };

  // --- VIEW: DATABASE (Admin tra cứu dữ liệu nếu cần) ---
  if (view === 'VIEW_CHARS' || view === 'VIEW_WEAPONS') {
    return (
      <div className="flex flex-col h-full w-full bg-[#0b0e14] overflow-hidden animate-in fade-in duration-200">
        <div className="shrink-0 py-2 px-4 bg-[#11141b] border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
            DATABASE: {view === 'VIEW_CHARS' ? 'CHARACTERS' : 'LIGHT CONES'}
          </h3>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/50">CHẾ ĐỘ TRA CỨU</span>
        </div>
        <div className="flex-1 overflow-hidden p-4">
           {view === 'VIEW_CHARS' ? (
             <CharacterGridBanPick role="admin" side="admin" turn={safeTurn} phase="PICK" onSelect={() => {}} disabledIds={[]} />
           ) : (
             <WeaponGridBanPick role="admin" side="admin" turn={safeTurn} phase="PICK" onSelect={() => {}} disabledIds={[]} />
           )}
        </div>
        <div className="p-4 bg-[#0d0f14]">
          <button onClick={() => setView('DASHBOARD')} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại Bảng điều khiển
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: DASHBOARD CHÍNH (QUẢN LÝ READY) ---
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6 animate-in fade-in">
      
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest">
            ADMIN CONSOLE
        </h2>
        <div className="h-1.5 w-32 bg-cyan-500 mx-auto rounded-full shadow-[0_0_15px_#06b6d4]"></div>
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] pt-2">Giai đoạn điều chỉnh trang bị</p>
      </div>

      {/* HIỂN THỊ TRẠNG THÁI HOÀN THÀNH CỦA 2 BÊN */}
      <div className="flex gap-6 w-full max-w-xl">
        {[
          { id: 'p1', label: 'ĐỘI 01', ready: p1Ready, color: 'pink-500' },
          { id: 'p2', label: 'ĐỘI 02', ready: p2Ready, color: 'cyan-400' }
        ].map((side) => (
          <div 
            key={side.id}
            className={`flex-1 p-8 rounded-3xl border-2 transition-all duration-700 flex flex-col items-center justify-center gap-4 ${
              side.ready 
              ? `bg-green-500/10 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]` 
              : `bg-white/5 border-white/10 opacity-40`
            }`}
          >
            <span className={`text-xs font-black tracking-[0.2em] ${side.ready ? 'text-green-400' : 'text-white/40'}`}>
              {side.label}
            </span>
            <div className={`text-3xl font-black italic ${side.ready ? 'text-green-400' : 'text-white/10'}`}>
              {side.ready ? 'READY ✓' : 'WAITING...'}
            </div>
            {side.ready && (
               <div className="w-full h-1 bg-green-500 rounded-full animate-pulse mt-2"></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
        <button onClick={() => setView('VIEW_CHARS')} className="h-20 bg-[#1a1d26] border border-white/10 hover:border-cyan-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group">
            <span className="text-2xl group-hover:scale-110 transition-transform">👤</span>
            <span className="font-black uppercase text-[10px] tracking-widest text-gray-500 group-hover:text-cyan-400">Database Char</span>
        </button>
        <button onClick={() => setView('VIEW_WEAPONS')} className="h-20 bg-[#1a1d26] border border-white/10 hover:border-yellow-400 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group">
            <span className="text-2xl group-hover:scale-110 transition-transform">⚔️</span>
            <span className="font-black uppercase text-[10px] tracking-widest text-gray-500 group-hover:text-yellow-400">Database LC</span>
        </button>

        <button onClick={() => onSendAction("admin_unlock_players", {})} className="col-span-2 py-4 bg-orange-950/20 border border-orange-500/30 text-orange-500 font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white rounded-xl transition-all text-[10px] flex items-center justify-center gap-2">
          <span>🔓</span> Mở khóa xác nhận người chơi
        </button>

        <button 
          onClick={() => setShowModal(true)} 
          disabled={!bothReady}
          className={`col-span-2 h-24 rounded-2xl font-black text-2xl uppercase tracking-[0.3em] transition-all border-2 
            ${bothReady 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-pulse cursor-pointer' 
                : 'bg-white/5 border-white/5 text-white/5 cursor-not-allowed'}`}
        >
          TIẾP TỤC CHIA ĐỘI
        </button>
      </div>

      {/* MODAL CONFIG TEAM */}
      {showModal && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in-95">
           <div className="bg-[#111] border border-white/10 p-10 rounded-[3rem] text-center max-w-sm w-full shadow-2xl">
              <h3 className="text-2xl font-black text-white italic uppercase mb-8 tracking-widest">Thiết lập đội</h3>
              {selectedTeamCount === null ? (
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {[1, 2, 3, 4].map(num => (
                    <button key={num} onClick={() => setSelectedTeamCount(num)} className="aspect-square rounded-2xl bg-[#1a1d26] hover:bg-cyan-500 hover:text-black font-black text-2xl transition-all active:scale-90">
                      {num}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                  <p className="text-white text-lg font-bold">Xác nhận chia <br/><span className="text-cyan-400 text-5xl font-black not-italic block my-3">{selectedTeamCount} ĐỘI</span> cho mỗi bên?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedTeamCount(null)} className="flex-1 py-4 rounded-2xl border border-white/10 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Quay lại</button>
                    <button onClick={() => { onSendAction("admin_init_fill_phase", { teamCount: selectedTeamCount }); handleCloseModal(); }} className="flex-1 py-4 rounded-2xl bg-cyan-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-cyan-900/50">Xác nhận</button>
                  </div>
                </div>
              )}
              {selectedTeamCount === null && (
                <button onClick={handleCloseModal} className="text-white/20 font-bold text-[10px] uppercase tracking-[0.3em] mt-4 hover:text-red-500 transition-colors">Hủy bỏ</button>
              )}
           </div>
        </div>
      )}
    </div>
  );
};