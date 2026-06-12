import React from 'react';
import { WorkforceAttendanceHealthPanel } from './widgets/workforce-attendance-health-panel';
import { WorkforceRiskLeavePanel } from './widgets/workforce-risk-leave-panel';
import { WorkforceSeriousActionsPanel } from './widgets/workforce-serious-actions-panel';
import { WorkforceWeeklyTrendChart } from './widgets/workforce-weekly-trend-chart';

export const CeoWorkforceDashboard: React.FC = () => {
  return (
    <div
      className="ceo-workforce-overview"
      aria-label="Workforce Attendance & Leave Command View"
    >
      <WorkforceAttendanceHealthPanel />
      <WorkforceSeriousActionsPanel />
      <WorkforceRiskLeavePanel />
      <WorkforceWeeklyTrendChart />
    </div>
  );
};
