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
        {/* Header */}
        <div className="text-center mb-6">
           <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
           </div>
           <h2 className="text-pink-400 text-2xl font-black italic uppercase">Cảm ơn & Góp ý</h2>
           <p className="text-slate-400 text-xs mt-2 font-medium">Sự ủng hộ của bạn là động lực để tôi phát triển!</p>
        </div>

        {/* Phần Donate */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-4">
          <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Donate Cafe
          </h3>
          <div className="flex gap-4 items-center">
             <div className="w-24 h-24 bg-white rounded-lg flex-shrink-0 overflow-hidden border-2 border-white/20">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ExampleBankInfo" alt="QR Donate" className="w-full h-full object-cover"/>
             </div>
             <div className="space-y-1 text-sm text-slate-300">
                <p className="font-bold text-white">Ngân hàng: <span className="text-pink-400">MB Bank</span></p>
                <p>STK: <span className="font-mono bg-black/50 px-2 py-0.5 rounded border border-white/10 select-all">0123456789</span></p>
                <p>Chủ TK: <span className="text-white uppercase">NGUYEN VAN A</span></p>
             </div>
          </div>
        </div>

        {/* Phần Feedback */}
        <div className="space-y-3">
           <button onClick={handleOpenFeedback} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase italic shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Gửi Góp Ý / Báo Lỗi
           </button>
           <button onClick={onClose} className="w-full py-3 bg-transparent border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all">Đóng</button>
        </div>
      </div>
    </div>
  );
};