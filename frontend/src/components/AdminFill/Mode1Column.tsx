import { RarityBorder } from './TeamShared';

const Mode1Column = ({ side, teamIndex, teamMembers, selectedSlot, onSlotClick, onRemove }: any) => {

  return (
    <div className="grid grid-cols-4 gap-2">
      {teamMembers.map((char: any, slotIndex: number) => {
        const isDrafted = char && !char.isFilled;
        const isSelected = selectedSlot?.teamSide === side && selectedSlot?.teamIndex === teamIndex && selectedSlot.slotIndex === slotIndex;

        return (
          <div key={slotIndex} onClick={() => onSlotClick(side, teamIndex, slotIndex, char)}
            className={`aspect-[3/4.5] rounded-xl border relative bg-[#080a0f] overflow-hidden transition-all duration-300 group/slot 
              ${isSelected ? 'border-yellow-400 ring-4 ring-yellow-400/30 z-20' : 'border-white/5'}
              ${char ? '' : 'opacity-40 hover:opacity-70'}`}>
            {char ? (
              <>
                <img src={char.image} className="w-full h-full object-cover scale-[1.01]" />
                <RarityBorder rarity={char.rarity} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                
                <div className={`absolute top-0 right-0 font-black uppercase rounded-bl-lg text-white text-[8px] px-1.5 py-0.5 z-10 ${isDrafted ? 'bg-cyan-600' : 'bg-green-600'}`}>
                  {isDrafted ? 'D' : 'F'}
                </div>

                <div className="absolute bottom-0 w-full p-1 flex flex-col z-10 gap-0.5">
                  <div className="flex gap-0.5">
                    <div className="flex-1 flex justify-between items-center bg-black/60 rounded px-1 border border-white/5 text-[7px]">
                      <span className="text-gray-400 font-bold">E</span>
                      <span className="text-cyan-300 font-black">{char.eidolon ?? 0}</span>
                    </div>
                    <div className="flex-1 flex justify-between items-center bg-black/60 rounded px-1 border border-white/5 text-[7px]">
                      <span className="text-gray-400 font-bold">S</span>
                      <span className="text-orange-400 font-black">{char.weaponRank ?? 1}</span>
                    </div>
                  </div>
                  <div className="text-center font-bold text-white truncate uppercase text-[9px] mt-0.5">{char.name}</div>
                </div>

                {!isDrafted && (
                  <button onClick={(e) => { e.stopPropagation(); onRemove(side, teamIndex, slotIndex); }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all z-30 shadow-2xl border-2 border-red-400">✕</button>
                )}
              </>
            ) : <div className="w-full h-full flex items-center justify-center text-white/5 text-2xl">+</div>}
          </div>
        );
      })}
    </div>
  );
};
export default Mode1Column;