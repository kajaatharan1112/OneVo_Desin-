import React from 'react';
import { Clock } from 'lucide-react';
import type { ActivityClockStatus } from '../../types/employee-activity.types';
import { PunctualityBadge } from './activity-status-badge';

interface ActivityClockStatusCardProps {
  status: ActivityClockStatus;
  className?: string;
}

export const ActivityClockStatusCard: React.FC<ActivityClockStatusCardProps> = ({
  status,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-widget--primary eac-clock-status ${className}`.trim()}
      aria-label="Clock status"
    >
      <header className="eac-widget__head">
        <Clock size={15} aria-hidden="true" />
        <h2 className="eac-widget__title">Clock Status</h2>
        <PunctualityBadge status={status.punctuality} />
      </header>
      <ul className="eac-clock-status__list">
        <li>
          <span className="eac-clock-status__label">Clocked in</span>
          <span className="eac-clock-status__value">{status.clockIn}</span>
        </li>
        <li>
          <span className="eac-clock-status__label">Current status</span>
          <span className="eac-clock-status__value">{status.currentStatus}</span>
        </li>
        <li>
          <span className="eac-clock-status__label">Work mode</span>
          <span className="eac-clock-status__value">{status.mode}</span>
        </li>
        <li>
          <span className="eac-clock-status__label">Worked so far</span>
          <span className="eac-clock-status__value">{status.workedSoFar}</span>
        </li>
        <li>
          <span className="eac-clock-status__label">Target checkout</span>
          <span className="eac-clock-status__value">{status.targetCheckout}</span>
        </li>
      </ul>
      <button type="button" className="eac-btn eac-btn--ghost eac-widget__foot">
        View attendance
      </button>
    </article>
  );
};
