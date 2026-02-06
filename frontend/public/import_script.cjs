const admin = require("firebase-admin");
const fs = require("fs");
const csv = require("csv-parser");
const serviceAccount = require("./serviceAccountKey.json");

// Khởi tạo
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper để chuyển đổi chuỗi sang số (hỗ trợ cả số nguyên và số thập phân)
const toNumber = (value) => {
  if (!value) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num; // Nếu parse lỗi thì trả về 0 thay vì NaN
};

// --- XỬ LÝ NHÂN VẬT ---
async function importCharacters() {
  console.log("🚀 ĐANG IMPORT DATA NHÂN VẬT (LOCAL MODE)...");
  const results = [];

  fs.createReadStream("characters.csv")
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim()
    }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const batch = db.batch();
      let count = 0;

      for (const row of results) {
        if (!row.name) continue; 

        let charId = row.name.trim();
        charId = charId.replace(/[\s\-]+/g, '_');
        charId = charId.replace(/[()]/g, '');
        charId = charId.replace(/_+/g, '_');
        charId = charId.replace(/^_|_$/g, '');

        const localPath = `/images/characters/${row.name.trim()}.png`; 
        const docRef = db.collection("characters").doc(charId);
        
        const payload = {
          id: charId,
          name: row.name.trim(),
          rarity: toNumber(row.rarity) || 4, // Đổi parseInt thành toNumber
          element: row.type ? row.type.trim() : "Physical",
          path: row.path ? row.path.trim() : "Destruction",
          image: localPath, 
          costs: {
            e0: toNumber(row.e0), // Sử dụng helper toNumber
            e1: toNumber(row.e1),
            e2: toNumber(row.e2),
            e3: toNumber(row.e3),
            e4: toNumber(row.e4),
            e5: toNumber(row.e5),
            e6: toNumber(row.e6),
          }
        };

        batch.set(docRef, payload);
        count++;
      }
      
      await batch.commit();
      console.log(`✅ Đã import xong ${count} Nhân vật!`);
      importWeapons();
    });
}

// --- XỬ LÝ NÓN ---
async function importWeapons() {
  console.log("🚀 ĐANG IMPORT DATA NÓN (LOCAL MODE)...");
  const results = [];

  fs.createReadStream("weapons.csv")
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim()
    }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const batch = db.batch();
      let count = 0;

      for (const row of results) {
        if (!row.name) continue;

        const imageFileName = row.image_file ? row.image_file.trim() : "";
        if (!imageFileName) {
            console.warn(`⚠️ Bỏ qua nón "${row.name}" vì thiếu tên file ảnh.`);
            continue;
        }

        const wpnId = imageFileName.replace(/\.[^/.]+$/, "");
        const localPath = `/images/weapons/${imageFileName}`;
        const docRef = db.collection("light_cones").doc(wpnId);
        
        const payload = {
          id: wpnId,
          name: row.name.trim(),
          rarity: toNumber(row.rarity) || 4, // Đổi parseInt thành toNumber
          path: row.path ? row.path.trim() : "",
          image: localPath,
          costs: {
            s1: toNumber(row.s1), // Sử dụng helper toNumber
            s2: toNumber(row.s2),
            s3: toNumber(row.s3),
            s4: toNumber(row.s4),
            s5: toNumber(row.s5),
          }
        };

        batch.set(docRef, payload);
        count++;
      }
      
      await batch.commit();
      console.log(`✅ Đã import xong ${count} Nón!`);
      console.log("🎉 HOÀN TẤT TOÀN BỘ!");
    });
}

importCharacters();