import React from 'react';
import { WorkforceDepartmentAttendance } from './widgets/workforce-department-attendance';
import { WorkforceLeaveBreakdown } from './widgets/workforce-leave-breakdown';
import { WorkforceLocationAvailabilityPanel } from './widgets/workforce-location-availability-panel';
import { WorkforceWeeklyTrendChart } from './widgets/workforce-weekly-trend-chart';

export const CeoWorkforceDashboard: React.FC = () => {
  return (
    <div className="ceo-workforce-overview" aria-label="Workforce availability">
      <WorkforceLocationAvailabilityPanel />
      <WorkforceDepartmentAttendance />
      <WorkforceLeaveBreakdown />
      <WorkforceWeeklyTrendChart />
    </div>
  );
};
