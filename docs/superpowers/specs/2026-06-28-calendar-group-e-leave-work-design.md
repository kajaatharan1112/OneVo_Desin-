# Calendar Group E (part 1): Leave & Work → Auto Calendar Events — Design Spec

## Context

This is the third increment toward closing the 100-item Calendar Management Module audit, after Group A (Tentative RSVP, recurring series, drag-conflict recheck) and Group D (Archive/Restore, History/Audit wiring). Group E covers cross-module auto-event creation — calendar events that appear automatically because something happened in a *different* module. Of the original 9-item list (#80–88, #98), research found:

- **Buildable now:** #80 Leave → Auto Create Calendar Event, #86 Workspace Project → Calendar Event, #87 Task Deadline → Calendar Event — all have clear data and (after this spec) clear trigger points.
- **Genuinely blocked, deferred:** #83 Training, #84 Review Cycle, #85 Company Announcement — none of these source modules exist in this codebase at all; building calendar wiring for them means building the entire source module first, a different and much larger project.
- **Partial, also deferred:** #81 Shift → Auto Event (shifts are template-level `WorkSchedule` objects, not discrete per-day entities — "auto-create an event" doesn't map cleanly without inventing a new concept), #82 Attendance - Calendar Visibility (clock-in/out lives in raw `localStorage` + a custom DOM event, no store), #88 Team Availability (a derived, read-only metric computed at view time — there's no stateful "availability changed" moment to hook into), #98 Publish Organization Events (a different kind of feature — an admin publish/approval workflow, not cross-module wiring).

This spec covers **#80, #86, #87 only**. The rest stay explicitly out of scope (§5).

A key finding changed this spec's shape: **there is currently no approve/reject action anywhere in the Leave module's UI.** The "Team Leave" table is hardcoded mock data with status already set; the self-view list only displays status badges. Leave requests can be *submitted* but nothing transitions one from `'pending'` to `'approved'`. This spec therefore includes building a minimal Approve/Reject action as part of "wiring" Leave to the calendar, since there is no approval moment to hook into otherwise.

## Goal

1. Lift `LeaveRequest`s (both "my own" and direct reports') into a new persisted `leaveRequestStore.ts`, unifying the two currently-disconnected datasets (`requests` useState + the hardcoded `TEAM_LEAVE` mock array).
2. Add Approve/Reject buttons to pending rows in the Team Leave view. Approving creates calendar events (one per day in the leave's date range); rejecting does not.
3. Hook `WorkContext`'s `createProject`/`addTask` (`src/features/work/context/work-context.tsx`) so that creating a project or task with a `dueDate` automatically creates a calendar event — no architecture change to the Work module itself, just a few lines calling `calendarStore.addEvents(...)` directly from inside those two existing functions.

No backend, no network calls. No new persistence mechanism beyond the new `leaveRequestStore.ts` (zustand + `persist`, matching `calendarStore.ts`/`historyStore.ts`/`roleStore.ts`).

## 1. `leaveRequestStore.ts`

New file `src/store/leaveRequestStore.ts`, following the established convention:

```ts
interface LeaveRequestState {
  requests: LeaveRequest[];
  addRequest: (request: LeaveRequest) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, rejectionNote?: string) => void;
}
```

Seeded from the union of the existing `SEED_REQUESTS` (from `employee-leave.data.ts`, these are "my own" — `employeeName` left `undefined`) and the existing hardcoded `TEAM_LEAVE` array converted into `LeaveRequest`-shaped objects with `employeeName` set (e.g. `'Alexander Pierce'`, `'Jordan Kim'`).

`LeaveRequest` (in `employee-leave.data.ts`) gains one field:

```ts
export interface LeaveRequest {
  // ...existing fields...
  employeeName?: string; // undefined = the current employee's own request
}
```

`approveRequest`/`rejectRequest` import `useCalendarStore`/`recordHistory` directly (the store-calls-store pattern already established by `roleStore.ts` calling `recordHistory`). Unlike `calendarStore.ts` (which only needs `set`), this store's creator function needs both: `persist((set, get) => ({...}), {...})` — `get()` is used to read the current request before mutating and to re-read it after:

```ts
approveRequest: id => {
  const request = get().requests.find(r => r.id === id);
  if (!request) return;
  set(state => ({
    requests: state.requests.map(r => (r.id === id ? { ...r, status: 'approved' } : r))
  }));
  const dates = enumerateDates(request.startDate, request.endDate); // one date per day, inclusive
  useCalendarStore.getState().addEvents(dates.map((date, i) => ({
    id: `leave-${request.id}-${i}`,
    title: `${request.leaveType} Leave`,
    date,
    type: 'leave',
    status: 'confirmed',
    source: 'leave',
    scope: 'team',
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
    requests: state.requests.map(r => (r.id === id ? { ...r, status: 'rejected', rejectionNote } : r))
  }));
  const request = get().requests.find(r => r.id === id);
  recordHistory({
    category: 'Leave',
    title: 'Leave request rejected',
    description: `${request?.leaveType ?? 'Leave'} request for ${request?.employeeName ?? 'you'} was rejected.`,
    target: request?.employeeName ?? 'My leave'
  });
}
```

(`enumerateDates(start, end)` is a small new helper in the same file — given `'2026-06-25'`/`'2026-06-26'`, returns `['2026-06-25', '2026-06-26']`. For a same-day request, returns a single-element array. This matches how multi-day leave is already modeled in the calendar's seed data — `lv-1`/`lv-2` as two separate all-day rows, not one ranged event.)

Self-requests (`employeeName === undefined`, i.e. your own leave, approved by someone else off-screen) still get `scope: 'team'`/`ownerName: undefined` per the code above — **this is a known simplification**: this app has no concept of "my own leave approved by my manager" appearing on "my" calendar with `scope: 'my'`, because the Team view (where Approve/Reject lives) is conceptually "things I approve for my reports," not "my own requests." If a self-request is ever approved through this UI (it can be, nothing currently prevents it), the resulting event still reads as a team-scoped entry with no owner name shown — acceptable for this demo, not pursued further.

## 2. Team Leave UI — Approve/Reject

`employee-leave.tsx`'s Team view table (`TEAM_LEAVE.map(...)`) is replaced with a render over `leaveRequestStore`'s `requests` filtered to `employeeName !== undefined` (i.e. "not mine"). Each row where `status === 'pending'` gets two buttons:

```tsx
{req.status === 'pending' && (
  <>
    <button type="button" className="era-btn era-btn--ghost" onClick={() => approveRequest(req.id)}>Approve</button>
    <button type="button" className="era-btn era-btn--ghost" onClick={() => rejectRequest(req.id)}>Reject</button>
  </>
)}
```

No rejection-reason input in this pass — `rejectRequest(id)` is called with no note, matching the simplest version of the existing `rejectionNote?: string` field (already optional). The self-view list (`requests.filter(employeeName === undefined)`) renders exactly as today — read-only status badges, no buttons.

## 3. Work module — Project/Task deadline → calendar event

In `work-context.tsx`, `createProject` (after `setProjects(prev => [...prev, newProject]);`):

```ts
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

`addTask` (after the `setTasks(prev => {...})` block, using the returned `task`):

```ts
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
```

**Known simplification:** `ownerName` is set to the raw `leadId`/`assigneeId` (an internal id like `'user-4'`), not a resolved display name — this codebase's Work module doesn't expose a simple id→name lookup at the point these functions run (employee names live in a separate employees data module). Resolving this properly means importing employee lookup data into `work-context.tsx`, which is a larger, separate concern. Acceptable for this spec; flagged honestly rather than silently shipping wrong-looking data — `ownerName` will show as `user-4` rather than a real name until a follow-up resolves it.

No history logging for these two call sites (§ design decision, not an oversight) — every task/project creation would be far too frequent for a meaningful audit trail, unlike the once-per-approval cadence of Leave.

Milestones (`PlannerMilestone`, a separate entity with its own `dueDate`) are not touched — out of scope, see §5.

## 4. Data model — no calendar-side changes needed

`CalendarEvent`, `CalendarEventType`, `CalendarScope` already support everything this spec needs: `type: 'leave'` and `type: 'reminder'` already exist, `scope: 'my' | 'team'` already exists, `ownerName` already exists. No changes to `employee-calendar.types.ts` in this spec.

## 5. Out of scope

- #81 Shift → Auto Event, #82 Attendance - Calendar Visibility, #88 Team Availability → Auto Update — all deferred per the Context section's reasoning (no discrete entity / no store / purely derived).
- #83 Training, #84 Review Cycle, #85 Company Announcement — deferred; source modules don't exist.
- #98 Publish Organization Events — a different feature (admin publish/approval workflow), not cross-module wiring.
- Milestones (`PlannerMilestone`) → calendar event — not part of the original #86/#87 journeys.
- Resolving `leadId`/`assigneeId` to real employee display names for `ownerName` on Work-sourced events (§3's known simplification).
- A rejection-reason input UI for the new Reject button (calls `rejectRequest(id)` with no note).
- Editing or deleting an auto-created event causing any write-back to the source `LeaveRequest`/`WorkTask`/`WorkProject` (e.g. deleting a leave-approval calendar event does not un-approve the leave request) — these are one-way, fire-and-forget creations, consistent with how Group A/D's sync and archive features never write back to external systems either.
- Updating/deleting a `WorkTask`/`WorkProject`'s `dueDate` after creation does not update or remove its already-created calendar event — only the initial creation is wired.

## 6. Verification

No test runner exists in this repo. Verification is `npm run build` for type safety, plus manual/code-level walkthrough via `npm run dev`, consistent with every prior calendar increment.
