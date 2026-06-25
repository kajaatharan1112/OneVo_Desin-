# Per-Event-Type New Event Fields — Design Spec

## Context

The New Event wizard ([NewEventWizard.tsx](../../../src/features/employees/components/my-calendar/NewEventWizard.tsx)) currently shows the same field set for every event type (Title, Category, Priority, Schedule, Location, Notes, Reminder, Recurring), with only the Attendees field conditionally shown for Meeting/Training. The modal's overall size was just fixed to a constant `min-height: 600px` regardless of type ([employee-my-calendar.css:1378-1382](../../../src/styles/employee-my-calendar.css#L1378-L1382)).

Goal: each event type shows only the fields relevant to it — Meeting/Training stay rich (attendees, scheduling, reminders), while Holiday/Leave/Company event become much leaner — without reintroducing the modal-size inconsistency that was just fixed. Blank space below a leaner form is acceptable; the modal box itself must stay the same size for every type.

## 1. Field visibility matrix

| Field | Meeting | Training | Company event | Holiday | Leave |
|---|---|---|---|---|---|
| Title | shown | shown | shown | shown | shown |
| Category / Priority row | shown | shown | hidden | hidden | replaced by Leave Type |
| Leave Type (Annual/Sick/Casual) | — | — | — | — | shown |
| All-day toggle + timed schedule | shown | shown | shown | hidden (forced all-day, date-range only) | hidden (forced all-day, date-range only) |
| Location field | shown, label "Meeting link / Room" | shown, label "Location" | shown, label "Location" | hidden | hidden |
| Notes field | shown, label "Agenda" | shown, label "Notes" | shown, label "Notes" | hidden | shown, label "Reason" |
| Attendees | shown | shown | hidden | hidden | hidden |
| Reminder | shown | shown | hidden | hidden | hidden |
| Recurring | shown | shown | hidden | hidden | hidden |

Existing logic unaffected: attendee validation (`form.type === 'meeting' || form.type === 'training'`) already matches this matrix without changes.

## 2. Data model

**`new-event-wizard.utils.ts`** gains one declarative config table, alongside the existing `TYPE_META`/`TYPE_DEFAULT_DURATION_MINUTES` pattern:

```ts
export interface TypeFieldConfig {
  showCategoryPriority: boolean;
  showLeaveType: boolean;
  allowTimedSchedule: boolean; // false => force allDay, hide the All-day toggle and time inputs
  locationLabel: string | null; // null => hide the location field
  notesLabel: string | null;    // null => hide the notes/reason field
  showAttendees: boolean;
  showReminder: boolean;
  showRecurring: boolean;
}

export const TYPE_FIELD_CONFIG: Record<NewEventType, TypeFieldConfig> = {
  meeting: {
    showCategoryPriority: true, showLeaveType: false, allowTimedSchedule: true,
    locationLabel: 'Meeting link / Room', notesLabel: 'Agenda',
    showAttendees: true, showReminder: true, showRecurring: true,
  },
  training: {
    showCategoryPriority: true, showLeaveType: false, allowTimedSchedule: true,
    locationLabel: 'Location', notesLabel: 'Notes',
    showAttendees: true, showReminder: true, showRecurring: true,
  },
  'company-event': {
    showCategoryPriority: false, showLeaveType: false, allowTimedSchedule: true,
    locationLabel: 'Location', notesLabel: 'Notes',
    showAttendees: false, showReminder: false, showRecurring: false,
  },
  holiday: {
    showCategoryPriority: false, showLeaveType: false, allowTimedSchedule: false,
    locationLabel: null, notesLabel: null,
    showAttendees: false, showReminder: false, showRecurring: false,
  },
  leave: {
    showCategoryPriority: false, showLeaveType: true, allowTimedSchedule: false,
    locationLabel: null, notesLabel: 'Reason',
    showAttendees: false, showReminder: false, showRecurring: false,
  },
};
```

**`NewEventFormState`** gains one field: `leaveType: 'Annual' | 'Sick' | 'Casual'`, defaulting to `'Annual'` in `EMPTY_NEW_EVENT_FORM`. The existing `notes` field is reused (not duplicated) for the "Reason" label on Leave.

**`CalendarEvent`** ([employee-calendar.types.ts](../../../src/features/employees/types/employee-calendar.types.ts)) gains one optional field: `leaveType?: 'Annual' | 'Sick' | 'Casual'`. `buildEventsFromForm` sets it only when `form.type === 'leave'`.

**`EventDetailsModal.tsx`** gets one extra row, shown only when `event.leaveType` is present: `Leave Type: Annual` (or Sick/Casual) — otherwise this stored field would never be visible anywhere.

## 3. Wizard rendering changes

`NewEventWizard.tsx` reads `TYPE_FIELD_CONFIG[form.type]` once per render and:

- **Basic Info section:** the Category/Priority row renders only when `showCategoryPriority`. When `showLeaveType` is true instead, that row renders a single "Leave Type" `<select>` (Annual/Sick/Casual) bound to `form.leaveType`. When neither flag is true (Holiday, Company event), the row is omitted entirely.
- **Schedule section:** when `allowTimedSchedule` is false, the All-day checkbox is hidden, `form.allDay` is forced to `true` (set in the type-radio `onChange`, same place that already calls `getDefaultEndTime`), and only Start date + End date (multi-day range) inputs render — no time inputs ever.
- **Details section:** Location renders only when `locationLabel` is non-null (using that string as its `<span>` label). Notes/Reason renders only when `notesLabel` is non-null (using that string as its label). Attendees renders only when `showAttendees`. **If all three are hidden for a type** (Holiday), the entire Details section — including its header — is omitted.
- **Reminders & Repeat section:** Reminder select renders only when `showReminder`; Recurring checkbox (and its frequency/occurrences sub-fields) renders only when `showRecurring`. **If both are false** (Company event, Holiday, Leave), the entire section is omitted.
- **Left nav (`NAV_SECTIONS`):** filtered at render time to only the sections actually present for the current type, so there's never a nav link that scrolls to nothing.

No changes to the fixed `.emc-wizard` modal size — sections simply render less content, and the surrounding fixed-height box stays constant per the size fix already in place.

## 4. Validation

No changes. The existing attendee-required check already only fires for `meeting`/`training`, which still show Attendees. Leave Type defaults to `'Annual'` so it's never invalid. Reason stays optional, matching the existing Leave page's "Reason (optional)" convention.

## Out of scope

- No changes to the standalone Leave request page (`employee-leave.tsx`) — this is only the calendar's quick "New Event" wizard.
- No new validation rules beyond what exists today.
- No backend persistence changes — `leaveType` is stored the same way other optional `CalendarEvent` fields are (in-memory mock state).
