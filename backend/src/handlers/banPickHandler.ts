import { Server, Socket } from 'socket.io';
import { roomStore } from '../services/store';
import { switchTurn } from '../utils/gameLogic';

export const registerBanPickHandlers = (io: Server, socket: Socket, roomId: string, role: string, side: string) => {
    
    // Hàm xử lý logic cốt lõi
    const handleSelection = (item: any, type: 'UNIT' | 'WEAPON') => {
        const r = roomStore.get(roomId);
        
        // 1. Kiểm tra cơ bản
        if (!r || r.phase === 'WAITING' || r.phase === 'MODIFICATION') return;
        if (role !== 'player' || side !== r.turn) return;

        // 2. Kiểm tra trùng lặp (Global Check)
        const allSelectedIds = [
            ...r.p1Picks, ...r.p2Picks, 
            ...r.p1CharBans, ...r.p2CharBans, 
            ...r.p1WeaponBans, ...r.p2WeaponBans
        ].map((i: any) => i.id);

        if (allSelectedIds.includes(item.id)) return;

        // --- TÍNH TOÁN SỐ LƯỢT MỖI BÊN ---
        // Ví dụ: config.cb = 2 => mỗi bên cấm 1. config.cb = 4 => mỗi bên cấm 2.
        const maxCharBansPerSide = Math.floor(r.config.cb / 2);
        const maxWeaponBansPerSide = Math.floor(r.config.wb / 2);

        // 3. XỬ LÝ THEO LUỒNG: CẤM NV -> CHỌN NV -> CẤM NÓN
        switch (r.phase) {
            case 'BAN_CHAR':
                if (type !== 'UNIT') return;
                (r.turn === 'p1' ? r.p1CharBans : r.p2CharBans).push(item);
                
                // Kiểm tra nếu CẢ HAI bên đã cấm đủ số lượng của RIÊNG HỌ
                if (r.p1CharBans.length >= maxCharBansPerSide && r.p2CharBans.length >= maxCharBansPerSide) {
                    r.phase = 'PICK_CHAR';
                    r.turn = 'p1'; // Reset về p1 bắt đầu pick
                }
                break;

            case 'PICK_CHAR':
                if (type !== 'UNIT') return;
                const currentPicks = r.turn === 'p1' ? r.p1Picks : r.p2Picks;
                if (currentPicks.length >= r.config.pk) return;
                
                // Thêm Character với slot trống cho nón
                currentPicks.push({ ...item, eidolon: 0, equippedWeapon: null, weaponRank: 1 });

                // Kiểm tra nếu cả 2 bên đã chọn đủ số lượng nhân vật
                if (r.p1Picks.length >= r.config.pk && r.p2Picks.length >= r.config.pk) {
                    // Sau khi pick xong, kiểm tra có cấm nón không
                    if (r.config.wb > 0) {
                        r.phase = 'BAN_WEAPON';
                    } else {
                        // Nếu không cấm nón thì sang MOD luôn
                        r.phase = 'MODIFICATION';
                        if (r.timer) clearInterval(r.timer);
                        r.timeLeft = 0;
                    }
                    r.turn = 'p1';
                }
                break;

            case 'BAN_WEAPON':
                if (type !== 'WEAPON') return;
                (r.turn === 'p1' ? r.p1WeaponBans : r.p2WeaponBans).push(item);
                
                // Kiểm tra nếu cả hai bên đã cấm đủ nón của riêng họ
                if (r.p1WeaponBans.length >= maxWeaponBansPerSide && r.p2WeaponBans.length >= maxWeaponBansPerSide) {
                    r.phase = 'MODIFICATION';
                    if (r.timer) clearInterval(r.timer);
                    r.timeLeft = 0;
                    r.turn = 'p1';
                }
                break;
        }

        // 4. Cập nhật trạng thái
        if (r.phase === 'MODIFICATION') {
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
            return;
        }

        // Đổi lượt (Switch Turn) cho người tiếp theo
        switchTurn(roomId, io);
    };

    // --- CÁC LISTENERS ---

    socket.on("action_pick", (char) => handleSelection(char, 'UNIT'));
    socket.on("action_pick_weapon", (wpn) => handleSelection(wpn, 'WEAPON'));

    socket.on("action_update_unit", (data) => {
        const r = roomStore.get(roomId);
        if (!r || r.phase !== 'MODIFICATION') return;
        
        const target = side === 'p1' ? r.p1Picks : r.p2Picks;
        if (target[data.index]) {
            target[data.index] = { ...target[data.index], ...data };
        }
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    socket.on("action_confirm_mod", () => {
        const r = roomStore.get(roomId);
        if (!r || r.phase !== 'MODIFICATION') return;
        
        if (side === 'p1') r.p1Ready = !r.p1Ready;
        else r.p2Ready = !r.p2Ready;
        
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });
};