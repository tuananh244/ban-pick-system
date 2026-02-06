import React from 'react';

interface Props {
  currentBg: string;
  children: React.ReactNode;
  onOpenSupport: () => void;
  onOpenBgSettings: () => void;
  onOpenInfo: () => void; // <--- 1. Thêm Prop này
}

export const LandingLayout: React.FC<Props> = ({ 
  currentBg, children, onOpenSupport, onOpenBgSettings, onOpenInfo 
}) => {
  return (
    <>
      <div className="rotate-warning text-white text-center">
        <div className="text-5xl mb-4 animate-spin">🔃</div>
        <h2 className="text-2xl font-bold italic uppercase">Vui lòng xoay ngang</h2>
      </div>

      <div 
        className="landing-background h-screen w-full relative overflow-hidden" 
        style={{ 
          backgroundImage: `url('${currentBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'background-image 0.5s ease-in-out'
        }}
      >
        {/* --- KHU VỰC CÁC NÚT CÔNG CỤ (GÓC TRÊN BÊN PHẢI) --- */}
        <div className="absolute top-4 right-4 flex gap-3 z-50">
          
          {/* NÚT MỚI: INFO */}
          <button 
            onClick={onOpenInfo} 
            className="shrink-0 w-10 h-10 rounded-full bg-black/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]"
            title="Giới thiệu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>

          {/* Nút Ủng hộ cũ */}
          <button 
            onClick={onOpenSupport} 
            className="shrink-0 w-10 h-10 rounded-full bg-black/60 border border-pink-500/50 flex items-center justify-center text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all duration-300 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_25px_rgba(236,72,153,0.8)]"
            title="Ủng hộ & Góp ý"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>

          {/* Nút Cài đặt cũ */}
          <button 
            onClick={onOpenBgSettings} 
            className="shrink-0 group w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            title="Cài đặt hình nền"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </>
  );
};