import { Server, Socket } from 'socket.io';
import { roomStore } from '../services/store';
import { switchTurn, findNextValidPhaseIdx } from '../utils/gameLogic';

export const registerBanPickHandlers = (io: Server, socket: Socket, roomId: string, role: string, side: string) => {

    const handleSelection = async (item: any, type: 'UNIT' | 'WEAPON') => {
        const r = await roomStore.get(roomId);
        if (!r || ['WAITING', 'MODIFICATION', 'RESULT'].includes(r.phase)) return;
        if (role !== 'player' || side !== r.turn) return;

        // Kiểm tra trùng
        const allIds = [...r.p1Picks, ...r.p2Picks, ...r.p1CharBans, ...r.p2CharBans, ...r.p1WeaponBans, ...r.p2WeaponBans].map(i => i.id);
        if (allIds.includes(item.id)) return;

        const currentStep = r.phases[r.currentPhaseIdx];
        r.p1PreSelect = null; r.p2PreSelect = null;

        switch (currentStep.type) {
            case 'CHAR_BAN':
                if (type === 'UNIT') (r.turn === 'p1' ? r.p1CharBans : r.p2CharBans).push(item);
                break;
            case 'CHAR_PICK':
                if (type === 'UNIT') (r.turn === 'p1' ? r.p1Picks : r.p2Picks).push({ ...item, eidolon: 0, equippedWeapon: null, weaponRank: 1 });
                break;
            case 'WEA_BAN':
                if (type === 'WEAPON') (r.turn === 'p1' ? r.p1WeaponBans : r.p2WeaponBans).push(item);
                break;
        }

        await roomStore.set(roomId, r);
        // Tự động kiểm tra chuyển lượt/phase qua switchTurn
        await switchTurn(roomId, io);
    };

    socket.on("client_preselect", async (item) => {
        const r = await roomStore.get(roomId);
        if (!r || !['CHAR_BAN', 'CHAR_PICK', 'WEA_BAN'].includes(r.phase)) return;
        if (role !== 'player' || side !== r.turn) return;

        if (side === 'p1') r.p1PreSelect = item;
        else r.p2PreSelect = item;

        await roomStore.set(roomId, r);
        socket.to(roomId).emit("server_notify_preselect", { side, item });
    });

    socket.on("action_pick", (char) => handleSelection(char, 'UNIT'));
    socket.on("action_pick_weapon", (wpn) => handleSelection(wpn, 'WEAPON'));

    socket.on("action_update_unit", async (data) => {
        const r = await roomStore.get(roomId);
        if (!r || r.phase !== 'MODIFICATION') return;
        const target = side === 'p1' ? r.p1Picks : r.p2Picks;
        if (target[data.index]) {
            target[data.index] = { ...target[data.index], ...data };
            await roomStore.set(roomId, r);
            io.to(roomId).emit("update_state", roomStore.getPublicState(r));
        }
    });

    socket.on("action_confirm_mod", async () => {
        const r = await roomStore.get(roomId);
        if (!r || r.phase !== 'MODIFICATION') return;
        if (side === 'p1') r.p1Ready = !r.p1Ready;
        else r.p2Ready = !r.p2Ready;
        await roomStore.set(roomId, r);
        io.to(roomId).emit("update_state", roomStore.getPublicState(r));
    });
};