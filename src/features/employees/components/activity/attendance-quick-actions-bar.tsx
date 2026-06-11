import React from 'react';
import type { AttendanceQuickAction } from '../../data/attendance-tab.mock';

interface AttendanceQuickActionsBarProps {
  actions: readonly AttendanceQuickAction[];
  className?: string;
}

export const AttendanceQuickActionsBar: React.FC<AttendanceQuickActionsBarProps> = ({
  actions,
  className = ''
}) => {
  return (
    <section
      className={`attendance-quick-bar ${className}`.trim()}
      aria-label="Quick attendance actions"
    >
      {actions.map((action) => (
        <button key={action.id} type="button" className="attendance-quick-bar__btn">
          {action.label}
        </button>
      ))}
    </section>
  );
};
