import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtVerify } from 'jose';

// Imports Components
import CharacterGridBanPick from '../components/BanPickDraft/CharacterGridBanPick';
import WeaponGridBanPick from '../components/BanPickDraft/WeaponGridBanPick';
import ModificationPanel from '../components/BanPickDraft/ModificationPanel';
import { GameHeader } from '../components/BanPickDraft/GameHeader';
import { TeamColumn } from '../components/BanPickDraft/TeamColumn';
import { BanHeaderBar } from '../components/BanPickDraft/BanHeaderBar';
import { AdminBoard } from '../components/BanPickDraft/AdminBoard';
import { TerminatedScreen } from '../components/Draft/TerminatedScreen';
import { AdminLiveMonitor } from '../components/BanPickDraft/AdminLiveMonitor'; // Import mới

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

    // Hệ thống GIF ngẫu nhiên của bạn
    const randomGif = useMemo(() => {
        const gifs = ['waiting1.gif', 'waiting2.gif', 'waiting3.gif', 'waiting4.gif', 'waiting5.gif', 'waiting6.gif'];
        return `/images/gif/${gifs[Math.floor(Math.random() * gifs.length)]}`;
    }, []);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) { navigate('/'); return; }
            try {
                const secret = new TextEncoder().encode(ENV.JWT_SECRET);
                const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
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

    const { roomData, isTerminated, timeLeft, sendAction } = useDraftSocket(
        isTokenValid ? token : null,
        ENV.BACKEND_URL
    );

    useEffect(() => {
        if (roomData?.phase === 'ADMIN_FILL' && token) {
            navigate(`/admin-fill?token=${token}`);
        }
    }, [roomData?.phase, token, navigate]);

    useEffect(() => {
        if (roomData?.phase === 'MODIFICATION') setSelectedSlot(0);
    }, [roomData?.phase]);

    // Màn hình Loading ban đầu
    if (!isTokenValid || !roomData?.config) {
        return (
            <div className="h-screen bg-[#020406] flex flex-col items-center justify-center gap-6">
                <img src={randomGif} alt="Loading" className="w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                <div className="font-black italic text-cyan-400 animate-pulse tracking-[0.3em] uppercase">ĐANG KẾT NỐI...</div>
            </div>
        );
    }

    // Màn hình WAITING (Phòng chờ)
    if (roomData.phase === 'WAITING') {
        return (
            <div className="h-screen w-full bg-[#020406] flex flex-col items-center justify-center relative">
                <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                    <img src={randomGif} className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]" alt="Waiting" />
                    <h1 className="text-6xl font-black italic uppercase text-cyan-400 tracking-tighter">PHÒNG CHỜ</h1>
                    <p className="text-white/40 animate-pulse uppercase tracking-[0.4em] font-bold">Đang chờ Host bắt đầu...</p>
                </div>
            </div>
        );
    }

    const { 
        config, turn, phase, p1Picks, p2Picks, 
        p1CharBans = [], p2CharBans = [], 
        p1WeaponBans = [], p2WeaponBans = [], 
        p1Ready, p2Ready, p1PreSelect, p2PreSelect 
    } = roomData;

    const myRole = decodedData?.role || 'viewer';
    const mySide = decodedData?.side || 'spectator';
    const isInfiniteTime = config.tm === 0;
    const isUrgent = !isInfiniteTime && timeLeft < 10;
    
    const isWeaponStep = phase.includes('WEA');
    const isBanStep = phase.includes('BAN');
    const isModPhase = phase === 'MODIFICATION';

    return (
        <div className="h-screen w-full bg-[#020406] text-white flex flex-col overflow-hidden select-none font-sans">
            <GameHeader phase={phase} timeLeft={timeLeft} isInfiniteTime={isInfiniteTime} side={mySide} isUrgent={isUrgent} isAdmin={myRole === 'admin'} onTerminate={() => sendAction("admin_terminate", {})} />
            <BanHeaderBar p1CharBans={p1CharBans} p2CharBans={p2CharBans} p1WeaponBans={p1WeaponBans} p2WeaponBans={p2WeaponBans} config={config} />

            <main className="flex-1 flex p-4 gap-4 overflow-hidden bg-[radial-gradient(circle_at_50%_-20%,_#112244_0%,_transparent_60%)]">
                <TeamColumn teamId="p1" picks={p1Picks} configPk={config.pk} turn={turn} isModPhase={isModPhase} mySide={mySide} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} color="pink-500" label="ĐỘI 01" />

                <section className="flex-1 flex flex-col overflow-hidden min-w-0 relative rounded-2xl border border-white/5 bg-black/20 p-1 shadow-2xl">
                    {isModPhase ? (
                        myRole === 'admin' ? (
                            <AdminBoard p1Ready={p1Ready} p2Ready={p2Ready} turn={turn} onSendAction={sendAction} />
                        ) : (
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className={`flex-1 min-h-0 transition-all duration-500 ${(mySide === 'p1' ? p1Ready : p2Ready) ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                    <ModificationPanel unit={(mySide === 'p1' ? p1Picks : p2Picks)[selectedSlot]} weapons={allWeapons} onUpdate={(updates) => sendAction("action_update_unit", { index: selectedSlot, ...updates })} />
                                </div>
                                <div className="h-14 flex items-center justify-center pt-2">
                                    <button onClick={() => sendAction("action_confirm_mod", {})} className={`w-full max-w-md py-2 rounded-xl font-black text-lg uppercase transition-all border-2 shadow-xl ${(mySide === 'p1' ? p1Ready : p2Ready) ? 'bg-green-500 border-green-400 text-black' : 'bg-yellow-500 border-yellow-400 text-black'}`}>
                                        {(mySide === 'p1' ? p1Ready : p2Ready) ? 'ĐANG CHỜ ADMIN...' : 'XÁC NHẬN CHỈNH SỬA'}
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        phase !== 'ADMIN_FILL' && (
                            <>
                                {myRole === 'player' ? (
                                    <>
                                        {mySide !== turn && (
                                            <div className="absolute inset-0 bg-black/80 z-50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-auto">
                                                <img src={randomGif} className="w-48 h-48 object-contain mb-8 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" alt="thinking" />
                                                <p className="text-2xl font-black italic uppercase text-white/50 animate-pulse tracking-widest">Đối thủ đang suy nghĩ...</p>
                                            </div>
                                        )}
                                        
                                        {isWeaponStep ? (
                                            <WeaponGridBanPick role={myRole} side={mySide} turn={turn} phase={isBanStep ? 'BAN' : 'PICK'} onSelect={(wpn: any) => sendAction("action_pick_weapon", wpn)} onHover={(wpn: any) => mySide === turn && sendAction("client_preselect", wpn)} disabledIds={getDisabledIds(p1Picks, p2Picks, [...p1CharBans, ...p1WeaponBans], [...p2CharBans, ...p2WeaponBans])} p1PreSelectId={p1PreSelect?.id} p2PreSelectId={p2PreSelect?.id} />
                                        ) : (
                                            <CharacterGridBanPick role={myRole} side={mySide} turn={turn} phase={isBanStep ? 'BAN' : 'PICK'} onSelect={(char: any) => sendAction("action_pick", char)} onHover={(char: any) => mySide === turn && sendAction("client_preselect", char)} disabledIds={getDisabledIds(p1Picks, p2Picks, [...p1CharBans, ...p1WeaponBans], [...p2CharBans, ...p2WeaponBans])} p1PreSelectId={p1PreSelect?.id} p2PreSelectId={p2PreSelect?.id} />
                                        )}
                                    </>
                                ) : (
                                    /* ADMIN LIVE MONITOR: PHIÊN BẢN 1 SLOT TRUNG TÂM ĐÃ ĐƯỢC DỌN DẸP CODE */
                                    <AdminLiveMonitor 
                                        p1PreSelect={p1PreSelect} 
                                        p2PreSelect={p2PreSelect} 
                                        turn={turn} 
                                        phase={phase}
                                        gif={randomGif} 
                                    />
                                )}
                            </>
                        )
                    )}
                </section>

                <TeamColumn teamId="p2" picks={p2Picks} configPk={config.pk} turn={turn} isModPhase={isModPhase} mySide={mySide} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} color="cyan-400" label="ĐỘI 02" />
            </main>

            {isTerminated && <TerminatedScreen />}
        </div>
    );
};

export default DraftRoomBanPick;