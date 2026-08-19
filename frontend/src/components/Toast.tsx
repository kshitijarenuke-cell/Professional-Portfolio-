import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Toast: React.FC = () => {
  const { toast } = useAuth();

  return (
    <div className={`toast-notify ${toast.visible ? 'visible' : ''}`}>
      <span>{toast.message}</span>
    </div>
  );
};
