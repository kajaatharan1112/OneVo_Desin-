# Main Menu Restructure (Time & Attendance, Org, Settings)

## Context

This continues the employee-menu cleanup already partly done in this branch (`EMPLOYEE_ITEMS` in [main-menu.tsx](../../../src/shared/components/main-menu/main-menu.tsx) already had Leave dropped and Calendar promoted to a top-level item). This spec covers the rest: nesting Time Tracking/Schedules/Monitoring/Time off under a single "Time & Attendance" item, restructuring `TENANT_MAIN_ITEMS` (the CEO/Manager menu) to match the same top-level shape, moving Roles & Permission into the Org item, and rebuilding the shared `SETTINGS_NAV_ITEM` sub-list.

Two menus exist today and are selected by `getProfileCapabilities(employee).shellMode` ([App.tsx:67](../../../src/app/App.tsx#L67)): regular employees get `EMPLOYEE_ITEMS`, CEO/Manager profiles get `TENANT_MAIN_ITEMS`. `SETTINGS_NAV_ITEM` (built by `buildSettingsNavItem()`) is shared — both menus end in the same Settings sub-list, so changing it changes both.

## 1. Employee menu (`EMPLOYEE_ITEMS`)

```
Home
Work
Time & Attendance
  ├── Time Tracking   → EmployeeAttendance (existing, was the unlabeled default)
  ├── Schedules       → SchedulesPage (existing tenant-config component, reused as-is)
  ├── Monitoring      → same placeholder TenantSectionPage the tenant Monitoring item already uses
  └── Time off        → EmployeeLeave (existing Leave page, relabeled)
Calendar
People
Reports
Settings
```

`time-attendance` regains `subSections` (one section, four items: `time-tracking`, `schedules`, `monitoring`, `time-off`). `Calendar` stays its own top-level item (already done).

## 2. CEO/Manager menu (`TENANT_MAIN_ITEMS`)

Today this array is `Dashboard, Organization, People, Leave, Time & Attendance, Work, Monitoring, Settings` — a different order with no Calendar or Reports item at top level. It becomes:

```
Home
Work
Time & Attendance
  ├── Time Tracking   → EmployeeAttendance (same component, reused for the manager view)
  ├── Schedules       → SchedulesPage (same component already used today)
  ├── Monitoring      → same placeholder pages as today (Policy Settings / Privacy Settings / App Allowlist), now reached as one menu hop instead of two
  └── Time off        → EmployeeLeave (was the standalone "Leave" item; same component, just relocated)
Calendar            → TenantCalendar (already has a render case at App.tsx:288 — currently unreachable because no tenant item points to it; now wired up)
People
Reports             → EmployeeReports (reused as-is, per explicit instruction — no separate tenant Reports page is being built)
Org                 → (was "Organization")
  ├── Departments
  ├── Positions
  └── Roles and Permission   (moved out of Settings)
Settings
```

The standalone `Leave` and `Monitoring` top-level items are removed from this array (their content moves under Time & Attendance as shown above). The existing `leave` configuration sub-items (Leave Types, Leave Policies, Entitlements) move into the new shared Settings → Policy group (section 3) rather than staying under a top-level Leave item, since Leave no longer exists as a top-level item.

## 3. Shared Settings (`SETTINGS_NAV_ITEM` / `SETTINGS_SUB_ITEMS`)

```
General             → GeneralSettingsPage (existing)
User                → AdminUsersPage (existing)
Billing              → BillingSettingsPage (existing)
Notification         → NotificationsSettingsPage (existing)
Policy
  ├── Clock-in policy           → ClockInPolicyPage (existing)
  ├── Monitoring policy         → same placeholder as today
  ├── Monitoring privacy setting → same placeholder as today
  ├── App allow list            → same placeholder as today
  ├── Time off type             → LeaveTypesPage (existing, moved from the old Leave config group)
  ├── Time off policy           → LeavePoliciesPage (existing, moved from the old Leave config group)
  └── Entitlement                → LeaveEntitlementsPage (existing, moved from the old Leave config group)
Bulk onboarding       → navigates to People → Employees (same destination the existing "Bulk Import" button on that page already goes to; this menu item does not auto-open the import modal, just deep-links to the page that has the button)
Device                → DevicesSettingsPage (existing, still gated by TENANT_DEVICE_CAPABILITY exactly as today)
Audit log             → AuditLogPage (existing)
```

`Roles & Permission` is removed from this list (moved to Org, section 2). The `devices` capability gate and the `/automations` deep-link behavior already wired to Settings are unaffected — neither is in this list because `automations` isn't a visible item in `SETTINGS_SUB_ITEMS` today (it's reached only via the `/automations` URL deep-link in `App.tsx`), and that mechanism is untouched.

**"Policy" is a labeled, collapsible sub-nav group, not a nested clickable parent.** The `NavItem.subSections` model already supports this — `TENANT_MAIN_ITEMS`'s `monitoring` item ([main-menu.tsx:106](../../../src/shared/components/main-menu/main-menu.tsx#L106)) already uses exactly this pattern (`{ id: 'settings', label: 'Settings', collapsible: true, defaultOpen: true, items: [...] }`). `buildSettingsNavItem()` becomes three `SubNavSection`s: an unlabeled one with General/User/Billing/Notification, a `label: 'Policy', collapsible: true, defaultOpen: true` one with the 7 policy items, and an unlabeled one with Bulk onboarding/Device/Audit log. All 7 policy items resolve as plain sibling `subId`s — no extra hierarchy level in the routing code.

## 4. Routing changes (`App.tsx`)

- New top-level case for the CEO/Manager menu's flat switch (no-subnav fallback, [App.tsx:285-294](../../../src/app/App.tsx#L285-L294)): already has `case 'Calendar': return <TenantCalendar />;` — this becomes reachable once `TENANT_MAIN_ITEMS` includes a `Calendar` item with no `subSections`.
- New case: `case 'Reports': return <EmployeeReports />;` in that same tenant flat switch.
- Both menus' `Time & Attendance` sub-nav resolution (`resolvedSubId`) gets a switch: `'time-tracking'` and the (missing/default) case → `EmployeeAttendance`; `'schedules'` → `SchedulesPage`; `'time-off'` → `EmployeeLeave`; `'monitoring'` → whatever the existing tenant Monitoring placeholder renders today (a `TenantSectionPage` fallback), reused unchanged.
- Tenant `Organization` (`Org`) sub-nav gains a `'roles-permissions'` case → `RolesPermissionsPage` (already imported in `App.tsx`, currently only used for the Settings case — same component, second usage).
- The existing flat `switch (resolvedSubId)` in both the employee and tenant Settings blocks gains sibling cases for `'clock-in-policy'`, `'monitoring-policy'`, `'monitoring-privacy-setting'`, `'app-allowlist'`, `'time-off-type'`, `'time-off-policy'`, `'entitlement'` (all at the same level as the existing `'general'`, `'users'`, etc. cases — see the "Policy" group note in section 3) mapping to the pages listed in section 3. The `'bulk-onboarding'` case navigates to `/people/employees` (reusing the existing `navigate()` pattern already used for the People and Organization items in `handleSubItemSelect`).

## 5. Out of scope

- Building real, distinct pages for Monitoring Policy / Monitoring Privacy Setting / App Allowlist — they keep rendering today's placeholder (`TenantSectionPage`) exactly as they do now; only their position in the menu tree changes.
- Auto-opening the Bulk Onboarding modal from the Settings menu item — it deep-links to the People → Employees page where the existing button already opens it.
- Any change to who sees which menu (`shellMode`/`getProfileCapabilities` logic) — Org continues to be visible only because CEO/Manager profiles get the entire `TENANT_MAIN_ITEMS` array; no new per-item visibility flag is introduced.
- A distinct "manager-specific" Reports page — both menus point at the same `EmployeeReports` component for now.
- **"Overtime Rules"** (`OvertimeRulesPage`, currently under tenant Time & Attendance → Configuration) is deliberately left unreachable from any menu after this change — explicit decision, not an oversight. Its `App.tsx` switch case (`'overtime-rules'`) becomes dead code; not removed, just no longer reachable.
- **"Branding"** (`BrandingSettingsPage`) is left exactly as it is today — it already has switch-cases in `App.tsx` (both Settings blocks) but was never in the visible `SETTINGS_SUB_ITEMS` array, so it's already unreachable from any menu. Pre-existing, untouched by this change.
