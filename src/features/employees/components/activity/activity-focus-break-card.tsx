import React from 'react';
import { Coffee } from 'lucide-react';
import type { ActivityFocusBreakBalance } from '../../types/employee-activity.types';

interface ActivityFocusBreakCardProps {
  balance: ActivityFocusBreakBalance;
  totalHours: number;
  className?: string;
}

function formatHours(value: number): string {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export const ActivityFocusBreakCard: React.FC<ActivityFocusBreakCardProps> = ({
  balance,
  totalHours,
  className = ''
}) => {
  const rows = [
    { id: 'focus', label: 'Focus', hours: balance.focusHours, tone: 'focus' },
    { id: 'meeting', label: 'Meetings', hours: balance.meetingHours, tone: 'meeting' },
    { id: 'break', label: 'Break', hours: balance.breakHours, tone: 'break' }
  ] as const;

  return (
    <article
      className={`eac-widget eac-focus-break ${className}`.trim()}
      aria-label="Focus and break balance"
    >
      <header className="eac-widget__head">
        <Coffee size={15} aria-hidden="true" />
        <h3 className="eac-widget__title">Focus & Break Balance</h3>
      </header>
      <ul className="eac-focus-break__list">
        {rows.map((row) => {
          const percent = totalHours > 0 ? Math.round((row.hours / totalHours) * 100) : 0;

          return (
            <li key={row.id} className="eac-focus-break__item">
              <div className="eac-focus-break__row">
                <span className="eac-focus-break__label">{row.label}</span>
                <span className="eac-focus-break__value">{formatHours(row.hours)}</span>
              </div>
              <div className="eac-focus-bar__track" role="presentation" aria-hidden="true">
                <span
                  className={`eac-focus-bar__fill eac-focus-bar__fill--${row.tone}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
};
