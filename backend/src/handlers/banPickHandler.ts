import { Server, Socket } from 'socket.io';
import { roomStore } from '../services/store';
import { switchTurn } from '../utils/gameLogic';

export const registerBanPickHandlers = (io: Server, socket: Socket, roomId: string, role: string, side: string) => {
    
    const clearPreSelects = (r: any) => {
        r.p1PreSelect = null;
        r.p2PreSelect = null;
    };

    const checkPhaseSkip = (r: any): boolean => {
        const step = r.phases[r.currentPhaseIdx];
        if (!step) return false;
        if (step.type === 'CHAR_BAN' && r.config.cb === 0) return true;
        if (step.type === 'WEA_BAN' && r.config.wb === 0) return true;
        if (step.type === 'CHAR_PICK' && r.config.pk === 0) return true;
        return false;
    };

    const moveToNextValidPhase = (r: any) => {
        r.currentPhaseIdx++;
        
        while (r.currentPhaseIdx < r.phases.length && checkPhaseSkip(r)) {
            r.currentPhaseIdx++;
        }

        if (r.currentPhaseIdx < r.phases.length) {
            const nextStep = r.phases[r.currentPhaseIdx];
            r.phase = nextStep.type;
            r.turn = nextStep.priority.toLowerCase() as 'p1' | 'p2';
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
        } else {
            r.phase = 'MODIFICATION';
            if (r.timer) clearInterval(r.timer);
            r.timeLeft = 0;
            r.turn = 'p1';
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
        }
    };

    const handleSelection = (item: any, type: 'UNIT' | 'WEAPON') => {
        const r = roomStore.get(roomId);
        if (!r || ['WAITING', 'MODIFICATION', 'RESULT'].includes(r.phase)) return;
        if (role !== 'player' || side !== r.turn) return;

        const allSelectedIds = [
            ...r.p1Picks, ...r.p2Picks, 
            ...r.p1CharBans, ...r.p2CharBans, 
            ...r.p1WeaponBans, ...r.p2WeaponBans
        ].map((i: any) => i.id);

        if (allSelectedIds.includes(item.id)) return;

        const currentStep = r.phases[r.currentPhaseIdx];
        if (!currentStep) return;

        clearPreSelects(r);

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

        io.to(roomId).emit("server_notify_preselect", { side: r.turn, item: null });

        if (isPhaseFinished) {
            moveToNextValidPhase(r);
        } else {
            switchTurn(roomId, io);
        }
    };

    socket.on("client_preselect", (item) => {
        const r = roomStore.get(roomId);
        if (!r || ['WAITING', 'MODIFICATION', 'RESULT'].includes(r.phase)) return;
        if (role !== 'player' || side !== r.turn) return;

        if (side === 'p1') r.p1PreSelect = item;
        else r.p2PreSelect = item;

        socket.to(roomId).emit("server_notify_preselect", {
            side: side,
            item: item
        });
    });

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