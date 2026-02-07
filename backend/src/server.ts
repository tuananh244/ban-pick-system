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
console.log(`[INIT] Allowed Origins:`, CONFIG.ALLOWED_ORIGINS);

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
    // 1. Verify Token
    const decoded = jwt.verify(token, CONFIG.SECRET_KEY) as any;
    const { roomId, role, side } = decoded;

    socket.join(roomId);

    // 2. Init Room (Nếu phòng chưa tồn tại)
    if (!roomStore.has(roomId)) {
      console.log(`Creating Room: ${roomId}`);
      
      // Parse config từ token (ép kiểu số để tránh lỗi logic so sánh)
      const config = {
          ...decoded,
          tm: parseInt(decoded.tm || 0),
          cb: parseInt(decoded.cb || 0),
          pk: parseInt(decoded.pk || 0),
          wb: parseInt(decoded.wb || 0)
      };
      
      // Khởi tạo State mặc định
      roomStore.set(roomId, {
        config,
        p1Picks: [], p2Picks: [],
        p1CharBans: [], p2CharBans: [],
        p1WeaponBans: [], p2WeaponBans: [],
        p1FinalTeams: [], p2FinalTeams: [],
        p1TeamConfigs: [], p2TeamConfigs: [],
        turn: 'p1', 
        phase: 'WAITING',
        timeLeft: config.tm, // Đảm bảo lấy từ config
        timer: null,
        p1Ready: false, p2Ready: false
      });
    }

    const room = roomStore.get(roomId);
    if (!room) return;

    // 3. Logic Auto Start (Chỉnh sửa để đổi thứ tự Phase)
    if (role === 'admin' && room.phase === 'WAITING') {
        console.log(`⚡ Admin joined. Auto-starting match for room ${roomId}`);
        
        // LUỒNG MỚI: CẤM NV (nếu có) -> CHỌN NV
        // Lưu ý: Việc Cấm nón (BAN_WEAPON) chỉ diễn ra SAU KHI CHỌN NV xong (Xử lý ở Handlers)
        if (room.config.cb > 0) {
            room.phase = 'BAN_CHAR';
        } else {
            room.phase = 'PICK_CHAR'; 
        }
        
        // Cập nhật lại timeLeft cho Phase đầu tiên
        room.timeLeft = room.config.tm;
        
        // Bắt đầu đếm giờ và phát tín hiệu cho tất cả máy (Admin + 2 Players)
        startTimer(roomId, io);
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    }

    // 4. Gửi State hiện tại cho người vừa vào (Viewer hoặc Reconnect)
    socket.emit("init_state", { 
        ...roomStore.getPublicState(roomId), 
        myIdentity: { role, side } 
    });

    // 5. Đăng ký toàn bộ Handler (Ban/Pick + Admin)
    registerHandlers(io, socket, roomId, role, side);

    // 6. Xử lý ngắt kết nối
    socket.on("disconnect", () => {
        // Có thể thêm logic xử lý khi người chơi rớt mạng ở đây
    });

  } catch (e) {
    console.error("Connection error:", e);
    socket.disconnect();
  }
});

httpServer.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running on port ${CONFIG.PORT}`);
});