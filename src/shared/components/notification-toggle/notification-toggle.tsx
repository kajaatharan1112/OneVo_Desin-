import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationToggleProps {
  isOpen: boolean;
  unreadCount: number;
  onToggle: () => void;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  isOpen,
  unreadCount,
  onToggle
}) => {
  return (
    <button
      type="button"
      className={`notification-toggle${isOpen ? ' notification-toggle--active' : ''}`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="app-notification-panel"
      aria-label={
        isOpen
          ? 'Close notifications panel'
          : `Open notifications${unreadCount > 0 ? `, ${unreadCount} new` : ''}`
      }
      title={isOpen ? 'Close notifications' : 'Notifications'}
    >
      <Bell size={18} strokeWidth={2.25} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="notification-toggle__badge" aria-hidden="true">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
