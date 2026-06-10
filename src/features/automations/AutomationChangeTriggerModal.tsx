import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { DemoTriggerKey } from './automationContextRules';
import { triggerLabelForKey } from './automationContextRules';
import { AutomationTriggerPicker } from './AutomationTriggerPicker';

interface AutomationChangeTriggerModalProps {
  open: boolean;
  currentTriggerKey: string;
  hasOtherSteps: boolean;
  onClose: () => void;
  onConfirm: (triggerKey: DemoTriggerKey) => void;
}

export const AutomationChangeTriggerModal: React.FC<AutomationChangeTriggerModalProps> = ({
  open,
  currentTriggerKey,
  hasOtherSteps,
  onClose,
  onConfirm
}) => {
  const [pendingKey, setPendingKey] = useState<DemoTriggerKey | null>(null);

  useEffect(() => {
    if (!open) setPendingKey(null);
  }, [open]);

  if (!open) return null;

  const handleSelect = (key: DemoTriggerKey) => {
    if (key === currentTriggerKey) {
      onClose();
      return;
    }
    if (!hasOtherSteps) {
      onConfirm(key);
      onClose();
      return;
    }
    setPendingKey(key);
  };

  const handleConfirm = () => {
    if (!pendingKey) return;
    onConfirm(pendingKey);
    onClose();
  };

  const handleCancelConfirm = () => setPendingKey(null);

  return (
    <div className="auto-change-trigger-overlay" onClick={onClose} aria-hidden={false}>
      <div
        className="auto-change-trigger-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Change Trigger"
        onClick={e => e.stopPropagation()}
      >
        <header className="auto-change-trigger-modal__header">
          <div>
            <h2>Change Trigger</h2>
            <p className="auto-change-trigger-modal__subtitle">Choose what starts this automation</p>
          </div>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="auto-change-trigger-modal__body">
          {pendingKey ? (
            <div className="auto-change-trigger-confirm">
              <p className="auto-change-trigger-confirm__warning">
                Changing the trigger may make existing steps invalid.
              </p>
              <p className="auto-change-trigger-confirm__detail">
                Switch to <strong>{triggerLabelForKey(pendingKey)}</strong>?
              </p>
              <div className="auto-change-trigger-confirm__actions">
                <button type="button" className="org-btn org-btn--secondary" onClick={handleCancelConfirm}>
                  Cancel
                </button>
                <button type="button" className="org-btn org-btn--primary" onClick={handleConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <AutomationTriggerPicker
              variant="modal"
              hideHeader
              selectedKey={currentTriggerKey}
              onSelect={handleSelect}
            />
          )}
        </div>

        {!pendingKey && (
          <footer className="auto-change-trigger-modal__footer">
            <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
              Cancel
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
