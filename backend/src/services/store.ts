import { Room } from '../interfaces/room.interface';

// Singleton Pattern: Đảm bảo chỉ có 1 kho chứa dữ liệu duy nhất
class RoomStore {
  private rooms: Map<string, Room> = new Map();

  get(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  set(roomId: string, room: Room): void {
    this.rooms.set(roomId, room);
  }

  has(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  delete(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  // Helper lấy state public gửi cho Client
  getPublicState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const { timer, ...publicState } = room; // Loại bỏ object timer (không gửi được qua mạng)
    return publicState;
  }
}

export const roomStore = new RoomStore();