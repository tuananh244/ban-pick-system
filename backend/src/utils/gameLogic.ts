import { Server } from 'socket.io';
import { roomStore } from '../services/store';

export const startTimer = (roomId: string, io: Server) => {
    const room = roomStore.get(roomId);
    // Dừng timer nếu ở các phase không cần đếm ngược
    if (!room || ['WAITING', 'MODIFICATION', 'RESULT'].includes(room.phase)) {
        if (room?.timer) clearInterval(room.timer);
        return;
    }

    if (room.timer) clearInterval(room.timer);

    // Hỗ trợ chế độ không giới hạn thời gian (tm = 0)
    if (room.config.tm === 0) {
        io.to(roomId).emit("timer_tick", 0);
        return;
    }

    room.timeLeft = room.config.tm;
    room.timer = setInterval(() => {
        room.timeLeft -= 1;
        if (room.timeLeft <= 0) {
            // Khi hết thời gian, tự động chuyển lượt hoặc xử lý logic auto-pick
            switchTurn(roomId, io);
        } else {
            io.to(roomId).emit("timer_tick", room.timeLeft);
        }
    }, 1000);
};

export const switchTurn = (roomId: string, io: Server) => {
    const room = roomStore.get(roomId);
    if (!room) return;

    // 1. Kiểm tra xem Phase hiện tại (ví dụ: BAN_CHAR) đã hoàn thành chưa
    const isComplete = roomStore.isPhaseComplete(roomId);

    if (isComplete) {
        // 2. Nếu đã xong, tiến tới bước tiếp theo trong Workflow
        room.currentPhaseIdx++;

        if (room.currentPhaseIdx < room.phases.length) {
            // Chuyển sang Phase mới (ví dụ: từ BAN sang PICK)
            const nextStep = room.phases[room.currentPhaseIdx];
            room.phase = nextStep.type;
            
            // Lấy lượt ưu tiên (Turn) từ cấu hình của Phase đó (Giải quyết lỗi P2 đi trước)
            room.turn = nextStep.priority.toLowerCase() as 'p1' | 'p2';
        } else {
            // Nếu đã đi hết mảng phases -> Chuyển sang giai đoạn điều chỉnh (MODIFICATION)
            room.phase = 'MODIFICATION';
            if (room.timer) clearInterval(room.timer);
            room.timeLeft = 0;
        }
    } else {
        // 3. Nếu Phase chưa xong (ví dụ: mới Ban được 1/2 con), chỉ đơn giản là đổi lượt
        // Lưu ý: Tùy theo luật Draft (như Snake Draft), logic đổi lượt có thể phức tạp hơn
        room.turn = room.turn === 'p1' ? 'p2' : 'p1';
    }

    // Cập nhật trạng thái mới cho tất cả người chơi
    room.timeLeft = room.config.tm;
    io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    
    // Khởi động lại đếm ngược cho lượt mới
    startTimer(roomId, io);
};