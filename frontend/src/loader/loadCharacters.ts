import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Character } from "../types/characters";
// Giữ lại các hàm dịch từ utils cũ của bạn
import { translateElement, translatePath } from "../utils/mapper"; 

// Biến cache để lưu tạm dữ liệu (tránh gọi Firebase nhiều lần tốn quota)
let cachedCharacters: Character[] | null = null;

export async function loadCharacters(): Promise<Character[]> {
  // Nếu đã có cache thì trả về luôn, không tải lại
  if (cachedCharacters) return cachedCharacters;

  try {
    // 1. Lấy dữ liệu từ Collection "characters"
    const querySnapshot = await getDocs(collection(db, "characters"));
    
    const rawData: Character[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // 2. Map dữ liệu từ Firestore sang chuẩn Character của Frontend
      const charObj: Character = {
        stt: 0, // Sẽ đánh số lại sau khi sort
        id: data.id, 
        name: data.name,
        image: data.image, // Lấy đường dẫn ảnh trực tiếp từ DB (/images/...)
        rarity: Number(data.rarity) || 4,
        
        // Xử lý Element (Hệ)
        // Trên DB lưu tiếng Anh ("Lightning") -> Gán vào elementEn
        elementEn: data.element, 
        // Dịch sang tiếng Việt ("Lôi") -> Gán vào element
        element: translateElement(data.element), 

        // Xử lý Path (Vận mệnh)
        pathEn: data.path,
        path: translatePath(data.path),

        // Xử lý Stats (Điểm số)
        // Chuyển từ Object {e0: 2, e1: 3...} sang Array [2, 3...]
        stats: [
          Number(data.costs?.e0) || 0,
          Number(data.costs?.e1) || 0,
          Number(data.costs?.e2) || 0,
          Number(data.costs?.e3) || 0,
          Number(data.costs?.e4) || 0,
          Number(data.costs?.e5) || 0,
          Number(data.costs?.e6) || 0,
        ]
      };

      rawData.push(charObj);
    });

    // 3. Sắp xếp (Logic cũ: Rarity giảm dần -> Tên A-Z)
    rawData.sort((a, b) => {
      if (b.rarity !== a.rarity) {
        return b.rarity - a.rarity;
      }
      return a.name.localeCompare(b.name);
    });

    // 4. Đánh lại số thứ tự (STT) và lưu Cache
    cachedCharacters = rawData.map((char, index) => ({
      ...char,
      stt: index + 1
    }));

    return cachedCharacters;

  } catch (error) {
    console.error("🔥 Lỗi tải dữ liệu từ Firebase:", error);
    return [];
  }
}