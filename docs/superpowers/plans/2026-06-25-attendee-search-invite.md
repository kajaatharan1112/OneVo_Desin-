# Attendee Search & Invite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the New Event wizard's fixed checkbox Attendees list with a searchable picker that finds people in a mock directory and lets the user "invite" anyone else by typing an email address (Gmail "To" field style), all rendered as one combined chip list.

**Architecture:** A new self-contained `AttendeeSearchField` component owns its own input/dropdown/chip-list state and exposes a `selected` / `onChange` interface. `new-event-wizard.utils.ts` gains a richer mock directory and a typed `AttendeeRef` union that the form state now stores instead of plain strings. `NewEventWizard.tsx` swaps the old checkbox block for the new component; `buildEventsFromForm` still emits plain `string[]`/`Record<string,...>` for `CalendarEvent`, so no other file in the codebase changes.

**Tech Stack:** React + TypeScript (Vite), `lucide-react` icons, existing `employee-my-calendar.css` BEM-style classes (`emc-wizard__*`). No test framework exists in this repo (`package.json` has no test script) — verification is done via `npx tsc -p tsconfig.app.json` (type-check, `noEmit` already on, `noUnusedLocals`/`noUnusedParameters` enabled) plus manual exercise of the dev server. Do not introduce a new test framework as part of this plan.

## Global Constraints

- No backend/API integration — `CALENDAR_DIRECTORY` stays static mock data in `new-event-wizard.utils.ts`.
- No real email-sending for external invites; inviting only stores the email string on the event.
- No changes to `EmployeeProfile` / `employees.data.ts` or to `CalendarEvent`'s `attendees`/`attendeeRsvp` shape (both stay `string[]` / `Record<string, RsvpStatus>`).
- Email validity check uses the simple pattern `/^\S+@\S+\.\S+$/`.
- Reuse the existing `.emc-wizard__attendees` flex-wrap container class for the chip list; do not introduce a parallel style system.
- Run `npx tsc -p tsconfig.app.json` after every code change in this plan — it must report no errors before moving on (it also catches unused imports, since `noUnusedLocals`/`noUnusedParameters` are on).

---

### Task 1: Directory + `AttendeeRef` type + form state in `new-event-wizard.utils.ts`

**Files:**
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`

**Interfaces:**
- Consumes: nothing new (existing `NewEventType`, `RsvpStatus`, `CalendarEvent` types already in this file).
- Produces: `export interface DirectoryPerson { id: string; name: string; role: string; avatar: string }`, `export const CALENDAR_DIRECTORY: DirectoryPerson[]`, `export type AttendeeRef = { kind: 'user'; id: string; name: string; role: string } | { kind: 'external'; email: string }`, `export function attendeeKey(a: AttendeeRef): string` (returns `name` for users, `email` for external — used as the de-dupe/display key everywhere downstream). `NewEventFormState.attendees` becomes `AttendeeRef[]`.

- [ ] **Step 1: Replace `MOCK_ATTENDEES` with `CALENDAR_DIRECTORY` and add `AttendeeRef`/`attendeeKey`**

Replace this block:

```ts
export const MOCK_ATTENDEES = ['Priya Nair', 'Arun Kumar', 'Sara Lee'];
```

with:

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

export type AttendeeRef =
  | { kind: 'user'; id: string; name: string; role: string }
  | { kind: 'external'; email: string };

export function attendeeKey(a: AttendeeRef): string {
  return a.kind === 'user' ? a.name : a.email;
}
```

- [ ] **Step 2: Change `NewEventFormState.attendees` to `AttendeeRef[]`**

Replace:

```ts
  attendees: string[];
```

with:

```ts
  attendees: AttendeeRef[];
```

(in the `NewEventFormState` interface — `EMPTY_NEW_EVENT_FORM.attendees: []` needs no change, an empty array satisfies both types.)

- [ ] **Step 3: Update `buildEventsFromForm` to read the new shape**

Replace:

```ts
    if (needsAttendees && form.attendees.length > 0) {
      event.attendees = form.attendees;
      event.attendeeRsvp = form.attendees.reduce<Record<string, RsvpStatus>>((acc, name) => {
        acc[name] = 'pending';
        return acc;
      }, {});
    }
```

with:

```ts
    if (needsAttendees && form.attendees.length > 0) {
      event.attendees = form.attendees.map(attendeeKey);
      event.attendeeRsvp = form.attendees.reduce<Record<string, RsvpStatus>>((acc, a) => {
        acc[attendeeKey(a)] = 'pending';
        return acc;
      }, {});
    }
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: errors referencing `NewEventWizard.tsx` (it still uses `MOCK_ATTENDEES`, `form.attendees.includes(name)`, and `toggleAttendee(name: string)` against the old shape) — this is expected, Task 3 fixes it. Confirm there are **no errors reported against `new-event-wizard.utils.ts` itself**.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts
git commit -m "feat(calendar): replace mock attendee list with directory + AttendeeRef type"
```

---

### Task 2: `AttendeeSearchField` component

**Files:**
- Create: `src/features/employees/components/my-calendar/AttendeeSearchField.tsx`

**Interfaces:**
- Consumes: `AttendeeRef`, `attendeeKey`, `CALENDAR_DIRECTORY`, `DirectoryPerson` from `./new-event-wizard.utils` (Task 1).
- Produces: `export interface AttendeeSearchFieldProps { selected: AttendeeRef[]; onChange: (next: AttendeeRef[]) => void }` and `export const AttendeeSearchField: React.FC<AttendeeSearchFieldProps>`. Task 3 imports and renders this with `form.attendees` / `update({ attendees: ... })`.

- [ ] **Step 1: Write the component**

```tsx
import React, { useMemo, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { attendeeKey, CALENDAR_DIRECTORY, type AttendeeRef } from './new-event-wizard.utils';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export interface AttendeeSearchFieldProps {
  selected: AttendeeRef[];
  onChange: (next: AttendeeRef[]) => void;
}

export const AttendeeSearchField: React.FC<AttendeeSearchFieldProps> = ({ selected, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedKeys = useMemo(() => new Set(selected.map(attendeeKey)), [selected]);

  const directoryMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CALENDAR_DIRECTORY.filter(
      person => !selectedKeys.has(person.name) && person.name.toLowerCase().includes(q)
    );
  }, [query, selectedKeys]);

  const trimmedQuery = query.trim();
  const isExactDirectoryMatch = CALENDAR_DIRECTORY.some(
    person => person.name.toLowerCase() === trimmedQuery.toLowerCase()
  );
  const showInviteRow =
    EMAIL_PATTERN.test(trimmedQuery) &&
    !isExactDirectoryMatch &&
    !selectedKeys.has(trimmedQuery);

  const addAttendee = (attendee: AttendeeRef) => {
    onChange([...selected, attendee]);
    setQuery('');
    setOpen(false);
  };

  const removeAttendee = (key: string) => {
    onChange(selected.filter(a => attendeeKey(a) !== key));
  };

  return (
    <div className="emc-attendee-search">
      <input
        type="text"
        value={query}
        placeholder="Search people or type an email to invite"
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (directoryMatches[0]) {
            addAttendee({
              kind: 'user',
              id: directoryMatches[0].id,
              name: directoryMatches[0].name,
              role: directoryMatches[0].role,
            });
          } else if (showInviteRow) {
            addAttendee({ kind: 'external', email: trimmedQuery });
          }
        }}
      />
      {open && (directoryMatches.length > 0 || showInviteRow) && (
        <ul className="emc-attendee-search__dropdown">
          {directoryMatches.map(person => (
            <li key={person.id}>
              <button
                type="button"
                className="emc-attendee-search__option"
                onMouseDown={e => e.preventDefault()}
                onClick={() => addAttendee({ kind: 'user', id: person.id, name: person.name, role: person.role })}
              >
                <span className="emc-attendee-search__avatar">{person.avatar}</span>
                <span className="emc-attendee-search__option-text">
                  <span>{person.name}</span>
                  <span className="emc-attendee-search__option-role">{person.role}</span>
                </span>
              </button>
            </li>
          ))}
          {showInviteRow && (
            <li>
              <button
                type="button"
                className="emc-attendee-search__option emc-attendee-search__option--invite"
                onMouseDown={e => e.preventDefault()}
                onClick={() => addAttendee({ kind: 'external', email: trimmedQuery })}
              >
                <Mail size={14} />
                <span>Invite {trimmedQuery}</span>
              </button>
            </li>
          )}
        </ul>
      )}
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
    </div>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors reported against `AttendeeSearchField.tsx` (errors against `NewEventWizard.tsx` from Task 1 are still expected until Task 3).

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/AttendeeSearchField.tsx
git commit -m "feat(calendar): add AttendeeSearchField component"
```

---

### Task 3: Wire `AttendeeSearchField` into `NewEventWizard.tsx`

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `AttendeeSearchField` (Task 2), `AttendeeRef` type re-exported from `./new-event-wizard.utils` (Task 1).
- Produces: nothing new for later tasks — this is the last code task.

- [ ] **Step 1: Update imports**

Replace:

```ts
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  getDefaultEndTime,
  MOCK_ATTENDEES,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
```

with:

```ts
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  getDefaultEndTime,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
import { AttendeeSearchField } from './AttendeeSearchField';
```

- [ ] **Step 2: Remove `toggleAttendee` (no longer used)**

Delete this block entirely:

```ts
  const toggleAttendee = (name: string) => {
    setForm(f => ({
      ...f,
      attendees: f.attendees.includes(name)
        ? f.attendees.filter(a => a !== name)
        : [...f.attendees, name],
    }));
  };
```

- [ ] **Step 3: Replace the checkbox list with `AttendeeSearchField`**

Replace:

```tsx
      {(form.type === 'meeting' || form.type === 'training') && (
        <div className="emc-wizard__field">
          <span>Attendees</span>
          <div className="emc-wizard__attendees">
            {MOCK_ATTENDEES.map(name => (
              <label key={name} className="emc-wizard__radio">
                <input type="checkbox" checked={form.attendees.includes(name)} onChange={() => toggleAttendee(name)} />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
```

with:

```tsx
      {(form.type === 'meeting' || form.type === 'training') && (
        <div className="emc-wizard__field">
          <span>Attendees</span>
          <AttendeeSearchField selected={form.attendees} onChange={attendees => update({ attendees })} />
        </div>
      )}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors anywhere in `src/features/employees/components/my-calendar/`.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): wire AttendeeSearchField into New Event wizard"
```

---

### Task 4: Styling

**Files:**
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: class names used in `AttendeeSearchField.tsx` (Task 2): `.emc-attendee-search`, `.emc-attendee-search__dropdown`, `.emc-attendee-search__option`, `.emc-attendee-search__option--invite`, `.emc-attendee-search__option-text`, `.emc-attendee-search__option-role`, `.emc-attendee-search__avatar`, `.emc-attendee-search__avatar--sm`, `.emc-attendee-search__chips`, `.emc-attendee-chip`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add CSS after the existing `.emc-wizard__radio` block**

Find this block (existing code, do not change it):

```css
.emc-wizard__radio {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.78rem;
  color: var(--text-h);
  padding: 0.3125rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
}
```

Insert immediately after it:

```css
.emc-attendee-search {
  position: relative;
}

.emc-attendee-search > input[type='text'] {
  width: 100%;
  font-size: 0.8125rem;
  padding: 0.4375rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text-h);
}

.emc-attendee-search__dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  z-index: 20;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  max-height: 14rem;
  overflow-y: auto;
}

.emc-attendee-search__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-h);
  cursor: pointer;
  text-align: left;
}

.emc-attendee-search__option:hover {
  background: var(--surface-hover, rgba(0, 0, 0, 0.04));
}

.emc-attendee-search__option--invite {
  color: var(--accent, #2563eb);
}

.emc-attendee-search__option-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.emc-attendee-search__option-role {
  font-size: 0.7rem;
  color: var(--text-muted, #6b7280);
}

.emc-attendee-search__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: var(--accent-soft, #e0e7ff);
  color: var(--accent, #2563eb);
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
}

.emc-attendee-search__avatar--sm {
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.625rem;
}

.emc-attendee-search__chips {
  margin-top: 0.5rem;
}

.emc-attendee-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.78rem;
  color: var(--text-h);
  padding: 0.3125rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 999px;
}

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

- [ ] **Step 2: Commit**

```bash
git add src/styles/employee-my-calendar.css
git commit -m "style(calendar): add attendee search dropdown and chip styles"
```

---

### Task 5: Manual verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL (e.g. `http://localhost:5173`) with no compile errors.

- [ ] **Step 2: Exercise the golden path**

In the browser: open the employee My Calendar tab → New Event → set Event type to "Meeting" → in Attendees, type `pri` → confirm a dropdown row "Priya Nair · Product Manager" appears → click it → confirm a chip "Priya Nair" appears below the input and the input clears.

- [ ] **Step 3: Exercise the invite path**

Type `newperson@example.com` into the Attendees field → confirm a dropdown row "Invite newperson@example.com" appears (with a mail icon) → click it → confirm a chip with a mail icon and the email text appears.

- [ ] **Step 4: Exercise removal and validation**

Click the ✕ on both chips to remove them → confirm they disappear → click "Create Event" with Meeting type and no attendees → confirm the existing "Select at least one attendee." validation error still appears (proves the emptiness check still works against the new `AttendeeRef[]` type).

- [ ] **Step 5: Confirm no regressions in non-meeting types**

Switch Event type to "Leave" → confirm the Attendees field disappears (unchanged behavior, since the field is still gated on `form.type === 'meeting' || form.type === 'training'`).

- [ ] **Step 6: Stop the dev server**

Stop the `npm run dev` process (Ctrl+C) once verification passes.

No commit for this task — it's verification only, not a code change.
