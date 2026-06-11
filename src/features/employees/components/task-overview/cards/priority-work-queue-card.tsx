import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { PriorityQueueGroup } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
} as const;

interface PriorityWorkQueueCardProps {
  groups: PriorityQueueGroup[];
  className?: string;
}

export const PriorityWorkQueueCard: React.FC<PriorityWorkQueueCardProps> = ({
  groups,
  className
}) => {
  return (
    <DashboardCard
      className={className}
      title="Priority Work Queue"
      icon={<AlertCircle size={15} aria-hidden="true" />}
      ariaLabel="Priority work queue"
    >
      <div className="emp-dash-scroll emp-dash-scroll--queue" aria-label="Grouped priority tasks">
        {groups.map((group) =>
          group.items.length > 0 ? (
            <section key={group.id} className={`emp-dash-queue-group emp-dash-queue-group--${group.id}`}>
              <h4 className="emp-dash-queue-group__title">{group.title}</h4>
              <ul className="emp-dash-queue-group__list">
                {group.items.map((item) => (
                  <li key={item.id} className="emp-dash-queue-row">
                    <span className="emp-dash-queue-row__title">{item.title}</span>
                    <span className="emp-dash-queue-row__meta">
                      <span className={`emp-dash-chip emp-dash-chip--priority-${item.priority}`}>
                        {PRIORITY_LABELS[item.priority]}
                      </span>
                      <span className="emp-dash-queue-row__due">{item.dueLabel}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null
        )}
      </div>
    </DashboardCard>
  );
};
