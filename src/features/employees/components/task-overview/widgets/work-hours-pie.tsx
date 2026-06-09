import React from 'react';
import { Clock } from 'lucide-react';
import { useEmployeeData } from '../../../hooks/use-employee-data';
import { ActivityRingChart } from './activity-ring-chart';

export const WorkHoursPie: React.FC = () => {
  const { taskOverviewMetrics, workWeekDaysRemaining } = useEmployeeData();
  const { targetWorkHours, completedWorkHours } = taskOverviewMetrics;
  const percent = (completedWorkHours / targetWorkHours) * 100;
  const daysRemaining = workWeekDaysRemaining;
  const weekDaysLabel =
    daysRemaining === 1 ? '1 day more' : `${daysRemaining} days more`;

  return (
    <article className="eto-widget eto-pie eto-cell--work">
      <header className="eto-widget__head">
        <Clock size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Work hours</h3>
        <span className="eto-widget__tab">{weekDaysLabel}</span>
      </header>
      <div className="eto-pie__chart">
        <ActivityRingChart
          percent={percent}
          centerLabel={`of ${targetWorkHours}h`}
          centerValue={`${completedWorkHours}h`}
          caption={`${completedWorkHours}h completed`}
        />
      </div>
    </article>
  );
};
