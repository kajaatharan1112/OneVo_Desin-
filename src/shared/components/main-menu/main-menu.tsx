import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Calendar, Users, Clock, MessageSquare,
  PieChart, Briefcase, Building2, Building, CalendarMinus, Zap, Activity,
  ShieldCheck, Settings, UserCheck, UserMinus, FileText, Hash, ListChecks,
  CalendarDays, TrendingUp, Shield, Eye, List, Bell, Palette, Lock,
  CreditCard, Monitor, CalendarClock
} from 'lucide-react';
import type { SubNavSection } from '../sub-nav-panel/sub-nav-panel';

export interface NavItem {
  id: string;
  label: string;
  /** Shorter label for the 52px icon rail when `label` would overflow. */
  railLabel?: string;
  icon: React.ReactNode;
  subSections: SubNavSection[];
}

export const TENANT_MAIN_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',   icon: <LayoutDashboard size={18} />, subSections: [] },
  { id: 'people',      label: 'People',      icon: <Users size={18} />,           subSections: [
    { id: 'main', items: [
      { id: 'onboarding',  label: 'Onboarding',  icon: <UserCheck size={13} /> },
      { id: 'offboarding', label: 'Offboarding', icon: <UserMinus size={13} /> },
      { id: 'checklist-templates', label: 'Checklist Templates', icon: <ListChecks size={13} /> },
    ]},
  ]},
  { id: 'organization', label: 'Organization', icon: <Building2 size={18} />, subSections: [
    { id: 'main', items: [
      { id: 'departments', label: 'Departments', icon: <Building size={13} /> },
      { id: 'positions',   label: 'Positions',   icon: <Briefcase size={13} /> },
    ]},
  ]},
  { id: 'leave',       label: 'Leave',       icon: <CalendarMinus size={18} />,   subSections: [
    { id: 'config', label: 'Configuration', collapsible: true, defaultOpen: true, items: [
      { id: 'leave-policies', label: 'Leave Policies', icon: <FileText size={13} /> },
      { id: 'leave-types',    label: 'Leave Types',    icon: <Hash size={13} />     },
    ]},
  ]},
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Schedule', icon: <CalendarClock size={18} />, subSections: [
    { id: 'calendar', label: 'Calendar', collapsible: true, defaultOpen: true, items: [
      { id: 'holiday-calendar', label: 'Holiday Calendar', icon: <CalendarDays size={13} /> },
      { id: 'work-weeks',       label: 'Work Weeks',       icon: <Calendar size={13} />     },
    ]},
    { id: 'schedules', label: 'Schedules', collapsible: true, defaultOpen: true, items: [
      { id: 'shift-schedules', label: 'Shift Schedules', icon: <Clock size={13} />       },
      { id: 'work-patterns',   label: 'Work Patterns',   icon: <TrendingUp size={13} />  },
    ]},
    { id: 'rules', label: 'Rules', collapsible: true, defaultOpen: true, items: [
      { id: 'overtime-rules', label: 'Overtime Rules', icon: <Activity size={13} /> },
    ]},
  ]},
  { id: 'project',     label: 'Project',     icon: <FolderOpen size={18} />,      subSections: [] },
  { id: 'automations', label: 'Automations', icon: <Zap size={18} />, subSections: [] },
  { id: 'monitoring',  label: 'Monitoring',  icon: <Activity size={18} />,        subSections: [
    { id: 'settings', label: 'Settings', collapsible: true, defaultOpen: true, items: [
      { id: 'policy-settings',  label: 'Policy Settings',  icon: <Shield size={13} /> },
      { id: 'privacy-settings', label: 'Privacy Settings', icon: <Eye size={13} />    },
      { id: 'app-allowlist',    label: 'App Allowlist',    icon: <List size={13} />   },
    ]},
  ]},
  { id: 'admin',       label: 'Admin',       icon: <ShieldCheck size={18} />,     subSections: [
    { id: 'access', label: 'Access Control', collapsible: true, defaultOpen: true, items: [
      { id: 'roles', label: 'Roles & Permissions', icon: <ShieldCheck size={13} /> },
      { id: 'users', label: 'Users',               icon: <Users size={13} />       },
    ]},
    { id: 'config', label: 'Configuration', collapsible: true, defaultOpen: true, items: [
      { id: 'notifications', label: 'Notifications', icon: <Bell size={13} /> },
    ]},
  ]},
];

export const TENANT_BOTTOM_ITEMS: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, subSections: [
    { id: 'workspace', label: 'Workspace', collapsible: true, defaultOpen: true, items: [
      { id: 'general',  label: 'General',  icon: <Settings size={13} /> },
      { id: 'branding', label: 'Branding', icon: <Palette size={13} />  },
      { id: 'security', label: 'Security', icon: <Lock size={13} />     },
    ]},
    { id: 'billing-devices', label: 'Billing & Devices', collapsible: true, defaultOpen: true, items: [
      { id: 'billing', label: 'Billing', icon: <CreditCard size={13} /> },
      { id: 'device',  label: 'Device',  icon: <Monitor size={13} />    },
    ]},
  ]},
];

export const EMPLOYEE_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={18} />, subSections: [] },
  { id: 'project',    label: 'Project',    icon: <FolderOpen size={18} />,      subSections: [] },
  { id: 'workspace',  label: 'Workspace',  icon: <Briefcase size={18} />,       subSections: [] },
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Schedule', icon: <CalendarClock size={18} />, subSections: [
    { id: 'main', items: [
      { id: 'calendar',   label: 'Calendar',   icon: <Calendar size={13} /> },
      { id: 'attendance', label: 'Attendance', icon: <Clock size={13} />    },
    ]},
  ]},
  { id: 'people',     label: 'People',     icon: <Users size={18} />,           subSections: [
    { id: 'main', items: [
      { id: 'employees',   label: 'Employees',   icon: <Users size={13} />     },
      { id: 'onboarding',  label: 'Onboarding',  icon: <UserCheck size={13} /> },
      { id: 'offboarding', label: 'Offboarding', icon: <UserMinus size={13} /> },
    ]},
  ]},
  { id: 'chat',       label: 'Chat',       icon: <MessageSquare size={18} />,   subSections: [] },
  { id: 'reports',    label: 'Reports',    icon: <PieChart size={18} />,        subSections: [] },
];

interface MainMenuProps {
  currentView: 'employee' | 'tenant';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveSubItemId: (id: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentView,
  activeTab,
  setActiveTab,
  setActiveSubItemId
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainItems = currentView === 'tenant' ? TENANT_MAIN_ITEMS : EMPLOYEE_ITEMS;
  const bottomItems = currentView === 'tenant' ? TENANT_BOTTOM_ITEMS : [];

  useEffect(() => {
    if (!mainItems.find(i => i.label === activeTab) && !bottomItems.find(i => i.label === activeTab)) {
      setActiveTab(mainItems[0].label);
    }
  }, [currentView]);

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.label);
    const firstSubItem = item.subSections[0]?.items[0];
    const subId = firstSubItem?.id ?? '';
    setActiveSubItemId(subId);

    if (currentView === 'tenant' && item.label === 'People' && subId === 'checklist-templates') {
      navigate('/people/checklist-templates');
    }
    if (currentView === 'tenant' && item.label === 'Organization' && subId) {
      navigate(subId === 'positions' ? '/organization/positions' : '/organization/departments');
    }
    if (currentView === 'tenant' && item.label === 'Automations') {
      navigate('/automations');
      return;
    }
    if (location.pathname.startsWith('/automations')) {
      navigate('/');
    }
  };

  const renderItem = (item: NavItem) => (
    <button
      key={item.id}
      type="button"
      className={`rail-item${activeTab === item.label ? ' rail-item--active' : ''}`}
      onClick={() => handleNavClick(item)}
      aria-current={activeTab === item.label ? 'page' : undefined}
      title={item.label}
    >
      <span className="rail-item__icon">{item.icon}</span>
      <span className="rail-item__label">{item.railLabel ?? item.label}</span>
    </button>
  );

  return (
    <nav className="rail-nav" aria-label="Main navigation">
      <div className="rail-nav__main">
        {mainItems.map(renderItem)}
      </div>

      {bottomItems.length > 0 && (
        <>
          <div className="rail-nav__spacer" />
          <div className="rail-nav__bottom">
            {bottomItems.map(renderItem)}
          </div>
        </>
      )}
    </nav>
  );
};
