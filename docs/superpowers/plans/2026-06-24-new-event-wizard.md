# New Event Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the "New Event" button in the My Calendar module to a multi-step wizard that creates events with mock-simulated conflict detection, RSVP, and manager-approval flows.

**Architecture:** A new `NewEventWizard.tsx` modal component (mirrors the existing `AddEmployeeWizard.tsx` step-wizard pattern) collects form state across 5 steps, delegates conflict-detection and event-building to a pure-function utils module (`new-event-wizard.utils.ts`), and hands the finished `CalendarEvent[]` back to `my-calendar-tab.tsx` to append to its existing `localEvents` state — the same mechanism `handleSaveEvent`/`handleDeleteEvent` already use. `EventDetailsModal.tsx` gains RSVP badges and manager Approve/Reject controls for events created by the wizard.

**Tech Stack:** React 19 + TypeScript, no test framework or test runner is configured in this repo (`package.json` has no jest/vitest/RTL). Verification for every task in this plan is: (1) `npx tsc -b --noEmit` type-check, and (2) manual check in the browser via `npm run dev`. This replaces the usual automated-test step — do not invent a fake test command.

## Global Constraints

- Only three creatable event types from the wizard: Leave, Meeting, Company event (map to existing `CalendarEventType` values `leave`, `meeting`, `holiday`). `shift` and `reminder` are not creatable here.
- All state is local/mock — no network calls. New events are appended to `localEvents` in `my-calendar-tab.tsx`.
- Conflict detection only compares against `scope: 'my'` events of type `shift`, `meeting`, `leave`, and only against the **first** occurrence date when recurring.
- Recurring/multi-day events are expanded into independent `CalendarEvent` records (no series linking).
- Follow existing file conventions: `emc-` CSS class prefix in `src/styles/employee-my-calendar.css`, helper functions colocated per file (small duplication across files is the existing pattern, e.g. `formatTime` already exists in two files).

---

### Task 1: Data model changes

**Files:**
- Modify: `src/features/employees/types/employee-calendar.types.ts`

**Interfaces:**
- Produces: `CalendarEventStatus` now includes `'rejected'`; `CalendarEvent` gains optional `reminderMinutesBefore?: number` and `attendeeRsvp?: Record<string, 'pending' | 'accepted' | 'declined' | 'tentative'>`.

- [ ] **Step 1: Edit the type definitions**

In `src/features/employees/types/employee-calendar.types.ts`, change line 3 and the `CalendarEvent` interface:

```ts
export type CalendarEventStatus = 'confirmed' | 'pending' | 'needs-response' | 'rejected';
```

```ts
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  source: CalendarEventSource;
  scope: CalendarScope;
  ownerName?: string;
  allDay?: boolean;
  needsResponse?: boolean;
  note?: string;
  location?: string;
  attendees?: string[];
  reminderMinutesBefore?: number;
  attendeeRsvp?: Record<string, 'pending' | 'accepted' | 'declined' | 'tentative'>;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no new errors (existing repo errors, if any, are unrelated — but at the time of writing this repo type-checks clean).

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/types/employee-calendar.types.ts
git commit -m "feat(calendar): add rejected status and RSVP/reminder fields to CalendarEvent"
```

---

### Task 2: Wizard form types and pure-logic utilities

**Files:**
- Create: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`

**Interfaces:**
- Consumes: `CalendarEvent`, `CalendarEventType`, `CalendarEventStatus`, `CalendarEventSource` from `../../types/employee-calendar.types` (Task 1).
- Produces: `NewEventType`, `NewEventFormState`, `EMPTY_NEW_EVENT_FORM`, `buildOccurrenceDates(form): string[]`, `findConflicts(form, existingMyEvents): CalendarEvent[]`, `buildEventsFromForm(form): CalendarEvent[]` — all consumed by `NewEventWizard.tsx` in Tasks 3–5.

- [ ] **Step 1: Create the utils file**

```ts
import type {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventSource,
} from '../../types/employee-calendar.types';

export type NewEventType = 'leave' | 'meeting' | 'holiday';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface NewEventFormState {
  title: string;
  type: NewEventType;
  allDay: boolean;
  date: string;
  endDate: string;
  start: string;
  end: string;
  location: string;
  notes: string;
  attendees: string[];
  reminderMinutesBefore: number;
  recurring: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  occurrences: number;
}

export const EMPTY_NEW_EVENT_FORM: NewEventFormState = {
  title: '',
  type: 'leave',
  allDay: true,
  date: '',
  endDate: '',
  start: '09:00',
  end: '10:00',
  location: '',
  notes: '',
  attendees: [],
  reminderMinutesBefore: 0,
  recurring: false,
  frequency: 'weekly',
  occurrences: 8,
};

export const MOCK_ATTENDEES = ['Priya Nair', 'Arun Kumar', 'Sara Lee'];

const CONFLICT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave'];

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function buildOccurrenceDates(form: NewEventFormState): string[] {
  if (!form.date) return [];
  const start = parseLocalDate(form.date);

  if (form.recurring) {
    const dates: string[] = [];
    for (let i = 0; i < form.occurrences; i++) {
      const d = new Date(start);
      if (form.frequency === 'daily') d.setDate(d.getDate() + i);
      else if (form.frequency === 'weekly') d.setDate(d.getDate() + i * 7);
      else d.setMonth(d.getMonth() + i);
      dates.push(toDateKey(d));
    }
    return dates;
  }

  if (form.allDay && form.endDate && form.endDate > form.date) {
    const dates: string[] = [];
    const end = parseLocalDate(form.endDate);
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  return [form.date];
}

export function findConflicts(form: NewEventFormState, existingMyEvents: CalendarEvent[]): CalendarEvent[] {
  const occurrenceDates = buildOccurrenceDates(form);
  if (occurrenceDates.length === 0) return [];
  const firstDate = occurrenceDates[0];

  const sameDay = existingMyEvents.filter(
    ev => ev.date === firstDate && CONFLICT_TYPES.includes(ev.type)
  );

  if (form.allDay) return sameDay;

  const newStart = timeToMinutes(form.start);
  const newEnd = timeToMinutes(form.end);

  return sameDay.filter(ev => {
    if (ev.allDay || !ev.start) return true;
    const evStart = timeToMinutes(ev.start);
    const evEnd = ev.end ? timeToMinutes(ev.end) : evStart + 1;
    return newStart < evEnd && evStart < newEnd;
  });
}

const TYPE_META: Record<NewEventType, { calendarType: CalendarEventType; source: CalendarEventSource }> = {
  leave: { calendarType: 'leave', source: 'leave' },
  meeting: { calendarType: 'meeting', source: 'personal' },
  holiday: { calendarType: 'holiday', source: 'company' },
};

export function buildEventsFromForm(form: NewEventFormState): CalendarEvent[] {
  const dates = buildOccurrenceDates(form);
  const ts = Date.now();
  const { calendarType, source } = TYPE_META[form.type];
  const status: CalendarEventStatus = form.type === 'holiday' ? 'pending' : 'confirmed';

  return dates.map((date, i) => {
    const event: CalendarEvent = {
      id: `${form.type}-${ts}-${i}`,
      title: form.title.trim(),
      date,
      type: calendarType,
      status,
      source,
      scope: 'my',
      allDay: form.allDay,
    };

    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
    if (!form.allDay) {
      event.start = form.start;
      event.end = form.end;
    }
    if (form.type === 'meeting' && form.attendees.length > 0) {
      event.attendees = form.attendees;
      event.attendeeRsvp = form.attendees.reduce<Record<string, RsvpStatus>>((acc, name) => {
        acc[name] = 'pending';
        return acc;
      }, {});
    }
    if (form.reminderMinutesBefore > 0) {
      event.reminderMinutesBefore = form.reminderMinutesBefore;
    }

    return event;
  });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual sanity check**

Temporarily add `console.log(buildEventsFromForm({ ...EMPTY_NEW_EVENT_FORM, title: 'Test', date: '2026-07-01' }))` at the bottom of `my-calendar-tab.tsx`'s component body (inside the component, before `return`), run `npm run dev`, open the My Calendar tab, check the browser console for one event object with `status: 'confirmed'`, `type: 'leave'`, `date: '2026-07-01'`. Then remove the temporary log line.

- [ ] **Step 4: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts
git commit -m "feat(calendar): add New Event form state types and conflict/build utilities"
```

---

### Task 3: NewEventWizard shell + Details & Schedule steps

**Files:**
- Create: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `NewEventFormState`, `EMPTY_NEW_EVENT_FORM`, `MOCK_ATTENDEES` from `new-event-wizard.utils.ts` (Task 2).
- Produces: `NewEventWizard` component with props `{ onClose: () => void; onCreate: (events: CalendarEvent[]) => void; existingMyEvents: CalendarEvent[] }` — consumed by `my-calendar-tab.tsx` in Task 6. Internal `step` state (0–4) and `form` state are extended by Tasks 4–5.

- [ ] **Step 1: Create the component with steps 0 and 1**

```tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CalendarEvent } from '../../types/employee-calendar.types';
import {
  EMPTY_NEW_EVENT_FORM,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';

const STEPS = ['Details', 'Schedule', 'More info', 'Reminders & repeat', 'Review'] as const;

const TYPE_OPTIONS: { value: NewEventType; label: string }[] = [
  { value: 'leave', label: 'Leave' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'holiday', label: 'Company event' },
];

interface NewEventWizardProps {
  onClose: () => void;
  onCreate: (events: CalendarEvent[]) => void;
  existingMyEvents: CalendarEvent[];
}

export const NewEventWizard: React.FC<NewEventWizardProps> = ({ onClose, onCreate, existingMyEvents }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
  const [stepError, setStepError] = useState<string | null>(null);

  const update = (patch: Partial<NewEventFormState>) => setForm(f => ({ ...f, ...patch }));

  const validateStep = (): string | null => {
    if (step === 0 && !form.title.trim()) return 'Title is required.';
    if (step === 1) {
      if (!form.date) return 'Date is required.';
      if (!form.allDay && form.end <= form.start) return 'End time must be after start time.';
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep();
    if (error) { setStepError(error); return; }
    setStepError(null);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStepError(null);
    setStep(s => Math.max(s - 1, 0));
  };

  const renderDetailsStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field">
        <span>Title</span>
        <input value={form.title} onChange={e => update({ title: e.target.value })} placeholder="Event title" />
      </label>
      <div className="emc-wizard__field">
        <span>Event type</span>
        <div className="emc-wizard__radio-group">
          {TYPE_OPTIONS.map(opt => (
            <label key={opt.value} className="emc-wizard__radio">
              <input
                type="radio"
                name="event-type"
                checked={form.type === opt.value}
                onChange={() => update({ type: opt.value })}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
        <span>All-day</span>
      </label>
      <label className="emc-wizard__field">
        <span>{form.allDay ? 'Date' : 'Date'}</span>
        <input type="date" value={form.date} onChange={e => update({ date: e.target.value })} />
      </label>
      {form.allDay ? (
        <label className="emc-wizard__field">
          <span>End date (optional, for multi-day)</span>
          <input type="date" value={form.endDate} onChange={e => update({ endDate: e.target.value })} />
        </label>
      ) : (
        <div className="emc-wizard__field-row">
          <label className="emc-wizard__field">
            <span>Start time</span>
            <input type="time" value={form.start} onChange={e => update({ start: e.target.value })} />
          </label>
          <label className="emc-wizard__field">
            <span>End time</span>
            <input type="time" value={form.end} onChange={e => update({ end: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="emc-modal-overlay" onClick={onClose}>
      <div className="emc-modal emc-wizard" role="dialog" aria-modal="true" aria-label="New event" onClick={e => e.stopPropagation()}>
        <header className="emc-modal__header">
          <h3 className="emc-modal__title">New Event</h3>
          <button type="button" className="emc-modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="emc-wizard__steps">
          {STEPS.map((label, i) => (
            <span key={label} className={`emc-wizard__step${i === step ? ' emc-wizard__step--active' : ''}${i < step ? ' emc-wizard__step--done' : ''}`}>
              {label}
            </span>
          ))}
        </div>

        {step === 0 && renderDetailsStep()}
        {step === 1 && renderScheduleStep()}

        {stepError && <p className="emc-wizard__error">{stepError}</p>}

        <div className="emc-modal__actions">
          {step > 0 && (
            <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={goBack}>
              Back
            </button>
          )}
          <button type="button" className="era-btn emc-modal__action" onClick={goNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors (component isn't wired into the tree yet, so it just needs to compile standalone — TypeScript checks unused-but-valid files as part of the project compile).

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): add NewEventWizard shell with Details and Schedule steps"
```

---

### Task 4: More info & Reminders/Repeat steps

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `MOCK_ATTENDEES` from `new-event-wizard.utils.ts` (Task 2).
- Produces: `renderMoreInfoStep`, `renderRemindersStep` render functions, wired into the `step === 2` / `step === 3` branches — consumed visually by Task 5's Review step (reads the same `form` state).

- [ ] **Step 1: Add the import and two more render functions**

In `NewEventWizard.tsx`, update the import line to also bring in `MOCK_ATTENDEES`:

```tsx
import {
  EMPTY_NEW_EVENT_FORM,
  MOCK_ATTENDEES,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
```

Add these two functions directly above `return (` in the component body:

```tsx
  const toggleAttendee = (name: string) => {
    setForm(f => ({
      ...f,
      attendees: f.attendees.includes(name)
        ? f.attendees.filter(a => a !== name)
        : [...f.attendees, name],
    }));
  };

  const renderMoreInfoStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field">
        <span>Location</span>
        <input value={form.location} onChange={e => update({ location: e.target.value })} placeholder="Optional" />
      </label>
      <label className="emc-wizard__field">
        <span>Notes</span>
        <textarea value={form.notes} onChange={e => update({ notes: e.target.value })} placeholder="Optional" rows={3} />
      </label>
      {form.type === 'meeting' && (
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
    </div>
  );

  const renderRemindersStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field">
        <span>Reminder</span>
        <select
          value={form.reminderMinutesBefore}
          onChange={e => update({ reminderMinutesBefore: Number(e.target.value) })}
        >
          <option value={0}>None</option>
          <option value={10}>10 minutes before</option>
          <option value={60}>1 hour before</option>
          <option value={1440}>1 day before</option>
        </select>
      </label>
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.recurring} onChange={e => update({ recurring: e.target.checked })} />
        <span>Recurring</span>
      </label>
      {form.recurring && (
        <div className="emc-wizard__field-row">
          <label className="emc-wizard__field">
            <span>Frequency</span>
            <select value={form.frequency} onChange={e => update({ frequency: e.target.value as NewEventFormState['frequency'] })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="emc-wizard__field">
            <span>Occurrences</span>
            <input
              type="number"
              min={1}
              max={12}
              value={form.occurrences}
              onChange={e => update({ occurrences: Math.min(12, Math.max(1, Number(e.target.value))) })}
            />
          </label>
        </div>
      )}
    </div>
  );
```

- [ ] **Step 2: Render the new steps**

Update the step-render block to include steps 2 and 3:

```tsx
        {step === 0 && renderDetailsStep()}
        {step === 1 && renderScheduleStep()}
        {step === 2 && renderMoreInfoStep()}
        {step === 3 && renderRemindersStep()}
```

Also extend `validateStep` to cover step 2 (attendees required for meetings) and step 3 (occurrence bounds):

```tsx
  const validateStep = (): string | null => {
    if (step === 0 && !form.title.trim()) return 'Title is required.';
    if (step === 1) {
      if (!form.date) return 'Date is required.';
      if (!form.allDay && form.end <= form.start) return 'End time must be after start time.';
    }
    if (step === 2 && form.type === 'meeting' && form.attendees.length === 0) {
      return 'Select at least one attendee.';
    }
    if (step === 3 && form.recurring && (form.occurrences < 1 || form.occurrences > 12)) {
      return 'Occurrences must be between 1 and 12.';
    }
    return null;
  };
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): add More info and Reminders/Repeat steps to NewEventWizard"
```

---

### Task 5: Review step, conflict screen, and create handler

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `findConflicts`, `buildEventsFromForm` from `new-event-wizard.utils.ts` (Task 2); `onCreate` prop (Task 3).
- Produces: completes the `NewEventWizard` component — this is the final piece other tasks need; no further internal interfaces are exposed beyond the existing `NewEventWizardProps`.

- [ ] **Step 1: Add conflict state and the review/conflict render functions**

Update the import to add the two new utils:

```tsx
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  MOCK_ATTENDEES,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
import type { CalendarEvent } from '../../types/employee-calendar.types';
```

Add state right after the existing `useState` calls:

```tsx
  const [conflicts, setConflicts] = useState<CalendarEvent[] | null>(null);
```

Add these handlers and render functions above `return (`:

```tsx
  const finalizeCreate = () => {
    onCreate(buildEventsFromForm(form));
    onClose();
  };

  const handleCreateClick = () => {
    const found = findConflicts(form, existingMyEvents);
    if (found.length > 0) {
      setConflicts(found);
      return;
    }
    finalizeCreate();
  };

  const handleReschedule = () => {
    setConflicts(null);
    setStep(1);
  };

  const handleConfirmAnyway = () => {
    setConflicts(null);
    finalizeCreate();
  };

  const renderConflictStep = () => (
    <div className="emc-wizard__body">
      <p className="emc-wizard__conflict-intro">This clashes with:</p>
      <ul className="emc-wizard__conflict-list">
        {(conflicts ?? []).map(ev => (
          <li key={ev.id} className="emc-wizard__conflict-item">
            <span className={`emc-filterpanel__swatch emc-evpill--${ev.type}`} />
            {ev.title}
            {ev.allDay ? ' · All day' : ev.start ? ` · ${ev.start}${ev.end ? `–${ev.end}` : ''}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderReviewStep = () => (
    <div className="emc-wizard__body">
      <div className="emc-wizard__review-row"><span>Title</span><strong>{form.title}</strong></div>
      <div className="emc-wizard__review-row"><span>Type</span><strong>{TYPE_OPTIONS.find(o => o.value === form.type)?.label}</strong></div>
      <div className="emc-wizard__review-row">
        <span>When</span>
        <strong>
          {form.date}{form.allDay ? (form.endDate && form.endDate > form.date ? ` – ${form.endDate}` : ' · All day') : ` · ${form.start}–${form.end}`}
        </strong>
      </div>
      {form.location && <div className="emc-wizard__review-row"><span>Location</span><strong>{form.location}</strong></div>}
      {form.type === 'meeting' && form.attendees.length > 0 && (
        <div className="emc-wizard__review-row"><span>Attendees</span><strong>{form.attendees.join(', ')}</strong></div>
      )}
      {form.recurring && (
        <div className="emc-wizard__review-row"><span>Repeats</span><strong>{form.frequency}, {form.occurrences}x</strong></div>
      )}
    </div>
  );
```

- [ ] **Step 2: Wire the conflict/review steps and footer buttons**

Replace the step-render block with:

```tsx
        {conflicts ? renderConflictStep() : (
          <>
            {step === 0 && renderDetailsStep()}
            {step === 1 && renderScheduleStep()}
            {step === 2 && renderMoreInfoStep()}
            {step === 3 && renderRemindersStep()}
            {step === 4 && renderReviewStep()}
          </>
        )}
```

Replace the footer `<div className="emc-modal__actions">...</div>` block with:

```tsx
        <div className="emc-modal__actions">
          {conflicts ? (
            <>
              <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={handleReschedule}>
                Reschedule
              </button>
              <button type="button" className="era-btn emc-modal__action" onClick={handleConfirmAnyway}>
                Confirm anyway
              </button>
            </>
          ) : (
            <>
              {step > 0 && (
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={goBack}>
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="era-btn emc-modal__action" onClick={goNext}>
                  Next
                </button>
              ) : (
                <button type="button" className="era-btn emc-modal__action" onClick={handleCreateClick}>
                  Create Event
                </button>
              )}
            </>
          )}
        </div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): add Review step, conflict detection screen, and create handler to NewEventWizard"
```

---

### Task 6: Wire NewEventWizard into MyCalendarTab

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `NewEventWizard` component from Task 5 (`{ onClose, onCreate, existingMyEvents }`).

- [ ] **Step 1: Import the wizard**

In `my-calendar-tab.tsx`, add to the imports near the top (after the `CalendarFilterPanel` import):

```tsx
import { NewEventWizard } from './NewEventWizard';
```

- [ ] **Step 2: Add state and a create handler**

Near the other modal state declarations (next to `const [settingsOpen, setSettingsOpen] = useState(false);`), add:

```tsx
  const [newEventOpen, setNewEventOpen] = useState(false);
  const handleCreateEvents = (events: CalendarEvent[]) => {
    setLocalEvents(prev => [...prev, ...events]);
  };
```

- [ ] **Step 3: Wire the button**

Find the existing "New Event" button:

```tsx
          <button type="button" className="era-btn era-btn--ghost emc-header__btn">
            <Plus size={13} />
            New Event
          </button>
```

Replace with:

```tsx
          <button type="button" className="era-btn era-btn--ghost emc-header__btn" onClick={() => setNewEventOpen(true)}>
            <Plus size={13} />
            New Event
          </button>
```

- [ ] **Step 4: Render the wizard**

Add this block right after the `{settingsOpen && (...)}` block, before the closing `</div>` of `emc-root`:

```tsx
      {newEventOpen && (
        <NewEventWizard
          onClose={() => setNewEventOpen(false)}
          onCreate={handleCreateEvents}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
        />
      )}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run `npm run dev`, open My Calendar tab, click "New Event". Walk through all 5 steps for a Leave event dated a few days out with no conflicts, click "Create Event", confirm the modal closes and the new Leave pill appears on the correct date in Month view.

- [ ] **Step 7: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): wire New Event button to NewEventWizard"
```

---

### Task 7: RSVP badges and manager approval in EventDetailsModal

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`

**Interfaces:**
- Consumes: `event.attendeeRsvp`, `event.status` (`'pending'` / `'rejected'`) from `CalendarEvent` (Task 1).
- Produces: modal now calls `onSave` with an updated `status` when Approve/Reject is clicked — reuses the existing `onSave: (updated: CalendarEvent) => void` prop, no signature change.

- [ ] **Step 1: Add RSVP badge rendering**

In `EventDetailsModal.tsx`, after the existing attendees row (the block starting `{event.attendees && event.attendees.length > 0 && (`), add a new block right after it (still inside the `!editing` branch, before `<div className="emc-modal__actions">`):

```tsx
            {event.attendeeRsvp && (
              <div className="emc-modal__rsvp-list">
                {Object.entries(event.attendeeRsvp).map(([name, rsvp]) => (
                  <span key={name} className={`emc-rsvp-badge emc-rsvp-badge--${rsvp}`}>
                    {name} · {rsvp}
                  </span>
                ))}
              </div>
            )}

            {event.status === 'pending' && event.source === 'company' && (
              <div className="emc-modal__approval">
                <p className="emc-modal__approval-label">Manager review (demo)</p>
                <div className="emc-modal__approval-actions">
                  <button
                    type="button"
                    className="era-btn emc-modal__action"
                    onClick={() => onSave({ ...event, status: 'confirmed' })}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="era-btn emc-modal__action emc-modal__action--danger"
                    onClick={() => onSave({ ...event, status: 'rejected' })}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {event.status === 'rejected' && (
              <p className="emc-modal__rejected-note">Rejected by manager.</p>
            )}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx
git commit -m "feat(calendar): show RSVP badges and manager approve/reject controls in event details modal"
```

---

### Task 8: Styling for wizard, RSVP badges, and pending/rejected pills

**Files:**
- Modify: `src/styles/employee-my-calendar.css`

- [ ] **Step 1: Add wizard styles**

Append to the end of the file:

```css
/* ── New Event Wizard ───────────────────────────────────────────────────── */

.emc-wizard {
  width: 420px;
}

.emc-wizard__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0 1rem;
  margin-top: 0.5rem;
}

.emc-wizard__step {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--nexus-text-muted);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-muted);
}

.emc-wizard__step--active {
  color: #fff;
  background: var(--accent);
}

.emc-wizard__step--done {
  color: var(--accent);
  background: var(--accent-bg, color-mix(in srgb, var(--accent) 10%, transparent));
}

.emc-wizard__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.emc-wizard__field {
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  font-size: 0.75rem;
  color: var(--nexus-text-muted);
}

.emc-wizard__field input,
.emc-wizard__field select,
.emc-wizard__field textarea {
  padding: 0.4375rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-muted);
  font-size: 0.8125rem;
  font-family: var(--sans);
  color: var(--text-h);
  outline: none;
  resize: vertical;
}

.emc-wizard__field--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.emc-wizard__field-row {
  display: flex;
  gap: 0.625rem;
}

.emc-wizard__field-row .emc-wizard__field {
  flex: 1;
}

.emc-wizard__radio-group,
.emc-wizard__attendees {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

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

.emc-wizard__error {
  margin: 0;
  padding: 0 1rem;
  font-size: 0.75rem;
  color: #dc2626;
}

.emc-wizard__conflict-intro {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-h);
  font-weight: 500;
}

.emc-wizard__conflict-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emc-wizard__conflict-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-h);
}

.emc-wizard__review-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: var(--nexus-text-muted);
}

.emc-wizard__review-row strong {
  color: var(--text-h);
  font-weight: 600;
  text-align: right;
}

/* ── RSVP badges & manager approval ──────────────────────────────────────── */

.emc-modal__rsvp-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.emc-rsvp-badge {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
}

.emc-rsvp-badge--pending {
  color: var(--nexus-text-muted);
  background: var(--surface-muted);
}

.emc-rsvp-badge--accepted {
  color: var(--success, #047857);
  background: color-mix(in srgb, var(--success, #10b981) 12%, transparent);
}

.emc-rsvp-badge--declined {
  color: #dc2626;
  background: color-mix(in srgb, #dc2626 10%, transparent);
}

.emc-rsvp-badge--tentative {
  color: var(--nexus-warning, #b45309);
  background: color-mix(in srgb, var(--nexus-warning, #f59e0b) 12%, transparent);
}

.emc-modal__approval {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.625rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.emc-modal__approval-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--nexus-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.emc-modal__approval-actions {
  display: flex;
  gap: 0.5rem;
}

.emc-modal__rejected-note {
  margin: 0;
  font-size: 0.78rem;
  color: #dc2626;
}

/* Pending / rejected event pills */
.emc-month__evpill.emc-evpill--pending-status,
.emc-week__evpill.emc-evpill--pending-status,
.emc-week__ev.emc-evpill--pending-status,
.emc-day__ev.emc-evpill--pending-status {
  border-style: dashed;
  opacity: 0.75;
}

.emc-evpill--rejected-status {
  --ev-color: #dc2626;
  --ev-bg: color-mix(in srgb, #dc2626 10%, transparent);
  border-style: dashed;
}
```

- [ ] **Step 2: Apply the pending/rejected pill classes**

In `my-calendar-tab.tsx`, every place an event pill className is built from `emc-evpill--${ev.type}` needs an extra status modifier. There are 4 such spots (month, week all-day, week timed, day timed, day all-day, agenda — 6 total). Update each by appending the status class. For example, the Month view pill (currently):

```tsx
                      className={`emc-month__evpill emc-evpill--${ev.type}`}
```

becomes:

```tsx
                      className={`emc-month__evpill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}`}
```

Apply the same `${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}` suffix to the className expressions in `renderWeek` (the all-day pill and the timed `emc-week__ev`), `renderDay` (the all-day pill and the timed `emc-day__ev`), and `renderAgenda` (the `emc-agenda__icon` div's className).

- [ ] **Step 3: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run `npm run dev`. Create a Company event via the wizard — confirm it renders with a dashed/muted pill in Month view. Open it, click Reject — confirm it switches to the red dashed style and the modal shows "Rejected by manager." Create another Company event and click Approve — confirm it becomes a normal solid pill.

- [ ] **Step 5: Commit**

```bash
git add src/styles/employee-my-calendar.css src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "style(calendar): add wizard, RSVP badge, and pending/rejected pill styles"
```

---

### Task 9: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`, open the My Calendar tab in the browser.

- [ ] **Step 2: Verify Leave creation**

Click New Event → Title "Test Leave" → type Leave → all-day, pick a date with no existing events → skip optional fields → Create Event. Confirm: event appears immediately as a solid green pill, status confirmed (open it — no approval section, no RSVP badges).

- [ ] **Step 3: Verify Meeting + RSVP badges**

Click New Event → Title "Test Meeting" → type Meeting → not all-day, pick date/time with no conflicts → in More info, select 2 attendees → Create Event. Open the event: confirm both attendees show as "· pending" badges.

- [ ] **Step 4: Verify Company event + approval**

Click New Event → Title "Test Company Event" → type Company event → all-day → Create Event. Confirm the pill renders dashed/muted. Open it, click Approve — confirm it becomes solid/confirmed. Create a second Company event and click Reject instead — confirm it turns red/dashed and shows "Rejected by manager."

- [ ] **Step 5: Verify conflict detection**

Click New Event → Title "Conflict Test" → type Meeting → not all-day → date `2026-06-17`, start `09:30`, end `10:00` (overlaps the existing "Morning Shift" 09:00–17:00 mock event) → fill remaining steps → Create Event. Confirm the Conflict screen appears listing "Morning Shift". Click "Reschedule" — confirm it returns to the Schedule step. Change the time to something non-conflicting, proceed to Review, Create Event again — confirm it's created. Repeat the scenario once more and use "Confirm anyway" instead — confirm the event is created despite the conflict.

- [ ] **Step 6: Verify recurring expansion**

Click New Event → Title "Recurring Test" → type Leave → all-day, pick a future date → in Reminders & repeat, enable Recurring, frequency Weekly, occurrences 4 → Create Event. Confirm 4 separate Leave pills appear on the correct weekly-spaced dates in Month view (navigate months forward if needed).

- [ ] **Step 7: Final check**

Run: `npx tsc -b --noEmit` and `npm run lint`. Both should pass with no new errors introduced by this feature.
