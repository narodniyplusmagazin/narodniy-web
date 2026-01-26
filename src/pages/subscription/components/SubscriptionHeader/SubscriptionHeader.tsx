import React from 'react';
import './style.scss';

interface SubscriptionHeaderProps {
  planName: string;
  description: string;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  planName,
  description,
}) => {
  return (
    <div className="subscription-header">
      <div className="title">Народный +</div>
      <div className="subtitle">
        {planName} — {description}
      </div>
    </div>
  );
};
