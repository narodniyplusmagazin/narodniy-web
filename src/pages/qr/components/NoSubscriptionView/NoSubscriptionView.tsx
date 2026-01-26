import React from 'react';
import './style.scss';

interface NoSubscriptionViewProps {
  onSubscribePress: () => void;
}

export const NoSubscriptionView: React.FC<NoSubscriptionViewProps> = ({
  onSubscribePress,
}) => {
  const features = [
    'Персональный QR-код для покупок',
    'Доступ ко всем магазинам-партнерам',
    'Статистика использования',
    'Безопасные транзакции',
  ];

  return (
    <div className="no-subscription-container">
      <div className="qr-placeholder-card">
        <p className="placeholder-title">Пример QR-кода подписки</p>
        <p className="placeholder-text">
          Оформите подписку, чтобы получить персональный QR-код для
          использования в магазинах-партнерах
        </p>
      </div>

      <div className="features-card">
        <p className="features-title">✨ Что вы получите:</p>
        {features.map((feature, index) => (
          <div key={index} className="feature-item">
            <span className="feature-icon">✓</span>
            <span className="feature-text">{feature}</span>
          </div>
        ))}
      </div>

      <button className="subscribe-button" onClick={onSubscribePress}>
        Оформить подписку
      </button>
    </div>
  );
};
