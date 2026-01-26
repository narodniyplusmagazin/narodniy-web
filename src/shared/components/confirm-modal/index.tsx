import type { FC } from 'react';
import './style.scss';

type Props = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal: FC<Props> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="actions">
          <button onClick={onCancel}>Отмена</button>
          <button onClick={onConfirm}>Оформить</button>
        </div>
      </div>
    </div>
  );
};
