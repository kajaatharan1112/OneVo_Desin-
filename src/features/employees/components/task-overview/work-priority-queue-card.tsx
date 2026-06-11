import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { WorkPriority, WorkQueueSection } from '../../data/work-tab.mock';
import { DashboardCard } from './cards/dashboard-card';
import { WorkScrollBody } from './work-scroll-body';

const PRIORITY_LABELS: Record<WorkPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

interface WorkPriorityQueueCardProps {
  sections: WorkQueueSection[];
  isLoading: boolean;
  isEmpty: boolean;
  className?: string;
}

export const WorkPriorityQueueCard: React.FC<WorkPriorityQueueCardProps> = ({
  sections,
  isLoading,
  isEmpty,
  className = ''
}) => {
  return (
    <DashboardCard
      title="Priority Work Queue"
      icon={<AlertCircle size={15} aria-hidden="true" />}
      scroll
      className={`work-tab__cell work-tab__cell--scroll ${className}`.trim()}
      ariaLabel="Priority work queue"
    >
      <WorkScrollBody
        isLoading={isLoading}
        isEmpty={isEmpty}
        emptyLabel="No priority items right now."
        loadingLabel="Loading priority queue…"
      >
        <div className="work-scroll-list work-scroll-list--queue" aria-label="Grouped priority tasks">
          {sections.map((section) =>
            section.items.length > 0 ? (
              <section
                key={section.id}
                className={`emp-dash-queue-group emp-dash-queue-group--${section.id}`}
              >
                <h4 className="emp-dash-queue-group__title">{section.title}</h4>
                <ul className="emp-dash-queue-group__list">
                  {section.items.map((item) => (
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
      </WorkScrollBody>
    </DashboardCard>
  );
};
