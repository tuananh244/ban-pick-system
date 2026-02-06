import React from 'react';

interface Props {
  onClose: () => void;
}

export const InfoModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-[#11141d] border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] rounded-2xl w-full max-w-lg p-8 relative transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + Logo */}
        <div className="text-center mb-6 border-b border-white/10 pb-4 flex flex-col items-center">
           {/* Logo Image */}
           <div className="w-24 h-24 mb-3 relative hover:scale-110 transition-transform duration-300">
               <img 
                 src="/images/logo/logo.png" 
                 alt="HSR Logo" 
                 className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                 onError={(e) => {
                   // Fallback nếu chưa có ảnh thì hiện text
                   e.currentTarget.style.display = 'none';
                 }}
               />
           </div>

           <h2 className="text-cyan-400 text-3xl font-black italic uppercase tracking-tighter">Về Dự Án</h2>
           <p className="text-slate-400 text-xs mt-2 font-medium uppercase tracking-[0.2em]">HSR Tactical System (Made for fun)</p>
        </div>

        {/* Nội dung giới thiệu */}
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8 text-center">
            <p>
                Chào mừng các "chiến thần" đến với <strong className="text-white">HSR Ban/Pick Tool</strong>.
                Đây là nơi tình anh em rạn nứt qua những pha cấm chọn đi vào lòng đất.
            </p>
            
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-left">
                <h3 className="text-white font-bold uppercase text-xs tracking-widest mb-2 text-center">Chức năng (có vẻ) chính:</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-400 ml-2">
                    <li>
                        <span className="text-cyan-400 font-bold">Ban/Pick:</span> Cấm chọn căng cực như giải thế giới (nhưng giải thưởng là niềm vui).
                    </li>
                    <li>
                        <span className="text-yellow-400 font-bold">Tính điểm Team:</span> So kè xem đội hình nào lực hơn, ai là "Luck chúa".
                    </li>
                </ul>
            </div>

            <div className="text-xs text-slate-500 italic pt-2 border-t border-white/5 mt-4">
                <p className="mb-1">⚠️ <strong>Thực sự thì:</strong></p>
                "Dự án này được 'gánh' còng lưng bởi AI, tôi chỉ là người gộp mấy cái code đó lại thành 1 project. Mọi thứ vì đam mê, phi lợi nhuận (và vì rảnh)."
                <br/>
                <span className="opacity-70 text-cyan-500/80">(Cái QR Donate kia để test chức năng cho oách thôi, quét thử xem nó ra cái gì thì ra 🐧)</span>
            </div>
        </div>

        {/* Nút đóng */}
        <button 
            onClick={onClose} 
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-black uppercase italic shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
        >
            Ok, Đã Hiểu!
        </button>
      </div>
    </div>
  );
};