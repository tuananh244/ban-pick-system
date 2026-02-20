import { Server } from 'socket.io';
import { roomStore } from '../services/store';

/**
 * Hàm khởi chạy hoặc đặt lại bộ đếm thời gian
 */
export const startTimer = (roomId: string, io: Server) => {
    const room = roomStore.get(roomId);
    
    // 1. Dừng timer nếu ở các phase không cần đếm ngược
    if (!room || ['WAITING', 'MODIFICATION', 'RESULT', 'ADMIN_FILL'].includes(room.phase)) {
        if (room?.timer) {
            clearInterval(room.timer);
            room.timer = null;
        }
        return;
    }

    // Làm sạch timer cũ trước khi tạo cái mới
    if (room.timer) clearInterval(room.timer);

    // 2. Hỗ trợ chế độ không giới hạn thời gian (tm = 0)
    if (room.config.tm === 0) {
        room.timeLeft = 0;
        io.to(roomId).emit("timer_tick", 0);
        return;
    }

    room.timeLeft = room.config.tm;
    room.timer = setInterval(() => {
        room.timeLeft -= 1;
        if (room.timeLeft <= 0) {
            // Khi hết thời gian, tự động gọi switchTurn để đổi lượt hoặc chuyển phase
            switchTurn(roomId, io);
        } else {
            io.to(roomId).emit("timer_tick", room.timeLeft);
        }
    }, 1000);
};

/**
 * Hàm helper tìm index của giai đoạn hợp lệ tiếp theo (bỏ qua nếu count = 0)
 */
export const findNextValidPhaseIdx = (room: any, startIdx: number): number => {
    for (let i = startIdx; i < room.phases.length; i++) {
        const p = room.phases[i];
        
        // Kiểm tra xem giai đoạn này có bị vô hiệu hóa (count = 0) không
        if (p.type === 'CHAR_BAN' && room.config.cb === 0) continue;
        if (p.type === 'WEA_BAN' && room.config.wb === 0) continue;
        if (p.type === 'CHAR_PICK' && room.config.pk === 0) continue;
        
        return i; // Tìm thấy giai đoạn hợp lệ
    }
    return room.phases.length; // Đi tới cuối mảng (Kết thúc Ban/Pick)
};

/**
 * Hàm điều phối chuyển lượt và chuyển giai đoạn
 */
export const switchTurn = (roomId: string, io: Server) => {
    const room = roomStore.get(roomId);
    if (!room) return;

    // Kiểm tra xem Phase hiện tại đã đạt đủ số lượng cấm/chọn chưa
    const isComplete = roomStore.isPhaseComplete(roomId);

    if (isComplete) {
        // --- LOGIC CHUYỂN GIAI ĐOẠN ---
        // Tìm giai đoạn tiếp theo thực sự có số lượng > 0
        const nextIdx = findNextValidPhaseIdx(room, room.currentPhaseIdx + 1);
        room.currentPhaseIdx = nextIdx;

        if (nextIdx < room.phases.length) {
            const nextStep = room.phases[nextIdx];
            room.phase = nextStep.type;
            // Áp dụng đúng lượt ưu tiên (Priority) từ cấu hình của Phase mới
            room.turn = nextStep.priority.toLowerCase() as 'p1' | 'p2';
        } else {
            // Đã đi hết toàn bộ Workflow -> Chuyển sang MODIFICATION
            room.phase = 'MODIFICATION';
            room.turn = 'p1';
            if (room.timer) {
                clearInterval(room.timer);
                room.timer = null;
            }
            room.timeLeft = 0;
        }
    } else {
        // --- LOGIC ĐỔI LƯỢT TRONG PHASE ---
        room.turn = room.turn === 'p1' ? 'p2' : 'p1';
    }

    // QUAN TRỌNG: Dọn dẹp trạng thái "đang ngắm" (Monitor) để UI Admin sạch sẽ
    room.p1PreSelect = null;
    room.p2PreSelect = null;

    // Reset thời gian về mức cấu hình (cho lượt đi mới)
    room.timeLeft = room.config.tm;

    // Phát tín hiệu cập nhật trạng thái toàn phòng
    io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    
    // Khởi động lại đếm ngược (nếu Phase mới vẫn cần timer)
    startTimer(roomId, io);
};