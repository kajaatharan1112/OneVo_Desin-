import React from 'react';
import { PerformanceDepartmentsPanel } from './widgets/performance-areas-panel';
import { PerformanceDriversPanel } from './widgets/performance-drivers-panel';
import { PerformanceSummaryPanel } from './widgets/performance-summary-panel';
import { PerformanceTrendPanel } from './widgets/performance-trend-panel';
import { PerformanceWatchPanel } from './widgets/performance-watch-panel';

export const CeoPerformanceDashboard: React.FC = () => (
  <div className="ceo-performance-canvas">
    <div className="ceo-performance-overview" aria-label="Company performance">
      <div className="cpg-row cpg-row--top">
        <PerformanceSummaryPanel />
        <PerformanceDriversPanel />
        <PerformanceTrendPanel />
      </div>
      <div className="cpg-row cpg-row--bottom">
        <PerformanceDepartmentsPanel />
        <PerformanceWatchPanel />
      </div>
    </div>
  </div>
);
