interface ScoreDebuggerProps {
    p1Teams: any[];
    p2Teams: any[];
    p1Configs: any[];
    p2Configs: any[];
    onClose?: () => void;
}

const ScoreDebugger = ({ p1Teams, p2Teams, p1Configs, p2Configs, onClose }: ScoreDebuggerProps) => {
    const renderTable = (teams: any[], configs: any[], side: 'P1' | 'P2') => {
        const isP1 = side === 'P1';
        const accentColor = isP1 ? 'text-pink-400' : 'text-cyan-400';
        const borderColor = isP1 ? 'border-pink-500/30' : 'border-cyan-500/30';
        const bgColor = isP1 ? 'bg-pink-500/5' : 'bg-cyan-500/5';
        const thumbColor = isP1 ? '#ec4899' : '#06b6d4';
        
        // Tạo class name duy nhất cho từng bên để tránh xung đột style
        const scrollClass = `custom-debug-scroll-${side.toLowerCase()}`;

        return (
            <div className={`flex-1 flex flex-col gap-4 p-5 rounded-3xl border ${borderColor} ${bgColor} backdrop-blur-md overflow-hidden`}>
                {/* CSS Scrollbar riêng biệt cho từng cột và hỗ trợ Firefox */}
                <style>{`
                    .${scrollClass} {
                        scrollbar-width: thin;
                        scrollbar-color: ${thumbColor}66 transparent;
                    }
                    .${scrollClass}::-webkit-scrollbar { 
                        width: 5px; 
                    }
                    .${scrollClass}::-webkit-scrollbar-track { 
                        background: transparent; 
                    }
                    .${scrollClass}::-webkit-scrollbar-thumb { 
                        background: ${thumbColor}66; 
                        border-radius: 10px; 
                    }
                    .${scrollClass}::-webkit-scrollbar-thumb:hover { 
                        background: ${thumbColor}; 
                    }
                `}</style>
                
                <h3 className={`text-xl font-black uppercase tracking-tighter border-b ${borderColor} pb-3 ${accentColor}`}>
                    {side} Analysis
                </h3>

                {/* Áp dụng class cuộn đã định nghĩa ở trên */}
                <div className={`flex-1 overflow-y-auto ${scrollClass} space-y-4 pr-2`}>
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
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg bg-gray-900">
                                                                <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-black text-white leading-tight uppercase text-[14px] truncate flex items-center gap-1.5">
                                                                    <span>{char.name}</span>
                                                                    <span className="text-cyan-400 text-[11px] bg-cyan-400/10 px-1.5 rounded border border-cyan-400/20 italic">E{char.eidolon || 0}</span>
                                                                </div>
                                                                <div className="text-[10px] text-white/40 truncate italic flex items-center gap-1">
                                                                    <span className="text-orange-400 font-bold">S{char.weaponRank || 1}</span> 
                                                                    {char.equippedWeapon?.name || "None"}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-3">
                                                            <div className="flex flex-col items-end leading-none">
                                                                <span className="text-[13px] font-black text-cyan-400 font-mono italic">{eP.toFixed(1)}</span>
                                                                <span className="text-[10px] text-orange-400 font-mono">+{sP.toFixed(1)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-right py-3 pl-4">
                                                            <span className="font-black text-[17px] text-white tabular-nums drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                                                                {(eP + sP).toFixed(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-white/[0.05] px-4 py-3 flex justify-between items-center border-t border-white/10">
                                    <span className="text-[11px] font-black text-white/30 uppercase tracking-widest italic">Sub-Total</span>
                                    <span className={`text-2xl font-black italic tracking-tighter ${accentColor} drop-shadow-lg`}>
                                        {(team.reduce((s: number, c: any) => s + (Number(c?.stats?.[c.eidolon]) || 0) + (Number(c?.equippedWeapon?.stats?.[c.weaponRank]) || 0), 0) + talentPoints + deathPenalty).toFixed(1)}
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
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-2 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-end px-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
                        Debug <span className="text-cyan-500">Analysis</span>
                    </h2>
                    <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.4em]">Audit & System Comparison Console</p>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="bg-white/5 hover:bg-red-500 text-white border border-white/10 hover:border-red-400 px-8 py-2.5 rounded-2xl text-[12px] font-black uppercase transition-all shadow-2xl active:scale-95 flex items-center gap-2 group"
                    >
                        <span>Đóng</span>
                    </button>
                )}
            </div>

            <div className="flex gap-6 h-[560px]">
                {renderTable(p1Teams, p1Configs, "P1")}
                {renderTable(p2Teams, p2Configs, "P2")}
            </div>
        </div>
    );
};

export default ScoreDebugger;