import React from 'react';
import { Bell } from 'lucide-react';
import { executiveDashboard } from '../../../data/executive-dashboard.data';

export const TenantModuleNotificationsBar: React.FC = () => (
  <article className="tto-widget tto-notify-bar tto-cell--notify">
    <div className="tto-notify-bar__row">
      <Bell size={16} aria-hidden="true" />
      <span className="tto-notify-bar__label">Module Notifications</span>
      <div className="tto-notify-bar__tabs" role="list">
        {executiveDashboard.moduleBadges.map((item) => (
          <button
            key={item.id}
            type="button"
            className="tto-notify-bar__chip"
            role="listitem"
            aria-label={`${item.name}: ${item.badgeCount} notifications`}
            title={item.name}
          >
            <span className="tto-notify-bar__chip-label">{item.name}</span>
            <span className="tto-notify-bar__chip-count">{item.badgeCount}</span>
          </button>
        ))}
      </div>
    </div>
  </article>
);
