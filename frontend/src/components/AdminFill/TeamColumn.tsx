import React, { useMemo } from 'react';
import Mode1Column from './Mode1Column';
import Mode23Column from './Mode23Column';

const TeamColumn: React.FC<any> = (props) => {
  // Bổ sung useAV và onConfigUpdate để truyền xuống Mode23Column
  const { 
    side, 
    teams, 
    configs, 
    mode, 
    onClearStatusUpdate, 
    useAV, 
    onConfigUpdate 
  } = props;

  const isP1 = side === 'p1';
  const widthClass = mode === 1 ? 'w-[360px] 2xl:w-[400px]' : 'w-[420px] 2xl:w-[480px]';

  // Màu sắc theo phe để dùng cho scrollbar
  const mainColor = isP1 ? '#ec4899' : '#22d3ee';
  const darkColor = isP1 ? '#9d174d' : '#0891b2';
  const lightColor = isP1 ? '#f472b6' : '#67e8f9';

  const chunkedTeams = useMemo(() => {
    if (!teams || teams.length === 0) return [];
    const flatList = Array.isArray(teams[0]) ? teams.flat() : teams;
    const chunks = [];
    const teamCount = Math.max(configs?.length || 0, Math.ceil(flatList.length / 4));
    for (let i = 0; i < teamCount; i++) {
      chunks.push(flatList.slice(i * 4, (i + 1) * 4));
    }
    return chunks;
  }, [teams, configs]);

  return (
    <>
      {/* CSS cho custom scrollbar đồng bộ theo màu phe */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar-${side}::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar-${side}::-webkit-scrollbar-track {
          background: #0b0e14;
        }

        .custom-scrollbar-${side}::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${mainColor} 0%, ${darkColor} 100%);
          border-radius: 10px;
          border: 2px solid #0b0e14;
        }

        .custom-scrollbar-${side}::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, ${lightColor} 0%, ${mainColor} 100%);
          box-shadow: 0 0 10px ${mainColor}80;
        }

        /* Firefox */
        .custom-scrollbar-${side} {
          scrollbar-width: thin;
          scrollbar-color: ${mainColor} #0b0e14;
        }
      `}} />

      <div className={`transition-all duration-500 flex flex-col overflow-y-auto bg-[#0b0e14] ${isP1 ? 'border-r' : 'border-l'} border-white/10 shrink-0 ${widthClass} p-5 custom-scrollbar-${side}`}>
        <h3 className={`${isP1 ? 'text-pink-500' : 'text-cyan-400'} font-black text-center uppercase italic tracking-[0.2em] mb-6 text-2xl drop-shadow-lg`}>
          {isP1 ? 'ĐỘI 1' : 'ĐỘI 2'}
        </h3>
        
        <div className="flex flex-col pb-10 gap-8">
          {chunkedTeams.map((teamMembers: any[], teamIndex: number) => (
            <div key={teamIndex} className="bg-[#11141b] border border-white/10 rounded-2xl p-4 shadow-xl relative animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between mb-4 px-1 items-center">
                <span className={`font-black uppercase tracking-widest text-sm ${isP1 ? 'text-pink-400' : 'text-cyan-400'}`}>
                  TEAM {teamIndex + 1}
                </span>
              </div>

              {mode === 1 ? (
                <Mode1Column {...props} teamMembers={teamMembers} teamIndex={teamIndex} />
              ) : (
                <Mode23Column 
                  {...props} 
                  teamMembers={teamMembers} 
                  teamIndex={teamIndex} 
                  // Đảm bảo config luôn là một object để Mode23Column không bị lỗi config?.turns
                  config={configs[teamIndex] || { turns: 5, av: 0, isCleared: true }} 
                  useAV={useAV}
                  onConfigUpdate={onConfigUpdate}
                  onClearStatusUpdate={onClearStatusUpdate}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TeamColumn;