import React, { Suspense } from 'react';
import { CeoPrioritiesDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-priorities-dashboard';
import { CeoPerformanceDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-performance-dashboard';
import { CeoProductivityDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-productivity-dashboard';
import { CeoProjectHealthDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-project-health-dashboard';
import { CeoScheduleDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-schedule-dashboard';
import { CeoWorkforceDashboard } from '../../../features/employees/components/ceo-dashboard/ceo-workforce-dashboard';
import { DashboardTabPlaceholder } from '../../../features/employees/components/dashboard-tab-placeholder/dashboard-tab-placeholder';
import { EMPLOYEE_DASHBOARD_EMPTY, WORK_DASHBOARD_ENABLED } from '../../../features/employees/config/employee-dashboard.config';
import type { SummaryCardData } from '../../types/summary-card.types';

const EmployeeTaskOverviewDashboard = React.lazy(() =>
  import('../../../features/employees/components/task-overview/employee-task-overview-dashboard').then(
    (module) => ({ default: module.EmployeeTaskOverviewDashboard })
  )
);

const RequestApprovalTab = React.lazy(() =>
  import('../../../features/employees/components/request-approval/request-approval-tab').then(
    (module) => ({ default: module.RequestApprovalTab })
  )
);

const ActivityTab = React.lazy(() =>
  import('../../../features/employees/components/activity/activity-tab').then((module) => ({
    default: module.ActivityTab
  }))
);

const MyCalendarTab = React.lazy(() =>
  import('../../../features/employees/components/my-calendar/my-calendar-tab').then((module) => ({
    default: module.MyCalendarTab
  }))
);

const TenantTodayProductivityDashboard = React.lazy(() =>
  import('../../../features/tenant/components/today-productivity/tenant-today-productivity-dashboard').then(
    (module) => ({ default: module.TenantTodayProductivityDashboard })
  )
);

interface SummaryCardContentProps {
  card: SummaryCardData;
  onNavigateTab?: (tab: string) => void;
  tabId?: string;
  labelledBy?: string;
}

function TabLoadingFallback() {
  return <div className="emp-dash-tab-loading">Loading dashboard…</div>;
}

const EMPLOYEE_TAB_IDS = new Set([
  'task-overview',
  'requests-approval',
  'activity',
  'my-calendar'
]);

export const SummaryCardContent: React.FC<SummaryCardContentProps> = ({
  card,
  onNavigateTab,
  tabId,
  labelledBy
}) => {
  const isTaskOverview = card.id === 'task-overview';
  const isRequestsApproval = card.id === 'requests-approval';
  const isActivity = card.id === 'activity';
  const isMyCalendar = card.id === 'my-calendar';
  const isEmployeeTab = EMPLOYEE_TAB_IDS.has(card.id);
  const isEmployeeTabEmpty =
    EMPLOYEE_DASHBOARD_EMPTY && isEmployeeTab && !(WORK_DASHBOARD_ENABLED && isTaskOverview);

  const isTenantProductivity = card.id === 'today-productivity';
  const isWorkforce = card.id === 'workforce-availability';
  const isPerformance = card.id === 'company-performance';
  const isProductivity = card.id === 'productivity';
  const isMyPriorities = card.id === 'my-priorities';
  const isProjectHealth = card.id === 'project-health';
  const isSchedule = card.id === 'schedule';
  const isCeoPanel =
    isWorkforce || isPerformance || isProductivity || isMyPriorities || isProjectHealth || isSchedule;
  const isCeoTabEmpty = EMPLOYEE_DASHBOARD_EMPTY && isCeoPanel;
  const isTabEmpty = isEmployeeTabEmpty || isCeoTabEmpty;
  const isFilledOverview =
    ((WORK_DASHBOARD_ENABLED && isTaskOverview) || (!EMPLOYEE_DASHBOARD_EMPTY && isEmployeeTab)) ||
    isTenantProductivity ||
    (!EMPLOYEE_DASHBOARD_EMPTY && isCeoPanel);

  return (
    <section
      id={tabId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className={`summary-card-content${isTabEmpty ? ' summary-card-content--empty' : ''}${isFilledOverview ? ' summary-card-content--filled' : ''}${WORK_DASHBOARD_ENABLED && isTaskOverview ? ' summary-card-content--work-filled' : ''}${!EMPLOYEE_DASHBOARD_EMPTY && isTaskOverview ? ' summary-card-content--work-filled' : ''}${!EMPLOYEE_DASHBOARD_EMPTY && isRequestsApproval ? ' summary-card-content--requests-filled' : ''}${!EMPLOYEE_DASHBOARD_EMPTY && isActivity ? ' summary-card-content--activity-filled' : ''}${!EMPLOYEE_DASHBOARD_EMPTY && isMyCalendar ? ' summary-card-content--calendar-filled' : ''}${isTenantProductivity ? ' summary-card-content--tenant-filled' : ''}${!EMPLOYEE_DASHBOARD_EMPTY && isCeoPanel ? ' summary-card-content--ceo-filled' : ''}`}
      aria-label={`${card.title} details`}
      data-summary-card={card.id}
    >
      <div className="summary-card-content__inner">
        {isTabEmpty ? <DashboardTabPlaceholder title={card.title} /> : null}

        {WORK_DASHBOARD_ENABLED && isTaskOverview ? (
          <Suspense fallback={<TabLoadingFallback />}>
            <EmployeeTaskOverviewDashboard
              onNavigateToTasks={() => onNavigateTab?.('Workspace')}
            />
          </Suspense>
        ) : null}

        {!EMPLOYEE_DASHBOARD_EMPTY && !(WORK_DASHBOARD_ENABLED && isTaskOverview) ? (
          <Suspense fallback={<TabLoadingFallback />}>
            {isTaskOverview ? (
              <EmployeeTaskOverviewDashboard
                onNavigateToTasks={() => onNavigateTab?.('Workspace')}
              />
            ) : null}
            {isRequestsApproval ? <RequestApprovalTab /> : null}
            {isActivity ? <ActivityTab /> : null}
            {isMyCalendar ? <MyCalendarTab /> : null}
          </Suspense>
        ) : null}

        {isTenantProductivity ? (
          <Suspense fallback={<TabLoadingFallback />}>
            <TenantTodayProductivityDashboard />
          </Suspense>
        ) : null}

        {!EMPLOYEE_DASHBOARD_EMPTY && isWorkforce ? <CeoWorkforceDashboard /> : null}
        {!EMPLOYEE_DASHBOARD_EMPTY && isPerformance ? <CeoPerformanceDashboard /> : null}
        {!EMPLOYEE_DASHBOARD_EMPTY && isProductivity ? <CeoProductivityDashboard /> : null}
        {!EMPLOYEE_DASHBOARD_EMPTY && isMyPriorities ? <CeoPrioritiesDashboard /> : null}
        {!EMPLOYEE_DASHBOARD_EMPTY && isProjectHealth ? <CeoProjectHealthDashboard /> : null}
        {!EMPLOYEE_DASHBOARD_EMPTY && isSchedule ? <CeoScheduleDashboard /> : null}
      </div>
    </section>
  );
};
