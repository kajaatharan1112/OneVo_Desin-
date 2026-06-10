import React, { useEffect, useRef } from 'react';
import type { AddStepOption } from './automationTypes';

const OPTIONS: { key: AddStepOption; label: string }[] = [
  { key: 'condition', label: 'Add Condition' },
  { key: 'action', label: 'Add Action' },
  { key: 'approval', label: 'Add Approval' },
  { key: 'notification', label: 'Add Notification' },
  { key: 'alert', label: 'Add Alert' },
  { key: 'delay', label: 'Add Delay' },
  { key: 'branch', label: 'Add Branch' }
];

interface AutomationAddStepMenuProps {
  open: boolean;
  onClose: () => void;
  onSelect: (option: AddStepOption) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export const AutomationAddStepMenu: React.FC<AutomationAddStepMenuProps> = ({
  open,
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

  if (!open) return null;

  return (
    <div className="auto-add-menu" ref={menuRef}>
      {OPTIONS.map(opt => (
        <button
          key={opt.key}
          type="button"
          className="auto-add-menu__item"
          onClick={() => { onSelect(opt.key); onClose(); }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
