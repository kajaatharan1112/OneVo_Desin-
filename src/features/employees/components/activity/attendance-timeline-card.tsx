import React from 'react';
import { ListTree } from 'lucide-react';
import type { AttendanceTimelineEvent } from '../../data/attendance-tab.mock';
import { DashboardCard } from '../task-overview/cards/dashboard-card';
import { AttendanceScrollBody } from './attendance-scroll-body';

interface AttendanceTimelineCardProps {
  events: AttendanceTimelineEvent[];
  isLoading: boolean;
  isEmpty: boolean;
  className?: string;
}

export const AttendanceTimelineCard: React.FC<AttendanceTimelineCardProps> = ({
  events,
  isLoading,
  isEmpty,
  className = ''
}) => {
  return (
    <DashboardCard
      title="Activity Timeline"
      icon={<ListTree size={15} aria-hidden="true" />}
      scroll
      className={`attendance-tab__cell attendance-tab__cell--scroll ${className}`.trim()}
      ariaLabel="Activity timeline"
    >
      <AttendanceScrollBody
        isLoading={isLoading}
        isEmpty={isEmpty}
        emptyLabel="No clock events recorded today."
        loadingLabel="Loading clock events…"
      >
        <ol className="attendance-scroll-list attendance-timeline__list" aria-label="Clock events">
          {events.map((event, index) => (
            <li key={event.id} className="attendance-timeline__item">
              <div className="attendance-timeline__rail" aria-hidden="true">
                <span className="attendance-timeline__dot" />
                {index < events.length - 1 ? <span className="attendance-timeline__line" /> : null}
              </div>
              <div className="attendance-timeline__body">
                <time className="attendance-timeline__time" dateTime={event.time}>
                  {event.time}
                </time>
                <span className="attendance-timeline__title">{event.title}</span>
              </div>
            </li>
          ))}
        </ol>
      </AttendanceScrollBody>
    </DashboardCard>
  );
};
