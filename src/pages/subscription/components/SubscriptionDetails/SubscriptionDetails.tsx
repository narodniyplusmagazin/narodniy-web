import React from 'react';

import './style.scss';
import type { SubscriptionType } from '../../../../api/subscription-api';
import { Calendar, DollarSign, Repeat } from 'lucide-react';

interface SubscriptionDetailsProps {
  plan: SubscriptionType;
}

export const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  plan,
}) => {
  return (
    <div className="details-container">
      <div className="detail-item">
        <Calendar
          size={32}
          color="var(--primary-color)"
          className="detail-icon"
        />
        <div className="detail-content">
          <div className="detail-label">Длительность</div>
          <div className="detail-value">{plan.durationDays} дней</div>
        </div>
      </div>

      <div className="detail-item">
        <Repeat
          size={32}
          color="var(--primary-color)"
          className="detail-icon"
        />
        <div className="detail-content">
          <div className="detail-label">Лимит использований в день</div>
          <div className="detail-value">
            {plan.maxUsagesPerDay === -1
              ? 'Неограниченно'
              : `${plan.maxUsagesPerDay || 3} раз`}
          </div>
        </div>
      </div>

      <div className="detail-item">
        <DollarSign
          size={32}
          color="var(--primary-color)"
          className="detail-icon"
        />
        <div className="detail-content">
          <div className="detail-label">Стоимость</div>
          <div className="detail-value">{plan.price} ₽</div>
        </div>
      </div>
    </div>
  );
};
