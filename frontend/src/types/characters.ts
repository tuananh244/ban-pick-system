export interface Character {
  stt: number;       // Frontend tự đánh số
  id: string;        // Lấy từ ID document Firebase
  name: string;
  image: string;     // URL từ Firebase
  rarity: number;
  
  // Xử lý ngôn ngữ
  element: string;   // Tiếng Việt (Để hiển thị tooltip/text)
  elementEn: string; // Tiếng Anh (Khớp với Firebase, để lấy icon)
  
  path: string;      // Tiếng Việt
  pathEn: string;    // Tiếng Anh
  
  // Quan trọng: Frontend dùng mảng số (Array), Firebase trả về Object
  stats: number[]; 
}