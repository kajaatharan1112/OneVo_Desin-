import React from 'react';
import { TenantTodayProductivityDashboard } from '../../components/today-productivity/tenant-today-productivity-dashboard';

export const TenantDashboard: React.FC = () => (
  <div className="dashboard-page dashboard-page--tenant-overview">
    <TenantTodayProductivityDashboard />
  </div>
);
