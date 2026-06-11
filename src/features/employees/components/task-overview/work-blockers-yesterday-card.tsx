import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type {
  WorkBlockerItem,
  WorkBlockerKind,
  WorkYesterdayItem,
  WorkYesterdayStatus
} from '../../data/work-tab.mock';
import { DashboardCard } from './cards/dashboard-card';
import { WorkScrollBody } from './work-scroll-body';

type ToggleView = 'blockers' | 'yesterday';

const BLOCKER_KIND_LABELS: Record<WorkBlockerKind, string> = {
  blocked: 'Blocked',
  dependency: 'Dependency'
};

const YESTERDAY_STATUS_LABELS: Record<WorkYesterdayStatus, string> = {
  approved: 'Approved',
  completed: 'Completed'
};

interface WorkBlockersYesterdayCardProps {
  blockers: WorkBlockerItem[];
  yesterday: WorkYesterdayItem[];
  isLoading: boolean;
  className?: string;
}

export const WorkBlockersYesterdayCard: React.FC<WorkBlockersYesterdayCardProps> = ({
  blockers,
  yesterday,
  isLoading,
  className = ''
}) => {
  const [view, setView] = useState<ToggleView>('blockers');
  const isEmpty = view === 'blockers' ? blockers.length === 0 : yesterday.length === 0;
  const emptyLabel =
    view === 'blockers' ? 'No blockers reported.' : 'Nothing completed yesterday yet.';
  const loadingLabel =
    view === 'blockers' ? 'Loading blockers…' : 'Loading yesterday status…';

  return (
    <DashboardCard
      scroll
      className={`work-tab__cell work-tab__cell--scroll ${className}`.trim()}
      ariaLabel={view === 'blockers' ? 'Blockers' : 'Yesterday status'}
      header={
        <>
          <span className="emp-dash-card__icon">
            <Clock size={15} aria-hidden="true" />
          </span>
          <h3 className="emp-dash-card__title">Blockers ⇄ Yesterday</h3>
          <div className="work-segmented-toggle" role="tablist" aria-label="Blockers or yesterday">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'blockers'}
              className={`work-segmented-toggle__btn${view === 'blockers' ? ' is-active' : ''}`}
              onClick={() => setView('blockers')}
            >
              Blockers
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'yesterday'}
              className={`work-segmented-toggle__btn${view === 'yesterday' ? ' is-active' : ''}`}
              onClick={() => setView('yesterday')}
            >
              Yesterday
            </button>
          </div>
        </>
      }
    >
      <WorkScrollBody isLoading={isLoading} isEmpty={isEmpty} emptyLabel={emptyLabel} loadingLabel={loadingLabel}>
        {view === 'blockers' ? (
          <ul className="work-scroll-list work-scroll-list--blockers" aria-label="Active blockers">
            {blockers.map((item) => (
              <li key={item.id} className="emp-dash-blocker-row emp-dash-blocker-row--high">
                <div className="emp-dash-blocker-row__head">
                  <span className="emp-dash-blocker-row__title">{item.title}</span>
                  <span className={`emp-dash-chip emp-dash-chip--kind-${item.kind}`}>
                    {BLOCKER_KIND_LABELS[item.kind]}
                  </span>
                </div>
                <span className="emp-dash-blocker-row__detail">{item.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="work-scroll-list work-scroll-list--yesterday" aria-label="Yesterday completed work">
            {yesterday.map((item) => (
              <li key={item.id} className="emp-dash-yesterday-row">
                <span className="emp-dash-yesterday-row__title">{item.title}</span>
                <span className="emp-dash-yesterday-row__meta">
                  <span className={`emp-dash-chip emp-dash-chip--yesterday-${item.status}`}>
                    {YESTERDAY_STATUS_LABELS[item.status]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </WorkScrollBody>
    </DashboardCard>
  );
};
