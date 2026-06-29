# Calendar Group E (part 1): Leave & Work Auto-Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Leave approvals and Work project/task deadlines automatically create calendar events, including building the minimal Approve/Reject action that the Leave module currently lacks entirely, plus logging a "task completed" calendar event when a task's status flips to `'done'`.

**Architecture:** A new persisted `leaveRequestStore.ts` unifies "my own" and "team" leave requests (currently two disconnected datasets) and calls `calendarStore.addEvents`/`recordHistory` directly from its own actions, mirroring how `roleStore.ts` already calls `recordHistory`. The Work module (`work-context.tsx`) keeps its existing React Context architecture — `createProject`/`addTask` just gain a few lines calling `calendarStore.addEvents` directly.

**Tech Stack:** React 19, TypeScript, zustand 5 (`persist` middleware, already established). No test runner in this repo.

## Global Constraints

- No backend, no network calls.
- The self-view leave list (your own requests) stays read-only — no Approve/Reject buttons there. Only Team view rows (`employeeName !== undefined`) get Approve/Reject.
- Rejecting a leave request never creates a calendar event. Only approving does.
- Leave approve/reject logs to `recordHistory` with `category: 'Leave'` (not `'Calendar'`) — this matches an entry already present in `historyStore.ts`'s seed data (`"Leave request approved"`).
- Work's `createProject`/`addTask` do NOT log to `recordHistory` at all — every task/project creation would be too frequent for a meaningful audit trail (deliberate asymmetry with Leave, not an oversight).
- Work-sourced calendar events use `type: 'reminder'` (already labeled "Deadline/Form" in the calendar UI — no new type needed). Leave-sourced events use `type: 'leave'` (already exists).
- `ownerName` on Work-sourced events will show a raw id (e.g. `'user-4'`), not a resolved display name — known simplification, not a bug to fix in this plan.
- A "task completed" calendar event fires only on the transition INTO `'done'` (i.e. the task's previous status was not already `'done'`) — re-saving an already-done task must never create a duplicate completion event. The completion event's date is the real wall-clock date at the moment of completion (`new Date()`), not the task's `dueDate` — these can differ (early/late completion) and that's intentional.
- Editing/deleting an auto-created calendar event never writes back to the source `LeaveRequest`/`WorkTask`/`WorkProject`. Updating a task/project's `dueDate` after creation never updates/removes its already-created event. One-way, fire-and-forget creation only.
- No test runner exists in this repo (no Jest/Vitest, no `test` script in `package.json`). Verification per task is `npm run build` for type safety plus a manual/code-level walkthrough via `npm run dev`.

---

## File Structure

- Modify: `src/features/employees/data/employee-leave.data.ts` — add `employeeName?: string` to `LeaveRequest`.
- Create: `src/store/leaveRequestStore.ts` — persisted zustand store unifying own + team leave requests, with `approveRequest`/`rejectRequest` calling into `calendarStore`/`historyStore`.
- Modify: `src/features/employees/pages/employee-leave/employee-leave.tsx` — read/write through the store; Approve/Reject buttons in Team view.
- Modify: `src/features/work/context/work-context.tsx` — `createProject`/`addTask` call `calendarStore.addEvents` when a `dueDate` is set; `updateTask` calls it again when a task's status transitions into `'done'`.

---

### Task 1: Data model — `employeeName` on `LeaveRequest`

**Files:**
- Modify: `src/features/employees/data/employee-leave.data.ts`

**Interfaces:**
- Produces: `LeaveRequest.employeeName?: string` — Task 2's store and Task 3's UI both read/write this exact field name. `undefined` means "the current employee's own request."

- [ ] **Step 1: Add the field**

In `employee-leave.data.ts`, add `employeeName` right after `attachmentName?: string;` in the `LeaveRequest` interface:

```ts
export interface LeaveRequest {
  id: string;
  leaveType: LeaveTypeKey;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveRequestStatus;
  submittedDate: string;
  reason?: string;
  approver?: string;
  rejectionNote?: string;
  attachmentName?: string;
  employeeName?: string;
}
```

- [ ] **Step 2: Verify**

Run: `npm run build` — expect no new TypeScript errors (additive, optional field; the existing `leaveRequests` seed array needs no changes since the field is optional).

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/data/employee-leave.data.ts
git commit -m "feat(leave): add employeeName field to LeaveRequest"
```

---

### Task 2: `leaveRequestStore.ts`

**Files:**
- Create: `src/store/leaveRequestStore.ts`

**Interfaces:**
- Consumes: `LeaveRequest`, `leaveRequests` (the seed array) from `../features/employees/data/employee-leave.data`; `useCalendarStore` from `./calendarStore`; `recordHistory` from `./historyStore`.
- Produces: `useLeaveRequestStore` hook with `requests: LeaveRequest[]`, `addRequest(request: LeaveRequest): void`, `approveRequest(id: string): void`, `rejectRequest(id: string, rejectionNote?: string): void` — Task 3 calls all four by exact name.

- [ ] **Step 1: Write the store**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { leaveRequests as SEED_OWN_REQUESTS, type LeaveRequest } from '../features/employees/data/employee-leave.data';
import { useCalendarStore } from './calendarStore';
import { recordHistory } from './historyStore';

const SEED_TEAM_REQUESTS: LeaveRequest[] = [
  {
    id: 'tl-1',
    leaveType: 'Annual',
    startDate: '2026-06-20',
    endDate: '2026-06-23',
    days: 4,
    status: 'approved',
    submittedDate: '2026-06-10',
    employeeName: 'Alexander Pierce'
  },
  {
    id: 'tl-2',
    leaveType: 'Sick',
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    days: 1,
    status: 'pending',
    submittedDate: '2026-06-15',
    employeeName: 'Jordan Kim'
  }
];

function toIsoDate(input: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function enumerateDates(start: string, end: string): string[] {
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(end);
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  const dates: string[] = [];
  while (cursor <= endDate) {
    dates.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

interface LeaveRequestState {
  requests: LeaveRequest[];
  addRequest: (request: LeaveRequest) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, rejectionNote?: string) => void;
}

export const useLeaveRequestStore = create<LeaveRequestState>()(
  persist(
    (set, get) => ({
      requests: [...SEED_OWN_REQUESTS, ...SEED_TEAM_REQUESTS],

      addRequest: request => set(state => ({ requests: [request, ...state.requests] })),

      approveRequest: id => {
        const request = get().requests.find(r => r.id === id);
        if (!request) return;
        set(state => ({
          requests: state.requests.map(r => (r.id === id ? { ...r, status: 'approved' as const } : r))
        }));
        const dates = enumerateDates(request.startDate, request.endDate);
        useCalendarStore.getState().addEvents(dates.map((date, i) => ({
          id: `leave-${request.id}-${i}`,
          title: `${request.leaveType} Leave`,
          date,
          type: 'leave' as const,
          status: 'confirmed' as const,
          source: 'leave' as const,
          scope: 'team' as const,
          ownerName: request.employeeName,
          allDay: true
        })));
        recordHistory({
          category: 'Leave',
          title: 'Leave request approved',
          description: `${request.leaveType} leave for ${request.employeeName ?? 'you'} was approved.`,
          target: request.employeeName ?? 'My leave'
        });
      },

      rejectRequest: (id, rejectionNote) => {
        set(state => ({
          requests: state.requests.map(r => (r.id === id ? { ...r, status: 'rejected' as const, rejectionNote } : r))
        }));
        const request = get().requests.find(r => r.id === id);
        recordHistory({
          category: 'Leave',
          title: 'Leave request rejected',
          description: `${request?.leaveType ?? 'Leave'} request for ${request?.employeeName ?? 'you'} was rejected.`,
          target: request?.employeeName ?? 'My leave'
        });
      }
    }),
    { name: 'onevo-leave-request-store', version: 1 }
  )
);
```

(`get()` in `rejectRequest` reads the request *after* the `set()` call — this is intentional: it reads the just-updated record so the history description could reflect post-update fields if ever needed, and it's the simplest way to read the request's `leaveType`/`employeeName` without restructuring the function. Functionally equivalent to reading before `set()`, since neither field changes during a rejection.)

- [ ] **Step 2: Verify**

Run: `npm run build` — expect no new TypeScript errors. This file isn't imported anywhere yet (Task 3 wires it up), so this only checks the file itself compiles, including its use of `CalendarEvent`'s `type`/`status`/`source`/`scope` literal unions (the `as const` assertions are required for these to satisfy `CalendarEvent`'s exact union types rather than widening to `string`).

- [ ] **Step 3: Commit**

```bash
git add src/store/leaveRequestStore.ts
git commit -m "feat(leave): add persisted leaveRequestStore with approve/reject"
```

---

### Task 3: Wire `employee-leave.tsx` to the store + Approve/Reject UI

**Files:**
- Modify: `src/features/employees/pages/employee-leave/employee-leave.tsx`

**Interfaces:**
- Consumes: `useLeaveRequestStore` and its 4 fields/actions (Task 2).
- Produces: nothing consumed by later tasks — leaf task for the Leave track.

- [ ] **Step 1: Update imports**

Replace this import line (currently near the top of the file):

```tsx
import {
  leaveRequests as SEED_REQUESTS,
  leaveHistory,
  upcomingLeaves,
  leaveCompanyHolidays,
  leavePolicyNotes,
  type LeaveRequest,
  type LeaveTypeKey
} from '../../data/employee-leave.data';
```

with:

```tsx
import {
  leaveHistory,
  upcomingLeaves,
  leaveCompanyHolidays,
  leavePolicyNotes,
  type LeaveRequest,
  type LeaveTypeKey
} from '../../data/employee-leave.data';
import { useLeaveRequestStore } from '../../../../store/leaveRequestStore';
```

(`leaveRequests as SEED_REQUESTS` is removed — the new store seeds itself directly from `employee-leave.data.ts`, this file no longer needs the raw seed array.)

- [ ] **Step 2: Remove the now-unused `TeamLeaveEntry`/`TEAM_LEAVE` mock**

Delete this block entirely (currently right after the imports):

```tsx
/* ─── Team leave mock (manager view) ─── */
interface TeamLeaveEntry {
  id: string; name: string; initials: string;
  leaveType: string; startDate: string; endDate: string;
  days: number; status: 'pending' | 'approved' | 'rejected';
}
const TEAM_LEAVE: TeamLeaveEntry[] = [
  { id: 'tl-1', name: 'Alexander Pierce', initials: 'AP', leaveType: 'Annual', startDate: 'Jun 20', endDate: 'Jun 23', days: 4, status: 'approved' },
  { id: 'tl-2', name: 'Jordan Kim',       initials: 'JK', leaveType: 'Sick',   startDate: 'Jun 18', endDate: 'Jun 18', days: 1, status: 'pending'  },
];
```

(This data now lives as `SEED_TEAM_REQUESTS` inside `leaveRequestStore.ts`, Task 2.)

- [ ] **Step 3: Replace the `requests` state with store selectors**

Replace:

```tsx
  const [modalOpen, setModalOpen]     = useState(false);
  const [requests, setRequests]       = useState<LeaveRequest[]>(SEED_REQUESTS);
  const [form, setForm]               = useState<LeaveFormState>(DEFAULT_FORM);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
```

with:

```tsx
  const [modalOpen, setModalOpen]     = useState(false);
  const allRequests = useLeaveRequestStore(s => s.requests);
  const addRequest = useLeaveRequestStore(s => s.addRequest);
  const approveRequest = useLeaveRequestStore(s => s.approveRequest);
  const rejectRequest = useLeaveRequestStore(s => s.rejectRequest);
  const [form, setForm]               = useState<LeaveFormState>(DEFAULT_FORM);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  const myRequests = allRequests.filter(r => r.employeeName === undefined);
  const teamRequests = allRequests.filter(r => r.employeeName !== undefined);

  const filtered = myRequests.filter(r => filter === 'all' || r.status === filter);
```

- [ ] **Step 4: Update `counts` to use `myRequests`**

Replace:

```tsx
  const counts: Record<StatusFilter, number> = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };
```

with:

```tsx
  const counts: Record<StatusFilter, number> = {
    all:      myRequests.length,
    pending:  myRequests.filter(r => r.status === 'pending').length,
    approved: myRequests.filter(r => r.status === 'approved').length,
    rejected: myRequests.filter(r => r.status === 'rejected').length
  };
```

- [ ] **Step 5: Update `handleSubmit` to call `addRequest`**

Replace:

```tsx
    setRequests(prev => [newReq, ...prev]);
```

(inside `handleSubmit`, right after building `newReq`) with:

```tsx
    addRequest(newReq);
```

- [ ] **Step 6: Replace the Team view table with store-backed rows + Approve/Reject**

Replace the entire Team view block:

```tsx
        ) : (
          <div className="elp-team-dashboard">
            <div className="elp-team-summary">
              <div className="era-panel elp-team-summary__item"><span>Away today</span><strong>1</strong></div>
              <div className="era-panel elp-team-summary__item"><span>Upcoming</span><strong>2</strong></div>
              <div className="era-panel elp-team-summary__item">
                <span>Pending requests</span>
                <strong>{TEAM_LEAVE.filter(item => item.status === 'pending').length}</strong>
              </div>
            </div>
          <div className="elp-history-panel era-panel">
            <div className="elp-section-head">
              <span className="elp-section-title">
                <Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                Team Leave
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>Direct reports</span>
            </div>
            <table className="elp-history-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_LEAVE.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'var(--accent)', color: '#fff',
                          fontSize: '0.65rem', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>{entry.initials}</span>
                        {entry.name}
                      </span>
                    </td>
                    <td>{entry.leaveType}</td>
                    <td>{entry.startDate === entry.endDate ? entry.startDate : `${entry.startDate} – ${entry.endDate}`}</td>
                    <td>{entry.days}d</td>
                    <td>
                      <span className={`era-status-badge era-status-badge--${entry.status}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
```

with:

```tsx
        ) : (
          <div className="elp-team-dashboard">
            <div className="elp-team-summary">
              <div className="era-panel elp-team-summary__item"><span>Away today</span><strong>1</strong></div>
              <div className="era-panel elp-team-summary__item"><span>Upcoming</span><strong>2</strong></div>
              <div className="era-panel elp-team-summary__item">
                <span>Pending requests</span>
                <strong>{teamRequests.filter(r => r.status === 'pending').length}</strong>
              </div>
            </div>
          <div className="elp-history-panel era-panel">
            <div className="elp-section-head">
              <span className="elp-section-title">
                <Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                Team Leave
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>Direct reports</span>
            </div>
            <table className="elp-history-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'var(--accent)', color: '#fff',
                          fontSize: '0.65rem', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>{(req.employeeName ?? '??').split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
                        {req.employeeName}
                      </span>
                    </td>
                    <td>{req.leaveType}</td>
                    <td>{req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`}</td>
                    <td>{req.days}d</td>
                    <td>
                      <span className={`era-status-badge era-status-badge--${req.status}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {req.status === 'pending' && (
                        <span style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          <button type="button" className="era-btn era-btn--ghost" onClick={() => approveRequest(req.id)}>
                            Approve
                          </button>
                          <button type="button" className="era-btn era-btn--ghost" onClick={() => rejectRequest(req.id)}>
                            Reject
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
```

(The avatar initials are now derived from `employeeName` via `.split(' ').map(p => p[0])` instead of a separate hardcoded `initials` field — `TeamLeaveEntry` no longer exists, and `LeaveRequest` never had a dedicated initials field.)

- [ ] **Step 7: Verify**

Run: `npm run build` — expect no new TypeScript errors (and confirm `SEED_REQUESTS`/`TEAM_LEAVE`/`TeamLeaveEntry` no longer appear anywhere in the file — grep to confirm, since this repo's `noUnusedLocals` setting will fail the build on any leftover unused identifier).

Run: `npm run dev`. Open Time Off → Team view. Confirm the "Jordan Kim" row (status `pending`) shows Approve/Reject buttons, and "Alexander Pierce" (status `approved`) does not. Click Approve on Jordan Kim's row — confirm the row's status badge flips to "Approved" and the buttons disappear. Switch to My Calendar (Week or Agenda view, June 18, 2026) — confirm a new "Sick Leave" all-day event appears for that date. Open it in the details modal and confirm it's read as a team-scoped leave entry. Go back to Time Off → Self view, submit a new leave request via "Apply Leave" — confirm it appears in the self-view list as before (unaffected by this change) and does NOT appear in the Team view table.

- [ ] **Step 8: Commit**

```bash
git add src/features/employees/pages/employee-leave/employee-leave.tsx
git commit -m "feat(leave): wire Team Leave view to leaveRequestStore with Approve/Reject"
```

---

### Task 4: Work module — Project/Task deadline → calendar event

**Files:**
- Modify: `src/features/work/context/work-context.tsx`

**Interfaces:**
- Consumes: `useCalendarStore` (already exists, from Group A — `src/store/calendarStore.ts`).
- Produces: nothing consumed by later tasks — leaf task, independent of Tasks 1-3.

- [ ] **Step 1: Import `useCalendarStore`**

Add near the top of `work-context.tsx`, alongside the other imports:

```tsx
import { useCalendarStore } from '../../../store/calendarStore';
```

(Path check: `work-context.tsx` lives at `src/features/work/context/`, three directories below `src/`, so `../../../store/calendarStore` resolves to `src/store/calendarStore`.)

- [ ] **Step 2: Hook `createProject`**

Find this line inside `createProject` (right after the project/tasks/milestones state updates):

```tsx
    setProjects(prev => [...prev, newProject]);
    if (defaultTasks.length > 0) {
      setTasks(prev => [...prev, ...defaultTasks]);
    }
    if (defaultMilestones.length > 0) {
      setMilestones(prev => [...prev, ...defaultMilestones]);
    }
```

Add right after it (still inside `createProject`, before the `if (input.visibility === 'private' ...)` block):

```tsx
    if (newProject.dueDate) {
      useCalendarStore.getState().addEvents([{
        id: `project-due-${newProject.id}`,
        title: `${newProject.name} due`,
        date: newProject.dueDate,
        type: 'reminder',
        status: 'confirmed',
        source: 'personal',
        scope: newProject.leadId === CURRENT_USER_ID ? 'my' : 'team',
        ownerName: newProject.leadId === CURRENT_USER_ID ? undefined : newProject.leadId,
        allDay: true
      }]);
    }
```

- [ ] **Step 3: Hook `addTask`**

Find `addTask`'s return statement:

```tsx
  const addTask = useCallback((input: AddTaskInput) => {
    const project = projects.find(p => p.id === input.projectId);
    if (!project) return undefined;
    const projectTasks = tasks.filter(t => t.projectId === input.projectId);
    const key = nextTaskKey(project.key, projectTasks);
    const task: WorkTask = {
      id: `task-${Date.now()}`,
      key,
      title: input.title,
      description: input.description ?? '',
      projectId: input.projectId,
      projectName: project.name,
      projectKey: project.key,
      workspaceIds: project.workspaceIds,
      linkedWorkspaceId: input.linkedWorkspaceId ?? null,
      assigneeId: input.assigneeId,
      status: input.status,
      dueDate: input.dueDate ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      priority: input.priority,
      labels: input.labels ?? [],
      customFieldValues: input.customFieldValues ?? {},
    };
    setTasks(prev => {
      const next = [...prev, task];
      setProjects(ps => ps.map(p => {
        if (p.id !== input.projectId) return p;
        const open = countOpenTasks(next.filter(t => t.projectId === p.id));
        return { ...p, openTasks: open };
      }));
      return next;
    });
    return task;
  }, [projects, tasks]);
```

Replace the final two lines (`return task;` and the closing of the callback) so the hook fires before returning:

```tsx
  const addTask = useCallback((input: AddTaskInput) => {
    const project = projects.find(p => p.id === input.projectId);
    if (!project) return undefined;
    const projectTasks = tasks.filter(t => t.projectId === input.projectId);
    const key = nextTaskKey(project.key, projectTasks);
    const task: WorkTask = {
      id: `task-${Date.now()}`,
      key,
      title: input.title,
      description: input.description ?? '',
      projectId: input.projectId,
      projectName: project.name,
      projectKey: project.key,
      workspaceIds: project.workspaceIds,
      linkedWorkspaceId: input.linkedWorkspaceId ?? null,
      assigneeId: input.assigneeId,
      status: input.status,
      dueDate: input.dueDate ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      priority: input.priority,
      labels: input.labels ?? [],
      customFieldValues: input.customFieldValues ?? {},
    };
    setTasks(prev => {
      const next = [...prev, task];
      setProjects(ps => ps.map(p => {
        if (p.id !== input.projectId) return p;
        const open = countOpenTasks(next.filter(t => t.projectId === p.id));
        return { ...p, openTasks: open };
      }));
      return next;
    });
    if (task.dueDate) {
      useCalendarStore.getState().addEvents([{
        id: `task-due-${task.id}`,
        title: `${task.title} due`,
        date: task.dueDate,
        type: 'reminder',
        status: 'confirmed',
        source: 'personal',
        scope: task.assigneeId === CURRENT_USER_ID ? 'my' : 'team',
        ownerName: task.assigneeId === CURRENT_USER_ID ? undefined : task.assigneeId,
        allDay: true
      }]);
    }
    return task;
  }, [projects, tasks]);
```

- [ ] **Step 4: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Open the Work module, create a new project with a due date and `leadId` set to the current user (the default lead when creating as yourself) — confirm a "reminder"-type event titled "`<project name>` due" appears on the calendar on that date, scoped `'my'`. Create a task with a due date and yourself as assignee — confirm a similar event appears for the task. Create a task assigned to someone else with a due date — confirm the event appears with `scope: 'team'` and `ownerName` showing the assignee's raw id (expected, per the known simplification).

- [ ] **Step 5: Commit**

```bash
git add src/features/work/context/work-context.tsx
git commit -m "feat(work): auto-create calendar events for project/task due dates"
```

---

### Task 5: Task completion → calendar event

**Files:**
- Modify: `src/features/work/context/work-context.tsx`

**Interfaces:**
- Consumes: `useCalendarStore` (Task 4's import, already in this file).
- Produces: nothing consumed by later tasks — leaf task, independent of Tasks 1-4 except sharing the same file/import as Task 4.

- [ ] **Step 1: Read the previous task and detect the done-transition in `updateTask`**

Replace `updateTask` (as it stands after Task 4 — Task 4 does not touch this function, so it is unchanged from the plan's File Structure baseline):

```tsx
  const updateTask = useCallback((id: string, patch: Partial<WorkTask>) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t));
      const projectId = prev.find(t => t.id === id)?.projectId;
      if (projectId) {
        setProjects(ps => ps.map(p => {
          if (p.id !== projectId) return p;
          return { ...p, openTasks: countOpenTasks(next.filter(t => t.projectId === p.id)) };
        }));
      }
      return next;
    });
  }, []);
```

with:

```tsx
  const updateTask = useCallback((id: string, patch: Partial<WorkTask>) => {
    const prevTask = tasks.find(t => t.id === id);
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t));
      const projectId = prev.find(t => t.id === id)?.projectId;
      if (projectId) {
        setProjects(ps => ps.map(p => {
          if (p.id !== projectId) return p;
          return { ...p, openTasks: countOpenTasks(next.filter(t => t.projectId === p.id)) };
        }));
      }
      return next;
    });
    if (patch.status === 'done' && prevTask && prevTask.status !== 'done') {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      useCalendarStore.getState().addEvents([{
        id: `task-done-${id}-${Date.now()}`,
        title: `${prevTask.title} completed`,
        date: dateKey,
        type: 'reminder',
        status: 'confirmed',
        source: 'personal',
        scope: prevTask.assigneeId === CURRENT_USER_ID ? 'my' : 'team',
        ownerName: prevTask.assigneeId === CURRENT_USER_ID ? undefined : prevTask.assigneeId,
        allDay: true,
        note: prevTask.totalWorkedHours ? `Logged ${prevTask.totalWorkedHours}h` : undefined
      }]);
    }
  }, [tasks]);
```

(The dependency array changes from `[]` to `[tasks]` — necessary because the function now reads `tasks.find(...)` directly in its body, not only inside the `setTasks` updater. This means `updateTask`'s identity changes when `tasks` changes; this is already accounted for since `updateTask` is already listed in the `value` `useMemo`'s dependency array further down the file — no other change needed there.)

- [ ] **Step 2: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Open a task that has logged some time via clock-in/out (`WorkItemDetailDrawer.tsx`'s existing clock-in feature — clock in, wait a few seconds, clock out to populate `totalWorkedHours`), then mark its status `'done'`. Confirm a new "reminder"-type calendar event titled "`<task title>` completed" appears on today's real date, with a note showing the logged hours. Mark an already-done task's status to `'done'` again (e.g. via any other field edit that happens to re-send `status: 'done'`) — confirm no duplicate completion event is created.

- [ ] **Step 3: Commit**

```bash
git add src/features/work/context/work-context.tsx
git commit -m "feat(work): log a calendar event when a task is marked done"
```

---

## Self-Review Notes

- Spec §1 (`leaveRequestStore.ts`) → Task 2. §2 (Team Leave UI) → Task 3. §3 (Work module wiring) → Task 4. §4 (no calendar-type-system changes needed) → confirmed, no task touches `employee-calendar.types.ts`. §5 (out of scope: Shift/Attendance/Availability/Training/Review/Announcements/Publish, milestones, ownerName resolution, rejection-reason input, write-back) → none of these appear in any task. §6 (verification convention) → reflected in Global Constraints and every task's verify step.
- Task 5 (task-completion → calendar event) was added after the spec was written, per a follow-up request mid-conversation — it reuses Task 4's `useCalendarStore` import and the same `'reminder'`/scope-by-assignee conventions, so it doesn't introduce a new pattern.
- One implementation detail resolved beyond the spec's pseudocode, not a scope change: the spec's `enumerateDates` example assumed ISO-formatted dates, but the actual `leaveRequests` seed data in `employee-leave.data.ts` uses human-readable strings (`'Jun 15, 2026'`), while the Apply Leave form (and the Work module's `dueDate`s) already produce/use ISO `YYYY-MM-DD`. Task 2's `toIsoDate`/`enumerateDates` handle both formats safely using local-time date arithmetic (matching the same local-time convention `my-calendar-tab.tsx`'s `parseLocalDate`/`toDateKey` already use), avoiding a UTC-vs-local off-by-one bug that naively mixing `new Date(isoString)` (parsed as UTC) and `new Date(humanString)` (parsed as local) would cause.
- Type/name consistency check: `employeeName`, `addRequest`, `approveRequest`, `rejectRequest`, `myRequests`, `teamRequests` are spelled identically everywhere they appear across Tasks 1–3.
