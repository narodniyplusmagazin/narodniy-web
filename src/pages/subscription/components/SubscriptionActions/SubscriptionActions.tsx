/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import './style.scss';
import { createPayment } from '../../../../api/payment-service';

interface SubscriptionActionsProps {
  isActive: boolean;
  subscribing: boolean;
  onSubscribe: () => void;
  onTestSubscription: () => void;
  hasActiveSubscription?: boolean;
  subscriptionPlanId: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userData?: any;
  activeSubscription?: any;
}

export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  isActive,
  subscribing,
  onTestSubscription,
  subscriptionPlanId,
  hasActiveSubscription = false,
  userId,
  userEmail,
  userPhone,
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isDisabled =
    !isActive || subscribing || hasActiveSubscription || paymentLoading;

  const handleRealPayment = async () => {
    if (!userId || !userPhone) {
      setPaymentError('Недостаточно данных пользователя');
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError(null);

      const paymentData = await createPayment(
        subscriptionPlanId,
        userId,
        userEmail
      );

      if (paymentData?.confirmationUrl) {
        window.location.href = paymentData.confirmationUrl;
      } else {
        setPaymentError('Не удалось получить ссылку на оплату');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Ошибка при создании платежа. Попробуйте позже.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="subscription-actions">
      <button
        className={`button ${isDisabled ? 'button-disabled' : ''}`}
        onClick={onTestSubscription}
        disabled={isDisabled}
      >
        {hasActiveSubscription
          ? 'У вас уже есть подписку'
          : 'Оформить подписку'}
      </button>

      <button
        className={`button ${isDisabled ? 'button-disabled' : ''}`}
        onClick={handleRealPayment}
        disabled={isDisabled}
      >
        {paymentLoading ? 'Обработка...' : 'Оформить подписку real'}
      </button>

      {paymentError && (
        <div className="inactive-text" style={{ color: '#e74c3c' }}>
          {paymentError}
        </div>
      )}

      {!isActive && !hasActiveSubscription && (
        <div className="inactive-text">Данный план временно недоступен</div>
      )}
    </div>
  );
};
