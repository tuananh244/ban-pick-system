export const getDisabledIds = (p1P: any[], p2P: any[], p1B: any[], p2B: any[]) => {
  return [
    ...(p1P || []), 
    ...(p2P || []), 
    ...(p1B || []), 
    ...(p2B || [])
  ]
    .filter(item => item && item.id)
    .map(item => item.id);
};

export const formatTime = (seconds: number) => {
  return `00:${seconds.toString().padStart(2, '0')}`;
};