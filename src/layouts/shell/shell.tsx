import React, { useCallback, useMemo, useState } from 'react';
import { countNewNotifications } from '../../core/notifications/notification-data';
import { NotificationPanelProvider } from '../../core/notifications/notification-panel-context';
import { AppBrand } from '../../shared/components/app-brand/app-brand';
import { UserProfile } from '../../shared/components/user-profile/user-profile';
import { MainMenu } from '../../shared/components/main-menu/main-menu';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';
import { UtilityMenu } from '../../shared/components/utility-menu/utility-menu';
import { Navbar } from '../navbar/navbar';

interface ShellProps {
  currentView: 'employee' | 'tenant';
  onToggleView: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoToLandingPage: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentView,
  onToggleView,
  activeTab,
  setActiveTab,
  onGoToLandingPage,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationUnreadCount = useMemo(
    () => countNewNotifications(currentView),
    [currentView]
  );

  const handleToggleNotifications = () => {
    setNotificationsOpen((open) => {
      const next = !open;
      if (next) {
        setSidebarCollapsed(true);
      }
      return next;
    });
  };

  const openNotificationPanel = useCallback(() => {
    setSidebarCollapsed(true);
    setNotificationsOpen(true);
  }, []);

  const notificationPanelContext = useMemo(
    () => ({ openNotificationPanel }),
    [openNotificationPanel]
  );

  const shellClassName = [
    'dashboard-shell',
    sidebarCollapsed && 'dashboard-shell--sidebar-collapsed',
    notificationsOpen && 'dashboard-shell--notifications-open'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <NotificationPanelProvider value={notificationPanelContext}>
    <div className={shellClassName}>
      <aside
        id="app-sidebar"
        className="sidebar-shell"
        aria-label="Main navigation"
        aria-hidden={false}
      >
        <div className="sidebar-panel sidebar-panel--brand">
          <AppBrand />
        </div>

        <div className="sidebar-panel sidebar-panel--profile">
          <UserProfile currentView={currentView} />
        </div>

        <div className="sidebar-panel sidebar-panel--menu">
          <MainMenu
            currentView={currentView}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            collapsed={sidebarCollapsed}
          />
        </div>

        <div className="sidebar-panel sidebar-panel--utility">
          <UtilityMenu />
        </div>
      </aside>

      <div className="content-pane">
        <div className="content-panel content-panel--header">
          <Navbar
            currentView={currentView}
            activeTab={activeTab}
            onToggle={onToggleView}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
            notificationsOpen={notificationsOpen}
            notificationUnreadCount={notificationUnreadCount}
            onToggleNotifications={handleToggleNotifications}
            onGoToLandingPage={onGoToLandingPage}
          />
        </div>

        <div className="content-pane__body">
          <div className="main-scrollable">
            <main className="main-content-slot">{children}</main>
          </div>

          {notificationsOpen && (
            <NotificationPanel
              currentView={currentView}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
    </NotificationPanelProvider>
  );
};
