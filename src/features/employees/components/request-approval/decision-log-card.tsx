import React from 'react';
import { History } from 'lucide-react';
import { RequestStatusBadge } from './request-status-badge';
import type { DecisionLogEntry } from '../../types/employee-requests.types';

interface DecisionLogCardProps {
  entries: DecisionLogEntry[];
}

export const DecisionLogCard: React.FC<DecisionLogCardProps> = ({ entries }) => {
  return (
    <section className="era-panel era-decision-log" aria-label="Recent request updates">
      <header className="era-section__head era-decision-log__head">
        <History size={14} aria-hidden="true" />
        <h3 className="era-section__title">Recent Updates</h3>
      </header>
      <ul className="era-decision-log__list">
        {entries.map((entry) => (
          <li key={entry.id} className="era-decision-log__item">
            <span className="era-decision-log__title">{entry.title}</span>
            <div className="era-decision-log__meta">
              <span className="era-decision-log__date">{entry.date}</span>
              <RequestStatusBadge status={entry.status} />
            </div>
            <span className="era-decision-log__detail">{entry.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
