import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { SignJWT } from 'jose';

import BackgroundSettings from '../components/Landing/BackgroundSettings';
import { LandingLayout } from '../components/Landing/LandingLayout';
import { MainMenu } from '../components/Landing/MainMenu';
import { ConfigModal } from '../components/Landing/ConfigModal';
import { SupportModal } from '../components/Landing/SupportModal';
import { InfoModal } from '../components/Landing/InfoModal';

import { ENV } from '../config/env';

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

  // Cấu hình Game đầy đủ để gửi lên Token
  const [gameConfig, setGameConfig] = useState({
    charBan: 0,
    weaBan: 0,
    pick: 4,
    timer: 30,
    banPickTurn: JSON.stringify([
      { id: 'pb-1', type: 'CHAR_BAN', label: 'Cấm Nhân Vật', priority: 'P1' },
      { id: 'pb-2', type: 'CHAR_PICK', label: 'Chọn Nhân Vật', priority: 'P1' },
      { id: 'pb-3', type: 'WEA_BAN', label: 'Cấm Nón Ánh Sáng', priority: 'P2' },
    ]),
    aiHelp: false
  });

  const [currentBg, setCurrentBg] = useState(() => {
    return localStorage.getItem('landingBgUrl') || '/images/background/image1.png';
  });

  const createTokenWithId = async (rId: string, role: string, side: string) => {
  const secret = new TextEncoder().encode(ENV.JWT_SECRET);
  return await new SignJWT({
    roomId: rId,
    role,
    side,
    cb: gameConfig.charBan,
    wb: gameConfig.weaBan,
    pk: gameConfig.pick,
    tm: gameConfig.timer,
    turn: gameConfig.banPickTurn,
    ai: gameConfig.aiHelp
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    // Ép kiểu để đánh lừa TypeScript vì ENV.JWT_SECRET lúc này là Uint8Array
    .sign(secret as any); 
};

  const handleGenerateRoom = async () => {
    const id = roomName.trim() || nanoid(5).toUpperCase();
    
    try {
      const [t1, t2, tAdmin] = await Promise.all([
        createTokenWithId(id, 'player', 'p1'),
        createTokenWithId(id, 'player', 'p2'),
        createTokenWithId(id, 'admin', 'admin')
      ]);

      const origin = window.location.origin;

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
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
         <MainMenu 
            roomName={roomName} 
            setRoomName={setRoomName} 
            onOpenCreate={() => setShowConfigPopup(true)} 
         />
      </div>

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