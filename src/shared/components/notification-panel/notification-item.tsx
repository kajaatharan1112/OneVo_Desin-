import React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckSquare,
  ClipboardCheck,
  UserCheck
} from 'lucide-react';
import type { AppNotification, NotificationCategory } from '../../types/notification.types';

interface NotificationItemProps {
  notification: AppNotification;
  onAction: (notificationId: string, actionId: string) => void;
}

const categoryMeta: Record<
  NotificationCategory,
  { icon: React.ReactNode; accent: string; label: string }
> = {
  approval: {
    icon: <UserCheck size={18} />,
    accent: '#3b82f6',
    label: 'Approval'
  },
  meeting: {
    icon: <CalendarClock size={18} />,
    accent: '#8b5cf6',
    label: 'Meeting'
  },
  'task-review': {
    icon: <ClipboardCheck size={18} />,
    accent: '#10b981',
    label: 'Task review'
  },
  'todo-request': {
    icon: <CheckSquare size={18} />,
    accent: '#f59e0b',
    label: 'To do'
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    accent: '#ef4444',
    label: 'System'
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onAction
}) => {
  const meta = categoryMeta[notification.category];

  return (
    <article className={`notification-item notification-item--${notification.category}`}>
      <div className="notification-item__header">
        <div
          className="notification-item__icon"
          style={{
            backgroundColor: `color-mix(in srgb, ${meta.accent} 14%, transparent)`,
            color: meta.accent
          }}
          aria-hidden="true"
        >
          {meta.icon}
        </div>
        <div className="notification-item__meta">
          <span className="notification-item__category">{meta.label}</span>
          <time className="notification-item__time">{notification.timeLabel}</time>
        </div>
      </div>

      <h4 className="notification-item__title">{notification.title}</h4>
      <p className="notification-item__message">{notification.message}</p>

      {notification.actions.length > 0 && (
        <div className="notification-item__actions">
          {notification.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`notification-item__btn notification-item__btn--${action.variant}`}
              onClick={() => onAction(notification.id, action.id)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
