import React, { useEffect, useState, useMemo } from 'react';
import { loadCharacters } from '../loader/loadCharacters';
import { CharacterCard } from '../components/Draft/CharactersCard';
import type { Character } from '../types/characters';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// --- TYPE DÙNG CHO EXPORT CSV ---
interface CsvRow {
  STT: number;
  name: string;
  rarity: number;
  type: string;
  path: string;
  e0: number; e1: number; e2: number; e3: number;
  e4: number; e5: number; e6: number;
}

const DraftRoomChar: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("All");
  const [pathFilter, setPathFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    loadCharacters().then(data => setCharacters(data));
  }, []);

  // --- LOGIC FILTER ---
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchName = char.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRarity = rarityFilter === "All" || char.rarity === Number(rarityFilter);
      const matchPath = pathFilter === "All" || char.pathEn === pathFilter;
      const matchType = typeFilter === "All" || char.elementEn === typeFilter;
      return matchName && matchRarity && matchPath && matchType;
    });
  }, [characters, searchTerm, rarityFilter, pathFilter, typeFilter]);

  // --- LOGIC EXPORT CSV ---
  const handleExportCSV = () => {
    const csvData: CsvRow[] = characters.map((char, index) => ({
      STT: index + 1, 
      name: char.name, 
      rarity: char.rarity, 
      type: char.elementEn, 
      path: char.pathEn,
      e0: char.stats[0], e1: char.stats[1], e2: char.stats[2], e3: char.stats[3], e4: char.stats[4], e5: char.stats[5], e6: char.stats[6],
    }));
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "characters_backup.csv");
  };

  const paths = ["Destruction", "Hunt", "Erudition", "Harmony", "Nihility", "Preservation", "Abundance", "Remembrance", "Elation"];
  const elements = ["Physical", "Fire", "Ice", "Lightning", "Wind", "Quantum", "Imaginary"];
  
  const FilterIconButton = ({ iconSrc, label, value, current, onClick }: any) => (
    <button onClick={() => onClick(current === value ? "All" : value)} title={label} className={`w-7 h-7 flex items-center justify-center rounded-full border-2 transition-all shrink-0 ${current === value ? 'bg-cyan-600 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]' : 'bg-transparent border-transparent hover:border-gray-600 opacity-60 hover:opacity-100'}`}>
      <img src={iconSrc} alt={label} className="w-4 h-4 object-contain" />
    </button>
  );

  return (
    // THAY ĐỔI 1: h-screen và overflow-hidden để khóa body scroll, ngăn tràn ngang
    <div className="h-screen w-full bg-[#0b0e14] text-white font-sans overflow-hidden flex flex-col">
      
      {/* CSS SCROLLBAR */}
      <style>{`
        /* Webkit (Chrome, Edge, Safari) */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px; /* Tăng nhẹ độ rộng để dễ kéo hơn */
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0b0e14; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1f2937; /* Màu xám tối ban đầu */
          border-radius: 4px;
          border: 2px solid #0b0e14; /* Tạo khoảng hở so với track */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #0891b2; /* Màu Cyan khi hover */
        }

        /* Firefox */
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #1f2937 #0b0e14;
        }
      `}</style>

      {/* THAY ĐỔI 2: Vùng cuộn nội bộ (Scroll Container) */}
      {/* overflow-y-auto: Chỉ cuộn dọc vùng này */}
      {/* custom-scrollbar: Áp dụng CSS custom */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-[1600px] mx-auto pb-10">
          
          {/* --- HEADER TOOLBAR --- */}
          {/* sticky top-0: Giữ thanh này dính trên cùng khi cuộn div cha */}
          <div className="sticky top-0 z-[100] bg-[#0b0e14]/95 backdrop-blur-sm pt-2 pb-6">
             <div className="flex items-center gap-2 bg-[#11141b] p-2 px-3 rounded-xl border border-gray-800 shadow-2xl overflow-x-auto custom-scrollbar">
              
              {/* Nút Back & Title */}
              <div className="flex items-center gap-2 shrink-0 mr-1">
                <button onClick={() => window.history.back()} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors">←</button>
                <h1 className="text-xs font-black uppercase italic tracking-tighter border-l-2 border-cyan-500 pl-2 hidden lg:block text-gray-400">Nhân vật</h1>
              </div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Search */}
              <div className="flex items-center gap-2 shrink-0">
                <input type="text" placeholder="SEARCH..." className="bg-[#0b0d12] border border-gray-700 text-white text-[10px] font-black p-1.5 px-2 rounded-md outline-none focus:border-cyan-500 w-24 md:w-32 lg:w-40 uppercase transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Rarity */}
              <div className="flex items-center gap-1 shrink-0">
                {["5", "4"].map(r => (<button key={r} onClick={() => setRarityFilter(rarityFilter === r ? "All" : r)} className={`px-2 py-0.5 rounded text-[9px] font-black border transition-all ${rarityFilter === r ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-transparent border-gray-700 text-gray-500 hover:text-gray-300'}`}>{r}★</button>))}
              </div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Element */}
              <div className="flex items-center gap-0.5 shrink-0">{elements.map(e => <FilterIconButton key={e} label={e} iconSrc={`/images/types/${e}.png`} value={e} current={typeFilter} onClick={setTypeFilter} />)}</div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Path */}
              <div className="flex items-center gap-0.5 shrink-0">{paths.map(p => <FilterIconButton key={p} label={p} iconSrc={`/images/path/${p}.png`} value={p} current={pathFilter} onClick={setPathFilter} />)}</div>
              
              {/* Export Button */}
              <div className="ml-auto flex items-center gap-2 shrink-0 pl-2 border-l border-gray-800">
                <button onClick={handleExportCSV} className="bg-cyan-900/50 hover:bg-cyan-600 text-cyan-200 hover:text-white text-[9px] font-bold px-3 py-1.5 rounded border border-cyan-500/30 hover:border-cyan-400 uppercase transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] whitespace-nowrap">
                  Export CSV
                </button>
                <div className="flex flex-col items-end leading-none">
                    <span className="text-cyan-400 font-black text-xs">{filteredCharacters.length}</span>
                    <span className="text-gray-600 text-[8px] font-bold">UNITS</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- GRID HIỂN THỊ --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredCharacters.map((char) => (
              <div key={char.id} className="transition-transform hover:scale-[1.02] hover:z-10">
                <div className="pointer-events-none">
                    <CharacterCard character={char} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DraftRoomChar;