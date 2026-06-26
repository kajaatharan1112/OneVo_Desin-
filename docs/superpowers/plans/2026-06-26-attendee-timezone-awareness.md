# Attendee Timezone Awareness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When scheduling a meeting/training with attendees in different countries, show each attendee's local time for that meeting — in the attendee picker, while creating the event, and when viewing its details afterward.

**Architecture:** A new pure-function file (`timezone.utils.ts`) does all the offset/conversion math using built-in `Intl.DateTimeFormat` (no library). `DirectoryPerson` and `EmployeeProfile` gain `country`/`timezone` fields. Three existing components (`AttendeeSearchField`, `NewEventWizard`, `EventDetailsModal`) each call the new utility and the existing `useEmployeeContext()` hook to render attendee-local-time info.

**Tech Stack:** React + TypeScript (Vite). No test framework exists in this repo — verification is `npx tsc -p tsconfig.app.json` (must stay clean, beyond the two pre-existing unrelated errors in `Step6ConfirmImport.tsx`/`navbar.tsx`) plus manual exercise in a headless browser (Playwright installed ad-hoc into a scratch `/tmp` directory — do not add it to the project's `package.json`).

## Global Constraints

- `DirectoryPerson` and `EmployeeProfile` gain exactly two new fields: `country: string` and `timezone: string` (IANA zone id, e.g. `'Asia/Colombo'`).
- "Your timezone" anywhere in the UI is always `useEmployeeContext().selectedEmployee.timezone` — no per-component override, no UI selector for it.
- `getAttendeeTimeRows` excludes: (a) names with no `CALENDAR_DIRECTORY` match (external/email-invited attendees — unknown timezone), and (b) names whose `timezone` equals the viewer's. Only genuinely different-zone directory attendees produce a row.
- No "outside working hours" warnings, no manual per-attendee timezone override UI, no changes to `GeneralSettings.timezone`, no timezone tag stored on `CalendarEvent` itself — conversion is computed fresh for display every time, never persisted.
- Run `npx tsc -p tsconfig.app.json` after every code change — it must report no NEW errors anywhere in `src/features/employees/`.

---

### Task 1: Timezone conversion utility

**Files:**
- Create: `src/features/employees/components/my-calendar/timezone.utils.ts`

**Interfaces:**
- Consumes: `CALENDAR_DIRECTORY` from `./new-event-wizard.utils` (existing, read-only).
- Produces: `getOffsetMinutes(timeZone: string, atUtc: Date): number`, `formatOffsetLabel(timeZone: string, atUtc?: Date): string`, `convertWallTime(date: string, time: string, fromZone: string, toZone: string): { date: string; time: string }`, `interface AttendeeTimeRow { name: string; country: string; start: string; end: string }`, `getAttendeeTimeRows(attendeeNames: string[], date: string, start: string, end: string, viewerTimeZone: string): AttendeeTimeRow[]`. Tasks 3, 4, 5 import all of these.

- [ ] **Step 1: Write the file**

```ts
import { CALENDAR_DIRECTORY } from './new-event-wizard.utils';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function getOffsetMinutes(timeZone: string, atUtc: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(atUtc).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  return Math.round((asUtc - atUtc.getTime()) / 60000);
}

export function formatOffsetLabel(timeZone: string, atUtc: Date = new Date()): string {
  const minutes = getOffsetMinutes(timeZone, atUtc);
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}:${pad2(m)}`;
}

export function convertWallTime(
  date: string, time: string, fromZone: string, toZone: string
): { date: string; time: string } {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const naiveUtcMs = Date.UTC(y, mo - 1, d, h, mi);
  const fromOffset = getOffsetMinutes(fromZone, new Date(naiveUtcMs));
  const trueUtcMs = naiveUtcMs - fromOffset * 60000;
  const toOffset = getOffsetMinutes(toZone, new Date(trueUtcMs));
  const targetMs = trueUtcMs + toOffset * 60000;
  const t = new Date(targetMs);
  return {
    date: `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}`,
    time: `${pad2(t.getUTCHours())}:${pad2(t.getUTCMinutes())}`,
  };
}

export interface AttendeeTimeRow {
  name: string;
  country: string;
  start: string;
  end: string;
}

export function getAttendeeTimeRows(
  attendeeNames: string[],
  date: string,
  start: string,
  end: string,
  viewerTimeZone: string
): AttendeeTimeRow[] {
  if (!date || !start || !end) return [];
  const rows: AttendeeTimeRow[] = [];
  for (const name of attendeeNames) {
    const person = CALENDAR_DIRECTORY.find(p => p.name === name);
    if (!person || person.timezone === viewerTimeZone) continue;
    const startConv = convertWallTime(date, start, viewerTimeZone, person.timezone);
    const endConv = convertWallTime(date, end, viewerTimeZone, person.timezone);
    rows.push({ name: person.name, country: person.country, start: startConv.time, end: endConv.time });
  }
  return rows;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: error `Property 'timezone' does not exist on type 'DirectoryPerson'` (and `'country'`) from this new file — expected, Task 2 adds those fields. No other new errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/timezone.utils.ts
git commit -m "feat(calendar): add timezone conversion utility"
```

---

### Task 2: `country`/`timezone` data on people

**Files:**
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`
- Modify: `src/features/employees/types/employee.types.ts`
- Modify: `src/features/employees/data/employees.data.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `DirectoryPerson.country`, `DirectoryPerson.timezone`, `EmployeeProfile.country`, `EmployeeProfile.timezone`. Tasks 1 (already written, now compiles), 3, 4, 5 read these.

- [ ] **Step 1: Add fields to `DirectoryPerson` and assign every mock entry a country/timezone**

Replace:

```ts
export interface DirectoryPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export const CALENDAR_DIRECTORY: DirectoryPerson[] = [
  { id: 'd-1', name: 'Priya Nair', role: 'Product Manager', avatar: 'PN' },
  { id: 'd-2', name: 'Arun Kumar', role: 'Backend Developer', avatar: 'AK' },
  { id: 'd-3', name: 'Sara Lee', role: 'UX Designer', avatar: 'SL' },
  { id: 'd-4', name: 'Marcus Chen', role: 'Chief Executive Officer', avatar: 'MC' },
  { id: 'd-5', name: 'Dana Brooks', role: 'Manager', avatar: 'DB' },
  { id: 'd-6', name: 'Alexander Pierce', role: 'Back End Developer', avatar: 'AP' },
  { id: 'd-7', name: 'Riya Sharma', role: 'QA Engineer', avatar: 'RS' },
  { id: 'd-8', name: 'James Wilson', role: 'DevOps Engineer', avatar: 'JW' },
  { id: 'd-9', name: 'Meera Iyer', role: 'HR Business Partner', avatar: 'MI' },
  { id: 'd-10', name: 'Tom Becker', role: 'Sales Lead', avatar: 'TB' },
  { id: 'd-11', name: 'Lakshmi Rao', role: 'Finance Analyst', avatar: 'LR' },
  { id: 'd-12', name: 'Carlos Diaz', role: 'Frontend Developer', avatar: 'CD' },
];
```

with:

```ts
export interface DirectoryPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
  country: string;
  timezone: string;
}

export const CALENDAR_DIRECTORY: DirectoryPerson[] = [
  { id: 'd-1', name: 'Priya Nair', role: 'Product Manager', avatar: 'PN', country: 'India', timezone: 'Asia/Kolkata' },
  { id: 'd-2', name: 'Arun Kumar', role: 'Backend Developer', avatar: 'AK', country: 'Singapore', timezone: 'Asia/Singapore' },
  { id: 'd-3', name: 'Sara Lee', role: 'UX Designer', avatar: 'SL', country: 'South Korea', timezone: 'Asia/Seoul' },
  { id: 'd-4', name: 'Marcus Chen', role: 'Chief Executive Officer', avatar: 'MC', country: 'USA', timezone: 'America/New_York' },
  { id: 'd-5', name: 'Dana Brooks', role: 'Manager', avatar: 'DB', country: 'UK', timezone: 'Europe/London' },
  { id: 'd-6', name: 'Alexander Pierce', role: 'Back End Developer', avatar: 'AP', country: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { id: 'd-7', name: 'Riya Sharma', role: 'QA Engineer', avatar: 'RS', country: 'UAE', timezone: 'Asia/Dubai' },
  { id: 'd-8', name: 'James Wilson', role: 'DevOps Engineer', avatar: 'JW', country: 'Australia', timezone: 'Australia/Sydney' },
  { id: 'd-9', name: 'Meera Iyer', role: 'HR Business Partner', avatar: 'MI', country: 'India', timezone: 'Asia/Kolkata' },
  { id: 'd-10', name: 'Tom Becker', role: 'Sales Lead', avatar: 'TB', country: 'USA', timezone: 'America/Los_Angeles' },
  { id: 'd-11', name: 'Lakshmi Rao', role: 'Finance Analyst', avatar: 'LR', country: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { id: 'd-12', name: 'Carlos Diaz', role: 'Frontend Developer', avatar: 'CD', country: 'Philippines', timezone: 'Asia/Manila' },
];
```

- [ ] **Step 2: Add fields to `EmployeeProfile`**

Replace:

```ts
export interface EmployeeProfile {
  id: EmployeeId;
  name: string;
  role: string;
  avatar: string;
  avatarUrl: string;
}
```

with:

```ts
export interface EmployeeProfile {
  id: EmployeeId;
  name: string;
  role: string;
  avatar: string;
  avatarUrl: string;
  country: string;
  timezone: string;
}
```

- [ ] **Step 3: Assign country/timezone to the three real employee profiles**

Replace:

```ts
export const employees: EmployeeProfile[] = [
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Chief Executive Officer',
    avatar: 'MC',
    avatarUrl: 'https://i.pravatar.cc/150?u=marcus'
  },
  {
    id: 'manager',
    name: 'Dana Brooks',
    role: 'Manager',
    avatar: 'DB',
    avatarUrl: 'https://i.pravatar.cc/150?u=dana'
  },
  {
    id: 'alex',
    name: 'Alexander Pierce',
    role: 'Back end developer',
    avatar: 'AP',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex'
  }
];
```

with:

```ts
export const employees: EmployeeProfile[] = [
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Chief Executive Officer',
    avatar: 'MC',
    avatarUrl: 'https://i.pravatar.cc/150?u=marcus',
    country: 'USA',
    timezone: 'America/New_York'
  },
  {
    id: 'manager',
    name: 'Dana Brooks',
    role: 'Manager',
    avatar: 'DB',
    avatarUrl: 'https://i.pravatar.cc/150?u=dana',
    country: 'UK',
    timezone: 'Europe/London'
  },
  {
    id: 'alex',
    name: 'Alexander Pierce',
    role: 'Back end developer',
    avatar: 'AP',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
    country: 'Sri Lanka',
    timezone: 'Asia/Colombo'
  }
];
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors in `new-event-wizard.utils.ts`, `employee.types.ts`, `employees.data.ts`, or `timezone.utils.ts`. The two pre-existing unrelated errors in `Step6ConfirmImport.tsx`/`navbar.tsx` are the only ones left.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts src/features/employees/types/employee.types.ts src/features/employees/data/employees.data.ts
git commit -m "feat(calendar): add country/timezone data to directory and employee profiles"
```

---

### Task 3: Timezone info in `AttendeeSearchField`

**Files:**
- Modify: `src/features/employees/components/my-calendar/AttendeeSearchField.tsx`

**Interfaces:**
- Consumes: `formatOffsetLabel` from `./timezone.utils` (Task 1); `useEmployeeContext` from `../../context/employee-context` (existing); `country`/`timezone` on `DirectoryPerson` (Task 2).
- Produces: nothing new for later tasks — this component's behavior is self-contained.

- [ ] **Step 1: Import the new utility and the employee context hook**

Replace:

```tsx
import React, { useMemo, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { attendeeKey, CALENDAR_DIRECTORY, type AttendeeRef } from './new-event-wizard.utils';
```

with:

```tsx
import React, { useMemo, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { attendeeKey, CALENDAR_DIRECTORY, type AttendeeRef } from './new-event-wizard.utils';
import { formatOffsetLabel } from './timezone.utils';
import { useEmployeeContext } from '../../context/employee-context';
```

- [ ] **Step 2: Read the viewer's timezone**

Replace:

```tsx
export const AttendeeSearchField: React.FC<AttendeeSearchFieldProps> = ({ selected, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
```

with:

```tsx
export const AttendeeSearchField: React.FC<AttendeeSearchFieldProps> = ({ selected, onChange }) => {
  const { selectedEmployee } = useEmployeeContext();
  const viewerTimeZone = selectedEmployee.timezone;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
```

- [ ] **Step 3: Add the country/offset line to each dropdown row**

Replace:

```tsx
                <span className="emc-attendee-search__avatar">{person.avatar}</span>
                <span className="emc-attendee-search__option-text">
                  <span>{person.name}</span>
                  <span className="emc-attendee-search__option-role">{person.role}</span>
                </span>
```

with:

```tsx
                <span className="emc-attendee-search__avatar">{person.avatar}</span>
                <span className="emc-attendee-search__option-text">
                  <span>{person.name}</span>
                  <span className="emc-attendee-search__option-role">{person.role}</span>
                  <span className="emc-attendee-search__option-tz">{person.country} · {formatOffsetLabel(person.timezone)}</span>
                </span>
```

- [ ] **Step 4: Add an offset suffix to chips when the attendee's zone differs from the viewer's**

Replace:

```tsx
      {selected.length > 0 && (
        <div className="emc-wizard__attendees emc-attendee-search__chips">
          {selected.map(a => (
            <span key={attendeeKey(a)} className="emc-attendee-chip">
              {a.kind === 'user' ? (
                <span className="emc-attendee-search__avatar emc-attendee-search__avatar--sm">
                  {CALENDAR_DIRECTORY.find(p => p.id === a.id)?.avatar ?? a.name.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <Mail size={12} />
              )}
              <span>{a.kind === 'user' ? a.name : a.email}</span>
              <button
                type="button"
                aria-label={`Remove ${attendeeKey(a)}`}
                onClick={() => removeAttendee(attendeeKey(a))}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
```

with:

```tsx
      {selected.length > 0 && (
        <div className="emc-wizard__attendees emc-attendee-search__chips">
          {selected.map(a => {
            const directoryPerson = a.kind === 'user' ? CALENDAR_DIRECTORY.find(p => p.id === a.id) : undefined;
            const showTz = !!directoryPerson && directoryPerson.timezone !== viewerTimeZone;
            return (
              <span key={attendeeKey(a)} className="emc-attendee-chip">
                {a.kind === 'user' ? (
                  <span className="emc-attendee-search__avatar emc-attendee-search__avatar--sm">
                    {directoryPerson?.avatar ?? a.name.slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <Mail size={12} />
                )}
                <span>{a.kind === 'user' ? a.name : a.email}</span>
                {showTz && (
                  <span className="emc-attendee-chip__tz">{formatOffsetLabel(directoryPerson!.timezone)}</span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${attendeeKey(a)}`}
                  onClick={() => removeAttendee(attendeeKey(a))}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors in `AttendeeSearchField.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/AttendeeSearchField.tsx
git commit -m "feat(calendar): show attendee country/timezone in search dropdown and chips"
```

---

### Task 4: Attendee local-time list in `NewEventWizard`

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `getAttendeeTimeRows`, `type AttendeeTimeRow` from `./timezone.utils` (Task 1); `useEmployeeContext` from `../../context/employee-context`.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Import the utility and the employee context hook, and add a local `formatTime` helper**

Replace:

```tsx
import React, { useState } from 'react';
import { Bell, CalendarClock, FileText, Tag, X } from 'lucide-react';
import type { CalendarEvent, CalendarEventCategory, CalendarEventPriority } from '../../types/employee-calendar.types';
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  getDefaultEndTime,
  TYPE_FIELD_CONFIG,
  type LeaveTypeKey,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
import { AttendeeSearchField } from './AttendeeSearchField';
```

with:

```tsx
import React, { useState } from 'react';
import { Bell, CalendarClock, FileText, Tag, X } from 'lucide-react';
import type { CalendarEvent, CalendarEventCategory, CalendarEventPriority } from '../../types/employee-calendar.types';
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  getDefaultEndTime,
  TYPE_FIELD_CONFIG,
  type LeaveTypeKey,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
import { AttendeeSearchField } from './AttendeeSearchField';
import { getAttendeeTimeRows } from './timezone.utils';
import { useEmployeeContext } from '../../context/employee-context';

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
```

- [ ] **Step 2: Compute the attendee time rows**

Replace:

```tsx
  const fieldConfig = TYPE_FIELD_CONFIG[form.type];
```

with:

```tsx
  const fieldConfig = TYPE_FIELD_CONFIG[form.type];

  const { selectedEmployee } = useEmployeeContext();
  const attendeeUserNames = form.attendees.filter(a => a.kind === 'user').map(a => a.name);
  const attendeeTimeRows = !form.allDay
    ? getAttendeeTimeRows(attendeeUserNames, form.date, form.start, form.end, selectedEmployee.timezone)
    : [];
```

- [ ] **Step 3: Render the list under the Attendees field**

Replace:

```tsx
      {fieldConfig.showAttendees && (
        <div className="emc-wizard__field">
          <span>Attendees</span>
          <AttendeeSearchField selected={form.attendees} onChange={attendees => update({ attendees })} />
        </div>
      )}
```

with:

```tsx
      {fieldConfig.showAttendees && (
        <div className="emc-wizard__field">
          <span>Attendees</span>
          <AttendeeSearchField selected={form.attendees} onChange={attendees => update({ attendees })} />
          {attendeeTimeRows.length > 0 && (
            <ul className="emc-wizard__attendee-times">
              {attendeeTimeRows.map(row => (
                <li key={row.name}>
                  {row.name}: {formatTime(row.start)} – {formatTime(row.end)} ({row.country})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors in `NewEventWizard.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): show attendee local meeting times while creating an event"
```

---

### Task 5: Attendee local-time list in `EventDetailsModal`

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`

**Interfaces:**
- Consumes: `getAttendeeTimeRows` from `./timezone.utils` (Task 1); `useEmployeeContext` from `../../context/employee-context`.
- Produces: nothing new for later tasks — this is the last code task.

- [ ] **Step 1: Import the utility and the employee context hook**

Replace:

```tsx
import React, { useState } from 'react';
import { X, MapPin, Users as UsersIcon, Trash2, Pencil } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../../types/employee-calendar.types';
```

with:

```tsx
import React, { useState } from 'react';
import { X, MapPin, Users as UsersIcon, Trash2, Pencil } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../../types/employee-calendar.types';
import { getAttendeeTimeRows } from './timezone.utils';
import { useEmployeeContext } from '../../context/employee-context';
```

- [ ] **Step 2: Compute the attendee time rows**

Replace:

```tsx
export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onDelete, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(event);
```

with:

```tsx
export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onDelete, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(event);

  const { selectedEmployee } = useEmployeeContext();
  const attendeeTimeRows = event.attendees && event.start && event.end && !event.allDay
    ? getAttendeeTimeRows(event.attendees, event.date, event.start, event.end, selectedEmployee.timezone)
    : [];
```

- [ ] **Step 3: Render the list after the attendees row**

Replace:

```tsx
            {event.attendees && event.attendees.length > 0 && (
              <div className="emc-modal__row">
                <UsersIcon size={13} className="emc-modal__row-icon" />
                <span className="emc-modal__row-value">{event.attendees.join(', ')}</span>
              </div>
            )}

            {event.leaveType && (
```

with:

```tsx
            {event.attendees && event.attendees.length > 0 && (
              <div className="emc-modal__row">
                <UsersIcon size={13} className="emc-modal__row-icon" />
                <span className="emc-modal__row-value">{event.attendees.join(', ')}</span>
              </div>
            )}

            {attendeeTimeRows.length > 0 && (
              <ul className="emc-modal__attendee-times">
                {attendeeTimeRows.map(row => (
                  <li key={row.name}>
                    {row.name}: {formatTime(row.start)} – {formatTime(row.end)} ({row.country})
                  </li>
                ))}
              </ul>
            )}

            {event.leaveType && (
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors in `EventDetailsModal.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx
git commit -m "feat(calendar): show attendee local meeting times in event details"
```

---

### Task 6: Styling

**Files:**
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: class names used in Tasks 3, 4, 5: `.emc-attendee-search__option-tz`, `.emc-attendee-chip__tz`, `.emc-wizard__attendee-times`, `.emc-modal__attendee-times`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the dropdown-row and chip timezone label styles**

Find this existing rule (do not change it):

```css
.emc-attendee-search__option-role {
  font-size: 0.7rem;
  color: var(--text-muted, #6b7280);
}
```

Insert immediately after it:

```css
.emc-attendee-search__option-tz {
  font-size: 0.65rem;
  color: var(--text-muted, #6b7280);
}
```

Find this existing rule (do not change it):

```css
.emc-attendee-chip button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted, #6b7280);
  cursor: pointer;
  padding: 0;
}
```

Insert immediately after it:

```css
.emc-attendee-chip__tz {
  font-size: 0.65rem;
  color: var(--text-muted, #6b7280);
}

.emc-wizard__attendee-times {
  margin: 0.375rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.72rem;
  color: var(--text-muted, #6b7280);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
```

- [ ] **Step 2: Add the event-details list style**

Replace:

```css
.emc-modal__row-label {
  color: var(--nexus-text-muted);
  min-width: 88px;
  flex-shrink: 0;
}

.emc-modal__row-value {
  color: var(--text-h);
}
```

with:

```css
.emc-modal__row-label {
  color: var(--nexus-text-muted);
  min-width: 88px;
  flex-shrink: 0;
}

.emc-modal__row-value {
  color: var(--text-h);
}

.emc-modal__attendee-times {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/employee-my-calendar.css
git commit -m "style(calendar): add attendee timezone label and local-time list styles"
```

---

### Task 7: Manual verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL with no compile errors.

- [ ] **Step 2: Verify the dropdown shows country/offset**

Open the app → Schedule → Calendar → New Event → Meeting type → in Attendees, type `sara`. Confirm the dropdown row shows "Sara Lee", "UX Designer", and a third line "South Korea · UTC+9:00".

- [ ] **Step 3: Verify chip suffix only appears for a different-zone attendee**

Click the Sara Lee row to add her as a chip. Confirm the chip shows a small "UTC+9:00" suffix (since the logged-in viewer, Alexander Pierce, is in Sri Lanka/UTC+5:30, a different zone). Then search and add "Lakshmi Rao" (Sri Lanka, same zone as the viewer) — confirm her chip has NO offset suffix.

- [ ] **Step 4: Verify the local-time list updates live while creating the event**

With Sara Lee still added as an attendee, set Start time to `10:00` and End time to `10:30`. Confirm a line appears under the Attendees field: "Sara Lee: 7:30 PM – 8:00 PM (South Korea)" (UTC+9:00 is 3.5 hours ahead of UTC+5:30, so 10:00–10:30 AM Sri Lanka time = 1:30–2:00 PM South Korea time — recompute the exact expected offset live with the running app rather than trusting this description, since exact DST-dependent offsets can shift; confirm the displayed time is internally consistent with a positive few-hour shift forward, not that it matches this exact string).

- [ ] **Step 5: Create the event and verify the same list appears in event details**

Fill Title "TZ Test", click Create Event. Click the newly created event on the calendar. Confirm the same "Sara Lee: ... (South Korea)" line appears in the details popup, in the same position (right after the attendees row).

- [ ] **Step 6: Verify all-day events show no time list**

Open New Event again, switch to "Holiday" type (no attendees field, all-day forced) — confirm no attendee-time list appears anywhere (there's no Attendees field for Holiday at all, so this is just confirming no crash/stray UI). Then create a Meeting, add an attendee, but check the "All-day" box — confirm the attendee-time list disappears while All-day is checked (since `attendeeTimeRows` is forced empty when `form.allDay`).

- [ ] **Step 7: Stop the dev server**

Stop the `npm run dev` process (Ctrl+C) once verification passes.

No commit for this task — it's verification only, not a code change.
