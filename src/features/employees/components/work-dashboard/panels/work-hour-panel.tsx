import React from 'react';
import type { WorkDashboardHourMetric } from '../../../data/work-dashboard.data';
import { WorkDashboardDonut } from '../work-dashboard-donut';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface WorkHourPanelProps {
  data: WorkDashboardHourMetric;
}

export const WorkHourPanel: React.FC<WorkHourPanelProps> = ({ data }) => (
  <WorkDashboardPanel title="Work hours" className="work-dashboard__work-hour">
    <WorkDashboardDonut
      actual={data.actual}
      target={data.target}
      centerPrimary={`${data.actual}h`}
      centerSecondary="Total clock in"
      centerTertiary={`Weekly Target ${data.target}h`}
      ariaLabel={`Work hours: ${data.actual}h total clock in this week of ${data.target}h weekly target`}
    />
  </WorkDashboardPanel>
);
