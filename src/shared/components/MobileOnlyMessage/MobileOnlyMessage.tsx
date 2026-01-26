import React from 'react';
import { Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';
import './style.scss';

export const MobileOnlyMessage: React.FC = () => {
  // Detect if user is on desktop
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Don't show anything on mobile
  if (isMobile) {
    return null;
  }

  // Get current URL
  const currentUrl = window.location.href;

  // Show message on desktop
  return (
    <div className="mobile-only-overlay">
      <div className="mobile-only-card">
        <div className="mobile-only-icon">
          <Smartphone size={64} color="#4A90E2" />
        </div>
        <h2 className="mobile-only-title">Мобильное приложение</h2>
        <p className="mobile-only-description">
          Это приложение разработано для мобильных устройств.
          <br />
          Для полного функционала откройте сайт на вашем смартфоне.
        </p>
        <div className="mobile-only-qr">
          <p className="mobile-only-qr-text">
            Отсканируйте QR-код на телефоне для быстрого доступа:
          </p>
          <div className="mobile-only-qr-code">
            <QRCode
              value={currentUrl}
              size={200}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="mobile-only-url">{currentUrl}</p>
        </div>
        <p className="mobile-only-footer">
          💡 Приложение оптимизировано для экранов смартфонов
        </p>
      </div>
    </div>
  );
};
