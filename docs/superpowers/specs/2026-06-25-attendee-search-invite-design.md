# Attendee Search & Invite — Design Spec

## Context

The New Event wizard's Attendees field ([NewEventWizard.tsx:195-207](../../../src/features/employees/components/my-calendar/NewEventWizard.tsx#L195-L207)) currently renders a fixed checkbox list backed by `MOCK_ATTENDEES` (3 hardcoded names) in [new-event-wizard.utils.ts](../../../src/features/employees/components/my-calendar/new-event-wizard.utils.ts). It shows for Meeting and Training event types only.

Goal: replace this with a searchable picker — type to find people already in the system, or "invite" an external person by email (Gmail "To" field style), with all selections shown as a single combined chip list.

## 1. Data model

**Directory:** Replace `MOCK_ATTENDEES` (string array) with a richer mock directory local to the calendar feature:

```ts
interface DirectoryPerson {
  id: string;
  name: string;
  role: string;
  avatar: string; // initials, e.g. "PN"
}

export const CALENDAR_DIRECTORY: DirectoryPerson[] = [ /* ~12-15 mock entries */ ];
```

This directory is separate from `employees.data.ts` (which only has 3 real profiles) — purpose-built mock data for attendee search/testing.

**Attendee storage:** `NewEventFormState.attendees` changes from `string[]` to a union type:

```ts
export type AttendeeRef =
  | { kind: 'user'; id: string; name: string; role: string }
  | { kind: 'external'; email: string };
```

`EMPTY_NEW_EVENT_FORM.attendees` defaults to `[]` (same as today, just typed differently).

**Event output:** `buildEventsFromForm` keeps producing `event.attendees: string[]` (display name for `kind: 'user'`, email for `kind: 'external'`) and `event.attendeeRsvp: Record<string, RsvpStatus>` keyed the same way, defaulting every entry to `'pending'` — no change to the `CalendarEvent` type or downstream consumers (EventDetailsModal, etc.).

## 2. New component — `AttendeeSearchField`

New file: `src/features/employees/components/my-calendar/AttendeeSearchField.tsx`.

Props: `selected: AttendeeRef[]`, `onChange: (next: AttendeeRef[]) => void`.

Behavior:
- Text input with a dropdown that opens while typing (and closes on blur/escape/selection).
- Filters `CALENDAR_DIRECTORY` by case-insensitive partial match on `name`, excluding people already in `selected`.
- If the typed text matches a simple email pattern (`/^\S+@\S+\.\S+$/`) and isn't an exact match to a directory member, the dropdown additionally shows an "Invite `<email>`" row at the bottom.
- Clicking a directory row, or the Invite row, or pressing Enter when a row is highlighted, adds that `AttendeeRef` to `selected` via `onChange` and clears the input.
- No dropdown rows (no directory match, no valid email) → dropdown stays empty/hidden; no error shown (silent, same as Gmail's "To" field).

## 3. Chip list (combined)

Rendered by `AttendeeSearchField` itself, directly below the input, reusing the existing `.emc-wizard__attendees` flex-wrap container:
- `kind: 'user'` chip: avatar initials circle + name.
- `kind: 'external'` chip: mail icon + email text.
- Both chip types get a small ✕ button that removes that entry from `selected`.

New CSS additions go in `src/styles/employee-my-calendar.css`, extending the existing `.emc-wizard__attendees` block rather than introducing a parallel style system.

## 4. Validation

- Meeting/Training still require at least one attendee: `form.attendees.length === 0` check in [NewEventWizard.tsx:73-75](../../../src/features/employees/components/my-calendar/NewEventWizard.tsx#L73-L75) is unchanged — only the array's element type changed, not the emptiness check.
- Invalid-looking email text simply produces no "Invite" row — no inline validation error message.

## Out of scope

- No backend/API integration — `CALENDAR_DIRECTORY` stays static mock data.
- No real email-sending for external invites; "inviting" only stores the email on the event.
- No changes to `EmployeeProfile` / `employees.data.ts`.
