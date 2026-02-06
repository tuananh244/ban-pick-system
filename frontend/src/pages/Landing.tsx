import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { SignJWT } from 'jose';

// Import các components con
import BackgroundSettings from '../components/Landing/BackgroundSettings';
import { LandingLayout } from '../components/Landing/LandingLayout';
import { MainMenu } from '../components/Landing/MainMenu';
import { ConfigModal } from '../components/Landing/ConfigModal';
import { SupportModal } from '../components/Landing/SupportModal';
import { InfoModal } from '../components/Landing/InfoModal';

import { ENV } from '../config/env'; // Import ENV config

const Landing: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [showBgSettings, setShowBgSettings] = useState(false);
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const [step, setStep] = useState(1);
  const [finalRoomId, setFinalRoomId] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState({ p1: '', p2: '', admin: '' });
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Gom nhóm state config cho gọn
  const [gameConfig, setGameConfig] = useState({
    charBan: 0,
    weaBan: 0,
    pick: 4,
    timer: 30
  });

  const [currentBg, setCurrentBg] = useState(() => {
    return localStorage.getItem('landingBgUrl') || '/images/background/image1.png';
  });

    const createTokenWithId = async (rId: string, role: string, side: string) => {    return await new SignJWT({
      roomId: rId,
      role,
      side,
      cb: gameConfig.charBan,
      wb: gameConfig.weaBan,
      pk: gameConfig.pick,
      tm: gameConfig.timer
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(ENV.JWT_SECRET); // Sử dụng Secret từ ENV
  };

  const handleGenerateRoom = async () => {
    // 1. Tạo ID ngay lập tức
    const id = roomName.trim() || nanoid(5).toUpperCase();
    
    try {
      // 2. Tạo tokens đồng thời để tối ưu hiệu năng
      const [t1, t2, tAdmin] = await Promise.all([
        createTokenWithId(id, 'player', 'p1'),
        createTokenWithId(id, 'player', 'p2'),
        createTokenWithId(id, 'admin', 'admin')
      ]);

      // 3. Lấy domain hiện tại
      const origin = window.location.origin;

      // 4. Cập nhật state một lần duy nhất
      setFinalRoomId(id);
      setGeneratedLinks({
        p1: `${origin}/ban-pick?token=${t1}`,
        p2: `${origin}/ban-pick?token=${t2}`,
        admin: `${origin}/ban-pick?token=${tAdmin}`
      });
      setStep(2);
    } catch (error) {
      console.error("Lỗi tạo token:", error);
      alert("Cấu hình bảo mật (JWT Secret) chưa đúng, không thể tạo phòng.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const closePopup = () => {
    setShowConfigPopup(false);
    setStep(1);
    setFinalRoomId('');
    setCopyStatus(null);
  };

  return (
    <LandingLayout 
      currentBg={currentBg} 
      onOpenSupport={() => setShowSupportPopup(true)}
      onOpenBgSettings={() => setShowBgSettings(true)}
      onOpenInfo={() => setShowInfoPopup(true)}
    >
      {/* MENU CHÍNH */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
         <MainMenu 
           roomName={roomName} 
           setRoomName={setRoomName} 
           onOpenCreate={() => setShowConfigPopup(true)} 
         />
      </div>

      {/* CÁC POPUP */}
      {showConfigPopup && (
        <ConfigModal 
          step={step}
          finalRoomId={finalRoomId}
          generatedLinks={generatedLinks}
          config={gameConfig}
          setConfig={setGameConfig}
          copyStatus={copyStatus}
          onGenerate={handleGenerateRoom}
          onCopy={handleCopy}
          onClose={closePopup}
        />
      )}

      {showSupportPopup && (
        <SupportModal onClose={() => setShowSupportPopup(false)} />
      )}

      {showBgSettings && (
        <BackgroundSettings 
          isOpen={showBgSettings} 
          onClose={() => setShowBgSettings(false)} 
          onSelectBg={(url: string) => setCurrentBg(url)}
        />
      )}
      {showInfoPopup && (
        <InfoModal onClose={() => setShowInfoPopup(false)} />
      )}
    </LandingLayout>
  );
};

export default Landing;