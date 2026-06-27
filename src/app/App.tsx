import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AutomationRoutes } from './automationRoutes';
import './App.css';
import { Shell } from '../layouts/shell/shell';
import { LandingPage } from '../features/landing/pages/landing-page';
import { EmployeeProvider } from '../features/employees/context/employee-context';
import { DEFAULT_EMPLOYEE_ID } from '../features/employees/data/employees.data';
import type { EmployeeId } from '../features/employees/types/employee.types';
import {
  TENANT_MAIN_ITEMS,
  TENANT_BOTTOM_ITEMS,
  EMPLOYEE_ITEMS
} from '../shared/components/main-menu/main-menu';
import { findNavItem, getSubItemLabel, resolveSubItemId } from '../shared/utils/nav-utils';
import { getProfileCapabilities, isManagementOnlyPath } from '../shared/utils/profile-capabilities';
import { getEmployeeById } from '../features/employees/data/employees.data';

import { EmployeeDashboard } from '../features/employees/pages/employee-dashboard/employee-dashboard';
import { EmployeeAttendance } from '../features/employees/pages/employee-attendance/employee-attendance';
import { EmployeeLeave } from '../features/employees/pages/employee-leave/employee-leave';
import { EmployeeCalendar } from '../features/employees/pages/employee-calendar/employee-calendar';
import { EmployeeChat } from '../features/employees/pages/employee-chat/employee-chat';
import { EmployeeReports } from '../features/employees/pages/employee-reports/employee-reports';

import { TenantCalendar } from '../features/tenant/pages/tenant-calendar/tenant-calendar';
import { TenantAttendance } from '../features/tenant/pages/tenant-attendance/tenant-attendance';
import { TenantAllCompaniesEmptyPage } from '../features/tenant/pages/tenant-all-companies-empty/tenant-all-companies-empty';
import { TenantSectionPage } from '../features/tenant/pages/tenant-section-page/tenant-section-page';
import { DepartmentsPage } from '../features/organization/departments/DepartmentsPage';
import { PositionsPage } from '../features/organization/positions/PositionsPage';
import { ChecklistTemplatesPage } from '../features/people/checklist-templates/ChecklistTemplatesPage';
import { LeaveTypesPage } from '../features/leave/configuration/LeaveTypesPage';
import { LeavePoliciesPage } from '../features/leave/configuration/LeavePoliciesPage';
import { LeaveEntitlementsPage } from '../features/leave/configuration/LeaveEntitlementsPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { RolesPermissionsPage } from '../features/admin/RolesPermissionsPage';
import { AuditLogPage } from '../features/admin/AuditLogPage';
import { GeneralSettingsPage } from '../features/settings/GeneralSettingsPage';
import { BrandingSettingsPage } from '../features/settings/BrandingSettingsPage';
import { NotificationsSettingsPage } from '../features/settings/NotificationsSettingsPage';
import { BillingSettingsPage } from '../features/settings/BillingSettingsPage';
import { DevicesSettingsPage } from '../features/settings/DevicesSettingsPage';
import { TENANT_DEVICE_CAPABILITY } from '../features/settings/settingsConfig';
import { SchedulesPage } from '../features/time-attendance/configuration/SchedulesPage';
import { ClockInPolicyPage } from '../features/time-attendance/clock-in-policy/ClockInPolicyPage';
import { PeopleEmployeesRoutes } from '../features/people/employees/PeopleEmployeesRoutes';
import { WorkProvider } from '../features/work/context/work-context';
import { InboxProvider } from '../core/notifications/inbox-context';
import { WorkRoutes } from '../features/work/WorkRoutes';
import {
  DEFAULT_TENANT_COMPANY,
  type TenantCompany
} from '../shared/components/app-brand/app-brand';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<EmployeeId>(DEFAULT_EMPLOYEE_ID);
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [activeSubItemId, setActiveSubItemId] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<TenantCompany>(DEFAULT_TENANT_COMPANY);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);

  const shellMode = getProfileCapabilities(getEmployeeById(selectedEmployeeId)).shellMode;

  useEffect(() => {
    if (location.pathname.startsWith('/people/employees')) {
      setActiveTab('People');
      setActiveSubItemId('employees');
      return;
    }
    if (location.pathname.startsWith('/people/checklist-templates')) {
      setActiveTab('People');
      setActiveSubItemId('checklist-templates');
      return;
    }
    if (location.pathname.startsWith('/organization/')) {
      setActiveTab('Organization');
      setActiveSubItemId(location.pathname.includes('/positions') ? 'positions' : 'departments');
      return;
    }
    if (location.pathname.startsWith('/automations')) {
      setActiveTab('Settings');
      setActiveSubItemId('automations');
    }
  }, [location.pathname]);

  const handleSubItemSelect = (id: string) => {
    setActiveSubItemId(id);
    if (activeTab === 'People' && id === 'employees') {
      navigate('/people/employees');
      return;
    }
    if (activeTab === 'People' && id === 'checklist-templates') {
      navigate('/people/checklist-templates');
      return;
    }
    if (activeTab === 'Organization' && (id === 'positions' || id === 'departments')) {
      navigate(id === 'positions' ? '/organization/positions' : '/organization/departments');
      return;
    }
    if (activeTab === 'Settings' && id === 'automations') {
      navigate('/automations');
      return;
    }
    if (activeTab === 'Settings' && id === 'bulk-onboarding') {
      navigate('/people/employees');
    }
  };

  const clearDeepLinkRoutes = () => {
    if (
      location.pathname.startsWith('/organization/') ||
      location.pathname.startsWith('/automations') ||
      location.pathname.startsWith('/people/')
    ) {
      navigate('/');
    }
  };

  // Redirect to home when profile switches away from management while on a management-only route.
  useEffect(() => {
    if (shellMode === 'employee' && isManagementOnlyPath(location.pathname)) {
      navigate('/');
    }
  }, [shellMode, location.pathname, navigate]);

  const openSetupWizard = () => setSetupWizardOpen(true);
  const closeSetupWizard = () => setSetupWizardOpen(false);

  const renderSectionPage = (
    section: string,
    navItems: typeof TENANT_MAIN_ITEMS,
    subItemId: string
  ) => {
    const navItem = findNavItem(navItems, section);
    const subLabel = getSubItemLabel(navItem, subItemId);
    return (
      <TenantSectionPage
        section={section}
        subSection={subLabel}
      />
    );
  };

  const isAutomationRoute = location.pathname.startsWith('/automations');

  const renderActivePageContent = () => {
    if (isAutomationRoute || (activeTab === 'Settings' && activeSubItemId === 'automations')) {
      return <AutomationRoutes />;
    }

    if (shellMode === 'employee') {
      const allEmployeeItems = [...EMPLOYEE_ITEMS, ...TENANT_BOTTOM_ITEMS];
      const employeeNavItem = findNavItem(allEmployeeItems, activeTab);
      if ((employeeNavItem?.subSections.length ?? 0) > 0 && activeTab === 'Settings') {
        const resolvedSubId = resolveSubItemId(employeeNavItem, activeSubItemId);
        switch (resolvedSubId) {
          case 'general': return <GeneralSettingsPage />;
          case 'branding': return <BrandingSettingsPage />;
          case 'users': return <AdminUsersPage />;
          case 'notifications': return <NotificationsSettingsPage />;
          case 'billing': return <BillingSettingsPage />;
          case 'devices':
            return TENANT_DEVICE_CAPABILITY ? <DevicesSettingsPage /> : <GeneralSettingsPage />;
          case 'audit-log': return <AuditLogPage />;
          case 'automations': return <AutomationRoutes />;
          case 'clock-in-policy': return <ClockInPolicyPage />;
          case 'time-off-type': return <LeaveTypesPage />;
          case 'time-off-policy': return <LeavePoliciesPage />;
          case 'entitlement': return <LeaveEntitlementsPage />;
          case 'monitoring-policy':
          case 'monitoring-privacy-setting':
          case 'app-allowlist':
            return renderSectionPage('Settings', allEmployeeItems, resolvedSubId);
          case 'bulk-onboarding': return <GeneralSettingsPage />;
          default: return <GeneralSettingsPage />;
        }
      }

      if (activeTab === 'Work') {
        const workNav = findNavItem(allEmployeeItems, activeTab);
        const resolvedSubId = resolveSubItemId(workNav, activeSubItemId);
        return <WorkRoutes activeSubItemId={resolvedSubId} />;
      }

      if (activeTab === 'Time & Attendance') {
        const taNav = findNavItem(allEmployeeItems, activeTab);
        const resolvedSubId = resolveSubItemId(taNav, activeSubItemId);
        switch (resolvedSubId) {
          case 'schedules': return <SchedulesPage />;
          case 'time-off': return <EmployeeLeave />;
          case 'time-tracking': return <EmployeeAttendance />;
          default: return renderSectionPage(activeTab, allEmployeeItems, resolvedSubId);
        }
      }

      switch (activeTab) {
        case 'Dashboard':
          return <EmployeeDashboard onNavigateTab={setActiveTab} />;
        case 'Calendar':
          return <EmployeeCalendar />;
        case 'People':
          return <PeopleEmployeesRoutes canAddEmployee />;
        case 'Chat':
          return <EmployeeChat />;
        case 'Reports':
          return <EmployeeReports />;
        default:
          return <EmployeeDashboard />;
      }
    }

    if (selectedCompany === 'All') {
      return <TenantAllCompaniesEmptyPage />;
    }

    const allTenantItems = [...TENANT_MAIN_ITEMS, ...TENANT_BOTTOM_ITEMS];

    const navItem = findNavItem(allTenantItems, activeTab);
    const hasSubNav = (navItem?.subSections.length ?? 0) > 0;

    if (hasSubNav) {
      const resolvedSubId = resolveSubItemId(navItem, activeSubItemId);
      if (activeTab === 'People' && (resolvedSubId === 'checklist-templates' || location.pathname.startsWith('/people/checklist-templates'))) {
        return <ChecklistTemplatesPage />;
      }
      if (activeTab === 'People' && (resolvedSubId === 'employees' || location.pathname.startsWith('/people/employees'))) {
        return <PeopleEmployeesRoutes canAddEmployee canBulkOnboard />;
      }
      if (activeTab === 'Organization') {
        if (resolvedSubId === 'positions') {
          return <PositionsPage />;
        }
        if (resolvedSubId === 'roles-permissions') {
          return <RolesPermissionsPage />;
        }
        return <DepartmentsPage />;
      }
      if (activeTab === 'Settings') {
        switch (resolvedSubId) {
          case 'general':
            return <GeneralSettingsPage />;
          case 'branding':
            return <BrandingSettingsPage />;
          case 'users':
            return <AdminUsersPage />;
          case 'notifications':
            return <NotificationsSettingsPage />;
          case 'billing':
            return <BillingSettingsPage />;
          case 'devices':
            return TENANT_DEVICE_CAPABILITY ? <DevicesSettingsPage /> : <GeneralSettingsPage />;
          case 'audit-log':
            return <AuditLogPage />;
          case 'automations':
            return <AutomationRoutes />;
          case 'clock-in-policy':
            return <ClockInPolicyPage />;
          case 'time-off-type':
            return <LeaveTypesPage />;
          case 'time-off-policy':
            return <LeavePoliciesPage />;
          case 'entitlement':
            return <LeaveEntitlementsPage />;
          case 'monitoring-policy':
          case 'monitoring-privacy-setting':
          case 'app-allowlist':
            return renderSectionPage('Settings', allTenantItems, resolvedSubId);
          default:
            return <GeneralSettingsPage />;
        }
      }
      if (activeTab === 'Work') {
        return <WorkRoutes activeSubItemId={resolvedSubId} />;
      }
      if (activeTab === 'Time & Attendance') {
        switch (resolvedSubId) {
          case 'time-tracking':
            return <EmployeeAttendance />;
          case 'schedules':
            return <SchedulesPage />;
          case 'time-off':
            return <EmployeeLeave />;
          default:
            return renderSectionPage(activeTab, allTenantItems, resolvedSubId);
        }
      }
      return renderSectionPage(activeTab, allTenantItems, resolvedSubId);
    }

    switch (activeTab) {
      case 'Dashboard':
        return <EmployeeDashboard onNavigateTab={setActiveTab} />;
      case 'Calendar':
        return <TenantCalendar />;
      case 'Reports':
        return <EmployeeReports />;
      case 'Attendance':
        return <TenantAttendance />;
      default:
        return <TenantSectionPage section={activeTab} />;
    }
  };

  if (isLandingPage) {
    return <LandingPage onGoToApp={() => setIsLandingPage(false)} />;
  }

  return (
    <InboxProvider>
    <WorkProvider onNavigateToList={setActiveSubItemId}>
      <EmployeeProvider
        selectedEmployeeId={selectedEmployeeId}
        onSelectEmployee={setSelectedEmployeeId}
      >
        <Shell
        currentView={shellMode}
        onToggleView={() => undefined}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubItemId={activeSubItemId}
        setActiveSubItemId={setActiveSubItemId}
        onSubItemSelect={handleSubItemSelect}
        onLeaveDeepLinkRoute={clearDeepLinkRoutes}
        selectedCompany={selectedCompany}
        onSelectCompany={setSelectedCompany}
        onAddCompany={openSetupWizard}
        setupWizardOpen={shellMode === 'tenant' && setupWizardOpen}
        onCloseSetupWizard={closeSetupWizard}
        onGoToLandingPage={() => setIsLandingPage(true)}
      >
        {renderActivePageContent()}
      </Shell>
      </EmployeeProvider>
    </WorkProvider>
    </InboxProvider>
  );
}

export default App;
