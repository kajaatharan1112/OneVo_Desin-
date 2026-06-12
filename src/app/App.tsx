import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AutomationRoutes } from './automationRoutes';
import './App.css';
import { Shell } from '../layouts/shell/shell';
import { LandingPage } from '../features/landing/pages/landing-page';
import {
  TENANT_MAIN_ITEMS,
  TENANT_BOTTOM_ITEMS,
  EMPLOYEE_ITEMS
} from '../shared/components/main-menu/main-menu';
import { findNavItem, getSubItemLabel, resolveSubItemId } from '../shared/utils/nav-utils';

import { EmployeeDashboard } from '../features/employees/pages/employee-dashboard/employee-dashboard';
import { EmployeeWorkManagement } from '../features/employees/pages/employee-work-management/employee-work-management';
import { EmployeeCalendar } from '../features/employees/pages/employee-calendar/employee-calendar';
import { EmployeePeople } from '../features/employees/pages/employee-people/employee-people';
import { EmployeeAttendance } from '../features/employees/pages/employee-attendance/employee-attendance';
import { EmployeeChat } from '../features/employees/pages/employee-chat/employee-chat';
import { EmployeeReports } from '../features/employees/pages/employee-reports/employee-reports';

import { TenantDashboard } from '../features/tenant/pages/tenant-dashboard/tenant-dashboard';
import { TenantProject } from '../features/tenant/pages/tenant-project/tenant-project';
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
import {
  DEFAULT_TENANT_COMPANY,
  type TenantCompany
} from '../shared/components/app-brand/app-brand';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [view, setView] = useState<'employee' | 'tenant'>('employee');
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [activeSubItemId, setActiveSubItemId] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<TenantCompany>(DEFAULT_TENANT_COMPANY);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/people/checklist-templates')) {
      setView('tenant');
      setActiveTab('People');
      setActiveSubItemId('checklist-templates');
      return;
    }
    if (location.pathname.startsWith('/organization/')) {
      setView('tenant');
      setActiveTab('Organization');
      setActiveSubItemId(location.pathname.includes('/positions') ? 'positions' : 'departments');
      return;
    }
    if (location.pathname.startsWith('/automations')) {
      setView('tenant');
      setActiveTab('Automations');
      setActiveSubItemId('');
    }
  }, [location.pathname]);

  const handleSubItemSelect = (id: string) => {
    setActiveSubItemId(id);
    if (activeTab === 'People' && id === 'checklist-templates') {
      navigate('/people/checklist-templates');
      return;
    }
    if (activeTab === 'Organization') {
      navigate(id === 'positions' ? '/organization/positions' : '/organization/departments');
    }
  };

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
        icon={navItem?.icon}
      />
    );
  };

  const isAutomationRoute = location.pathname.startsWith('/automations');

  const renderActivePageContent = () => {
    if (isAutomationRoute || activeTab === 'Automations') {
      return <AutomationRoutes />;
    }

    if (view === 'employee') {
      const allEmployeeItems = [...EMPLOYEE_ITEMS, ...TENANT_BOTTOM_ITEMS];
      const employeeNavItem = findNavItem(allEmployeeItems, activeTab);
      if ((employeeNavItem?.subSections.length ?? 0) > 0 && activeTab === 'Settings') {
        const resolvedSubId = resolveSubItemId(employeeNavItem, activeSubItemId);
        return renderSectionPage(activeTab, allEmployeeItems, resolvedSubId);
      }

      switch (activeTab) {
        case 'Dashboard':
          return <EmployeeDashboard onNavigateTab={setActiveTab} />;
        case 'Project':
          return <EmployeeWorkManagement />;
        case 'Workspace':
          return <EmployeeWorkManagement />;
        case 'Time & Attendance': {
          const timeNav = findNavItem(EMPLOYEE_ITEMS, activeTab);
          const resolvedSubId = resolveSubItemId(timeNav, activeSubItemId);
          if (resolvedSubId === 'calendar') return <EmployeeCalendar />;
          if (resolvedSubId === 'attendance') return <EmployeeAttendance />;
          return renderSectionPage(activeTab, EMPLOYEE_ITEMS, resolvedSubId);
        }
        case 'People': {
          const peopleNav = findNavItem(EMPLOYEE_ITEMS, activeTab);
          const resolvedSubId = resolveSubItemId(peopleNav, activeSubItemId);
          if (resolvedSubId) return renderSectionPage(activeTab, EMPLOYEE_ITEMS, resolvedSubId);
          return <EmployeePeople />;
        }
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
      if (activeTab === 'Organization') {
        if (resolvedSubId === 'positions' || location.pathname.includes('/positions')) {
          return <PositionsPage />;
        }
        return <DepartmentsPage />;
      }
      if (activeTab === 'Leave') {
        switch (resolvedSubId) {
          case 'leave-policies':
            return <LeavePoliciesPage />;
          case 'leave-entitlements':
            return <LeaveEntitlementsPage />;
          case 'leave-types':
          default:
            return <LeaveTypesPage />;
        }
      }
      return renderSectionPage(activeTab, allTenantItems, resolvedSubId);
    }

    switch (activeTab) {
      case 'Dashboard':
        return <TenantDashboard />;
      case 'Project':
        return <TenantProject />;
      case 'Calendar':
        return <TenantCalendar />;
      case 'Attendance':
        return <TenantAttendance />;
      default:
        return <TenantSectionPage section={activeTab} icon={navItem?.icon} />;
    }
  };

  if (isLandingPage) {
    return <LandingPage onGoToApp={() => setIsLandingPage(false)} />;
  }

  return (
    <Shell
      currentView={view}
      onToggleView={() => setView((v) => (v === 'employee' ? 'tenant' : 'employee'))}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeSubItemId={activeSubItemId}
      setActiveSubItemId={handleSubItemSelect}
      selectedCompany={selectedCompany}
      onSelectCompany={setSelectedCompany}
      onAddCompany={openSetupWizard}
      setupWizardOpen={view === 'tenant' && setupWizardOpen}
      onCloseSetupWizard={closeSetupWizard}
      onGoToLandingPage={() => setIsLandingPage(true)}
    >
      {renderActivePageContent()}
    </Shell>
  );
}

export default App;
