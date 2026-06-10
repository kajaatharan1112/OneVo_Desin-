import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderOpen,
  CircleDollarSign,
  Inbox,
  LayoutDashboard,
  ClipboardCheck,
  CalendarClock,
  Target,
  TrendingUp
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
      return <LayoutDashboard {...iconProps} />;
    case 'requests-approval':
      return <ClipboardCheck {...iconProps} />;
    case 'activity':
      return <CalendarClock {...iconProps} />;
    case 'goals':
      return <Target {...iconProps} />;
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

  useEffect(() => {
    setSelectedId(defaultCardForView(currentView));
  }, [currentView]);

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null;

  const handleCardClick = (card: SummaryCardData) => {
    setSelectedId((prev) => (prev === card.id ? null : card.id));
  };

  const isTaskOverviewOpen =
    currentView === 'employee' && selectedId === 'task-overview';
  const isGoalsOverviewOpen = currentView === 'employee' && selectedId === 'goals';
  const isTenantProductivityOpen =
    currentView === 'tenant' && selectedId === 'today-productivity';

  return (
    <div
      className={`summarize-tabs-root${isTaskOverviewOpen ? ' summarize-tabs-root--task-overview' : ''}${isGoalsOverviewOpen ? ' summarize-tabs-root--goals-overview' : ''}${isTenantProductivityOpen ? ' summarize-tabs-root--tenant-productivity' : ''}`}
    >
      <section className="summarize-tabs" aria-label="Summary metrics">
        {cards.map((card) => {
          const isActive = selectedId === card.id;

          return (
            <button
              key={card.id}
              type="button"
              className={`summary-card${isActive ? ' summary-card--active' : ''}`}
              onClick={() => handleCardClick(card)}
              aria-pressed={isActive}
              aria-label={`${card.title}: ${card.value}. ${card.desc}`}
              style={{ borderColor: isActive ? card.color : undefined }}
            >
              <div className="summary-card__body">
                <span className="summary-card__title">{card.title}</span>
                <span className="summary-card__value">{card.value}</span>
                <span className="summary-card__desc">{card.desc}</span>
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

      {selectedCard && (
        <SummaryCardContent card={selectedCard} onNavigateTab={onNavigateTab} />
      )}
    </div>
  );
};
