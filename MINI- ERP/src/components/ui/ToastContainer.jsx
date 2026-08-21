import React from 'react';
import Toast from './Toast.jsx';
import { useUI } from '../../context/UIContext.jsx';

export default function ToastContainer() {
  const { toasts, removeToast } = useUI();

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
