import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationPanel } from '../../../../../core/notifications/notification-panel-context';
import { useEmployeeData } from '../../../hooks/use-employee-data';

export const NotificationSummaryBar: React.FC = () => {
  const { openNotificationPanel } = useNotificationPanel();
  const { notificationSummary } = useEmployeeData();

  return (
    <article className="eto-widget eto-notify-bar eto-notify-bar--compact eto-cell--notify">
      <div className="eto-notify-bar__row">
        <Bell size={16} aria-hidden="true" />
        <span className="eto-notify-bar__label">Notifications</span>
        <div className="eto-notify-bar__tabs" role="list">
          {notificationSummary.map((item) => (
            <button
              key={item.id}
              type="button"
              className="eto-notify-bar__chip"
              role="listitem"
              onClick={openNotificationPanel}
              aria-label={`${item.module} ${item.type}: ${item.count}. Open notifications`}
              title={`${item.module} · ${item.type}`}
            >
              <span className="eto-notify-bar__chip-module">{item.module}</span>
              <span className="eto-notify-bar__chip-type">{item.type}</span>
              <span className="eto-notify-bar__chip-count">{item.count}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};
