import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ClipboardCheck, Siren } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoActionQueueItem, CeoMyPrioritiesTone } from '../data/ceo-dashboard.data';

function getAccentClass(tone: CeoMyPrioritiesTone): string {
  switch (tone) {
    case 'orange':
      return 'mprio-row__accent--orange';
    case 'danger':
      return 'mprio-row__accent--danger';
    case 'amber':
      return 'mprio-row__accent--amber';
    default:
      return 'mprio-row__accent--blue';
  }
}

function getBadgeClass(tone: CeoMyPrioritiesTone): string {
  switch (tone) {
    case 'orange':
      return 'mprio-badge--orange';
    case 'danger':
      return 'mprio-badge--danger';
    case 'amber':
      return 'mprio-badge--amber';
    default:
      return 'mprio-badge--blue';
  }
}

function getActionBtnClass(tone: CeoMyPrioritiesTone): string {
  switch (tone) {
    case 'orange':
      return 'mprio-action-btn--orange';
    case 'danger':
      return 'mprio-action-btn--danger';
    case 'amber':
      return 'mprio-action-btn--amber';
    default:
      return 'mprio-action-btn--blue';
  }
}

function useListScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const update = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight + 2;
      const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
      setShowFade(hasOverflow && notAtBottom);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  return { ref, showFade };
}

interface ActionItemRowProps {
  item: CeoActionQueueItem;
}

const ActionItemRow: React.FC<ActionItemRowProps> = ({ item }) => (
  <li className="mprio-row mprio-row--unified">
    <span className={`mprio-row__accent ${getAccentClass(item.tone)}`} aria-hidden="true" />
    <div className="mprio-row__copy">
      <span className="mprio-row__title">{item.title}</span>
      <span className="mprio-row__impact">{item.description}</span>
    </div>
    <span className={`mprio-badge mprio-badge--compact ${getBadgeClass(item.tone)}`}>
      {item.dueBadge}
    </span>
    <button type="button" className={`mprio-action-btn ${getActionBtnClass(item.tone)}`}>
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
  const { ref, showFade } = useListScrollFade<HTMLUListElement>();

  if (items.length === 0) {
    return null;
  }

  return (
    <article
      className={`eto-widget mprio-section-panel mprio-section-panel--${modifier}${cellClass ? ` ${cellClass}` : ''}`}
    >
      <header className="eto-widget__head mprio-section-panel__head">
        {icon}
        <h3 className="eto-widget__title">{title}</h3>
        <span className="eto-widget__tab">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className={`mprio-section-panel__scroll${showFade ? ' mprio-section-panel__scroll--fade' : ''}`}>
        <ul
          ref={ref}
          className="mprio-row-list mprio-section-panel__list"
          aria-label={`${title} items`}
        >
          {items.map((item) => (
            <ActionItemRow key={item.id} item={item} />
          ))}
        </ul>
      </div>
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
      <div className="mprio-action-stack">
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
    </div>
  );
};
