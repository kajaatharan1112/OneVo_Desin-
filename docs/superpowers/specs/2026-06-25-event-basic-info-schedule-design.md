# Calendar Module Enhancement — Sub-project 1: Basic Info + Schedule

Date: 2026-06-25
Module: Employee My Calendar (`src/features/employees/components/my-calendar/`)

## Context

A larger enterprise-scheduling enhancement request ("ONEVO Calendar Module Enhancement") was scoped down into independent sub-projects, since it bundled ~8 largely separate pieces (taxonomy, recurrence engine, audience/visibility + directory, collaboration/attachments, business-context linking, approval/notifications, review/draft, details-modal display) that can't be reviewed or implemented as one unit. This is the first sub-project: expanding the **Basic Info** and **Schedule** sections of the New Event form, plus widening conflict detection. Later sub-projects (built the same way — spec → plan → implementation, one at a time) will cover: advanced recurrence rules, audience/visibility + employee directory, collaboration fields/attachments, business-context linking, approval/notifications, review & submit, and Event Details Modal display enhancements.

This sub-project builds on the single-screen form from `docs/superpowers/specs/2026-06-25-new-event-single-screen-design.md` — it does **not** reintroduce step-gated navigation. The form is becoming a single scrollable page with a jump-nav sidebar (click a section name to scroll to it, nothing is gated), preserving the "don't make users lose context" fix from that earlier spec while accommodating more sections as later sub-projects land.

## Scope

In scope:
- Expand creatable event types from 3 to 6: Leave, Meeting, Company Event, Training, Out Of Office, Holiday (admin-created/overridden public holiday — this prototype has no login/role system in My Calendar, so it's just a plain option in the type list, no real permission gate).
- Add Category (fixed dropdown) and Priority (fixed dropdown) fields to Basic Info.
- Widen conflict detection to include `holiday` alongside `meeting`/`shift`/`leave`.
- Add a jump-nav sidebar to the popup (mechanism only — lists today's 4 sections; later sub-projects add their own section names to this list).
- Update pill rendering, filters, and icons in `my-calendar-tab.tsx`/`CalendarFilterPanel.tsx` for the new types.

Out of scope (deferred to later sub-projects):
- Advanced recurrence (every-X-days, specific weekdays, weekdays-only, end-by-date, never-end) — basic recurrence (None/Daily/Weekly/Monthly + occurrence count) is unchanged from today.
- Audience/Visibility, searchable employee directory, Collaboration fields (agenda/location/attachments), Business Context linking, Approval/Notifications workflow, Review & Submit step, Event Details Modal enhancements.
- Multi-day ranges for timed (non-all-day) events — stays single-day, same as today. All-day multi-day range is unchanged.

## Data Model Changes (`employee-calendar.types.ts`)

```ts
export type CalendarEventType =
  | 'meeting' | 'holiday' | 'leave' | 'shift' | 'reminder'
  | 'training' | 'out-of-office' | 'company-event';

export type CalendarEventCategory =
  | 'hr' | 'project' | 'training' | 'review' | 'client' | 'compliance' | 'management';

export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CalendarEvent {
  // ...existing fields unchanged...
  category?: CalendarEventCategory;
  priority?: CalendarEventPriority;
}
```

The wizard's previous "Company event" option, which used to create `type: 'holiday'`, is replaced by the new dedicated `company-event` type. `holiday` itself becomes directly creatable again from the wizard — a separate option representing an admin-created/overridden public holiday, confirmed immediately with no approval step.

## Wizard Creatable Types (`new-event-wizard.utils.ts`)

`NewEventType` becomes `'leave' | 'meeting' | 'company-event' | 'training' | 'out-of-office' | 'holiday'` (6 values, was 3). `TYPE_META` and `TYPE_OPTIONS` extend accordingly:

| NewEventType | CalendarEventType | source | status on create | attendees |
|---|---|---|---|---|
| `leave` | `leave` | `leave` | `confirmed` | none |
| `out-of-office` | `out-of-office` | `personal` | `confirmed` | none |
| `meeting` | `meeting` | `personal` | `confirmed` (+ RSVP per attendee) | required, ≥1 |
| `training` | `training` | `personal` | `confirmed` (+ RSVP per attendee) | required, ≥1 |
| `company-event` | `company-event` | `company` | `pending` (manager approval) | none |
| `holiday` | `holiday` | `company` | `confirmed` | none |

## Section 1 — Basic Info (replaces today's "Title & type" section)

- Title — text input, required
- Event type — radio, 6 options above, required
- Category — dropdown, 7 fixed values (HR / Project / Training / Review / Client / Compliance / Management), optional
- Priority — dropdown, Low / Medium / High / Critical, optional, defaults to Medium

## Section 2 — Schedule (extends today's "Schedule" section)

- All-day toggle (unchanged)
- All-day: Start Date + optional End Date for a multi-day range (unchanged behavior, fields relabeled "Start Date"/"End Date" for clarity)
- Timed (not all-day): Start Date + Start time + End time, single-day only — End Date field is not shown (unchanged behavior)
- Recurrence: None / Daily / Weekly / Monthly + occurrence count, 1–12 (unchanged — advanced recurrence is a later sub-project)

### Conflict Detection (widened)

`findConflicts`'s checked types become `['meeting', 'holiday', 'shift', 'leave']` (added `holiday`; `training`, `out-of-office`, `company-event` are not checked against, matching the original spec's list). Leave conflicts continue to count regardless of status (today's behavior, unchanged — not narrowed to "approved only"). Still warning-only: Reschedule / Confirm anyway, same UX as today.

## Validation (submit-time, extends today's list)

- Title required
- Date required
- End time > start time (timed only)
- **Attendees required for Meeting or Training** (extends today's Meeting-only rule to also cover Training)
- Occurrences between 1 and 12 when recurring

## Layout: Jump-Nav Sidebar

The popup widens further to fit a left sidebar listing section names (Basic Info, Schedule, Details, Reminders & Repeat for now). Clicking a name scrolls the form body to that section's heading — no gating, no forced order, consistent with the single-screen philosophy. This sidebar is a small reusable list now; later sub-projects append their own section names to it as they're built.

## Component Impact

- `src/features/employees/types/employee-calendar.types.ts`: extend `CalendarEventType`; add `CalendarEventCategory`, `CalendarEventPriority`; add `category?`/`priority?` to `CalendarEvent`.
- `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`: extend `NewEventType`, `TYPE_META`; extend `CONFLICT_TYPES` in `findConflicts`; extend `buildEventsFromForm` for Training's RSVP and the new statuses.
- `src/features/employees/components/my-calendar/NewEventWizard.tsx`: Basic Info section gains Category/Priority fields and 6 type options; add jump-nav sidebar; extend `validateForm`.
- `src/features/employees/components/my-calendar/my-calendar-tab.tsx`: `ALL_EVENT_TYPES` and `AGENDA_TYPE_ICON` gain entries for `training` (icon: `GraduationCap`), `out-of-office` (icon: `LogOut`), `company-event` (icon: `Building2`).
- `src/features/employees/components/my-calendar/CalendarFilterPanel.tsx`: add the 3 new types as filterable options.
- `src/styles/employee-my-calendar.css`: pill color variants for `emc-evpill--training`, `emc-evpill--out-of-office`, `emc-evpill--company-event`; sidebar layout styles (`emc-wizard__nav`, two-column wrapper).

## Manual Testing

1. Create a Training event with 2 attendees → confirmed, RSVP badges "pending" show in details modal (reuses existing RSVP display).
2. Create a Training event with 0 attendees → "Select at least one attendee" error (same message now triggers for both Meeting and Training).
3. Create an Out Of Office event → confirmed immediately, no attendee section shown, pill renders with its own color/icon.
4. Create a Company Event → `pending` status, dashed pill (existing pending-status styling), Approve/Reject still works in `EventDetailsModal` (untouched in this sub-project).
5. Set Category to "Compliance" and Priority to "Critical" on any event — no validation error (both optional), values persist on the created event (visible via console/state inspection — display in Event Details Modal is a later sub-project).
6. Create a Holiday event → confirmed immediately, no attendee section, no approval step.
7. Create an event overlapping an existing Holiday in the mock data → Conflict Warning screen now appears (previously holidays weren't checked).
8. Click each sidebar nav item (Basic Info, Schedule, Details, Reminders & Repeat) → form scrolls to that section, no fields lose their entered values.
9. Filter panel shows Training/Out Of Office/Company Event as togglable type filters; toggling them hides/shows matching pills on the calendar.
