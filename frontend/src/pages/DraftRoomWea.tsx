import React, { useEffect, useState, useMemo } from 'react';
import { loadWeapons } from '../loader/loadWeapons'; // Nhớ tạo file loader này
import { WeaponCard } from '../components/Draft/WeaponCard'; // Component WeaponCard mới sửa
import type { Weapon } from '../types/weapons';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// --- TYPE DÙNG CHO EXPORT CSV (WEAPON) ---
interface CsvRow {
  STT: number;
  name: string;
  rarity: number;
  path: string;
  s1: number; s2: number; s3: number; s4: number; s5: number;
}

const DraftRoomWeapon: React.FC = () => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string>("All");
  const [pathFilter, setPathFilter] = useState("All");

  // Load dữ liệu từ Firebase/Loader
  useEffect(() => {
    loadWeapons().then(data => setWeapons(data));
  }, []);

  // --- LOGIC FILTER ---
  const filteredWeapons = useMemo(() => {
    return weapons.filter((wpn) => {
      const matchName = wpn.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRarity = rarityFilter === "All" || wpn.rarity === Number(rarityFilter);
      const matchPath = pathFilter === "All" || wpn.path === pathFilter; // Weapon thường lưu path tiếng Anh
      return matchName && matchRarity && matchPath;
    });
  }, [weapons, searchTerm, rarityFilter, pathFilter]);

  // --- LOGIC EXPORT CSV ---
  const handleExportCSV = () => {
    const csvData: CsvRow[] = weapons.map((wpn, index) => ({
      STT: index + 1, 
      name: wpn.name, 
      rarity: wpn.rarity, 
      path: wpn.path,
      // Weapon stats thường lưu từ index 1 (S1) đến 5 (S5)
      s1: wpn.stats[1] || 0, 
      s2: wpn.stats[2] || 0, 
      s3: wpn.stats[3] || 0, 
      s4: wpn.stats[4] || 0, 
      s5: wpn.stats[5] || 0,
    }));
    
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "lightcones_backup.csv");
  };

  const paths = ["Destruction", "Hunt", "Erudition", "Harmony", "Nihility", "Preservation", "Abundance", "Remembrance", "Elation"];
  
  // Component nút lọc icon nhỏ
  const FilterIconButton = ({ iconSrc, label, value, current, onClick }: any) => (
    <button onClick={() => onClick(current === value ? "All" : value)} title={label} className={`w-7 h-7 flex items-center justify-center rounded-full border-2 transition-all shrink-0 ${current === value ? 'bg-cyan-600 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]' : 'bg-transparent border-transparent hover:border-gray-600 opacity-60 hover:opacity-100'}`}>
      <img src={iconSrc} alt={label} className="w-4 h-4 object-contain brightness-125" />
    </button>
  );

  return (
    // CONTAINER CHÍNH: Khóa scroll body, dùng flex column
    <div className="h-screen w-full bg-[#0b0e14] text-white font-sans overflow-hidden flex flex-col">
      
      {/* CSS SCROLLBAR */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0b0e14; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1f2937;
          border-radius: 4px;
          border: 2px solid #0b0e14;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #0891b2;
        }
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #1f2937 #0b0e14;
        }
      `}</style>

      {/* VÙNG CUỘN NỘI BỘ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-[1600px] mx-auto pb-10">
          
          {/* --- HEADER TOOLBAR (STICKY) --- */}
          <div className="sticky top-0 z-[100] bg-[#0b0e14]/95 backdrop-blur-sm pt-2 pb-6">
             <div className="flex items-center gap-2 bg-[#11141b] p-2 px-3 rounded-xl border border-gray-800 shadow-2xl overflow-x-auto custom-scrollbar">
              
              {/* Title & Back */}
              <div className="flex items-center gap-2 shrink-0 mr-1">
                <button onClick={() => window.history.back()} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors">←</button>
                <h1 className="text-xs font-black uppercase italic tracking-tighter border-l-2 border-cyan-500 pl-2 hidden lg:block text-gray-400">Light Cones</h1>
              </div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Search Box */}
              <div className="flex items-center gap-2 shrink-0">
                <input type="text" placeholder="SEARCH..." className="bg-[#0b0d12] border border-gray-700 text-white text-[10px] font-black p-1.5 px-2 rounded-md outline-none focus:border-cyan-500 w-24 md:w-32 lg:w-40 uppercase transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Rarity Filter (Có thêm 3 sao cho Nón) */}
              <div className="flex items-center gap-1 shrink-0">
                {["5", "4", "3"].map(r => (<button key={r} onClick={() => setRarityFilter(rarityFilter === r ? "All" : r)} className={`px-2 py-0.5 rounded text-[9px] font-black border transition-all ${rarityFilter === r ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-transparent border-gray-700 text-gray-500 hover:text-gray-300'}`}>{r}★</button>))}
              </div>
              
              <div className="w-[1px] h-4 bg-gray-800 shrink-0" />
              
              {/* Path Filter */}
              <div className="flex items-center gap-0.5 shrink-0">{paths.map(p => <FilterIconButton key={p} label={p} iconSrc={`/images/path/${p}.png`} value={p} current={pathFilter} onClick={setPathFilter} />)}</div>
              
              {/* Export Button */}
              <div className="ml-auto flex items-center gap-2 shrink-0 pl-2 border-l border-gray-800">
                <button onClick={handleExportCSV} className="bg-cyan-900/50 hover:bg-cyan-600 text-cyan-200 hover:text-white text-[9px] font-bold px-3 py-1.5 rounded border border-cyan-500/30 hover:border-cyan-400 uppercase transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] whitespace-nowrap">
                  Export CSV
                </button>
                <div className="flex flex-col items-end leading-none">
                    <span className="text-cyan-400 font-black text-xs">{filteredWeapons.length}</span>
                    <span className="text-gray-600 text-[8px] font-bold">LCs</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- GRID HIỂN THỊ --- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredWeapons.map((wpn) => (
              <div key={wpn.id} className="transition-transform hover:scale-[1.02] hover:z-10">
                <div className="pointer-events-none">
                    <WeaponCard weapon={wpn} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DraftRoomWeapon;