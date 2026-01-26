import React from 'react';
import './style.scss';

interface SubscriptionActionsProps {
  isActive: boolean;
  subscribing: boolean;
  onSubscribe: () => void;
  onTestSubscription: () => void;
  hasActiveSubscription?: boolean;
}

export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  isActive,
  subscribing,
  onTestSubscription,
  hasActiveSubscription = false,
}) => {
  const isDisabled = !isActive || subscribing || hasActiveSubscription;

  return (
    <div className="subscription-actions">
      {/* Uncomment below if you want a separate "Subscribe" button */}
      {/* <button
        className={`button ${isDisabled ? "button-disabled" : ""}`}
        onClick={onSubscribe}
        disabled={isDisabled}
      >
        {hasActiveSubscription
          ? "У вас уже есть подписка"
          : isActive
          ? "Оформить подписку"
          : "Недоступно"}
      </button> */}

      <button
        className={`button ${isDisabled ? 'button-disabled' : ''}`}
        onClick={onTestSubscription}
        disabled={isDisabled}
      >
        {hasActiveSubscription
          ? 'У вас уже есть подписку'
          : 'Оформить подписку'}
      </button>

      {!isActive && !hasActiveSubscription && (
        <div className="inactive-text">Данный план временно недоступен</div>
      )}
    </div>
  );
};
