import React from 'react';
import { ProductivityDeptPanel } from './widgets/productivity-dept-panel';
import { ProductivitySummaryPanel } from './widgets/productivity-summary-panel';
import { ProductivityTimeDistributionPanel } from './widgets/productivity-time-distribution-panel';
import { ProductivityWeeklyTrendPanel } from './widgets/productivity-weekly-trend-panel';

export const CeoProductivityDashboard: React.FC = () => {
  return (
    <div className="ceo-productivity-overview" aria-label="Productivity score">
      <ProductivitySummaryPanel />
      <ProductivityDeptPanel />
      <ProductivityWeeklyTrendPanel />
      <ProductivityTimeDistributionPanel />
    </div>
  );
};
