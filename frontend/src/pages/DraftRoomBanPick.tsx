import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtVerify } from 'jose';

// Imports Components
import CharacterGridBanPick from '../components/BanPickDraft/CharacterGridBanPick';
import WeaponGridBanPick from '../components/BanPickDraft/WeaponGridBanPick';
import ModificationPanel from '../components/BanPickDraft/ModificationPanel';
import { GameHeader } from '../components/BanPickDraft/GameHeader';
import { TeamColumn } from '../components/BanPickDraft/TeamColumn';
import { BanHeaderBar } from '../components/BanPickDraft/BanHeaderBar'; // Đã sửa tên import
import { AdminBoard } from '../components/BanPickDraft/AdminBoard';
import { TerminatedScreen } from '../components/Draft/TerminatedScreen'; // Import component hủy trận nếu bạn đã tạo

// Import Config & Hooks
import { ENV } from '../config/env';
import { useDraftSocket } from '../hooks/useDraftSocket';
import { getDisabledIds } from '../utils/draftHelpers';
import { loadWeapons } from '../loader/loadWeapons'; 

const DraftRoomBanPick: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [decodedData, setDecodedData] = useState<any>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [allWeapons, setAllWeapons] = useState<any[]>([]);

  // --- 1. HOOKS: Auth & Data ---
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { navigate('/'); return; }
      try {
        const { payload } = await jwtVerify(token, ENV.JWT_SECRET);
        setDecodedData(payload);
        setIsTokenValid(true);
      } catch (error) { navigate('/'); }
    };
    verifyToken();
  }, [token, navigate]);

  useEffect(() => {
    const fetchWeapons = async () => {
      const data = await loadWeapons();
      if (Array.isArray(data)) setAllWeapons(data);
    };
    fetchWeapons();
  }, []);

  // --- 2. SOCKET CONNECTION ---
  const { roomData, isTerminated, timeLeft, sendAction } = useDraftSocket(
    isTokenValid ? token : null,
    ENV.BACKEND_URL
  );

  // --- 3. EFFECTS: Redirect & Reset ---
  useEffect(() => {
    if (roomData?.phase === 'ADMIN_FILL' && token) {
        navigate(`/admin-fill?token=${token}`);
    }
  }, [roomData?.phase, token, navigate]);

  useEffect(() => {
    if (roomData?.phase === 'MODIFICATION') setSelectedSlot(0);
  }, [roomData?.phase]);

  // --- 4. PREPARE DATA ---
  const safeP1WeaponBans = roomData?.p1WeaponBans || [];
  const safeP2WeaponBans = roomData?.p2WeaponBans || [];
  
  const availableWeapons = useMemo(() => {
    const allBannedIds = [...safeP1WeaponBans, ...safeP2WeaponBans].map((w: any) => w.id);
    return allWeapons.filter(w => !allBannedIds.includes(w.id));
  }, [allWeapons, safeP1WeaponBans, safeP2WeaponBans]);

  if (!isTokenValid || !roomData?.config) {
    return (
      <div className="h-screen bg-[#020406] flex flex-col items-center justify-center gap-6">
        {/* Container cho GIF để thêm hiệu ứng đổ bóng/phát sáng */}
        <div className="relative">
          <img 
            src="/images/gif/waiting.gif" 
            alt="Loading..." 
            className="w-48 h-48 object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]"
          />
          {/* Vòng xoay mờ ảo bao quanh GIF nếu muốn tăng tính thẩm mỹ */}
          <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="font-black italic text-cyan-400 animate-pulse tracking-[0.3em] text-2xl uppercase">
            ĐANG KẾT NỐI...
          </div>
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  const { config, turn, phase, p1Picks, p2Picks, p1CharBans = [], p2CharBans = [], p1WeaponBans = [], p2WeaponBans = [], p1Ready, p2Ready } = roomData;
  const myRole = decodedData?.role || 'viewer';
  const mySide = decodedData?.side || 'spectator';
  const isInfiniteTime = config.tm === 0;
  const isUrgent = !isInfiniteTime && timeLeft < 10;
  
  const isWeaponPhase = phase === 'BAN_WEAPON' || phase === 'PICK_WEAPON';
  const isBanPhase = phase === 'BAN_CHAR' || phase === 'BAN_WEAPON';
  const isModPhase = phase === 'MODIFICATION';

  // --- 5. RENDER WAITING SCREEN ---
  if (phase === 'WAITING') {
    return (
      <div className="h-screen w-full bg-[#020406] text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#112244_0%,_#020406_70%)] animate-pulse-slow" />
        <div className="z-10 flex flex-col items-center gap-8 text-center p-10">
          <div className="relative">
             <img src="/images/gif/waiting.gif" className="w-64 h-64 object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" alt="Loading" />
          </div>
          <div className="flex flex-col gap-2">
             <h1 className="text-5xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tighter">ĐANG KHỞI TẠO</h1>
             <p className="text-xl font-bold text-white/50 tracking-[0.3em] uppercase animate-pulse">
               {myRole === 'admin' ? 'Đang khởi động hệ thống...' : 'Đang chờ Host bắt đầu...'}
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 6. MAIN RENDER ---
  return (
    <div className="h-screen w-full bg-[#020406] text-white flex flex-col overflow-hidden select-none font-sans">
      
      {/* HEADER CHÍNH */}
      <GameHeader 
        phase={phase} 
        timeLeft={timeLeft} 
        isInfiniteTime={isInfiniteTime} 
        side={mySide} 
        isUrgent={isUrgent} 
        isAdmin={myRole === 'admin'}
        onTerminate={() => sendAction("admin_terminate", {})}
      />

      {/* THANH BAN NGANG (Nằm dưới Header, thay thế BanDisplay cũ) */}
      <BanHeaderBar 
         p1CharBans={p1CharBans} 
         p2CharBans={p2CharBans}
         p1WeaponBans={p1WeaponBans}
         p2WeaponBans={p2WeaponBans}
         config={config}
      />

      {/* KHU VỰC CHÍNH (3 CỘT) */}
      <main className="flex-1 flex p-4 gap-4 overflow-hidden bg-[radial-gradient(circle_at_50%_-20%,_#112244_0%,_transparent_60%)]">
        
        {/* TEAM 1 COLUMN */}
        <TeamColumn 
          teamId="p1" 
          picks={p1Picks} 
          configPk={config.pk} 
          turn={turn} 
          isModPhase={isModPhase} 
          mySide={mySide} 
          selectedSlot={selectedSlot} 
          setSelectedSlot={setSelectedSlot} 
          color="pink-500" 
          label="ĐỘI 01" 
        />

        {/* CENTER AREA (GRID) - Đã bỏ BanDisplay, Grid chiếm full chiều cao */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-0 relative rounded-2xl border border-white/5 bg-black/20 p-1 shadow-2xl">
            
            {/* --- PHASE: MODIFICATION / ADMIN --- */}
            {isModPhase ? (
               myRole === 'admin' ? (
                 <AdminBoard p1Ready={p1Ready} p2Ready={p2Ready} turn={turn} onSendAction={sendAction} />
               ) : (
                 <div className="flex flex-col h-full overflow-hidden">
                    <div className={`flex-1 min-h-0 transition-all duration-500 ${(mySide === 'p1' ? p1Ready : p2Ready) ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                       <ModificationPanel unit={(mySide === 'p1' ? p1Picks : p2Picks)[selectedSlot]} weapons={availableWeapons} onUpdate={(updates) => sendAction("action_update_unit", { index: selectedSlot, ...updates })} />
                    </div>
                    <div className="h-14 shrink-0 flex items-center justify-center pt-2">
                       <button onClick={() => sendAction("action_confirm_mod", {})} className={`w-full max-w-md py-2 rounded-xl font-black text-lg uppercase tracking-[0.3em] transition-all border-2 shadow-xl ${(mySide === 'p1' ? p1Ready : p2Ready) ? 'bg-green-500 border-green-400 text-black' : 'bg-yellow-500 border-yellow-400 text-black hover:scale-105'}`}>
                         {(mySide === 'p1' ? p1Ready : p2Ready) ? 'ĐANG CHỜ ADMIN...' : 'XÁC NHẬN CHỈNH SỬA'}
                       </button>
                    </div>
                 </div>
               )
            ) : (
            /* --- PHASE: BAN / PICK --- */
            phase !== 'ADMIN_FILL' && (
                <>
                  {/* Overlay chờ đối thủ */}
                  {mySide !== turn && myRole === 'player' && (
                    <div className="absolute inset-0 bg-black/80 z-50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto animate-in fade-in duration-500">
                      <img src="/images/gif/waiting.gif" alt="Opponent Thinking..." className="w-24 h-24 object-contain mb-4 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] opacity-90" />
                      <p className="text-xl font-black uppercase italic tracking-widest text-white/50 animate-pulse">Đối thủ đang suy nghĩ...</p>
                    </div>
                  )}

                  {/* Grid hiển thị */}
                  {isWeaponPhase ? (
                    <WeaponGridBanPick 
                        role={myRole} side={mySide} turn={turn} phase={isBanPhase ? 'BAN' : 'PICK'} 
                        onSelect={(wpn) => sendAction("action_pick_weapon", wpn)} 
                        disabledIds={getDisabledIds(p1Picks, p2Picks, [...p1CharBans, ...p1WeaponBans], [...p2CharBans, ...p2WeaponBans])} 
                    />
                  ) : (
                    <CharacterGridBanPick 
                        role={myRole} side={mySide} turn={turn} phase={isBanPhase ? 'BAN' : 'PICK'} 
                        onSelect={(char) => sendAction("action_pick", char)} 
                        disabledIds={getDisabledIds(p1Picks, p2Picks, [...p1CharBans, ...p1WeaponBans], [...p2CharBans, ...p2WeaponBans])} 
                    />
                  )}
                </>
              )
            )}
        </section>

        {/* TEAM 2 COLUMN */}
        <TeamColumn 
          teamId="p2" 
          picks={p2Picks} 
          configPk={config.pk} 
          turn={turn} 
          isModPhase={isModPhase} 
          mySide={mySide} 
          selectedSlot={selectedSlot} 
          setSelectedSlot={setSelectedSlot} 
          color="cyan-400" 
          label="ĐỘI 02" 
        />
      </main>

      {/* TERMINATED MODAL */}
      {isTerminated && <TerminatedScreen />}
      
      {/* Fallback nếu chưa có component TerminatedScreen thì dùng cái cũ bên dưới */}
      {isTerminated && !TerminatedScreen && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <div className="text-center p-12 border-2 border-red-600/20 rounded-[3rem] bg-black">
            <h2 className="text-8xl font-black italic text-red-600 mb-4 tracking-tighter">ĐÃ HỦY TRẬN</h2>
            <button onClick={() => navigate('/')} className="px-12 py-4 bg-red-600 text-white font-black uppercase rounded-xl hover:scale-105 transition-transform shadow-lg shadow-red-600/20">Về Trang Chủ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftRoomBanPick;