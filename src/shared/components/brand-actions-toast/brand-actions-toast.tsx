import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './brand-actions-toast.css';

interface BrandActionsToastProps {
  onClose: () => void;
  onGoToLandingPage: () => void;
}

export const BrandActionsToast: React.FC<BrandActionsToastProps> = ({
  onClose,
  onGoToLandingPage
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
    onGoToLandingPage();
  };

  return createPortal(
    <div className="brand-actions-toast" role="dialog" aria-labelledby="brand-actions-title">
      <button
        type="button"
        className="brand-actions-toast__close"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div className="brand-actions-toast__content">
        <h4 id="brand-actions-title">Apply for Main Application</h4>
        <p>Get full access to all the main application features by applying now!</p>
        <button type="button" className="brand-actions-toast__apply-btn" onClick={handleApply}>
          Apply for Main Application
        </button>
      </div>
    </div>,
    document.body
  );
};
