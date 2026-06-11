import React from 'react';
import { TenantKpiRow } from '../../components/today-productivity/widgets/tenant-kpi-row';
import { ManagementAttentionPanel } from '../../components/today-productivity/widgets/management-attention-panel';
import { TenantTodayProductivityDashboard } from '../../components/today-productivity/tenant-today-productivity-dashboard';

export const TenantDashboard: React.FC = () => {
  return (
    <div className="dashboard-page dashboard-page--ceo">
      <header className="ceo-dash-header">
        <div className="ceo-dash-header__titles">
          <h1 className="ceo-dash-header__title">Dashboard</h1>
          <p className="ceo-dash-header__subtitle">Organization Management</p>
        </div>
      </header>

      <TenantKpiRow />
      <ManagementAttentionPanel />
      <TenantTodayProductivityDashboard />
    </div>
  );
};
