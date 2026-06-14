import React from 'react';
import type { WorkDashboardHourMetric } from '../../../data/work-dashboard.data';
import { WorkDashboardDonut } from '../work-dashboard-donut';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface TaskHourPanelProps {
  data: WorkDashboardHourMetric;
}

export const TaskHourPanel: React.FC<TaskHourPanelProps> = ({ data }) => (
  <WorkDashboardPanel title="Task cast" className="work-dashboard__task-hour">
    <WorkDashboardDonut
      actual={data.actual}
      target={data.target}
      centerPrimary={`${data.actual}`}
      centerSecondary={`of ${data.target}`}
      centerTertiary="tasks done"
      ariaLabel={`Task hours: ${data.actual} finished of ${data.target} assigned`}
    />
  </WorkDashboardPanel>
);
