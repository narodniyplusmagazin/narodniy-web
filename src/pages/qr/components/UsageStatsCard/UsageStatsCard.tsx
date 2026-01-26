import type { FC } from 'react';
import './style.scss';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UsageStats {
  totalUsages: number;
  usagesToday: number;
  usagesThisWeek: number;
  usagesThisMonth: number;
  maxUsagesPerDay: number;
  history: {
    usedAt: string;
    location?: string;
  }[];
}

interface UsageStatsCardProps {
  stats: UsageStats;
  isLimitReached: boolean;
}

export const UsageStatsCard: FC<UsageStatsCardProps> = ({
  stats,
  isLimitReached,
}) => {
  const usagePercentage = (stats.usagesToday / stats.maxUsagesPerDay) * 100;

  return (
    <div className="stats-card">
      <h3 className="stats-title">📊 Использование сегодня</h3>

      <div className="usage-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${usagePercentage}%`,
              backgroundColor: isLimitReached ? '#FF4D4F' : '#007bff',
            }}
          />
        </div>
        <span className="usage-text">
          {stats.usagesToday} из {stats.maxUsagesPerDay}
        </span>
      </div>

      {isLimitReached && (
        <div className="limit-warning">
          <span className="limit-warning-text">⚠️ Дневной лимит исчерпан</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.usagesThisWeek}</span>
          <span className="stat-label">На этой неделе</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.usagesThisMonth}</span>
          <span className="stat-label">В этом месяце</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalUsages}</span>
          <span className="stat-label">Всего</span>
        </div>
      </div>

      {stats.history && stats.history.length > 0 && (
        <div className="history-section">
          <h4 className="history-title">📝 Последние использования</h4>
          {stats.history.slice(0, 5).map((item, index) => (
            <div key={index} className="history-item">
              <span className="history-date">
                {format(new Date(item.usedAt), 'dd.MM.yyyy HH:mm', {
                  locale: ru,
                })}
              </span>
              {item.location && (
                <span className="history-location">📍 {item.location}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
