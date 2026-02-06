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

// --- MODULE DEBUGGER (Giữ nguyên logic tra cứu stats) ---
const ScoreDebugger = ({ p1Teams, p2Teams, p1Configs, p2Configs, onClose }: any) => {
    const renderTable = (teams: any[], configs: any[], side: 'P1' | 'P2') => {
        const isP1 = side === 'P1';
        const accentColor = isP1 ? 'text-pink-400' : 'text-cyan-400';
        const borderColor = isP1 ? 'border-pink-500/30' : 'border-cyan-500/30';
        const bgColor = isP1 ? 'bg-pink-500/5' : 'bg-cyan-500/5';

        return (
            <div className={`flex-1 flex flex-col gap-4 p-5 rounded-3xl border ${borderColor} ${bgColor} backdrop-blur-md`}>
                <h3 className={`text-xl font-black uppercase tracking-tighter border-b ${borderColor} pb-3 ${accentColor}`}>
                    {side} Analysis
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    {teams.map((team, tIdx) => {
                        const config = configs[tIdx] || {};
                        const talentPoints = config.hasCastoriceTalent ? 2 : 0;
                        const deathPenalty = config.isCleared ? (Number(config.deadCount) || 0) * 3 : 0;
                        return (
                            <div key={tIdx} className="bg-black/60 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                                <div className="bg-white/10 px-4 py-2 flex justify-between items-center border-b border-white/5">
                                    <span className="text-[12px] font-black text-white/60 uppercase italic">Match-0{tIdx + 1}</span>
                                    <div className="flex gap-2">
                                        {talentPoints > 0 && <span className="text-[10px] font-black bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded border border-pink-500/30">TALENT +2</span>}
                                        {deathPenalty > 0 && <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">DEATH +{deathPenalty}</span>}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <table className="w-full">
                                        <tbody className="divide-y divide-white/5">
                                            {team.map((char: any, cIdx: number) => {
                                                if (!char) return null;
                                                const eP = Number(char.stats?.[char.eidolon] || 0);
                                                const sP = Number(char.equippedWeapon?.stats?.[char.weaponRank] || 0);
                                                return (
                                                    <tr key={cIdx} className="group hover:bg-white/5 transition-all">
                                                        <td className="py-3 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg">
                                                                <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-black text-white leading-tight uppercase text-[14px] truncate">{char.name}</div>
                                                                <div className="text-[10px] text-white/40 truncate italic flex items-center gap-1">
                                                                    <span className="text-orange-400 font-bold">S{char.weaponRank}</span> 
                                                                    {char.equippedWeapon?.name || "None"}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-3">
                                                            <div className="flex flex-col items-end leading-none">
                                                                <span className="text-[14px] font-black text-cyan-400 font-mono italic">{eP.toFixed(1)}</span>
                                                                <span className="text-[11px] text-orange-400 font-mono">+{sP.toFixed(1)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-3 pl-4">
                                                            <span className="font-black text-[18px] text-white tabular-nums">{(eP + sP).toFixed(1)}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-white/[0.05] px-4 py-3 flex justify-between items-center border-t border-white/10">
                                    <span className="text-[11px] font-black text-white/30 uppercase tracking-widest italic">Match Raw Cost</span>
                                    <span className={`text-2xl font-black italic tracking-tighter ${accentColor}`}>
                                        {(team.reduce((s: number, c: any) => s + (Number(c?.stats?.[c.eidolon]) || 0) + (Number(c?.equippedWeapon?.stats?.[c.weaponRank]) || 0), 0) + talentPoints + deathPenalty).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-2">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Debug Console</h2>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-2">Bảng đối soát dữ liệu hệ thống</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-6 py-2 rounded-xl text-[12px] font-black uppercase transition-all shadow-lg active:scale-95">Đóng [Esc]</button>
                )}
            </div>
            <div className="flex gap-6 h-[600px]">
                {renderTable(p1Teams, p1Configs, "P1")}
                {renderTable(p2Teams, p2Configs, "P2")}
            </div>
        </div>
    );
};

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
    jwtVerify(token, JWT_SECRET).then(({ payload }) => setDecoded(payload)).catch(() => navigate('/'));
    Promise.all([loadCharacters(), loadWeapons()]).then(([chars, wpns]) => {
        setAllChars(chars);
        setAllWeapons(wpns);
    });
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
  
  // SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY: Đảm bảo cập nhật stats của nón
  const handleStatUpdate = (updates: any) => {
    if (!editingChar) return;

    let finalUpdates = { ...updates };

    // Nếu có sự thay đổi về vũ khí (equippedWeapon), chúng ta cần tìm object vũ khí đầy đủ từ Firebase
    if (updates.equippedWeapon && typeof updates.equippedWeapon === 'string') {
        const fullWeaponData = allWeapons.find(w => w.id === updates.equippedWeapon);
        if (fullWeaponData) {
            // Gán object vũ khí đầy đủ (bao gồm stats mảng s1-s5) thay vì chỉ ID string
            finalUpdates.equippedWeapon = fullWeaponData;
        }
    }

    sendAction("admin_update_fill_stats", { 
      teamSide: editingChar.teamSide, 
      teamIndex: editingChar.teamIndex, 
      charIndex: editingChar.charIndex, 
      updates: finalUpdates 
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
          } else {
              setSelectedSlot({ teamSide, teamIndex, slotIndex });
          }
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

      // Tạo object update trạng thái
      let updates: any = { isCleared };

      // LOGIC CHỐT: Nếu là FAILED, ép chỉ số Performance lên cực cao để thua
      if (!isCleared) {
          if (useAV) {
              updates.av = 999; // AV vô cùng lớn
          } else {
              updates.turns = 20; // Số turns tối đa
          }
          // Khi đã Failed thì không tính mạng chết và thiên phú (khớp với ScoreResultModal)
          updates.deadCount = 0;
          updates.hasCastoriceTalent = false;
      } else {
          // Nếu bấm nhầm và chuyển lại về CLEARED, reset về con số hợp lý để Admin nhập lại
          if (useAV) updates.av = 0;
          else updates.turns = 0;
      }

      sendAction("admin_update_team_config", { 
          teamSide, 
          teamIndex, 
          config: { ...currentConfig, ...updates } 
      });
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
          <img src="/images/gif/waiting.gif" className="w-64 mx-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]" alt="Waiting" />
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
                onTurnUpdate={handleTurnUpdate}
                onConfigUpdate={handleConfigUpdate}
                onClearStatusUpdate={handleClearStatusUpdate}
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
                onTurnUpdate={handleTurnUpdate} 
                onConfigUpdate={handleConfigUpdate}
                onClearStatusUpdate={handleClearStatusUpdate}
            />
        </main>

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
                p1Teams={p1FinalTeams} 
                p2Teams={p2FinalTeams}
                p1Configs={p1TeamConfigs} 
                p2Configs={p2TeamConfigs}
                useAV={useAV} 
                onClose={() => setShowResultModal(false)}
                onConfirm={handleFinalConfirm}
            />
        )}
        {showExitConfirm && <ExitConfirmPopup onConfirm={() => sendAction("admin_terminate", {})} onCancel={() => setShowExitConfirm(false)} />}
        {editingChar && <ConfigModal mode={mode} char={editingChar.data} weapons={allWeapons} bannedWeaponIds={globalBannedWeaponIds} onClose={() => setEditingChar(null)} onUpdate={handleStatUpdate} />}
    </div>
  );
};

export default DraftAdminFill;