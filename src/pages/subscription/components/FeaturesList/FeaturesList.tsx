import React from 'react';
import './style.scss';

interface FeaturesListProps {
  features: string[];
}

export const FeaturesList: React.FC<FeaturesListProps> = ({ features }) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="features-container">
      <div className="features-title">Что входит:</div>
      {features.map((feature, index) => (
        <div key={index} className="feature-item">
          <span className="feature-icon">✓</span>
          <span className="feature-text">{feature}</span>
        </div>
      ))}
    </div>
  );
};
