import React from 'react';
import { BadgeCheck } from 'lucide-react';
import type { ActivityAttendanceInsight } from '../../types/employee-activity.types';

interface ActivityAttendanceInsightCardProps {
  insight: ActivityAttendanceInsight;
  className?: string;
}

export const ActivityAttendanceInsightCard: React.FC<ActivityAttendanceInsightCardProps> = ({
  insight,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-attendance-insight ${className}`.trim()}
      aria-label="Attendance insight"
    >
      <header className="eac-widget__head">
        <BadgeCheck size={15} aria-hidden="true" />
        <h3 className="eac-widget__title">Attendance Insight</h3>
      </header>
      <dl className="eac-attendance-insight__metrics">
        <div>
          <dt>On time this week</dt>
          <dd>
            {insight.onTimeDays}/{insight.workDaysThisWeek} days
          </dd>
        </div>
        <div>
          <dt>Today mode</dt>
          <dd>{insight.todayMode}</dd>
        </div>
        <div>
          <dt>Pending corrections</dt>
          <dd>{insight.pendingCorrections}</dd>
        </div>
        <div>
          <dt>Weekly avg hours</dt>
          <dd>{insight.weeklyAvgHours}</dd>
        </div>
      </dl>
    </article>
  );
};
