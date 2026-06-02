import React from 'react';
import { Calendar } from 'lucide-react';
import { appNavDateLabel } from '../../features/employees/data/employee-task-overview.data';
import { ControlPanel } from '../../shared/components/control-panel/control-panel';
import { NotificationToggle } from '../../shared/components/notification-toggle/notification-toggle';
import { SidebarToggle } from '../../shared/components/sidebar-toggle/sidebar-toggle';
import { ThemeSwitcher } from '../../shared/components/theme-switcher/theme-switcher';

interface NavbarProps {
  currentView: 'employee' | 'tenant';
  activeTab: string;
  onToggle: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  notificationsOpen: boolean;
  notificationUnreadCount: number;
  onToggleNotifications: () => void;
  onGoToLandingPage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeTab,
  onToggle,
  sidebarCollapsed,
  onToggleSidebar,
  notificationsOpen,
  notificationUnreadCount,
  onToggleNotifications,
  onGoToLandingPage
}) => {
  const portalName = currentView === 'tenant' ? 'Tenant Workspace' : 'Employee Workspace';

  return (
    <header className="app-navbar">
      <div className="app-navbar__start">
        <SidebarToggle collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />

        <div className="app-navbar__text">
          <p className="app-navbar__title" role="heading" aria-level={1}>
            {activeTab}
          </p>
          <p className="app-navbar__subtitle">{portalName}</p>
        </div>
      </div>

      <div className="app-navbar__actions">
        <div className="app-navbar__date-tab" role="status" aria-label={`Today: ${appNavDateLabel}`}>
          <Calendar size={14} aria-hidden="true" />
          <span>{appNavDateLabel}</span>
        </div>
        <ThemeSwitcher />
        <NotificationToggle
          isOpen={notificationsOpen}
          unreadCount={notificationUnreadCount}
          onToggle={onToggleNotifications}
        />
        <ControlPanel 
          currentView={currentView} 
          onToggle={onToggle} 
          onGoToLandingPage={onGoToLandingPage} 
        />
      </div>
    </header>
  );
};
