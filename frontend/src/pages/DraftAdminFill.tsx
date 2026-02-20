import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jwtVerify } from 'jose';
import { useDraftSocket } from '../hooks/useDraftSocket';
import { loadCharacters } from '../loader/loadCharacters'; 
import { loadWeapons } from '../loader/loadWeapons';
import type { Character } from '../types/characters';

// Import Child Components
import FillPool from '../components/AdminFill/FillPool';
import TeamColumn from '../components/AdminFill/TeamColumn';
import ConfigModal from '../components/AdminFill/ConfigModal';
import { TerminatedScreen } from '../components/Draft/TerminatedScreen';
import { ExitConfirmPopup } from '../components/Draft/ExitConfirmPopup';
import ScoreResultModal from '../components/AdminFill/ScoreResultModal';
import ScoreDebugger from '../components/AdminFill/ScoreDebbuger'; // Import Component bạn đã làm riêng

const JWT_SECRET = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET || "DEFAULT_DEV_SECRET");

const MODES = [
  { id: 1, label: '1. ĐỘI HÌNH', color: 'bg-white text-black' },
  { id: 2, label: '2. TRANG BỊ', color: 'bg-cyan-500 text-white' }, 
  { id: 3, label: '3. LƯỢT ĐÁNH', color: 'bg-purple-500 text-white' }
];

const DraftAdminFill: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [decoded, setDecoded] = useState<any>(null);
  const [allChars, setAllChars] = useState<Character[]>([]);
  const [allWeapons, setAllWeapons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [mode, setMode] = useState<number>(1);
  const [useAV, setUseAV] = useState<boolean>(false); 
  const [editingChar, setEditingChar] = useState<{ teamSide: 'p1'|'p2', teamIndex: number, charIndex: number, data: any } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ teamSide: 'p1' | 'p2', teamIndex: number, slotIndex: number } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const { roomData, sendAction, isTerminated } = useDraftSocket(token, BACKEND_URL);

  useEffect(() => {
    if (!token) { navigate('/'); return; }

    jwtVerify(token, JWT_SECRET)
        .then(({ payload }: any) => { setDecoded(payload); })
        .catch((err) => {
            console.error("JWT Error:", err);
            navigate('/');
        });

    const fetchData = async () => {
        try {
            const [chars, wpns] = await Promise.all([loadCharacters(), loadWeapons()]);
            setAllChars(chars);
            setAllWeapons(wpns);
        } catch (err) { console.error("Data Load Error:", err); }
    };
    fetchData();
  }, [token, navigate]);

  const p1FinalTeams = roomData?.p1FinalTeams || [];
  const p2FinalTeams = roomData?.p2FinalTeams || [];
  const p1TeamConfigs = roomData?.p1TeamConfigs || [];
  const p2TeamConfigs = roomData?.p2TeamConfigs || [];
  
  const globalBannedWeaponIds = useMemo(() => {
      const bans = [...(roomData?.p1WeaponBans || []), ...(roomData?.p2WeaponBans || [])];
      return new Set(bans.map((w: any) => w.id));
  }, [roomData]);

  if (isTerminated) return <TerminatedScreen />;

  // --- HANDLERS ---
  const handleStatUpdate = (updates: any) => {
    if (!editingChar) return;
    let finalUpdates = { ...updates };
    if (updates.equippedWeapon && typeof updates.equippedWeapon === 'string') {
        const fullWeaponData = allWeapons.find(w => w.id === updates.equippedWeapon);
        if (fullWeaponData) finalUpdates.equippedWeapon = fullWeaponData;
    }
    sendAction("admin_update_fill_stats", { 
      teamSide: editingChar.teamSide, teamIndex: editingChar.teamIndex, 
      charIndex: editingChar.charIndex, updates: finalUpdates 
    });
    setEditingChar(null);
  };

  const handleTeamSlotClick = (teamSide: 'p1'|'p2', teamIndex: number, slotIndex: number, char: any) => {
      if (mode === 1) {
          if (selectedSlot?.teamSide === teamSide && selectedSlot?.teamIndex === teamIndex && selectedSlot.slotIndex === slotIndex) {
              setSelectedSlot(null);
          } else if (selectedSlot && selectedSlot.teamSide === teamSide) {
              sendAction("admin_fill_swap", { teamSide, teamIndex1: selectedSlot.teamIndex, slotIndex1: selectedSlot.slotIndex, teamIndex2: teamIndex, slotIndex2: slotIndex });
              setSelectedSlot(null);
          } else { setSelectedSlot({ teamSide, teamIndex, slotIndex }); }
      } 
      else if (mode === 2 && char?.isFilled) {
          setEditingChar({ teamSide, teamIndex, charIndex: slotIndex, data: char });
      }
  };

  const handlePoolCharClick = (char: Character) => {
      if (mode !== 1 || !selectedSlot) return;
      const currentList = selectedSlot.teamSide === 'p1' ? p1FinalTeams.flat() : p2FinalTeams.flat();
      if (currentList.some((c:any) => c?.id === char.id)) return;
      const charWithDefaultStats = { ...char, eidolon: 0, weaponRank: 1, isFilled: true };
      sendAction("admin_fill_add", { teamSide: selectedSlot.teamSide, teamIndex: selectedSlot.teamIndex, char: charWithDefaultStats });
      if (selectedSlot.slotIndex < 3) setSelectedSlot({ ...selectedSlot, slotIndex: selectedSlot.slotIndex + 1 });
      else setSelectedSlot(null);
  };

  const handleConfigUpdate = (teamSide: 'p1' | 'p2', teamIndex: number, updates: any) => {
      sendAction("admin_update_team_config", { teamSide, teamIndex, config: updates });
  };

  const handleTurnUpdate = (teamSide: 'p1' | 'p2', teamIndex: number, delta: number) => {
      const currentConfigs = teamSide === 'p1' ? p1TeamConfigs : p2TeamConfigs;
      const currentTurns = currentConfigs[teamIndex]?.turns || 5;
      handleConfigUpdate(teamSide, teamIndex, { turns: Math.max(0, Math.min(20, currentTurns + delta)) });
  };

  const handleClearStatusUpdate = (teamSide: 'p1' | 'p2', teamIndex: number, isCleared: boolean) => {
      const currentConfigs = teamSide === 'p1' ? p1TeamConfigs : p2TeamConfigs;
      const currentConfig = currentConfigs[teamIndex];
      let updates: any = { isCleared };
      if (!isCleared) {
          if (useAV) updates.av = 999;
          else updates.turns = 20;
          updates.deadCount = 0;
          updates.hasCastoriceTalent = false;
      } else {
          if (useAV) updates.av = 0;
          else updates.turns = 0;
      }
      sendAction("admin_update_team_config", { teamSide, teamIndex, config: { ...currentConfig, ...updates } });
  };

  const handleFinalConfirm = () => {
    sendAction("admin_calc_score", { logicMode: 1, useAV }); 
    setShowResultModal(false);
  };

  if (!roomData) return <div className="h-screen bg-black flex items-center justify-center text-cyan-500 font-mono italic animate-pulse">CONNECTING...</div>;

  if (decoded && decoded.role !== 'admin') {
    return (
      <div className="h-screen bg-[#020406] flex items-center justify-center relative overflow-hidden">
        <div className="z-10 text-center space-y-6 animate-in fade-in zoom-in duration-700">
          <img src="/images/gif/waiting6.gif" className="w-64 mx-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]" alt="Waiting" />
          <h1 className="text-4xl font-black text-cyan-500 italic tracking-[0.2em] drop-shadow-md uppercase">Setup Complete</h1>
          <p className="text-white font-bold tracking-widest uppercase text-sm opacity-80">Vô game và hoàn thành đội hình của bạn!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020406] text-white flex flex-col font-sans overflow-hidden">
        <header className="h-16 shrink-0 bg-[#0b0d12] border-b border-white/10 flex items-center justify-between px-6 z-30 shadow-2xl">
            <div className="flex items-center gap-8">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyan-500 tracking-[0.3em]">CONSOLE</span>
                    <h2 className="text-lg font-black italic uppercase">Admin Adjust</h2>
                </div>
                <nav className="flex bg-black/40 p-1 rounded-xl border border-white/5 gap-1">
                    {MODES.map(m => (
                        <button key={m.id} onClick={() => { setMode(m.id); setSelectedSlot(null); }}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${mode === m.id ? `${m.color} shadow-lg scale-105` : 'text-white/40 hover:text-white'}`}>
                            {m.label}
                        </button>
                    ))}
                </nav>
                {mode === 3 && (
                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                      <button onClick={() => setUseAV(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${!useAV ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}>TURNS</button>
                      <button onClick={() => setUseAV(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${useAV ? 'bg-amber-500 text-black' : 'text-white/30 hover:text-white'}`}>AV</button>
                  </div>
                )}
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setShowDebugger(true)} className="text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-amber-500 hover:text-black transition-all">Soát Điểm</button>
                <div className="w-px h-8 bg-white/10"></div>
                <button onClick={() => setShowExitConfirm(true)} className="text-red-500/50 hover:text-red-500 text-[10px] font-black border border-red-500/20 px-3 py-1.5 rounded-lg transition-all">HỦY TRẬN</button>
                <button onClick={() => setShowResultModal(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-2.5 rounded-lg font-black uppercase text-[11px] tracking-[0.2em] shadow-lg active:scale-95 transition-all">HOÀN TẤT</button>
            </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
            <TeamColumn 
                side="p1" teams={p1FinalTeams} configs={p1TeamConfigs} mode={mode} 
                useAV={useAV} selectedSlot={selectedSlot} onSlotClick={handleTeamSlotClick} 
                onRemove={(side: any, t: any, s: any) => sendAction("admin_fill_remove", { teamSide: side, teamIndex: t, charIndex: s })} 
                onTurnUpdate={handleTurnUpdate} onConfigUpdate={handleConfigUpdate} onClearStatusUpdate={handleClearStatusUpdate}
            />

            <section className="flex-1 flex flex-col min-w-0 bg-[#080a0f] relative border-x border-white/5">
                {mode === 1 ? (
                    <FillPool allChars={allChars} roomData={roomData} selectedSlot={selectedSlot} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedPath={selectedPath} setSelectedPath={setSelectedPath} onPoolClick={handlePoolCharClick} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#112244_0%,_#080a0f_70%)] opacity-30 pointer-events-none"></div>
                        <div className="p-12 rounded-full bg-cyan-500/5 border border-cyan-500/10 mb-6 z-10">
                            <span className="text-7xl drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">{mode === 2 ? '🛠️' : '📊'}</span>
                        </div>
                        <h3 className="text-2xl font-black italic text-cyan-500 tracking-widest z-10 uppercase">{mode === 2 ? 'Gear Adjustment' : 'Performance Review'}</h3>
                        <p className="text-white/60 text-[10px] mt-2 uppercase font-bold tracking-[0.4em] z-10">
                          {mode === 2 ? 'Điều chỉnh Eidolon & Nón' : `Nhập ${useAV ? 'điểm AV' : 'số Vòng'} và Mạng chết`}
                        </p>
                    </div>
                )}
            </section>

            <TeamColumn 
                side="p2" teams={p2FinalTeams} configs={p2TeamConfigs} mode={mode} 
                useAV={useAV} selectedSlot={selectedSlot} onSlotClick={handleTeamSlotClick} 
                onRemove={(side: any, t: any, s: any) => sendAction("admin_fill_remove", { teamSide: side, teamIndex: t, charIndex: s })} 
                onTurnUpdate={handleTurnUpdate} onConfigUpdate={handleConfigUpdate} onClearStatusUpdate={handleClearStatusUpdate}
            />
        </main>

        {/* --- TÍCH HỢP SCORE DEBUGGER --- */}
        {showDebugger && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                <ScoreDebugger 
                    p1Teams={p1FinalTeams} 
                    p2Teams={p2FinalTeams} 
                    p1Configs={p1TeamConfigs} 
                    p2Configs={p2TeamConfigs} 
                    onClose={() => setShowDebugger(false)} 
                />
            </div>
        )}

        {showResultModal && (
            <ScoreResultModal 
                p1Teams={p1FinalTeams} p2Teams={p2FinalTeams}
                p1Configs={p1TeamConfigs} p2Configs={p2TeamConfigs}
                useAV={useAV} onClose={() => setShowResultModal(false)}
                onConfirm={handleFinalConfirm}
            />
        )}
        {showExitConfirm && <ExitConfirmPopup onConfirm={() => sendAction("admin_terminate", {})} onCancel={() => setShowExitConfirm(false)} />}
        {editingChar && <ConfigModal mode={mode} char={editingChar.data} weapons={allWeapons} bannedWeaponIds={globalBannedWeaponIds} onClose={() => setEditingChar(null)} onUpdate={handleStatUpdate} />}
    </div>
  );
};

export default DraftAdminFill;