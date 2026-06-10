import React from 'react';
import { EmployeeGoalsDashboard } from '../../../features/employees/components/goals-overview/employee-goals-dashboard';
import { EmployeeTaskOverviewDashboard } from '../../../features/employees/components/task-overview/employee-task-overview-dashboard';
import { TenantTodayProductivityDashboard } from '../../../features/tenant/components/today-productivity/tenant-today-productivity-dashboard';
import type { SummaryCardData } from '../../types/summary-card.types';

interface SummaryCardContentProps {
  card: SummaryCardData;
  onNavigateTab?: (tab: string) => void;
}

export const SummaryCardContent: React.FC<SummaryCardContentProps> = ({
  card,
  onNavigateTab
}) => {
  const isTaskOverview = card.id === 'task-overview';
  const isGoalsOverview = card.id === 'goals';
  const isTenantProductivity = card.id === 'today-productivity';
  const isFilledOverview = isTaskOverview || isGoalsOverview || isTenantProductivity;

  return (
    <section
      className={`summary-card-content${isFilledOverview ? ' summary-card-content--filled' : ''}${isGoalsOverview ? ' summary-card-content--goals-filled' : ''}${isTenantProductivity ? ' summary-card-content--tenant-filled' : ''}`}
      aria-label={`${card.title} details`}
      data-summary-card={card.id}
    >
      <div className="summary-card-content__inner">
        {isTaskOverview ? (
          <EmployeeTaskOverviewDashboard
            onNavigateToTasks={() => onNavigateTab?.('Workspace')}
          />
        ) : null}
        {isGoalsOverview ? <EmployeeGoalsDashboard /> : null}
        {isTenantProductivity ? <TenantTodayProductivityDashboard /> : null}
      </div>
    </section>
  );
};
