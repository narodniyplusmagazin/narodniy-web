import React from 'react';
import './style.scss';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="error-container">
      <div className="center-container">
        <div className="error-text">План подписки не найден</div>
        <button className="retry-button" onClick={onRetry}>
          Попробовать снова
        </button>
      </div>
    </div>
  );
};
