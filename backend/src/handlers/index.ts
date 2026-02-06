import { Server, Socket } from 'socket.io';
import { registerBanPickHandlers } from './banPickHandler';
import { registerAdminHandlers } from './adminHandler';

export const registerHandlers = (io: Server, socket: Socket, roomId: string, role: string, side: string) => {
    // Đăng ký logic cho Player
    registerBanPickHandlers(io, socket, roomId, role, side);
    
    // Đăng ký logic cho Admin (Nếu user là admin thì handler bên trong mới chạy thực sự)
    registerAdminHandlers(io, socket, roomId, role);
    
    // Tại đây có thể thêm các handler khác (Chat, Observer...)
};