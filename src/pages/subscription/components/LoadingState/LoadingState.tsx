import React from 'react';
import './style.scss';

export const LoadingState: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="center-container">
        <div className="spinner"></div>
        <div className="loading-text">Загрузка...</div>
      </div>
    </div>
  );
};
