import React from 'react';
import { Clock } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoTimeDistribution } from '../data/ceo-dashboard.data';

const timeLabels: { key: keyof CeoTimeDistribution; label: string }[] = [
  { key: 'focusHours', label: 'Focus time' },
  { key: 'meetingHours', label: 'Meeting time' },
  { key: 'idleHours', label: 'Idle time' },
  { key: 'workHours', label: 'Total work hours' }
];

export const ProductivityTimeDistributionPanel: React.FC = () => {
  const { timeDistribution } = ceoDashboardData.productivity;
  const maxHours = timeDistribution.workHours;

  return (
    <article className="eto-widget cpr-panel cpr-cell--time">
      <header className="cpr-panel__head">
        <div className="cpr-panel__title-block">
          <span className="cpr-panel__icon-wrap" aria-hidden="true">
            <Clock size={16} />
          </span>
          <div className="cpr-panel__titles">
            <h3 className="cpr-panel__title">Time Distribution</h3>
            <p className="cpr-panel__subtitle">Average daily time split</p>
          </div>
        </div>
        <span className="cpr-pill cpr-pill--neutral">{timeDistribution.workHours}h avg</span>
      </header>

      <ul className="cpr-meter-list cpr-meter-list--time" aria-label="Daily time distribution">
        {timeLabels.map((item, index) => {
          const hours = timeDistribution[item.key];
          const percent = Math.round((hours / maxHours) * 100);

          return (
            <li key={item.key} className="cpr-meter-list__item">
              <div className="cpr-meter-list__top">
                <span className="cpr-meter-list__title">{item.label}</span>
                <span className="cpr-meter-list__value">{hours}h</span>
              </div>
              <div className="cpr-meter-list__bar" aria-hidden="true">
                <span
                  className={`cpr-meter-list__fill cpr-meter-list__fill--tone-${index + 1}`}
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
