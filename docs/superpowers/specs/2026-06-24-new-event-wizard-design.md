# New Event Wizard — Design Spec

Date: 2026-06-24
Module: Employee My Calendar (`src/features/employees/components/my-calendar/`)

## Context

The "New Event" button in `my-calendar-tab.tsx` currently has no `onClick` handler. This spec defines the full event-creation flow (title selection, scheduling, conflict detection, type-based publishing rules — direct create / RSVP / manager approval) per the flowchart the user provided, scoped down to a frontend-only prototype with mock/simulated business logic (no backend).

## Scope

- Frontend-only simulation. No API calls. All state lives in `localEvents` in `my-calendar-tab.tsx`, same as existing edit/delete flows.
- Only three creatable event types: **Leave**, **Meeting**, **Company event** (maps to flowchart's Personal/OOO, Meeting/Team/Training, Company/Holiday/Other buckets). `Shift` and `Reminder` remain system/admin-generated types, not creatable from this wizard.
- Conflict detection checks only against `scope: 'my'` events.
- RSVP and manager-approval are decorative simulations (no real notifications, no other users).

## Component Architecture

New component: `NewEventWizard.tsx` (sibling to `EventDetailsModal.tsx`, `CalendarFilterPanel.tsx`), following the existing `AddEmployeeWizard.tsx` pattern (`step` state, `STEPS` array, per-step validation, Back/Next buttons).

```
my-calendar-tab.tsx
 └─ "New Event" button → setNewEventOpen(true)
      └─ <NewEventWizard onClose={...} onCreate={handleCreateEvents} existingEvents={localEvents} />
```

`handleCreateEvents(events: CalendarEvent[])` appends to `localEvents` (parent state), mirroring `handleSaveEvent` / `handleDeleteEvent`.

## Data Model Changes (`employee-calendar.types.ts`)

```ts
export type CalendarEventStatus = 'confirmed' | 'pending' | 'needs-response' | 'rejected'; // + 'rejected'

export interface CalendarEvent {
  // ...existing fields unchanged...
  reminderMinutesBefore?: number; // e.g. 10, 60, 1440
  attendeeRsvp?: Record<string, 'pending' | 'accepted' | 'declined' | 'tentative'>; // meeting only
}
```

- `status: 'pending'` (already exists) is reused to mean "awaiting manager approval" for Company events.
- `status: 'rejected'` is new — manager rejected the request.
- Recurring events are **not** linked by a series ID (YAGNI). Each occurrence is created as an independent `CalendarEvent` with a suffixed id (e.g. `ev-173-1`, `ev-173-2`, ...). Editing/deleting one occurrence only affects that occurrence. Series-wide edit is out of scope.

## Wizard Steps

| Step | Fields |
|---|---|
| 1. Details | Title (required), Event type: Leave / Meeting / Company event (radio, icon + color per existing event-type swatches) |
| 2. Schedule | All-day toggle. Off → Date + Start time + End time (end must be > start). On → Date or date range (multi-day) |
| 3. More info | Location (text), Notes (textarea). Meeting only: Attendees — multi-select from mock employee list (Priya Nair, Arun Kumar, Sara Lee, etc., reused from existing mock data) |
| 4. Reminders & Repeat | Reminder: None / 10 min before / 1 hr before / 1 day before. Recurring toggle → Frequency (Daily/Weekly/Monthly) + occurrence count (default 8, max 12) |
| 5. Review | Read-only summary of all entered fields + "Create Event" button |

Per-step validation: Title required; end time > start time; at least 1 attendee for Meeting; occurrence count between 1–12 when recurring is on.

## Conflict Detection

Triggered when "Create Event" is clicked on the Review step.

- Compare the new event's date(s)/time against existing `scope: 'my'` events of type `shift`, `meeting`, `leave`.
  - All-day event: any existing event on the same date is a conflict.
  - Timed event: overlapping start/end range with an existing timed event is a conflict.
- If conflict(s) found → show a **Conflict Warning** screen listing the clashing event(s) (e.g. "Morning Shift, 9:00 AM – 5:00 PM").
  - **Reschedule** → returns to Step 2 (Schedule) for editing.
  - **Confirm anyway** → proceeds to type-based creation below, ignoring the conflict.
- If no conflict → proceeds directly to type-based creation.
- For recurring events, the conflict check runs against the **first** occurrence only (keeps the flow simple — full per-occurrence conflict checking is out of scope for this prototype).

## Type-Based Creation Rules

Applied once conflict check has passed (or been overridden), to every occurrence if recurring:

- **Leave** → Create directly, `status: 'confirmed'`. Appears immediately in all relevant views.
- **Meeting** → Create with `status: 'confirmed'` and `attendeeRsvp` set to `'pending'` for every selected attendee. `EventDetailsModal` shows attendee RSVP badges (Pending/Accepted/Declined, color-coded) when viewing the event.
- **Company event** → Create with `status: 'pending'`. Rendered with a muted/dashed pill style on the calendar. `EventDetailsModal` shows a "Manager review (demo)" section with **Approve** / **Reject** buttons:
  - Approve → `status: 'confirmed'`, reverts to normal pill style.
  - Reject → `status: 'rejected'`, shown as a red dashed pill; modal displays "Rejected by manager" note.

## Validation & Manual Testing

No backend error handling needed (frontend-only). After implementation, manually verify via dev server:
1. Create a Leave event → appears immediately as confirmed.
2. Create a Meeting with 2+ attendees → RSVP badges show "Pending" in details modal.
3. Create a Company event → shows as pending/dashed; Approve and Reject buttons each produce the correct resulting state.
4. Create an event that overlaps an existing "Morning Shift" → Conflict Warning appears; verify both "Reschedule" and "Confirm anyway" paths.
5. Create a weekly recurring Leave (4 occurrences) → 4 separate confirmed events appear on the correct dates.
