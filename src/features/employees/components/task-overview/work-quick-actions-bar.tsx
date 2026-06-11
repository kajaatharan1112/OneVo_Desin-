import React from 'react';
import type { workQuickActions } from '../../data/work-tab.mock';

type QuickAction = (typeof workQuickActions)[number];

interface WorkQuickActionsBarProps {
  actions: readonly QuickAction[];
  className?: string;
}

export const WorkQuickActionsBar: React.FC<WorkQuickActionsBarProps> = ({
  actions,
  className = ''
}) => {
  return (
    <section
      className={`work-quick-bar ${className}`.trim()}
      aria-label="Quick work actions"
    >
      {actions.map((action) => (
        <button key={action.id} type="button" className="work-quick-bar__btn">
          {action.label}
        </button>
      ))}
    </section>
  );
};
