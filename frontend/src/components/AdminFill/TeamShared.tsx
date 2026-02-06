import React from 'react';

export const RarityBorder = ({ rarity }: { rarity: number }) => {
  const colors = rarity === 5 
    ? 'border-[#d4af37] shadow-[inset_0_0_15px_rgba(255,215,0,0.4)]' 
    : (rarity === 4 ? 'border-[#7c3aed] shadow-[inset_0_0_15px_rgba(124,58,237,0.4)]' 
    : 'border-[#0ea5e9] shadow-[inset_0_0_15px_rgba(14,165,233,0.4)]');
    
  return <div className={`absolute inset-0 border-[2px] rounded-lg pointer-events-none z-20 ${colors}`} />;
};

export const LockedOverlay = () => (
  <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 border border-white/10">
    <span className="text-2xl mb-1 drop-shadow-lg">🔒</span>
    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">LOCKED</span>
  </div>
);