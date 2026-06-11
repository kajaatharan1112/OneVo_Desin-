import React from 'react';
import { Timer } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ActivityWorkHoursSummary } from '../../types/employee-activity.types';
import type { WorkHoursStackSegment } from '../../utils/activity-work-hours-display.utils';

interface ActivityWorkHoursCardProps {
  summary: ActivityWorkHoursSummary;
  stackSegments: WorkHoursStackSegment[];
  statItems: ReadonlyArray<{ id: string; label: string; value: string }>;
  ringStyle: CSSProperties;
  className?: string;
}

export const ActivityWorkHoursCard: React.FC<ActivityWorkHoursCardProps> = ({
  summary,
  stackSegments,
  statItems,
  ringStyle,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-work-hours ${className}`.trim()}
      aria-label="Work hours summary"
    >
      <header className="eac-widget__head">
        <Timer size={15} aria-hidden="true" />
        <h3 className="eac-widget__title">Work Hours Summary</h3>
      </header>

      <div className="eac-work-hours__viz">
        <div
          className="eac-work-hours__ring"
          style={ringStyle}
          role="img"
          aria-label={`${summary.completedPercent}% of expected hours completed`}
        >
          <div className="eac-work-hours__ring-inner">
            <span className="eac-work-hours__ring-value">{summary.completedPercent}%</span>
            <span className="eac-work-hours__ring-label">logged</span>
          </div>
        </div>

        <div className="eac-work-hours__stats">
          <p className="eac-work-hours__hero">
            <span className="eac-work-hours__hero-value">{summary.completed}</span>
            <span className="eac-work-hours__hero-label">completed today</span>
          </p>
          <dl className="eac-work-hours__stat-grid">
            {statItems.map((item) => (
              <div key={item.id}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="eac-work-hours__stack" aria-label="Work day breakdown">
        <div className="eac-work-hours__stack-track" role="presentation">
          {stackSegments.map((segment) => (
            <span
              key={segment.id}
              className={`eac-work-hours__stack-segment eac-work-hours__stack-segment--${segment.id}`}
              style={{ width: `${segment.percent}%` }}
            />
          ))}
        </div>
        <ul className="eac-work-hours__legend">
          {stackSegments.map((segment) => (
            <li key={segment.id} className="eac-work-hours__legend-item">
              <span
                className={`eac-work-hours__legend-dot eac-work-hours__legend-dot--${segment.id}`}
                aria-hidden="true"
              />
              <span className="eac-work-hours__legend-label">{segment.label}</span>
              <span className="eac-work-hours__legend-value">{segment.displayValue}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};
