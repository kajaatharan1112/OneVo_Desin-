import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getNotificationsForView } from '../../../core/notifications/notification-data';
import type { EmployeeId } from '../../../features/employees/types/employee.types';
import type { NotificationFilter } from '../../types/notification.types';
import { NotificationFilterTabs } from './notification-filter';
import { NotificationItem } from './notification-item';

interface NotificationPanelProps {
  currentView: 'employee' | 'tenant';
  selectedEmployeeId: EmployeeId;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  currentView,
  selectedEmployeeId,
  onClose
}) => {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('new');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setActiveFilter('new');
    setDismissedIds(new Set());
  }, [currentView, selectedEmployeeId]);

  const allNotifications = useMemo(
    () => getNotificationsForView(currentView, selectedEmployeeId),
    [currentView, selectedEmployeeId]
  );

  const visibleNotifications = useMemo(
    () =>
      allNotifications.filter(
        (n) => n.filter === activeFilter && !dismissedIds.has(n.id)
      ),
    [allNotifications, activeFilter, dismissedIds]
  );

  const newCount = allNotifications.filter(
    (n) => n.filter === 'new' && !dismissedIds.has(n.id)
  ).length;
  const pastCount = allNotifications.filter(
    (n) => n.filter === 'past' && !dismissedIds.has(n.id)
  ).length;

  const handleAction = (notificationId: string, actionId: string) => {
    if (actionId === 'cancel' || actionId === 'denied') {
      setDismissedIds((prev) => new Set(prev).add(notificationId));
      return;
    }
    if (actionId === 'approve' || actionId === 'accept' || actionId === 'join') {
      setDismissedIds((prev) => new Set(prev).add(notificationId));
      return;
    }
    if (actionId === 'view-task') {
      setDismissedIds((prev) => new Set(prev).add(notificationId));
    }
  };

  return (
    <aside
      id="app-notification-panel"
      className="notification-shell"
      aria-label="Notifications"
    >
      <div className="notification-panel sidebar-panel">
        <div className="notification-panel__toolbar">
          <div className="notification-panel__toolbar-end">
            <NotificationFilterTabs
              active={activeFilter}
              newCount={newCount}
              pastCount={pastCount}
              onChange={setActiveFilter}
            />
            <button
              type="button"
              className="notification-panel__close"
              onClick={onClose}
              aria-label="Close notifications panel"
              title="Close"
            >
              <X size={16} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="notification-panel__list" role="tabpanel">
          {visibleNotifications.length === 0 ? (
            <p className="notification-panel__empty">
              No {activeFilter === 'new' ? 'new' : 'past'} notifications right now.
            </p>
          ) : (
            visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
