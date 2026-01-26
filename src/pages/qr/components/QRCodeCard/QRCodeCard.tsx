import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './style.scss';
import { useEffect, type FC } from 'react';

interface QRData {
  qrCode: string;
  generatedAt: string;
  expiresAt: string;
  subscriptionId: string;
}

interface QRCodeCardProps {
  qrData: QRData | null;
  daysLeft: number;
  loading: boolean;
  onRefreshQR: () => void;
  onRenewPress: () => void;
  onOpenFullscreen: () => void;
}

export const QRCodeCard: FC<QRCodeCardProps> = ({
  qrData,
  daysLeft,
  loading,
  onRefreshQR,
  onRenewPress,
  onOpenFullscreen,
}) => {
  useEffect(() => {
    if (qrData) {
      if (typeof qrData.qrCode === 'object') {
        console.error('❌ QR code is an object, not a string!');
      }
    } else {
      console.log('⚠️ No QR data available');
    }
  }, [qrData]);

  const getQRValue = () => {
    if (!qrData || !qrData.qrCode) return '';

    if (typeof qrData.qrCode === 'object') {
      console.warn('Converting object to string for QR code');
      return JSON.stringify(qrData.qrCode);
    }

    if (typeof qrData.qrCode === 'string' && qrData.qrCode.length > 1000) {
      console.warn('QR code too long, truncating');
      return qrData.qrCode.substring(0, 1000);
    }

    return qrData.qrCode;
  };

  const qrValue = getQRValue();

  return (
    <div className="qr-card">
      <p className="qr-title">
        {daysLeft > 0 ? '🎫 Покажите QR-код на кассе' : '⚠️ Подписка истекла'}
      </p>

      <div className="qr-gradient-wrapper">
        <div className="qr-wrapper" onClick={onOpenFullscreen}>
          {qrValue ? (
            <QRCode value={qrValue} size={250} fgColor="#000" />
          ) : (
            <div className="qr-placeholder">
              <p>Ваш QR код</p>
            </div>
          )}
        </div>
      </div>

      {daysLeft > 0 ? (
        <>
          <div className="qr-info">
            <p className="qr-info-text">🔒 Не передавайте код третьим лицам</p>
            {qrData && (
              <p className="qr-expiry">
                Действителен до:{' '}
                {format(new Date(qrData.expiresAt), 'dd.MM.yyyy HH:mm', {
                  locale: ru,
                })}
              </p>
            )}
          </div>

          <button
            className="refresh-button"
            onClick={onRefreshQR}
            disabled={loading}
          >
            Открыть QR-код
          </button>
        </>
      ) : (
        <button className="renew-button-inline" onClick={onRenewPress}>
          ⭐ Продлить подписку
        </button>
      )}
    </div>
  );
};
