import React from 'react';
import { Scale } from 'lucide-react';
import { decisions } from '../../../data/employee-goals.data';

const outcomeLabels: Record<(typeof decisions)[number]['outcome'], string> = {
  approved: 'Approved',
  pending: 'Pending',
  deferred: 'Deferred'
};

export const DecisionsPanel: React.FC = () => {
  return (
    <article className="ego-widget ego-decisions">
      <header className="ego-widget__head">
        <Scale size={16} aria-hidden="true" />
        <h3 className="ego-widget__title">Decisions</h3>
        <span className="ego-widget__tab">{decisions.length} logged</span>
      </header>

      <ul className="ego-decisions__list">
        {decisions.map((item) => (
          <li key={item.id} className={`ego-decisions__item ego-decisions__item--${item.outcome}`}>
            <div className="ego-decisions__row">
              <span className="ego-decisions__title">{item.title}</span>
              <span className="ego-decisions__badge">{outcomeLabels[item.outcome]}</span>
            </div>
            <span className="ego-decisions__meta">{item.dateLabel}</span>
            <span className="ego-decisions__note">{item.note}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
