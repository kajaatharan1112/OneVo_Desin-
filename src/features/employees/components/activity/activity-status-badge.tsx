import React from 'react';

export type ActivityTimelineStatus = 'Completed' | 'Pending' | 'Upcoming';
export type WeeklyDayStatus = 'Office' | 'Remote' | 'Off' | 'Leave';
export type PunctualityChip = 'on-time' | 'late' | 'remote';

const TIMELINE_LABELS: Record<ActivityTimelineStatus, string> = {
  Completed: 'Completed',
  Pending: 'Pending',
  Upcoming: 'Upcoming'
};

const TIMELINE_SLUG: Record<ActivityTimelineStatus, string> = {
  Completed: 'completed',
  Pending: 'pending',
  Upcoming: 'upcoming'
};

const PUNCTUALITY_LABELS: Record<PunctualityChip, string> = {
  'on-time': 'On time today',
  late: 'Late',
  remote: 'Remote'
};

interface ActivityStatusBadgeProps {
  status: ActivityTimelineStatus;
}

export const ActivityStatusBadge: React.FC<ActivityStatusBadgeProps> = ({ status }) => (
  <span className={`eac-status-badge eac-status-badge--${TIMELINE_SLUG[status]}`}>
    {TIMELINE_LABELS[status]}
  </span>
);

interface PunctualityBadgeProps {
  status: PunctualityChip;
}

export const PunctualityBadge: React.FC<PunctualityBadgeProps> = ({ status }) => (
  <span className={`eac-punctuality-badge eac-punctuality-badge--${status}`}>
    {PUNCTUALITY_LABELS[status]}
  </span>
);

interface WeeklyStatusBadgeProps {
  status: WeeklyDayStatus;
}

export const WeeklyStatusBadge: React.FC<WeeklyStatusBadgeProps> = ({ status }) => {
  const slug = status.toLowerCase();

  return <span className={`eac-week-badge eac-week-badge--${slug}`}>{status}</span>;
};
