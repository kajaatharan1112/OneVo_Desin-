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
import { TenantPeople } from '../features/tenant/pages/tenant-people/tenant-people';
import { TenantAttendance } from '../features/tenant/pages/tenant-attendance/tenant-attendance';
import { TenantChat } from '../features/tenant/pages/tenant-chat/tenant-chat';
import { TenantRequests } from '../features/tenant/pages/tenant-requests/tenant-requests';
import { TenantReports } from '../features/tenant/pages/tenant-reports/tenant-reports';
import { TenantAllCompaniesEmptyPage } from '../features/tenant/pages/tenant-all-companies-empty/tenant-all-companies-empty';
import { TenantSectionPage } from '../features/tenant/pages/tenant-section-page/tenant-section-page';
import { DepartmentsPage } from '../features/organization/departments/DepartmentsPage';
import { PositionsPage } from '../features/organization/positions/PositionsPage';
import {
  DEFAULT_TENANT_COMPANY,
  type TenantCompany
} from '../shared/components/app-brand/app-brand';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<EmployeeId>(DEFAULT_EMPLOYEE_ID);
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  const [view, setView] = useState<'employee' | 'tenant'>('employee');
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [activeSubItemId, setActiveSubItemId] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<TenantCompany>(DEFAULT_TENANT_COMPANY);
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);

  useEffect(() => {
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
      switch (activeTab) {
        case 'Dashboard':
          return <EmployeeDashboard onNavigateTab={setActiveTab} />;
        case 'Project':
          return <EmployeeWorkManagement />;
        case 'Workspace':
          return <EmployeeWorkManagement />;
        case 'Calendar':
          return <EmployeeCalendar />;
        case 'People': {
          const peopleNav = findNavItem(EMPLOYEE_ITEMS, activeTab);
          const resolvedSubId = resolveSubItemId(peopleNav, activeSubItemId);
          if (resolvedSubId) return renderSectionPage(activeTab, EMPLOYEE_ITEMS, resolvedSubId);
          return <EmployeePeople />;
        }
        case 'Attendance':
          return <EmployeeAttendance />;
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
      if (activeTab === 'Organization') {
        if (resolvedSubId === 'positions' || location.pathname.includes('/positions')) {
          return <PositionsPage />;
        }
        return <DepartmentsPage />;
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
      case 'People':
        return <TenantPeople />;
      case 'Attendance':
        return <TenantAttendance />;
      case 'Chat':
        return <TenantChat />;
      case 'Requests':
        return <TenantRequests />;
      case 'Reports':
        return <TenantReports />;
      default:
        return <TenantSectionPage section={activeTab} icon={navItem?.icon} />;
    }
  };

  if (isLandingPage) {
    return <LandingPage onGoToApp={() => setIsLandingPage(false)} />;
  }

  return (
    <EmployeeProvider
      selectedEmployeeId={selectedEmployeeId}
      onSelectEmployee={setSelectedEmployeeId}
    >
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
        selectedEmployeeId={selectedEmployeeId}
      >
        {renderActivePageContent()}
      </Shell>
    </EmployeeProvider>
  );
}

export default App;
