import React from 'react';
import {
  onSiteWorkforce,
  remoteWorkforce
} from '../../data/tenant-today-productivity.data';
import { MeetingSchedulePanel } from './widgets/meeting-schedule-panel';
import { PendingRequestsPanel } from './widgets/pending-requests-panel';
import { TenantModuleNotificationsBar } from './widgets/tenant-module-notifications-bar';
import { TenantTodayAlertsPanel } from './widgets/tenant-today-alerts-panel';
import { TodayGoalsPanel } from './widgets/today-goals-panel';
import { WorkforcePanel } from './widgets/workforce-panel';
import { TotalEmployeeAttendancePanel } from './widgets/total-employee-attendance-panel';

export const TenantTodayProductivityDashboard: React.FC = () => {
  return (
    <div className="tenant-today-productivity" aria-label="Today productivity dashboard">
      <WorkforcePanel variant="onsite" metrics={onSiteWorkforce} />
      <WorkforcePanel variant="remote" metrics={remoteWorkforce} />
      <TotalEmployeeAttendancePanel />
      <TenantTodayAlertsPanel />
      <TenantModuleNotificationsBar />
      <MeetingSchedulePanel />
      <PendingRequestsPanel />
      <TodayGoalsPanel />
    </div>
  );
};
