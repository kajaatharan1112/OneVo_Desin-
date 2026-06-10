import React from 'react';
import { Clock } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoTimeDistribution } from '../data/ceo-dashboard.data';

const timeLabels: { key: keyof CeoTimeDistribution; label: string }[] = [
  { key: 'focusHours', label: 'Focus time' },
  { key: 'workHours', label: 'Work hours' },
  { key: 'meetingHours', label: 'Meeting time' },
  { key: 'idleHours', label: 'Idle time' }
];

export const ProductivityTimeDistributionPanel: React.FC = () => {
  const { timeDistribution } = ceoDashboardData.productivity;
  const maxHours = timeDistribution.workHours;

  return (
    <article className="cwo-widget cpr-cell--time">
      <header className="cwo-widget__head">
        <Clock size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Daily time split</h4>
        <span className="cwo-widget__tab">{timeDistribution.workHours}h avg</span>
      </header>
      <ul className="cwo-meter-list cwo-meter-list--wide">
        {timeLabels.map((item, index) => {
          const hours = timeDistribution[item.key];
          const percent = Math.round((hours / maxHours) * 100);

          return (
            <li key={item.key} className="cwo-meter-list__item">
              <div className="cwo-meter-list__top">
                <span className="cwo-meter-list__title">{item.label}</span>
                <span className="cwo-meter-list__badge">{hours}h</span>
              </div>
              <div className="cwo-meter-list__bar" aria-hidden="true">
                <span
                  className={`cwo-meter-list__fill cwo-meter-list__fill--tone-${index + 1}`}
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
