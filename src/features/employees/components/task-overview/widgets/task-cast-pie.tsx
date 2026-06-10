import React from 'react';
import { PieChart } from 'lucide-react';
import { employeeTaskOverviewMetrics } from '../../../data/employee-task-overview.data';
import { ActivityRingChart } from './activity-ring-chart';

export const TaskCastPie: React.FC = () => {
  const { targetTasks, completedTasks } = employeeTaskOverviewMetrics;
  const percent = (completedTasks / targetTasks) * 100;

  return (
    <article className="eto-widget eto-pie eto-cell--cast">
      <header className="eto-widget__head">
        <PieChart size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Task cast</h3>
      </header>
      <div className="eto-pie__chart">
        <ActivityRingChart
          percent={percent}
          centerLabel="total planned"
          centerValue={`${targetTasks}`}
          caption={`${completedTasks} of ${targetTasks} tasks completed`}
        />
      </div>
    </article>
  );
};
