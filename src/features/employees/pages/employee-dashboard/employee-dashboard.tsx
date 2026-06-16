import React from 'react';
import { TenantTodayProductivityDashboard } from '../../../tenant/components/today-productivity/tenant-today-productivity-dashboard';
import { CEO_OPERATIONS_DASHBOARD_ENABLED } from '../../config/employee-dashboard.config';
import { useEmployeeContext } from '../../context/employee-context';
import { SummarizeTabs } from '../../../../shared/components/summarize-tabs/summarize-tabs';

interface EmployeeDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigateTab }) => {
  const { selectedEmployeeId } = useEmployeeContext();
  const showCeoOperationsDashboard =
    CEO_OPERATIONS_DASHBOARD_ENABLED && selectedEmployeeId === 'marcus';

  return (
    <div
      className={`dashboard-page dashboard-page--employee-overview${showCeoOperationsDashboard ? ' dashboard-page--ceo-operations' : ''}`}
    >
      {showCeoOperationsDashboard ? (
        <TenantTodayProductivityDashboard />
      ) : (
        <SummarizeTabs currentView="employee" onNavigateTab={onNavigateTab} />
      )}
    </div>
  );
};
