import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { CONFIG } from './config/env';
import { roomStore } from './services/store'; 
import { startTimer, findNextValidPhaseIdx } from './utils/gameLogic';
import { registerHandlers } from './handlers'; 

const app = express();

console.log(`[INIT] Running in ${CONFIG.NODE_ENV} mode`);

app.use(cors({ origin: CONFIG.ALLOWED_ORIGINS, credentials: true }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CONFIG.ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Chuyển callback connection sang async
io.on("connection", async (socket) => {
    const { token } = socket.handshake.auth;
    if (!token) return socket.disconnect();

    try {
        const decoded = jwt.verify(token, CONFIG.SECRET_KEY) as any;
        const { roomId, role, side } = decoded;
        socket.join(roomId);

        let room = await roomStore.get(roomId);

        // Chỉ tạo mới nếu Redis hoàn toàn không có data
        if (!room) {
            const workflowPhases = JSON.parse(decoded.turn || "[]");
            room = {
                config: { ...decoded, tm: parseInt(decoded.tm), cb: parseInt(decoded.cb), pk: parseInt(decoded.pk), wb: parseInt(decoded.wb) },
                phases: workflowPhases,
                currentPhaseIdx: 0,
                phase: 'WAITING',
                turn: 'p1',
                p1Picks: [], p2Picks: [],
                p1CharBans: [], p2CharBans: [],
                p1WeaponBans: [], p2WeaponBans: [],
                p1FinalTeams: [], p2FinalTeams: [],
                p1TeamConfigs: [], p2TeamConfigs: [],
                p1PreSelect: null, p2PreSelect: null,
                timeLeft: parseInt(decoded.tm),
                timer: null,
                p1Ready: false, p2Ready: false
            };
            await roomStore.set(roomId, room);
        }

        if (role === 'admin' && room.phase === 'WAITING') {
            const firstIdx = findNextValidPhaseIdx(room, 0);
            room.currentPhaseIdx = firstIdx;
            if (firstIdx < room.phases.length) {
                const p = room.phases[firstIdx];
                room.phase = p.type;
                room.turn = p.priority.toLowerCase() as 'p1' | 'p2';
                await roomStore.set(roomId, room);
                await startTimer(roomId, io);
            } else {
                room.phase = 'MODIFICATION';
                await roomStore.set(roomId, room);
            }
            io.to(roomId).emit("update_state", roomStore.getPublicState(room));
        }

        socket.emit("init_state", { ...roomStore.getPublicState(room), myIdentity: { role, side } });
        registerHandlers(io, socket, roomId, role, side);

    } catch (e) {
        socket.disconnect();
    }
});

httpServer.listen(CONFIG.PORT, () => {
  console.log(`✅ Server running on port ${CONFIG.PORT}`);
});