import type { FC } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './style.scss';

interface SubscriptionStatusCardProps {
  daysLeft: number;
  timeUntilExpiry: string;
  startDate: string;
  endDate: string;
  getStatusColor: () => string;
}

export const SubscriptionStatusCard: FC<SubscriptionStatusCardProps> = ({
  daysLeft,
  timeUntilExpiry,
  startDate,
  endDate,
  getStatusColor,
}) => {
  const statusColor = getStatusColor();

  return (
    <div className="status-card" style={{ borderLeftColor: statusColor }}>
      <div className="status-row">
        <div className="status-label-container">
          <span className="status-icon">{daysLeft > 0 ? '✅' : '⏰'}</span>
          <span className="status-label">Статус:</span>
        </div>
        <div className="status-badge" style={{ backgroundColor: statusColor }}>
          <span className="status-badge-text">
            {daysLeft > 0 ? 'Активна' : 'Истекла'}
          </span>
        </div>
      </div>

      <div className="status-row">
        <div className="status-label-container">
          <span className="status-icon">📅</span>
          <span className="status-label">Осталось:</span>
        </div>
        <span className="status-value" style={{ color: statusColor }}>
          {timeUntilExpiry}
        </span>
      </div>

      <div className="divider" />

      <div className="date-row">
        <div className="date-item">
          <span className="date-label">Начало</span>
          <span className="date-value">
            {format(new Date(startDate), 'dd.MM.yyyy', { locale: ru })}
          </span>
        </div>
        <div className="date-separator" />
        <div className="date-item">
          <span className="date-label">Окончание</span>
          <span className="date-value">
            {format(new Date(endDate), 'dd.MM.yyyy', { locale: ru })}
          </span>
        </div>
      </div>
    </div>
  );
};
