import { Server, Socket } from 'socket.io';
import { roomStore } from '../services/store';
import { switchTurn } from '../utils/gameLogic';

export const registerBanPickHandlers = (io: Server, socket: Socket, roomId: string, role: string, side: string) => {
    
    // --- HÀM HỖ TRỢ DỌN DẸP TRẠNG THÁI "ĐANG XEM" ---
    const clearPreSelects = (r: any) => {
        r.p1PreSelect = null;
        r.p2PreSelect = null;
    };

    const handleSelection = (item: any, type: 'UNIT' | 'WEAPON') => {
        const r = roomStore.get(roomId);
        
        // 1. Kiểm tra trạng thái cơ bản
        if (!r || ['WAITING', 'MODIFICATION', 'RESULT'].includes(r.phase)) return;
        
        // Chỉ Player có lượt mới được thực hiện khóa
        if (role !== 'player' || side !== r.turn) return;

        // 2. Kiểm tra trùng lặp (Global Check)
        const allSelectedIds = [
            ...r.p1Picks, ...r.p2Picks, 
            ...r.p1CharBans, ...r.p2CharBans, 
            ...r.p1WeaponBans, ...r.p2WeaponBans
        ].map((i: any) => i.id);

        if (allSelectedIds.includes(item.id)) return;

        // 3. Lấy thông tin Workflow hiện tại
        const currentStep = r.phases[r.currentPhaseIdx];
        if (!currentStep) return;

        // --- QUAN TRỌNG: Dọn dẹp trạng thái đang xem của Admin trước khi thực hiện logic khóa ---
        clearPreSelects(r);

        // --- XỬ LÝ DỮ LIỆU ---
        switch (currentStep.type) {
            case 'CHAR_BAN':
                if (type !== 'UNIT') return;
                (r.turn === 'p1' ? r.p1CharBans : r.p2CharBans).push(item);
                break;

            case 'CHAR_PICK':
                if (type !== 'UNIT') return;
                (r.turn === 'p1' ? r.p1Picks : r.p2Picks).push({ 
                    ...item, 
                    eidolon: 0, 
                    equippedWeapon: null, 
                    weaponRank: 1 
                });
                break;

            case 'WEA_BAN':
                if (type !== 'WEAPON') return;
                (r.turn === 'p1' ? r.p1WeaponBans : r.p2WeaponBans).push(item);
                break;
        }

        // 4. KIỂM TRA ĐIỀU KIỆN HOÀN THÀNH GIAI ĐOẠN
        let isPhaseFinished = false;
        const maxCharBansPerSide = Math.floor(r.config.cb / 2);
        const maxWeaponBansPerSide = Math.floor(r.config.wb / 2);

        if (currentStep.type === 'CHAR_BAN') {
            isPhaseFinished = r.p1CharBans.length >= maxCharBansPerSide && r.p2CharBans.length >= maxCharBansPerSide;
        } else if (currentStep.type === 'CHAR_PICK') {
            isPhaseFinished = r.p1Picks.length >= r.config.pk && r.p2Picks.length >= r.config.pk;
        } else if (currentStep.type === 'WEA_BAN') {
            isPhaseFinished = r.p1WeaponBans.length >= maxWeaponBansPerSide && r.p2WeaponBans.length >= maxWeaponBansPerSide;
        }

        // 5. PHÁT TÍN HIỆU XÓA PRE-SELECT CHO TOÀN BỘ PHÒNG (Để Admin xóa UI)
        io.to(roomId).emit("server_notify_preselect", { side: r.turn, item: null });

        // 6. CHUYỂN PHASE HOẶC ĐỔI LƯỢT
        if (isPhaseFinished) {
            r.currentPhaseIdx++;

            if (r.currentPhaseIdx < r.phases.length) {
                const nextStep = r.phases[r.currentPhaseIdx];
                r.phase = nextStep.type;
                r.turn = nextStep.priority.toLowerCase() as 'p1' | 'p2';
                
                io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
                switchTurn(roomId, io); 
            } else {
                r.phase = 'MODIFICATION';
                if (r.timer) clearInterval(r.timer);
                r.timeLeft = 0;
                r.turn = 'p1';
                io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
            }
        } else {
            switchTurn(roomId, io);
        }
    };

    // --- CƠ CHẾ MONITORING (PRE-SELECT) CHO ADMIN ---
    socket.on("client_preselect", (item) => {
        const r = roomStore.get(roomId);
        if (!r || ['WAITING', 'MODIFICATION', 'RESULT'].includes(r.phase)) return;
        
        // Chỉ người đang có lượt mới được gửi tín hiệu pre-select (tối ưu server)
        if (role !== 'player' || side !== r.turn) return;

        // Lưu tạm vào store để nếu Admin F5 vẫn thấy
        if (side === 'p1') r.p1PreSelect = item;
        else r.p2PreSelect = item;

        // Gửi thông báo siêu nhẹ (chỉ side và item) thay vì gửi cả roomState cồng kềnh
        // Điều này giúp Render Free không bị quá tải băng thông
        socket.to(roomId).emit("server_notify_preselect", {
            side: side,
            item: item
        });
    });

    // --- CÁC LISTENERS KHÁC ---
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