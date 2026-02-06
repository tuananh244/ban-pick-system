import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TerminatedScreen: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Logic đếm ngược
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/'); // Tự động về trang chủ khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup khi component unmount
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
      
      {/* Container chính */}
      <div className="relative p-12 border-2 border-red-600/30 rounded-[3rem] bg-black/80 shadow-[0_0_100px_rgba(220,38,38,0.4)] text-center overflow-hidden max-w-2xl w-full mx-4">
        
        {/* Hiệu ứng nền chạy chạy (Optional) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-red-600 to-transparent opacity-50 animate-pulse"></div>
        
        {/* Icon cảnh báo */}
        <div className="text-6xl mb-6 animate-bounce">⚠️</div>

        {/* Tiêu đề lớn */}
        <h2 className="text-6xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-4 tracking-tighter drop-shadow-sm uppercase">
          TERMINATED
        </h2>
        
        {/* Dòng thông báo */}
        <p className="text-xl text-red-200/70 font-bold uppercase tracking-[0.3em] mb-12 border-t border-b border-red-900/30 py-4">
          Trận đấu đã bị hủy bởi Admin
        </p>

        {/* Footer đếm ngược & Nút */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest">
            Hệ thống sẽ tự động đóng sau <span className="text-red-500 font-bold text-2xl mx-1 font-sans">{countdown}</span> giây
          </p>

          <button 
            onClick={() => navigate('/')} 
            className="group relative px-10 py-4 bg-red-600 text-white font-black uppercase rounded-xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
            <span className="relative tracking-widest text-sm">Về Trang Chủ Ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};