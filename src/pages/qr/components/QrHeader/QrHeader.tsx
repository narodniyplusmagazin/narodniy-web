import type { FC } from 'react';
import './style.scss';
import { QrCodeIcon } from 'lucide-react';

interface QRHeaderProps {
  planName?: string;
  usagesToday?: number;
  maxUsagesPerDay?: number;
}

export const QRHeader: FC<QRHeaderProps> = ({
  planName,
  usagesToday,
  maxUsagesPerDay,
}) => {
  return (
    <div className="qr-header">
      <h1 className="header-title">
        Народный + <QrCodeIcon size={24} />
      </h1>
      <p className="header-subtitle">
        {planName || 'Оформите подписку для доступа'}
      </p>
      {usagesToday !== undefined && maxUsagesPerDay !== undefined && (
        <p className="usage-count">
          Использовано сегодня: {usagesToday} / {maxUsagesPerDay}
        </p>
      )}
    </div>
  );
};
