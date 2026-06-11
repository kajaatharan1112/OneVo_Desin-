import React, { useEffect, useRef } from 'react';
import type { AddStepOption } from './automationTypes';

const OPTION_LABELS: Record<AddStepOption, string> = {
  condition: 'Add Condition',
  action: 'Add Action',
  approval: 'Add Approval',
  notification: 'Add Notification',
  alert: 'Add Alert',
  delay: 'Add Delay',
  branch: 'Add Branch',
  end: 'Add End'
};

interface AutomationAddStepMenuProps {
  open: boolean;
  allowedOptions: AddStepOption[];
  onClose: () => void;
  onSelect: (option: AddStepOption) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export const AutomationAddStepMenu: React.FC<AutomationAddStepMenuProps> = ({
  open,
  allowedOptions,
  onClose,
  onSelect,
  anchorRef
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open || allowedOptions.length === 0) return null;

  return (
    <div className="auto-add-menu" ref={menuRef}>
      {allowedOptions.map(opt => (
        <button
          key={opt}
          type="button"
          className="auto-add-menu__item"
          onClick={() => { onSelect(opt); onClose(); }}
        >
          {OPTION_LABELS[opt]}
        </button>
      ))}
    </div>
  );
};
