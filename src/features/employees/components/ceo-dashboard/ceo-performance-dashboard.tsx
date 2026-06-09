import React from 'react';
import { PerformanceBreakdownPanel } from './widgets/performance-breakdown-panel';
import { PerformanceDeptPanel } from './widgets/performance-dept-panel';
import { PerformanceSummaryPanel } from './widgets/performance-summary-panel';
import { PerformanceTrendPanel } from './widgets/performance-trend-panel';

export const CeoPerformanceDashboard: React.FC = () => (
  <div className="ceo-performance-overview" aria-label="Company performance">
    <PerformanceSummaryPanel />
    <PerformanceBreakdownPanel />
    <PerformanceTrendPanel />
    <PerformanceDeptPanel />
  </div>
);
