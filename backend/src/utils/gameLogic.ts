import { Server } from 'socket.io';
import { roomStore } from '../services/store';

export const startTimer = async (roomId: string, io: Server) => {
    let room = await roomStore.get(roomId);
    if (!room || ['WAITING', 'MODIFICATION', 'RESULT'].includes(room.phase)) return;

    if (room.timer) clearInterval(room.timer);

    if (room.config.tm === 0) {
        room.timeLeft = 0;
        io.to(roomId).emit("timer_tick", 0);
        return;
    }

    room.timer = setInterval(async () => {
        // Lấy dữ liệu mới nhất từ Redis để tránh sai lệch
        const r = await roomStore.get(roomId);
        if (!r || !['CHAR_BAN', 'CHAR_PICK', 'WEA_BAN'].includes(r.phase)) {
            clearInterval(room.timer);
            return;
        }

        r.timeLeft -= 1;

        if (r.timeLeft <= 0) {
            clearInterval(room.timer);
            await switchTurn(roomId, io);
        } else {
            io.to(roomId).emit("timer_tick", r.timeLeft);
            // Lưu Redis mỗi 5s để backup
            if (r.timeLeft % 5 === 0) await roomStore.set(roomId, r);
        }
    }, 1000);
};

export const findNextValidPhaseIdx = (room: any, startIdx: number): number => {
    for (let i = startIdx; i < room.phases.length; i++) {
        const p = room.phases[i];
        if (p.type === 'CHAR_BAN' && room.config.cb === 0) continue;
        if (p.type === 'WEA_BAN' && room.config.wb === 0) continue;
        if (p.type === 'CHAR_PICK' && room.config.pk === 0) continue;
        return i;
    }
    return room.phases.length;
};

export const switchTurn = async (roomId: string, io: Server) => {
    const room = await roomStore.get(roomId);
    if (!room) return;

    const isComplete = roomStore.isPhaseComplete(room);

    if (isComplete) {
        const nextIdx = findNextValidPhaseIdx(room, room.currentPhaseIdx + 1);
        room.currentPhaseIdx = nextIdx;

        if (nextIdx < room.phases.length) {
            const nextStep = room.phases[nextIdx];
            room.phase = nextStep.type;
            room.turn = nextStep.priority.toLowerCase() as 'p1' | 'p2';
        } else {
            room.phase = 'MODIFICATION';
            room.turn = 'p1';
            room.timeLeft = 0;
        }
    } else {
        room.turn = room.turn === 'p1' ? 'p2' : 'p1';
    }

    room.p1PreSelect = null;
    room.p2PreSelect = null;
    room.timeLeft = room.config.tm;

    await roomStore.set(roomId, room);
    io.to(roomId).emit("update_state", roomStore.getPublicState(room));
    
    if (room.phase !== 'MODIFICATION') await startTimer(roomId, io);
};