// Định nghĩa cấu trúc nhân vật/vũ khí để dùng chung
export interface BanPickItem {
    id: string;
    name: string;
    image?: string;
    imageFile?: string;
    rarity?: number;
    path?: string;
    elementEn?: string;
    // Dành riêng cho Pick
    eidolon?: number;
    equippedWeapon?: BanPickItem | null;
    weaponRank?: number;
}

export interface MatchResult {
    winner: 'p1' | 'p2' | 'draw';
    total1: number;
    total2: number;
}

export interface WorkflowPhase {
    type: string;      // Ví dụ: 'CHAR_BAN', 'CHAR_PICK', 'WEA_BAN'
    priority: string;  // Ví dụ: 'P1', 'P2'
}

export interface Room {
    config: {
        roomId: string;
        tm: number; // Time per turn
        cb: number; // Total Char Bans
        pk: number; // Total Picks per side
        wb: number; // Total Weapon Bans
        [key: string]: any;
    };
    
    phases: WorkflowPhase[];   // Quy trình từ Landing
    currentPhaseIdx: number;   // Bước hiện tại trong phases
    
    // Quản lý nhân vật & vũ khí
    p1Picks: BanPickItem[]; 
    p2Picks: BanPickItem[];
    p1CharBans: BanPickItem[]; 
    p2CharBans: BanPickItem[];
    p1WeaponBans: BanPickItem[]; 
    p2WeaponBans: BanPickItem[];
    
    // Trạng thái giám sát trực tiếp cho Admin (Monitoring)
    p1PreSelect: BanPickItem | null; 
    p2PreSelect: BanPickItem | null;

    // Quản lý lượt và giai đoạn
    turn: 'p1' | 'p2';
    phase: string;
    timeLeft: number;
    
    // Server side only (Lưu ý: timer không nên gửi về Client)
    timer: NodeJS.Timeout | null; 

    // Trạng thái sẵn sàng trong MODIFICATION
    p1Ready: boolean; 
    p2Ready: boolean;
    
    // Kết quả sau khi chia đội
    p1FinalTeams: BanPickItem[][]; 
    p2FinalTeams: BanPickItem[][]; 
    p1TeamConfigs: any[]; 
    p2TeamConfigs: any[];

    result?: {
        logicMode: number;
        useAV: boolean;
        p1TotalWins: number;
        p2TotalWins: number;
        finalWinner: string;
        matchResults: MatchResult[];
    };
}