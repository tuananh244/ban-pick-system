import React, { useMemo, useState } from 'react';

interface ScoreResultModalProps {
    p1Teams: any[];
    p2Teams: any[];
    p1Configs: any[];
    p2Configs: any[];
    useAV?: boolean;
    onClose: () => void;
    onConfirm: (finalWinner: string) => void;
}

const Fireworks = ({ color }: { color: string }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full animate-ping"
                style={{ backgroundColor: color, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${0.4 + Math.random() * 1.2}s`, boxShadow: `0 0 15px ${color}, 0 0 30px ${color}` }}
            />
        ))}
    </div>
);

const PlayerMatchCard = ({ side, data, isWinner, totalScore, useAV, hasTalent, deadCount }: any) => {
    const isP1 = side === 'p1';
    const color = isP1 ? '#ec4899' : '#22d3ee';
    const isCleared = data.status === true;
    const glowClass = isWinner 
        ? (isP1 ? 'shadow-[0_0_30px_rgba(236,72,153,0.4)] border-pink-500 bg-pink-500/5' : 'shadow-[0_0_30px_rgba(34,211,238,0.4)] border-cyan-500 bg-cyan-500/5') 
        : 'border-white/5 opacity-30 grayscale scale-95';
    
    return (
        <div className={`relative w-full p-4 rounded-2xl border transition-all duration-500 ${glowClass}`}>
            <div className="flex justify-between items-center mb-3">
                <span className={`text-[11px] font-black uppercase tracking-widest ${isP1 ? 'text-pink-400' : 'text-cyan-400'}`}>{isP1 ? 'ĐỘI 01' : 'ĐỘI 02'}</span>
                <div className="flex gap-2 items-center">
                    {isCleared && hasTalent && <span className="text-[9px] font-black px-2 py-0.5 rounded-md border border-pink-500/50 bg-pink-500/20 text-pink-400 animate-pulse">TALENT (+2)</span>}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${isCleared ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{isCleared ? 'CLEARED' : 'FAILED'}</span>
                </div>
            </div>
            <div className="flex justify-between items-end gap-2">
                <div className="flex flex-col">
                    <span className="text-white font-black text-2xl italic tracking-tighter leading-none drop-shadow-lg">
                        {useAV ? (data.av || 0) : (data.turns || 0)}
                        <span className="text-[10px] text-white/40 ml-1 uppercase font-bold not-italic tracking-normal">{useAV ? 'AV' : 'Lượt'}</span>
                    </span>
                    {isCleared && deadCount > 0 && <span className="text-red-500 text-[10px] font-black italic mt-1 animate-pulse">☠️ {deadCount} DEAD (+{deadCount * 3}đ)</span>}
                </div>
                <div className="text-right leading-tight">
                    <div className="text-[7px] text-white/30 uppercase font-black tracking-widest">RESOURCE</div>
                    <div className="text-amber-400 font-black text-base italic uppercase leading-none">Cost {data.cost.toFixed(2)}</div>
                </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] font-black text-white/20 uppercase">Tổng điểm trận</span>
                <span className="text-white font-black text-xs">{totalScore.toFixed(2)}</span>
            </div>
            {isWinner && <div className="absolute -top-3 -right-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic shadow-2xl animate-bounce z-20" style={{ backgroundColor: color, color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>WIN</div>}
        </div>
    );
};

export const ScoreResultModal: React.FC<ScoreResultModalProps> = ({ p1Teams, p2Teams, p1Configs, p2Configs, useAV = false, onClose, onConfirm }) => {
    const [logicMode, setLogicMode] = useState<number | null>(null);

    const calculateCost = (team: any[], teamConfig: any) => {
        if (!team) return 0;
        const charCost = team.reduce((total, char) => {
            if (!char) return total;
            const eP = char.stats?.[char.eidolon] !== undefined ? Number(char.stats[char.eidolon]) : 0;
            const sP = char.equippedWeapon?.stats?.[char.weaponRank] !== undefined ? Number(char.equippedWeapon.stats[char.weaponRank]) : 0;
            return total + eP + sP;
        }, 0);
        const deathPenalty = teamConfig.isCleared ? (Number(teamConfig.deadCount) || 0) * 3 : 0;
        const talentBonus = (teamConfig.isCleared && teamConfig.hasCastoriceTalent) ? 2 : 0;
        return charCost + deathPenalty + talentBonus;
    };

    const calculatePerfScore = (val: number) => {
        const num = Number(val) || 0;
        if (useAV) return num * 0.1;
        if (num === 0) return -5;
        return 1 + (num - 1) * 0.5;
    };

    const results = useMemo(() => {
        if (logicMode === null) return null;
        let p1WinCount = 0, p2WinCount = 0, p1CumulativeScore = 0, p2CumulativeScore = 0;
        const maxMatches = Math.max(p1Configs.length, p2Configs.length);
        const matches = [];

        for (let i = 0; i < maxMatches; i++) {
            const c1 = p1Configs[i] || { turns: 0, av: 0, isCleared: false, hasCastoriceTalent: false, deadCount: 0 };
            const c2 = p2Configs[i] || { turns: 0, av: 0, isCleared: false, hasCastoriceTalent: false, deadCount: 0 };
            const cost1 = calculateCost(p1Teams[i], c1);
            const cost2 = calculateCost(p2Teams[i], c2);
            const perf1 = calculatePerfScore(useAV ? c1.av : c1.turns);
            const perf2 = calculatePerfScore(useAV ? c2.av : c2.turns);
            const raw1 = cost1 + perf1, raw2 = cost2 + perf2;
            let winner: 'p1' | 'p2' | 'draw' = 'draw', ms1 = raw1, ms2 = raw2;

            if (logicMode === 1) {
                if (!!c1.isCleared && !c2.isCleared) winner = 'p1';
                else if (!c1.isCleared && !!c2.isCleared) winner = 'p2';
                else { if (raw1 < raw2) winner = 'p1'; else if (raw1 > raw2) winner = 'p2'; }
            } else {
                ms1 += (!!c1.isCleared ? 0 : 25); ms2 += (!!c2.isCleared ? 0 : 25);
                if (ms1 < ms2) winner = 'p1'; else if (ms1 > ms2) winner = 'p2';
            }
            if (winner === 'p1') p1WinCount++; if (winner === 'p2') p2WinCount++;
            p1CumulativeScore += ms1; p2CumulativeScore += ms2;
            matches.push({ 
                p1: { status: !!c1.isCleared, turns: c1.turns, av: c1.av, cost: cost1, total: ms1, hasTalent: !!c1.hasCastoriceTalent, deadCount: c1.deadCount }, 
                p2: { status: !!c2.isCleared, turns: c2.turns, av: c2.av, cost: cost2, total: ms2, hasTalent: !!c2.hasCastoriceTalent, deadCount: c2.deadCount }, 
                winner 
            });
        }
        const finalWinnerName = p1WinCount > p2WinCount ? 'ĐỘI 01' : (p2WinCount > p1WinCount ? 'ĐỘI 02' : (p1CumulativeScore < p2CumulativeScore ? 'ĐỘI 01' : 'ĐỘI 02'));
        return { matches, p1WinCount, p2WinCount, p1CumulativeScore, p2CumulativeScore, finalWinner: finalWinnerName };
    }, [p1Teams, p2Teams, p1Configs, p2Configs, logicMode, useAV]);

    if (logicMode === null) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                <div className="w-full max-w-md bg-[#0f1216] border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-black text-white italic uppercase mb-8 text-center tracking-tighter">Cơ Chế Tính Điểm</h2>
                    <div className="grid gap-4">
                        <button onClick={() => setLogicMode(1)} className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-cyan-500/50 text-left transition-all">
                            <div className="text-cyan-400 font-black text-sm uppercase italic mb-1">Mode 1: Ưu Tiên Kết Quả</div>
                            <p className="text-white/50 text-[10px]">Bên CLEARED thắng FAILED. Nếu cùng trạng thái, xét điểm thấp hơn.</p>
                        </button>
                        <button onClick={() => setLogicMode(2)} className="group p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-pink-500/50 text-left transition-all">
                            <div className="text-pink-500 font-black text-sm uppercase italic mb-1">Mode 2: Ưu Tiên Tổng Điểm</div>
                            <p className="text-white/50 text-[10px]">Failed bị phạt +25đ. So sánh tổng cost cuối cùng của tất cả trận.</p>
                        </button>
                    </div>
                    <button onClick={onClose} className="w-full mt-6 py-2 text-white/20 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">← QUAY LẠI</button>
                </div>
            </div>
        );
    }

    const winnerColor = results?.finalWinner === 'ĐỘI 01' ? '#ec4899' : '#22d3ee';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="w-full max-w-5xl bg-[#0b0e14] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="px-10 py-6 border-b border-white/5 bg-[#14171f] flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">BẢNG ĐIỂM CHUNG CUỘC</h2>
                    </div>
                    <div className="flex items-center gap-6 bg-black/60 px-6 py-3 rounded-2xl border border-white/10">
                        <div className="text-center">
                            <div className="text-[8px] text-pink-400 font-black uppercase">Thắng P1</div>
                            <div className="text-2xl font-black text-white">{results?.p1WinCount}</div>
                            <div className="text-[10px] text-pink-500/50 font-bold">Σ {results?.p1CumulativeScore.toFixed(2)}</div>
                        </div>
                        <div className="text-white/10 font-black italic text-xl px-2">VS</div>
                        <div className="text-center">
                            <div className="text-[8px] text-cyan-400 font-black uppercase">Thắng P2</div>
                            <div className="text-2xl font-black text-white">{results?.p2WinCount}</div>
                            <div className="text-[10px] text-cyan-500/50 font-bold">Σ {results?.p2CumulativeScore.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* HIỂN THỊ DANH SÁCH TRẬN ĐẤU (Đây là nơi PlayerMatchCard được dùng) */}
                <div className="p-8 bg-black/40 overflow-y-auto custom-scrollbar flex-1">
                    <div className={`grid gap-8 ${results!.matches.length <= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {results?.matches.map((match, i) => (
                            <div key={i} className="space-y-4">
                                <div className="text-[10px] font-black text-white/30 uppercase italic text-center tracking-[0.4em]">TRẬN 0{i + 1}</div>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                                    <PlayerMatchCard side="p1" data={match.p1} isWinner={match.winner === 'p1'} totalScore={match.p1.total} useAV={useAV} hasTalent={match.p1.hasTalent} deadCount={match.p1.deadCount} />
                                    <div className="text-white/10 font-black italic text-xl px-2">VS</div>
                                    <PlayerMatchCard side="p2" data={match.p2} isWinner={match.winner === 'p2'} totalScore={match.p2.total} useAV={useAV} hasTalent={match.p2.hasTalent} deadCount={match.p2.deadCount} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative p-10 border-t border-white/5 text-center bg-gradient-to-b from-transparent to-[#14171f] overflow-hidden shrink-0">
                    {results?.finalWinner !== 'HÒA' && <Fireworks color={winnerColor} />}
                    <div className="relative z-10">
                        <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.8em] mb-4">GRAND CHAMPION</div>
                        <div className="text-7xl font-black italic tracking-tighter uppercase transition-all duration-1000" style={{ color: winnerColor, textShadow: `0 0 25px ${winnerColor}aa`, transform: 'skewX(-6deg)' }}>{results?.finalWinner}</div>
                    </div>
                </div>

                <div className="px-10 py-6 flex justify-between items-center bg-[#0b0e14] border-t border-white/5 shrink-0">
                    <button onClick={() => setLogicMode(null)} className="text-white/40 hover:text-white font-black uppercase text-[11px] tracking-widest transition-all">← ĐỔI QUY TẮC</button>
                    <button onClick={() => onConfirm(results!.finalWinner)} className="group relative bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black text-white uppercase text-[12px] tracking-tighter shadow-2xl active:scale-95 transition-all">
                        <span className="relative z-10 italic">XÁC NHẬN KẾT QUẢ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoreResultModal;