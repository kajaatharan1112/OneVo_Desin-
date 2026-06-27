# Main Menu Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure both the employee and CEO/Manager ("tenant") main menus so Time & Attendance gains a Time Tracking/Schedules/Monitoring/Time off submenu, both menus gain top-level Calendar and Reports items, Org gains a Roles and Permission entry, and the shared Settings list is reorganized with a new Policy group — all reusing existing page components, per `docs/superpowers/specs/2026-06-27-menu-restructure-design.md`.

**Architecture:** Pure data restructuring in `main-menu.tsx` (`NavItem`/`SubNavSection` arrays) plus matching `resolvedSubId` switch updates in `App.tsx`. No new page components are created — every new menu entry points at an existing component or the existing generic `TenantSectionPage` placeholder (via the existing `renderSectionPage` helper).

**Tech Stack:** React 19 + TypeScript, Vite. No test runner is configured in this repo (no `test` script, no Jest/Vitest) — verification is `npx tsc -b --noEmit`, `npm run lint`, and manual exercise via `npm run dev`, matching this repo's existing convention.

## Global Constraints

- Every new menu item must point at an **existing** component or the existing `TenantSectionPage` placeholder — no new page components in this plan (per spec section 5, "Out of scope").
- "Overtime Rules" stays unreachable from any menu — do not add a path to `OvertimeRulesPage` anywhere (explicit decision, not an oversight).
- "Branding" stays exactly as-is (already unreachable, pre-existing, untouched).
- The existing inline Roles & Permissions widget inside `OrganizationSubNavPanel.tsx` (the role list / create-role modal, lines 139–186) must not be removed or altered — the new "Roles and Permission" button is added alongside it, not replacing it.
- "Bulk onboarding" deep-links to `/people/employees` (reusing the existing Bulk Import button there) — it must not auto-open the `BulkOnboardingModal`.

---

### Task 1: Restructure nav data in `main-menu.tsx`

**Files:**
- Modify: `src/shared/components/main-menu/main-menu.tsx`

**Interfaces:**
- Consumes: existing `NavItem`, `SubNavSection` types (unchanged), existing lucide icon imports (no new imports needed — every icon used below is already imported at the top of this file).
- Produces: the exact sub-item `id` strings used by Task 3's `App.tsx` switches: `'time-tracking'`, `'schedules'`, `'monitoring'`, `'time-off'` (Time & Attendance), `'roles-permissions'` (Organization), `'clock-in-policy'`, `'monitoring-policy'`, `'monitoring-privacy-setting'`, `'app-allowlist'`, `'time-off-type'`, `'time-off-policy'`, `'entitlement'`, `'bulk-onboarding'` (Settings/Policy). Top-level items `'calendar'` and `'reports'` added to `TENANT_MAIN_ITEMS`.

- [ ] **Step 1: Rewrite `SETTINGS_SUB_ITEMS` and `buildSettingsNavItem`**

Replace lines 29–49 (the `SETTINGS_SUB_ITEMS` array through the end of `buildSettingsNavItem`) with:

```tsx
const SETTINGS_SUB_ITEMS = [
  { id: 'general',       label: 'General',      icon: <Settings size={13} />  },
  { id: 'users',         label: 'User',          icon: <Users size={13} />     },
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
  { id: 'bulk-onboarding', label: 'Bulk onboarding', icon: <Users size={13} />         },
  { id: 'devices',         label: 'Device',          icon: <Monitor size={13} />       },
  { id: 'audit-log',       label: 'Audit Log',       icon: <ClipboardList size={13} /> },
] as const;

export function buildSettingsNavItem(): NavItem {
  const otherItems = SETTINGS_OTHER_ITEMS.filter(
    item => item.id !== 'devices' || TENANT_DEVICE_CAPABILITY
  );
  return {
    id: 'settings',
    label: 'Settings',
    icon: railIcon(Settings),
    subSections: [
      { id: 'main', items: [...SETTINGS_SUB_ITEMS] },
      { id: 'policy', label: 'Policy', collapsible: true, defaultOpen: true, items: [...SETTINGS_POLICY_ITEMS] },
      { id: 'other', items: otherItems },
    ],
  };
}
```

Note: the `TENANT_DEVICE_CAPABILITY` filter now runs on `SETTINGS_OTHER_ITEMS` instead of the old flat `SETTINGS_SUB_ITEMS` — same filter predicate, just applied to the group that now actually contains `devices` (which moved to the end of the list, after Bulk onboarding, per the confirmed tree).

- [ ] **Step 2: Rewrite `TENANT_MAIN_ITEMS`**

Replace lines 69–113 (the entire `TENANT_MAIN_ITEMS` array) with:

```tsx
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
      { id: 'checklist-templates', label: 'Checklist Templates', icon: <ListChecks size={13} /> },
    ]},
  ]},
  { id: 'reports', label: 'Reports', icon: railIcon(PieChart), subSections: [] },
  { id: 'organization', label: 'Organization', railLabel: 'Org', icon: railIcon(Building2), subSections: [
    { id: 'main', items: [
      { id: 'departments',       label: 'Departments',         icon: <Building size={13} />    },
      { id: 'positions',         label: 'Positions',            icon: <Briefcase size={13} />   },
      { id: 'roles-permissions', label: 'Roles and Permission', icon: <ShieldCheck size={13} /> },
    ]},
  ]},
  SETTINGS_NAV_ITEM,
];
```

Note: `label`/`railLabel` for `organization` are unchanged from today (`'Organization'`/`'Org'`) — the rail already displays "Org" via the existing `railLabel`; nothing here needs renaming. `id: 'organization'` is also unchanged (it's load-bearing for the `/organization/departments` and `/organization/positions` URL deep-links in `App.tsx`, untouched by this plan).

- [ ] **Step 3: Populate `EMPLOYEE_ITEMS`'s `time-attendance` subSections**

Find (around line 121–129, after Step 2's edit shifts line numbers — search for the literal text):

```tsx
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Time & Attendance', icon: railIcon(CalendarClock),  subSections: [] },
```

Replace with:

```tsx
  { id: 'time-attendance', label: 'Time & Attendance', railLabel: 'Time & Attendance', icon: railIcon(CalendarClock), subSections: [
    { id: 'main', items: [
      { id: 'time-tracking', label: 'Time Tracking', icon: <Clock size={13} />              },
      { id: 'schedules',     label: 'Schedules',      icon: <CalendarClock size={13} />      },
      { id: 'monitoring',    label: 'Monitoring',     icon: <ChartNoAxesCombined size={13} /> },
      { id: 'time-off',      label: 'Time off',       icon: <CalendarMinus size={13} />       },
    ]},
  ]},
```

(This is the same four sub-items as Step 2's tenant version — both menus get an identical Time & Attendance submenu, per the spec.)

- [ ] **Step 4: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors mentioning `main-menu.tsx`. (Other pre-existing errors in unrelated files, e.g. `Step6ConfirmImport.tsx` or `navbar.tsx`, are not caused by this change — ignore them.)

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no new errors in `main-menu.tsx` (the pre-existing `react-refresh/only-export-components` warnings on this file are unrelated and already present before this change).

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/main-menu/main-menu.tsx
git commit -m "feat(nav): restructure Time & Attendance, Org, and Settings menu data"
```

---

### Task 2: Add "Roles and Permission" button to `OrganizationSubNavPanel`

**Files:**
- Modify: `src/features/organization/components/OrganizationSubNavPanel.tsx`

**Interfaces:**
- Consumes: the `onSelect: (id: string) => void` prop already passed into this component (unchanged signature).
- Produces: clicking the new button calls `onSelect('roles-permissions')` — Task 3's `App.tsx` Organization branch must handle this id.

- [ ] **Step 1: Add the new button after the existing Positions button, before the inline roles widget**

In `OrganizationSubNavPanel.tsx`, find (lines 129–137):

```tsx
          <button
            type="button"
            className={`sub-nav-panel__item${activeId === 'positions' ? ' sub-nav-panel__item--active' : ''}`}
            onClick={() => onSelect('positions')}
            aria-current={activeId === 'positions' ? 'page' : undefined}
          >
            <span className="sub-nav-panel__item-icon"><Briefcase size={13} /></span>
            <span className="sub-nav-panel__item-label">Positions</span>
          </button>

          <div className="org-sub-nav__roles-section">
```

Replace with:

```tsx
          <button
            type="button"
            className={`sub-nav-panel__item${activeId === 'positions' ? ' sub-nav-panel__item--active' : ''}`}
            onClick={() => onSelect('positions')}
            aria-current={activeId === 'positions' ? 'page' : undefined}
          >
            <span className="sub-nav-panel__item-icon"><Briefcase size={13} /></span>
            <span className="sub-nav-panel__item-label">Positions</span>
          </button>
          <button
            type="button"
            className={`sub-nav-panel__item${activeId === 'roles-permissions' ? ' sub-nav-panel__item--active' : ''}`}
            onClick={() => onSelect('roles-permissions')}
            aria-current={activeId === 'roles-permissions' ? 'page' : undefined}
          >
            <span className="sub-nav-panel__item-icon"><ShieldCheck size={13} /></span>
            <span className="sub-nav-panel__item-label">Roles and Permission</span>
          </button>

          <div className="org-sub-nav__roles-section">
```

`ShieldCheck` is already imported at the top of this file (line 8, used by the existing inline roles widget's header icon) — no new import needed.

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors mentioning `OrganizationSubNavPanel.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/features/organization/components/OrganizationSubNavPanel.tsx
git commit -m "feat(org): add Roles and Permission nav button alongside existing inline widget"
```

---

### Task 3: Rewire `App.tsx` routing for both menus

**Files:**
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: the exact sub-item ids produced by Task 1 (`'time-tracking'`, `'schedules'`, `'monitoring'`, `'time-off'`, `'roles-permissions'`, `'clock-in-policy'`, `'monitoring-policy'`, `'monitoring-privacy-setting'`, `'app-allowlist'`, `'time-off-type'`, `'time-off-policy'`, `'entitlement'`, `'bulk-onboarding'`) and Task 2's `onSelect('roles-permissions')` call.
- Produces: nothing consumed elsewhere — this is the last task.

- [ ] **Step 1: Add a dedicated Time & Attendance block to the employee branch, remove its old flat-switch case**

Find (around line 172–193, in `renderActivePageContent`'s `if (shellMode === 'employee')` block):

```tsx
      if (activeTab === 'Work') {
        const workNav = findNavItem(allEmployeeItems, activeTab);
        const resolvedSubId = resolveSubItemId(workNav, activeSubItemId);
        return <WorkRoutes activeSubItemId={resolvedSubId} />;
      }

      switch (activeTab) {
        case 'Dashboard':
          return <EmployeeDashboard onNavigateTab={setActiveTab} />;
        case 'Time & Attendance':
          return <EmployeeAttendance />;
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
```

Replace with:

```tsx
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
```

`renderSectionPage`'s third parameter type is `typeof TENANT_MAIN_ITEMS` (i.e. `NavItem[]`) — `allEmployeeItems` is also `NavItem[]`, so this is type-compatible without any signature change.

- [ ] **Step 2: Add the new Settings sub-item cases to the employee Settings switch**

Find (around line 155–169, immediately above the Work block from Step 1):

```tsx
      const allEmployeeItems = [...EMPLOYEE_ITEMS, ...TENANT_BOTTOM_ITEMS];
      const employeeNavItem = findNavItem(allEmployeeItems, activeTab);
      if ((employeeNavItem?.subSections.length ?? 0) > 0 && activeTab === 'Settings') {
        const resolvedSubId = resolveSubItemId(employeeNavItem, activeSubItemId);
        switch (resolvedSubId) {
          case 'general': return <GeneralSettingsPage />;
          case 'branding': return <BrandingSettingsPage />;
          case 'users': return <AdminUsersPage />;
          case 'roles-permissions': return <RolesPermissionsPage />;
          case 'notifications': return <NotificationsSettingsPage />;
          case 'billing': return <BillingSettingsPage />;
          case 'devices':
            return TENANT_DEVICE_CAPABILITY ? <DevicesSettingsPage /> : <GeneralSettingsPage />;
          case 'audit-log': return <AuditLogPage />;
          case 'automations': return <AutomationRoutes />;
          default: return <GeneralSettingsPage />;
        }
      }
```

Replace with (drops the now-nonexistent `'roles-permissions'` case, adds the Policy group's cases, adds `'bulk-onboarding'`):

```tsx
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
```

`'bulk-onboarding'` returns `<GeneralSettingsPage />` here only as a momentary fallback — Step 6 below makes clicking it `navigate()` away to `/people/employees` before this switch ever runs, so this case is realistically unreachable, but keeps the switch exhaustive-looking and avoids ever rendering a blank/wrong page if reached directly.

- [ ] **Step 3: Rewrite the tenant Time & Attendance switch**

Find (around line 259–274, inside the tenant `if (hasSubNav)` block):

```tsx
      if (activeTab === 'Time & Attendance') {
        switch (resolvedSubId) {
          case 'my-attendance':
            return <EmployeeAttendance />;
          case 'my-calendar':
            return <EmployeeCalendar />;
          case 'schedules':
            return <SchedulesPage />;
          case 'clock-in-policy':
            return <ClockInPolicyPage />;
          case 'overtime-rules':
            return <OvertimeRulesPage />;
          default:
            return renderSectionPage(activeTab, allTenantItems, resolvedSubId);
        }
      }
```

Replace with:

```tsx
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
```

(`'monitoring'` and anything unrecognized fall to the existing `default` placeholder branch — unchanged behavior, just reached via a new sub-item id.)

- [ ] **Step 4: Remove the now-dead tenant Leave block**

Find (around line 219–231) and delete this entire block:

```tsx
      if (activeTab === 'Leave') {
        switch (resolvedSubId) {
          case 'my-leave':
            return <EmployeeLeave />;
          case 'leave-policies':
            return <LeavePoliciesPage />;
          case 'leave-entitlements':
            return <LeaveEntitlementsPage />;
          case 'leave-types':
          default:
            return <LeaveTypesPage />;
        }
      }
```

`activeTab` can never equal `'Leave'` anymore since `TENANT_MAIN_ITEMS` no longer has a `Leave` item (Task 1) — this block is unreachable dead code. `LeavePoliciesPage`, `LeaveEntitlementsPage`, and `LeaveTypesPage` stay imported and used (by the Settings switch in Step 5 below), so no import changes here.

- [ ] **Step 5: Add the new Organization case and the Settings Policy-group cases to the tenant Settings switch**

Find (around line 213–218, the Organization branch):

```tsx
      if (activeTab === 'Organization') {
        if (resolvedSubId === 'positions') {
          return <PositionsPage />;
        }
        return <DepartmentsPage />;
      }
```

Replace with:

```tsx
      if (activeTab === 'Organization') {
        if (resolvedSubId === 'positions') {
          return <PositionsPage />;
        }
        if (resolvedSubId === 'roles-permissions') {
          return <RolesPermissionsPage />;
        }
        return <DepartmentsPage />;
      }
```

Then find the tenant Settings switch (around line 232–255):

```tsx
      if (activeTab === 'Settings') {
        switch (resolvedSubId) {
          case 'general':
            return <GeneralSettingsPage />;
          case 'branding':
            return <BrandingSettingsPage />;
          case 'users':
            return <AdminUsersPage />;
          case 'roles-permissions':
            return <RolesPermissionsPage />;
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
          default:
            return <GeneralSettingsPage />;
        }
      }
```

Replace with:

```tsx
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
```

(`'bulk-onboarding'` falls to `default` here too — Step 6 makes it navigate away before this ever matters, same reasoning as Step 2.)

- [ ] **Step 6: Update `handleSubItemSelect` for Organization's new id and the new Bulk onboarding deep-link**

Find (around line 91–108):

```tsx
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
    if (activeTab === 'Organization') {
      navigate(id === 'positions' ? '/organization/positions' : '/organization/departments');
      return;
    }
    if (activeTab === 'Settings' && id === 'automations') {
      navigate('/automations');
    }
  };
```

Replace with:

```tsx
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
```

The Organization condition is narrowed to only `'positions'`/`'departments'` so selecting `'roles-permissions'` doesn't wrongly force-navigate to the Departments URL — it just updates `activeSubItemId` (already done by the first line) and lets Step 5's render branch handle it.

- [ ] **Step 7: Add the tenant flat-switch `Reports` case**

Find (around line 278–287, the no-subnav fallback switch):

```tsx
    switch (activeTab) {
      case 'Dashboard':
        return <EmployeeDashboard onNavigateTab={setActiveTab} />;
      case 'Calendar':
        return <TenantCalendar />;
      case 'Attendance':
        return <TenantAttendance />;
      default:
        return <TenantSectionPage section={activeTab} />;
    }
```

Replace with:

```tsx
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
```

(`case 'Calendar'` already existed and was previously unreachable — it's now reachable because `TENANT_MAIN_ITEMS` has a `Calendar` item with empty `subSections`, landing here via `hasSubNav === false`.)

- [ ] **Step 8: Remove the now-unused `OvertimeRulesPage` import**

Find and delete this line (around line 47):

```tsx
import { OvertimeRulesPage } from '../features/time-attendance/overtime-rules/OvertimeRulesPage';
```

It is no longer referenced anywhere in `App.tsx` after Step 3 removed its only call site. (The component file itself is untouched — only this import/usage is removed, per the spec's explicit decision that Overtime Rules stays unreachable but is not deleted from the codebase.)

- [ ] **Step 9: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors mentioning `App.tsx`.

- [ ] **Step 10: Lint**

Run: `npm run lint`
Expected: no new errors in `App.tsx` (the pre-existing `setState synchronously within an effect` warning at the management-redirect `useEffect` is unrelated and already present before this change).

- [ ] **Step 11: Manual verification in the browser**

Run: `npm run dev`, open the app as a regular employee (default profile) first, then switch to the CEO or Manager profile (via whatever profile switcher this app uses — `EmployeeProvider`/`onSelectEmployee`) to check the tenant menu.

As the **regular employee**:
1. Confirm the rail shows, in order: Home, Work, Time & Attendance, Calendar, People, Reports, Settings — no Leave, no Org.
2. Click Time & Attendance — confirm a submenu opens with Time Tracking, Schedules, Monitoring, Time off.
3. Click each of the four sub-items: Time Tracking shows the attendance page, Schedules shows the schedules config page, Time off shows the leave page, Monitoring shows a placeholder page titled "Monitoring".
4. Click Calendar (top-level) — confirm it shows the calendar page (same as before this change, just relocated).
5. Open Settings — confirm the list is General, User, Billing, Notification, then a collapsible "Policy" group (Clock-in Policy, Monitoring Policy, Monitoring Privacy Setting, App Allowlist, Time off Type, Time off Policy, Entitlement), then Bulk onboarding, Device, Audit Log. No "Roles & Permissions" anywhere in Settings.
6. Click "Bulk onboarding" — confirm it navigates to People → Employees (the page with the existing Bulk Import button), not a blank page.
7. Click each Policy sub-item — confirm Clock-in Policy/Time off Type/Time off Policy/Entitlement show their real pages, and the three Monitoring items show placeholder pages.

As **CEO or Manager**:
1. Confirm the rail shows: Home, Work, Time & Attendance, Calendar, People, Reports, Org, Settings.
2. Repeat checks 2–3 and 7 above (Time & Attendance submenu and Settings/Policy) — same pages, same behavior.
3. Click Calendar (top-level) — confirm it shows the tenant calendar page (this was previously unreachable; confirm it now works).
4. Click Reports (top-level, new) — confirm it shows a reports page (reused from the employee Reports page) instead of a blank/error screen.
5. Click Org — confirm the sidebar shows Departments, Positions, **and** a new "Roles and Permission" button, with the existing inline role-list widget still present and working (click a role to open its detail modal, click the "+" to open Create Role).
6. Click the new "Roles and Permission" button — confirm the main content area shows the full Roles & Permissions page (search bar, role table, etc. — the bigger page, not the sidebar widget).
7. Click Departments/Positions again afterward — confirm switching back works (sub-nav selection state doesn't get stuck on Roles and Permission).

- [ ] **Step 12: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat(nav): rewire App.tsx routing for restructured Time & Attendance, Org, and Settings menus"
```
