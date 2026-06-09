import React, { useCallback, useMemo, useState } from 'react';
import { countNewNotifications } from '../../core/notifications/notification-data';
import { NotificationPanelProvider } from '../../core/notifications/notification-panel-context';
import { AppBrand, type TenantCompany } from '../../shared/components/app-brand/app-brand';
import { UserProfile } from '../../shared/components/user-profile/user-profile';
import { MainMenu } from '../../shared/components/main-menu/main-menu';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';
import { UtilityMenu } from '../../shared/components/utility-menu/utility-menu';
import { Navbar } from '../navbar/navbar';
import { TenantSetupWizard } from '../../features/tenant/components/tenant-setup-wizard';
import type { EmployeeId } from '../../features/employees/types/employee.types';

interface ShellProps {
  currentView: 'employee' | 'tenant';
  onToggleView: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCompany?: TenantCompany;
  onSelectCompany?: (company: TenantCompany) => void;
  onAddCompany?: () => void;
  setupWizardOpen?: boolean;
  onCloseSetupWizard?: () => void;
  onGoToLandingPage: () => void;
  selectedEmployeeId: EmployeeId;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentView,
  onToggleView,
  activeTab,
  setActiveTab,
  selectedCompany,
  onSelectCompany,
  onAddCompany,
  setupWizardOpen = false,
  onCloseSetupWizard,
  onGoToLandingPage,
  selectedEmployeeId,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationUnreadCount = useMemo(
    () => countNewNotifications(currentView, selectedEmployeeId),
    [currentView, selectedEmployeeId]
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

  if (setupWizardOpen && onCloseSetupWizard) {
    return (
      <NotificationPanelProvider value={notificationPanelContext}>
        <div className="dashboard-shell dashboard-shell--setup-wizard">
          <TenantSetupWizard
            overlay="fullscreen"
            onFinish={onCloseSetupWizard}
            onCancel={onCloseSetupWizard}
          />
        </div>
      </NotificationPanelProvider>
    );
  }

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
          <AppBrand
            selectedCompany={currentView === 'tenant' ? selectedCompany : undefined}
            onSelectCompany={currentView === 'tenant' ? onSelectCompany : undefined}
            onAddCompany={currentView === 'tenant' ? onAddCompany : undefined}
            collapsed={sidebarCollapsed}
          />
        </div>

        <div className="sidebar-panel sidebar-panel--profile">
          <UserProfile currentView={currentView} collapsed={sidebarCollapsed} />
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
            onOpenSetupWizard={
              currentView === 'tenant' ? onAddCompany : undefined
            }
          />
        </div>

        <div className="content-pane__body">
          <div className="main-scrollable">
            <main className="main-content-slot">{children}</main>
          </div>

          {notificationsOpen && (
            <NotificationPanel
              currentView={currentView}
              selectedEmployeeId={selectedEmployeeId}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
    </NotificationPanelProvider>
  );
};
