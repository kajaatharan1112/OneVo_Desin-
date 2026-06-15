# Settings Content Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the content of the 8 tenant Settings pages (General, Branding, Users, Roles & Permissions, Notifications, Billing, Devices, Audit Log) so they feel like production tenant settings, not developer configuration — without changing navigation, routes, or adding new features.

**Architecture:** All 8 pages already exist under `src/features/settings/` and `src/features/admin/` and are already wired into `SETTINGS_SUB_ITEMS` (`src/shared/components/main-menu/main-menu.tsx`) and the router switch in `src/app/App.tsx`. There is **no Security settings page** and no SSO/SAML/OIDC/session-policy UI anywhere in tenant settings already — Acceptance Criteria items "Security page is removed" and "No unnecessary SSO/MFA/session developer controls are exposed" are already satisfied; no task is needed for those. This plan only touches page content/data, not routing or navigation.

**Tech Stack:** React + Vite + TypeScript, plain CSS with CSS custom properties.

**Prerequisite:** This plan assumes the table styling fixes from `docs/superpowers/plans/2026-06-14-global-table-design-system.md` (Plan A) have already been applied, since several tasks below touch tables that use `.cfg-table`.

---

## Task 1: General settings page — trim to the 7 target fields

**Files:**
- Modify: `src/features/settings/settingsMockData.ts:5-38`
- Modify: `src/features/settings/GeneralSettingsPage.tsx`

Current `GeneralSettings` has 11 fields (companyName, tenantSlug, primaryContactEmail, country, timezone, dateFormat, timeFormat, language, currency, fiscalYearStartMonth, workWeekDays) rendered across 3 cards (Company, Localization, Business Calendar Defaults). None of `tenantSlug`, `primaryContactEmail`, `country`, `timeFormat`, `currency`, `fiscalYearStartMonth`, `workWeekDays`, `MONTH_OPTIONS` are referenced anywhere else in the codebase (confirmed via grep) — safe to remove entirely. Target fields per spec: Company name, Company display name, Company logo (read-only reference to Branding), Timezone, Date format, Week start day, Default language, Save.

- [ ] **Step 1: Replace the settings data block**

In `src/features/settings/settingsMockData.ts`, replace lines 5-38 (the `GeneralSettings` interface through `WEEKDAY_OPTIONS`) with:

```ts
export interface GeneralSettings {
  companyName: string;
  displayName: string;
  timezone: string;
  dateFormat: string;
  weekStartDay: string;
  language: string;
}

export const DEFAULT_GENERAL: GeneralSettings = {
  companyName: 'Acme Corporation',
  displayName: 'Acme',
  timezone: 'Europe/London',
  dateFormat: 'DD/MM/YYYY',
  weekStartDay: 'Mon',
  language: 'English (UK)',
};

export const WEEKDAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
```

This removes `MONTH_OPTIONS` (only used for the fiscal-year dropdown being deleted) and adds `displayName` and `weekStartDay`.

- [ ] **Step 2: Rewrite GeneralSettingsPage.tsx**

Replace the entire contents of `src/features/settings/GeneralSettingsPage.tsx` with:

```tsx
import React, { useState } from 'react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import {
  DEFAULT_GENERAL,
  WEEKDAY_OPTIONS,
  type GeneralSettings,
} from './settingsMockData';
import { DEFAULT_BRANDING } from './settingsMockData';

export const GeneralSettingsPage: React.FC = () => {
  const [form, setForm] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [saved, setSaved] = useState(false);

  const patch = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="General"
        description="Basic company details used across OneVo."
        actions={
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Changes
          </button>
        }
      />

      <div className="settings-body">
        {saved && (
          <p className="admin-hint admin-hint--info">Company settings saved successfully.</p>
        )}

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Company</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="company-name">Company Name</label>
                <input
                  id="company-name"
                  value={form.companyName}
                  onChange={e => patch('companyName', e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="company-display-name">Company Display Name</label>
                <input
                  id="company-display-name"
                  value={form.displayName}
                  onChange={e => patch('displayName', e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label>Company Logo</label>
                <div className="settings-logo-upload">
                  <div className="settings-logo-preview" aria-hidden>
                    {DEFAULT_BRANDING.hasCustomLogo ? 'ACME' : 'OneVo'}
                  </div>
                  <p className="admin-hint" style={{ margin: 0 }}>Managed in Branding settings.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Localization</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-form-grid settings-form-grid--3">
              <div className="org-form-field">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={form.timezone}
                  onChange={e => patch('timezone', e.target.value)}
                >
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="date-format">Date Format</label>
                <select
                  id="date-format"
                  value={form.dateFormat}
                  onChange={e => patch('dateFormat', e.target.value)}
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="week-start">Week Start Day</label>
                <select
                  id="week-start"
                  value={form.weekStartDay}
                  onChange={e => patch('weekStartDay', e.target.value)}
                >
                  {WEEKDAY_OPTIONS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="language">Default Language</label>
                <select
                  id="language"
                  value={form.language}
                  onChange={e => patch('language', e.target.value)}
                >
                  <option>English (UK)</option>
                  <option>English (US)</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verify the app builds and the page renders**

Run: `cd /c/onevoNew/OneVo_Desin- && npm run dev` (if not already running)

Open Settings > General. Confirm: Company card shows Company Name, Company Display Name, Company Logo (small preview + "Managed in Branding settings" text, no upload button); Localization card shows Timezone, Date Format, Week Start Day, Default Language; Save Changes works (shows the saved hint); no Business Calendar / fiscal year / currency / country / contact email content remains.

- [ ] **Step 4: Commit**

```bash
git add src/features/settings/settingsMockData.ts src/features/settings/GeneralSettingsPage.tsx
git commit -m "feat(settings): simplify General settings to core company fields"
```

---

## Task 2: Branding settings page — trim color controls

**Files:**
- Modify: `src/features/settings/settingsMockData.ts` (BrandingSettings interface + DEFAULT_BRANDING, currently lines 40-54)
- Modify: `src/features/settings/BrandingSettingsPage.tsx`

Current `BrandingSettings` has 4 color fields (primaryColor, accentColor, sidebarBg, sidebarText) plus a 3-tile preview (Header/Sidebar/Login) and a contrast-warning check on the sidebar colors. Spec wants: Logo, App icon (favicon), Primary brand color, Accent color, Login screen preview, Save — i.e. drop the 2 sidebar color controls, the sidebar preview tile, and the contrast-warning logic (which only applies to sidebar colors). `sidebarBg`/`sidebarText` are not referenced anywhere outside this page and `settingsMockData.ts` (confirmed via grep) — safe to remove.

- [ ] **Step 1: Update the data block**

In `src/features/settings/settingsMockData.ts`, replace (current lines 40-54):

```ts
export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  sidebarBg: string;
  sidebarText: string;
  hasCustomLogo: boolean;
}

export const DEFAULT_BRANDING: BrandingSettings = {
  primaryColor: '#2563eb',
  accentColor: '#0ea5e9',
  sidebarBg: '#0f172a',
  sidebarText: '#f8fafc',
  hasCustomLogo: true,
};
```

with:

```ts
export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  hasCustomLogo: boolean;
}

export const DEFAULT_BRANDING: BrandingSettings = {
  primaryColor: '#2563eb',
  accentColor: '#0ea5e9',
  hasCustomLogo: true,
};
```

- [ ] **Step 2: Remove the contrast-warning helpers and sidebar color controls**

In `src/features/settings/BrandingSettingsPage.tsx`:

1. Remove the `hexLuminance` and `contrastWarning` functions (lines 6-17) — they are only used for the sidebar contrast check being removed.
2. Remove the `poorContrast` `useMemo` (lines 28-31) and the `useMemo` import if it becomes unused (check remaining usages of `useMemo` in the file first — if none remain, change `import React, { useMemo, useState } from 'react';` to `import React, { useState } from 'react';`).
3. In the "Brand Colors" section (lines 102-138), remove the `poorContrast` warning paragraph (lines 107-111) and shrink the color-field array (lines 113-118) from:

```tsx
{([
  ['primaryColor', 'Primary Color'],
  ['accentColor', 'Accent Color'],
  ['sidebarBg', 'Sidebar Background'],
  ['sidebarText', 'Sidebar Text'],
] as const).map(([key, label]) => (
```

to:

```tsx
{([
  ['primaryColor', 'Primary Color'],
  ['accentColor', 'Accent Color'],
] as const).map(([key, label]) => (
```

- [ ] **Step 3: Remove the Sidebar preview tile, keep Header + Login**

In the "Preview" section (lines 140-193), the `settings-preview-grid` (line 145) currently renders 3 tiles: Header (146-155), Sidebar (156-169), Login (170-190). Remove the entire Sidebar tile block (lines 156-169):

```tsx
<div className="settings-preview">
  <div className="settings-preview__label">Sidebar</div>
  <div className="settings-preview__sidebar">
    <div
      className="settings-preview__sidebar-nav"
      style={{ background: form.sidebarBg, color: form.sidebarText }}
    >
      <span className="settings-preview__sidebar-item settings-preview__sidebar-item--active" style={{ background: form.sidebarText }} />
      <span className="settings-preview__sidebar-item" style={{ background: form.sidebarText }} />
      <span className="settings-preview__sidebar-item" style={{ background: form.sidebarText }} />
    </div>
    <div className="settings-preview__content" />
  </div>
</div>
```

Leave the Header and Login tiles as-is.

- [ ] **Step 4: Update the preview grid CSS to 2 columns**

In `src/features/settings/settings.css`, change `.settings-preview-grid` (lines 137-141) from `grid-template-columns: repeat(3, minmax(0, 1fr));` to `grid-template-columns: repeat(2, minmax(0, 1fr));`.

- [ ] **Step 5: Verify**

With the dev server running, open Settings > Branding. Confirm: Brand Colors section shows only Primary Color and Accent Color; Preview section shows only Header and Login tiles (2 columns); no contrast warning appears; Save/Reset buttons still work.

- [ ] **Step 6: Commit**

```bash
git add src/features/settings/settingsMockData.ts src/features/settings/BrandingSettingsPage.tsx src/features/settings/settings.css
git commit -m "feat(settings): trim Branding to logo, favicon, primary/accent color, header+login preview"
```

---

## Task 3: Notifications — rewrite the event catalog to the target 20 events

**Files:**
- Modify: `src/features/settings/notificationDefaultsData.ts`

Current catalog has 60 entries across 10 categories with 3 delivery channels (`inApp`, `email`, `inbox`) and an `actionable` flag. Target catalog has exactly 20 entries across 8 new categories with 2 delivery channels (`inApp`, `email` only — `inbox`/`actionable` removed). 4 of the 20 target events have direct existing matches (Leave request submitted/approved/rejected, Attendance correction submitted) — their categories also change to match the new category set. `NOTIFICATION_CATEGORIES`, `NotificationTypeDef`, `NotificationDelivery`, and the `row()` helper are all only consumed by `NotificationsSettingsPage.tsx` and `NotificationPreviewDrawer.tsx` (confirmed via grep), both of which are updated in Task 4 — so this file can be fully replaced.

- [ ] **Step 1: Replace the entire file contents**

Replace all of `src/features/settings/notificationDefaultsData.ts` with:

```ts
export interface NotificationDelivery {
  inApp: boolean;
  email: boolean;
}

export interface NotificationTypeDef {
  id: string;
  category: string;
  name: string;
  description: string;
  eventKey: string;
  defaults: NotificationDelivery;
  preview: {
    inApp: string;
    emailSubject: string;
    emailBody: string;
    recipients: string;
    rules: string;
  };
}

interface RowInput {
  category: string;
  name: string;
  description: string;
  defaults: NotificationDelivery;
  eventKey: string;
  preview: NotificationTypeDef['preview'];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function row(input: RowInput): NotificationTypeDef {
  return {
    id: slugify(input.name),
    category: input.category,
    name: input.name,
    description: input.description,
    eventKey: input.eventKey,
    defaults: input.defaults,
    preview: input.preview,
  };
}

export const NOTIFICATION_CATALOG: NotificationTypeDef[] = [
  row({
    category: 'Projects',
    name: 'Project invite received',
    description: 'Sent when someone is invited to join a project.',
    eventKey: 'project.invite.received',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'You were invited to join "Q3 Roadmap".',
      emailSubject: 'You’ve been invited to a project',
      emailBody: 'You have been invited to join the project "Q3 Roadmap". Open OneVo to accept or decline.',
      recipients: 'Invited user',
      rules: 'Sent once when a project invite is created.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Project invite accepted',
    description: 'Sent when an invited user accepts a project invite.',
    eventKey: 'project.invite.accepted',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Priya Sharma accepted your invite to "Q3 Roadmap".',
      emailSubject: 'Project invite accepted',
      emailBody: 'Priya Sharma accepted the invite to join "Q3 Roadmap".',
      recipients: 'Project owner / inviter',
      rules: 'Sent once when the invite is accepted.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Project invite declined',
    description: 'Sent when an invited user declines a project invite.',
    eventKey: 'project.invite.declined',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'James Chen declined your invite to "Q3 Roadmap".',
      emailSubject: 'Project invite declined',
      emailBody: 'James Chen declined the invite to join "Q3 Roadmap".',
      recipients: 'Project owner / inviter',
      rules: 'Sent once when the invite is declined.',
    },
  }),
  row({
    category: 'Workspaces',
    name: 'Workspace participation requested',
    description: 'Sent when an employee requests to join a workspace.',
    eventKey: 'workspace.participation.requested',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'Maria Lopez requested to join the "Design" workspace.',
      emailSubject: 'New workspace participation request',
      emailBody: 'Maria Lopez has requested to join the "Design" workspace and is waiting for approval.',
      recipients: 'Workspace admins',
      rules: 'Sent once when a participation request is created.',
    },
  }),
  row({
    category: 'Workspaces',
    name: 'Workspace participation approved',
    description: 'Sent when a workspace participation request is approved.',
    eventKey: 'workspace.participation.approved',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your request to join "Design" was approved.',
      emailSubject: 'Workspace request approved',
      emailBody: 'Your request to join the "Design" workspace has been approved.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is approved.',
    },
  }),
  row({
    category: 'Workspaces',
    name: 'Workspace participation rejected',
    description: 'Sent when a workspace participation request is rejected.',
    eventKey: 'workspace.participation.rejected',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your request to join "Design" was declined.',
      emailSubject: 'Workspace request declined',
      emailBody: 'Your request to join the "Design" workspace has been declined.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is rejected.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Related project link requested',
    description: 'Sent when a project requests to link with another project.',
    eventKey: 'project.link.requested',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: '"Q3 Roadmap" requested to link with "Mobile App Launch".',
      emailSubject: 'New related project link request',
      emailBody: 'The project "Q3 Roadmap" has requested to be linked with "Mobile App Launch".',
      recipients: 'Target project owner',
      rules: 'Sent once when a link request is created.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Related project link approved',
    description: 'Sent when a related project link request is approved.',
    eventKey: 'project.link.approved',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your link request with "Mobile App Launch" was approved.',
      emailSubject: 'Project link approved',
      emailBody: 'The request to link "Q3 Roadmap" with "Mobile App Launch" has been approved.',
      recipients: 'Requesting project owner',
      rules: 'Sent once when the request is approved.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Related project link rejected',
    description: 'Sent when a related project link request is rejected.',
    eventKey: 'project.link.rejected',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your link request with "Mobile App Launch" was declined.',
      emailSubject: 'Project link declined',
      emailBody: 'The request to link "Q3 Roadmap" with "Mobile App Launch" has been declined.',
      recipients: 'Requesting project owner',
      rules: 'Sent once when the request is rejected.',
    },
  }),
  row({
    category: 'Work Items',
    name: 'Work item assigned',
    description: 'Sent when a work item is assigned to someone.',
    eventKey: 'work_item.assigned',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'You were assigned "Fix login redirect bug".',
      emailSubject: 'A work item was assigned to you',
      emailBody: 'You have been assigned the work item "Fix login redirect bug" in "Mobile App Launch".',
      recipients: 'Assignee',
      rules: 'Sent once when the assignee changes.',
    },
  }),
  row({
    category: 'Work Items',
    name: 'Work item mentioned',
    description: 'Sent when someone is @mentioned on a work item.',
    eventKey: 'work_item.mentioned',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'David Nguyen mentioned you on "Fix login redirect bug".',
      emailSubject: 'You were mentioned',
      emailBody: 'David Nguyen mentioned you in a comment on "Fix login redirect bug".',
      recipients: 'Mentioned user',
      rules: 'Sent once per mention.',
    },
  }),
  row({
    category: 'Work Items',
    name: 'Work item due soon',
    description: 'Reminder sent shortly before a work item is due.',
    eventKey: 'work_item.due_soon',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: '"Fix login redirect bug" is due tomorrow.',
      emailSubject: 'Upcoming due date',
      emailBody: 'The work item "Fix login redirect bug" assigned to you is due tomorrow.',
      recipients: 'Assignee',
      rules: 'Sent once, 24 hours before the due date.',
    },
  }),
  row({
    category: 'Leave',
    name: 'Leave request submitted',
    description: 'Sent to approvers when an employee submits a leave request.',
    eventKey: 'leave.request.submitted',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Priya Sharma requested 3 days of annual leave.',
      emailSubject: 'New leave request awaiting approval',
      emailBody: 'Priya Sharma has requested 3 days of annual leave from 20-22 Jun. Review and respond in OneVo.',
      recipients: 'Direct manager / approver',
      rules: 'Sent once when the request is submitted.',
    },
  }),
  row({
    category: 'Leave',
    name: 'Leave request approved',
    description: 'Sent to the employee when their leave request is approved.',
    eventKey: 'leave.request.approved',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'Your leave request for 20-22 Jun was approved.',
      emailSubject: 'Your leave request was approved',
      emailBody: 'Your request for 3 days of annual leave from 20-22 Jun has been approved.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is approved.',
    },
  }),
  row({
    category: 'Leave',
    name: 'Leave request rejected',
    description: 'Sent to the employee when their leave request is rejected.',
    eventKey: 'leave.request.rejected',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'Your leave request for 20-22 Jun was declined.',
      emailSubject: 'Your leave request was declined',
      emailBody: 'Your request for 3 days of annual leave from 20-22 Jun has been declined. See manager comments in OneVo.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is rejected.',
    },
  }),
  row({
    category: 'Attendance',
    name: 'Attendance correction submitted',
    description: 'Sent to approvers when an employee submits an attendance correction.',
    eventKey: 'attendance.correction.submitted',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'James Chen submitted an attendance correction for 10 Jun.',
      emailSubject: 'New attendance correction awaiting approval',
      emailBody: 'James Chen has submitted an attendance correction for 10 Jun. Review and respond in OneVo.',
      recipients: 'Direct manager / approver',
      rules: 'Sent once when the correction is submitted.',
    },
  }),
  row({
    category: 'Documents',
    name: 'Document requested',
    description: 'Sent when an employee is asked to submit a document.',
    eventKey: 'document.requested',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'HR requested your "Proof of Address" document.',
      emailSubject: 'Document requested',
      emailBody: 'HR has requested that you upload your "Proof of Address" document in OneVo.',
      recipients: 'Employee',
      rules: 'Sent once when the request is created.',
    },
  }),
  row({
    category: 'Documents',
    name: 'Document approved',
    description: 'Sent when a submitted document is reviewed and approved.',
    eventKey: 'document.approved',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your "Proof of Address" document was approved.',
      emailSubject: 'Document approved',
      emailBody: 'Your submitted document "Proof of Address" has been reviewed and approved.',
      recipients: 'Employee',
      rules: 'Sent once when the document is approved.',
    },
  }),
  row({
    category: 'Automations',
    name: 'Automation alert created',
    description: 'Sent when an automation rule creates a new alert.',
    eventKey: 'automation.alert.created',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Automation "Idle time exceeded" created a new alert for Maria Lopez.',
      emailSubject: 'New automation alert',
      emailBody: 'The automation rule "Idle time exceeded" created a new alert for Maria Lopez.',
      recipients: 'Automation owner / admins',
      rules: 'Sent once per alert created.',
    },
  }),
  row({
    category: 'Approvals',
    name: 'Approval request assigned',
    description: 'Sent when an approval step is assigned to someone.',
    eventKey: 'approval.request.assigned',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'You have a new approval request: "Q3 Budget Increase".',
      emailSubject: 'New approval request assigned to you',
      emailBody: 'You have been assigned an approval step for "Q3 Budget Increase". Review and respond in OneVo.',
      recipients: 'Assigned approver',
      rules: 'Sent once when the approval step is assigned.',
    },
  }),
];

export const NOTIFICATION_CATEGORIES = [
  'Projects',
  'Workspaces',
  'Work Items',
  'Leave',
  'Attendance',
  'Documents',
  'Automations',
  'Approvals',
];
```

- [ ] **Step 2: Commit (after Task 4 is also done, since this file alone won't type-check against the old NotificationsSettingsPage.tsx)**

No commit here — proceed directly to Task 4, then commit both together at the end of Task 4.

---

## Task 4: Notifications — rewrite the page UI to a clean event/channel matrix

**Files:**
- Modify: `src/features/settings/NotificationsSettingsPage.tsx`
- Modify: `src/features/settings/components/NotificationPreviewDrawer.tsx`
- Modify: `src/features/settings/settings.css`

After Task 3, `NOTIFICATION_CATALOG` replaces the old `catalog` source (check the current variable name — likely built from a different export name; update the import accordingly), `NotificationTypeDef` has no `actionable` field, and `NotificationDelivery` has no `inbox` field. This task removes: the Delivery Status / sender-setup card (old lines 172-214), the bulk-action bar and selection column (old lines 256-298, 313-320), the Inbox column and its filter/legend (old lines 240-249, 250-253, 304, 333-340, 358-364), and the delivery-method filter. The result is a toolbar with Search + Category filter (Save Changes stays in the page header), and a table with columns: Notification (name + description) | Category | In-app | Email | Actions (Preview).

- [ ] **Step 1: Read the current file in full**

Run: `cd /c/onevoNew/OneVo_Desin- && cat -n src/features/settings/NotificationsSettingsPage.tsx`

Note the exact current import names, state variable names, and the `catalog`/`baseline` construction (referenced generically below as `NOTIFICATION_CATALOG`/`deliveries`/`setDeliveries` — adjust to whatever the file actually calls them).

- [ ] **Step 2: Update imports and remove dead state**

- Update the import from `./notificationDefaultsData` to import `NOTIFICATION_CATALOG`, `NOTIFICATION_CATEGORIES`, `type NotificationDelivery`, `type NotificationTypeDef` (per Task 3's new exports — the old catalog export name may differ; replace it with `NOTIFICATION_CATALOG`).
- Remove state/derived values that only existed for removed features: `actionableOnly` + its setter (old line 43), `methodFilter` (delivery-method filter) and its setter, the selection state (`selected`/`selectedIds` used by the bulk bar and select-all checkbox), and `deliveryMatchesFilter` (only used by the removed method filter).
- Remove the `visibleCategories` monitoring-capability filter (old lines 49-54) — since `NOTIFICATION_CATEGORIES` no longer contains "Exceptions / Monitoring", just use `NOTIFICATION_CATEGORIES` directly for the category filter dropdown.
- Update the `filtered` memo (old lines 56-66) to filter only by `search` and `categoryFilter` (drop `methodFilter`/`actionableOnly` conditions).

- [ ] **Step 3: Remove the Delivery Status card**

Delete the entire `<section className="settings-card settings-card--compact">...</section>` block for "Delivery Status" (old lines 172-214) — this includes the status chips row, the sender name input, and the sender/domain badges.

- [ ] **Step 4: Simplify the toolbar to Search + Category filter**

In the toolbar (`cfg-page__toolbar`, old lines 221-254), keep only:
- The search input (old lines 222-229)
- The category filter `<select>` (old lines 230-239), with its `<option>`s built from `NOTIFICATION_CATEGORIES` (plus an "All categories" default option)

Remove the delivery-method filter `<select>` (old lines 240-249) and the "Actionable only" checkbox (old lines 250-253).

- [ ] **Step 5: Remove the bulk-action bar**

Delete the entire `<div className="notif-bulk-bar">...</div>` block (old lines 256-285) and the "N selected" / select-all / per-row checkbox UI that drives it.

- [ ] **Step 6: Rewrite the table to 4 data columns + Actions**

Update the `<thead>` (old lines 290-306) to:

```tsx
<thead>
  <tr>
    <th>Notification</th>
    <th>Category</th>
    <th className="notif-matrix__channel">In-app</th>
    <th className="notif-matrix__channel">Email</th>
    <th className="cfg-row-actions__header">Actions</th>
  </tr>
</thead>
```

For each row in `filtered`, render:
- **Notification** cell: `<div className="cfg-table__name">{n.name}</div><div className="cfg-table__meta">{n.description}</div>` (this is the existing pattern used by `.cfg-table__name`/`.cfg-table__meta` elsewhere in the app — reuse it instead of a separate Description column)
- **Category** cell: `{n.category}`
- **In-app** cell: a checkbox bound to `deliveries[n.id]?.inApp ?? n.defaults.inApp`, toggling via the existing per-row delivery update handler (adjust the handler to only handle `inApp`/`email` instead of `inApp`/`email`/`inbox`)
- **Email** cell: same pattern for `email`
- **Actions** cell: keep the existing "Preview" button (old lines 341-345) that sets `previewId`

Remove the select-all checkbox column (old `<th>` at 291) and the Inbox column entirely (old `<th>Inbox</th>` at line 304 and the corresponding `<td>` block at lines 333-340, including the `actionable`-based disabled/title logic).

- [ ] **Step 7: Remove the Inbox legend**

Delete the `<div className="notif-legend">` block (old lines 358-364) that explains the Inbox channel.

- [ ] **Step 8: Update the page description**

Change the `SettingsPageHeader` `description` prop (old line 153) from `"Manage tenant notification defaults for in-app, email, and actionable Inbox delivery."` to `"Choose which events send in-app and email notifications."`.

- [ ] **Step 9: Verify NotificationPreviewDrawer still compiles**

`NotificationPreviewDrawer.tsx` reads `notification.eventKey` and `notification.preview.*`, both of which still exist on `NotificationTypeDef` after Task 3 — no changes needed there. Confirm by running:

`cd /c/onevoNew/OneVo_Desin- && npx tsc -b --noEmit`

Fix any remaining type errors referencing removed fields (`actionable`, `inbox`, `methodFilter`, `selected`, etc.) by removing the offending code.

- [ ] **Step 10: Remove now-dead CSS**

In `src/features/settings/settings.css`:
- Remove `.notif-bulk-bar` (lines 366-374) — no longer rendered.
- Remove `.notif-status-row`, `.notif-status-chip`, `.notif-status-chip__label`, `.notif-sender-row`, `.notif-sender-meta`, `.notif-unsaved-badge` (lines 297-348) — these styled the removed Delivery Status card.
- Keep `.notif-matrix__channel`, `.notif-matrix th`/`td`, `.notif-matrix .cfg-table__name`, `.notif-preview-card*`, `.notif-toolbar`, `.notif-filter-check`, `.notif-legend` (the legend container class itself can stay even if currently only used by the removed Inbox legend — but if grep confirms it's now unused anywhere, remove it too).

Run `grep -n "notif-legend\|notif-toolbar\|notif-filter-check" src/features/settings/NotificationsSettingsPage.tsx` after Step 7 to confirm which of these are still referenced, and remove the unused ones from `settings.css`.

- [ ] **Step 11: Visual verification**

With the dev server running, open Settings > Notifications. Confirm:
- Toolbar shows Search + Category filter only
- Table has columns Notification (name + description), Category, In-app, Email, Actions
- All 20 target events are listed (Project invite received/accepted/declined, Workspace participation requested/approved/rejected, Related project link requested/approved/rejected, Work item assigned/mentioned/due soon, Leave request submitted/approved/rejected, Attendance correction submitted, Document requested/approved, Automation alert created, Approval request assigned)
- Toggling In-app/Email checkboxes works
- Preview action opens the drawer with correct content
- No Delivery Status card, no bulk action bar, no Inbox column

- [ ] **Step 12: Commit**

```bash
git add src/features/settings/notificationDefaultsData.ts src/features/settings/NotificationsSettingsPage.tsx src/features/settings/components/NotificationPreviewDrawer.tsx src/features/settings/settings.css
git commit -m "feat(settings): rewrite Notifications as a clean in-app/email event matrix"
```

---

## Task 5: Roles & Permissions — remove the "Included for all employees" section

**Files:**
- Modify: `src/features/admin/RolesPermissionsPage.tsx`

The Create/Edit Role drawer (lines 365-554) already matches the target shape: Role Name and Description are side by side (lines 384-408), permissions are shown as real checkboxes grouped by module (lines 474-525, already excluding universal/system permissions via `GRANTABLE_PERMISSIONS`/`groupedPermissions`), and the roles table (lines 303-313) already has exactly the target columns (Role | Description | Type | Permissions | Users | Updated | Actions) with all 5 target row actions (Edit/Clone/Assign/View users/Deactivate, lines 333-356). The only change needed is removing the "Included for all employees" hint/popover block.

- [ ] **Step 1: Confirm current line numbers**

Run: `cd /c/onevoNew/OneVo_Desin- && grep -n "admin-universal-hint\|includedPermsOpen\|includedPermsRef\|UNIVERSAL_PERMISSIONS" src/features/admin/RolesPermissionsPage.tsx`

Expected matches around: import (line ~11), state declaration (line ~29), ref declaration (line ~30), click-outside effect (lines ~124-133), and the JSX block (lines ~428-452).

- [ ] **Step 2: Remove the state, ref, and click-outside effect**

Remove:
- `const [includedPermsOpen, setIncludedPermsOpen] = useState(false);` (line ~29)
- `const includedPermsRef = useRef<HTMLDivElement>(null);` (line ~30)
- The `useEffect` block that closes the popover on outside click (lines ~124-133):

```tsx
useEffect(() => {
  if (!includedPermsOpen) return;
  const handler = (event: MouseEvent) => {
    if (includedPermsRef.current && !includedPermsRef.current.contains(event.target as Node)) {
      setIncludedPermsOpen(false);
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, [includedPermsOpen]);
```

(adjust to match the exact body found in Step 1 — the goal is to remove the entire effect tied to `includedPermsOpen`).

If `useRef` and/or `useEffect` become unused elsewhere in the file after this removal, remove them from the React import too (check with `grep -n "useRef\|useEffect" src/features/admin/RolesPermissionsPage.tsx` first).

- [ ] **Step 3: Remove the JSX block**

Remove the entire block (lines ~428-452):

```tsx
<div className="admin-universal-hint" ref={includedPermsRef}>
  ... (text, toggle button, and popover listing UNIVERSAL_PERMISSIONS) ...
</div>
```

- [ ] **Step 4: Remove the now-unused import**

If `UNIVERSAL_PERMISSIONS` is no longer referenced anywhere else in `RolesPermissionsPage.tsx` (check with `grep -n "UNIVERSAL_PERMISSIONS" src/features/admin/RolesPermissionsPage.tsx` — should show only the import line after Step 3), remove it from the import list (line ~11). Do **not** remove the export from `adminMockData.ts` — it's still used by `AdminUsersPage.tsx`.

- [ ] **Step 5: Remove orphaned CSS (if any)**

Run: `grep -rn "admin-universal-hint\|admin-included-popover" src/features/admin/*.tsx src/features/admin/*.css`

If `admin.css` defines `.admin-universal-hint` / `.admin-included-popover` and nothing in `.tsx` references them anymore, remove those rules from `admin.css`.

- [ ] **Step 6: Verify**

Run: `cd /c/onevoNew/OneVo_Desin- && npx tsc -b --noEmit`

Then open Settings > Roles & Permissions > Create Role (or Edit an existing custom role). Confirm: drawer is single-screen, Role Name + Description are side by side, permission checkboxes are grouped by module, and there is no "Included for all employees" / "View included permissions" text or popover anywhere in the drawer.

- [ ] **Step 7: Commit**

```bash
git add src/features/admin/RolesPermissionsPage.tsx src/features/admin/admin.css
git commit -m "feat(admin): remove included-for-all-employees popover from role drawer"
```

---

## Task 6: Users page — reduce table to the 6 target columns

**Files:**
- Modify: `src/features/admin/AdminUsersPage.tsx`

Current table (`<thead>` lines 358-369) has 10 columns: User, Email, Position, Department, Account Status, Invite Status, Assigned Roles, MFA, Last Login, Actions. Target is 6: User | Employee | Position | Access status | Last active | Actions. The "Create Login Access" drawer (lines 470-576) already does **not** ask for position or role assignment as editable inputs (Position/Roles are shown read-only from the linked employee record) — no change needed there.

- [ ] **Step 1: Read the table head and body rendering in full**

Run: `cd /c/onevoNew/OneVo_Desin- && sed -n '350,470p' src/features/admin/AdminUsersPage.tsx`

This shows the `<thead>` (358-369) and the row-rendering `<tbody>` for each `AdminUser`.

- [ ] **Step 2: Restructure to 6 columns**

Replace the `<thead>` with:

```tsx
<thead>
  <tr>
    <th>User</th>
    <th>Employee</th>
    <th>Position</th>
    <th>Access status</th>
    <th>Last active</th>
    <th className="cfg-row-actions__header">Actions</th>
  </tr>
</thead>
```

For each row, map the old columns onto the new 6 as follows:
- **User**: keep the existing "User" cell content (name + avatar, currently lines ~374-384) — this is the login/account identity.
- **Employee**: new cell showing `user.employeeName` (fall back to an em-dash `—` if `employeeName` is `null`, e.g. for users with no linked employee yet). If the old "Email" column (the `<td>` immediately after User) showed the account email, move that email into a `.cfg-table__meta` line under the employee name in this cell — e.g.:
  ```tsx
  <td>
    <div className="cfg-table__name">{user.employeeName ?? '—'}</div>
    {user.email && <div className="cfg-table__meta">{user.email}</div>}
  </td>
  ```
- **Position**: keep the existing Position cell as-is.
- **Access status**: keep the existing "Account Status" badge cell, but if the user's `inviteStatus` is `'sent'` or `'expired'` (i.e. login access not yet activated), append a small secondary badge/text showing the invite status next to the account-status badge, e.g.:
  ```tsx
  <td>
    {/* existing account status badge */}
    {user.inviteStatus !== 'accepted' && (
      <div className="cfg-table__meta">Invite {user.inviteStatus}</div>
    )}
  </td>
  ```
  (adjust the exact condition/labels to match whatever invite-status values and badge markup already exist in the file — the goal is to fold invite status into this single column rather than a separate one).
- **Last active**: rename the existing "Last Login" column header and cell to "Last active" — keep the same value/formatting (`formatRelativeTime`/`formatDateTime` etc.).
- **Actions**: keep the existing Actions cell as-is.

Remove the old **Department**, **Assigned Roles**, and **MFA** columns entirely (both `<th>` and per-row `<td>`). If department information is useful context, it may be appended as a second `.cfg-table__meta` line under Position instead of a dedicated column — use judgment based on how crowded the Position cell becomes, but a dedicated column is out of scope per the target list.

- [ ] **Step 3: Verify**

Run: `cd /c/onevoNew/OneVo_Desin- && npx tsc -b --noEmit`

Then open Settings > Users. Confirm the table shows exactly 6 columns (User, Employee, Position, Access status, Last active, Actions), invite-status information is visible (folded into Access status), and the page still filters/searches correctly (the summary cards row above the table, lines 294-311, is unaffected by this change — leave it as-is).

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/AdminUsersPage.tsx
git commit -m "feat(admin): reduce Users table to User/Employee/Position/Access status/Last active/Actions"
```

---

## Task 7: Audit Log — align columns and toolbar to target

**Files:**
- Modify: `src/features/admin/AuditLogPage.tsx`

Current table (`<thead>` lines 137-145) has 7 columns: Timestamp, Actor, Action, Resource, IP Address, Status, Details. Target is 6: Time | Actor | Event | Target | Source | Details. Current toolbar (lines 88-131) has Search + 2 separate date inputs + Actor filter + Action filter + Resource Type filter + Category filter (7 controls). Target toolbar is Search + Actor filter + Event filter + Date range (4 controls/groups).

- [ ] **Step 1: Read the toolbar and table sections in full**

Run: `cd /c/onevoNew/OneVo_Desin- && sed -n '80,165p' src/features/admin/AuditLogPage.tsx`

- [ ] **Step 2: Rename columns**

In the `<thead>` (lines 137-145):
- "Timestamp" → "Time" (keep the same cell content/formatting)
- "Actor" → unchanged
- "Action" → "Event" (keep the same cell content — currently rendered with `<code style={{ fontSize: '0.72rem' }}>`, line 152; this inline style can stay)
- "Resource" → "Target" (keep the same cell content)
- "IP Address" → "Source" (keep the same cell content)
- "Status" → remove as a separate column; fold the status badge (lines 158-162, `cfg-badge cfg-badge--{success|failed}`) into the **Details** cell, e.g. prefix the Details cell with the existing badge markup followed by the details text
- "Details" → unchanged (now also carries the status badge per above)

Resulting `<thead>`:

```tsx
<thead>
  <tr>
    <th>Time</th>
    <th>Actor</th>
    <th>Event</th>
    <th>Target</th>
    <th>Source</th>
    <th>Details</th>
  </tr>
</thead>
```

- [ ] **Step 3: Simplify the toolbar**

Keep:
- Search input (lines 89-92)
- Actor filter `<select>` (lines 107-112)
- Action filter `<select>` (lines 113-118) — relabel as the "Event filter" (rename the `<select>`'s default/placeholder option text from whatever references "Action" to "All events", but keep `ACTION_OPTIONS` as the source of options since "Action" maps to the renamed "Event" column)

Combine the two date inputs (Date From at lines 93-99, Date To at lines 100-106) into a single visually-grouped "Date range" control — wrap both inputs in one container with one label, e.g.:

```tsx
<div className="cfg-search" style={{ gap: 6 }}>
  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--nexus-text-secondary)' }}>Date range</label>
  {/* existing Date From input, unchanged */}
  <span style={{ color: 'var(--nexus-text-secondary)' }}>–</span>
  {/* existing Date To input, unchanged */}
</div>
```

(keep the existing input elements' `value`/`onChange` bindings exactly as they are — only change the surrounding wrapper/labeling).

Remove the Resource Type filter `<select>` (lines 119-124) and the Category filter `<select>` (lines 125-130) entirely, along with `RESOURCE_TYPES` and `CATEGORY_OPTIONS` if they become unused (check with `grep -n "RESOURCE_TYPES\|CATEGORY_OPTIONS" src/features/admin/AuditLogPage.tsx` after removal — if a filter state variable like `resourceTypeFilter`/`categoryFilter` is now unused, remove its `useState` and any references in the filtering logic too).

- [ ] **Step 4: Verify**

Run: `cd /c/onevoNew/OneVo_Desin- && npx tsc -b --noEmit`

Then open Settings > Audit Log. Confirm: toolbar shows Search, Date range (from–to), Actor filter, Event filter only; table columns are Time, Actor, Event, Target, Source, Details; the status badge now appears inline within the Details column; filtering still works for the remaining controls.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/AuditLogPage.tsx
git commit -m "feat(admin): align Audit Log columns and toolbar to Time/Actor/Event/Target/Source/Details"
```

---

## Task 8: Remove the tinted Settings card header band

**Files:**
- Modify: `src/features/settings/settings.css:15-19`

Acceptance criteria say "Avoid: Colored section title bars" and "No colored title bands". `.settings-card__header` currently has `background: var(--code-bg)` (the same blue-gray tint removed from table headers in Plan A) — every settings card title bar across General, Branding, Notifications, Billing, Devices currently has this tint.

- [ ] **Step 1: Confirm current rule**

Run: `cd /c/onevoNew/OneVo_Desin- && grep -n -A4 "^\.settings-card__header" src/features/settings/settings.css`

Expected:
```css
.settings-card__header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--code-bg);
}
```

- [ ] **Step 2: Remove the tinted background**

Change to:

```css
.settings-card__header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-panel);
}
```

- [ ] **Step 3: Visual verification**

With the dev server running, check Settings > General, Branding, Billing, Devices, Notifications. Confirm each settings card's title bar (e.g. "Company", "Brand Colors", "Current Subscription") now has a white background matching the card body — no colored band.

- [ ] **Step 4: Commit**

```bash
git add src/features/settings/settings.css
git commit -m "style(settings): remove tinted background from settings card headers"
```

---

## Task 9: Full Settings visual sweep

**Files:** none (verification only)

- [ ] **Step 1: Walk through all 8 settings pages**

With the dev server running, visit each Settings page (General, Branding, Users, Roles & Permissions, Notifications, Billing, Devices, Audit Log) and confirm:
- Page has a title + one short description line + optional primary action top-right (via `SettingsPageHeader`)
- No oversized cards, no colored section title bars, no developer-only configuration
- Tables match the Plan A styling (white header, neutral hover, 12px radius) — Billing invoices table, Devices table, Notifications matrix, Users table, Roles table, Audit Log table
- Roles & Permissions Create/Edit Role drawer remains single-screen with no "Included for all employees" section
- Users page shows the 6-column layout and the Invite/Create Login Access flow does not ask for position or role assignment

- [ ] **Step 2: Fix any stragglers**

If any page still has a tinted card header, a leftover unused import, or a TypeScript error surfaced by `npx tsc -b --noEmit`, fix it directly and note the fix.

- [ ] **Step 3: Final commit (only if Step 2 made changes)**

```bash
git add -A
git commit -m "fix: address stragglers from settings content cleanup sweep"
```
