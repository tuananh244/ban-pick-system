// Định nghĩa cấu trúc kết quả của từng trận lẻ (Match)
export interface MatchResult {
    winner: 'p1' | 'p2' | 'draw';
    total1: number;
    total2: number;
}

export interface Room {
    config: any;
    p1Picks: any[]; p2Picks: any[];
    p1CharBans: any[]; p2CharBans: any[];
    p1WeaponBans: any[]; p2WeaponBans: any[];
    p1FinalTeams: any[][]; // Nên để mảng 2 chiều vì chứa nhiều Team, mỗi Team 4 người
    p2FinalTeams: any[][]; 
    p1TeamConfigs: any[]; p2TeamConfigs: any[];
    turn: 'p1' | 'p2';
    phase: string;
    timeLeft: number;
    timer: NodeJS.Timeout | null;
    p1Ready: boolean; p2Ready: boolean;
    
    // Thuộc tính kết quả (Optional - chỉ xuất hiện sau khi Admin nhấn Hoàn tất)
    result?: {
        logicMode: number;
        useAV: boolean;
        p1TotalWins: number;
        p2TotalWins: number;
        finalWinner: string;
        matchResults: MatchResult[];
    };
}