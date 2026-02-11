import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { CONFIG } from './config/env';
import { roomStore } from './services/store'; 
import { startTimer } from './utils/gameLogic';
import { registerHandlers } from './handlers'; 

const app = express();

// Log cấu hình để debug khi khởi động
console.log(`[INIT] Running in ${CONFIG.NODE_ENV} mode`);

// Áp dụng CORS cho Express request
app.use(cors({ origin: CONFIG.ALLOWED_ORIGINS, credentials: true }));

const httpServer = createServer(app);

// Cấu hình Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
    const { token } = socket.handshake.auth;
    if (!token) return socket.disconnect();

    try {
        const decoded = jwt.verify(token, CONFIG.SECRET_KEY) as any;
        const { roomId, role, side } = decoded;

        socket.join(roomId);

        // 1. KHỞI TẠO PHÒNG NẾU CHƯA TỒN TẠI
        if (!roomStore.has(roomId)) {
            // Giải mã kịch bản từ Landing (lưu trong trường 'turn' của token)
            const workflowPhases = JSON.parse(decoded.turn || "[]");
            
            // XÁC ĐỊNH LƯỢT ĐI ĐẦU TIÊN TỪ KỊCH BẢN
            const firstPhase = workflowPhases[0];
            const initialTurn = firstPhase ? (firstPhase.priority.toLowerCase() as 'p1' | 'p2') : 'p1';

            const config = {
                ...decoded,
                tm: parseInt(decoded.tm || 0),
                cb: parseInt(decoded.cb || 0),
                pk: parseInt(decoded.pk || 0),
                wb: parseInt(decoded.wb || 0)
            };

            roomStore.set(roomId, {
                config,
                phases: workflowPhases,
                currentPhaseIdx: 0,
                phase: 'WAITING', 
                turn: initialTurn, // Gán đúng lượt đi từ workflow ngay lập tức
                p1Picks: [], p2Picks: [],
                p1CharBans: [], p2CharBans: [],
                p1WeaponBans: [], p2WeaponBans: [],
                p1FinalTeams: [], p2FinalTeams: [],
                p1TeamConfigs: [], p2TeamConfigs: [],
                // KHỞI TẠO TRẠNG THÁI GIÁM SÁT TRỰC TIẾP (PRE-SELECT)
                p1PreSelect: null,
                p2PreSelect: null,
                timeLeft: config.tm,
                timer: null,
                p1Ready: false, p2Ready: false
            });
        }

        const room = roomStore.get(roomId);
        if (!room) return;

        // 2. LOGIC KÍCH HOẠT TRẬN ĐẤU KHI ADMIN VÀO
        if (role === 'admin' && room.phase === 'WAITING') {
            console.log(`⚡ Admin joined. Starting workflow for room: ${roomId}`);
            
            const firstPhase = room.phases[0];
            if (firstPhase) {
                room.phase = firstPhase.type;
                room.turn = firstPhase.priority.toLowerCase() as 'p1' | 'p2';
            }
            
            room.timeLeft = room.config.tm;
            startTimer(roomId, io);
            
            // Thông báo cho Players thoát màn hình WAITING
            io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
        }

        // 3. ĐỒNG BỘ TRẠNG THÁI BAN ĐẦU CHO CLIENT
        socket.emit("init_state", { 
            ...roomStore.getPublicState(roomId), 
            myIdentity: { role, side } 
        });

        // 4. ĐĂNG KÝ CÁC ACTION HANDLERS (PICK, BAN, PRESELECT, MOD...)
        registerHandlers(io, socket, roomId, role, side);

    } catch (e) {
        console.error("JWT Error:", e);
        socket.disconnect();
    }
});

httpServer.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running on port ${CONFIG.PORT}`);
});