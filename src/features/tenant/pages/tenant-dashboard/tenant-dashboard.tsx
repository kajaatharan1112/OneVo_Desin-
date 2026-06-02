import React from 'react';
import { SummarizeTabs } from '../../../../shared/components/summarize-tabs/summarize-tabs';

export const TenantDashboard: React.FC = () => {
  return (
    <div className="dashboard-page dashboard-page--tenant-overview">
      <SummarizeTabs currentView="tenant" />
    </div>
  );
};
