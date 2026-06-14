import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './brand-menu-toast.css';

interface BrandMenuToastProps {
  onClose: () => void;
  onOpenApplicationToast: () => void;
}

export const BrandMenuToast: React.FC<BrandMenuToastProps> = ({
  onClose,
  onOpenApplicationToast
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleContinue = () => {
    onClose();
    onOpenApplicationToast();
  };

  return createPortal(
    <div className="brand-menu-toast" role="dialog" aria-labelledby="brand-menu-title">
      <button
        type="button"
        className="brand-menu-toast__close"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div className="brand-menu-toast__content">
        <h4 id="brand-menu-title">OneVo HRMS</h4>
        <p>Continue to explore application access and onboarding options.</p>
        <button type="button" className="brand-menu-toast__action-btn" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>,
    document.body
  );
};
