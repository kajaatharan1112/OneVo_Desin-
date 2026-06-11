import React from 'react';
import { Clock } from 'lucide-react';
import type { AttendanceClockStatus } from '../../data/attendance-tab.mock';
import { PunctualityBadge } from './activity-status-badge';
import { DashboardCard } from '../task-overview/cards/dashboard-card';

interface AttendanceClockStatusCardProps {
  status: AttendanceClockStatus;
  className?: string;
}

export const AttendanceClockStatusCard: React.FC<AttendanceClockStatusCardProps> = ({
  status,
  className = ''
}) => {
  const rows = [
    { label: 'Clocked in', value: status.clockIn },
    { label: 'Status', value: status.currentStatus },
    { label: 'Work mode', value: status.mode },
    { label: 'Break taken', value: status.breakTaken },
    { label: 'Lunch', value: status.lunchDuration },
    { label: 'Working since', value: status.workingSince }
  ];

  return (
    <DashboardCard
      title="Clock Status"
      icon={<Clock size={15} aria-hidden="true" />}
      action={<PunctualityBadge status={status.punctuality} />}
      className={`attendance-tab__cell attendance-tab__cell--static attendance-tab__cell--clock ${className}`.trim()}
      ariaLabel="Clock status"
    >
      <div className="attendance-clock-status">
        <div
          className="attendance-clock-status__progress"
          role="img"
          aria-label={`Day progress ${status.dayProgressPercent}% from ${status.clockIn} to ${status.targetCheckout}`}
        >
          <div className="attendance-clock-status__progress-labels">
            <span>{status.clockIn}</span>
            <span className="attendance-clock-status__progress-now" aria-hidden="true">
              ●
            </span>
            <span>{status.targetCheckout}</span>
          </div>
          <div className="attendance-clock-status__progress-track">
            <span
              className="attendance-clock-status__progress-fill"
              style={{ width: `${status.dayProgressPercent}%` }}
            />
          </div>
        </div>

        <ul className="attendance-clock-status__list">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="attendance-clock-status__label">{row.label}</span>
              <span className="attendance-clock-status__value">{row.value}</span>
            </li>
          ))}
        </ul>

        <button type="button" className="attendance-clock-status__btn">
          View attendance
        </button>
      </div>
    </DashboardCard>
  );
};
