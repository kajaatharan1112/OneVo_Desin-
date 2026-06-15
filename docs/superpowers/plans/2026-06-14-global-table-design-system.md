# Global Table Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace tinted/colored table header backgrounds and accent-tinted row hovers with a single clean, white-header, neutral-hover table style, and reduce table container corner radius to 10-12px, applied consistently across the whole app.

**Architecture:** The app already centralizes most tables behind two shared CSS patterns: `.cfg-table` / `.cfg-table-wrap` (in `src/styles/configuration.css`, used by ~15 feature pages including Admin Users/Roles/Audit Log, Billing, Devices, Leave configuration, Automations, Work pages, People checklist templates) and `.dept-table` / `.dept-table-panel` (in `src/styles/organization.css`, used by Departments and Positions). Fixing these two shared patterns propagates the new look everywhere those classes are used, with no per-page changes required. A handful of pages then get a quick visual verification pass.

**Tech Stack:** React + Vite + TypeScript, plain CSS with CSS custom properties (no Tailwind). Dev server via `npm run dev` (in `OneVo_Desin-`).

**Out of scope (do not touch):** Tenant "Today/Productivity" dashboard widget tables (`.tto-detail-table`, `.ceo-pending__table` in `src/styles/tenant-today-productivity.css`) — these are dashboard summary widgets with their own dark/branded card styling (`--ceo-card-bg`), not part of the Settings/Users/Roles/Audit/Devices/People/Org/Leave/Work table set called out in the spec. Changing them risks breaking the CEO dashboard's intentional visual design.

---

## Task 1: Fix `.cfg-table` shared styles (header, hover, radius)

**Files:**
- Modify: `src/styles/configuration.css:113-146`

This single class pair is used by: `AdminUsersPage.tsx`, `RolesPermissionsPage.tsx`, `AuditLogPage.tsx`, `BillingSettingsPage.tsx`, `DevicesSettingsPage.tsx`, `LeaveEntitlementsPage.tsx`, `LeavePoliciesPage.tsx`, `LeaveTypesPage.tsx`, `AutomationListPage.tsx`, `ChecklistTemplatesPage.tsx`, `DocumentsPage.tsx`, `MyWorkPage.tsx`, `PlannerPage.tsx`, `ProjectsPage.tsx`, `ProjectSettings.tsx`, `ProjectWorklogsSettings.tsx`, `ManageWorkspacesDrawer.tsx`, `NotificationsSettingsPage.tsx`.

- [ ] **Step 1: Read the current block to confirm line numbers haven't shifted**

Run: `cd /c/onevoNew/OneVo_Desin- && grep -n -A4 "^\.cfg-table-wrap\|^\.cfg-table th\|^\.cfg-table tr:hover" src/styles/configuration.css`

Expected output includes:
```
.cfg-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-panel);
.cfg-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 0.7rem;
  font-weight: 600;
.cfg-table tr:hover td { background: var(--accent-bg); }
```

- [ ] **Step 2: Update `.cfg-table-wrap` border radius to 12px**

In `src/styles/configuration.css`, change:

```css
.cfg-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-panel);
}
```

to:

```css
.cfg-table-wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-panel);
}
```

- [ ] **Step 3: Remove the tinted header background and reduce header weight**

Change:

```css
.cfg-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--nexus-text-secondary);
  background: var(--code-bg);
  border-bottom: 1px solid var(--border);
}
```

to:

```css
.cfg-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--nexus-text-secondary);
  background: var(--surface-panel);
  border-bottom: 1px solid var(--border);
}
```

- [ ] **Step 4: Replace the accent-tinted row hover with a subtle neutral hover**

Change:

```css
.cfg-table tr:last-child td { border-bottom: none; }
.cfg-table tr:hover td { background: var(--accent-bg); }
```

to:

```css
.cfg-table tr:last-child td { border-bottom: none; }
.cfg-table tr:hover td { background: var(--surface-muted); }
```

- [ ] **Step 5: Start the dev server and visually verify on Roles & Permissions**

Run: `cd /c/onevoNew/OneVo_Desin- && npm run dev` (run in background / separate terminal)

Navigate to the Roles & Permissions settings page in the browser. Confirm:
- Table header row has a white background (no blue-gray tint), text is small/uppercase/muted
- Table container corners are visibly less rounded than before (12px, not 20px)
- Hovering a row shows a faint neutral gray highlight, not a blue tint

- [ ] **Step 6: Spot-check 2-3 other `.cfg-table` consumers**

In the browser, check Admin Users page, Audit Log page, and Leave > Leave Types page. Confirm the same white-header / neutral-hover / 12px-radius look applies everywhere, and nothing visually breaks (no layout shift, badges still render correctly).

- [ ] **Step 7: Commit**

```bash
git add src/styles/configuration.css
git commit -m "style: remove tinted table headers and accent hover from shared .cfg-table"
```

---

## Task 2: Fix `.dept-table` shared styles (Departments & Positions)

**Files:**
- Modify: `src/styles/organization.css:264-274` (`.dept-table-panel`)
- Modify: `src/styles/organization.css:381-392` (`.dept-table th`)
- Modify: `src/styles/organization.css:426-432` (`.dept-table__row:hover`)

Used by: `DepartmentTree.tsx` (via `dept-table-panel`) and `PositionList.tsx` (via `dept-table-panel position-table-panel`).

- [ ] **Step 1: Confirm current state**

Run: `cd /c/onevoNew/OneVo_Desin- && grep -n -A4 "^\.dept-table-panel {\|^\.dept-table th {\|^\.dept-table__row:hover" src/styles/organization.css`

Expected output includes:
```
.dept-table-panel {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
.dept-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 0.68rem;
  font-weight: 700;
.dept-table__row:hover {
  background: color-mix(in srgb, var(--accent) 4%, var(--surface-panel));
```

- [ ] **Step 2: Reduce panel corner radius to 12px**

Change:

```css
.dept-table-panel {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  gap: 0;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface-panel);
  overflow: hidden;
}
```

to:

```css
.dept-table-panel {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  gap: 0;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-panel);
  overflow: hidden;
}
```

- [ ] **Step 3: Remove the tinted header background and reduce header weight**

Change:

```css
.dept-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--nexus-text-muted);
  border-bottom: 1px solid var(--border);
  background: var(--code-bg);
  white-space: nowrap;
}
```

to:

```css
.dept-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--nexus-text-muted);
  border-bottom: 1px solid var(--border);
  background: var(--surface-panel);
  white-space: nowrap;
}
```

- [ ] **Step 4: Replace accent-tinted row hover with a subtle neutral hover**

Change:

```css
.dept-table__row {
  transition: background 0.1s;
}

.dept-table__row:hover {
  background: color-mix(in srgb, var(--accent) 4%, var(--surface-panel));
}
```

to:

```css
.dept-table__row {
  transition: background 0.1s;
}

.dept-table__row:hover {
  background: var(--surface-muted);
}
```

- [ ] **Step 5: Visually verify on Departments and Positions pages**

In the browser, open Organization > Departments and Organization > Positions. Confirm:
- Table header row is white, not blue-gray tinted
- Container corners are 12px, matching the `.cfg-table-wrap` containers elsewhere
- Row hover is a faint neutral gray (no blue tint)
- The tree-indentation, expand icons, and action menus in Departments still render correctly (no regressions from the radius/background change)

- [ ] **Step 6: Commit**

```bash
git add src/styles/organization.css
git commit -m "style: remove tinted table header and accent hover from .dept-table"
```

---

## Task 3: Full-app visual sweep

**Files:** none (verification only)

- [ ] **Step 1: Walk through every page in scope and confirm the new table look**

With `npm run dev` running, visit each of the following and confirm: white table header (no blue/gray tint band), 12px-radius container border, neutral gray row hover, compact readable cell padding, small restrained status badges:

- Settings > Users (`AdminUsersPage.tsx`)
- Settings > Roles & Permissions (`RolesPermissionsPage.tsx`)
- Settings > Audit Log (`AuditLogPage.tsx`)
- Settings > Billing (invoices table, `BillingSettingsPage.tsx`)
- Settings > Devices (`DevicesSettingsPage.tsx`)
- Settings > Notifications (matrix table, `NotificationsSettingsPage.tsx`)
- Organization > Departments (`DepartmentTree.tsx`)
- Organization > Positions (`PositionList.tsx`)
- Leave > Leave Types / Leave Policies / Leave Entitlements (`LeaveTypesPage.tsx`, `LeavePoliciesPage.tsx`, `LeaveEntitlementsPage.tsx`)
- Work > Projects, My Work, Planner, Documents (`ProjectsPage.tsx`, `MyWorkPage.tsx`, `PlannerPage.tsx`, `DocumentsPage.tsx`)
- Automations list (`AutomationListPage.tsx`)
- People > Checklist Templates (`ChecklistTemplatesPage.tsx`)

- [ ] **Step 2: Fix any stragglers found during the sweep**

If any page has its own local override re-introducing a tinted header or accent hover (e.g. a page-specific `th { background: ... }` rule), locate it with:

`grep -rn "code-bg\|accent-bg" src/features --include=*.css`

and remove/replace it the same way as Tasks 1-2 (background → `var(--surface-panel)` for headers, `var(--surface-muted)` for hover). Re-run the visual check for that page.

- [ ] **Step 3: Final commit (only if Step 2 made changes)**

```bash
git add -A
git commit -m "style: fix remaining tinted table overrides found in visual sweep"
```
