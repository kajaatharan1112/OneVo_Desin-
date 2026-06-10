import React from 'react';
import { ProjectDeliveryTrendPanel } from './widgets/project-delivery-trend-panel';
import { ProjectFocusPanel } from './widgets/project-focus-panel';
import { ProjectProgressPanel } from './widgets/project-progress-panel';
import { ProjectStatusPanel } from './widgets/project-status-panel';
import { ProjectSummaryPanel } from './widgets/project-summary-panel';

export const CeoProjectHealthDashboard: React.FC = () => {
  return (
    <div className="ceo-projects-overview" aria-label="Project health">
      <ProjectSummaryPanel />
      <ProjectStatusPanel />
      <ProjectDeliveryTrendPanel />
      <ProjectProgressPanel />
      <ProjectFocusPanel />
    </div>
  );
};
