import { Server, Socket } from 'socket.io';
import { roomStore } from '../services/store';
import { switchTurn } from '../utils/gameLogic';

export const registerBanPickHandlers = (io: Server, socket: Socket, roomId: string, role: string, side: string) => {
    
    // Hàm xử lý logic cốt lõi
    const handleSelection = (item: any, type: 'UNIT' | 'WEAPON') => {
        const r = roomStore.get(roomId);
        // Kiểm tra cơ bản: Phòng tồn tại? Đang đợi? Đúng lượt?
        if (!r || r.phase === 'WAITING') return;
        if (role !== 'player' || side !== r.turn) return;

        // Kiểm tra trùng lặp (Global Check)
        const allSelectedIds = [
            ...r.p1Picks, ...r.p2Picks, 
            ...r.p1CharBans, ...r.p2CharBans, 
            ...r.p1WeaponBans, ...r.p2WeaponBans
        ].map((i: any) => i.id);

        if (allSelectedIds.includes(item.id)) return;

        // Xử lý theo từng Phase
        switch (r.phase) {
            case 'BAN_CHAR':
                if (type !== 'UNIT') return;
                (r.turn === 'p1' ? r.p1CharBans : r.p2CharBans).push(item);
                
                // Check xem đã Ban đủ số lượng chưa để đổi Phase
                if (r.p1CharBans.length >= Math.ceil(r.config.cb / 2) && r.p2CharBans.length >= Math.ceil(r.config.cb / 2)) {
                    r.phase = r.config.wb > 0 ? 'BAN_WEAPON' : 'PICK_CHAR';
                }
                break;

            case 'BAN_WEAPON':
                if (type !== 'WEAPON') return;
                (r.turn === 'p1' ? r.p1WeaponBans : r.p2WeaponBans).push(item);
                
                if (r.p1WeaponBans.length >= Math.ceil(r.config.wb / 2) && r.p2WeaponBans.length >= Math.ceil(r.config.wb / 2)) {
                    r.phase = 'PICK_CHAR';
                }
                break;

            case 'PICK_CHAR':
            case 'PICK_WEAPON': // Dự phòng nếu có pick weapon
                if (type !== 'UNIT') return;
                const currentPicks = r.turn === 'p1' ? r.p1Picks : r.p2Picks;
                
                if (currentPicks.length >= r.config.pk) return;
                
                // Thêm Character với chỉ số mặc định
                currentPicks.push({ ...item, eidolon: 0, equippedWeapon: null, weaponRank: 1 });

                // Nếu cả 2 bên đã Pick đủ => Sang Phase Modification
                if (r.p1Picks.length >= r.config.pk && r.p2Picks.length >= r.config.pk) {
                    r.phase = 'MODIFICATION';
                    if (r.timer) clearInterval(r.timer);
                    r.timeLeft = 0;
                    io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
                    return; // Return luôn, không switch turn nữa
                }
                break;
        }

        // Đổi lượt sau khi hành động xong
        switchTurn(roomId, io);
    };

    // --- LISTENER ---

    // 1. Pick Tướng
    socket.on("action_pick", (char) => handleSelection(char, 'UNIT'));

    // 2. Ban Weapon (hoặc Pick Weapon nếu có mode đó)
    socket.on("action_pick_weapon", (wpn) => handleSelection(wpn, 'WEAPON'));

    // 3. Cập nhật chỉ số (Eidolon/Superimposition) trong phase Modification
    socket.on("action_update_unit", (data) => {
        const r = roomStore.get(roomId);
        if (!r) return;
        
        // Chỉ cho phép sửa đội hình của chính mình
        const target = side === 'p1' ? r.p1Picks : r.p2Picks;
        if (target[data.index]) {
            target[data.index] = { ...target[data.index], ...data };
        }
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });

    // 4. Xác nhận đội hình (Ready)
    socket.on("action_confirm_mod", () => {
        const r = roomStore.get(roomId);
        if (!r) return;
        
        if (side === 'p1') r.p1Ready = !r.p1Ready;
        else r.p2Ready = !r.p2Ready;
        
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    });
};