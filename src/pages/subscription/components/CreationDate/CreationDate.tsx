import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './style.scss';

interface CreationDateProps {
  createdAt: string;
}

export const CreationDate: React.FC<CreationDateProps> = ({ createdAt }) => {
  const formattedDate = format(new Date(createdAt), 'd MMMM yyyy', {
    locale: ru,
  });

  return <div className="created-text">План создан: {formattedDate}</div>;
};
