import React from 'react';

interface ExitConfirmPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitConfirmPopup: React.FC<ExitConfirmPopupProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[1500] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      
      {/* Container chính */}
      <div className="relative p-10 border-2 border-yellow-600/30 rounded-3xl bg-black/80 shadow-[0_0_80px_rgba(234,179,8,0.3)] text-center overflow-hidden max-w-lg w-full mx-4">
        
        {/* Hiệu ứng viền */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-yellow-500 to-transparent opacity-50 animate-pulse"></div>
        
        {/* Icon cảnh báo */}
        <div className="text-6xl mb-6 animate-bounce">⚠️</div>

        {/* Tiêu đề */}
        <h2 className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-700 mb-4 tracking-tighter uppercase">
          XÁC NHẬN THOÁT
        </h2>
        
        {/* Nội dung */}
        <p className="text-lg text-white/70 font-bold mb-8 leading-relaxed">
          Bạn có chắc chắn muốn rời khỏi phòng?
          <br />
          <span className="text-red-400 text-sm">Hành động này không thể hoàn tác!</span>
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Nút Hủy */}
          <button 
            onClick={onCancel}
            className="group relative px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-black uppercase rounded-xl overflow-hidden transition-all hover:scale-105 shadow-lg"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
            <span className="relative tracking-widest text-sm">HỦY BỎ</span>
          </button>

          {/* Nút Xác nhận */}
          <button 
            onClick={onConfirm}
            className="group relative px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase rounded-xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
            <span className="relative tracking-widest text-sm">THOÁT NGAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};