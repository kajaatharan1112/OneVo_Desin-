import React from 'react';
import { WorkTab } from './work-tab';

interface EmployeeTaskOverviewDashboardProps {
  onNavigateToTasks?: () => void;
}

/** Employee Work tab — layout shell (see WorkTab). */
export const EmployeeTaskOverviewDashboard: React.FC<EmployeeTaskOverviewDashboardProps> = () => {
  return <WorkTab />;
};
