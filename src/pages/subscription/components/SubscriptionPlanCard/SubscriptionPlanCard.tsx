import React from 'react';
import './style.scss';
import { HeartIcon } from 'lucide-react';
import type { SubscriptionType } from '../../../../api/subscription-api';

interface SubscriptionPlanCardProps {
  plan: SubscriptionType;
  children?: React.ReactNode;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  children,
}) => {
  return (
    <div className="main-card">
      <div className="price-container">
        <span className="currency">₽</span>
        <span className="price">{plan.price}</span>
        <span className="period">/{plan.durationDays} дней</span>
      </div>

      <div className="badge">
        <HeartIcon size={32} color="var(--color-success)" />
        <span className="badge-text">
          {plan.discount ? `Скидка ${plan.discount}%` : 'Популярный выбор'}
        </span>
      </div>

      {children}
    </div>
  );
};
