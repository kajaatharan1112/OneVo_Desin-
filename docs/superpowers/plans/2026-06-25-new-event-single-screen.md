# New Event Single-Screen Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing 5-step "New Event" wizard in the My Calendar module with a single-screen form in one popup, so users no longer lose context moving between wizard steps.

**Architecture:** `NewEventWizard.tsx` keeps its component name, file name, and `NewEventWizardProps` (`onClose`, `onCreate`, `existingMyEvents`) — only its internals change. The `step`/`STEPS`/`goNext`/`goBack`/per-step `validateStep` machinery is removed. The four step-render functions become four always-rendered sections in one body. Validation moves to a single `validateForm()` run when "Create Event" is clicked, collecting all errors at once. Conflict detection and the conflict-warning screen behavior are unchanged — they still swap the popup body on clash. No changes to `new-event-wizard.utils.ts`, `employee-calendar.types.ts`, `EventDetailsModal.tsx`, or `my-calendar-tab.tsx` (the wizard's external props contract doesn't change).

**Tech Stack:** React 19 + TypeScript, Vite. No test framework or test runner is configured in this repo (`package.json` has no jest/vitest/RTL). Verification for every task in this plan is: (1) `npx tsc -b --noEmit` type-check, and (2) manual check in the browser via `npm run dev`. Do not invent a fake test command.

## Global Constraints

- Component stays named `NewEventWizard` in file `NewEventWizard.tsx` — no rename, since `my-calendar-tab.tsx` already imports it and the props contract is unchanged. (Per spec's "Component Changes" section, rename is optional/deferred.)
- Reuse `new-event-wizard.utils.ts` unchanged: `buildEventsFromForm`, `findConflicts`, `EMPTY_NEW_EVENT_FORM`, `MOCK_ATTENDEES`, `NewEventFormState`, `NewEventType`.
- Validate on submit only — collect all current errors into a list, not a single blocking message.
- Conflict screen still fully replaces the form body in the same popup (per spec's "Conflict Detection" section).
- Sections are always rendered; only individual fields within a section (Attendees, Recurrence sub-fields) are conditionally shown, matching today's per-type/per-toggle conditionals.

---

### Task 1: Rewrite NewEventWizard.tsx as a single-screen sectioned form

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx` (full rewrite of the component body; imports and `TYPE_OPTIONS` constant are reused)

**Interfaces:**
- Consumes: `buildEventsFromForm`, `EMPTY_NEW_EVENT_FORM`, `findConflicts`, `MOCK_ATTENDEES`, `NewEventFormState`, `NewEventType` from `./new-event-wizard.utils` (unchanged); `CalendarEvent` from `../../types/employee-calendar.types` (unchanged).
- Produces: `NewEventWizard` component, same props signature as before — `{ onClose: () => void; onCreate: (events: CalendarEvent[]) => void; existingMyEvents: CalendarEvent[] }`. No other file needs to change as a result of this task.

- [ ] **Step 1: Replace the full file contents**

Replace the entire contents of `src/features/employees/components/my-calendar/NewEventWizard.tsx` with:

```tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CalendarEvent } from '../../types/employee-calendar.types';
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  MOCK_ATTENDEES,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';

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
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<CalendarEvent[] | null>(null);

  const update = (patch: Partial<NewEventFormState>) => setForm(f => ({ ...f, ...patch }));

  const toggleAttendee = (name: string) => {
    setForm(f => ({
      ...f,
      attendees: f.attendees.includes(name)
        ? f.attendees.filter(a => a !== name)
        : [...f.attendees, name],
    }));
  };

  const validateForm = (): string[] => {
    const found: string[] = [];
    if (!form.title.trim()) found.push('Title is required.');
    if (!form.date) found.push('Date is required.');
    if (!form.allDay && form.end <= form.start) found.push('End time must be after start time.');
    if (form.type === 'meeting' && form.attendees.length === 0) found.push('Select at least one attendee.');
    if (form.recurring && (form.occurrences < 1 || form.occurrences > 12)) {
      found.push('Occurrences must be between 1 and 12.');
    }
    return found;
  };

  const finalizeCreate = () => {
    onCreate(buildEventsFromForm(form));
    onClose();
  };

  const handleCreateClick = () => {
    const found = validateForm();
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    setErrors([]);
    const clashes = findConflicts(form, existingMyEvents);
    if (clashes.length > 0) {
      setConflicts(clashes);
      return;
    }
    finalizeCreate();
  };

  const handleReschedule = () => setConflicts(null);
  const handleConfirmAnyway = () => {
    setConflicts(null);
    finalizeCreate();
  };

  const renderTitleTypeSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Title &amp; type</h4>
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

  const renderScheduleSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Schedule</h4>
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
        <span>All-day</span>
      </label>
      <label className="emc-wizard__field">
        <span>Date</span>
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

  const renderDetailsSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Details</h4>
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

  const renderRemindersSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Reminders &amp; repeat</h4>
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

  const renderConflictSection = () => (
    <div className="emc-wizard__section">
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

  return (
    <div className="emc-modal-overlay" onClick={onClose}>
      <div className="emc-modal emc-wizard" role="dialog" aria-modal="true" aria-label="New event" onClick={e => e.stopPropagation()}>
        <header className="emc-modal__header">
          <h3 className="emc-modal__title">New Event</h3>
          <button type="button" className="emc-modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="emc-wizard__body">
          {conflicts ? renderConflictSection() : (
            <>
              {renderTitleTypeSection()}
              {renderScheduleSection()}
              {renderDetailsSection()}
              {renderRemindersSection()}
            </>
          )}
        </div>

        {errors.length > 0 && (
          <ul className="emc-wizard__error-list">
            {errors.map(err => <li key={err}>{err}</li>)}
          </ul>
        )}

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
            <button type="button" className="era-btn emc-modal__action" onClick={handleCreateClick}>
              Create Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "refactor(calendar): collapse New Event wizard into a single-screen form"
```

---

### Task 2: Update styles for the single-screen layout

**Files:**
- Modify: `src/styles/employee-my-calendar.css:1362-1497` (the `/* ── New Event Wizard ── */` block)

**Interfaces:**
- Consumes: class names introduced in Task 1: `emc-wizard__section`, `emc-wizard__section-title`, `emc-wizard__error-list` (new); `emc-wizard__body`, `emc-wizard__field`, `emc-wizard__field--checkbox`, `emc-wizard__field-row`, `emc-wizard__radio-group`, `emc-wizard__radio`, `emc-wizard__attendees`, `emc-wizard__conflict-intro`, `emc-wizard__conflict-list`, `emc-wizard__conflict-item` (unchanged, reused).
- Removes: `emc-wizard__steps`, `emc-wizard__step`, `emc-wizard__step--active`, `emc-wizard__step--done`, `emc-wizard__error` (single-message variant), `emc-wizard__review-row`, `emc-wizard__review-row strong` — no longer referenced after Task 1.

- [ ] **Step 1: Replace the wizard CSS block**

In `src/styles/employee-my-calendar.css`, find the block starting at the `/* ── New Event Wizard ───── */` comment (currently lines 1362–1497, ending right before the `/* ── RSVP badges & manager approval ── */` comment) and replace it with:

```css
/* ── New Event Form ─────────────────────────────────────────────────────── */

.emc-wizard {
  width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.emc-wizard__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  overflow-y: auto;
}

.emc-wizard__section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.emc-wizard__section-title {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--nexus-text-muted);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.375rem;
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

.emc-wizard__error-list {
  margin: 0;
  padding: 0 1rem;
  list-style: disc;
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
```

- [ ] **Step 2: Manual visual check**

Run `npm run dev`, open My Calendar tab, click "New Event". Confirm: one popup with four labeled sections stacked vertically (Title & type, Schedule, Details, Reminders & repeat), no step pills at the top, single "Create Event" button in the footer.

- [ ] **Step 3: Commit**

```bash
git add src/styles/employee-my-calendar.css
git commit -m "style(calendar): restyle New Event popup as a single sectioned form"
```

---

### Task 3: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`, open the My Calendar tab in the browser.

- [ ] **Step 2: Verify empty-submit shows all errors at once**

Click "New Event", immediately click "Create Event" without filling anything. Confirm the error list shows both "Title is required." and "Date is required." together (not one at a time).

- [ ] **Step 3: Verify Leave creation**

Fill Title "Test Leave", type Leave, all-day, pick a date with no existing events, leave the rest blank, click "Create Event". Confirm the popup closes and a solid green pill appears on that date in Month view.

- [ ] **Step 4: Verify Meeting attendee validation and RSVP badges**

Click "New Event", fill Title "Test Meeting", type Meeting, pick a date/time with no conflicts, leave Attendees empty, click "Create Event" — confirm "Select at least one attendee." appears. Select 2 attendees, click "Create Event" again — confirm it creates successfully. Open the event and confirm both attendees show "· pending" badges.

- [ ] **Step 5: Verify conflict detection still works**

Click "New Event", fill Title "Conflict Test", type Meeting, not all-day, date `2026-06-17`, start `09:30`, end `10:00` (overlaps the existing "Morning Shift" 09:00–17:00 mock event), select an attendee, click "Create Event". Confirm the popup body swaps to the conflict list showing "Morning Shift". Click "Reschedule" — confirm the form reappears with all previously entered values intact (title, type, attendee still set). Click "Create Event" again, then click "Confirm anyway" this time — confirm the event is created.

- [ ] **Step 6: Verify recurring expansion**

Click "New Event", fill Title "Recurring Test", type Leave, all-day, pick a future date, enable Recurring with Weekly frequency and 4 occurrences, click "Create Event". Confirm 4 separate Leave pills appear on the correct weekly-spaced dates in Month view (navigate months forward if needed).

- [ ] **Step 7: Final check**

Run: `npx tsc -b --noEmit` and `npm run lint`. Both should pass with no new errors introduced by this change.
