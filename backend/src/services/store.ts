import { Room } from '../interfaces/room.interface';

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

  // --- SỬA ĐỔI: Kiểm tra Phase dựa trên Workflow động ---
  isPhaseComplete(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    // Lấy Phase hiện tại từ mảng phases dựa trên currentPhaseIdx
    const currentStep = room.phases[room.currentPhaseIdx];
    if (!currentStep) return false;

    const { config, p1Picks, p2Picks, p1CharBans, p2CharBans, p1WeaponBans, p2WeaponBans } = room;

    // Logic kiểm tra dựa trên TYPE của Phase trong Workflow
    const type = currentStep.type;

    if (type.includes('CHAR_BAN')) {
      // Mỗi bên cấm đủ số lượng config.cb / 2
      const limit = Math.floor(config.cb / 2);
      return p1CharBans.length >= limit && p2CharBans.length >= limit;
    }

    if (type.includes('WEA_BAN')) {
      // Mỗi bên cấm đủ số lượng config.wb / 2
      const limit = Math.floor(config.wb / 2);
      return p1WeaponBans.length >= limit && p2WeaponBans.length >= limit;
    }

    if (type.includes('PICK')) {
      // Mỗi bên chọn đủ số lượng config.pk
      return p1Picks.length >= config.pk && p2Picks.length >= config.pk;
    }

    if (type === 'MODIFICATION') {
      return room.p1Ready && room.p2Ready;
    }

    return false;
  }

  getPublicState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    // Loại bỏ object timer và các dữ liệu nhạy cảm nếu cần
    const { timer, ...publicState } = room; 
    return {
      ...publicState,
      p1PreSelect: room.p1PreSelect, // Đảm bảo có dòng này
      p2PreSelect: room.p2PreSelect
    }
  }
}

export const roomStore = new RoomStore();