import React from 'react';
import { ProductivityAlertsPanel } from './widgets/productivity-alerts-panel';
import { ProductivityCompanyPanel } from './widgets/productivity-company-panel';
import { ProductivityDeptPanel } from './widgets/productivity-dept-panel';
import { ProductivityProjectContributionPanel } from './widgets/productivity-project-contribution-panel';
import { ProductivityWeeklyBarPanel } from './widgets/productivity-weekly-bar-panel';

export const CeoProductivityDashboard: React.FC = () => {
  return (
    <div className="ceo-productivity-overview" aria-label="Productivity & Delivery">
      <ProductivityCompanyPanel />
      <ProductivityWeeklyBarPanel />
      <ProductivityDeptPanel />
      <ProductivityProjectContributionPanel />
      <ProductivityAlertsPanel />
    </div>
  );
};
