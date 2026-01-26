import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './style.scss';

interface ActiveSubscriptionCardProps {
  subscription: {
    id: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    planName?: string;
    plan?: {
      name: string;
      maxUsagesPerDay?: number;
    };
    maxUsagesPerDay?: number;
  };
}

export const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  subscription,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  console.log(subscription);

  const getDaysLeft = () => {
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft();
  const isExpiring = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  const planName =
    subscription.planName || subscription.plan?.name || 'Подписка';

  const maxUsages =
    subscription.maxUsagesPerDay || subscription.plan?.maxUsagesPerDay;

  return (
    <div className="subscription-card">
      <div className="active-subscription-header">
        <div className="subscription-title">✓ У вас активная подписка</div>

        <div
          className={`subscription-badge
            ${isExpired ? 'expired' : ''}
            ${isExpiring ? 'expiring' : ''}`}
        >
          <span
            className={`badge-text ${isExpired || isExpiring ? 'warning' : ''}`}
          >
            {isExpired ? 'Истекла' : isExpiring ? 'Истекает' : 'Активна'}
          </span>
        </div>
      </div>

      <div className="subscription-details">
        <div className="row">
          <span className="label">План:</span>
          <span className="value">{planName}</span>
        </div>

        <div className="row">
          <span className="label">Дата начала:</span>
          <span className="value">{formatDate(subscription.startDate)}</span>
        </div>

        <div className="row">
          <span className="label">Дата окончания:</span>
          <span
            className={`value ${
              isExpiring ? 'expiring-text' : ''
            } ${isExpired ? 'expired-text' : ''}`}
          >
            {formatDate(subscription.endDate)}
          </span>
        </div>

        {daysLeft > 0 && (
          <div className="row">
            <span className="label">Осталось дней:</span>
            <span
              className={`value days-left ${isExpiring ? 'expiring-text' : ''}`}
            >
              {daysLeft}
            </span>
          </div>
        )}

        {maxUsages && (
          <div className="row">
            <span className="label">Использований в день:</span>
            <span className="value">{maxUsages}</span>
          </div>
        )}
      </div>

      <div className="subscription-footer">
        <span className="note">
          Вы не можете оформить новую подписку, пока действует текущая
        </span>
      </div>
    </div>
  );
};
