import React from 'react';
import { CeoPrioritiesDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-priorities-dashboard';
import { CeoPerformanceDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-performance-dashboard';
import { CeoProductivityDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-productivity-dashboard';
import { CeoProjectHealthDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-project-health-dashboard';
import { CeoScheduleDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-schedule-dashboard';
import { CeoWorkforceDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-workforce-dashboard';
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
  const isWorkforce = card.id === 'workforce-availability';
  const isPerformance = card.id === 'company-performance';
  const isProductivity = card.id === 'productivity';
  const isMyPriorities = card.id === 'my-priorities';
  const isProjectHealth = card.id === 'project-health';
  const isSchedule = card.id === 'schedule';
  const isFilledOverview =
    isTaskOverview ||
    isGoalsOverview ||
    isTenantProductivity ||
    isWorkforce ||
    isPerformance ||
    isProductivity ||
    isMyPriorities ||
    isProjectHealth ||
    isSchedule;

  return (
    <section
      className={`summary-card-content${isFilledOverview ? ' summary-card-content--filled' : ''}${isGoalsOverview ? ' summary-card-content--goals-filled' : ''}${isTenantProductivity ? ' summary-card-content--tenant-filled' : ''}${isWorkforce || isPerformance || isProductivity || isMyPriorities || isProjectHealth || isSchedule ? ' summary-card-content--ceo-filled' : ''}`}
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
        {isWorkforce ? <CeoWorkforceDashboard /> : null}
        {isPerformance ? <CeoPerformanceDashboard /> : null}
        {isProductivity ? <CeoProductivityDashboard /> : null}
        {isMyPriorities ? <CeoPrioritiesDashboard /> : null}
        {isProjectHealth ? <CeoProjectHealthDashboard /> : null}
        {isSchedule ? <CeoScheduleDashboard /> : null}
      </div>
    </section>
  );
};
