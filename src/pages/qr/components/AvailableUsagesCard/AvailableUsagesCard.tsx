import React from 'react';
import './style.scss';
import { Check } from 'lucide-react';

interface AvailableUsagesCardProps {
  usagesToday: number;
  maxUsagesPerDay: number;
}

export const AvailableUsagesCard: React.FC<AvailableUsagesCardProps> = ({
  usagesToday,
  maxUsagesPerDay,
}) => {
  const remainingUsages = Math.max(0, maxUsagesPerDay - usagesToday);
  const usagePercentage = (usagesToday / maxUsagesPerDay) * 100;

  const getStatusColor = () => {
    if (remainingUsages === 0) return 'tomato';
    if (remainingUsages === 1) return 'orange';
    return 'green';
  };

  return (
    <div
      className="available-usages-card"
      style={{ borderLeftColor: getStatusColor() }}
    >
      <div className="available-usages-body">
        <div className="available-usages-header">
          <span className="available-usages-title">Доступные входы</span>
        </div>

        <div className="available-usages-circles-row">
          {Array.from({ length: maxUsagesPerDay }).map((_, index) => (
            <div
              key={index}
              className="available-usage-circle"
              style={{
                backgroundColor:
                  index < usagesToday
                    ? 'var(--text-secondary)'
                    : getStatusColor(),
                opacity: index < usagesToday ? 0.3 : 1,
              }}
            >
              {index < usagesToday ? (
                <Check size={20} color="white" />
              ) : (
                <span className="available-usage-circle-text">{index + 1}</span>
              )}
            </div>
          ))}
        </div>

        <div className="usage-progress-bar">
          <div
            className="usage-progress-fill"
            style={{
              width: `${usagePercentage}%`,
              backgroundColor: getStatusColor(),
            }}
          />
        </div>

        {remainingUsages === 0 ? (
          <p
            className="available-usages-message"
            style={{ color: 'var(--error)' }}
          >
            ❌ Лимит использования исчерпан на сегодня
          </p>
        ) : remainingUsages === 1 ? (
          <p
            className="available-usages-message"
            style={{ color: 'var(--warning)' }}
          >
            ⚠️ Остался последний вход на сегодня
          </p>
        ) : (
          <p
            className="available-usages-message"
            style={{ color: 'var(--success)' }}
          >
            ✓ У вас есть {remainingUsages}{' '}
            {remainingUsages === 2 ? 'входа' : 'входов'} на сегодня
          </p>
        )}
      </div>
    </div>
  );
};
