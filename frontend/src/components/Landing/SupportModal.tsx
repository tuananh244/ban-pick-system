import React from 'react';

interface Props {
  onClose: () => void;
}

export const SupportModal: React.FC<Props> = ({ onClose }) => {
  const handleOpenFeedback = () => {
    window.open('https://forms.gle/tRcFK2pNMNCkHTj9A', '_blank'); 
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-[#11141d] border-2 border-pink-500/50 shadow-[0_0_50px_rgba(236,72,153,0.2)] rounded-2xl w-full max-w-md p-6 relative transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với GIF */}
        <div className="text-center mb-6 relative">
            {/* Vòng sáng Neon phía sau GIF */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
            
            <div className="w-32 h-32 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.3)] overflow-hidden">
              <img 
                src="/images/gif/donateme.gif" 
                alt="Donate Me" 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <h2 className="text-pink-400 text-2xl font-black italic uppercase tracking-tight">Cảm ơn & Góp ý</h2>
            <p className="text-slate-400 text-xs mt-2 font-medium">Sự ủng hộ của bạn là động lực để tôi phát triển!</p>
        </div>

        {/* Phần Donate */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-4 group hover:border-pink-500/30 transition-colors">
          <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
            Mời tôi một ly Cafe
          </h3>
          
          <div className="flex gap-4 items-center">
             <div className="w-24 h-24 bg-white rounded-lg flex-shrink-0 overflow-hidden border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ExampleBankInfo" 
                  alt="QR Donate" 
                  className="w-full h-full object-cover"
                />
             </div>
             
             <div className="space-y-1 text-sm text-slate-300 flex-1">
                <div className="mb-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Ngân hàng</p>
                    <p className="font-bold text-white italic">MB BANK (Quân Đội)</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Số tài khoản</p>
                    <div className="flex items-center gap-2">
                        <span className="font-mono bg-black/50 px-2 py-0.5 rounded border border-white/10 select-all text-pink-400 font-bold">0123456789</span>
                    </div>
                </div>
                <div className="pt-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Chủ tài khoản</p>
                    <p className="text-white font-black text-xs">NGUYEN VAN A</p>
                </div>
             </div>
          </div>
        </div>

        {/* Phần Feedback */}
        <div className="space-y-3">
           <button 
             onClick={handleOpenFeedback} 
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase italic shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Báo lỗi / Góp ý
           </button>
           
           <button 
             onClick={onClose} 
             className="w-full py-3 bg-transparent border border-white/10 text-slate-500 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
           >
             Hẹn gặp lại sau
           </button>
        </div>
      </div>
    </div>
  );
};