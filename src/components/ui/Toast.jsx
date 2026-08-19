import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const Toast = ({ type = 'info', message, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    requestAnimationFrame(() => setIsVisible(true));
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for transition
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
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
};
