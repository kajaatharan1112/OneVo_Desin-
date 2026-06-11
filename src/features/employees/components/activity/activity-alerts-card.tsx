import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ActivityAlert } from '../../types/employee-activity.types';

interface ActivityAlertsCardProps {
  alerts: ActivityAlert[];
  className?: string;
}

export const ActivityAlertsCard: React.FC<ActivityAlertsCardProps> = ({
  alerts,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-alerts ${className}`.trim()}
      aria-label="Attendance alerts"
    >
      <header className="eac-widget__head">
        <AlertCircle size={16} aria-hidden="true" />
        <h3 className="eac-widget__title">Alerts</h3>
      </header>
      <ul className="eac-alerts__list">
        {alerts.map((alert) => (
          <li key={alert.id} className={`eac-alerts__item eac-alerts__item--${alert.type}`}>
            {alert.title}
          </li>
        ))}
      </ul>
    </article>
  );
};
