import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { YesterdayStatusItem } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const STATUS_LABELS: Record<YesterdayStatusItem['status'], string> = {
  completed: 'Completed',
  approved: 'Approved',
  cleared: 'Cleared',
  issue: 'Issue'
};

interface YesterdayStatusCardProps {
  items: YesterdayStatusItem[];
  visibleMax: number;
  className?: string;
}

export const YesterdayStatusCard: React.FC<YesterdayStatusCardProps> = ({
  items,
  visibleMax,
  className
}) => {
  const visibleItems = items.slice(0, visibleMax);

  return (
    <DashboardCard
      className={className}
      title="Yesterday Status"
      icon={<CheckCircle2 size={15} aria-hidden="true" />}
      ariaLabel="Yesterday completed work"
    >
      <ul className="emp-dash-scroll emp-dash-scroll--yesterday" aria-label="Recent completed work">
        {visibleItems.map((item) => (
          <li key={item.id} className="emp-dash-yesterday-row">
            <span className="emp-dash-yesterday-row__title">{item.title}</span>
            <span className="emp-dash-yesterday-row__meta">
              <span className={`emp-dash-chip emp-dash-chip--yesterday-${item.status}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <span className="emp-dash-yesterday-row__detail">{item.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
