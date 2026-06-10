import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderOpen,
  CircleDollarSign,
  Inbox,
  LayoutDashboard,
  ClipboardCheck,
  CalendarClock,
  Target,
  TrendingUp,
  Users,
  Activity,
  FolderKanban
} from 'lucide-react';
import {
  getSummaryCardsForView,
  isCeoSummaryCardId
} from '../../../core/summary/summary-cards';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';
import type { EmployeeId } from '../../../features/employees/types/employee.types';
import type { SummaryCardData, SummaryCardId } from '../../types/summary-card.types';
import { SummaryCardContent } from '../summary-card-content/summary-card-content';

interface SummarizeTabsProps {
  currentView: 'employee' | 'tenant';
  onNavigateTab?: (tab: string) => void;
}

function getCardIcon(id: SummaryCardId): React.ReactNode {
  const iconProps = { size: 16, strokeWidth: 2.2, 'aria-hidden': true as const };

  switch (id) {
    case 'task-overview':
      return <LayoutDashboard {...iconProps} />;
    case 'requests-approval':
      return <ClipboardCheck {...iconProps} />;
    case 'activity':
      return <CalendarClock {...iconProps} />;
    case 'goals':
      return <Target {...iconProps} />;
    case 'workforce-availability':
      return <Users {...iconProps} />;
    case 'company-performance':
      return <Activity {...iconProps} />;
    case 'project-health':
      return <FolderKanban {...iconProps} />;
    case 'productivity-score':
      return <TrendingUp {...iconProps} />;
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

  return employeeId === 'marcus' ? 'workforce-availability' : 'task-overview';
}

function getCeoExpandClass(selectedId: SummaryCardId | null): string {
  switch (selectedId) {
    case 'workforce-availability':
      return ' summarize-tabs-root--ceo-workforce';
    case 'company-performance':
      return ' summarize-tabs-root--ceo-performance';
    case 'project-health':
      return ' summarize-tabs-root--ceo-project';
    case 'productivity-score':
      return ' summarize-tabs-root--ceo-productivity';
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

  useEffect(() => {
    setSelectedId(defaultCardForContext(currentView, selectedEmployeeId));
  }, [currentView, selectedEmployeeId]);

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const handleCardClick = (card: SummaryCardData) => {
    setSelectedId((prev) => (prev === card.id ? null : card.id));
  };

  const isTaskOverviewOpen =
    currentView === 'employee' && !isCeoView && selectedId === 'task-overview';
  const isGoalsOverviewOpen =
    currentView === 'employee' && !isCeoView && selectedId === 'goals';
  const isTenantProductivityOpen =
    currentView === 'tenant' && selectedId === 'today-productivity';
  const isCeoPanelOpen =
    currentView === 'employee' && isCeoView && selectedId !== null && isCeoSummaryCardId(selectedId);

  return (
    <div
      className={`summarize-tabs-root${isCeoView ? ' summarize-tabs-root--ceo' : ''}${isTaskOverviewOpen ? ' summarize-tabs-root--task-overview' : ''}${isGoalsOverviewOpen ? ' summarize-tabs-root--goals-overview' : ''}${isTenantProductivityOpen ? ' summarize-tabs-root--tenant-productivity' : ''}${isCeoPanelOpen ? getCeoExpandClass(selectedId) : ''}`}
    >
      <section
        className={`summarize-tabs${isCeoView ? ' summarize-tabs--ceo' : ''}`}
        aria-label="Summary metrics"
      >
        {cards.map((card) => {
          const isActive = selectedId === card.id;
          const isCeoCard = card.variant === 'ceo';

          return (
            <button
              key={card.id}
              type="button"
              className={`summary-card${isActive ? ' summary-card--active' : ''}${isCeoCard ? ' summary-card--ceo' : ''}`}
              data-summary-card-id={card.id}
              onClick={() => handleCardClick(card)}
              aria-pressed={isActive}
              aria-label={
                isCeoCard
                  ? `${card.title}. ${card.desc}`
                  : `${card.title}: ${card.value}. ${card.desc}`
              }
              style={{ borderColor: isActive && !isCeoCard ? card.color : undefined }}
            >
              <div className="summary-card__body">
                <span className="summary-card__title">{card.title}</span>
                {!isCeoCard ? (
                  <span className="summary-card__value">{card.value}</span>
                ) : null}
                <span className="summary-card__desc">{card.desc}</span>
              </div>

              <div
                className={`summary-card__icon${isCeoCard ? ' summary-card__icon--ceo' : ''}`}
                style={{
                  backgroundColor: `color-mix(in srgb, ${card.color} 14%, transparent)`,
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

      {selectedCard && (
        <SummaryCardContent
          card={selectedCard}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
