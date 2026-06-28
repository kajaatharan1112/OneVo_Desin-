# Organization, Roles, Permissions, and Employee Access Integration Plan

## 1. Goal

Build one connected demo flow where:

1. A tenant creates departments.1
2. The tenant creates roles and selects module permissions.
3. The tenant creates positions, links roles and coverage areas to positions, and builds the reporting hierarchy.
4. Employees are assigned to positions.
5. Position roles are inherited by the employee; optional direct employee roles can add or override access.
6. Main menu items, submenus, pages, records, and actions render only when the signed-in employee has the required effective permission and scope.
7. Every sensitive change produces an audit entry and the appropriate demo notification.

This is a frontend demo implementation, but the store actions and adapters must mirror the API contracts below so a real backend can replace the demo repository later.

## 2. Existing State and Gaps

The repository already contains department, position, employee, role, access-grant, approval, notification, and audit UI pieces. They are not yet one connected authorization system.

Current gaps:

- `RolesPermissionsPage` owns its roles in component state, so created roles cannot be used by position or employee flows.
- `MOCK_ROLES`, position templates, access grants, organization records, employee profiles, and capability checks are separate sources of truth.
- `getProfileCapabilities` uses hard-coded profile IDs instead of effective permissions.
- Main and submenu arrays are static and are not filtered by permission.
- `App.tsx` chooses pages without a central route/page authorization guard.
- Selected-department and selected-position record visibility is still unresolved.
- Position-to-role suggestions and position access templates contain overlapping mappings.
- Role user counts are manually incremented instead of derived from active assignments.
- Role delete currently behaves as deactivate only and has no dependency/conflict model.

### 2.1 Current delivery boundary

The permission catalog may contain future delete permissions, but this implementation
does **not** build Department Delete, Position Delete, Manager Delete, a general-purpose
hierarchy validator, or a full conflict-resolution workflow. Those are deferred.

For this phase:

- Department/position delete controls are hidden or disabled.
- If an existing legacy delete entry point is reached, detect dependencies, block the
  deletion, and show a clear toast; do not open a multi-step resolution flow.
- The only supported hierarchy-removal convenience is removing/replacing a reporting
  manager position during an edit: its direct child positions move to that position's
  parent reporting position, the chart refreshes, and a toast lists what moved. If no
  valid parent exists, block the action and show a toast.
- Drag and drop supports changing a position's reporting parent. Only lightweight
  safeguards are required: no self-drop, no dropping onto an inactive position, and no
  obvious descendant cycle. Advanced hierarchy validation and conflict repair remain
  deferred.

## 3. Product Rules

### 3.1 Setup order and first-time guidance

Recommended setup order:

1. Department
2. Role and permissions
3. Position and reporting hierarchy
4. Employee assignment

When organization data is empty:

- Organization opens on Positions with an empty hierarchy state.
- Show a setup checklist linking to Create Department, Create Role, and Create Position.
- The first department form disables Department Manager because no eligible position exists.
- Later department forms allow parent department and department head selection.

### 3.2 Role rules

- `Tenant Owner` is a protected system role: it cannot be edited, deactivated, or deleted.
- Other seeded templates may be cloned or edited according to their `isEditable` flag.
- Custom roles support create, update, soft delete, restore, position assignment, and direct employee assignment.
- Role code and ID are internal and are not shown in normal edit UI.
- User count is derived from unique active employee grants, never manually stored as authoritative data.
- A role can be linked to multiple positions and employees.

### 3.3 Permission resolution

Effective access is calculated for the selected employee as:

`system role grants + active position role grants + active direct employee grants + explicit overrides`

Resolution rules:

1. Deny-by-default when no grant exists.
2. Tenant Owner always receives all tenant permissions and organization scope.
3. Direct employee grants can add permissions.
4. An explicit direct deny overrides inherited allow for the same permission.
5. Expired, pending, inactive, and soft-deleted assignments do not contribute.
6. Action permission and data scope are checked separately.
7. UI hiding is for experience only; API authorization remains mandatory.

Supported scopes:

- `self`: only the employee's own record.
- `none`: permission may allow a non-record action but grants no employee visibility.
- `selected_departments`: selected departments and optionally their descendants.
- `selected_positions`: employees actively assigned to selected positions.
- `reporting_tree`: direct and indirect reports.
- `organization`: every active record in the tenant.

### 3.4 Canonical permission catalog

Use atomic `resource:action` codes. Do not create separate permissions such as
`attendance:view-team` and `attendance:view-department`; the action is
`attendance:view` and its assignment carries `self`, `team`, `department`,
`selected_departments`, or `organization` scope. This keeps roles reusable.

#### Leave

- `leave:policy:view` - view leave policies and types.
- `leave:policy:create` - create leave policy/type.
- `leave:policy:edit` - edit leave policy/type.
- `leave:policy:delete` - soft delete leave policy/type.
- `leave:request:view` - view leave requests within assigned scope.
- `leave:request:create` - submit leave request for self or allowed employee.
- `leave:request:edit` - edit an eligible request.
- `leave:request:cancel` - cancel an eligible request.
- `leave:request:approve` - approve/reject requests within assigned scope.
- `leave:balance:adjust` - adjust employee leave balances.

#### Attendance

- `attendance:view` - view attendance for self/team/department/company by scope.
- `attendance:edit` - correct attendance records within scope.
- `attendance:approve` - approve attendance correction/overtime requests.
- `attendance:export` - export visible attendance.
- `attendance:policy:view` - view schedules, clock-in, and overtime policies.
- `attendance:policy:configure` - configure attendance policies.

#### Monitoring

- `monitoring:view` - see monitoring results permitted by data scope.
- `monitoring:view-settings` - view monitoring settings.
- `monitoring:configure` - configure monitoring and privacy policies.

#### Organization setup

- `roles:view`, `roles:create`, `roles:edit`, `roles:delete`, `roles:assign`.
- `positions:view`, `positions:create`, `positions:edit`, `positions:delete`, `positions:assign`.
- `departments:view`, `departments:create`, `departments:edit`, `departments:delete`.
- `access:approve` - approve sensitive position/permission changes.

`org:view` remains a navigation capability derived when the actor has any
department or position view permission; broad `org:manage` is removed after migration.

#### Calendar and scheduling

- `calendar:view` - view own calendar.
- `calendar:event:create`, `calendar:event:edit`, `calendar:event:delete`.
- `calendar:schedule:view` - view employee schedules within assigned scope.
- `calendar:schedule:create`, `calendar:schedule:edit`, `calendar:schedule:delete`.
- `calendar:meeting:create` - create meetings and invite visible employees.

#### Requests

- `requests:view`, `requests:create`, `requests:edit`, `requests:cancel`.
- `requests:approve` - approve/reject requests within scope.

Leave and attendance request permissions remain resource-specific; this generic
module covers other employee/service requests.

#### Employees

- `employees:view` - view employee profiles within scope.
- `employees:create` - create an employee.
- `employees:profile:edit` - edit allowed profile content.
- `employees:delete` - soft delete/deactivate an employee.
- `employees:onboard`, `employees:offboard`.
- `employees:promote`, `employees:transfer`.
- `employees:position:assign` - assign or end a position assignment.
- `employees:permission:change` - add/remove direct role overrides.

#### Work

- `workspaces:view`, `workspaces:create`, `workspaces:edit`, `workspaces:delete`.
- `projects:view`, `projects:create`, `projects:edit`, `projects:delete`.
- `tasks:view`, `tasks:create`, `tasks:edit`, `tasks:delete`.
- `tasks:request`, `tasks:approve`.
- `milestones:view`, `milestones:create`, `milestones:edit`, `milestones:delete`.
- `goals:view`, `goals:create`, `goals:edit`, `goals:delete`.

#### Billing

- `billing:view` - view billing page, invoices, payment summary, and plan.
- `billing:contact:edit` - edit billing contact name/details.
- `billing:contact:delete` - remove a non-required billing contact.
- `billing:payment-method:edit` - add, replace, or update a card.
- `billing:payment-method:delete` - remove an eligible card.
- `billing:plan:change` - upgrade/downgrade the current plan.
- `billing:plans:configure` - platform/operator-only plan definition editing;
  it is not grantable to normal tenant roles.

#### Supporting modules

- Settings: `settings:view`, `settings:edit`, `settings:audit:view`.
- Automations: `automations:view`, `automations:create`, `automations:edit`, `automations:delete`.

Every permission definition includes `code`, `module`, `group`, `label`,
`description`, `riskLevel`, `allowedScopes`, `dependencies`, and `grantable`.
The role form groups them by module and action group and automatically selects
required dependencies after confirmation.

Legacy codes such as `employees:read`, `employees:write`, `leave:manage`,
`org:manage`, and `roles:manage` must be migrated through a compatibility map
and then removed.

## 4. Data Model

Create a tenant-scoped normalized demo domain.

### Role

```ts
interface Role {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  type: 'system' | 'template' | 'custom';
  status: 'active' | 'inactive' | 'deleted';
  isEditable: boolean;
  isDeletable: boolean;
  permissionCodes: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Role assignment

```ts
interface RoleAssignment {
  id: string;
  tenantId: string;
  roleId: string;
  targetType: 'position' | 'employee';
  targetId: string;
  source: 'position' | 'manual' | 'system';
  effect: 'allow' | 'deny';
  scope: AccessScope;
  departmentIds: string[];
  positionIds: string[];
  includeDescendants: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'active' | 'pending' | 'ended';
}
```

Department, Position, Employee, and PositionAssignment remain in `organizationStore`, but every record receives `tenantId`, timestamps, and soft-delete status. Position role configuration must use `RoleAssignment` instead of a separate static template model.

## 5. Single Source of Truth Architecture

### Stores

- `organizationStore`: departments, positions, employees, position assignments, hierarchy conflicts.
- `roleStore`: roles, permission catalog, role CRUD, role dependency checks.
- `roleAssignmentStore`: position and direct employee role assignments.
- `authorizationStore` or pure selectors: effective permissions, effective scopes, visible record IDs, `can()` and `canAccess()`.
- Existing notification and audit stores: consume domain events from the three write stores.

For the demo, persist normalized Zustand state with versioned `localStorage`
middleware under one tenant key. Persist domain records only; never persist drawers,
search text, selected tabs, derived counts, or computed permission sets. Add a migration
function for every schema version and a `resetDemoData()` action. Repository interfaces
(`RoleRepository`, `OrganizationRepository`, `AccessRepository`) sit above persistence
so local demo storage can later be replaced by HTTP without rewriting screens.

Cross-store writes use one domain service rather than calling stores from UI components.
For example, `onboardEmployee()` validates employee data, creates the employee, creates
the active position assignment, resolves inherited roles, creates approved direct grants,
emits audit/notification events, and returns one success/error result. On failure it must
not leave a partially created employee or orphan role assignment.

Remove role ownership from `RolesPermissionsPage`. Replace static role/template reads with store selectors. Preserve existing stores temporarily through adapters while screens migrate.

### Core selectors

```ts
getEmployeePositionIds(employeeId)
getEmployeeRoleAssignments(employeeId, atDate)
getEffectivePermissionSet(employeeId, atDate)
getEffectiveScopes(employeeId, permissionCode, atDate)
can(employeeId, permissionCode)
canAccessDepartment(employeeId, permissionCode, departmentId)
canAccessPosition(employeeId, permissionCode, positionId)
canAccessEmployee(employeeId, permissionCode, targetEmployeeId)
getVisibleNavigation(employeeId)
```

All pages and menus must use these selectors; screens must not independently infer management access.

## 6. Navigation and Page Rendering

Attach permission metadata to navigation definitions:

```ts
interface NavItem {
  // existing fields
  requiredAny?: string[];
  requiredAll?: string[];
}
```

Rules:

- Organization rail: visible with `org:view`.
- Departments: `org:view`; create/edit/delete actions use their matching action codes.
- Positions: `org:view`; hierarchy is read-only without create/edit/delete.
- Roles & Permissions under Organization: `roles:view`.
- Roles & Permissions under Settings: the same screen and same permission, not a duplicated implementation.
- People/Employees: `employees:view`.
- Settings children are individually filtered.

Add an `AccessBoundary` component for page and action guards. A direct URL without permission renders a compact Access Denied page and never briefly renders protected content. If a selected profile loses access while on a protected page, redirect to the first accessible navigation item.

`shellMode` must be derived from available navigation/capabilities, not hard-coded employee IDs.

## 7. Screens and Journeys

### Journey A: First organization setup

1. Open Organization.
2. Empty Positions page shows hierarchy placeholder and setup checklist.
3. Create first department: name, code, description, status. Manager/head is disabled with helper text.
4. Redirect to Department list after save.
5. Later department create/edit supports parent and eligible unique head position.
6. Table columns: Department, Status, Head Department, Manager/Head Position, Actions.
7. Department delete is out of scope for this phase. Hide/disable the action. A legacy
   delete attempt is blocked with a dependency toast.

### Journey B: Create and manage roles

1. Open Roles & Permissions from Organization or Settings.
2. Table: Role Name, Assigned User Count, Status, Type, Actions.
3. Seed protected Tenant Owner plus editable templates.
4. Create Role drawer: name, description, status, categorized permission checklist, optional positions, optional employees, scope fields.
5. Edit permits every editable field except internal ID/code.
6. Delete shows dependencies. No dependencies permits soft delete; dependencies require reassignment or explicit removal.
7. Create/update/delete/assign actions create audit events and notifications for Tenant Owner and access administrators.

### Journey C: Position and hierarchy

1. Positions provides Org Chart and List tabs.
2. List columns: Position, Status, Department, Reports To, Coverage Area, Assigned User Count, Actions.
3. Org Chart follows the supplied visual direction: clean connecting lines, employee
   avatar (or position placeholder when vacant), employee name, department, and position
   on every node. Department/color accents may distinguish branches but must use existing
   theme tokens and remain readable in light and dark themes.
4. A chart filter popover uses checkboxes to choose optional node fields. Always show the
   primary identity; selectable fields are Employee Name, Department, Position,
   Description, Status, and Email. Checked fields appear immediately on every applicable
   card. Include branch/department, occupied/vacant, and active/inactive filters plus a
   Reset Filters action. Filter choices are UI preferences and may be locally persisted.
5. Nodes support expand/collapse, pan/zoom, fit-to-screen, and drag-and-drop reporting
   changes. During drag, highlight valid drop targets. On success update the reporting
   parent and show a toast containing old and new manager positions.
6. Create/edit opens a wide responsive modal matching the supplied reference and
   the existing configuration design system. Header: title and helper text. Two-column
   body: Name and Description, Status, Role, Department, Reporting Manager. Code is
   generated from name and remains available only in an Advanced section when needed.
7. Coverage is a bordered section with `Based on Position` and `Based on Department`
   mode cards. It contains one required Primary Coverage Area and repeatable Secondary
   Coverage Areas; each row shows avatar/icon, entity name, context, type badge, swap/
   promote action, and remove action. A secondary can be promoted to primary. The old
   primary becomes secondary only after conflict validation. Backup coverage is an
   optional advanced entry using the same row component.
8. Required fields are Name, Status, Role, Department, and Primary Coverage Area.
   Reporting Manager may be empty only for the root position. Role options come live
   from active `roleStore` records. Department and manager options come live from the
   organization store and exclude invalid/inactive/circular selections.
9. Modal footer remains sticky with Cancel and Create/Save Position. Submit runs required
   field validation, the lightweight hierarchy safeguards defined in the delivery
   boundary, and role/coverage input validation. Full conflict resolution is deferred.
10. Actions are hidden unless allowed; read-only users see chart/list only.
11. Position delete and manager delete are not implemented. When a reporting-manager
    position is removed/replaced through the supported edit action, direct children are
    reparented to its parent and a toast summarizes the shifted positions.
12. Sensitive hierarchy/access changes notify the reporting manager, Tenant Owner, and relevant primary coverage owners.

### Journey D: Employee connection

1. Create/edit employee and assign a position.
2. Show inherited role preview before saving.
3. On assignment, derive active position roles; do not copy them into disconnected static employee data.
4. Optional direct role assignment supports temporary dates, scope, reason, allow, and explicit deny.
5. Employee profile shows Effective Access with source badges: System, Position, Direct, Override.
6. Position transfer shows permission additions/removals and conflicts before approval.
7. New employee completion is one connected transaction: profile -> employment data ->
   department/position -> inherited roles -> optional direct role -> effective access ->
   invitation/onboarding status. The finished employee immediately appears in People,
   Position user count, Role user count, reporting hierarchy, and scoped selectors.

### Journey E: Permission-based runtime

1. Switch demo employee profile.
2. Resolve the profile to the organization employee record.
3. Compute active position and direct assignments.
4. Filter main menu and submenus.
5. Guard selected page.
6. Filter records by scope.
7. Hide/disable create, edit, delete, assign, approve actions independently.

## 8. Demo Seed

Use one coherent seed graph:

- Tenant: OneVo Demo Organization.
- Departments: Executive, Engineering, Backend, Frontend, QA, Finance, HR, Operations.
- Positions and employees: reuse current organization seed IDs.
- Roles:
  - Tenant Owner: all permissions, organization scope, assigned to CEO.
  - People Administrator: employee/leave/attendance view and edit, selected HR and Engineering departments.
  - Line Manager: employee/reporting-tree view, leave approval, attendance view.
  - Employee: self-service dashboard, own leave, own attendance, calendar, work.
  - Read Only Auditor: selected view and audit permissions.
- Demo profiles map to real seed employee IDs and receive all capabilities only through role resolution.

Add a Reset Demo Data action for development so every journey can be replayed.

## 9. API Contract

All endpoints are tenant scoped. The server obtains `tenantId` and actor identity from authentication; clients do not authorize themselves.

### Roles

- `GET /api/v1/roles?status=&search=&page=&limit=` returns role rows plus derived assignment/user counts.
- `GET /api/v1/roles/:roleId` returns full role, permissions, position assignments, employee assignments, and dependency summary.
- `POST /api/v1/roles`

```json
{
  "name": "People Administrator",
  "description": "Manages people operations",
  "status": "active",
  "permissionCodes": ["employees:view", "employees:edit", "leave:approve"],
  "assignments": [
    {
      "targetType": "position",
      "targetId": "pos-hr-mgr",
      "effect": "allow",
      "scope": "selected_departments",
      "departmentIds": ["dept-hr"],
      "positionIds": [],
      "includeDescendants": true
    }
  ]
}
```

- `PUT /api/v1/roles/:roleId` accepts name, description, status, permission codes, and assignment reconciliation. ID/code are never editable.
- `GET /api/v1/roles/:roleId/delete-impact` returns protected status, assigned positions, assigned employees, active users, and required resolutions.
- `DELETE /api/v1/roles/:roleId` performs soft delete after conflict resolution/version confirmation.
- `POST /api/v1/roles/:roleId/assignments` assigns to a position or employee.
- `PUT /api/v1/role-assignments/:assignmentId` edits scope, effect, dates, or status.
- `DELETE /api/v1/role-assignments/:assignmentId` ends the assignment.

### Effective access

- `GET /api/v1/employees/:employeeId/effective-access` returns effective permission codes, scopes, role sources, denials, and expiry information.
- `POST /api/v1/access/evaluate` accepts permission plus optional resource context and returns allow/deny with reason. This is useful for diagnostics; protected business APIs still evaluate internally.

### Organization

- `GET/POST/PUT/DELETE /api/v1/departments`
- `GET /api/v1/departments/:id/delete-impact`
- `GET/POST/PUT/DELETE /api/v1/positions`
- `GET /api/v1/positions/:id/change-impact` for parent/department/coverage/delete conflicts.
- `POST /api/v1/position-assignments`
- `PUT /api/v1/position-assignments/:id`
- `DELETE /api/v1/position-assignments/:id` ends assignment rather than removing history.

### Response and concurrency rules

- Writes return updated entity, derived counts, emitted notification IDs, and audit ID.
- Use `version` or `updatedAt` for optimistic concurrency; stale writes return `409 CONFLICT`.
- Unauthorized action returns `403`; inaccessible resource may return `404` to avoid disclosure.
- Validation returns field-keyed `422` errors.
- Soft-deleted resources are excluded by default.

## 10. Domain Events, Notifications, and Audit

Emit domain events after successful writes:

- `role.created`, `role.updated`, `role.deleted`
- `role.assignment.created`, `role.assignment.ended`
- `department.created`, `department.updated`, `department.deleted`
- `position.created`, `position.updated`, `position.deleted`, `position.moved`
- `employee.position.changed`, `employee.access.changed`

Each audit record stores actor, tenant, target, before/after summary, reason, timestamp, and result. Notifications are derived from events and deduplicated per recipient.

## 11. Implementation Sequence

### Phase 1: Normalize domain and seed

- Add canonical permission catalog and compatibility map.
- Create role and role-assignment stores/repositories.
- Consolidate seeded roles, position templates, profile mapping, and organization seed.
- Add deterministic reset/demo bootstrap.

### Phase 2: Authorization engine

- Implement assignment resolution, explicit deny precedence, dates, status, and scopes.
- Complete department/position/reporting-tree employee visibility.
- Add selector unit tests for Tenant Owner, manager, HR, ordinary employee, direct override, expiry, and deny.

### Phase 3: Navigation and route protection

- Add permission metadata to nav config.
- Filter rail and subnav for the selected employee.
- Replace hard-coded profile capabilities.
- Add page/action boundaries and safe redirects.

### Phase 4: Role screens

- Move Roles page from component state to role stores.
- Add status, protected Tenant Owner, categorized permissions, position/employee assignments, conflict-aware soft delete, accurate counts, notifications, and audit.
- Route the same page from both Organization and Settings.

### Phase 5: Organization screens

- Add first-time setup empty states.
- Complete department manager/head create and edit rules; defer delete workflows.
- Replace static position role templates with role assignments.
- Add coverage entries, the rich filterable org chart, and drag/drop reporting changes.
- Add the limited reporting-manager removal reparent-and-toast behavior.
- Explicitly defer general hierarchy validation and conflict-resolution screens.

### Phase 6: Employee integration

- Show inherited access preview during create/edit/transfer.
- Add direct role and override management.
- Add Effective Access panel and source labels.
- Connect approval workflow for sensitive changes.

### Phase 7: API adapter boundary and QA

- Put stores behind repository interfaces with demo implementations matching API shapes.
- Add loading/error/optimistic-concurrency states.
- Run build, lint, selector tests, screen journeys, direct URL checks, and profile-switch regression tests.

## 12. Acceptance Criteria

- Creating a role immediately makes it selectable on positions and employees.
- Assigning a role to a position immediately changes effective permissions for employees in that position.
- Direct employee assignment can add access; explicit deny can remove an inherited action.
- Profile switching immediately updates rail, submenu, page access, record visibility, and action buttons.
- A hidden page cannot be accessed by typing its URL.
- Users with `org:view` but no edit permissions can see chart/list without mutation controls.
- Department and position delete controls are not offered in this phase; legacy attempts
  are blocked with a dependency toast. Role delete continues according to the Roles scope.
- Org Chart cards show avatar, employee name, department, and position, and checkbox
  filters can add Description, Status, and Email across visible cards.
- Dragging a position to a valid new reporting parent updates the chart/store and shows
  an old-to-new reporting toast.
- Removing/replacing a supported reporting-manager position shifts direct children to
  the next valid parent and reports the shift in a toast.
- Tenant Owner remains protected.
- Counts are derived and remain correct after create/edit/transfer/delete.
- Every sensitive mutation creates one audit event and the expected recipient notifications.
- Demo reset restores a deterministic fully connected organization.
- Refreshing the browser preserves demo roles, assignments, employees, and organization
  changes through versioned local storage; Reset Demo Data restores the seed safely.
- Completing Add Employee updates employee, position, role, hierarchy, and effective
  access views without refresh and without duplicate/orphan assignments.
- `npm run build` and `npm run lint` pass after each implementation phase.

## 13. Recommended First Implementation Slice

Implement the smallest end-to-end vertical slice first:

1. Canonical `roleStore` and `roleAssignmentStore`.
2. Seed Tenant Owner, Line Manager, and Employee roles.
3. Link them to CEO, Manager, and Software Engineer positions.
4. Resolve effective permissions for the three existing demo profiles.
5. Filter Organization and Roles menus.
6. Guard Roles page and its Create/Edit/Delete actions.
7. Persist Role create/edit/assign in the demo stores.

This proves the complete chain `role -> position/employee -> effective permission -> menu/page/action rendering` before expanding every organization conflict and API state.
