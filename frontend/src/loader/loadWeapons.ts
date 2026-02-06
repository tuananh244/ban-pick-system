import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Weapon } from "../types/weapons";

// Cache dữ liệu để tránh gọi Firebase liên tục khi re-render
let cachedWeapons: Weapon[] | null = null;

export async function loadWeapons(): Promise<Weapon[]> {
  // 1. Kiểm tra cache
  if (cachedWeapons) return cachedWeapons;

  try {
    // 2. Lấy dữ liệu từ Collection "light_cones"
    const querySnapshot = await getDocs(collection(db, "light_cones"));
    
    const rawData: Weapon[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Xử lý tên file ảnh để tương thích
      // Nếu data.image là URL (https://...) hoặc path (/images/...), ta vẫn cắt lấy tên file để dự phòng
      const fileName = data.image ? data.image.split('/').pop() : "unknown.png";

      const weaponObj: Weapon = {
        stt: 0,
        id: data.id,
        name: data.name || "Unknown Weapon",
        rarity: Number(data.rarity) || 4,
        path: data.path || "Unknown",
        
        // QUAN TRỌNG: Lưu cả đường dẫn gốc và tên file
        // Nếu trong DB lưu full link (https://...) thì dùng luôn
        // Nếu trong DB chỉ lưu tên file, ta sẽ ghép chuỗi ở frontend
        image: data.image || `/images/weapons/${fileName}`, 
        imageFile: fileName, 

        // Map Stats
        stats: [
          0, // s0
          Number(data.costs?.s1) || 0,
          Number(data.costs?.s2) || 0,
          Number(data.costs?.s3) || 0,
          Number(data.costs?.s4) || 0,
          Number(data.costs?.s5) || 0,
        ]
      } as unknown as Weapon;

      rawData.push(weaponObj);
    });

    // 3. Sắp xếp: Rarity giảm dần -> Tên A-Z
    rawData.sort((a, b) => {
      if (b.rarity !== a.rarity) {
        return b.rarity - a.rarity;
      }
      return a.name.localeCompare(b.name);
    });

    // 4. Đánh lại số thứ tự (STT) và lưu cache
    cachedWeapons = rawData.map((w, index) => ({
      ...w,
      stt: index + 1
    }));

    return cachedWeapons;

  } catch (error) {
    console.error("🔥 Lỗi tải Weapons từ Firebase:", error);
    return [];
  }
}