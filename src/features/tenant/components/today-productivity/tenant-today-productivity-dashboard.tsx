import React from 'react';
import { TotalEmployeeAttendancePanel } from './widgets/total-employee-attendance-panel';
import { ExecutiveHealthPanel } from './widgets/executive-health-panel';
import { PendingRequestsPanel } from './widgets/pending-requests-panel';

export const TenantTodayProductivityDashboard: React.FC = () => {
  return (
    <section className="ceo-operations" aria-label="Operations overview">
      <TotalEmployeeAttendancePanel />
      <ExecutiveHealthPanel />
      <PendingRequestsPanel />
    </section>
  );
};
