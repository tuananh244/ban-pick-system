import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TurnSelector } from './TurnSelector';
import { AISettings } from './AISetting';

// Định nghĩa cấu trúc cho từng giai đoạn thi đấu
export interface Phase {
  id: string;
  type: 'CHAR_BAN' | 'CHAR_PICK' | 'WEA_BAN';
  label: string;
  priority: 'P1' | 'P2';
}

interface ConfigState {
  charBan: number;
  weaBan: number;
  pick: number;
  timer: number;
  banPickTurn: string; // Lưu trữ mảng Phase dưới dạng JSON string
  aiHelp: boolean;
}

interface Props {
  step: number;
  finalRoomId: string;
  generatedLinks: { p1: string; p2: string; admin: string };
  config: ConfigState;
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>;
  copyStatus: string | null;
  onGenerate: () => void;
  onCopy: (text: string, label: string) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<Props> = ({
  step, finalRoomId, generatedLinks, config, setConfig, copyStatus, onGenerate, onCopy, onClose
}) => {
  const navigate = useNavigate();
  const [showAdvancedPopup, setShowAdvancedPopup] = useState(false);

  // Khởi tạo mảng phases từ config (nếu có) hoặc mặc định
  const [phases, setPhases] = useState<Phase[]>(() => {
    try {
      return JSON.parse(config.banPickTurn);
    } catch {
      return [
        { id: 'pb-1', type: 'CHAR_BAN', label: 'Cấm Nhân Vật', priority: 'P1' },
        { id: 'pb-2', type: 'CHAR_PICK', label: 'Chọn Nhân Vật', priority: 'P1' },
        { id: 'pb-3', type: 'WEA_BAN', label: 'Cấm Nón Ánh Sáng', priority: 'P2' },
      ];
    }
  });

  const updateConfig = (key: keyof ConfigState, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Cập nhật khi người dùng thay đổi thứ tự ưu tiên trong TurnSelector
  const handleUpdatePhases = (newPhases: Phase[]) => {
    setPhases(newPhases);
    updateConfig('banPickTurn', JSON.stringify(newPhases));
  };

  const handleAdminEnter = () => {
    try {
      const urlObj = new URL(generatedLinks.admin);
      navigate(urlObj.pathname + urlObj.search);
    } catch (e) {
      window.location.href = generatedLinks.admin;
    }
  };

  // Helper render các nút chọn số lượng (Ban/Pick/Timer)
  const renderBtn = (val: number, currentVal: number, key: keyof ConfigState, label?: string) => (
    <button
      key={val}
      onClick={() => updateConfig(key, val)}
      className={`py-2 rounded-lg font-black text-xs transition-all border active:scale-95 ${
        currentVal === val
          ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
          : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'
      }`}
    >
      {label || val}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#11141d] border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] rounded-2xl w-full max-w-lg p-6 relative overflow-hidden transition-all">
        
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-cyan-400 text-xl font-black italic uppercase mb-5 border-b border-white/10 pb-3 text-center tracking-tighter">
              Thiết lập luật thi đấu
            </h2>
            
            <div className="space-y-5 mb-6">
              {/* PHẦN BAN: Nhân vật & Nón */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block text-center">Cấm Nhân vật</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 2, 4, 6].map(num => renderBtn(num, config.charBan, 'charBan'))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block text-center">Cấm Nón</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 2, 4, 6].map(num => renderBtn(num, config.weaBan, 'weaBan'))}
                  </div>
                </div>
              </div>

              {/* PHẦN PICK */}
              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-widest">Số lượng Pick mỗi bên</label>
                <div className="grid grid-cols-6 gap-2">
                  {[2, 3, 4, 6, 8, 9].map(num => renderBtn(num, config.pick, 'pick'))}
                </div>
              </div>

              {/* THỜI GIAN */}
              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-widest">Thời gian (Giây)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[15, 30, 60, 90, 0].map(t => renderBtn(t, config.timer, 'timer', t === 0 ? 'INF' : undefined))}
                </div>
              </div>

              {/* NÚT MỞ CẤU HÌNH NÂNG CAO */}
              <button 
                onClick={() => setShowAdvancedPopup(true)}
                className="w-full py-3 bg-slate-800/40 border border-white/5 rounded-xl text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-3 group"
              >
                <span className="group-hover:rotate-90 transition-transform duration-500">⚙️</span>
                Cấu hình nâng cao {config.aiHelp && <span className="text-[8px] bg-cyan-500 text-black px-1.5 rounded animate-pulse">AI ON</span>}
              </button>
            </div>

            {/* NÚT FOOTER */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button onClick={onGenerate} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase italic py-3 rounded-xl transition-all shadow-lg active:scale-95">
                Xác nhận
              </button>
              <button onClick={onClose} className="px-6 border border-white/20 text-slate-400 rounded-xl hover:bg-white/5 transition-colors font-bold uppercase text-xs">
                Hủy
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: SAU KHI TẠO PHÒNG XONG */
          <div className="animate-in zoom-in-95 duration-300">
             <h2 className="text-cyan-400 text-xl font-black italic uppercase mb-4">
               Phòng: <span className="text-white underline decoration-cyan-500/50">{finalRoomId}</span>
             </h2>
             
             <div className="space-y-4 mb-6">
                {[
                  { label: 'Link P1 (Đội Xanh)', url: generatedLinks.p1, code: 'p1' },
                  { label: 'Link P2 (Đội Đỏ)', url: generatedLinks.p2, code: 'p2' }
                ].map((client, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between px-1">
                      <label className="text-slate-300 text-[10px] uppercase font-bold tracking-widest">{client.label}</label>
                      {copyStatus === client.code && <span className="text-green-400 text-[10px] font-bold animate-pulse">Đã copy!</span>}
                    </div>
                    <div onClick={() => onCopy(client.url, client.code)} className="relative bg-black/60 border border-white/10 rounded-xl px-3 py-3 cursor-pointer hover:border-cyan-500/30 transition-all group">
                      <div className="text-slate-400 text-xs font-mono truncate pr-10 group-hover:text-white transition-colors">{client.url}</div>
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-bold">COPY</button>
                    </div>
                  </div>
                ))}
             </div>

             <button onClick={handleAdminEnter} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase italic py-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95">
               Vào phòng (Admin)
             </button>
          </div>
        )}

        {/* --- POPUP NÂNG CAO --- */}
        {showAdvancedPopup && (
          <div className="absolute inset-0 z-[210] bg-[#11141d] p-6 flex flex-col animate-in fade-in slide-in-from-right-10 duration-300">
            {/* CSS nhúng trực tiếp cho Scrollbar */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.02);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(6, 182, 212, 0.3);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(6, 182, 212, 0.6);
                box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
              }
            `}</style>

            {/* Header của Popup */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                <h3 className="text-white font-black italic uppercase text-lg tracking-wider">
                  Tùy chỉnh Workflow
                </h3>
              </div>
              <button 
                onClick={() => setShowAdvancedPopup(false)} 
                className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="12"></line></svg>
              </button>
            </div>

            {/* Nội dung cuộn - Áp dụng trực tiếp style cho thanh cuộn */}
            <div 
              className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(6, 182, 212, 0.3) transparent'
              }}
            >
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <TurnSelector phases={phases} onUpdatePhases={handleUpdatePhases} />
              </div>
              
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                <AISettings isEnabled={config.aiHelp} onToggle={(val) => updateConfig('aiHelp', val)} />
              </div>

              {/* Thông tin bổ sung */}
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <p className="text-[10px] text-cyan-400/70 leading-relaxed italic uppercase font-bold tracking-tight">
                  * Lưu ý: Thay đổi thứ tự ưu tiên (P1/P2) sẽ ảnh hưởng trực tiếp đến lượt ban/pick đầu tiên của mỗi giai đoạn trong phòng thi đấu.
                </p>
              </div>
            </div>

            {/* Nút lưu */}
            <button 
              onClick={() => setShowAdvancedPopup(false)} 
              className="mt-6 w-full py-4 bg-cyan-500 text-black font-extrabold rounded-xl uppercase text-xs active:scale-[0.98] shadow-[0_10px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_10px_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Lưu & Quay lại hệ thống</span>
              <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};