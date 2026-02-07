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

  // --- HÀM BỔ SUNG: Kiểm tra xem Phase hiện tại đã kết thúc chưa ---
  isPhaseComplete(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const { phase, config, p1Picks, p2Picks, p1CharBans, p2CharBans, p1WeaponBans, p2WeaponBans } = room;

    // Tính toán số lượt mỗi bên (Giống trong file Handlers)
    const charBansPerSide = Math.floor(config.cb / 2);
    const weaponBansPerSide = Math.floor(config.wb / 2);

    switch (phase) {
      case 'BAN_CHAR':
        // Cả 2 bên phải cấm đủ số lượng được phân bổ
        return p1CharBans.length >= charBansPerSide && p2CharBans.length >= charBansPerSide;
      
      case 'PICK_CHAR':
        // Cả 2 bên phải chọn đủ số lượng nhân vật (config.pk giữ nguyên vì đây là số lượng mỗi bên)
        return p1Picks.length >= config.pk && p2Picks.length >= config.pk;
      
      case 'BAN_WEAPON':
        // Cả 2 bên phải cấm đủ số lượng nón được phân bổ
        return p1WeaponBans.length >= weaponBansPerSide && p2WeaponBans.length >= weaponBansPerSide;
      
      case 'MODIFICATION':
        // Cả 2 bên nhấn nút Xác nhận
        return room.p1Ready && room.p2Ready;
      
      default:
        return false;
    }
  }

  // Helper lấy state public gửi cho Client
  getPublicState(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    // Loại bỏ object timer vì nó chứa dữ liệu vòng lặp không thể serialize
    const { timer, ...publicState } = room; 
    return publicState;
  }
}

export const roomStore = new RoomStore();