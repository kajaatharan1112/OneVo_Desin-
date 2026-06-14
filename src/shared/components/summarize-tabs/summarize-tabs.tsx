import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderOpen,
  CircleDollarSign,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ClipboardList,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Activity,
  ListChecks
} from 'lucide-react';
import {
  getSummaryCardsForView,
  isCeoSummaryCardId
} from '../../../core/summary/summary-cards';
import { EMPLOYEE_DASHBOARD_EMPTY, WORK_DASHBOARD_ENABLED } from '../../../features/employees/config/employee-dashboard.config';
import { workDashboardSummary } from '../../../features/employees/data/work-dashboard.data';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';
import type { EmployeeId } from '../../../features/employees/types/employee.types';
import type { SummaryCardData, SummaryCardId } from '../../types/summary-card.types';
import { SummaryCardContent } from '../summary-card-content/summary-card-content';

interface SummarizeTabsProps {
  currentView: 'employee' | 'tenant';
  onNavigateTab?: (tab: string) => void;
}

function getCardIcon(id: SummaryCardId): React.ReactNode {
  const iconProps = { size: 22, strokeWidth: 2, 'aria-hidden': true as const };

  switch (id) {
    case 'task-overview':
      return <LayoutGrid {...iconProps} />;
    case 'requests-approval':
      return <ClipboardList {...iconProps} />;
    case 'activity':
      return <Clock {...iconProps} />;
    case 'my-calendar':
      return <Calendar {...iconProps} />;
    case 'workforce-availability':
      return <Users {...iconProps} />;
    case 'company-performance':
      return <Activity {...iconProps} />;
    case 'productivity':
      return <TrendingUp {...iconProps} />;
    case 'my-priorities':
      return <ListChecks {...iconProps} />;
    case 'today-productivity':
      return <TrendingUp {...iconProps} />;
    case 'ongoing-projects':
      return <FolderOpen {...iconProps} />;
    case 'total-revenue':
      return <CircleDollarSign {...iconProps} />;
    case 'open-requests':
      return <Inbox {...iconProps} />;
    default:
      return <LayoutDashboard {...iconProps} />;
  }
}

function defaultCardForContext(
  view: 'employee' | 'tenant',
  employeeId: EmployeeId
): SummaryCardId | null {
  if (view === 'tenant') {
    return 'today-productivity';
  }

  return employeeId === 'marcus' ? 'my-priorities' : 'task-overview';
}

function getCeoExpandClass(selectedId: SummaryCardId | null): string {
  switch (selectedId) {
    case 'workforce-availability':
      return ' summarize-tabs-root--ceo-workforce';
    case 'company-performance':
      return ' summarize-tabs-root--ceo-performance';
    case 'productivity':
      return ' summarize-tabs-root--ceo-productivity';
    case 'my-priorities':
      return ' summarize-tabs-root--ceo-priorities';
    case 'project-health':
      return ' summarize-tabs-root--ceo-project';
    case 'schedule':
      return ' summarize-tabs-root--ceo-schedule';
    default:
      return '';
  }
}

export const SummarizeTabs: React.FC<SummarizeTabsProps> = ({
  currentView,
  onNavigateTab
}) => {
  const { selectedEmployeeId } = useEmployeeContext();
  const isCeoView = currentView === 'employee' && selectedEmployeeId === 'marcus';
  const cards = useMemo(
    () => getSummaryCardsForView(currentView, selectedEmployeeId),
    [currentView, selectedEmployeeId]
  );
  const [selectedId, setSelectedId] = useState<SummaryCardId | null>(() =>
    defaultCardForContext(currentView, selectedEmployeeId)
  );
  const isEmployeeView = currentView === 'employee';

  useEffect(() => {
    setSelectedId(defaultCardForContext(currentView, selectedEmployeeId));
  }, [currentView, selectedEmployeeId]);

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const handleCardClick = (card: SummaryCardData) => {
    setSelectedId(card.id);
  };

  const isTaskOverviewOpen =
    WORK_DASHBOARD_ENABLED &&
    isEmployeeView &&
    !isCeoView &&
    selectedId === 'task-overview';
  const isRequestsApprovalOpen =
    !EMPLOYEE_DASHBOARD_EMPTY && isEmployeeView && !isCeoView && selectedId === 'requests-approval';
  const isActivityOpen =
    !EMPLOYEE_DASHBOARD_EMPTY && isEmployeeView && !isCeoView && selectedId === 'activity';
  const isMyCalendarOpen =
    !EMPLOYEE_DASHBOARD_EMPTY && isEmployeeView && !isCeoView && selectedId === 'my-calendar';
  const isTenantProductivityOpen =
    currentView === 'tenant' && selectedId === 'today-productivity';
  const isCeoPanelOpen =
    !EMPLOYEE_DASHBOARD_EMPTY &&
    isEmployeeView &&
    isCeoView &&
    selectedId !== null &&
    isCeoSummaryCardId(selectedId);

  return (
    <div
      className={`summarize-tabs-root${isCeoView ? ' summarize-tabs-root--ceo' : ''}${isTaskOverviewOpen ? ' summarize-tabs-root--task-overview' : ''}${isRequestsApprovalOpen ? ' summarize-tabs-root--requests-approval' : ''}${isActivityOpen ? ' summarize-tabs-root--activity' : ''}${isMyCalendarOpen ? ' summarize-tabs-root--my-calendar' : ''}${isTenantProductivityOpen ? ' summarize-tabs-root--tenant-productivity' : ''}${isCeoPanelOpen ? getCeoExpandClass(selectedId) : ''}`}
    >
      <section
        className={`summarize-tabs${isCeoView ? ' summarize-tabs--ceo' : ''}`}
        role="tablist"
        aria-label={isEmployeeView ? 'Employee dashboard tabs' : 'Summary metrics'}
      >
        {cards.map((card) => {
          const isActive = selectedId === card.id;
          const isCeoCard = card.variant === 'ceo';

          return (
            <button
              key={card.id}
              type="button"
              role="tab"
              id={`dashboard-tab-${card.id}`}
              aria-controls={`dashboard-tabpanel-${card.id}`}
              aria-selected={isActive}
              className={`summary-card${isActive ? ' summary-card--active' : ''}${isCeoCard ? ' summary-card--ceo' : ''}${card.id === 'task-overview' && WORK_DASHBOARD_ENABLED ? ' summary-card--work-tab' : ''}`}
              data-summary-card-id={card.id}
              onClick={() => handleCardClick(card)}
              aria-label={isCeoCard ? `${card.title}. ${card.desc}` : `${card.title}: ${card.value}. ${card.desc}`}
              style={{ borderColor: isActive ? card.color : undefined }}
            >
              <div className="summary-card__body">
                <span className="summary-card__title">{card.title}</span>
                {card.id === 'task-overview' && WORK_DASHBOARD_ENABLED ? (
                  <>
                    <span className="summary-card__eyebrow">Today</span>
                    <span className="summary-card__value">{card.value}</span>
                    <span className="summary-card__subtitle">
                      Total / pending tasks · Sprint {workDashboardSummary.sprintCompletedPercent}%
                      complete
                    </span>
                  </>
                ) : isCeoCard ? (
                  <>
                    <span className="summary-card__value">{card.value}</span>
                    <span className="summary-card__subtitle">{card.desc}</span>
                  </>
                ) : (
                  <>
                    <span className="summary-card__subtitle">{card.desc}</span>
                    <span className="summary-card__value">{card.value}</span>
                  </>
                )}
              </div>

              <div
                className={`summary-card__icon${isCeoCard ? ' summary-card__icon--ceo' : ''}`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${card.color} ${isCeoCard ? '14%' : '12%'}, transparent)`,
                  color: card.color
                }}
                aria-hidden="true"
              >
                {getCardIcon(card.id)}
              </div>
            </button>
          );
        })}
      </section>

      {selectedCard ? (
        <SummaryCardContent
          card={selectedCard}
          onNavigateTab={onNavigateTab}
          tabId={`dashboard-tabpanel-${selectedCard.id}`}
          labelledBy={`dashboard-tab-${selectedCard.id}`}
        />
      ) : null}
    </div>
  );
};
