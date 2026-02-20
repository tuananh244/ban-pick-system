import Redis from 'ioredis';
import { Room } from '../interfaces/room.interface';
import { CONFIG } from '../config/env';

const redis = new Redis(CONFIG.REDIS_URL || 'redis://localhost:6379');

class RoomStore {
    private PREFIX = 'room:';

    async get(roomId: string): Promise<Room | null> {
        const data = await redis.get(this.PREFIX + roomId);
        if (!data) return null;
        return JSON.parse(data);
    }

    async set(roomId: string, room: Room): Promise<void> {
        // Loại bỏ timer (vốn là object phức tạp) trước khi lưu JSON
        const { timer, ...saveData } = room;
        await redis.set(
            this.PREFIX + roomId,
            JSON.stringify(saveData),
            'EX',
            86400 // Hết hạn sau 24h
        );
    }

    async has(roomId: string): Promise<boolean> {
        const exists = await redis.exists(this.PREFIX + roomId);
        return exists === 1;
    }

    async delete(roomId: string): Promise<boolean> {
        // Sử dụng lệnh del của ioredis để xóa key khỏi database
        const deleted = await redis.del(this.PREFIX + roomId);
        
        // Redis trả về số lượng key đã xóa (1 nếu thành công, 0 nếu key không tồn tại)
        return deleted === 1;
    }

    isPhaseComplete(room: Room): boolean {
        const currentStep = room.phases[room.currentPhaseIdx];
        if (!currentStep) return false;

        const { config, p1Picks, p2Picks, p1CharBans, p2CharBans, p1WeaponBans, p2WeaponBans } = room;
        const type = currentStep.type;

        if (type.includes('CHAR_BAN')) {
            const limit = Math.floor(config.cb / 2);
            return p1CharBans.length >= limit && p2CharBans.length >= limit;
        }
        if (type.includes('WEA_BAN')) {
            const limit = Math.floor(config.wb / 2);
            return p1WeaponBans.length >= limit && p2WeaponBans.length >= limit;
        }
        if (type.includes('PICK')) {
            return p1Picks.length >= config.pk && p2Picks.length >= config.pk;
        }
        if (type === 'MODIFICATION') {
            return room.p1Ready && room.p2Ready;
        }
        return false;
    }

    getPublicState(room: Room) {
        if (!room) return null;
        const { timer, ...publicState } = room; 
        return {
            ...publicState,
            p1PreSelect: room.p1PreSelect || null,
            p2PreSelect: room.p2PreSelect || null
        };
    }
}

export const roomStore = new RoomStore();