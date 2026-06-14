import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './apply-main-application-toast.css';

interface ApplyMainApplicationToastProps {
  onClose: () => void;
  onOpenApplicationForm: () => void;
}

export const ApplyMainApplicationToast: React.FC<ApplyMainApplicationToastProps> = ({
  onClose,
  onOpenApplicationForm
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleApply = () => {
    onClose();
    onOpenApplicationForm();
  };

  return createPortal(
    <div
      className="apply-main-application-toast"
      role="dialog"
      aria-labelledby="apply-main-application-title"
    >
      <button
        type="button"
        className="apply-main-application-toast__close"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div className="apply-main-application-toast__content">
        <h4 id="apply-main-application-title">Apply for Main Application</h4>
        <p>Get full access to all the main application features by applying now!</p>
        <button
          type="button"
          className="apply-main-application-toast__apply-btn"
          onClick={handleApply}
        >
          Apply for Main Application
        </button>
      </div>
    </div>,
    document.body
  );
};
