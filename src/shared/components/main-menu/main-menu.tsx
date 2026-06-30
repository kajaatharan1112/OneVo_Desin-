import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, UsersRound, Clock,
  PieChart, Briefcase, Building2, Building, CalendarMinus,
  ChartNoAxesCombined, ShieldCheck, Settings, FileText, Hash,
  ListChecks, Shield, Eye, List, Bell,
  CreditCard, Monitor, CalendarClock, ClipboardList, ListTodo, CalendarDays,
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
  { id: 'general',       label: 'General',      icon: <Settings size={13} />  },
  { id: 'users',         label: 'User Access',   icon: <Users size={13} />     },
  { id: 'roles-permissions', label: 'Roles & Permissions', icon: <ShieldCheck size={13} /> },
  { id: 'billing',       label: 'Billing',       icon: <CreditCard size={13} /> },
  { id: 'notifications', label: 'Notification', icon: <Bell size={13} />      },
] as const;

const SETTINGS_POLICY_ITEMS = [
  { id: 'clock-in-policy',           label: 'Clock-in Policy',            icon: <Clock size={13} />        },
  { id: 'monitoring-policy',         label: 'Monitoring Policy',          icon: <Shield size={13} />       },
  { id: 'monitoring-privacy-setting', label: 'Monitoring Privacy Setting', icon: <Eye size={13} />          },
  { id: 'app-allowlist',             label: 'App Allowlist',              icon: <List size={13} />         },
  { id: 'time-off-type',             label: 'Time off Type',              icon: <Hash size={13} />         },
  { id: 'time-off-policy',           label: 'Time off Policy',            icon: <FileText size={13} />     },
  { id: 'entitlement',               label: 'Entitlement',                icon: <ClipboardList size={13} /> },
] as const;

const SETTINGS_OTHER_ITEMS = [
  { id: 'devices',         label: 'Devices',         icon: <Monitor size={13} />       },
  { id: 'audit-log',       label: 'History',         icon: <ClipboardList size={13} /> },
] as const;

export function buildSettingsNavItem(isEmployee = false, includeBulkOnboarding = false): NavItem {
  const otherItems = [
    ...(includeBulkOnboarding ? [{ id: 'bulk-onboarding', label: 'Bulk onboarding', icon: <Users size={13} /> }] : []),
    ...SETTINGS_OTHER_ITEMS.filter(item => item.id !== 'devices' || TENANT_DEVICE_CAPABILITY),
  ];

  const subSections: SubNavSection[] = [
    { id: 'main', items: [...SETTINGS_SUB_ITEMS] },
  ];

  if (!isEmployee) {
    subSections.push({
      id: 'policy',
      label: 'Policy',
      collapsible: true,
      defaultOpen: true,
      items: [...SETTINGS_POLICY_ITEMS],
    });
  }

  subSections.push({ id: 'other', items: otherItems });

  return {
    id: 'settings',
    label: 'Settings',
    icon: railIcon(Settings),
    subSections,
  };
}

/** Tenant-wide administration — single main-rail entry (no separate Admin item). */
export const SETTINGS_NAV_ITEM: NavItem = buildSettingsNavItem(false, true);
export const TENANT_SETTINGS_NAV_ITEM: NavItem = buildSettingsNavItem(false, true);
export const EMPLOYEE_SETTINGS_NAV_ITEM: NavItem = buildSettingsNavItem(true, false);

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
  { id: 'dashboard', label: 'Dashboard', railLabel: 'Home', icon: railIcon(LayoutDashboard), subSections: [] },
  WORK_NAV_ITEM,
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Time & Attendance', icon: railIcon(CalendarClock), subSections: [
    { id: 'main', items: [
      { id: 'time-tracking', label: 'Time Tracking', icon: <Clock size={13} />              },
      { id: 'schedules',     label: 'Schedules',      icon: <CalendarClock size={13} />      },
      { id: 'monitoring',    label: 'Monitoring',     icon: <ChartNoAxesCombined size={13} /> },
      { id: 'time-off',      label: 'Time off',       icon: <CalendarMinus size={13} />       },
    ]},
  ]},
  { id: 'calendar', label: 'Calendar', icon: railIcon(CalendarDays), subSections: [] },
  { id: 'people', label: 'People', icon: railIcon(UsersRound), subSections: [
    { id: 'main', items: [
      { id: 'employees', label: 'Employees', icon: <Users size={13} /> },
      { id: 'offboarding', label: 'Offboarding', icon: <CalendarMinus size={13} /> },
      { id: 'checklist-templates', label: 'Checklist Templates', icon: <ListChecks size={13} /> },
    ]},
  ]},
  { id: 'reports', label: 'Reports', icon: railIcon(PieChart), subSections: [] },
  { id: 'organization', label: 'Organization', railLabel: 'Org', icon: railIcon(Building2), subSections: [
    { id: 'main', items: [
      { id: 'positions',         label: 'Positions',            icon: <Briefcase size={13} />   },
      { id: 'departments',       label: 'Departments',         icon: <Building size={13} />    },
      { id: 'roles-permissions', label: 'Roles and Permission', icon: <ShieldCheck size={13} /> },
    ]},
  ]},
  TENANT_SETTINGS_NAV_ITEM,
];

/** @deprecated Settings lives in the main rail; kept empty for compatibility. */
export const SHARED_BOTTOM_ITEMS: NavItem[] = [];

/** @deprecated Use SHARED_BOTTOM_ITEMS */
export const TENANT_BOTTOM_ITEMS = SHARED_BOTTOM_ITEMS;

export const EMPLOYEE_ITEMS: NavItem[] = [
  { id: 'dashboard',       label: 'Dashboard',         railLabel: 'Home',             icon: railIcon(LayoutDashboard), subSections: [] },
  WORK_NAV_ITEM,
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Time & Attendance', icon: railIcon(CalendarClock), subSections: [
    { id: 'main', items: [
      { id: 'time-tracking', label: 'Time Tracking', icon: <Clock size={13} />              },
      { id: 'schedules',     label: 'Schedules',      icon: <CalendarClock size={13} />      },
      { id: 'monitoring',    label: 'Monitoring',     icon: <ChartNoAxesCombined size={13} /> },
      { id: 'time-off',      label: 'Time off',       icon: <CalendarMinus size={13} />       },
    ]},
  ]},
  { id: 'calendar',        label: 'Calendar',                                         icon: railIcon(CalendarDays),    subSections: [] },
  { id: 'people',          label: 'People',                                           icon: railIcon(UsersRound),      subSections: [] },
  { id: 'reports',         label: 'Reports',                                          icon: railIcon(PieChart),        subSections: [] },
  EMPLOYEE_SETTINGS_NAV_ITEM,
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
      navigate(
        subId === 'positions'
          ? '/organization/positions'
          : subId === 'roles-permissions'
            ? '/organization/roles-permissions'
            : '/organization/departments'
      );
      return;
    }
    if (currentView === 'employee' && item.label === 'People') {
      navigate('/people/employees');
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
