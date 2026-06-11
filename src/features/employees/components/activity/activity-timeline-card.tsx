import React from 'react';
import { ListOrdered } from 'lucide-react';
import { ActivityStatusBadge } from './activity-status-badge';
import type { ActivityTimelineItem } from '../../types/employee-activity.types';

interface ActivityTimelineCardProps {
  items: ActivityTimelineItem[];
  className?: string;
}

export const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({
  items,
  className = ''
}) => {
  return (
    <article
      className={`eac-widget eac-timeline ${className}`.trim()}
      aria-label="Today's activity timeline"
    >
      <header className="eac-widget__head">
        <ListOrdered size={16} aria-hidden="true" />
        <h3 className="eac-widget__title">Today&apos;s Activity Timeline</h3>
      </header>
      <div className="eac-widget__scroll">
        <ol className="eac-timeline__list">
          {items.map((item, index) => (
            <li key={item.id} className="eac-timeline__item">
              <div className="eac-timeline__rail" aria-hidden="true">
                <span className="eac-timeline__dot" />
                {index < items.length - 1 ? <span className="eac-timeline__line" /> : null}
              </div>
              <div className="eac-timeline__body">
                <div className="eac-timeline__row">
                  <time className="eac-timeline__time" dateTime={item.time}>
                    {item.time}
                  </time>
                  <ActivityStatusBadge status={item.status} />
                </div>
                <span className="eac-timeline__title">{item.title}</span>
                <span className="eac-timeline__detail">{item.detail}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
};
