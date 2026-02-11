import React, { useState, useRef } from 'react';

interface AISettingsProps {
  isEnabled: boolean;
  onToggle: (val: boolean) => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ isEnabled, onToggle }) => {
  const [showTroll, setShowTroll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (!isEnabled) {
      onToggle(true);
      setTimeout(() => setShowTroll(true), 300);
      setTimeout(() => {
        setShowTroll(false);
        onToggle(false);
      }, 3500); // Tăng thời gian để hiệu ứng mờ trông mượt hơn
    } else {
      onToggle(false);
    }
  };

  const triggerUpload = () => {
    if (!isEnabled || showTroll) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="relative overflow-hidden bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 transition-all duration-300">
      
      {/* 1. LỚP NỘI DUNG XUNG QUANH (Bị làm mờ khi showTroll = true) */}
      <div className={`transition-all duration-500 ${showTroll ? 'blur-md grayscale opacity-30 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
        
        {/* Header logic */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Hệ thống hỗ trợ Ban/Pick (V2.5)
              </label>
              {isEnabled && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[10px] italic font-medium">Deep Learning & Heuristic Analysis</p>
          </div>

          <button 
            onClick={handleToggle}
            disabled={showTroll}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 outline-none ${
              isEnabled ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-md ${
              isEnabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Khu vực nội dung dài gây lú */}
        <div className={`space-y-4 transition-all duration-300 ${isEnabled ? 'opacity-100' : 'opacity-40'}`}>
          <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-[10px] leading-relaxed text-slate-400">
              <p className="mb-2">
                  <span className="text-cyan-500 font-bold uppercase tracking-tighter">Cơ chế hoạt động:</span> Sử dụng bộ nhận diện <span className="text-white">Convolutional Neural Networks (CNN)</span> để trích xuất Vector đặc trưng.
              </p>
              <p>
                  Đối chiếu dữ liệu <span className="text-white">Meta-Graph DB</span> để tính toán tỷ lệ thắng dựa trên <span className="text-white">Heuristic Score</span>.
              </p>
          </div>

          <div 
              onClick={triggerUpload}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isEnabled ? 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10' : 'border-white/5 bg-transparent'
              }`}
          >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
              <svg className={`w-8 h-8 mb-2 ${isEnabled ? 'text-cyan-500' : 'text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tải lên danh sách nhân vật (Hỗ trợ ảnh dài)</span>
          </div>
        </div>
      </div>

      {/* 2. OVERLAY TROLL (Nằm đè lên trên, không bị mờ) */}
      {showTroll && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 bg-black/40 backdrop-blur-sm">
            <div className="w-28 h-28 mb-3 overflow-hidden rounded-xl border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-black">
                <img 
                    src="/images/gif/troll.gif" 
                    alt="Troll" 
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="text-center px-6">
                <h4 className="text-cyan-400 font-black italic text-xl uppercase leading-tight mb-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    Troll đấy!
                </h4>
                <p className="text-white text-[11px] font-bold leading-relaxed">
                    Bạn nghĩ tôi dành thời gian build cái ML lên để chạy thuật toán thật à? <br/>
                    <span className="text-cyan-200/70 font-medium">Tính năng này còn đang bận farm di vật rồi...</span>
                </p>
            </div>

            <div className="mt-5 w-32 h-1.5 bg-slate-800 overflow-hidden rounded-full border border-white/10">
                <div className="h-full bg-cyan-500 animate-progress origin-left shadow-[0_0_10px_#06b6d4]" />
            </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        .animate-progress {
          animation: progress 3.3s linear forwards;
        }
      `}</style>
    </div>
  );
};