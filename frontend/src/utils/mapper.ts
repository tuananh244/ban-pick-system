// Các bảng tra cứu từ điển
const ELEMENT_MAP: Record<string, string> = {
  "Lightning": "Lôi",
  "Wind": "Phong",
  "Quantum": "Lượng tử",
  "Physical": "Vật lý",
  "Imaginary": "Số ảo",
  "Ice": "Băng",
  "Fire": "Hỏa"
};

const PATH_MAP: Record<string, string> = {
  "Nihility": "Hư vô",
  "Remembrance": "Ký ức",
  "Erudition": "Tri thức",
  "Hunt": "Săn bắn",
  "Preservation": "Bảo hộ",
  "Abundance": "Trù phú",
  "Harmony": "Hòa hợp",
  "Destruction": "Hủy diệt",
  "Elation": "Vui vẻ",
};

// Các bảng tra cứu từ điển
const ELEMENT_MAP_TV: Record<string, string> = {
  "Lôi": "Lightning",
  "Phong": "Wind",
  "Lượng tử": "Quantum",
  "Vật lý": "Physical",
  "Số ảo": "Imaginary",
  "Băng": "Ice",
  "Hỏa": "Fire"
};

const PATH_MAP_TV: Record<string, string> = {
  "Hư vô":"Nihility",
  "Ký ức":"Remembrance",
  "Tri thức":"Erudition",
  "Săn bắn":"Hunt",
  "Bảo hộ":"Preservation",
  "Trù phú":"Abundance",
  "Hòa hợp":"Harmony",
  "Hủy diệt":"Destruction",
  "Vui vẻ":"Elation",
};

// Hàm helper để chuyển đổi
export const translateElement = (enElement: string): string => {
  return ELEMENT_MAP[enElement] || enElement;
};

export const translatePath = (enPath: string): string => {
  return PATH_MAP[enPath] || enPath;
};

export const translateElementToEn = (tvElement: string): string => {
  return ELEMENT_MAP_TV[tvElement] || tvElement;
}

export const translatePathToEn = (tvPath: string): string => {
  return PATH_MAP_TV[tvPath] || tvPath;
}

// Hàm tạo đường dẫn ảnh
export const getCharacterImage = (name: string): string => {
  return `images/characters/${name}.png`;
};