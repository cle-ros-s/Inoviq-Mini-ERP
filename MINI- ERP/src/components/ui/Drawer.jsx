import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Drawer = ({ isOpen, onClose, title, children, position = 'right', size = 'md' }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const drawerContent = (
    <div className="drawer-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className={`drawer-content drawer-${position} drawer-${size}`} role="dialog" aria-modal="true">
        <div className="drawer-header">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button className="btn-icon text-gray-500 hover:text-gray-900" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

export default Drawer;
