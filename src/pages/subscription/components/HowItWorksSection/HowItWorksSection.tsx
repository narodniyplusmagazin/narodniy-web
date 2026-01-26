import React from 'react';
import './style.scss';
import { SettingsIcon } from 'lucide-react';

interface HowItWorksSectionProps {
  durationDays: number;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  durationDays,
}) => {
  return (
    <div className="info-box">
      <div className="info-title">
        <SettingsIcon size={25} color="var(--primary-color)" />
        <span> Как это работает</span>
      </div>

      <div className="info-item">
        <div className="info-number">1</div>
        <div className="info-content">
          <div className="info-text">
            Оформите подписку и произведите оплату
          </div>
        </div>
      </div>

      <div className="info-item">
        <div className="info-number">2</div>
        <div className="info-content">
          <div className="info-text">
            Используйте QR-код для покупок в течение {durationDays} дней
          </div>
        </div>
      </div>
    </div>
  );
};
