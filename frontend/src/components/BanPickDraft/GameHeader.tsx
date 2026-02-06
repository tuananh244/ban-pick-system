import React, { useState } from 'react';
import { formatTime } from '../../utils/draftHelpers';

interface Props {
  phase: string;
  timeLeft: number;
  isInfiniteTime: boolean;
  side: string;
  isUrgent: boolean;
  isAdmin: boolean;
  onTerminate: () => void;
}

export const GameHeader: React.FC<Props> = ({ 
  phase, timeLeft, isInfiniteTime, side, isUrgent, isAdmin, onTerminate 
}) => {
  // State để quản lý popup xác nhận
  const [showConfirm, setShowConfirm] = useState(false);

  // Map phase sang tiếng Việt
  const phaseName = phase === 'BAN_CHAR' ? 'CẤM TƯỚNG' 
                  : phase === 'BAN_WEAPON' ? 'CẤM NÓN ÁNH SÁNG'
                  : phase === 'PICK_CHAR' ? 'CHỌN TƯỚNG'
                  : phase === 'MODIFICATION' ? 'CHỈNH SỬA ĐỘI HÌNH'
                  : phase.replace('_', ' ');

  return (
    <>
      <header className="h-12 flex justify-between items-center px-6 bg-black/40 border-b border-white/5 backdrop-blur-xl shrink-0 z-50">
        <div className="bg-cyan-500 px-6 py-1 -skew-x-12 border-r-4 border-white shadow-[4px_0_0_0_#fff]">
          <span className="block skew-x-12 text-black font-black text-xs uppercase italic">
            GIAO THỨC: {side === 'p1' ? 'ĐỘI 1' : side === 'p2' ? 'ĐỘI 2' : side.toUpperCase()}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-red-500 animate-ping' : 'bg-cyan-400'}`} />
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em]">{phaseName}</span>
          </div>
          {isInfiniteTime ? (
            <span className="text-2xl font-black text-cyan-400 tracking-tighter leading-none pt-1">
              &infin; <span className="text-sm align-top ml-0.5 opacity-50">VÔ HẠN</span>
            </span>
          ) : (
            <span className={`text-2xl font-black italic tracking-tighter ${isUrgent ? 'text-red-500' : 'text-cyan-400'}`}>
              {formatTime(timeLeft)}
            </span>
          )}
        </div>

        {isAdmin && (
          <button 
            // Thay vì gọi onTerminate ngay, ta mở popup xác nhận
            onClick={() => setShowConfirm(true)} 
            className="px-4 py-2 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all rounded-md"
          >
            HỦY TRẬN
          </button>
        )}
      </header>

      {/* --- MODAL XÁC NHẬN HỦY TRẬN (Chỉ Admin thấy khi bấm nút) --- */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border-2 border-red-600 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-2xl font-black italic text-red-500 uppercase mb-2">Xác nhận hủy?</h3>
            <p className="text-white/60 text-sm mb-8 font-medium">
              Hành động này không thể hoàn tác. Trận đấu sẽ kết thúc ngay lập tức với tất cả người chơi.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-colors uppercase text-xs tracking-widest"
              >
                Quay lại
              </button>
              <button 
                onClick={() => {
                  onTerminate(); // Gọi hàm hủy thật sự
                  setShowConfirm(false);
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg transition-all uppercase text-xs tracking-widest"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};