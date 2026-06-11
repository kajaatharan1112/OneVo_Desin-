import React, { Suspense } from 'react';
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
  const isTenantProductivity = card.id === 'today-productivity';
  const isFilledOverview =
    isTaskOverview || isRequestsApproval || isActivity || isMyCalendar || isTenantProductivity;

  return (
    <section
      id={tabId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className={`summary-card-content${isFilledOverview ? ' summary-card-content--filled' : ''}${isTaskOverview ? ' summary-card-content--work-filled' : ''}${isRequestsApproval ? ' summary-card-content--requests-filled' : ''}${isActivity ? ' summary-card-content--activity-filled' : ''}${isMyCalendar ? ' summary-card-content--calendar-filled' : ''}${isTenantProductivity ? ' summary-card-content--tenant-filled' : ''}`}
      aria-label={`${card.title} details`}
      data-summary-card={card.id}
    >
      <div className="summary-card-content__inner">
        <Suspense fallback={<TabLoadingFallback />}>
          {isTaskOverview ? (
            <EmployeeTaskOverviewDashboard
              onNavigateToTasks={() => onNavigateTab?.('Workspace')}
            />
          ) : null}
          {isRequestsApproval ? <RequestApprovalTab /> : null}
          {isActivity ? <ActivityTab /> : null}
          {isMyCalendar ? <MyCalendarTab /> : null}
          {isTenantProductivity ? <TenantTodayProductivityDashboard /> : null}
        </Suspense>
      </div>
    </section>
  );
};
