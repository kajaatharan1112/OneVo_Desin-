import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeftOpen } from 'lucide-react';
import { countNewNotifications } from '../../core/notifications/notification-data';
import { NotificationPanelProvider } from '../../core/notifications/notification-panel-context';
import { type TenantCompany } from '../../shared/components/app-brand/app-brand';
import {
  MainMenu,
  TENANT_MAIN_ITEMS,
  TENANT_BOTTOM_ITEMS,
  EMPLOYEE_ITEMS
} from '../../shared/components/main-menu/main-menu';
import { resolveSubItemId } from '../../shared/utils/nav-utils';
import { SubNavPanel } from '../../shared/components/sub-nav-panel/sub-nav-panel';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';
import { RequestToast } from '../../shared/components/request-toast/request-toast';
import { Navbar } from '../navbar/navbar';
import { TenantSetupWizard } from '../../features/tenant/components/tenant-setup-wizard';

interface ShellProps {
  currentView: 'employee' | 'tenant';
  onToggleView: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubItemId: string;
  setActiveSubItemId: (id: string) => void;
  selectedCompany?: TenantCompany;
  onSelectCompany?: (company: TenantCompany) => void;
  onAddCompany?: () => void;
  setupWizardOpen?: boolean;
  onCloseSetupWizard?: () => void;
  onGoToLandingPage: () => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentView,
  onToggleView,
  activeTab,
  setActiveTab,
  activeSubItemId,
  setActiveSubItemId,
  selectedCompany,
  onSelectCompany,
  onAddCompany,
  setupWizardOpen = false,
  onCloseSetupWizard,
  onGoToLandingPage,
  children
}) => {
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [subNavCollapsed, setSubNavCollapsed] = useState(false);
  const [showActivationToast, setShowActivationToast] = useState(true);

  const allTenantItems = useMemo(
    () => [...TENANT_MAIN_ITEMS, ...TENANT_BOTTOM_ITEMS],
    []
  );

  const activeNavItem = useMemo(() => {
    const items = currentView === 'tenant'
      ? allTenantItems
      : [...EMPLOYEE_ITEMS, ...TENANT_BOTTOM_ITEMS];
    return items.find(i => i.label === activeTab);
  }, [activeTab, currentView, allTenantItems]);

  const activeSubSections = useMemo(
    () => activeNavItem?.subSections ?? [],
    [activeNavItem]
  );

  useEffect(() => {
    if (location.pathname.startsWith('/organization/')) {
      setSubNavCollapsed(false);
      return;
    }
    const firstItem = activeSubSections[0]?.items[0];
    setActiveSubItemId(firstItem?.id ?? '');
    setSubNavCollapsed(false);
    // Only reset sub-nav when the main section or workspace view changes — not on sub-item clicks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, activeTab]);

  useEffect(() => {
    if (activeSubSections.length === 0) {
      setSubNavCollapsed(false);
    }
  }, [activeSubSections.length]);

  const resolvedSubItemId = useMemo(
    () => resolveSubItemId(activeNavItem, activeSubItemId),
    [activeNavItem, activeSubItemId]
  );

  const notificationUnreadCount = useMemo(
    () => countNewNotifications(currentView),
    [currentView]
  );

  const openNotificationPanel = useCallback(() => {
    setNotificationsOpen(true);
  }, []);

  const notificationPanelContext = useMemo(
    () => ({ openNotificationPanel }),
    [openNotificationPanel]
  );

  const hasSubNav = activeSubSections.length > 0;
  const showSubNav = hasSubNav && !subNavCollapsed;

  const shellClassName = [
    'dashboard-shell',
    showSubNav && 'dashboard-shell--subnav-open',
    hasSubNav && subNavCollapsed && 'dashboard-shell--subnav-collapsed',
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

        {/* ── Full-width topbar ── */}
        <div className="content-panel content-panel--header">
          <Navbar
            currentView={currentView}
            onToggle={onToggleView}
            notificationsOpen={notificationsOpen}
            notificationUnreadCount={notificationUnreadCount}
            onToggleNotifications={() => setNotificationsOpen(open => !open)}
            selectedCompany={selectedCompany}
            onSelectCompany={onSelectCompany}
            onAddCompany={onAddCompany}
            onGoToLandingPage={onGoToLandingPage}
            onOpenSetupWizard={onAddCompany}
            onOpenActivationToast={() => setShowActivationToast(true)}
          />
        </div>

        {/* ── Body: sidebar + content ── */}
        <div className="shell-body">

          {/* ── Sidebar: 68px icon rail for both views ── */}
          <aside
            id="app-sidebar"
            className={[
              'sidebar-shell sidebar-shell--rail',
              hasSubNav && subNavCollapsed && 'sidebar-shell--subnav-collapsed'
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label="Main navigation"
          >
            <div className="sidebar-rail">
              <div className="sidebar-rail__menu">
                <MainMenu
                  currentView={currentView}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  setActiveSubItemId={setActiveSubItemId}
                />
              </div>

            </div>

            {showSubNav && (
              <SubNavPanel
                sections={activeSubSections}
                panelTitle={activeTab}
                activeId={resolvedSubItemId}
                onSelect={setActiveSubItemId}
                onCollapse={() => setSubNavCollapsed(true)}
              />
            )}

            {hasSubNav && subNavCollapsed && (
              <button
                type="button"
                className="sub-nav-reopen-tab"
                onClick={() => setSubNavCollapsed(false)}
                aria-label={`Expand ${activeTab} menu`}
                title={`Expand ${activeTab} menu`}
              >
                <PanelLeftOpen size={15} strokeWidth={2} aria-hidden />
              </button>
            )}
          </aside>

          {/* ── Content island ── */}
          <div className="content-pane">
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

      </div>

      {showActivationToast && (
        <RequestToast onClose={() => setShowActivationToast(false)} />
      )}
    </NotificationPanelProvider>
  );
};
