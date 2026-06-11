import React, { Suspense } from 'react';
import { Target } from 'lucide-react';
import type { TaskCompletionMetrics } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const TaskCompletionDonutChart = React.lazy(() =>
  import('../charts/task-completion-donut-chart').then((module) => ({
    default: module.TaskCompletionDonutChart
  }))
);

interface TaskCompletionDonutCardProps {
  metrics: TaskCompletionMetrics;
  percent: number;
  className?: string;
}

export const TaskCompletionDonutCard: React.FC<TaskCompletionDonutCardProps> = ({
  metrics,
  percent,
  className
}) => {
  return (
    <DashboardCard
      className={className}
      variant="chart"
      title="Task cast"
      icon={<Target size={15} aria-hidden="true" />}
      ariaLabel="Task completion"
    >
      <Suspense fallback={<div className="emp-dash-chart-skeleton" aria-hidden="true" />}>
        <TaskCompletionDonutChart metrics={metrics} percent={percent} />
      </Suspense>
    </DashboardCard>
  );
};
