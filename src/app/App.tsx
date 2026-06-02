import { useState } from 'react';
import './App.css';
import { Shell } from '../layouts/shell/shell';
import { LandingPage } from '../features/landing/pages/landing-page';

// Employee Pages
import { EmployeeDashboard } from '../features/employees/pages/employee-dashboard/employee-dashboard';
import { EmployeeWorkManagement } from '../features/employees/pages/employee-work-management/employee-work-management';
import { EmployeeCalendar } from '../features/employees/pages/employee-calendar/employee-calendar';
import { EmployeePeople } from '../features/employees/pages/employee-people/employee-people';
import { EmployeeAttendance } from '../features/employees/pages/employee-attendance/employee-attendance';
import { EmployeeChat } from '../features/employees/pages/employee-chat/employee-chat';
import { EmployeeReports } from '../features/employees/pages/employee-reports/employee-reports';

// Tenant Pages
import { TenantDashboard } from '../features/tenant/pages/tenant-dashboard/tenant-dashboard';
import { TenantProject } from '../features/tenant/pages/tenant-project/tenant-project';
import { TenantCalendar } from '../features/tenant/pages/tenant-calendar/tenant-calendar';
import { TenantPeople } from '../features/tenant/pages/tenant-people/tenant-people';
import { TenantAttendance } from '../features/tenant/pages/tenant-attendance/tenant-attendance';
import { TenantChat } from '../features/tenant/pages/tenant-chat/tenant-chat';
import { TenantRequests } from '../features/tenant/pages/tenant-requests/tenant-requests';
import { TenantReports } from '../features/tenant/pages/tenant-reports/tenant-reports';
import { TenantSetupWizard } from '../features/tenant/pages/tenant-setup-wizard/tenant-setup-wizard';

function App() {
  const [isLandingPage, setIsLandingPage] = useState<boolean>(false);
  // Set Employee View as default view state
  const [view, setView] = useState<'employee' | 'tenant'>('employee');
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Render the appropriate section context based on the active menu tab
  const renderActivePageContent = () => {
    if (view === 'employee') {
      switch (activeTab) {
        case 'Dashboard':
          return <EmployeeDashboard onNavigateTab={setActiveTab} />;
        case 'Workspace':
          return <EmployeeWorkManagement />;
        case 'Calendar':
          return <EmployeeCalendar />;
        case 'People':
          return <EmployeePeople />;
        case 'Attendance':
          return <EmployeeAttendance />;
        case 'Chat':
          return <EmployeeChat />;
        case 'Reports':
          return <EmployeeReports />;
        default:
          return <EmployeeDashboard />;
      }
    } else {
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
        case 'SetupWizard':
          return <TenantSetupWizard />;
        default:
          return <TenantDashboard />;
      }
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
      onGoToLandingPage={() => setIsLandingPage(true)}
    >
      {renderActivePageContent()}
    </Shell>
  );
}

export default App;
