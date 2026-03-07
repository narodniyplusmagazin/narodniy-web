import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './style.scss';
import { useEffect, type FC } from 'react';

interface QRData {
  qrCode: string;
  qrToken: string;
  generatedAt: string;
  expiresAt: string;
  subscriptionId?: string;
}

interface QRCodeCardProps {
  qrData: QRData | null;
  daysLeft: number;
  loading: boolean;
  hasNoAvailableUsages?: boolean;
  onRefreshQR?: () => void;
  onRenewPress?: () => void;
  onOpenFullscreen: () => void;
}

export const QRCodeCard: FC<QRCodeCardProps> = ({
  qrData,
  daysLeft,
  loading,
  hasNoAvailableUsages = false,
  onOpenFullscreen,
}) => {
  useEffect(() => {
    if (qrData) {
      if (typeof qrData.qrCode === 'object') {
        console.error('❌ QR code is an object, not a string!');
      }
    }
  }, [qrData]);

  const getQRValue = () => {
    if (!qrData?.qrCode) return '';

    if (typeof qrData.qrCode === 'object') {
      console.warn('Converting object to string for QR code');
      return JSON.stringify(qrData.qrCode);
    }

    if (typeof qrData.qrCode === 'string' && qrData.qrCode.length > 2000) {
      console.warn('QR code too long, truncating');
      return qrData.qrCode.substring(0, 2000);
    }

    return qrData.qrCode;
  };

  const qrValue = getQRValue();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenFullscreen();
    }
  };

  if (hasNoAvailableUsages) {
    return (
      <div className="qr-card no-usage">
        <p className="qr-title">⚠️ Лимит использований исчерпан</p>
        <p className="qr-subtitle">QR-код будет доступен завтра</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="qr-card loading-card">
        <div className="spinner"></div>
        <p className="qr-loading-text">Генерация QR-кода...</p>
      </div>
    );
  }

  return (
    <div className="qr-card">
      <p className="qr-title">
        {daysLeft > 0 ? '🎫 Покажите QR-код на кассе' : '⚠️ Подписка истекла'}
      </p>

      <div className="qr-gradient-wrapper">
        <div
          className="qr-wrapper"
          onClick={onOpenFullscreen}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Открыть QR-код на весь экран"
        >
          {qrValue ? (
            <QRCode value={qrValue} size={250} fgColor="#000" />
          ) : (
            <div className="qr-placeholder">
              <p>Генерация QR кода...</p>
            </div>
          )}
        </div>
      </div>

      {daysLeft > 0 && (
        <div className="qr-info">
          <p className="qr-info-text">🔒 Не передавайте код третьим лицам</p>
          <p className="qr-info-text">⚡ Действителен 30 секунд</p>

          {qrData && (
            <p className="qr-expiry">
              Истекает в:{' '}
              {format(new Date(qrData.expiresAt), 'HH:mm:ss', {
                locale: ru,
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
