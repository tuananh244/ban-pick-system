import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ConfigState {
  charBan: number;
  weaBan: number;
  pick: number;
  timer: number;
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

  // Helper để cập nhật config gọn hơn
  const updateConfig = (key: keyof ConfigState, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleAdminEnter = () => {
    try {
      const urlObj = new URL(generatedLinks.admin);
      const pathAndQuery = urlObj.pathname + urlObj.search;
      navigate(pathAndQuery);
    } catch (e) {
      window.location.href = generatedLinks.admin;
    }
  };

  // Helper render button để code ngắn gọn hơn
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
      <div className="bg-[#11141d] border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] rounded-2xl w-full max-w-lg p-6 relative transition-all">
        
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-cyan-400 text-xl font-black italic uppercase mb-5 border-b border-white/10 pb-3 text-center">Thiết lập luật thi đấu</h2>
            
            <div className="space-y-5 mb-6">
              
              {/* PHẦN BAN: Gộp chung 1 hàng (2 cột) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Cấm Tướng */}
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block text-center">Cấm Nhân vật</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 2, 4, 6].map(num => renderBtn(num, config.charBan, 'charBan'))}
                  </div>
                </div>

                {/* Cấm Nón */}
                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block text-center">Cấm Nón</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 2, 4, 6].map(num => renderBtn(num, config.weaBan, 'weaBan'))}
                  </div>
                </div>
              </div>

              {/* Số lượng Pick: 1 hàng duy nhất */}
              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-widest">Số lượng Pick mỗi bên</label>
                <div className="grid grid-cols-6 gap-2">
                  {[2, 3, 4, 6, 8, 9].map(num => renderBtn(num, config.pick, 'pick'))}
                </div>
              </div>

              {/* Thời gian: 1 hàng duy nhất */}
              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-widest">Thời gian (Giây)</label>
                <div className="grid grid-cols-5 gap-2"> 
                  {[15, 30, 60, 90, 0].map(t => renderBtn(t, config.timer, 'timer', t === 0 ? 'INF' : undefined))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
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
          <div className="animate-in zoom-in-95 duration-300">
            <h2 className="text-cyan-400 text-xl font-black italic uppercase mb-2">
              Phòng: <span className="text-white underline decoration-cyan-500/50">{finalRoomId}</span>
            </h2>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Link P1 (Đội Xanh)', url: generatedLinks.p1, code: 'p1' },
                { label: 'Link P2 (Đội Đỏ)', url: generatedLinks.p2, code: 'p2' }
              ].map((client, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-slate-300 text-[10px] uppercase font-bold tracking-widest">{client.label}</label>
                    {copyStatus === client.code && <span className="text-green-400 text-[10px] font-bold animate-pulse">Đã copy!</span>}
                  </div>
                  
                  <div onClick={() => onCopy(client.url, client.code)} className="relative group/input bg-black/60 border border-white/10 rounded-xl px-3 py-3 cursor-pointer hover:bg-black/80 hover:border-cyan-500/30 transition-all flex items-center shadow-inner">
                    <span className="mr-3 text-cyan-500 opacity-50"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span>
                    <div className="text-slate-400 text-xs font-mono truncate w-[75%] opacity-80 group-hover/input:text-white group-hover/input:opacity-100 transition-all select-none">{client.url}</div>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-cyan-600 text-white px-2 py-1 rounded text-[9px] font-bold transition-colors shadow-lg border border-white/10">COPY</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleAdminEnter} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase italic py-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95">
                Vào phòng (Admin)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};