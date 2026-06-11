import React, { Suspense } from 'react';
import { Clock } from 'lucide-react';
import type { WorkHoursBreakdown } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const WorkHoursDonutChart = React.lazy(() =>
  import('../charts/work-hours-donut-chart').then((module) => ({
    default: module.WorkHoursDonutChart
  }))
);

interface WorkHoursDonutCardProps {
  breakdown: WorkHoursBreakdown;
  percent: number;
  className?: string;
}

export const WorkHoursDonutCard: React.FC<WorkHoursDonutCardProps> = ({
  breakdown,
  percent,
  className
}) => {
  return (
    <DashboardCard
      className={className}
      variant="chart"
      title="Work hours"
      icon={<Clock size={15} aria-hidden="true" />}
      ariaLabel="Work hours and focus hours"
    >
      <Suspense fallback={<div className="emp-dash-chart-skeleton" aria-hidden="true" />}>
        <WorkHoursDonutChart breakdown={breakdown} percent={percent} />
      </Suspense>
    </DashboardCard>
  );
};
