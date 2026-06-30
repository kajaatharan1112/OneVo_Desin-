import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getNotificationsForView } from '../../../core/notifications/notification-data';
import {
  INBOX_CURRENT_USER,
  useInbox,
} from '../../../core/notifications/inbox-context';
import type { NotificationFilter } from '../../types/notification.types';
import { NotificationFilterTabs } from './notification-filter';
import { NotificationItem } from './notification-item';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';
import { useAccessStore } from '../../../features/access/accessStore';
import { getAccessApprovalNotifications } from '../../../features/access/accessNotifications';
import { AccessApprovalModal } from '../../../features/access/AccessApprovalModal';
import { useMonitoringStore } from '../../../features/employees/pages/employee-monitoring/monitoringStore';

interface NotificationPanelProps {
  currentView: 'employee' | 'tenant';
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  currentView,
  onClose
}) => {
  const { getInboxForUser, resolveInboxAction } = useInbox();
  const { selectedEmployeeId } = useEmployeeContext();
  const approvalRequests = useAccessStore(s => s.approvalRequests);
  const requesterNotices = useAccessStore(s => s.requesterNotices);
  const { activeApprovalRequestId, openApprovalRequest, closeApprovalRequest } = useAccessStore();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('new');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setActiveFilter('new');
    setDismissedIds(new Set());
  }, [currentView]);

  const staticNotifications = useMemo(
    () => getNotificationsForView(currentView),
    [currentView],
  );

  const accessNotifications = useMemo(() => {
    if (currentView !== 'employee') return [];
    return getAccessApprovalNotifications(
      approvalRequests,
      selectedEmployeeId,
      requesterNotices
    );
  }, [currentView, approvalRequests, selectedEmployeeId, requesterNotices]);

  const inboxNotifications = useMemo(() => {
    if (currentView !== 'employee') return [];
    return getInboxForUser(INBOX_CURRENT_USER);
  }, [currentView, getInboxForUser]);

  const allNotifications = useMemo(() => {
    const base = [...accessNotifications, ...inboxNotifications, ...staticNotifications];
    if (currentView === 'employee') {
      return base.filter(
        n => !n.recipientId || n.recipientId === selectedEmployeeId
      );
    }
    return base;
  }, [accessNotifications, inboxNotifications, staticNotifications, currentView, selectedEmployeeId]);

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
    const notification = allNotifications.find(n => n.id === notificationId);
    if (notification?.accessApprovalMeta) {
      openApprovalRequest(notification.accessApprovalMeta.requestId);
      return;
    }
    if (notification?.deviceRequestMeta) {
      useMonitoringStore.getState().setActiveRequestId(notification.deviceRequestMeta.requestId);
      useMonitoringStore.getState().setShowRequestDrawer(true);
      onClose();
      return;
    }
    if (notification?.workMeta) {
      resolveInboxAction(notificationId, actionId);
      return;
    }

    if (actionId === 'cancel' || actionId === 'denied' || actionId === 'decline' || actionId === 'reject') {
      setDismissedIds((prev) => new Set(prev).add(notificationId));
      return;
    }
    if (actionId === 'approve' || actionId === 'accept' || actionId === 'join' || actionId === 'limit_access') {
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
                onOpen={n => {
                  if (n.accessApprovalMeta) {
                    openApprovalRequest(n.accessApprovalMeta.requestId);
                  }
                  if (n.deviceRequestMeta) {
                    useMonitoringStore.getState().setActiveRequestId(n.deviceRequestMeta.requestId);
                    useMonitoringStore.getState().setShowRequestDrawer(true);
                    onClose();
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      <AccessApprovalModal
        requestId={activeApprovalRequestId}
        onClose={closeApprovalRequest}
      />
    </aside>
  );
};
