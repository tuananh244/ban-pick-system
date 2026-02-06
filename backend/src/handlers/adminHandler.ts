import { Server, Socket } from 'socket.io';
import { roomStore } from '../services/store';

export const registerAdminHandlers = (io: Server, socket: Socket, roomId: string, role: string) => {
    
    const requireAdmin = () => {
        if (role !== 'admin') return false;
        const r = roomStore.get(roomId);
        return r || false;
    };

    socket.on("admin_unlock_players", () => {
        const r = requireAdmin();
        if (!r) return;
        r.p1Ready = false;
        r.p2Ready = false;
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    // 2. Khởi tạo phase điền team
    socket.on("admin_init_fill_phase", ({ teamCount }) => {
        const r = requireAdmin();
        if (!r) return;

        r.phase = 'ADMIN_FILL';
        r.config.teamCount = teamCount;

        const distributePicks = (picks: any[], count: number) => {
            const result = [];
            const pool = [...picks];
            for (let i = 0; i < count; i++) {
                const teamMembers = pool.splice(0, 4);
                while (teamMembers.length < 4) teamMembers.push(null);
                result.push(teamMembers);
            }
            return result;
        };

        r.p1FinalTeams = distributePicks(r.p1Picks, teamCount);
        r.p2FinalTeams = distributePicks(r.p2Picks, teamCount);

        // KHỞI TẠO MẶC ĐỊNH: Talent = false, deadCount = 0
        r.p1TeamConfigs = Array.from({ length: teamCount }, () => ({ 
            turns: 5, 
            av: 0, 
            isCleared: true,
            hasCastoriceTalent: false,
            deadCount: 0 
        }));
        r.p2TeamConfigs = Array.from({ length: teamCount }, () => ({ 
            turns: 5, 
            av: 0, 
            isCleared: true,
            hasCastoriceTalent: false,
            deadCount: 0 
        }));

        r.p1Ready = true; 
        r.p2Ready = true;
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    socket.on("admin_fill_add", ({ teamSide, teamIndex, char }) => {
        const r = requireAdmin();
        if (!r) return;
        const teams = teamSide === 'p1' ? r.p1FinalTeams : r.p2FinalTeams;
        const emptySlotIndex = teams[teamIndex].findIndex((slot: any) => slot === null);
        if (emptySlotIndex === -1) return;
        teams[teamIndex][emptySlotIndex] = { ...char, eidolon: 0, equippedWeapon: null, weaponRank: 1, isFilled: true };
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    socket.on("admin_fill_remove", ({ teamSide, teamIndex, charIndex }) => {
        const r = requireAdmin();
        if (!r) return;
        const teams = teamSide === 'p1' ? r.p1FinalTeams : r.p2FinalTeams;
        if (teams[teamIndex]) {
            teams[teamIndex][charIndex] = null;
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
        }
    });

    socket.on("admin_fill_swap", ({ teamSide, teamIndex1, slotIndex1, teamIndex2, slotIndex2 }) => {
        const r = requireAdmin();
        if (!r) return;
        const teams = teamSide === 'p1' ? r.p1FinalTeams : r.p2FinalTeams;
        const temp = teams[teamIndex1][slotIndex1];
        teams[teamIndex1][slotIndex1] = teams[teamIndex2][slotIndex2];
        teams[teamIndex2][slotIndex2] = temp;
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    socket.on("admin_update_fill_stats", ({ teamSide, teamIndex, charIndex, updates }) => {
        const r = requireAdmin();
        if (!r) return;
        const teams = teamSide === 'p1' ? r.p1FinalTeams : r.p2FinalTeams;
        if (teams[teamIndex] && teams[teamIndex][charIndex]) {
            const formattedUpdates = { ...updates };
            if (updates.eidolon !== undefined) formattedUpdates.eidolon = parseFloat(updates.eidolon);
            if (updates.weaponRank !== undefined) formattedUpdates.weaponRank = parseFloat(updates.weaponRank);
            teams[teamIndex][charIndex] = { ...teams[teamIndex][charIndex], ...formattedUpdates };
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
        }
    });

    socket.on("admin_update_team_config", ({ teamSide, teamIndex, config }) => {
        const r = requireAdmin();
        if (!r) return;
        const targetConfigs = teamSide === 'p1' ? r.p1TeamConfigs : r.p2TeamConfigs;
        if (targetConfigs[teamIndex]) {
            targetConfigs[teamIndex] = { ...targetConfigs[teamIndex], ...config };
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
        }
    });

    // 8. Kết thúc trận đấu và Tính toán kết quả
    socket.on("admin_calc_score", ({ logicMode, useAV }) => {
        const r = requireAdmin();
        if (!r) return;

        const getTeamCost = (team: any[], teamConfig: any) => {
            if (!team) return 0;
            
            // 1. Tính tổng điểm E và S từ dữ liệu Firebase
            const charPoints = team.reduce((total, char) => {
                if (!char) return total;

                // Lấy điểm Tinh hồn (E)
                const ePoints = char.stats && char.stats[char.eidolon] !== undefined 
                                ? parseFloat(char.stats[char.eidolon]) : 0;

                // Lấy điểm Tích tầng (S) từ stats của Nón ánh sáng đang mặc
                let sPoints = 0;
                if (char.equippedWeapon && char.equippedWeapon.stats) {
                    sPoints = char.equippedWeapon.stats[char.weaponRank] !== undefined
                              ? parseFloat(char.equippedWeapon.stats[char.weaponRank])
                              : 0;
                }

                return total + ePoints + sPoints;
            }, 0);

            // 2. Logic Khóa điểm: Nếu FAILED thì Talent và Death Penalty = 0
            const deathPenalty = teamConfig.isCleared ? (parseInt(teamConfig.deadCount) || 0) * 3 : 0;
            const talentBonus = (teamConfig.isCleared && teamConfig.hasCastoriceTalent) ? 2 : 0;

            return charPoints + deathPenalty + talentBonus;
        };

        const getPerfScore = (val: number) => {
            const num = parseFloat(val as any) || 0;
            if (useAV) return num * 0.1;
            if (num === 0) return -5;
            return 1 + (num - 1) * 0.5;
        };

        let p1TotalWins = 0;
        let p2TotalWins = 0;
        const matchResults = [];
        const teamCount = r.config.teamCount || 1;

        for (let i = 0; i < teamCount; i++) {
            const c1 = r.p1TeamConfigs[i] || { turns: 5, av: 0, isCleared: true, deadCount: 0 };
            const c2 = r.p2TeamConfigs[i] || { turns: 5, av: 0, isCleared: true, deadCount: 0 };
            
            const cost1 = getTeamCost(r.p1FinalTeams[i], c1);
            const cost2 = getTeamCost(r.p2FinalTeams[i], c2);

            const perf1 = getPerfScore(useAV ? c1.av : c1.turns);
            const perf2 = getPerfScore(useAV ? c2.av : c2.turns);

            let total1 = cost1 + perf1;
            let total2 = cost2 + perf2;

            let winner: 'p1' | 'p2' | 'draw' = 'draw';

            if (logicMode === 1) {
                if (c1.isCleared && !c2.isCleared) winner = 'p1';
                else if (!c1.isCleared && c2.isCleared) winner = 'p2';
                else {
                    if (total1 < total2) winner = 'p1';
                    else if (total1 > total2) winner = 'p2';
                }
            } else {
                const final1 = total1 + (c1.isCleared ? 0 : 25);
                const final2 = total2 + (c2.isCleared ? 0 : 25);
                total1 = final1;
                total2 = final2;
                if (total1 < total2) winner = 'p1';
                else if (total1 > total2) winner = 'p2';
            }

            if (winner === 'p1') p1TotalWins++;
            if (winner === 'p2') p2TotalWins++;
            
            matchResults.push({ 
                winner, 
                total1: parseFloat(total1.toFixed(2)), 
                total2: parseFloat(total2.toFixed(2)) 
            });
        }

        let finalWinner = 'HÒA';
        if (p1TotalWins > p2TotalWins) finalWinner = 'ĐỘI 01';
        else if (p2TotalWins > p1TotalWins) finalWinner = 'ĐỘI 02';
        else {
            // Nếu hòa số trận thắng, xét tổng điểm tích lũy của tất cả trận
            const sumP1 = matchResults.reduce((s, m) => s + m.total1, 0);
            const sumP2 = matchResults.reduce((s, m) => s + m.total2, 0);
            if (sumP1 < sumP2) finalWinner = 'ĐỘI 01';
            else if (sumP2 < sumP1) finalWinner = 'ĐỘI 02';
        }

        r.result = { logicMode, useAV, p1TotalWins, p2TotalWins, finalWinner, matchResults };
        r.phase = 'RESULT';
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    socket.on("admin_terminate", () => {
        if (role === 'admin') {
            console.log(`⚠️ Terminated Room: ${roomId}`);
            io.to(roomId).emit("terminated");
            roomStore.delete(roomId);
        }
    });
};