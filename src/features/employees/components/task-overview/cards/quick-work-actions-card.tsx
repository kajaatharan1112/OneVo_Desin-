import React from 'react';
import { Zap } from 'lucide-react';
import type { QuickWorkAction } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

interface QuickWorkActionsCardProps {
  actions: QuickWorkAction[];
  className?: string;
}

export const QuickWorkActionsCard: React.FC<QuickWorkActionsCardProps> = ({
  actions,
  className
}) => {
  return (
    <DashboardCard
      className={className}
      title="Quick Work Actions"
      icon={<Zap size={15} aria-hidden="true" />}
      ariaLabel="Quick work actions"
    >
      <ul className="emp-dash-actions">
        {actions.map((action) => (
          <li key={action.id}>
            <button type="button" className="emp-dash-btn emp-dash-btn--action">
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
