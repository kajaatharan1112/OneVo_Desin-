import React from 'react';
import { AlertTriangle, ClipboardCheck, Siren } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoActionQueueItem, CeoMyPrioritiesTone } from '../data/ceo-dashboard.data';

function getBadgeClass(tone: CeoMyPrioritiesTone): string {
  switch (tone) {
    case 'orange':
      return 'mprio-action-item__badge--decision';
    case 'danger':
      return 'mprio-action-item__badge--escalation';
    case 'amber':
      return 'mprio-action-item__badge--alert';
    default:
      return 'mprio-action-item__badge--approval';
  }
}

function getActionBtnClass(tone: CeoMyPrioritiesTone): string {
  switch (tone) {
    case 'orange':
      return 'mprio-action-item__btn--orange';
    case 'danger':
      return 'mprio-action-item__btn--danger';
    case 'amber':
      return 'mprio-action-item__btn--amber';
    default:
      return 'mprio-action-item__btn--blue';
  }
}

interface ActionItemRowProps {
  item: CeoActionQueueItem;
}

const ActionItemRow: React.FC<ActionItemRowProps> = ({ item }) => (
  <li className="eto-today__item mprio-action-item">
    <div className="mprio-meeting-item__copy">
      <span className="eto-today__label">{item.title}</span>
      <span className="eto-today__time">
        {item.description} · {item.typeLabel}
      </span>
    </div>
    <span className={`mprio-meeting-item__badge ${getBadgeClass(item.tone)}`}>
      {item.dueBadge}
    </span>
    <button
      type="button"
      className={`mprio-action-item__btn ${getActionBtnClass(item.tone)}`}
    >
      {item.actionLabel}
    </button>
  </li>
);

interface ActionSectionPanelProps {
  title: string;
  modifier: string;
  icon: React.ReactNode;
  items: CeoActionQueueItem[];
  cellClass?: string;
}

const ActionSectionPanel: React.FC<ActionSectionPanelProps> = ({
  title,
  modifier,
  icon,
  items,
  cellClass
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <article
      className={`eto-widget mprio-section-panel mprio-section-panel--${modifier}${cellClass ? ` ${cellClass}` : ''}`}
    >
      <header className="eto-widget__head">
        {icon}
        <h3 className="eto-widget__title">{title}</h3>
        <span className="eto-widget__tab">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      <ul className="eto-today__list mprio-section-panel__list" aria-label={`${title} items`}>
        {items.map((item) => (
          <ActionItemRow key={item.id} item={item} />
        ))}
      </ul>
    </article>
  );
};

export const PrioritiesActionQueuePanel: React.FC = () => {
  const { actionQueue } = ceoDashboardData.myPriorities;
  const { items } = actionQueue;

  const approvalDecisionItems = items.filter(
    (item) => item.type === 'approval' || item.type === 'decision'
  );
  const escalationItems = items.filter((item) => item.type === 'escalation');
  const alertItems = items.filter((item) => item.type === 'alert');

  return (
    <div className="mprio-action-sections mprio-cell--queue" aria-label="Today action queue">
      <ActionSectionPanel
        title="Approvals & Decisions"
        modifier="approvals-decisions"
        icon={<ClipboardCheck size={16} aria-hidden="true" />}
        items={approvalDecisionItems}
        cellClass="mprio-cell--approvals-decisions"
      />
      <ActionSectionPanel
        title="Escalations"
        modifier="escalation"
        icon={<AlertTriangle size={16} aria-hidden="true" />}
        items={escalationItems}
        cellClass="mprio-cell--escalations"
      />
      <ActionSectionPanel
        title="Alerts"
        modifier="alert"
        icon={<Siren size={16} aria-hidden="true" />}
        items={alertItems}
        cellClass="mprio-cell--alerts"
      />
    </div>
  );
};
