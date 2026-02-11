import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export const useDraftSocket = (token: string | null, backendUrl: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    const handleUpdate = (data: any) => {
      setRoomData(data);
      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data.status === "terminated") setIsTerminated(true);
    };

    // --- 1. ĐỒNG BỘ TRẠNG THÁI TỔNG THỂ ---
    newSocket.on("init_state", handleUpdate);
    newSocket.on("update_state", handleUpdate);
    newSocket.on("timer_tick", (t) => setTimeLeft(t));
    newSocket.on("terminated", () => setIsTerminated(true));

    // --- 2. [MỚI] LẮNG NGHE TÍN HIỆU MONITOR SIÊU NHẸ ---
    // Cập nhật ngay lập tức p1PreSelect/p2PreSelect mà không cần tải lại toàn bộ roomData
    newSocket.on("server_notify_preselect", ({ side, item }) => {
      setRoomData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          [side === 'p1' ? 'p1PreSelect' : 'p2PreSelect']: item
        };
      });
    });

    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, [token, backendUrl]);

  const sendAction = (actionName: string, payload: any) => {
    socket?.emit(actionName, payload);
  };

  return { roomData, isTerminated, timeLeft, sendAction, socket };
};