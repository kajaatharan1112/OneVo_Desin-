import React from 'react';
import { SummarizeTabs } from '../../../../shared/components/summarize-tabs/summarize-tabs';

interface EmployeeDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigateTab }) => {
  return (
    <div className="dashboard-page dashboard-page--employee-overview">
      <SummarizeTabs currentView="employee" onNavigateTab={onNavigateTab} />
    </div>
  );
};
