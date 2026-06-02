import React from 'react';
import { Bell } from 'lucide-react';
import { tenantModuleNotifications } from '../../../data/tenant-today-productivity.data';

export const TenantModuleNotificationsBar: React.FC = () => {
  return (
    <article className="tto-widget tto-notify-bar tto-cell--notify">
      <div className="tto-notify-bar__row">
        <Bell size={16} aria-hidden="true" />
        <span className="tto-notify-bar__label">Module Notifications</span>
        <div className="tto-notify-bar__tabs" role="list">
          {tenantModuleNotifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className="tto-notify-bar__chip"
              role="listitem"
              aria-label={`${item.module} ${item.type}: ${item.count} notifications`}
              title={`${item.module} · ${item.type}`}
            >
              <span className="tto-notify-bar__chip-module">{item.module}</span>
              <span className="tto-notify-bar__chip-type">{item.type}</span>
              <span className="tto-notify-bar__chip-count">{item.count}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};
