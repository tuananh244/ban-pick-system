import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  roomName: string;
  setRoomName: (name: string) => void;
  onOpenCreate: () => void;
}

export const MainMenu: React.FC<Props> = ({ roomName, setRoomName, onOpenCreate }) => {
  const navigate = useNavigate();

  return (
    <div className="landing-card shadow-2xl group">
      <header className="text-center mb-10">
        <h1 className="menu-title text-5xl font-black italic text-white">MENU</h1>
        <p className="text-cyan-500/80 text-xs font-black tracking-[0.6em] mt-4 uppercase">Tactical Selection System</p>
      </header>

      <div className="w-full space-y-8">
        <div className="space-y-3">
          <label className="text-[15px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Tên phòng thi đấu</label>
          <div className="flex gap-3">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nhập tên phòng..."
              className="custom-input text-white w-full"
            />
            <button
              onClick={onOpenCreate}
              className="btn-cyan-soft px-8 hover-glow font-black uppercase italic"
            >
              Tạo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/characters')} className="btn-game py-4 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 hover-glow transition-all font-bold uppercase italic text-sm">Nhân vật</button>
          <button onClick={() => navigate('/weapons')} className="btn-cyan-soft py-4 hover-glow transition-all font-bold uppercase italic text-sm">Nón ánh sáng</button>
        </div>
      </div>
      
      <footer className="mt-12 w-full text-center">
        <div className="inline-block px-5 py-2 rounded-lg bg-slate-900/40 border border-white/5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-80">Có thể để trống tên phòng!</p>
        </div>
      </footer>
    </div>
  );
};