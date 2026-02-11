import React from 'react';

export interface Phase {
  id: string;
  type: 'CHAR_BAN' | 'CHAR_PICK' | 'WEA_BAN';
  label: string;
  priority: 'P1' | 'P2';
}

interface TurnSelectorProps {
  phases: Phase[];
  onUpdatePhases: (newPhases: Phase[]) => void;
}

export const TurnSelector: React.FC<TurnSelectorProps> = ({ phases, onUpdatePhases }) => {
  
  const setPriority = (id: string, priority: 'P1' | 'P2') => {
    const newPhases = phases.map((p) =>
      p.id === id ? { ...p, priority } : p
    );
    onUpdatePhases(newPhases);
  };

  // Hàm thay đổi cấu trúc quy trình (Workflow)
  const applyWorkflow = (mode: 'BAN_ALL_FIRST' | 'CHAR_FIRST') => {
    let newPhases: Phase[] = [];
    
    if (mode === 'BAN_ALL_FIRST') {
      // Kiểu 1: Ban hết (Nhân vật -> Nón) rồi mới Pick
      newPhases = [
        { id: 'pb-1', type: 'CHAR_BAN', label: 'Cấm Nhân Vật', priority: 'P1' },
        { id: 'pb-3', type: 'WEA_BAN', label: 'Cấm Nón Ánh Sáng', priority: 'P1' },
        { id: 'pb-2', type: 'CHAR_PICK', label: 'Chọn Nhân Vật', priority: 'P2' },
      ];
    } else {
      // Kiểu 2: Ban nhân vật -> Pick -> Ban nón
      newPhases = [
        { id: 'pb-1', type: 'CHAR_BAN', label: 'Cấm Nhân Vật', priority: 'P1' },
        { id: 'pb-2', type: 'CHAR_PICK', label: 'Chọn Nhân Vật', priority: 'P1' },
        { id: 'pb-3', type: 'WEA_BAN', label: 'Cấm Nón Ánh Sáng', priority: 'P2' },
      ];
    }
    onUpdatePhases(newPhases);
  };

  // Kiểm tra workflow hiện tại để active nút
  const currentMode = phases[1]?.type === 'WEA_BAN' ? 'BAN_ALL_FIRST' : 'CHAR_FIRST';

  return (
    <div className="space-y-6">
      {/* Nút chọn chế độ nhanh */}
      <div className="space-y-2">
        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block px-1">
          Chế độ quy trình
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => applyWorkflow('BAN_ALL_FIRST')}
            className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase transition-all active:scale-95 ${
              currentMode === 'BAN_ALL_FIRST'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'border-white/5 bg-slate-900/50 text-slate-500 hover:text-slate-300'
            }`}
          >
            Ban tất cả trước
          </button>
          <button
            type="button"
            onClick={() => applyWorkflow('CHAR_FIRST')}
            className={`py-2.5 px-3 rounded-xl border text-[10px] font-black uppercase transition-all active:scale-95 ${
              currentMode === 'CHAR_FIRST'
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'border-white/5 bg-slate-900/50 text-slate-500 hover:text-slate-300'
            }`}
          >
            Ban nhân vật trước
          </button>
        </div>
      </div>

      {/* Danh sách các giai đoạn */}
      <div className="space-y-2">
        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block px-1">
          Thứ tự ưu tiên từng giai đoạn
        </label>
        {phases.map((phase) => (
          <div
            key={phase.id}
            className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-900/50 hover:border-white/10 transition-all group"
          >
            <div className="flex-1">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Giai đoạn</div>
              <div className="text-xs font-bold text-white uppercase italic group-hover:text-cyan-400 transition-colors">
                {phase.label}
              </div>
            </div>

            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setPriority(phase.id, 'P1')}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                  phase.priority === 'P1'
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                P1
              </button>
              <button
                type="button"
                onClick={() => setPriority(phase.id, 'P2')}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                  phase.priority === 'P2'
                    ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                P2
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};