import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  confirmVariant = 'primary',
  isLoading = false
}) => {
  
  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <button 
        className="btn btn-secondary" 
        onClick={onClose} 
        disabled={isLoading}
      >
        Cancel
      </button>
      <button 
        className={`btn btn-${confirmVariant}`} 
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : confirmLabel}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={footer}>
      <div className="flex gap-4 items-start">
        {confirmVariant === 'danger' && (
          <div className="text-error flex-shrink-0 mt-1">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}
        <div className="text-gray-700">
          {message}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
