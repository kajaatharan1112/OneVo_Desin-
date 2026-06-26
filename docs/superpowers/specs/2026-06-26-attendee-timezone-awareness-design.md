# Attendee Timezone Awareness — Design Spec

## Context

Today, nothing in the calendar module is timezone-aware. `CalendarEvent.start`/`end` are plain `"HH:MM"` strings with no zone tag, `DirectoryPerson` ([new-event-wizard.utils.ts](../../../src/features/employees/components/my-calendar/new-event-wizard.utils.ts)) has no location data, and `EmployeeProfile` ([employee.types.ts](../../../src/features/employees/types/employee.types.ts)) has no country/timezone. A company-level `timezone` field exists in `GeneralSettings` ([settingsMockData.ts](../../../src/features/settings/settingsMockData.ts)) but is not wired to anything.

Goal: when scheduling a meeting with attendees in different countries, the organizer (the logged-in employee) sees each attendee's *local* time for that meeting, both while creating the event and when viewing its details afterward.

## 1. Data model

**`DirectoryPerson`** gains two fields:

```ts
export interface DirectoryPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
  country: string;
  timezone: string; // IANA zone id, e.g. 'Asia/Colombo'
}
```

All 12 mock entries get realistic, spread-out assignments (not all the same offset), including Sri Lanka per the motivating example. Example assignments: Priya Nair → India (`Asia/Kolkata`, +5:30), Arun Kumar → Singapore (`Asia/Singapore`, +8:00), Sara Lee → South Korea (`Asia/Seoul`, +9:00), Marcus Chen → USA East (`America/New_York`), Dana Brooks → UK (`Europe/London`), Alexander Pierce → Sri Lanka (`Asia/Colombo`, +5:30), Riya Sharma → UAE (`Asia/Dubai`, +4:00), James Wilson → Australia (`Australia/Sydney`), Meera Iyer → India (`Asia/Kolkata`), Tom Becker → USA West (`America/Los_Angeles`), Lakshmi Rao → Sri Lanka (`Asia/Colombo`), Carlos Diaz → Philippines (`Asia/Manila`).

**`EmployeeProfile`** ([employee.types.ts](../../../src/features/employees/types/employee.types.ts)) gains the same two fields: `country: string; timezone: string`. The three real profiles ([employees.data.ts](../../../src/features/employees/data/employees.data.ts)) get assignments consistent with their `CALENDAR_DIRECTORY` counterparts where the same person appears in both lists: Alexander Pierce (the default logged-in viewer, `DEFAULT_EMPLOYEE_ID = 'alex'`) → Sri Lanka, matching the motivating example exactly. Dana Brooks (`manager`) → UK, matching her directory entry. Marcus Chen (`marcus`) → USA East, matching his directory entry.

"Your timezone" anywhere in the UI is `useEmployeeContext().selectedEmployee.timezone` — already-wired app-wide context, no new state.

## 2. Conversion utility — new file `timezone.utils.ts`

New file: `src/features/employees/components/my-calendar/timezone.utils.ts`. No external date library — built on `Intl.DateTimeFormat`, which has DST-correct built-in zone data.

```ts
export function getOffsetMinutes(timeZone: string, atUtc: Date): number;
export function formatOffsetLabel(timeZone: string, atUtc?: Date): string; // "UTC+5:30"
export function convertWallTime(
  date: string, time: string, fromZone: string, toZone: string
): { date: string; time: string };

export interface AttendeeTimeRow {
  name: string;
  country: string;
  start: string; // "HH:MM", attendee's local time
  end: string;
}

export function getAttendeeTimeRows(
  attendeeNames: string[],
  date: string, start: string, end: string,
  viewerTimeZone: string
): AttendeeTimeRow[];
```

`getAttendeeTimeRows` looks up each name in `CALENDAR_DIRECTORY`; names with no match (external/email-invited attendees — their timezone is unknown) and names whose `timezone` equals `viewerTimeZone` are excluded from the result. The remaining rows carry each attendee's converted local start/end as 24h `"HH:MM"` strings — callers format to 12h display using their own existing local `formatTime` helper (each consuming file already has one; this avoids introducing a new cross-file formatting dependency).

`getOffsetMinutes` works by formatting the same instant in the target zone via `Intl.DateTimeFormat(...).formatToParts`, re-interpreting those parts as if they were UTC, and diffing against the real UTC instant — the standard DST-correct technique for this without a library.

## 3. UI surfacing

**`AttendeeSearchField.tsx`:**
- Each directory dropdown row gains a third line: `"{country} · {formatOffsetLabel(timezone)}"` (e.g. `"India · UTC+5:30"`), styled like the existing role line (new CSS class `.emc-attendee-search__option-tz`).
- Each `kind: 'user'` chip gains a small offset suffix (new class `.emc-attendee-chip__tz`) — but **only when that person's `timezone` differs from `useEmployeeContext().selectedEmployee.timezone`**. Same-zone attendees get no suffix, keeping the common case uncluttered. External (`kind: 'external'`) chips never get a suffix — no timezone data exists for them.

**`NewEventWizard.tsx`:**
- Directly below the `AttendeeSearchField` (inside the Details section, only rendered when `fieldConfig.showAttendees` is true — i.e. Meeting/Training — and only when `!form.allDay`), a small list driven by `getAttendeeTimeRows(form.attendees.map(attendeeKey... filtered to kind 'user' names), form.date, form.start, form.end, viewerTimeZone)`. Recomputes live as the user edits Start/End time. Empty list (e.g. no attendees, or all attendees share the viewer's zone) renders nothing — no empty placeholder box.
- Example row: `"Sara Lee: 7:30 PM – 8:00 PM (South Korea)"`.

**`EventDetailsModal.tsx`:**
- The same row list, placed after the existing attendees row and before the `attendeeRsvp` badges, computed from `event.attendees` (already `string[]` of names), `event.date`, `event.start`, `event.end`, gated on `event.start && event.end && !event.allDay`.

## 4. Out of scope

- No manual per-attendee timezone override in the UI — an attendee's zone is always whatever `CALENDAR_DIRECTORY` says.
- No timezone selector for the organizer — always `useEmployeeContext().selectedEmployee.timezone`.
- No changes to the standalone company-level `GeneralSettings.timezone` (still unconnected; out of scope for this feature).
- No "outside working hours" warnings — just the converted time, no judgment about whether it's a reasonable hour.
- No real persistence of timezone on `CalendarEvent` itself — the event's stored `start`/`end` remain the organizer's wall-clock time as today; conversion is computed for display only, derived fresh from the directory each time.
