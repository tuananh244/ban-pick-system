import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { CONFIG } from './config/env';
import { roomStore } from './services/store'; // Lưu ý: thư mục là services (số nhiều)
import { startTimer } from './utils/gameLogic';
import { registerHandlers } from './handlers'; // Import từ file index.ts trong handlers

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
      
      // Parse config từ token (đảm bảo kiểu number)
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
        timeLeft: config.tm, 
        timer: null,
        p1Ready: false, p2Ready: false
      });
    }

    const room = roomStore.get(roomId);
    if (!room) return;

    // 3. Logic Auto Start (Chỉ chạy khi Admin join và phòng đang WAITING)
    if (role === 'admin' && room.phase === 'WAITING') {
        console.log(`⚡ Admin joined. Auto-starting match for room ${roomId}`);
        
        // Xác định Phase đầu tiên dựa trên Config
        if (room.config.cb > 0) room.phase = 'BAN_CHAR';
        else if (room.config.wb > 0) room.phase = 'BAN_WEAPON';
        else room.phase = 'PICK_CHAR';
        
        // Bắt đầu đếm giờ và thông báo cho mọi người
        startTimer(roomId, io);
        io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
    }

    // 4. Gửi State hiện tại cho người vừa vào
    socket.emit("init_state", { 
        ...roomStore.getPublicState(roomId), 
        myIdentity: { role, side } 
    });

    // 5. Đăng ký toàn bộ Handler (Ban/Pick + Admin)
    // Hàm này lấy từ src/handlers/index.ts
    registerHandlers(io, socket, roomId, role, side);

    // 6. Xử lý ngắt kết nối
    socket.on("disconnect", () => {
        // console.log(`User disconnected from ${roomId}`);
        // Có thể thêm logic xóa phòng nếu cần
    });

  } catch (e) {
    console.error("Connection error:", e);
    socket.disconnect();
  }
});

httpServer.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running on port ${CONFIG.PORT}`);
});