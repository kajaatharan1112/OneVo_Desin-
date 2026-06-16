import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Calendar, Users, UsersRound, Clock, MessageSquare,
  PieChart, Briefcase, Building2, Building, CalendarMinus, Workflow, Activity,
  ChartNoAxesCombined, ShieldCheck, Settings, FileText, Hash,
  ListChecks, Shield, Eye, List, Palette, Bell,
  CreditCard, Monitor, CalendarClock, ClipboardList, ListTodo,
  type LucideIcon,
} from 'lucide-react';
import type { SubNavSection } from '../sub-nav-panel/sub-nav-panel';
import { TENANT_DEVICE_CAPABILITY } from '../../../features/settings/settingsConfig';

const RAIL_ICON_PROPS = { size: 18, strokeWidth: 2.2 } as const;

function railIcon(Icon: LucideIcon) {
  return <Icon {...RAIL_ICON_PROPS} />;
}

export interface NavItem {
  id: string;
  label: string;
  /** Shorter label for the 52px icon rail when `label` would overflow. */
  railLabel?: string;
  icon: React.ReactNode;
  subSections: SubNavSection[];
}

const SETTINGS_SUB_ITEMS = [
  { id: 'general',           label: 'General',             icon: <Settings size={13} />      },
  { id: 'branding',          label: 'Branding',            icon: <Palette size={13} />       },
  { id: 'users',             label: 'Users',               icon: <Users size={13} />         },
  { id: 'roles-permissions', label: 'Roles & Permissions', icon: <ShieldCheck size={13} />   },
  { id: 'notifications',     label: 'Notifications',       icon: <Bell size={13} />          },
  { id: 'billing',           label: 'Billing',             icon: <CreditCard size={13} />    },
  { id: 'devices',           label: 'Devices',             icon: <Monitor size={13} />       },
  { id: 'audit-log',         label: 'Audit Log',           icon: <ClipboardList size={13} /> },
] as const;

export function buildSettingsNavItem(): NavItem {
  const items = SETTINGS_SUB_ITEMS.filter(
    item => item.id !== 'devices' || TENANT_DEVICE_CAPABILITY
  );
  return {
    id: 'settings',
    label: 'Settings',
    icon: railIcon(Settings),
    subSections: [{ id: 'main', items: [...items] }],
  };
}

/** Tenant-wide administration — single main-rail entry (no separate Admin item). */
export const SETTINGS_NAV_ITEM: NavItem = buildSettingsNavItem();

/** Unified work area — projects are the main container; workspace is a filter context. */
export const WORK_NAV_ITEM: NavItem = {
  id: 'work',
  label: 'Work',
  icon: railIcon(FolderKanban),
  subSections: [{
    id: 'main',
    items: [
      { id: 'my-work',   label: 'My Work',   icon: <ListTodo size={13} />      },
      { id: 'projects',  label: 'Projects',  icon: <FolderKanban size={13} />  },
      { id: 'documents', label: 'Documents', icon: <FileText size={13} />      },
    ],
  }],
};

export const TENANT_MAIN_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',   railLabel: 'Home', icon: railIcon(LayoutDashboard), subSections: [] },
  { id: 'organization', label: 'Organization', railLabel: 'Org', icon: railIcon(Building2), subSections: [
    { id: 'main', items: [
      { id: 'departments', label: 'Departments', icon: <Building size={13} /> },
      { id: 'positions',   label: 'Positions',   icon: <Briefcase size={13} /> },
    ]},
  ]},
  { id: 'people',      label: 'People',      icon: railIcon(UsersRound),      subSections: [
    { id: 'main', items: [
      { id: 'employees', label: 'Employees', icon: <Users size={13} /> },
      { id: 'checklist-templates', label: 'Checklist Templates', icon: <ListChecks size={13} /> },
    ]},
  ]},
  { id: 'leave', label: 'Leave', icon: railIcon(CalendarMinus), subSections: [
    { id: 'main', items: [
      { id: 'leave-types', label: 'Leave Types', icon: <Hash size={13} /> },
      { id: 'leave-policies', label: 'Leave Policies', icon: <FileText size={13} /> },
      { id: 'leave-entitlements', label: 'Entitlements', icon: <ClipboardList size={13} /> },
    ]},
  ]},
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Schedule', icon: railIcon(CalendarClock), subSections: [
    { id: 'main', items: [
      { id: 'schedules',         label: 'Schedules',         icon: <CalendarClock size={13} /> },
      { id: 'clock-in-policy',   label: 'Clock-in Policy',   icon: <Clock size={13} />       },
      { id: 'overtime-rules', label: 'Overtime Rules', icon: <Activity size={13} /> },
    ]},
  ]},
  WORK_NAV_ITEM,
  { id: 'automations', label: 'Automations', railLabel: 'Flow', icon: railIcon(Workflow), subSections: [] },
  { id: 'monitoring',  label: 'Monitoring',  railLabel: 'Monitor', icon: railIcon(ChartNoAxesCombined), subSections: [
    { id: 'settings', label: 'Settings', collapsible: true, defaultOpen: true, items: [
      { id: 'policy-settings',  label: 'Policy Settings',  icon: <Shield size={13} /> },
      { id: 'privacy-settings', label: 'Privacy Settings', icon: <Eye size={13} />    },
      { id: 'app-allowlist',    label: 'App Allowlist',    icon: <List size={13} />   },
    ]},
  ]},
  SETTINGS_NAV_ITEM,
];

/** @deprecated Settings lives in the main rail; kept empty for compatibility. */
export const SHARED_BOTTOM_ITEMS: NavItem[] = [];

/** @deprecated Use SHARED_BOTTOM_ITEMS */
export const TENANT_BOTTOM_ITEMS = SHARED_BOTTOM_ITEMS;

export const EMPLOYEE_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  railLabel: 'Home', icon: railIcon(LayoutDashboard), subSections: [] },
  WORK_NAV_ITEM,
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Schedule', icon: railIcon(CalendarClock), subSections: [
    { id: 'main', items: [
      { id: 'calendar',   label: 'Calendar',   icon: <Calendar size={13} /> },
      { id: 'attendance', label: 'Attendance', icon: <Clock size={13} />    },
    ]},
  ]},
  { id: 'people',     label: 'People',     icon: railIcon(UsersRound),      subSections: [
    { id: 'main', items: [
      { id: 'employees', label: 'Employees', icon: <Users size={13} /> },
    ]},
  ]},
  { id: 'chat',       label: 'Chat',       icon: railIcon(MessageSquare),   subSections: [] },
  { id: 'reports',    label: 'Reports',    icon: railIcon(PieChart),        subSections: [] },
  SETTINGS_NAV_ITEM,
];

interface MainMenuProps {
  currentView: 'employee' | 'tenant';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveSubItemId: (id: string) => void;
  onLeaveDeepLinkRoute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  currentView,
  activeTab,
  setActiveTab,
  setActiveSubItemId,
  onLeaveDeepLinkRoute
}) => {
  const navigate = useNavigate();
  const mainItems = currentView === 'tenant' ? TENANT_MAIN_ITEMS : EMPLOYEE_ITEMS;
  const bottomItems = SHARED_BOTTOM_ITEMS;

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

    if (currentView === 'tenant' && item.label === 'People' && subId === 'employees') {
      navigate('/people/employees');
      return;
    }
    if (currentView === 'tenant' && item.label === 'People' && subId === 'checklist-templates') {
      navigate('/people/checklist-templates');
      return;
    }
    if (currentView === 'tenant' && item.label === 'Organization' && subId) {
      navigate(subId === 'positions' ? '/organization/positions' : '/organization/departments');
      return;
    }
    if (currentView === 'tenant' && item.label === 'Automations') {
      navigate('/automations');
      return;
    }

    onLeaveDeepLinkRoute();
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
