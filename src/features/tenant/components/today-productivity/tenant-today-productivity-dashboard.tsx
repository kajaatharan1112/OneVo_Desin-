import React from 'react';
import { onSiteWorkforce, remoteWorkforce } from '../../data/tenant-today-productivity.data';
import { MeetingSchedulePanel } from './widgets/meeting-schedule-panel';
import { TenantModuleNotificationsBar } from './widgets/tenant-module-notifications-bar';
import { TenantPendingRequestsTtoPanel } from './widgets/tenant-pending-requests-tto-panel';
import { TenantTodayAlertsPanel } from './widgets/tenant-today-alerts-panel';
import { TodayGoalsPanel } from './widgets/today-goals-panel';
import { TotalEmployeeAttendanceTtoPanel } from './widgets/total-employee-attendance-tto-panel';
import { WorkforcePanel } from './widgets/workforce-panel';

export const TenantTodayProductivityDashboard: React.FC = () => (
  <section className="tenant-today-productivity" aria-label="Executive dashboard overview">
    <TotalEmployeeAttendanceTtoPanel />
    <WorkforcePanel variant="onsite" metrics={onSiteWorkforce} />
    <WorkforcePanel variant="remote" metrics={remoteWorkforce} />
    <TenantTodayAlertsPanel />
    <TenantModuleNotificationsBar />
    <MeetingSchedulePanel />
    <TenantPendingRequestsTtoPanel />
    <TodayGoalsPanel />
  </section>
);
