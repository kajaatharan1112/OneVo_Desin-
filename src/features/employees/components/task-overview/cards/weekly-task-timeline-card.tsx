import React, { Suspense } from 'react';
import { BarChart3 } from 'lucide-react';
import type { WeeklyTaskDay } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const WeeklyTaskTimelineChart = React.lazy(() =>
  import('../charts/weekly-task-timeline-chart').then((module) => ({
    default: module.WeeklyTaskTimelineChart
  }))
);

interface WeeklyTaskTimelineCardProps {
  days: WeeklyTaskDay[];
  className?: string;
}

export const WeeklyTaskTimelineCard: React.FC<WeeklyTaskTimelineCardProps> = ({
  days,
  className
}) => {
  return (
    <DashboardCard
      className={className}
      variant="chart"
      title="Weekly Task Timeline"
      icon={<BarChart3 size={15} aria-hidden="true" />}
      ariaLabel="Weekly task timeline"
    >
      <Suspense fallback={<div className="emp-dash-chart-skeleton emp-dash-chart-skeleton--wide" aria-hidden="true" />}>
        <WeeklyTaskTimelineChart days={days} />
      </Suspense>
    </DashboardCard>
  );
};
