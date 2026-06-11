import React, { useMemo } from 'react';
import { CheckCircle2, ClipboardList, Clock, Sparkles, Timer } from 'lucide-react';
import type { AttendanceDayMode, AttendanceInsight } from '../../data/attendance-tab.mock';
import { DashboardCard } from '../task-overview/cards/dashboard-card';
import { WeeklyStatusBadge } from './activity-status-badge';

interface AttendanceInsightCardProps {
  insight: AttendanceInsight;
  className?: string;
}

export const AttendanceInsightCard: React.FC<AttendanceInsightCardProps> = ({
  insight,
  className = ''
}) => {
  const attendanceRatePct = useMemo(() => {
    const parsed = Number.parseInt(insight.attendanceRate, 10);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 0;
  }, [insight.attendanceRate]);

  const todayMode = insight.todayMode as AttendanceDayMode;

  return (
    <DashboardCard
      title="Attendance Insight"
      icon={<Sparkles size={15} aria-hidden="true" />}
      className={`attendance-tab__cell attendance-tab__cell--static attendance-tab__cell--insight ${className}`.trim()}
      ariaLabel="Attendance insight"
    >
      <div className="attendance-insight">
        <div className="attendance-insight__grid" role="list" aria-label="Attendance metrics">
          <article className="attendance-insight__tile attendance-insight__tile--success" role="listitem">
            <div className="attendance-insight__tile-head">
              <span className="attendance-insight__tile-icon" aria-hidden="true">
                <CheckCircle2 size={11} strokeWidth={2.25} />
              </span>
              <span className="attendance-insight__tile-value">{insight.onTimeThisWeek}</span>
            </div>
            <span className="attendance-insight__tile-label">On-time this week</span>
          </article>

          <article className="attendance-insight__tile attendance-insight__tile--mode" role="listitem">
            <div className="attendance-insight__tile-head">
              <WeeklyStatusBadge status={todayMode} />
            </div>
            <span className="attendance-insight__tile-label">Today mode</span>
          </article>

          <article className="attendance-insight__tile attendance-insight__tile--accent" role="listitem">
            <div className="attendance-insight__tile-head">
              <span className="attendance-insight__tile-icon" aria-hidden="true">
                <Timer size={11} strokeWidth={2.25} />
              </span>
              <span className="attendance-insight__tile-value">{insight.weeklyAvgHours}</span>
            </div>
            <span className="attendance-insight__tile-label">Weekly avg</span>
          </article>

          <article className="attendance-insight__tile attendance-insight__tile--neutral" role="listitem">
            <div className="attendance-insight__tile-head">
              <span className="attendance-insight__tile-icon" aria-hidden="true">
                <Clock size={11} strokeWidth={2.25} />
              </span>
              <span className="attendance-insight__tile-value">{insight.avgCheckIn}</span>
            </div>
            <span className="attendance-insight__tile-label">Avg check-in</span>
          </article>

          <article
            className="attendance-insight__tile attendance-insight__tile--rate"
            role="listitem"
            aria-label={`Attendance rate ${insight.attendanceRate}`}
          >
            <div className="attendance-insight__tile-head attendance-insight__tile-head--rate">
              <span className="attendance-insight__tile-value">{insight.attendanceRate}</span>
            </div>
            <div className="attendance-insight__rate-track" aria-hidden="true">
              <span
                className="attendance-insight__rate-fill"
                style={{ width: `${attendanceRatePct}%` }}
              />
            </div>
            <span className="attendance-insight__tile-label">Attendance rate</span>
          </article>
        </div>

        <button type="button" className="attendance-inline-action-btn attendance-inline-action-btn--warning">
          <span className="attendance-inline-action-btn__icon" aria-hidden="true">
            <ClipboardList size={12} strokeWidth={2} />
          </span>
          <span className="attendance-inline-action-btn__label">
            {insight.pendingCorrections} correction pending → View in Requests
          </span>
        </button>
      </div>
    </DashboardCard>
  );
};
