import React from 'react';
import { BarChart3, Building2, Timer } from 'lucide-react';
import type { AttendanceWeeklyDay, AttendanceWeeklyPatternTotals } from '../../data/attendance-tab.mock';
import { WeeklyStatusBadge } from './activity-status-badge';
import { DashboardCard } from '../task-overview/cards/dashboard-card';
import { AttendanceScrollBody } from './attendance-scroll-body';

interface AttendanceWeeklyPatternCardProps {
  days: AttendanceWeeklyDay[];
  totals: AttendanceWeeklyPatternTotals;
  isLoading: boolean;
  isEmpty: boolean;
  className?: string;
}

export const AttendanceWeeklyPatternCard: React.FC<AttendanceWeeklyPatternCardProps> = ({
  days,
  totals,
  isLoading,
  isEmpty,
  className = ''
}) => {
  return (
    <DashboardCard
      title="Weekly Work Pattern"
      icon={<BarChart3 size={15} aria-hidden="true" />}
      scroll
      className={`attendance-tab__cell attendance-tab__cell--scroll ${className}`.trim()}
      ariaLabel="Weekly work pattern"
    >
      <div className="attendance-scroll-split">
        <AttendanceScrollBody
          isLoading={isLoading}
          isEmpty={isEmpty}
          emptyLabel="No work pattern data for this week."
          loadingLabel="Loading weekly pattern…"
        >
          <ul className="attendance-scroll-list attendance-weekly-pattern__list" aria-label="Week days">
            {days.map((day) => (
              <li key={day.day} className="attendance-weekly-pattern__item">
                <div className="attendance-weekly-pattern__row">
                  <span className="attendance-weekly-pattern__day">{day.day}</span>
                  <span className="attendance-weekly-pattern__sep" aria-hidden="true">
                    ·
                  </span>
                  <WeeklyStatusBadge status={day.mode} />
                  <span className="attendance-weekly-pattern__sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="attendance-weekly-pattern__hours">{day.loggedHours}</span>
                </div>
              </li>
            ))}
          </ul>
        </AttendanceScrollBody>

        {!isLoading && !isEmpty ? (
          <footer className="attendance-weekly-pattern__footer">
            <ul className="attendance-inline-actions" aria-label="Weekly totals">
              <li>
                <button type="button" className="attendance-inline-action-btn">
                  <span className="attendance-inline-action-btn__icon" aria-hidden="true">
                    <Building2 size={12} strokeWidth={2} />
                  </span>
                  <span className="attendance-inline-action-btn__label">{totals.summary}</span>
                </button>
              </li>
              <li>
                <button type="button" className="attendance-inline-action-btn">
                  <span className="attendance-inline-action-btn__icon" aria-hidden="true">
                    <Timer size={12} strokeWidth={2} />
                  </span>
                  <span className="attendance-inline-action-btn__label">{totals.totalLabel}</span>
                </button>
              </li>
            </ul>
          </footer>
        ) : null}
      </div>
    </DashboardCard>
  );
};
