import { collection, getDocs } from "firebase/firestore"; // Xóa orderBy ở đây
import { db } from "../config/firebase";
import type { Character } from "../types/characters";
import { translateElement, translatePath } from "../utils/mapper"; 

let cachedCharacters: Character[] | null = null;

export async function loadCharacters(forceRefresh = false): Promise<Character[]> {
  if (cachedCharacters && !forceRefresh) return cachedCharacters;

  try {
    const charactersRef = collection(db, "characters");
    // Lấy toàn bộ về 1 lần duy nhất cho khỏe
    const querySnapshot = await getDocs(charactersRef);
    
    const rawData: Character[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const costs = data.costs || {};

      return {
        stt: 0,
        id: data.id || doc.id, 
        name: data.name || "Unknown",
        image: data.image || "", 
        rarity: Number(data.rarity) || 4,
        elementEn: data.element, 
        element: translateElement(data.element), 
        pathEn: data.path,
        path: translatePath(data.path),
        stats: [
          Number(costs.e0) || 0, Number(costs.e1) || 0, Number(costs.e2) || 0,
          Number(costs.e3) || 0, Number(costs.e4) || 0, Number(costs.e5) || 0,
          Number(costs.e6) || 0,
        ]
      } as Character;
    });

    // Sắp xếp tại máy người dùng: Rarity (5 -> 4) sau đó Name (A -> Z)
    rawData.sort((a, b) => {
      if (b.rarity !== a.rarity) return b.rarity - a.rarity;
      return a.name.localeCompare(a.name); // Sắp xếp theo tên chuẩn Việt Nam/Quốc tế
    });

    cachedCharacters = rawData.map((char, index) => ({ ...char, stt: index + 1 }));
    return cachedCharacters;

  } catch (error) {
    console.error("🔥 Lỗi:", error);
    return cachedCharacters || [];
  }
}