import React from 'react';
import { CalendarDays, Coffee } from 'lucide-react';
import type {
  AttendanceAlert,
  AttendanceBreakSession,
  AttendanceFocusBlock
} from '../../data/attendance-tab.mock';
import { DashboardCard } from '../task-overview/cards/dashboard-card';

const FOCUS_STATUS_LABEL: Record<AttendanceFocusBlock['status'], string> = {
  done: 'Done',
  now: 'Now',
  next: 'Next'
};

interface AttendanceFocusBreakAlertsCardProps {
  breakSessions: AttendanceBreakSession[];
  focusBlocks: AttendanceFocusBlock[];
  alerts: AttendanceAlert[];
  className?: string;
}

export const AttendanceFocusBreakAlertsCard: React.FC<AttendanceFocusBreakAlertsCardProps> = ({
  breakSessions,
  focusBlocks,
  alerts,
  className = ''
}) => {
  return (
    <DashboardCard
      title="Focus & Break · Alerts"
      icon={<Coffee size={15} aria-hidden="true" />}
      className={`attendance-tab__cell attendance-tab__cell--static attendance-tab__cell--focus-alerts ${className}`.trim()}
      ariaLabel="Focus, break and alerts"
    >
      <div className="attendance-focus-alerts">
        <section className="attendance-focus-break" aria-label="Break summary">
          <h4 className="attendance-focus-alerts__heading">Break</h4>
          <ul className="attendance-focus-break__list">
            {breakSessions.map((session) => (
              <li key={session.id} className="attendance-focus-break__row">
                <span className="attendance-focus-break__label">
                  {session.label}
                  <span className="attendance-focus-break__time">{session.timeRange}</span>
                </span>
                <span className="attendance-focus-break__value">{session.duration}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="attendance-focus-blocks" aria-label="Focus blocks">
          <h4 className="attendance-focus-alerts__heading">Focus</h4>
          <ul className="attendance-focus-blocks__list">
            {focusBlocks.map((block) => (
              <li key={block.id} className="attendance-focus-blocks__item">
                <div className="attendance-focus-blocks__row">
                  <span className="attendance-focus-blocks__label">{block.label}</span>
                  <span
                    className={`attendance-focus-blocks__status attendance-focus-blocks__status--${block.status}`}
                  >
                    {FOCUS_STATUS_LABEL[block.status]}
                  </span>
                </div>
                <span className="attendance-focus-blocks__time">{block.timeRange}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="attendance-alerts" aria-label="Attendance alerts">
          <h4 className="attendance-focus-alerts__heading">Alerts</h4>
          <ul className="attendance-alerts__list">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`attendance-alerts__item attendance-alerts__item--${alert.tone}`}
              >
                {alert.message}
              </li>
            ))}
          </ul>
          <button type="button" className="attendance-inline-action-btn">
            <span className="attendance-inline-action-btn__icon" aria-hidden="true">
              <CalendarDays size={12} strokeWidth={2} />
            </span>
            <span className="attendance-inline-action-btn__label">Meetings → Schedule</span>
          </button>
        </section>
      </div>
    </DashboardCard>
  );
};
