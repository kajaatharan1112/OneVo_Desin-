import React from 'react';
import type { EventType } from '../../types/employee-calendar.types';

interface EventTypeBadgeProps {
  type: EventType;
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ type }) => {
  const slug = type.toLowerCase();

  return <span className={`emc-type-badge emc-type-badge--${slug}`}>{type}</span>;
};
