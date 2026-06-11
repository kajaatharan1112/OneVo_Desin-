import React from 'react';
import { CalendarPlus, ClipboardList, Download, FilePenLine, Zap } from 'lucide-react';

interface ActivityQuickActionsCardProps {
  actions: string[];
  className?: string;
}

const ACTION_ICONS = [ClipboardList, CalendarPlus, FilePenLine, Download] as const;

export const ActivityQuickActionsCard: React.FC<ActivityQuickActionsCardProps> = ({
  actions,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-quick-actions ${className}`.trim()}
      aria-label="Quick actions"
    >
      <header className="eac-widget__head">
        <Zap size={15} aria-hidden="true" />
        <h3 className="eac-widget__title">Quick Actions</h3>
      </header>
      <ul className="eac-quick-actions__list">
        {actions.map((action, index) => {
          const Icon = ACTION_ICONS[index] ?? ClipboardList;
          const isPrimary = index === 0;

          return (
            <li key={action}>
              <button
                type="button"
                className={`eac-quick-actions__btn${isPrimary ? ' eac-quick-actions__btn--primary' : ''}`}
              >
                <span className="eac-quick-actions__icon" aria-hidden="true">
                  <Icon size={14} strokeWidth={2} />
                </span>
                <span className="eac-quick-actions__label">{action}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
};
