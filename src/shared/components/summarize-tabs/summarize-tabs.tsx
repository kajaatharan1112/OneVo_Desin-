import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderOpen,
  CircleDollarSign,
  Inbox,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  TrendingUp,
  LayoutGrid,
  Clock
} from 'lucide-react';
import { getSummaryCardsForView } from '../../../core/summary/summary-cards';
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

const defaultCardForView = (view: 'employee' | 'tenant'): SummaryCardId | null =>
  view === 'employee' ? 'task-overview' : 'today-productivity';

export const SummarizeTabs: React.FC<SummarizeTabsProps> = ({
  currentView,
  onNavigateTab
}) => {
  const cards = useMemo(() => getSummaryCardsForView(currentView), [currentView]);
  const [selectedId, setSelectedId] = useState<SummaryCardId | null>(() =>
    defaultCardForView(currentView)
  );
  const isEmployeeView = currentView === 'employee';

  useEffect(() => {
    setSelectedId(defaultCardForView(currentView));
  }, [currentView]);

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const handleCardClick = (card: SummaryCardData) => {
    setSelectedId(card.id);
  };

  const isTaskOverviewOpen = isEmployeeView && selectedId === 'task-overview';
  const isRequestsApprovalOpen = isEmployeeView && selectedId === 'requests-approval';
  const isActivityOpen = isEmployeeView && selectedId === 'activity';
  const isMyCalendarOpen = isEmployeeView && selectedId === 'my-calendar';
  const isTenantProductivityOpen =
    currentView === 'tenant' && selectedId === 'today-productivity';

  return (
    <div
      className={`summarize-tabs-root${isTaskOverviewOpen ? ' summarize-tabs-root--task-overview' : ''}${isRequestsApprovalOpen ? ' summarize-tabs-root--requests-approval' : ''}${isActivityOpen ? ' summarize-tabs-root--activity' : ''}${isMyCalendarOpen ? ' summarize-tabs-root--my-calendar' : ''}${isTenantProductivityOpen ? ' summarize-tabs-root--tenant-productivity' : ''}`}
    >
      <section
        className="summarize-tabs"
        role="tablist"
        aria-label={isEmployeeView ? 'Employee dashboard tabs' : 'Summary metrics'}
      >
        {cards.map((card) => {
          const isActive = selectedId === card.id;

          return (
            <button
              key={card.id}
              type="button"
              role="tab"
              id={`dashboard-tab-${card.id}`}
              aria-controls={`dashboard-tabpanel-${card.id}`}
              aria-selected={isActive}
              className={`summary-card${isActive ? ' summary-card--active' : ''}`}
              onClick={() => handleCardClick(card)}
              aria-label={`${card.title}: ${card.value}. ${card.desc}`}
              style={{ borderColor: isActive ? card.color : undefined }}
            >
              <div className="summary-card__body">
                <span className="summary-card__title">{card.title}</span>
                <span className="summary-card__subtitle">{card.desc}</span>
                <span className="summary-card__value">{card.value}</span>
              </div>

              <div
                className="summary-card__icon"
                style={{
                  backgroundColor: `color-mix(in srgb, ${card.color} 12%, transparent)`,
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
