import { Server } from 'socket.io';
import { roomStore } from '../services/store';

export const startTimer = (roomId: string, io: Server) => {
  const room = roomStore.get(roomId);
  if (!room) return;

  if (room.timer) {
    clearInterval(room.timer);
    room.timer = null;
  }

  // Các phase không đếm giờ
  if (['WAITING', 'MODIFICATION', 'ADMIN_FILL', 'RESULT'].includes(room.phase)) return;

  if (room.config.tm === 0) {
    room.timeLeft = 0;
    io.to(roomId).emit("timer_tick", 0);
    return;
  }

  room.timeLeft = room.config.tm;

  room.timer = setInterval(() => {
    room.timeLeft -= 1;
    if (room.timeLeft <= 0) {
      switchTurn(roomId, io);
    } else {
      io.to(roomId).emit("timer_tick", room.timeLeft);
    }
  }, 1000);
};

export const switchTurn = (roomId: string, io: Server) => {
  const room = roomStore.get(roomId);
  if (!room) return;

  room.turn = room.turn === 'p1' ? 'p2' : 'p1';
  room.timeLeft = room.config.tm;
  io.to(roomId).emit("update_state", roomStore.getPublicState(roomId));
  startTimer(roomId, io);
};