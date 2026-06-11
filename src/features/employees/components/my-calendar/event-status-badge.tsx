import React from 'react';
import type { TimelineEventStatus } from '../../types/employee-calendar.types';

const STATUS_SLUG: Record<TimelineEventStatus, string> = {
  Completed: 'completed',
  Upcoming: 'upcoming',
  'Focus time': 'focus-time',
  Pending: 'pending'
};

interface EventStatusBadgeProps {
  status: TimelineEventStatus;
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status }) => {
  return (
    <span className={`emc-status-badge emc-status-badge--${STATUS_SLUG[status]}`}>{status}</span>
  );
};
