import React from 'react';
import type { NotificationFilter } from '../../types/notification.types';

interface NotificationFilterTabsProps {
  active: NotificationFilter;
  newCount: number;
  pastCount: number;
  onChange: (filter: NotificationFilter) => void;
}

export const NotificationFilterTabs: React.FC<NotificationFilterTabsProps> = ({
  active,
  newCount,
  pastCount,
  onChange
}) => {
  const tabs: { id: NotificationFilter; label: string; count: number }[] = [
    { id: 'new', label: 'New', count: newCount },
    { id: 'past', label: 'Past', count: pastCount }
  ];

  return (
    <div className="notification-filter" role="tablist" aria-label="Notification filters">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`notification-filter__tab${active === tab.id ? ' notification-filter__tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          <span className="notification-filter__count">{tab.count}</span>
        </button>
      ))}
    </div>
  );
};
