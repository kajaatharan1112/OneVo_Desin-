# People Area Navigation & Onboarding/Offboarding Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **No test runner exists in this repo** (no vitest/jest configured). "Verify" steps mean: run `npm run build` (tsc -b && vite build) from `C:\onevoNew\OneVo_Desin-` to confirm there are no TypeScript errors, and/or run `npm run dev` and visually check the relevant screen in the browser. Do not invent test files.

**Goal:** Remove "Onboarding"/"Offboarding" as People sub-sidebar pages, make Employees + Checklist Templates the only People sub-items, rebuild the Employees screen with Add Employee / Bulk Onboard / Import History actions, build a 5-step single-employee onboarding wizard, a 7-step bulk onboarding wizard with import history, rework Checklist Templates to support "Applies To" scoping and the 5 allowed assignee types, and wire onboarding/offboarding checklist task generation from templates.

**Architecture:** Pure frontend (React 19 + TypeScript + Zustand), mock-data driven, following the existing `cfg-page` / `org-slideover` / `schedules-cfg-modal` / `checklist-template-modal` visual patterns already used throughout `src/features/people` and `src/features/organization`. New Zustand stores hold in-memory state only (no backend). CSV is parsed with a small hand-written parser (no new dependency); `.xlsx` upload is accepted but shows a "please upload CSV" notice (documented simplification — no xlsx parsing library exists in `package.json`).

**Tech Stack:** React 19, TypeScript ~6.0, Zustand 5, react-router-dom 7, lucide-react icons. No new npm dependencies.

---

## Data Model Reference (read this before starting any task)

### Existing `Employee` (src/types/organization.ts) gets one new optional field:
```ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  startDate: string;
  workMode: WorkMode | null;
  /** Role IDs confirmed by admin during onboarding (Access Confirmation step). */
  roleIds?: string[];
}
```

### New: Checklist template model (replaces current one in `checklistTemplateTypes.ts`)
```ts
export type ChecklistTemplateType = 'onboarding' | 'offboarding';
export type ChecklistTemplateStatus = 'draft' | 'active' | 'inactive';

export type ChecklistAssigneeType =
  | 'Employee'
  | 'Reporting Manager'
  | 'Department Head'
  | 'Specific Position'
  | 'Specific Employee';

export type ChecklistAppliesTo = 'company' | 'department' | 'position';
export type DueOffsetUnit = 'hours' | 'days';

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  description: string;
  assigneeType: ChecklistAssigneeType | '';
  assigneePositionId: string;
  assigneeEmployeeId: string;
  dueOffsetValue: number;
  dueOffsetUnit: DueOffsetUnit;
  required: boolean;
  requiredDocument: string;
  sortOrder: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: ChecklistTemplateType;
  description: string;
  status: ChecklistTemplateStatus;
  appliesTo: ChecklistAppliesTo;
  departmentIds: string[];
  positionIds: string[];
  items: ChecklistTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplateFormState {
  open: boolean;
  mode: 'create' | 'edit';
  templateId: string | null;
}
```

### New: Checklist task instance model (`src/features/people/checklist-tasks/checklistTaskTypes.ts`)
```ts
export interface ChecklistTaskInstance {
  id: string;
  employeeId: string;
  templateId: string;
  templateType: 'onboarding' | 'offboarding';
  title: string;
  description: string;
  assigneeLabel: string;
  dueDate: string; // ISO date (yyyy-mm-dd)
  required: boolean;
  requiredDocument: string;
  status: 'pending' | 'completed';
  createdAt: string;
}
```

### New: Bulk onboarding model (`src/features/people/bulk-onboarding/bulkOnboardingTypes.ts`)
```ts
export const BULK_IMPORT_REQUIRED_COLUMNS = [
  'Employee Number',
  'First Name',
  'Last Name',
  'Work Email',
  'Department',
  'Position',
  'Start Date',
  'Employment Type'
] as const;

export type BulkImportField = typeof BULK_IMPORT_REQUIRED_COLUMNS[number];

export interface BulkImportColumnMapping {
  /** sourceHeader -> target field, or '' if unmapped/ignored */
  [sourceHeader: string]: BulkImportField | '';
}

export interface BulkImportRow {
  rowIndex: number;
  raw: Record<string, string>;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  departmentName: string;
  positionName: string;
  startDate: string;
  employmentType: string;
  resolvedDepartmentId: string | null;
  resolvedPositionId: string | null;
  reportingManagerLabel: string | null;
  errors: string[];
  warnings: string[];
  skip: boolean;
}

export interface BulkAccessGroup {
  positionId: string;
  positionName: string;
  rowIndexes: number[];
  suggestedRoleIds: string[];
  confirmedRoleIds: string[];
}

export type ImportRunStatus = 'awaiting-review' | 'imported' | 'invites-sent';

export interface ImportRun {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  importedCount: number;
  warningCount: number;
  failedCount: number;
  skippedCount: number;
  inviteStatus: 'not-sent' | 'sent';
  status: ImportRunStatus;
  createdEmployeeIds: string[];
  failedRows: BulkImportRow[];
}
```

### New: Position → suggested roles (`src/features/people/employees/positionAccessUtils.ts`)
```ts
import { MOCK_ROLES, type AdminRole } from '../../admin/adminMockData';

/** Demo mapping of positionId -> suggested role ids, used by Access Confirmation steps. */
export const POSITION_SUGGESTED_ROLES: Record<string, string[]> = {
  'pos-ceo': ['role-owner'],
  'pos-cto': ['role-owner'],
  'pos-cfo': ['role-owner'],
  'pos-hr-mgr': ['role-people-admin'],
  'pos-eng-mgr': ['role-leave-approver'],
  'pos-be-lead': ['role-leave-approver'],
  'pos-fe-lead': ['role-leave-approver'],
  'pos-qa-lead': ['role-leave-approver'],
  'pos-swe': ['role-readonly'],
  'pos-fe-eng': ['role-readonly'],
  'pos-qa-eng': ['role-readonly'],
  'pos-fin-mgr': ['role-people-admin'],
  'pos-acct': ['role-readonly']
};

export function getSuggestedRoleIdsForPosition(positionId: string): string[] {
  return POSITION_SUGGESTED_ROLES[positionId] ?? [];
}

export function getSuggestedRolesForPosition(positionId: string): AdminRole[] {
  const ids = getSuggestedRoleIdsForPosition(positionId);
  return MOCK_ROLES.filter(r => ids.includes(r.id) && r.active);
}
```

---

## Task 1: People sub-sidebar navigation cleanup

**Files:**
- Modify: `src/shared/components/main-menu/main-menu.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Update `TENANT_MAIN_ITEMS` People subSection (lines ~78-84)**

Replace:
```tsx
  { id: 'people',      label: 'People',      icon: railIcon(UsersRound),      subSections: [
    { id: 'main', items: [
      { id: 'onboarding',  label: 'Onboarding',  icon: <UserCheck size={13} /> },
      { id: 'offboarding', label: 'Offboarding', icon: <UserMinus size={13} /> },
      { id: 'checklist-templates', label: 'Checklist Templates', icon: <ListChecks size={13} /> },
    ]},
  ]},
```
with:
```tsx
  { id: 'people',      label: 'People',      icon: railIcon(UsersRound),      subSections: [
    { id: 'main', items: [
      { id: 'employees', label: 'Employees', icon: <Users size={13} /> },
      { id: 'checklist-templates', label: 'Checklist Templates', icon: <ListChecks size={13} /> },
    ]},
  ]},
```
`Users` is already imported (line 4). `UserCheck`/`UserMinus` become unused in this file only if not referenced elsewhere — check with `grep -n "UserCheck\|UserMinus" src/shared/components/main-menu/main-menu.tsx`. If unused after this edit and the EMPLOYEE_ITEMS edit below, remove them from the lucide-react import on line 6 to avoid an unused-import lint error.

- [ ] **Step 2: Update `EMPLOYEE_ITEMS` People subSection (lines ~126-132)**

Replace:
```tsx
  { id: 'people',     label: 'People',     icon: railIcon(UsersRound),      subSections: [
    { id: 'main', items: [
      { id: 'employees',   label: 'Employees',   icon: <Users size={13} />     },
      { id: 'onboarding',  label: 'Onboarding',  icon: <UserCheck size={13} /> },
      { id: 'offboarding', label: 'Offboarding', icon: <UserMinus size={13} /> },
    ]},
  ]},
```
with:
```tsx
  { id: 'people',     label: 'People',     icon: railIcon(UsersRound),      subSections: [
    { id: 'main', items: [
      { id: 'employees', label: 'Employees', icon: <Users size={13} /> },
    ]},
  ]},
```
(EMPLOYEE_ITEMS' People section only has Employees — Checklist Templates is a tenant-config-only screen, consistent with current behavior where EMPLOYEE_ITEMS never linked to it.)

- [ ] **Step 3: Add tenant-view "Employees" click + render handling**

In `handleNavClick` (around line 169), after the existing `checklist-templates` branch, add a branch for `employees`:
```tsx
    if (currentView === 'tenant' && item.label === 'People' && subId === 'checklist-templates') {
      navigate('/people/checklist-templates');
      return;
    }
    if (currentView === 'tenant' && item.label === 'People' && subId === 'employees') {
      navigate('/people/employees');
      return;
    }
```

- [ ] **Step 4: Render `PeopleEmployeesRoutes` for tenant view when People → Employees**

In `App.tsx`, inside the `hasSubNav` block of the tenant branch (around line 204-208), add a check before the checklist-templates check:
```tsx
      if (activeTab === 'People' && (resolvedSubId === 'employees' || location.pathname.startsWith('/people/employees'))) {
        return <PeopleEmployeesRoutes />;
      }
      if (activeTab === 'People' && (resolvedSubId === 'checklist-templates' || location.pathname.startsWith('/people/checklist-templates'))) {
        return <ChecklistTemplatesPage />;
      }
```

- [ ] **Step 5: Verify**

Run `npm run build` from `C:\onevoNew\OneVo_Desin-`. Fix any unused-import errors from Step 1/2. Then run `npm run dev`, open the app in tenant view, click **People** in the rail — the sub-nav should show only "Employees" and "Checklist Templates", and clicking "Employees" should render the Employees page at `/people/employees`. Confirm no remaining references to `onboarding`/`offboarding` sub-nav ids exist via `grep -rn "'onboarding'\|'offboarding'" src/shared/components/main-menu/main-menu.tsx src/app/App.tsx` (the People section should have none; ignore unrelated matches in other features).

- [ ] **Step 6: Commit**
```bash
git add src/shared/components/main-menu/main-menu.tsx src/app/App.tsx
git commit -m "refactor(people): remove onboarding/offboarding sub-nav, add Employees to People"
```

---

## Task 2: Checklist template data model rework

**Files:**
- Modify: `src/features/people/checklist-templates/checklistTemplateTypes.ts`
- Modify: `src/features/people/checklist-templates/checklistTemplateMockData.ts`
- Modify: `src/features/people/checklist-templates/checklistTemplateUtils.ts`
- Modify: `src/store/checklistTemplateStore.ts`

- [ ] **Step 1: Replace `checklistTemplateTypes.ts` contents**

Replace the entire file with the "New: Checklist template model" block from the Data Model Reference section above.

- [ ] **Step 2: Rewrite `checklistTemplateMockData.ts`**

Replace the file with:
```ts
import type { ChecklistTemplate } from './checklistTemplateTypes';

const ts = (d: string) => d;

export const SEED_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'ct-onboarding-standard',
    name: 'Standard Employee Onboarding',
    type: 'onboarding',
    description: 'Default onboarding checklist for new hires.',
    status: 'active',
    appliesTo: 'company',
    departmentIds: [],
    positionIds: [],
    items: [
      { id: 'i1', title: 'Complete employee profile', description: '', assigneeType: 'Employee', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 0, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 0 },
      { id: 'i2', title: 'Upload ID/passport', description: '', assigneeType: 'Employee', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 24, dueOffsetUnit: 'hours', required: true, requiredDocument: 'Government ID', sortOrder: 1 },
      { id: 'i3', title: 'Sign employment documents', description: '', assigneeType: 'Employee', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 1, dueOffsetUnit: 'days', required: true, requiredDocument: 'Signed employment contract', sortOrder: 2 },
      { id: 'i4', title: 'Manager welcome meeting', description: '', assigneeType: 'Reporting Manager', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 2, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 3 },
      { id: 'i5', title: 'Confirm payroll details', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 3, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 4 }
    ],
    createdAt: ts('2025-10-01T10:00:00Z'),
    updatedAt: ts('2026-03-01T10:00:00Z')
  },
  {
    id: 'ct-offboarding-standard',
    name: 'Standard Employee Offboarding',
    type: 'offboarding',
    description: 'Default offboarding checklist for departing employees.',
    status: 'active',
    appliesTo: 'company',
    departmentIds: [],
    positionIds: [],
    items: [
      { id: 'i1', title: 'Confirm final working date', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 7, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 0 },
      { id: 'i2', title: 'Handover work', description: '', assigneeType: 'Reporting Manager', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 5, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 1 },
      { id: 'i3', title: 'Collect laptop/equipment', description: '', assigneeType: 'Reporting Manager', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 1, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 2 },
      { id: 'i4', title: 'Final payroll review', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 0, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 3 },
      { id: 'i5', title: 'Exit interview', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 0, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 4 }
    ],
    createdAt: ts('2025-10-01T10:00:00Z'),
    updatedAt: ts('2026-03-01T10:00:00Z')
  }
];
```
Note: for offboarding items, `dueOffsetValue` is stored as a positive "days before exit" number — the generator (Task 4) subtracts it from the last working day. This keeps the type free of a separate sign concept while matching the spec's "due after" framing.

- [ ] **Step 3: Update `checklistTemplateUtils.ts`**

In `formatAssigneeSummary`, remove the `'Role'` case entirely (the function's switch already covers `'Employee' | 'Reporting Manager' | 'Department Head' | 'Specific Position' | 'Specific Employee'` — just delete the `case 'Role': ...` line).

In `validateChecklistTemplate`, remove the `Role` check block:
```ts
    if (item.assigneeType === 'Role' && !item.assigneeRole) {
      issues.push({ id: `item-role-${idx}`, message: `Item ${idx + 1}: role is required.` });
    }
```
and add an "Applies To" validation after the name/type checks:
```ts
  if (template.appliesTo === 'department' && (!template.departmentIds || template.departmentIds.length === 0)) {
    issues.push({ id: 'applies-to', message: 'Select at least one department.' });
  }
  if (template.appliesTo === 'position' && (!template.positionIds || template.positionIds.length === 0)) {
    issues.push({ id: 'applies-to', message: 'Select at least one position.' });
  }
```
This requires widening the function's parameter type to include `appliesTo`, `departmentIds`, `positionIds` as optional — update the signature to:
```ts
export function validateChecklistTemplate(
  template: Partial<ChecklistTemplate> & { items: ChecklistTemplateItem[] },
  forActivate = false
): ChecklistValidationIssue[] {
```
(`Partial<ChecklistTemplate>` already includes those fields since they're required on `ChecklistTemplate`; `Partial<>` makes them optional, so no further change needed beyond removing the old `assigneeRole` reference.)

- [ ] **Step 4: Update `checklistTemplateStore.ts`**

In `createEmptyChecklistItem`, replace `assigneeRole`, `assigneePositionId`, `assigneeEmployeeId`, `dueOffsetDays` fields per the new shape:
```ts
export function createEmptyChecklistItem(sortOrder: number): ChecklistTemplateItem {
  return {
    id: itemId(),
    title: '',
    description: '',
    assigneeType: '',
    assigneePositionId: '',
    assigneeEmployeeId: '',
    dueOffsetValue: 0,
    dueOffsetUnit: 'days',
    required: true,
    requiredDocument: '',
    sortOrder
  };
}
```
In `saveTemplate`, when creating a new template (the `else` branch building `template`), ensure `appliesTo`, `departmentIds`, `positionIds` are passed through from `data` (they already will be since `data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }` includes them — no signature change needed, just confirm the object literal spreads `data` correctly; it currently lists fields individually, so add the three new fields to that literal):
```ts
    const template: ChecklistTemplate = {
      id,
      name: data.name,
      type: data.type,
      description: data.description,
      status: data.status,
      appliesTo: data.appliesTo,
      departmentIds: data.departmentIds,
      positionIds: data.positionIds,
      items: data.items.map((item, i) => ({ ...item, id: item.id || itemId(), sortOrder: i })),
      createdAt: now(),
      updatedAt: now()
    };
```

- [ ] **Step 5: Verify**

Run `npm run build`. Expect TypeScript errors pointing at `ChecklistTemplateItemsEditor.tsx` and `ChecklistTemplateFormPanel.tsx` (handled in Task 3) — that's expected at this point. Confirm `checklistTemplateUtils.ts`, `checklistTemplateMockData.ts`, `checklistTemplateStore.ts` themselves compile without their own errors by checking the build output only references the editor/form panel files.

- [ ] **Step 6: Commit**
```bash
git add src/features/people/checklist-templates/checklistTemplateTypes.ts src/features/people/checklist-templates/checklistTemplateMockData.ts src/features/people/checklist-templates/checklistTemplateUtils.ts src/store/checklistTemplateStore.ts
git commit -m "refactor(checklist-templates): rework data model for applies-to scoping and 5 assignee types"
```

---

## Task 3: Checklist template editor UI rework

**Files:**
- Modify: `src/features/people/checklist-templates/ChecklistTemplateItemsEditor.tsx`
- Modify: `src/features/people/checklist-templates/ChecklistTemplateFormPanel.tsx`
- Modify: `src/features/people/checklist-templates/ChecklistTemplatesPage.tsx`

- [ ] **Step 1: `ChecklistTemplateItemsEditor.tsx` — remove Role, add Due offset value+unit and Required document**

Remove `'Role'` from `ASSIGNEE_TYPES` (now exactly the 5 allowed values) and remove the `ROLE_OPTIONS` import (`from '../../automations/personTargetUtils'`) and the entire `{item.assigneeType === 'Role' && ...}` block.

Replace the "Due offset (days)" field block:
```tsx
          <div className="org-form-field">
            <label>Due offset (days)</label>
            <input
              type="number"
              value={item.dueOffsetDays}
              onChange={e => updateItem(index, { dueOffsetDays: Number(e.target.value) })}
            />
            <p className="auto-condition-note">{dueHint}</p>
          </div>
```
with a "Due after" row (numeric + unit select) plus an optional "Required document" text field:
```tsx
          <div className="org-form-field">
            <label>Due after</label>
            <div className="checklist-item-card__inline">
              <input
                type="number"
                min={0}
                value={item.dueOffsetValue}
                onChange={e => updateItem(index, { dueOffsetValue: Math.max(0, Number(e.target.value)) })}
              />
              <select
                value={item.dueOffsetUnit}
                onChange={e => updateItem(index, { dueOffsetUnit: e.target.value as ChecklistTemplateItem['dueOffsetUnit'] })}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <p className="auto-condition-note">{dueHint}</p>
          </div>

          <div className="org-form-field">
            <label>Required document (optional)</label>
            <input
              value={item.requiredDocument}
              onChange={e => updateItem(index, { requiredDocument: e.target.value })}
              placeholder="e.g. Signed contract"
            />
          </div>
```
Update `dueHint`:
```ts
  const dueHint = type === 'onboarding'
    ? 'Time relative to employee start date'
    : 'Time before the last working day';
```
Add a small flex style for `.checklist-item-card__inline` in Task "CSS" below (Task 9).

- [ ] **Step 2: `ChecklistTemplateFormPanel.tsx` — add Applies To + scope selector**

Add local state for the new fields, initialized in the existing `useEffect` (mirroring `name`/`type`/etc.):
```ts
  const [appliesTo, setAppliesTo] = useState<ChecklistAppliesTo>('company');
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);
```
(import `ChecklistAppliesTo` from `./checklistTemplateTypes`, and `useOrganizationStore` from `../../../store/organizationStore` for department/position options.)

In the `useEffect` that seeds state from `existing`/defaults, add:
```ts
      setAppliesTo(existing.appliesTo);
      setDepartmentIds(existing.departmentIds);
      setPositionIds(existing.positionIds);
```
to the `isEdit && existing` branch, and in the `else` branch:
```ts
      setAppliesTo('company');
      setDepartmentIds([]);
      setPositionIds([]);
```

In `validationIssues` memo, pass the new fields through:
```ts
    () => validateChecklistTemplate({ name, type: type || undefined, description, status, items, appliesTo, departmentIds, positionIds }, status === 'active'),
```
with `appliesTo, departmentIds, positionIds` added to the dependency array.

In `handleSave`'s `saveTemplate` call, add the three fields to the payload object.

In the JSX, after the "Status" field and before the items editor, add:
```tsx
          <div className="org-form-field">
            <label>Applies To</label>
            <select value={appliesTo} onChange={e => {
              const v = e.target.value as ChecklistAppliesTo;
              setAppliesTo(v);
              if (v !== 'department') setDepartmentIds([]);
              if (v !== 'position') setPositionIds([]);
            }}>
              <option value="company">Full Company</option>
              <option value="department">Department</option>
              <option value="position">Position</option>
            </select>
          </div>

          {appliesTo === 'department' && (
            <div className="org-form-field">
              <label>Departments</label>
              <select
                multiple
                value={departmentIds}
                onChange={e => setDepartmentIds(Array.from(e.target.selectedOptions, o => o.value))}
                className="checklist-multi-select"
              >
                {departments.filter(d => d.status === 'active').map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {appliesTo === 'position' && (
            <div className="org-form-field">
              <label>Positions</label>
              <select
                multiple
                value={positionIds}
                onChange={e => setPositionIds(Array.from(e.target.selectedOptions, o => o.value))}
                className="checklist-multi-select"
              >
                {positions.filter(p => p.status === 'active').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
```
Destructure `departments, positions` from `useOrganizationStore()` at the top of the component.

- [ ] **Step 3: `ChecklistTemplatesPage.tsx` — add "Applies To" column**

Add a helper near the top of the file (or in `checklistTemplateUtils.ts` — prefer utils so it's testable/reusable; add to `checklistTemplateUtils.ts`):
```ts
export function appliesToSummary(
  template: ChecklistTemplate,
  departments: { id: string; name: string }[],
  positions: { id: string; name: string }[]
): string {
  if (template.appliesTo === 'company') return 'Full Company';
  if (template.appliesTo === 'department') {
    const names = template.departmentIds.map(id => departments.find(d => d.id === id)?.name).filter(Boolean) as string[];
    return names.length ? names.join(', ') : 'Department (none selected)';
  }
  const names = template.positionIds.map(id => positions.find(p => p.id === id)?.name).filter(Boolean) as string[];
  return names.length ? names.join(', ') : 'Position (none selected)';
}
```
In `ChecklistTemplatesPage.tsx`, import `appliesToSummary`, destructure `departments` from `useOrganizationStore()` (alongside `positions, employees`), add a `<th>Applies To</th>` column header between "Type" and "Item count", and a corresponding `<td>{appliesToSummary(t, departments, orgContext.positions.length ? departments : departments, positions)}</td>` — simplify to:
```tsx
                  <td>{appliesToSummary(t, departments, positions)}</td>
```
placed right after the Type `<td>`.

- [ ] **Step 4: Verify**

Run `npm run build` — should now compile cleanly. Run `npm run dev`, open People → Checklist Templates, click "Add Template", choose "Onboarding", confirm: Applies To selector appears, switching to Department/Position reveals multi-selects populated from real departments/positions, item editor shows "Due after" (number + hours/days) and "Required document" fields with no Role option. Save a template and confirm the table shows the new "Applies To" column.

- [ ] **Step 5: Commit**
```bash
git add src/features/people/checklist-templates/
git commit -m "feat(checklist-templates): add applies-to scoping and due-after/required-document fields to editor"
```

---

## Task 4: Checklist task instance store (onboarding/offboarding task generation)

**Files:**
- Create: `src/features/people/checklist-tasks/checklistTaskTypes.ts`
- Create: `src/store/checklistTaskStore.ts`

- [ ] **Step 1: Create `checklistTaskTypes.ts`**

Use the "New: Checklist task instance model" block from the Data Model Reference section.

- [ ] **Step 2: Create `checklistTaskStore.ts`**

```ts
import { create } from 'zustand';
import { useChecklistTemplateStore } from './checklistTemplateStore';
import { useOrganizationStore } from './organizationStore';
import { getEmployeeEmploymentContext } from '../features/people/employees/employeeProfileUtils';
import { getDepartmentHeadEmployee, getReportingManagerForEmployee, getEmployeeById } from '../utils/organizationUtils';
import { employeeFullName } from '../features/people/employees/employeeProfileUtils';
import type { ChecklistTemplate, ChecklistTemplateItem } from '../features/people/checklist-templates/checklistTemplateTypes';
import type { ChecklistTaskInstance } from '../features/people/checklist-tasks/checklistTaskTypes';

const taskId = () => `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface ChecklistTaskState {
  tasks: ChecklistTaskInstance[];
  getTasksForEmployee: (employeeId: string) => ChecklistTaskInstance[];
  generateTasksForEmployee: (
    employeeId: string,
    templateType: 'onboarding' | 'offboarding',
    baseDateISO: string
  ) => void;
  toggleTaskStatus: (id: string) => void;
}

function addOffsetDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function offsetInDays(item: ChecklistTemplateItem): number {
  return item.dueOffsetUnit === 'hours' ? item.dueOffsetValue / 24 : item.dueOffsetValue;
}

/** Finds the best-matching active template for an employee: position scope > department scope > company scope. */
export function findMatchingTemplate(
  employeeId: string,
  templateType: 'onboarding' | 'offboarding'
): ChecklistTemplate | undefined {
  const templates = useChecklistTemplateStore.getState().templates
    .filter(t => t.type === templateType && t.status === 'active');
  const org = useOrganizationStore.getState();
  const ctx = getEmployeeEmploymentContext(employeeId, org.positions, org.departments, org.assignments, org.employees);

  const byPosition = ctx.position
    ? templates.find(t => t.appliesTo === 'position' && t.positionIds.includes(ctx.position!.id))
    : undefined;
  if (byPosition) return byPosition;

  const byDepartment = ctx.position
    ? templates.find(t => t.appliesTo === 'department' && t.departmentIds.includes(ctx.position!.departmentId))
    : undefined;
  if (byDepartment) return byDepartment;

  return templates.find(t => t.appliesTo === 'company');
}

function resolveAssigneeLabel(item: ChecklistTemplateItem, employeeId: string): string {
  const org = useOrganizationStore.getState();
  const { positions, departments, assignments, employees } = org;
  const ctx = getEmployeeEmploymentContext(employeeId, positions, departments, assignments, employees);

  switch (item.assigneeType) {
    case 'Employee':
      return 'Employee';
    case 'Reporting Manager': {
      const result = getReportingManagerForEmployee(employeeId, positions, assignments, employees);
      return result.manager ? employeeFullName(result.manager) : 'Reporting Manager (unresolved)';
    }
    case 'Department Head': {
      if (!ctx.position) return 'Department Head (unresolved)';
      const head = getDepartmentHeadEmployee(ctx.position.departmentId, departments, positions, assignments, employees);
      return head ? employeeFullName(head) : 'Department Head (unresolved)';
    }
    case 'Specific Position': {
      const pos = positions.find(p => p.id === item.assigneePositionId);
      return pos ? pos.name : 'Specific Position';
    }
    case 'Specific Employee': {
      const emp = getEmployeeById(employees, item.assigneeEmployeeId);
      return emp ? employeeFullName(emp) : 'Specific Employee';
    }
    default:
      return '—';
  }
}

export const useChecklistTaskStore = create<ChecklistTaskState>((set, get) => ({
  tasks: [],

  getTasksForEmployee: employeeId => get().tasks.filter(t => t.employeeId === employeeId),

  generateTasksForEmployee: (employeeId, templateType, baseDateISO) => {
    const template = findMatchingTemplate(employeeId, templateType);
    if (!template) return;

    const sign = templateType === 'offboarding' ? -1 : 1;
    const newTasks: ChecklistTaskInstance[] = template.items.map(item => ({
      id: taskId(),
      employeeId,
      templateId: template.id,
      templateType,
      title: item.title,
      description: item.description,
      assigneeLabel: resolveAssigneeLabel(item, employeeId),
      dueDate: addOffsetDays(baseDateISO, sign * offsetInDays(item)),
      required: item.required,
      requiredDocument: item.requiredDocument,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    set({ tasks: [...get().tasks, ...newTasks] });
  },

  toggleTaskStatus: id => {
    set({
      tasks: get().tasks.map(t =>
        t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
      )
    });
  }
}));
```

Check `getDepartmentHeadEmployee`'s exact signature in `src/utils/organizationUtils.ts` (around line 91) before finalizing — adjust the argument order/names in `resolveAssigneeLabel` to match exactly what's defined there (read the function signature with `Read` first).

- [ ] **Step 2: Verify**

Run `npm run build`. This store isn't wired into any UI yet, so it should compile standalone. Fix any signature mismatches against `organizationUtils.ts`.

- [ ] **Step 3: Commit**
```bash
git add src/features/people/checklist-tasks/ src/store/checklistTaskStore.ts
git commit -m "feat(people): add checklist task instance store and template-matching/generation logic"
```

---

## Task 5: Position-suggested-access utility

**Files:**
- Create: `src/features/people/employees/positionAccessUtils.ts`

- [ ] **Step 1: Create the file**

Use the "New: Position → suggested roles" block from the Data Model Reference section verbatim.

- [ ] **Step 2: Verify**

Run `npm run build`. Confirm `MOCK_ROLES` and `AdminRole` are exported from `src/features/admin/adminMockData.ts` (they are — `AdminRole` interface at line ~39, `MOCK_ROLES: AdminRole[]` at line ~170).

- [ ] **Step 3: Commit**
```bash
git add src/features/people/employees/positionAccessUtils.ts
git commit -m "feat(people): add position-to-suggested-roles mapping for onboarding access confirmation"
```

---

## Task 6: Employee type + organizationStore onboarding creation function

**Files:**
- Modify: `src/types/organization.ts`
- Modify: `src/store/organizationStore.ts`

- [ ] **Step 1: Add `roleIds?: string[]` to `Employee`**

In `src/types/organization.ts`, add the field to the `Employee` interface as shown in the Data Model Reference.

- [ ] **Step 2: Add `EmployeeOnboardingValues` type and `completeEmployeeOnboarding` action**

In `src/types/organization.ts`, add:
```ts
export interface EmployeeOnboardingValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employmentType: EmploymentType;
  startDate: string;
  workMode: WorkMode | '';
  positionId: string;
  confirmedRoleIds: string[];
}
```

In `src/store/organizationStore.ts`:
1. Import `EmployeeOnboardingValues` from `../types/organization`.
2. Add to the `OrganizationState` interface:
```ts
  completeEmployeeOnboarding: (
    values: EmployeeOnboardingValues
  ) => { ok: boolean; error?: string; employeeId?: string };
```
3. Implement it (place near `saveEmployee`):
```ts
  completeEmployeeOnboarding: values => {
    if (!values.firstName.trim() || !values.lastName.trim()) {
      return { ok: false, error: 'First and last name are required.' };
    }
    if (!values.email.trim()) return { ok: false, error: 'Email is required.' };
    if (!values.startDate) return { ok: false, error: 'Start date is required.' };
    if (!values.positionId) return { ok: false, error: 'Position is required.' };

    const { employees, positions, assignments } = get();
    const check = canAssignEmployeeToPosition(createId('emp'), values.positionId, positions, assignments);
    // canAssignEmployeeToPosition only checks position capacity/status for a not-yet-existing employee id,
    // so a fresh id is fine here — it cannot already have an assignment to this position.
    if (!check.ok) return { ok: false, error: check.error };

    const employee: Employee = {
      id: createId('emp'),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      status: 'onboarding',
      employmentType: values.employmentType,
      startDate: values.startDate,
      workMode: values.workMode || null,
      roleIds: values.confirmedRoleIds
    };

    const newAssignment: PositionAssignment = {
      id: createId('asgn'),
      employeeId: employee.id,
      positionId: values.positionId,
      effectiveFrom: values.startDate,
      effectiveTo: null,
      status: 'active'
    };

    set({
      employees: [...employees, employee],
      assignments: [...assignments, newAssignment]
    });

    get().showToast('Employee added. Invite sent.');
    return { ok: true, employeeId: employee.id };
  },
```

- [ ] **Step 3: Verify**

Run `npm run build`. `Employee` and `PositionAssignment` types must already be imported in `organizationStore.ts` (they are). `EmployeeOnboardingValues` needs adding to the import list from `../types/organization`.

- [ ] **Step 4: Commit**
```bash
git add src/types/organization.ts src/store/organizationStore.ts
git commit -m "feat(people): add completeEmployeeOnboarding store action for the new-hire wizard"
```

---

## Task 7: Single-employee Add Employee wizard (5 steps)

**Files:**
- Create: `src/features/people/employees/AddEmployeeWizard.tsx`
- Modify: `src/features/people/employees/EmployeesPage.tsx`

This replaces `EmployeeFormPanel` for the **create** flow only. `EmployeeFormPanel` continues to be used for **edit** (via `openEditEmployee`); leave it unchanged.

- [ ] **Step 1: Create `AddEmployeeWizard.tsx`**

Component shape — a full-screen slide-over (`org-slideover-backdrop` / `org-slideover` classes, like `EmployeeFormPanel`) containing a step indicator and 5 step bodies, using local component state (no new store needed — it's a single linear flow):

```tsx
import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { getReportingManagerPreviewForPosition } from '../../../utils/organizationUtils';
import { getSuggestedRolesForPosition } from './positionAccessUtils';
import { MOCK_ROLES } from '../../admin/adminMockData';
import type { EmployeeOnboardingValues, EmploymentType, WorkMode } from '../../../types/organization';
import { WORK_MODE_OPTIONS } from './workModeUtils';

const STEPS = [
  'Identity Basics',
  'Employment Details',
  'Position Assignment',
  'Access Confirmation',
  'Send Invite'
] as const;

interface AddEmployeeWizardProps {
  onClose: () => void;
}

const EMPTY_VALUES = (): EmployeeOnboardingValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employmentType: 'full-time',
  startDate: new Date().toISOString().slice(0, 10),
  workMode: 'onsite',
  positionId: '',
  confirmedRoleIds: []
});

export const AddEmployeeWizard: React.FC<AddEmployeeWizardProps> = ({ onClose }) => {
  const { positions, departments, assignments, employees, completeEmployeeOnboarding } = useOrganizationStore();
  const { generateTasksForEmployee } = useChecklistTaskStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<EmployeeOnboardingValues>(EMPTY_VALUES());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string } | null>(null);

  const activePositions = positions.filter(p => p.status === 'active');

  const positionPreview = useMemo(() => {
    const position = positions.find(p => p.id === values.positionId);
    if (!position) return null;
    const dept = departments.find(d => d.id === position.departmentId);
    const rm = getReportingManagerPreviewForPosition(position, positions, assignments, employees);
    return { departmentName: dept?.name ?? '—', reportingManager: rm.label, positionId: position.id };
  }, [values.positionId, positions, departments, assignments, employees]);

  const suggestedRoles = useMemo(
    () => (values.positionId ? getSuggestedRolesForPosition(values.positionId) : []),
    [values.positionId]
  );

  // Keep confirmedRoleIds defaulted to the suggested set whenever the position changes.
  useMemo(() => {
    setValues(v => ({ ...v, confirmedRoleIds: suggestedRoles.map(r => r.id) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.positionId]);

  const validateStep = (): string | null => {
    switch (stepIndex) {
      case 0:
        if (!values.firstName.trim() || !values.lastName.trim()) return 'First and last name are required.';
        if (!values.email.trim()) return 'Email is required.';
        return null;
      case 1:
        if (!values.startDate) return 'Start date is required.';
        if (!values.workMode) return 'Work mode is required.';
        return null;
      case 2:
        if (!values.positionId) return 'Position is required.';
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    const issue = validateStep();
    if (issue) { setError(issue); return; }
    setError(null);
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex(i => Math.max(i - 1, 0));
  };

  const handleSubmit = () => {
    const result = completeEmployeeOnboarding(values);
    if (!result.ok || !result.employeeId) {
      setError(result.error ?? 'Unable to create employee.');
      return;
    }
    generateTasksForEmployee(result.employeeId, 'onboarding', values.startDate);
    setDone({ email: values.email });
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="org-slideover org-slideover--wide" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Add Employee</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="add-employee-wizard__steps">
          {STEPS.map((label, i) => (
            <div key={label} className={`add-employee-wizard__step${i === stepIndex ? ' add-employee-wizard__step--active' : ''}${i < stepIndex ? ' add-employee-wizard__step--done' : ''}`}>
              <span className="add-employee-wizard__step-index">{i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="org-slideover__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          {done ? (
            <div className="add-employee-wizard__done">
              <h3>Employee created</h3>
              <p>An invite email has been sent to <strong>{done.email}</strong>. The employee status is set to <strong>Onboarding</strong> and onboarding checklist tasks have been generated.</p>
            </div>
          ) : (
            <>
              {stepIndex === 0 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Identity Basics</h3>
                  <div className="org-form-field">
                    <label>First Name</label>
                    <input value={values.firstName} onChange={e => setValues(v => ({ ...v, firstName: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Last Name</label>
                    <input value={values.lastName} onChange={e => setValues(v => ({ ...v, lastName: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Email</label>
                    <input type="email" value={values.email} onChange={e => setValues(v => ({ ...v, email: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Phone</label>
                    <input value={values.phone} onChange={e => setValues(v => ({ ...v, phone: e.target.value }))} placeholder="Optional" />
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Employment Details</h3>
                  <div className="org-form-field">
                    <label>Employment Type</label>
                    <select value={values.employmentType} onChange={e => setValues(v => ({ ...v, employmentType: e.target.value as EmploymentType }))}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="org-form-field">
                    <label>Start Date</label>
                    <input type="date" value={values.startDate} onChange={e => setValues(v => ({ ...v, startDate: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Work Mode</label>
                    <select value={values.workMode} onChange={e => setValues(v => ({ ...v, workMode: e.target.value as WorkMode | '' }))}>
                      <option value="">Select work mode…</option>
                      {WORK_MODE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Position Assignment</h3>
                  <div className="org-form-field">
                    <label>Position</label>
                    <select value={values.positionId} onChange={e => setValues(v => ({ ...v, positionId: e.target.value }))}>
                      <option value="">Select position…</option>
                      {activePositions.map(p => {
                        const dept = departments.find(d => d.id === p.departmentId);
                        return <option key={p.id} value={p.id}>{p.name}{dept ? ` · ${dept.name}` : ''}</option>;
                      })}
                    </select>
                  </div>
                  <div className="org-form-field">
                    <label>Department</label>
                    <input readOnly className="settings-readonly" value={positionPreview?.departmentName ?? '—'} tabIndex={-1} />
                  </div>
                  <div className="org-form-field">
                    <label>Reporting Manager</label>
                    <input readOnly className="settings-readonly" value={positionPreview?.reportingManager ?? '—'} tabIndex={-1} />
                  </div>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Access Confirmation</h3>
                  <p className="emp-form-hint">
                    These roles are suggested based on the selected position. Confirm or adjust before the invite is sent.
                  </p>
                  {MOCK_ROLES.filter(r => r.active).map(role => (
                    <label key={role.id} className="cip-toggle-row">
                      <input
                        type="checkbox"
                        checked={values.confirmedRoleIds.includes(role.id)}
                        onChange={e => setValues(v => ({
                          ...v,
                          confirmedRoleIds: e.target.checked
                            ? [...v.confirmedRoleIds, role.id]
                            : v.confirmedRoleIds.filter(id => id !== role.id)
                        }))}
                      />
                      {role.name}
                      {suggestedRoles.some(r => r.id === role.id) && <span className="cfg-badge cfg-badge--active">Suggested</span>}
                    </label>
                  ))}
                </div>
              )}

              {stepIndex === 4 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Send Invite</h3>
                  <div className="emp-record-grid">
                    <div className="emp-record-field"><span className="emp-record-field__label">Name</span><div className="emp-record-field__value">{values.firstName} {values.lastName}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Email</span><div className="emp-record-field__value">{values.email}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Position</span><div className="emp-record-field__value">{positions.find(p => p.id === values.positionId)?.name ?? '—'}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Department</span><div className="emp-record-field__value">{positionPreview?.departmentName ?? '—'}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Reporting Manager</span><div className="emp-record-field__value">{positionPreview?.reportingManager ?? '—'}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Start Date</span><div className="emp-record-field__value">{values.startDate}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Confirmed Access</span><div className="emp-record-field__value">{values.confirmedRoleIds.map(id => MOCK_ROLES.find(r => r.id === id)?.name).filter(Boolean).join(', ') || '—'}</div></div>
                  </div>
                  <p className="emp-form-hint">
                    Submitting will create the employee with status <strong>Onboarding</strong> and send an invite email to {values.email || 'the address above'}.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="org-slideover__footer">
          {done ? (
            <button type="button" className="org-btn org-btn--primary" onClick={onClose}>Done</button>
          ) : (
            <>
              <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
              {stepIndex > 0 && <button type="button" className="org-btn org-btn--secondary" onClick={goBack}>Back</button>}
              {stepIndex < STEPS.length - 1 && <button type="button" className="org-btn org-btn--primary" onClick={goNext}>Next</button>}
              {stepIndex === STEPS.length - 1 && <button type="button" className="org-btn org-btn--primary" onClick={handleSubmit}>Send Invite</button>}
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
```

Note: `org-slideover--wide` is a new modifier class — add it in Task 9 (CSS) alongside `org-slideover--narrow` (e.g. `max-width: 640px`). `add-employee-wizard__steps`, `add-employee-wizard__step`, `add-employee-wizard__step--active`, `add-employee-wizard__step--done`, `add-employee-wizard__done` are new classes also added in Task 9.

- [ ] **Step 2: Wire into `EmployeesPage.tsx`**

This is folded into Task 8 (EmployeesPage rewrite) since the header/buttons change together. For now, just confirm the component compiles standalone.

- [ ] **Step 3: Verify**

Run `npm run build`. Confirm `getSuggestedRolesForPosition` and `completeEmployeeOnboarding` resolve correctly (Tasks 5 & 6 must be done first).

- [ ] **Step 4: Commit**
```bash
git add src/features/people/employees/AddEmployeeWizard.tsx
git commit -m "feat(people): add 5-step Add Employee onboarding wizard"
```

---

## Task 8: EmployeesPage header, buttons, and profile lifecycle subtitle

**Files:**
- Modify: `src/features/people/employees/EmployeesPage.tsx`
- Modify: `src/features/people/employees/EmployeeProfilePage.tsx` (header actions already match spec — only check subtitle/labels)

- [ ] **Step 1: Update `EmployeesPage.tsx` header and actions**

Replace the subtitle text (line 54):
```tsx
            View and manage employee profiles, employment details, and work mode.
```
with:
```tsx
            View and manage employee profiles, lifecycle actions, and onboarding status.
```

Replace the single "+ Add Employee" button block (lines 57-59) with three actions, and add state for the two new modals:
```tsx
import { Plus, Search, UploadCloud, History } from 'lucide-react';
import { AddEmployeeWizard } from './AddEmployeeWizard';
import { BulkOnboardingModal } from '../bulk-onboarding/BulkOnboardingModal';
import { ImportHistoryModal } from '../bulk-onboarding/ImportHistoryModal';
// ... inside component:
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [bulkOnboardOpen, setBulkOnboardOpen] = useState(false);
  const [importHistoryOpen, setImportHistoryOpen] = useState(false);
```
```tsx
        <div className="cfg-page__actions">
          <button type="button" className="org-btn org-btn--primary" onClick={() => setAddEmployeeOpen(true)}>
            <Plus size={14} /> Add Employee
          </button>
          <button type="button" className="org-btn org-btn--secondary" onClick={() => setBulkOnboardOpen(true)}>
            <UploadCloud size={14} /> Bulk Onboard
          </button>
          <button type="button" className="org-btn org-btn--secondary" onClick={() => setImportHistoryOpen(true)}>
            <History size={14} /> Import History
          </button>
        </div>
```
Check whether `.cfg-page__header` already supports multiple right-side buttons via flex-wrap — if `cfg-page__actions` doesn't exist as a class anywhere (`grep -rn "cfg-page__actions" src/`), add it in Task 9 CSS as `display: flex; gap: 8px; align-items: center;`. If it already exists (likely, since other config pages may have multiple actions), reuse it as-is.

Remove the old `<EmployeeFormPanel onClose={closeEmployeeForm} />` usage if `employeeForm.mode === 'create'` — but `EmployeeFormPanel` is still needed for edit mode triggered from elsewhere (e.g. future edit entry points). Since `openCreateEmployee` is no longer called from this page, replace:
```tsx
      {employeeForm.open && <EmployeeFormPanel onClose={closeEmployeeForm} />}
```
with:
```tsx
      {employeeForm.open && employeeForm.mode === 'edit' && <EmployeeFormPanel onClose={closeEmployeeForm} />}
      {addEmployeeOpen && <AddEmployeeWizard onClose={() => setAddEmployeeOpen(false)} />}
      {bulkOnboardOpen && <BulkOnboardingModal onClose={() => setBulkOnboardOpen(false)} />}
      {importHistoryOpen && <ImportHistoryModal onClose={() => setImportHistoryOpen(false)} />}
```
`openCreateEmployee`/`closeEmployeeForm` from `useOrganizationStore()` destructuring can be trimmed to just `closeEmployeeForm` (and `employeeForm`) since `openCreateEmployee` is no longer called from this page — but leave the store action itself intact (it's harmless and may be used elsewhere; verify with `grep -rn "openCreateEmployee" src/` and only remove the store action if truly unused, otherwise just don't call it here).

- [ ] **Step 2: Confirm `EmployeeProfilePage.tsx` header actions match spec**

The header already has Edit Profile / Promote / Transfer / Start Offboarding buttons (lines 138-151) — this matches the spec exactly. No change needed here. Just re-read the file after Task 10 to confirm the offboarding modal now also generates checklist tasks.

- [ ] **Step 3: Verify**

This task depends on Tasks 7, 11-20 existing (imports of `AddEmployeeWizard`, `BulkOnboardingModal`, `ImportHistoryModal`). Do this task **last**, after all referenced components exist, OR stub `BulkOnboardingModal`/`ImportHistoryModal` with minimal placeholder exports first and replace later. Recommended order: do Task 7 first, then Tasks 11-20 (bulk onboarding), then this task last so all imports resolve on first build.

Run `npm run build`, then `npm run dev`. On `/people/employees`, confirm: header subtitle updated, three buttons render ("Add Employee", "Bulk Onboard", "Import History"), each opens its respective modal/wizard, and the existing search/table still work.

- [ ] **Step 4: Commit**
```bash
git add src/features/people/employees/EmployeesPage.tsx
git commit -m "feat(people): rework Employees page header with Add Employee, Bulk Onboard, Import History actions"
```

---

## Task 9: Shared CSS additions

**Files:**
- Modify: `src/features/people/employees/employees.css`

- [ ] **Step 1: Append new classes**

Append to the end of `employees.css`:
```css
/* Add Employee wizard */
.org-slideover--wide {
  max-width: 640px;
}

.add-employee-wizard__steps {
  display: flex;
  gap: 4px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-wrap: wrap;
}

.add-employee-wizard__step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  padding: 4px 8px;
  border-radius: 6px;
}

.add-employee-wizard__step--active {
  color: var(--text-primary, #111827);
  font-weight: 600;
  background: var(--surface-muted, #f3f4f6);
}

.add-employee-wizard__step--done {
  color: var(--accent, #2563eb);
}

.add-employee-wizard__step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--surface-muted, #f3f4f6);
  font-size: 11px;
}

.add-employee-wizard__done {
  text-align: center;
  padding: 32px 16px;
}

/* Checklist item editor */
.checklist-item-card__inline {
  display: flex;
  gap: 8px;
}

.checklist-item-card__inline input {
  flex: 1;
}

.checklist-multi-select {
  min-height: 96px;
}

/* Employees page actions */
.cfg-page__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
```
Before adding `.cfg-page__actions`, run `grep -rn "cfg-page__actions" src/` — if it's already defined in a shared stylesheet, skip adding it here to avoid duplicate definitions (CSS duplication isn't an error, but prefer the existing one; just confirm its properties are compatible — flex row with gap).

- [ ] **Step 2: Verify**

Run `npm run dev` and visually confirm the Add Employee wizard step indicator renders with reasonable spacing, and the Employees page header buttons sit in a row without overflow at typical desktop widths (1280px+).

- [ ] **Step 3: Commit**
```bash
git add src/features/people/employees/employees.css
git commit -m "style(people): add CSS for add-employee wizard, checklist item editor, and page actions"
```

---

## Task 10: Offboarding modal → generate offboarding checklist tasks

**Files:**
- Modify: `src/features/people/employees/employeeProfileStore.ts`

- [ ] **Step 1: Generate tasks in `startOffboarding`**

Import `useChecklistTaskStore` from `'../../../store/checklistTaskStore'`. In `startOffboarding`, after computing `template` and before/alongside the `set({...})` call, add:
```ts
    if (template) {
      useChecklistTaskStore.getState().generateTasksForEmployee(employeeId, 'offboarding', values.lastWorkingDay);
    }
```
Place this call before the existing `set({...})` so both updates happen, e.g.:
```ts
  startOffboarding: (employeeId, values) => {
    if (!values.lastWorkingDay) return { ok: false, error: 'Last working day is required.' };
    if (!values.templateId) return { ok: false, error: 'Offboarding template is required.' };

    const template = SEED_CHECKLIST_TEMPLATES.find(t => t.id === values.templateId);
    if (template) {
      useChecklistTaskStore.getState().generateTasksForEmployee(employeeId, 'offboarding', values.lastWorkingDay);
    }
    set({
      activity: [ /* unchanged */ ],
      activeModal: null,
      toast: 'Offboarding started.'
    });
    return { ok: true };
  },
```
Note: `generateTasksForEmployee` internally calls `findMatchingTemplate` (Task 4) which re-selects the best-matching **active** template by scope — it does not directly use `values.templateId`. This is intentional per the spec ("system creates task instances from matching offboarding template" based on the employee's position/department scope, not the dropdown selection in this modal). If `findMatchingTemplate` returns nothing for the employee's scope (e.g., no active offboarding template applies), no tasks are generated — this is acceptable since the modal's dropdown is restricted to active offboarding templates already.

- [ ] **Step 2: Verify**

Run `npm run build`. Run `npm run dev`, open an employee profile, click "Start Offboarding", fill in last working day + template, submit. No visible UI changes yet (Task 11 below adds the visible checklist), but confirm no console errors.

- [ ] **Step 3: Commit**
```bash
git add src/features/people/employees/employeeProfileStore.ts
git commit -m "feat(people): generate offboarding checklist tasks when offboarding starts"
```

---

## Task 11: Employee profile — onboarding/offboarding checklist card

**Files:**
- Modify: `src/features/people/employees/ProfileTabPanels.tsx`

This gives visible proof that template-driven task generation (Tasks 4, 6, 10) works, and satisfies "Employees screen ... lifecycle actions, and onboarding status" by surfacing the generated checklist on the profile.

- [ ] **Step 1: Add a `ChecklistCard` to `AboutTab`**

Import `useChecklistTaskStore` from `'../../../store/checklistTaskStore'`. In `AboutTab`, after destructuring employment context, add:
```ts
  const { getTasksForEmployee, toggleTaskStatus } = useChecklistTaskStore();
  const tasks = getTasksForEmployee(employee.id);
```
Add a new card after the "Contact / Bank details" `RecordCard`, only rendered when `tasks.length > 0`:
```tsx
      {tasks.length > 0 && (
        <RecordCard title={tasks[0].templateType === 'onboarding' ? 'Onboarding Checklist' : 'Offboarding Checklist'}>
          <ul className="emp-checklist-list">
            {tasks.map(task => (
              <li key={task.id} className="emp-checklist-item">
                <label className="cip-toggle-row">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTaskStatus(task.id)}
                  />
                  <span className={task.status === 'completed' ? 'emp-checklist-item__title--done' : ''}>{task.title}</span>
                </label>
                <span className="emp-checklist-item__meta">
                  {task.assigneeLabel} · Due {formatProfileDate(task.dueDate)}
                  {task.requiredDocument && ` · Requires: ${task.requiredDocument}`}
                </span>
              </li>
            ))}
          </ul>
        </RecordCard>
      )}
```

- [ ] **Step 2: Add CSS for `.emp-checklist-list` / `.emp-checklist-item` / `.emp-checklist-item__title--done` / `.emp-checklist-item__meta`**

Append to `src/features/people/employees/employees.css`:
```css
.emp-checklist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.emp-checklist-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.emp-checklist-item__title--done {
  text-decoration: line-through;
  color: var(--text-muted, #6b7280);
}

.emp-checklist-item__meta {
  font-size: 11px;
  color: var(--text-muted, #6b7280);
  padding-left: 24px;
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`. After creating an employee via the Add Employee wizard (Task 7/8) with status Onboarding, navigate to their profile — the "Onboarding Checklist" card should list the 5 seeded items with due dates relative to the start date. Toggling a checkbox should mark it complete (strikethrough). After running "Start Offboarding" on an employee, the card should switch to (or add) "Offboarding Checklist".

Note: if an employee has both onboarding and offboarding tasks (re-offboarded after onboarding), the card currently shows only `tasks[0].templateType`'s label but renders all tasks together — acceptable for this design prototype, but if it looks confusing during the visual check, split into two cards filtered by `templateType` instead. Use judgment; either is fine.

- [ ] **Step 4: Commit**
```bash
git add src/features/people/employees/ProfileTabPanels.tsx src/features/people/employees/employees.css
git commit -m "feat(people): show generated onboarding/offboarding checklist on employee profile"
```

---

## Task 12: Bulk onboarding — types and utils

**Files:**
- Create: `src/features/people/bulk-onboarding/bulkOnboardingTypes.ts`
- Create: `src/features/people/bulk-onboarding/bulkOnboardingUtils.ts`

- [ ] **Step 1: Create `bulkOnboardingTypes.ts`**

Use the "New: Bulk onboarding model" block from the Data Model Reference.

- [ ] **Step 2: Create `bulkOnboardingUtils.ts`**

```ts
import type { Department, Employee, Position } from '../../../types/organization';
import { getPositionOccupancy, getReportingManagerPreviewForPosition, getActiveAssignmentsForPosition } from '../../../utils/organizationUtils';
import type { PositionAssignment } from '../../../types/organization';
import type { BulkImportColumnMapping, BulkImportField, BulkImportRow } from './bulkOnboardingTypes';
import { BULK_IMPORT_REQUIRED_COLUMNS } from './bulkOnboardingTypes';

/** Minimal CSV parser: handles quoted fields containing commas, and CRLF/LF line endings. No XLSX support. */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.length > 0);
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { cur += ch; }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cells.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    cells.push(cur);
    return cells.map(c => c.trim());
  };
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

const NORMALIZED_FIELD_LOOKUP: Record<string, BulkImportField> = {
  'employee number': 'Employee Number',
  'employee no': 'Employee Number',
  'emp number': 'Employee Number',
  'first name': 'First Name',
  'last name': 'Last Name',
  'work email': 'Work Email',
  'email': 'Work Email',
  'department': 'Department',
  'position': 'Position',
  'start date': 'Start Date',
  'employment type': 'Employment Type'
};

/** Auto-maps source headers to known target fields by normalized name match. */
export function autoMapColumns(headers: string[]): BulkImportColumnMapping {
  const mapping: BulkImportColumnMapping = {};
  for (const header of headers) {
    const key = header.trim().toLowerCase();
    mapping[header] = NORMALIZED_FIELD_LOOKUP[key] ?? '';
  }
  return mapping;
}

export function getUnmappedRequiredFields(mapping: BulkImportColumnMapping): BulkImportField[] {
  const mapped = new Set(Object.values(mapping));
  return BULK_IMPORT_REQUIRED_COLUMNS.filter(f => !mapped.has(f));
}

/** Builds typed rows from raw CSV rows + header/mapping. */
export function buildImportRows(
  headers: string[],
  rows: string[][],
  mapping: BulkImportColumnMapping
): BulkImportRow[] {
  const fieldIndex: Partial<Record<BulkImportField, number>> = {};
  headers.forEach((h, i) => {
    const field = mapping[h];
    if (field) fieldIndex[field] = i;
  });

  return rows.map((cells, idx) => {
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => { raw[h] = cells[i] ?? ''; });
    const get = (field: BulkImportField) => {
      const i = fieldIndex[field];
      return i === undefined ? '' : (cells[i] ?? '').trim();
    };
    return {
      rowIndex: idx,
      raw,
      employeeNumber: get('Employee Number'),
      firstName: get('First Name'),
      lastName: get('Last Name'),
      workEmail: get('Work Email'),
      departmentName: get('Department'),
      positionName: get('Position'),
      startDate: get('Start Date'),
      employmentType: get('Employment Type'),
      resolvedDepartmentId: null,
      resolvedPositionId: null,
      reportingManagerLabel: null,
      errors: [],
      warnings: [],
      skip: false
    };
  });
}

/**
 * Resolves department/position names to ids, applies hard-error and warning checks.
 * Mutates and returns a new array (does not mutate input rows).
 */
export function validateImportRows(
  rows: BulkImportRow[],
  departments: Department[],
  positions: Position[],
  assignments: PositionAssignment[],
  existingEmployees: Employee[]
): BulkImportRow[] {
  const seenEmails = new Map<string, number>();
  const seenEmpNumbers = new Map<string, number>();
  const existingEmails = new Set(existingEmployees.map(e => e.email.toLowerCase()));

  // Track additional capacity consumed by this batch per position.
  const batchPositionCounts = new Map<string, number>();

  return rows.map(row => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!row.employeeNumber) errors.push('Missing employee number.');
    if (!row.firstName) errors.push('Missing first name.');
    if (!row.lastName) errors.push('Missing last name.');
    if (!row.workEmail) errors.push('Missing work email.');
    if (!row.startDate) errors.push('Missing start date.');
    if (!row.employmentType) errors.push('Missing employment type.');

    const emailKey = row.workEmail.toLowerCase();
    if (emailKey) {
      if (existingEmails.has(emailKey)) errors.push('Duplicate work email (already exists).');
      else if (seenEmails.has(emailKey)) errors.push('Duplicate work email (duplicate in file).');
      seenEmails.set(emailKey, (seenEmails.get(emailKey) ?? 0) + 1);
    }

    const empKey = row.employeeNumber.toLowerCase();
    if (empKey) {
      if (seenEmpNumbers.has(empKey)) errors.push('Duplicate employee number (duplicate in file).');
      seenEmpNumbers.set(empKey, (seenEmpNumbers.get(empKey) ?? 0) + 1);
    }

    const department = departments.find(d => d.name.toLowerCase() === row.departmentName.toLowerCase());
    const resolvedDepartmentId = department?.id ?? null;
    if (row.departmentName && !department) errors.push('Unknown department.');

    const position = positions.find(p => p.name.toLowerCase() === row.positionName.toLowerCase());
    const resolvedPositionId = position?.id ?? null;
    if (row.positionName && !position) errors.push('Unknown position.');

    let reportingManagerLabel: string | null = null;

    if (position) {
      if (department && position.departmentId !== department.id) {
        errors.push('Position does not belong to department.');
      }

      const { count, capacity } = getPositionOccupancy(position.id, position, assignments);
      const consumedByBatch = batchPositionCounts.get(position.id) ?? 0;
      const projected = count + consumedByBatch + 1;
      if (projected > capacity) {
        errors.push('Position capacity exceeded.');
      } else {
        batchPositionCounts.set(position.id, consumedByBatch + 1);
        if (projected / capacity >= 0.8) {
          warnings.push('Position near capacity.');
        }
      }

      if (!position.reportsToPositionId) {
        warnings.push('Root position / no reporting manager.');
      } else {
        const preview = getReportingManagerPreviewForPosition(position, positions, assignments, existingEmployees);
        reportingManagerLabel = preview.label;
        if (preview.warning || preview.label === 'Not resolved') {
          warnings.push('Reporting manager unresolved.');
        }
      }

      if (department) {
        const headAssignments = getActiveAssignmentsForPosition(department.headPositionId ?? '', assignments);
        if (department.headPositionId && headAssignments.length === 0) {
          warnings.push('Parent position vacant.');
        }
      }
    }

    return {
      ...row,
      resolvedDepartmentId,
      resolvedPositionId,
      reportingManagerLabel,
      errors,
      warnings
    };
  });
}

export function summarizeRows(rows: BulkImportRow[]): { valid: number; warning: number; failed: number; skipped: number } {
  let valid = 0, warning = 0, failed = 0, skipped = 0;
  for (const row of rows) {
    if (row.skip) { skipped++; continue; }
    if (row.errors.length > 0) failed++;
    else if (row.warnings.length > 0) warning++;
    else valid++;
  }
  return { valid, warning, failed, skipped };
}

export function downloadErrorReportCsv(fileName: string, rows: BulkImportRow[]): void {
  const failed = rows.filter(r => r.errors.length > 0);
  const header = ['Row', 'Employee Number', 'First Name', 'Last Name', 'Work Email', 'Errors'];
  const lines = [header.join(',')];
  for (const row of failed) {
    lines.push([
      String(row.rowIndex + 1),
      row.employeeNumber,
      row.firstName,
      row.lastName,
      row.workEmail,
      `"${row.errors.join('; ')}"`
    ].join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/\.[^.]+$/, '')}-errors.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

Double-check `getActiveAssignmentsForPosition` and `getPositionOccupancy` exact signatures by reading `src/utils/organizationUtils.ts` lines ~65-100 and ~385-400 before finalizing — adjust argument order if needed (this plan assumes `getActiveAssignmentsForPosition(positionId, assignments)` and `getPositionOccupancy(positionId, position, assignments)` per the earlier read of the file; `getPositionOccupancy` signature was confirmed at line 385-388).

- [ ] **Step 2: Verify**

Run `npm run build`. This module has no UI yet; fix any type errors against `organizationUtils.ts` signatures.

- [ ] **Step 3: Commit**
```bash
git add src/features/people/bulk-onboarding/bulkOnboardingTypes.ts src/features/people/bulk-onboarding/bulkOnboardingUtils.ts
git commit -m "feat(bulk-onboarding): add CSV parsing, column mapping, and row validation utils"
```

---

## Task 13: Bulk onboarding store

**Files:**
- Create: `src/store/bulkOnboardingStore.ts`

- [ ] **Step 1: Create the store**

```ts
import { create } from 'zustand';
import type { BulkImportColumnMapping, BulkImportRow, BulkAccessGroup, ImportRun } from '../features/people/bulk-onboarding/bulkOnboardingTypes';

export type BulkOnboardingStep =
  | 'upload'
  | 'map-columns'
  | 'resolve-organization'
  | 'review-access'
  | 'validate-rows'
  | 'confirm-import'
  | 'send-invitations';

const STEP_ORDER: BulkOnboardingStep[] = [
  'upload',
  'map-columns',
  'resolve-organization',
  'review-access',
  'validate-rows',
  'confirm-import',
  'send-invitations'
];

const runId = () => `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface BulkOnboardingState {
  step: BulkOnboardingStep;
  fileName: string;
  headers: string[];
  rawRows: string[][];
  mapping: BulkImportColumnMapping;
  rows: BulkImportRow[];
  accessGroups: BulkAccessGroup[];
  importRuns: ImportRun[];
  activeRunId: string | null;

  reset: () => void;
  goToStep: (step: BulkOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setUploadedFile: (fileName: string, headers: string[], rawRows: string[][], mapping: BulkImportColumnMapping) => void;
  setMapping: (mapping: BulkImportColumnMapping) => void;
  setRows: (rows: BulkImportRow[]) => void;
  setAccessGroups: (groups: BulkAccessGroup[]) => void;
  toggleRowSkip: (rowIndex: number) => void;
  recordImportRun: (run: ImportRun) => void;
  updateImportRun: (id: string, updates: Partial<ImportRun>) => void;
}

const INITIAL: Pick<BulkOnboardingState, 'step' | 'fileName' | 'headers' | 'rawRows' | 'mapping' | 'rows' | 'accessGroups' | 'activeRunId'> = {
  step: 'upload',
  fileName: '',
  headers: [],
  rawRows: [],
  mapping: {},
  rows: [],
  accessGroups: [],
  activeRunId: null
};

export const useBulkOnboardingStore = create<BulkOnboardingState>((set, get) => ({
  ...INITIAL,
  importRuns: [],

  reset: () => set({ ...INITIAL }),

  goToStep: step => set({ step }),

  nextStep: () => {
    const idx = STEP_ORDER.indexOf(get().step);
    set({ step: STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)] });
  },

  prevStep: () => {
    const idx = STEP_ORDER.indexOf(get().step);
    set({ step: STEP_ORDER[Math.max(idx - 1, 0)] });
  },

  setUploadedFile: (fileName, headers, rawRows, mapping) => set({ fileName, headers, rawRows, mapping }),
  setMapping: mapping => set({ mapping }),
  setRows: rows => set({ rows }),
  setAccessGroups: accessGroups => set({ accessGroups }),

  toggleRowSkip: rowIndex => set({
    rows: get().rows.map(r => r.rowIndex === rowIndex ? { ...r, skip: !r.skip } : r)
  }),

  recordImportRun: run => set({ importRuns: [run, ...get().importRuns], activeRunId: run.id }),

  updateImportRun: (id, updates) => set({
    importRuns: get().importRuns.map(r => r.id === id ? { ...r, ...updates } : r)
  })
}));

export { runId };
```

- [ ] **Step 2: Verify**

Run `npm run build`. No UI references yet.

- [ ] **Step 3: Commit**
```bash
git add src/store/bulkOnboardingStore.ts
git commit -m "feat(bulk-onboarding): add wizard state store with import run history"
```

---

## Task 14: Bulk onboarding wizard shell + Step 1 (Upload File)

**Files:**
- Create: `src/features/people/bulk-onboarding/BulkOnboardingModal.tsx`
- Create: `src/features/people/bulk-onboarding/steps/Step1UploadFile.tsx`
- Create: `src/features/people/bulk-onboarding/bulkOnboarding.css`

- [ ] **Step 1: Create `Step1UploadFile.tsx`**

```tsx
import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { autoMapColumns, parseCsv } from '../bulkOnboardingUtils';
import { BULK_IMPORT_REQUIRED_COLUMNS } from '../bulkOnboardingTypes';

export const Step1UploadFile: React.FC = () => {
  const { setUploadedFile, nextStep } = useBulkOnboardingStore();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      setError('XLSX files are not supported in this preview — please export your sheet as CSV and upload again.');
      return;
    }
    const text = await file.text();
    const { headers, rows } = parseCsv(text);
    if (headers.length === 0) {
      setError('The file appears to be empty.');
      return;
    }
    setError(null);
    setUploadedFile(file.name, headers, rows, autoMapColumns(headers));
    nextStep();
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Upload File</h3>
      <p className="emp-form-hint">Accepts CSV or XLSX. Your file should include the following columns:</p>
      <ul className="bulk-onboard-required-columns">
        {BULK_IMPORT_REQUIRED_COLUMNS.map(c => <li key={c}>{c}</li>)}
      </ul>

      {error && <p className="schedules-cfg-form-error">{error}</p>}

      <div className="bulk-onboard-dropzone" onClick={() => inputRef.current?.click()}>
        <UploadCloud size={28} />
        <p>Click to choose a CSV or XLSX file</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create `BulkOnboardingModal.tsx`**

This is the wizard shell — full-screen modal (reuse `checklist-template-modal-overlay`/`checklist-template-modal` pattern from `ChecklistTemplateFormPanel.tsx` since it's already a large centered modal) with a step header and footer nav. For now it renders only Step 1; later tasks (15-20) add the remaining steps to the `switch`.

```tsx
import React from 'react';
import { X } from 'lucide-react';
import { useBulkOnboardingStore } from '../../../store/bulkOnboardingStore';
import { Step1UploadFile } from './steps/Step1UploadFile';
import { Step2MapColumns } from './steps/Step2MapColumns';
import { Step3ResolveOrganization } from './steps/Step3ResolveOrganization';
import { Step4ReviewAccess } from './steps/Step4ReviewAccess';
import { Step5ValidateRows } from './steps/Step5ValidateRows';
import { Step6ConfirmImport } from './steps/Step6ConfirmImport';
import { Step7SendInvitations } from './steps/Step7SendInvitations';
import './bulkOnboarding.css';

const STEP_LABELS: Record<string, string> = {
  upload: '1. Upload File',
  'map-columns': '2. Map Columns',
  'resolve-organization': '3. Resolve Organization',
  'review-access': '4. Review Access Impact',
  'validate-rows': '5. Validate Rows',
  'confirm-import': '6. Confirm Import',
  'send-invitations': '7. Send Invitations'
};

interface BulkOnboardingModalProps {
  onClose: () => void;
}

export const BulkOnboardingModal: React.FC<BulkOnboardingModalProps> = ({ onClose }) => {
  const { step, reset } = useBulkOnboardingStore();

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="checklist-template-modal-overlay" onClick={handleClose}>
      <div className="checklist-template-modal bulk-onboard-modal" role="dialog" aria-modal="true" aria-label="Bulk Onboard" onClick={e => e.stopPropagation()}>
        <header className="checklist-template-modal__header">
          <h2>Bulk Onboard — {STEP_LABELS[step]}</h2>
          <button type="button" className="org-slideover__close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="checklist-template-modal__body bulk-onboard-modal__body">
          {step === 'upload' && <Step1UploadFile />}
          {step === 'map-columns' && <Step2MapColumns />}
          {step === 'resolve-organization' && <Step3ResolveOrganization />}
          {step === 'review-access' && <Step4ReviewAccess />}
          {step === 'validate-rows' && <Step5ValidateRows />}
          {step === 'confirm-import' && <Step6ConfirmImport />}
          {step === 'send-invitations' && <Step7SendInvitations onDone={handleClose} />}
        </div>
      </div>
    </div>
  );
};
```

Each step component owns its own footer/nav buttons (since validation/next-enabled logic differs per step) — see Tasks 15-20 for each step's footer.

- [ ] **Step 3: Create `bulkOnboarding.css`**

```css
.bulk-onboard-modal {
  width: min(960px, 92vw);
  max-height: 88vh;
}

.bulk-onboard-modal__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bulk-onboard-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bulk-onboard-step__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.bulk-onboard-required-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.bulk-onboard-required-columns li {
  background: var(--surface-muted, #f3f4f6);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
}

.bulk-onboard-dropzone {
  border: 2px dashed var(--border-color, #d1d5db);
  border-radius: 10px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-muted, #6b7280);
}

.bulk-onboard-dropzone:hover {
  border-color: var(--accent, #2563eb);
  color: var(--accent, #2563eb);
}

.bulk-onboard-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.bulk-onboard-summary-card {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.bulk-onboard-summary-card__value {
  font-size: 22px;
  font-weight: 700;
}

.bulk-onboard-summary-card__label {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
}
```

- [ ] **Step 4: Verify**

This won't compile yet because Steps 2-7 don't exist. Proceed directly to Task 15-20, then build once at the end of Task 20.

- [ ] **Step 5: Commit** (deferred to end of Task 20 — see Task 20 Step 4)

---

## Task 15: Bulk onboarding — Step 2 (Map Columns)

**Files:**
- Create: `src/features/people/bulk-onboarding/steps/Step2MapColumns.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { getUnmappedRequiredFields } from '../bulkOnboardingUtils';
import { BULK_IMPORT_REQUIRED_COLUMNS, type BulkImportField } from '../bulkOnboardingTypes';

export const Step2MapColumns: React.FC = () => {
  const { headers, rawRows, mapping, setMapping, nextStep, prevStep } = useBulkOnboardingStore();

  const unmapped = getUnmappedRequiredFields(mapping);

  const sample = (headerIndex: number) => rawRows[0]?.[headerIndex] ?? '';

  return (
    <div className="bulk-onboard-step">
      <h3>Map Columns</h3>
      <p className="emp-form-hint">Known headers are mapped automatically. Map the remaining required fields before continuing.</p>

      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Source column</th>
              <th>Sample value</th>
              <th>Mapped field</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, i) => (
              <tr key={header}>
                <td>{header}</td>
                <td>{sample(i)}</td>
                <td>
                  <select
                    value={mapping[header] ?? ''}
                    onChange={e => setMapping({ ...mapping, [header]: e.target.value as BulkImportField | '' })}
                  >
                    <option value="">— Ignore —</option>
                    {BULK_IMPORT_REQUIRED_COLUMNS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unmapped.length > 0 && (
        <p className="schedules-cfg-form-error">
          Map these required fields before continuing: {unmapped.join(', ')}
        </p>
      )}

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" disabled={unmapped.length > 0} onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify** — deferred to Task 20.
- [ ] **Step 3: Commit** — deferred to Task 20.

---

## Task 16: Bulk onboarding — Step 3 (Resolve Organization)

**Files:**
- Create: `src/features/people/bulk-onboarding/steps/Step3ResolveOrganization.tsx`

- [ ] **Step 1: Create the component**

This step builds typed rows from the mapping and runs validation, showing per-row resolution status. Admin can re-run validation after fixing the source file (re-upload via Step 1) or proceed to skip failed rows.

```tsx
import React, { useEffect } from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { buildImportRows, validateImportRows } from '../bulkOnboardingUtils';

export const Step3ResolveOrganization: React.FC = () => {
  const { headers, rawRows, mapping, rows, setRows, nextStep, prevStep } = useBulkOnboardingStore();
  const { departments, positions, assignments, employees } = useOrganizationStore();

  useEffect(() => {
    const built = buildImportRows(headers, rawRows, mapping);
    const validated = validateImportRows(built, departments, positions, assignments, employees);
    setRows(validated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unresolved = rows.filter(r => r.errors.some(e => e === 'Unknown department.' || e === 'Unknown position.'));

  return (
    <div className="bulk-onboard-step">
      <h3>Resolve Organization</h3>
      <p className="emp-form-hint">Department and Position values from the file are matched against existing records. Unresolved rows show errors below.</p>

      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>Employee</th>
              <th>Department (file)</th>
              <th>Position (file)</th>
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.rowIndex}>
                <td>{row.rowIndex + 1}</td>
                <td>{row.firstName} {row.lastName}</td>
                <td>{row.departmentName || '—'}</td>
                <td>{row.positionName || '—'}</td>
                <td>
                  {row.errors.includes('Unknown department.') && <span className="cfg-badge cfg-badge--inactive">Unknown department</span>}
                  {row.errors.includes('Unknown position.') && <span className="cfg-badge cfg-badge--inactive">Unknown position</span>}
                  {!row.errors.includes('Unknown department.') && !row.errors.includes('Unknown position.') && <span className="cfg-badge cfg-badge--active">Resolved</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unresolved.length > 0 && (
        <p className="schedules-cfg-form-error">
          {unresolved.length} row(s) have an unresolved department or position. Continuing will flag these as failed in Step 5 — you can skip them there or fix and re-upload the file.
        </p>
      )}

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify** — deferred to Task 20.
- [ ] **Step 3: Commit** — deferred to Task 20.

---

## Task 17: Bulk onboarding — Step 4 (Review Access Impact)

**Files:**
- Create: `src/features/people/bulk-onboarding/steps/Step4ReviewAccess.tsx`

- [ ] **Step 1: Create the component**

Groups resolved rows by position, shows suggested roles (Task 5's `getSuggestedRolesForPosition`), and lets the admin confirm per-group before proceeding.

```tsx
import React, { useEffect } from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { getSuggestedRoleIdsForPosition, getSuggestedRolesForPosition } from '../../employees/positionAccessUtils';
import { MOCK_ROLES } from '../../../admin/adminMockData';
import type { BulkAccessGroup } from '../bulkOnboardingTypes';

export const Step4ReviewAccess: React.FC = () => {
  const { rows, accessGroups, setAccessGroups, nextStep, prevStep } = useBulkOnboardingStore();
  const { positions } = useOrganizationStore();

  useEffect(() => {
    const groups = new Map<string, BulkAccessGroup>();
    for (const row of rows) {
      if (!row.resolvedPositionId || row.skip) continue;
      const existing = groups.get(row.resolvedPositionId);
      if (existing) {
        existing.rowIndexes.push(row.rowIndex);
      } else {
        const position = positions.find(p => p.id === row.resolvedPositionId);
        const suggested = getSuggestedRoleIdsForPosition(row.resolvedPositionId);
        groups.set(row.resolvedPositionId, {
          positionId: row.resolvedPositionId,
          positionName: position?.name ?? 'Unknown',
          rowIndexes: [row.rowIndex],
          suggestedRoleIds: suggested,
          confirmedRoleIds: suggested
        });
      }
    }
    setAccessGroups(Array.from(groups.values()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const toggleRole = (positionId: string, roleId: string) => {
    setAccessGroups(accessGroups.map(g => {
      if (g.positionId !== positionId) return g;
      const has = g.confirmedRoleIds.includes(roleId);
      return { ...g, confirmedRoleIds: has ? g.confirmedRoleIds.filter(r => r !== roleId) : [...g.confirmedRoleIds, roleId] };
    }));
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Review Access Impact</h3>
      <p className="emp-form-hint">Rows are grouped by resolved position. Confirm the access each group will receive — nothing is applied until import.</p>

      {accessGroups.length === 0 && <p className="cfg-empty__title">No rows with a resolved position.</p>}

      {accessGroups.map(group => (
        <div key={group.positionId} className="emp-record-card">
          <div className="emp-record-card__head">
            <h2 className="emp-record-card__title">{group.positionName} · {group.rowIndexes.length} employee(s)</h2>
          </div>
          {getSuggestedRolesForPosition(group.positionId).length === 0 && MOCK_ROLES.filter(r => r.active).length === 0 ? (
            <p className="cfg-empty__title">No roles available.</p>
          ) : (
            MOCK_ROLES.filter(r => r.active).map(role => (
              <label key={role.id} className="cip-toggle-row">
                <input
                  type="checkbox"
                  checked={group.confirmedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(group.positionId, role.id)}
                />
                {role.name}
                {group.suggestedRoleIds.includes(role.id) && <span className="cfg-badge cfg-badge--active">Suggested</span>}
              </label>
            ))
          )}
        </div>
      ))}

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify** — deferred to Task 20.
- [ ] **Step 3: Commit** — deferred to Task 20.

---

## Task 18: Bulk onboarding — Step 5 (Validate Rows)

**Files:**
- Create: `src/features/people/bulk-onboarding/steps/Step5ValidateRows.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { summarizeRows } from '../bulkOnboardingUtils';

export const Step5ValidateRows: React.FC = () => {
  const { rows, toggleRowSkip, nextStep, prevStep } = useBulkOnboardingStore();
  const summary = summarizeRows(rows);

  return (
    <div className="bulk-onboard-step">
      <h3>Validate Rows</h3>

      <div className="bulk-onboard-summary-grid">
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.valid}</div>
          <div className="bulk-onboard-summary-card__label">Valid</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.warning}</div>
          <div className="bulk-onboard-summary-card__label">Warnings</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.failed}</div>
          <div className="bulk-onboard-summary-card__label">Failed</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.skipped}</div>
          <div className="bulk-onboard-summary-card__label">Skipped</div>
        </div>
      </div>

      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>Employee</th>
              <th>Errors</th>
              <th>Warnings</th>
              <th>Skip</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.rowIndex} className={row.skip ? 'cfg-table__row--inactive' : ''}>
                <td>{row.rowIndex + 1}</td>
                <td>{row.firstName} {row.lastName}<div className="cfg-table__meta">{row.workEmail}</div></td>
                <td>{row.errors.length > 0 ? row.errors.join('; ') : '—'}</td>
                <td>{row.warnings.length > 0 ? row.warnings.join('; ') : '—'}</td>
                <td>
                  {row.errors.length > 0 && (
                    <label className="cip-toggle-row">
                      <input type="checkbox" checked={row.skip} onChange={() => toggleRowSkip(row.rowIndex)} />
                      Skip
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
```
Note: `.cfg-table__row--inactive` may not exist — if `grep -rn "cfg-table__row--inactive" src/` returns nothing, add a simple `opacity: 0.5;` rule for it in `bulkOnboarding.css`.

- [ ] **Step 2: Verify** — deferred to Task 20.
- [ ] **Step 3: Commit** — deferred to Task 20.

---

## Task 19: Bulk onboarding — Step 6 (Confirm Import)

**Files:**
- Create: `src/features/people/bulk-onboarding/steps/Step6ConfirmImport.tsx`

- [ ] **Step 1: Create the component**

On click of "Import employees": for every row that is not skipped and has no errors (valid or warning-acknowledged), create the employee via `completeEmployeeOnboarding` (Task 6) with `confirmedRoleIds` taken from the matching `accessGroups` entry, generate onboarding tasks (Task 4), and record an `ImportRun` (Task 13) with `inviteStatus: 'not-sent'`, `status: 'imported'`.

```tsx
import React, { useState } from 'react';
import { useBulkOnboardingStore, runId } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { useChecklistTaskStore } from '../../../../store/checklistTaskStore';
import { summarizeRows } from '../bulkOnboardingUtils';
import type { ImportRun } from '../bulkOnboardingTypes';

const CURRENT_USER_NAME = 'You';

export const Step6ConfirmImport: React.FC = () => {
  const { rows, accessGroups, fileName, recordImportRun, nextStep, prevStep } = useBulkOnboardingStore();
  const { completeEmployeeOnboarding } = useOrganizationStore();
  const { generateTasksForEmployee } = useChecklistTaskStore();
  const [importing, setImporting] = useState(false);

  const summary = summarizeRows(rows);
  const importable = rows.filter(r => !r.skip && r.errors.length === 0);

  const handleImport = () => {
    setImporting(true);
    const createdEmployeeIds: string[] = [];
    const failedRows: typeof rows = [];

    for (const row of importable) {
      const group = accessGroups.find(g => g.rowIndexes.includes(row.rowIndex));
      const result = completeEmployeeOnboarding({
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.workEmail,
        phone: '',
        employmentType: (row.employmentType.toLowerCase().replace(' ', '-') as 'full-time' | 'part-time' | 'contract') || 'full-time',
        startDate: row.startDate,
        workMode: 'onsite',
        positionId: row.resolvedPositionId ?? '',
        confirmedRoleIds: group?.confirmedRoleIds ?? []
      });

      if (result.ok && result.employeeId) {
        createdEmployeeIds.push(result.employeeId);
        generateTasksForEmployee(result.employeeId, 'onboarding', row.startDate);
      } else {
        failedRows.push({ ...row, errors: [...row.errors, result.error ?? 'Import failed.'] });
      }
    }

    const run: ImportRun = {
      id: runId(),
      fileName,
      uploadedBy: CURRENT_USER_NAME,
      uploadedAt: new Date().toISOString(),
      totalRows: rows.length,
      importedCount: createdEmployeeIds.length,
      warningCount: summary.warning,
      failedCount: summary.failed + failedRows.length,
      skippedCount: summary.skipped,
      inviteStatus: 'not-sent',
      status: 'imported',
      createdEmployeeIds,
      failedRows
    };
    recordImportRun(run);
    setImporting(false);
    nextStep();
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Confirm Import</h3>
      <p className="emp-form-hint">
        {importable.length} of {rows.length} row(s) will be imported (valid + warning rows not marked Skip).
        Imported employees will be created with status <strong>Onboarding</strong>, position assignments will be created,
        onboarding checklist tasks will be generated, and the confirmed access from Step 4 will be applied.
        Invitations are <strong>not</strong> sent yet.
      </p>

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep} disabled={importing}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={handleImport} disabled={importing || importable.length === 0}>
          {importing ? 'Importing…' : 'Import employees'}
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify** — deferred to Task 20.
- [ ] **Step 3: Commit** — deferred to Task 20.

---

## Task 20: Bulk onboarding — Step 7 (Send Invitations) + Import History

**Files:**
- Create: `src/features/people/bulk-onboarding/steps/Step7SendInvitations.tsx`
- Create: `src/features/people/bulk-onboarding/ImportHistoryModal.tsx`
- Modify: `src/features/people/employees/EmployeesPage.tsx` (finish wiring from Task 8)

- [ ] **Step 1: Create `Step7SendInvitations.tsx`**

```tsx
import React from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { employeeFullName } from '../../employees/employeeProfileUtils';

interface Step7Props {
  onDone: () => void;
}

export const Step7SendInvitations: React.FC<Step7Props> = ({ onDone }) => {
  const { importRuns, activeRunId, updateImportRun } = useBulkOnboardingStore();
  const { employees } = useOrganizationStore();

  const run = importRuns.find(r => r.id === activeRunId);
  if (!run) return null;

  const sample = employees.filter(e => run.createdEmployeeIds.includes(e.id)).slice(0, 5);

  const handleSendInvites = () => {
    updateImportRun(run.id, { inviteStatus: 'sent', status: 'invites-sent' });
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Send Invitations</h3>

      <div className="bulk-onboard-summary-grid">
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{run.importedCount}</div>
          <div className="bulk-onboard-summary-card__label">Imported</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{run.skippedCount}</div>
          <div className="bulk-onboard-summary-card__label">Skipped</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{run.failedCount}</div>
          <div className="bulk-onboard-summary-card__label">Failed</div>
        </div>
      </div>

      <h4>Spot-check sample</h4>
      <ul>
        {sample.map(e => <li key={e.id}>{employeeFullName(e)} · {e.email}</li>)}
      </ul>

      {run.inviteStatus === 'sent' ? (
        <p className="emp-form-hint">Invitations sent to {run.importedCount} employee(s).</p>
      ) : (
        <p className="emp-form-hint">Send invite emails to the {run.importedCount} successfully imported employee(s).</p>
      )}

      <div className="bulk-onboard-step__footer">
        {run.inviteStatus === 'sent' ? (
          <button type="button" className="org-btn org-btn--primary" onClick={onDone}>Done</button>
        ) : (
          <>
            <button type="button" className="org-btn org-btn--secondary" onClick={onDone}>Close</button>
            <button type="button" className="org-btn org-btn--primary" onClick={handleSendInvites}>Send Invitations</button>
          </>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create `ImportHistoryModal.tsx`**

```tsx
import React from 'react';
import { X } from 'lucide-react';
import { useBulkOnboardingStore } from '../../../store/bulkOnboardingStore';
import { downloadErrorReportCsv } from './bulkOnboardingUtils';

interface ImportHistoryModalProps {
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ onClose }) => {
  const { importRuns, goToStep } = useBulkOnboardingStore();

  return (
    <div className="checklist-template-modal-overlay" onClick={onClose}>
      <div className="checklist-template-modal bulk-onboard-modal" role="dialog" aria-modal="true" aria-label="Import History" onClick={e => e.stopPropagation()}>
        <header className="checklist-template-modal__header">
          <h2>Import History</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="checklist-template-modal__body">
          {importRuns.length === 0 ? (
            <p className="cfg-empty__title">No bulk onboarding imports yet.</p>
          ) : (
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Uploaded By</th>
                    <th>Uploaded On</th>
                    <th>Total Rows</th>
                    <th>Imported</th>
                    <th>Warnings</th>
                    <th>Failed</th>
                    <th>Invite Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {importRuns.map(run => (
                    <tr key={run.id}>
                      <td>{run.fileName}</td>
                      <td>{run.uploadedBy}</td>
                      <td>{new Date(run.uploadedAt).toLocaleString()}</td>
                      <td>{run.totalRows}</td>
                      <td>{run.importedCount}</td>
                      <td>{run.warningCount}</td>
                      <td>{run.failedCount}</td>
                      <td><span className={`cfg-badge cfg-badge--${run.inviteStatus === 'sent' ? 'active' : 'inactive'}`}>{run.inviteStatus === 'sent' ? 'Sent' : 'Not sent'}</span></td>
                      <td><span className="cfg-badge cfg-badge--active">{run.status}</span></td>
                      <td>
                        <div className="cfg-row-actions cfg-row-actions--labeled">
                          {run.status !== 'invites-sent' && (
                            <button type="button" className="cfg-action-btn" onClick={() => goToStep('send-invitations')}>
                              Send Invitations
                            </button>
                          )}
                          {run.failedCount > 0 && (
                            <button type="button" className="cfg-action-btn" onClick={() => downloadErrorReportCsv(run.fileName, run.failedRows)}>
                              Download Error Report
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

Note: "View Details" and "Continue Review" actions from the spec are reasonable extensions but require re-opening the full `BulkOnboardingModal` pre-seeded with a past run's rows — given `rows`/`accessGroups` are not persisted per-run (only summary counts + `createdEmployeeIds`/`failedRows` are), wire only **Send Invitations** (works via `activeRunId` + `goToStep`, but note this requires the `BulkOnboardingModal` to also be open — see Step 3 below for how `EmployeesPage` coordinates this) and **Download Error Report** (works standalone from `failedRows`). If reviewers want full View Details/Continue Review, that requires persisting `rows`/`accessGroups` per run — flag as a follow-up rather than half-implementing silent no-op buttons. Do not add placeholder buttons for actions that do nothing.

Revise the actions column to only include the two wired actions:
```tsx
                        <div className="cfg-row-actions cfg-row-actions--labeled">
                          {run.status !== 'invites-sent' && run.importedCount > 0 && (
                            <button type="button" className="cfg-action-btn" onClick={() => { useBulkOnboardingStore.getState().goToStep('send-invitations'); /* see Step 3 */ }}>
                              Send Invitations
                            </button>
                          )}
                          {run.failedCount > 0 && (
                            <button type="button" className="cfg-action-btn" onClick={() => downloadErrorReportCsv(run.fileName, run.failedRows)}>
                              Download Error Report
                            </button>
                          )}
                        </div>
```

- [ ] **Step 3: Wire "Send Invitations" from history into the wizard modal**

In `EmployeesPage.tsx`, when `ImportHistoryModal`'s "Send Invitations" button is clicked for a run, the simplest correct behavior is: close the history modal and open `BulkOnboardingModal`, which will read `step` (already set to `'send-invitations'` via `goToStep`) and `activeRunId` (already set when the run was recorded — but `recordImportRun` sets `activeRunId` to the *new* run; clicking history for an *older* run needs to set `activeRunId` to that run's id too).

Update `ImportHistoryModal`'s button to take an `onReopen` callback prop:
```tsx
interface ImportHistoryModalProps {
  onClose: () => void;
  onReopenForInvites: (runId: string) => void;
}
```
and call `onReopenForInvites(run.id)` instead of the inline `goToStep` call above.

In `EmployeesPage.tsx`:
```tsx
  const { goToStep, importRuns } = useBulkOnboardingStore();
  // ...
  const handleReopenForInvites = (runId: string) => {
    const run = importRuns.find(r => r.id === runId);
    if (!run) return;
    useBulkOnboardingStore.setState({ activeRunId: runId });
    goToStep('send-invitations');
    setImportHistoryOpen(false);
    setBulkOnboardOpen(true);
  };
  // ...
  {importHistoryOpen && <ImportHistoryModal onClose={() => setImportHistoryOpen(false)} onReopenForInvites={handleReopenForInvites} />}
```

- [ ] **Step 4: Final verification of the whole bulk onboarding flow + full Task 8 wiring**

Run `npm run build` — this is the first point all bulk-onboarding files compile together; fix any cross-file type mismatches (especially `BulkImportField`/`EmploymentType` casts in Step 6).

Run `npm run dev`. On `/people/employees`:
1. Click **Bulk Onboard** → Step 1: prepare a small CSV file locally with headers exactly matching `BULK_IMPORT_REQUIRED_COLUMNS` and 2-3 rows referencing real department/position names from `organizationStore` seed data (e.g. department "Backend", position "Software Engineer"). Upload it.
2. Step 2: confirm auto-mapping worked (all required fields mapped); click Next.
3. Step 3: confirm rows show "Resolved" for valid department/position names.
4. Step 4: confirm access groups appear per position with suggested roles checked.
5. Step 5: confirm valid/warning/failed/skipped counts are correct for your test data.
6. Step 6: click "Import employees" — confirm it proceeds to Step 7 without error.
7. Step 7: confirm spot-check sample shows the new employees; click "Send Invitations"; confirm it marks as sent.
8. Close, then open **Import History** — confirm the run appears with correct counts and "Sent" invite status. Open the new employees' profiles and confirm status = Onboarding and the Onboarding Checklist card (Task 11) is populated.
9. Test a row with an unknown department/position name and confirm it's flagged as Failed in Step 5, and that "Download Error Report" produces a CSV.

- [ ] **Step 5: Commit everything from Tasks 14-20**
```bash
git add src/features/people/bulk-onboarding/ src/features/people/employees/EmployeesPage.tsx
git commit -m "feat(bulk-onboarding): implement 7-step bulk onboarding wizard and import history"
```

---

## Final Self-Review Checklist (for the implementer)

After all tasks are complete, walk through the original spec section-by-section and confirm:
- [ ] People sub-sidebar shows only Employees and Checklist Templates (tenant view and employee view) — Task 1
- [ ] Employees page header/subtitle/buttons match spec — Task 8
- [ ] Add Employee = 5-step wizard, no password/SSO/role-direct-assign steps, status → Onboarding, invite sent on submit — Task 7
- [ ] Bulk Onboard = 7 steps exactly as specified, with required-column list, auto-mapping, org resolution with hard errors/warnings, access review grouped by position, validate summary, import (status Onboarding, assignments, tasks, access — no invites), then invitations — Tasks 12-20
- [ ] Import History table + Download Error Report — Task 20
- [ ] Employee Profile lifecycle buttons (Edit Profile / Transfer / Promote / Start Offboarding) — already present, verified in Task 8
- [ ] Checklist Templates: Applies To (Full Company/Department/Position) with scope selector, task builder fields (title, description, assigned-to from the 5 allowed values, due-after value+unit, optional required document), no HR Admin/Finance Admin/Role Group/Specific Role — Tasks 2-3
- [ ] Template-driven task generation on single create, bulk import, and start-offboarding — Tasks 4, 6, 10, 19
- [ ] No "Coming soon" placeholders anywhere in new code
- [ ] `npm run build` passes with zero TypeScript errors
