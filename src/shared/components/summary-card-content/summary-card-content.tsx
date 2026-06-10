import React from 'react';
import { CeoPerformanceDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-performance-dashboard';
import { CeoProductivityDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-productivity-dashboard';
import { CeoProjectHealthDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-project-health-dashboard';
import { CeoWorkforceDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-workforce-dashboard';
import { EmployeeGoalsDashboard } from '../../../features/employees/components/goals-overview/employee-goals-dashboard';
import { EmployeeTaskOverviewDashboard } from '../../../features/employees/components/task-overview/employee-task-overview-dashboard';
import {
  TodayProductivityDetail,
  WeeklyProductivityDetail,
  MonthlyReviewDetail,
  AnnualAnalyticsDetail
} from '../../../features/tenant/components/today-productivity';
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
  const isWeeklyProductivity = card.id === 'ongoing-projects';
  const isMonthlyReview = card.id === 'total-revenue';
  const isAnnualAnalytics = card.id === 'open-requests';
  const isWorkforce = card.id === 'workforce-availability';
  const isPerformance = card.id === 'company-performance';
  const isProjectHealth = card.id === 'project-health';
  const isProductivity = card.id === 'productivity-score';
  const isTenantFilled =
    isTenantProductivity || isWeeklyProductivity || isMonthlyReview || isAnnualAnalytics;
  const isCeoFilled = isWorkforce || isPerformance || isProjectHealth || isProductivity;
  const isFilledOverview =
    isTaskOverview ||
    isGoalsOverview ||
    isTenantFilled ||
    isCeoFilled;

  return (
    <section
      className={`summary-card-content${isFilledOverview ? ' summary-card-content--filled' : ''}${isGoalsOverview ? ' summary-card-content--goals-filled' : ''}${isTenantFilled ? ' summary-card-content--tenant-filled' : ''}${isCeoFilled ? ' summary-card-content--ceo-filled' : ''}`}
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
        {isTenantProductivity ? <TodayProductivityDetail /> : null}
        {isWeeklyProductivity ? <WeeklyProductivityDetail /> : null}
        {isMonthlyReview ? <MonthlyReviewDetail /> : null}
        {isAnnualAnalytics ? <AnnualAnalyticsDetail /> : null}
        {isWorkforce ? <CeoWorkforceDashboard /> : null}
        {isPerformance ? <CeoPerformanceDashboard /> : null}
        {isProjectHealth ? <CeoProjectHealthDashboard /> : null}
        {isProductivity ? <CeoProductivityDashboard /> : null}
      </div>
    </section>
  );
};
