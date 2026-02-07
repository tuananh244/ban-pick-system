import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Weapon } from "../types/weapons";

// Cache dữ liệu để tránh gọi Firebase liên tục
let cachedWeapons: Weapon[] | null = null;

/**
 * Tải danh sách vũ khí (Light Cones) từ Firestore.
 * @param forceRefresh - Nếu là true, sẽ bỏ qua cache và tải lại từ đầu.
 */
export async function loadWeapons(forceRefresh = false): Promise<Weapon[]> {
  // 1. Kiểm tra cache
  if (cachedWeapons && !forceRefresh) return cachedWeapons;

  try {
    // 2. Lấy dữ liệu từ Collection "light_cones"
    const querySnapshot = await getDocs(collection(db, "light_cones"));
    
    // 3. Map dữ liệu chuyên nghiệp bằng .map()
    const rawData: Weapon[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const costs = data.costs || {};

      // Xử lý tên file ảnh để tương thích
      const fileName = data.image ? data.image.split('/').pop() : "unknown.png";

      return {
        stt: 0,
        id: data.id || doc.id,
        name: data.name || "Unknown Weapon",
        rarity: Number(data.rarity) || 4,
        path: data.path || "Unknown",
        
        // Ưu tiên link full từ DB, nếu không có mới ghép path dự phòng
        image: data.image || `/images/weapons/${fileName}`, 
        imageFile: fileName, 

        // Map Stats (s1 -> s5)
        stats: [
          0, // s0 (không dùng)
          Number(costs.s1) || 0,
          Number(costs.s2) || 0,
          Number(costs.s3) || 0,
          Number(costs.s4) || 0,
          Number(costs.s5) || 0,
        ]
      } as unknown as Weapon;
    });

    // 4. Sắp xếp tại Client (Tiết kiệm chi phí Indexing trên Firebase)
    // Ưu tiên Rarity giảm dần (5 -> 4), sau đó Tên A -> Z
    rawData.sort((a, b) => {
      if (b.rarity !== a.rarity) return b.rarity - a.rarity;
      return a.name.localeCompare(b.name);
    });

    // 5. Đánh lại số thứ tự (STT) và cập nhật cache
    cachedWeapons = rawData.map((w, index) => ({
      ...w,
      stt: index + 1
    }));

    console.log(`✅ [Firebase] Đã nạp ${cachedWeapons.length} vũ khí thành công.`);
    return cachedWeapons;

  } catch (error) {
    console.error("🔥 Lỗi tải Weapons từ Firebase:", error);
    // Trả về cache cũ nếu lỗi, hoặc mảng rỗng nếu chưa có gì
    return cachedWeapons || [];
  }
}