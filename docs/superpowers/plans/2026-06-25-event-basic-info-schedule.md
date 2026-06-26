# Event Basic Info + Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the New Event form's Basic Info and Schedule sections (6 creatable types, Category, Priority), widen conflict detection to include holidays, and add a jump-nav sidebar to the popup — the first sub-project of the larger calendar enhancement.

**Architecture:** Extend the existing `CalendarEventType` union with `'training' | 'out-of-office' | 'company-event'` (the wizard's old "Company event" option, which created type `'holiday'`, is replaced by the new dedicated `company-event` type for the approval-required flow). `holiday` itself also becomes directly creatable from the wizard again — as a plain, immediately-confirmed entry (no approval, no attendees) representing an admin-created/overridden public holiday. This prototype has no login/role system wired into My Calendar, so there's no real admin-only gating — the option is simply present in the type list, consistent with the rest of this no-backend prototype. Add `CalendarEventCategory`/`CalendarEventPriority` types and `category?`/`priority?` fields to `CalendarEvent`. `new-event-wizard.utils.ts` grows its `NewEventType`/`TYPE_META`/`CONFLICT_TYPES`/`buildEventsFromForm` to match. `NewEventWizard.tsx` gets the new Basic Info fields and a jump-nav sidebar (click a section name, scroll to it — no gating, consistent with the existing single-screen form). `my-calendar-tab.tsx`, `EventDetailsModal.tsx`, and `CalendarFilterPanel.tsx` get small additions so the new types render, label, and filter correctly everywhere `CalendarEventType` is already switched on. CSS gains pill/rail-dot colors for the 3 brand-new types plus sidebar layout styles.

**Tech Stack:** React 19 + TypeScript, Vite. No test framework configured in this repo. Verification for every task is: (1) `npx tsc -b --noEmit`, and (2) manual check via `npm run dev`. Do not invent a fake test command.

## Global Constraints

- `holiday` is creatable from the wizard (admin-created/overridden public holiday) — `confirmed` immediately, no approval, no attendees. No real role/permission check gates this in the prototype.
- New creatable types: Training, Out Of Office, and Holiday join Leave/Meeting/Company Event (6 total, was 3).
- Attendees are required for Meeting **and** Training; not for Leave, Out Of Office, Company Event, or Holiday.
- Category (7 fixed values) and Priority (Low/Medium/High/Critical, default Medium) are both optional except Priority always has a value (defaults to Medium, never blank).
- Conflict detection checks `meeting`, `holiday`, `shift`, `leave` (added `holiday`); leave conflicts count regardless of status (unchanged). Still warning-only.
- No advanced recurrence, no multi-day timed events, no Audience/Collaboration/Business-Context/Approval sections — all explicitly out of scope for this sub-project.
- Jump-nav sidebar lists today's 4 sections (Basic Info, Schedule, Details, Reminders & Repeat); later sub-projects append to this list.

---

### Task 1: Data model changes

**Files:**
- Modify: `src/features/employees/types/employee-calendar.types.ts`

**Interfaces:**
- Produces: `CalendarEventType` now includes `'training' | 'out-of-office' | 'company-event'`; new `CalendarEventCategory`, `CalendarEventPriority` types; `CalendarEvent` gains optional `category?: CalendarEventCategory` and `priority?: CalendarEventPriority`. Consumed by every task below.

- [ ] **Step 1: Edit the type definitions**

Replace line 2 and the `CalendarEvent` interface in `src/features/employees/types/employee-calendar.types.ts`:

```ts
export type CalendarEventType = 'meeting' | 'holiday' | 'leave' | 'shift' | 'reminder' | 'training' | 'out-of-office' | 'company-event';
```

```ts
export type CalendarEventCategory = 'hr' | 'project' | 'training' | 'review' | 'client' | 'compliance' | 'management';
export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'critical';
```

(Add the two lines above directly after the `CalendarEventType` line.)

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
  category?: CalendarEventCategory;
  priority?: CalendarEventPriority;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -b --noEmit`
Expected: new errors in `EventDetailsModal.tsx` and `CalendarFilterPanel.tsx` (they switch on `CalendarEventType` without covering the new values) — these are fixed in Task 5. `my-calendar-tab.tsx`'s `AGENDA_TYPE_ICON` will also error for the same reason, also fixed in Task 5. No other new errors expected.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/types/employee-calendar.types.ts
git commit -m "feat(calendar): add training/out-of-office/company-event types and category/priority fields"
```

---

### Task 2: Wizard form state and utils

**Files:**
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`

**Interfaces:**
- Consumes: `CalendarEventCategory`, `CalendarEventPriority` from `../../types/employee-calendar.types` (Task 1).
- Produces: `NewEventType` now 5 values; `NewEventFormState` gains `category: CalendarEventCategory | ''` and `priority: CalendarEventPriority`; `EMPTY_NEW_EVENT_FORM` defaults `category: ''`, `priority: 'medium'`. `findConflicts` now checks `holiday` too. `buildEventsFromForm` sets `category`/`priority` on created events and grants RSVP to Training the same way as Meeting. Consumed by `NewEventWizard.tsx` (Task 3).

- [ ] **Step 1: Update imports and `NewEventType`**

In `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`, replace the import block and `NewEventType`:

```ts
import type {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventSource,
  CalendarEventCategory,
  CalendarEventPriority,
} from '../../types/employee-calendar.types';

export type NewEventType = 'leave' | 'meeting' | 'company-event' | 'training' | 'out-of-office' | 'holiday';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
```

- [ ] **Step 2: Update `NewEventFormState` and `EMPTY_NEW_EVENT_FORM`**

Replace the `NewEventFormState` interface and `EMPTY_NEW_EVENT_FORM` constant:

```ts
export interface NewEventFormState {
  title: string;
  type: NewEventType;
  category: CalendarEventCategory | '';
  priority: CalendarEventPriority;
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
  category: '',
  priority: 'medium',
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
```

- [ ] **Step 3: Widen conflict detection**

Replace the `CONFLICT_TYPES` line:

```ts
const CONFLICT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday'];
```

- [ ] **Step 4: Update `TYPE_META` and `buildEventsFromForm`**

Replace the `TYPE_META` constant and `buildEventsFromForm` function (everything from `const TYPE_META` to the end of the file):

```ts
const TYPE_META: Record<NewEventType, { calendarType: CalendarEventType; source: CalendarEventSource }> = {
  leave: { calendarType: 'leave', source: 'leave' },
  'out-of-office': { calendarType: 'out-of-office', source: 'personal' },
  meeting: { calendarType: 'meeting', source: 'personal' },
  training: { calendarType: 'training', source: 'personal' },
  'company-event': { calendarType: 'company-event', source: 'company' },
  holiday: { calendarType: 'holiday', source: 'company' },
};

export function buildEventsFromForm(form: NewEventFormState): CalendarEvent[] {
  const dates = buildOccurrenceDates(form);
  const ts = Date.now();
  const { calendarType, source } = TYPE_META[form.type];
  const status: CalendarEventStatus = form.type === 'company-event' ? 'pending' : 'confirmed';
  const needsAttendees = form.type === 'meeting' || form.type === 'training';

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
      priority: form.priority,
    };

    if (form.category) event.category = form.category;
    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
    if (!form.allDay) {
      event.start = form.start;
      event.end = form.end;
    }
    if (needsAttendees && form.attendees.length > 0) {
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

- [ ] **Step 5: Type-check**

Run: `npx tsc -b --noEmit`
Expected: same pre-existing set of errors as Task 1's Step 2 (not yet fixed — that's Task 3/5), no new errors from this file.

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts
git commit -m "feat(calendar): widen New Event form state, conflict types, and creation rules to 6 types"
```

---

### Task 3: Basic Info fields, Training attendees, and validation

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `NewEventType`, `NewEventFormState` from `./new-event-wizard.utils` (Task 2); `CalendarEventCategory`, `CalendarEventPriority` from `../../types/employee-calendar.types` (Task 1).
- Produces: updated `TYPE_OPTIONS` (6 entries), new `CATEGORY_OPTIONS`/`PRIORITY_OPTIONS` constants, extended `renderTitleTypeSection`, `renderDetailsSection`, and `validateForm` — consumed visually by Task 4 (sidebar wraps these same sections).

- [ ] **Step 1: Update imports and option constants**

In `src/features/employees/components/my-calendar/NewEventWizard.tsx`, replace the top of the file through `TYPE_OPTIONS`:

```tsx
import React, { useState } from 'react';
import { Bell, CalendarClock, FileText, Tag, X } from 'lucide-react';
import type { CalendarEvent, CalendarEventCategory, CalendarEventPriority } from '../../types/employee-calendar.types';
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
  { value: 'company-event', label: 'Company event' },
  { value: 'training', label: 'Training' },
  { value: 'out-of-office', label: 'Out of office' },
  { value: 'holiday', label: 'Holiday' },
];

const CATEGORY_OPTIONS: { value: CalendarEventCategory; label: string }[] = [
  { value: 'hr', label: 'HR' },
  { value: 'project', label: 'Project' },
  { value: 'training', label: 'Training' },
  { value: 'review', label: 'Review' },
  { value: 'client', label: 'Client' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'management', label: 'Management' },
];

const PRIORITY_OPTIONS: { value: CalendarEventPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];
```

- [ ] **Step 2: Extend `validateForm`**

Replace the `validateForm` function:

```tsx
  const validateForm = (): string[] => {
    const found: string[] = [];
    if (!form.title.trim()) found.push('Title is required.');
    if (!form.date) found.push('Date is required.');
    if (!form.allDay && form.end <= form.start) found.push('End time must be after start time.');
    if ((form.type === 'meeting' || form.type === 'training') && form.attendees.length === 0) {
      found.push('Select at least one attendee.');
    }
    if (form.recurring && (form.occurrences < 1 || form.occurrences > 12)) {
      found.push('Occurrences must be between 1 and 12.');
    }
    return found;
  };
```

- [ ] **Step 3: Add Category/Priority fields to Basic Info**

Replace `renderTitleTypeSection`:

```tsx
  const renderTitleTypeSection = () => (
    <div className="emc-wizard__section" id="basic-info">
      <h4 className="emc-wizard__section-title"><Tag size={14} /> Basic info</h4>
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
      <div className="emc-wizard__field-row">
        <label className="emc-wizard__field">
          <span>Category</span>
          <select value={form.category} onChange={e => update({ category: e.target.value as NewEventFormState['category'] })}>
            <option value="">None</option>
            {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label className="emc-wizard__field">
          <span>Priority</span>
          <select value={form.priority} onChange={e => update({ priority: e.target.value as NewEventFormState['priority'] })}>
            {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
```

- [ ] **Step 4: Show attendees for Training too, and tag sections with ids**

In `renderScheduleSection`, `renderDetailsSection`, and `renderRemindersSection`, add an `id` attribute to each section's outer `<div className="emc-wizard__section">` and widen the attendees condition. Replace the three functions:

```tsx
  const renderScheduleSection = () => (
    <div className="emc-wizard__section" id="schedule">
      <h4 className="emc-wizard__section-title"><CalendarClock size={14} /> Schedule</h4>
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
        <span>All-day</span>
      </label>
      <label className="emc-wizard__field">
        <span>Start date</span>
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
```

```tsx
  const renderDetailsSection = () => (
    <div className="emc-wizard__section" id="details">
      <h4 className="emc-wizard__section-title"><FileText size={14} /> Details</h4>
      <label className="emc-wizard__field">
        <span>Location</span>
        <input value={form.location} onChange={e => update({ location: e.target.value })} placeholder="Optional" />
      </label>
      <label className="emc-wizard__field">
        <span>Notes</span>
        <textarea value={form.notes} onChange={e => update({ notes: e.target.value })} placeholder="Optional" rows={3} />
      </label>
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
    </div>
  );
```

```tsx
  const renderRemindersSection = () => (
    <div className="emc-wizard__section" id="reminders">
      <h4 className="emc-wizard__section-title"><Bell size={14} /> Reminders &amp; repeat</h4>
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

- [ ] **Step 5: Type-check**

Run: `npx tsc -b --noEmit`
Expected: same pre-existing set of errors as before (Task 5 fixes them), no new errors from this file.

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): add Category/Priority fields and Training attendee support to New Event form"
```

---

### Task 4: Jump-nav sidebar

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: section `id`s added in Task 3 (`basic-info`, `schedule`, `details`, `reminders`).
- Produces: no new exports — purely visual; later sub-projects append their own `{ id, label }` entries to the `NAV_SECTIONS` constant defined here.

- [ ] **Step 1: Add the nav constant and scroll handler**

In `NewEventWizard.tsx`, add this constant right after the `PRIORITY_OPTIONS` constant (from Task 3):

```tsx
const NAV_SECTIONS: { id: string; label: string }[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'details', label: 'Details' },
  { id: 'reminders', label: 'Reminders & Repeat' },
];
```

Add this handler inside the component body, directly above `return (`:

```tsx
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
```

- [ ] **Step 2: Render the sidebar**

Replace the `return (` block's JSX — find:

```tsx
        <div className="emc-wizard__body">
          {conflicts ? renderConflictSection() : (
            <div className="emc-wizard__grid">
              {renderTitleTypeSection()}
              {renderScheduleSection()}
              {renderDetailsSection()}
              {renderRemindersSection()}
            </div>
          )}
        </div>
```

Replace with:

```tsx
        <div className="emc-wizard__layout">
          {!conflicts && (
            <nav className="emc-wizard__nav" aria-label="Form sections">
              {NAV_SECTIONS.map(s => (
                <button key={s.id} type="button" className="emc-wizard__nav-item" onClick={() => scrollToSection(s.id)}>
                  {s.label}
                </button>
              ))}
            </nav>
          )}
          <div className="emc-wizard__body">
            {conflicts ? renderConflictSection() : (
              <div className="emc-wizard__grid">
                {renderTitleTypeSection()}
                {renderScheduleSection()}
                {renderDetailsSection()}
                {renderRemindersSection()}
              </div>
            )}
          </div>
        </div>
```

- [ ] **Step 3: Add sidebar layout CSS**

In `src/styles/employee-my-calendar.css`, find:

```css
.emc-wizard {
  width: 760px;
  display: flex;
  flex-direction: column;
}

.emc-wizard__body {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
```

Replace with:

```css
.emc-wizard {
  width: 920px;
  display: flex;
  flex-direction: column;
}

.emc-wizard__layout {
  display: flex;
  align-items: flex-start;
}

.emc-wizard__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 160px;
  flex-shrink: 0;
  padding: 1rem 0.5rem;
  border-right: 1px solid var(--border);
}

.emc-wizard__nav-item {
  text-align: left;
  background: none;
  border: none;
  padding: 0.5rem 0.625rem;
  border-radius: 7px;
  font-size: 0.78rem;
  color: var(--nexus-text-muted);
  cursor: pointer;
}

.emc-wizard__nav-item:hover {
  background: var(--surface-muted);
  color: var(--text-h);
}

.emc-wizard__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  min-width: 0;
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b --noEmit`
Expected: same pre-existing set of errors as before, no new errors from these two files.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): add jump-nav sidebar to New Event form"
```

---

### Task 5: Labels, icons, filters, and pill colors for the new types

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx:5-11`
- Modify: `src/features/employees/components/my-calendar/CalendarFilterPanel.tsx:6`
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx:1-6,13,29-35`
- Modify: `src/styles/employee-my-calendar.css` (pill color and rail-dot color blocks)

**Interfaces:**
- Consumes: `CalendarEventType` (Task 1).
- Produces: `EVENT_TYPE_LABEL` (in `EventDetailsModal.tsx`) covers all 8 types — this is what fixes the `Record<CalendarEventType, string>` type errors from Tasks 1–4. `AGENDA_TYPE_ICON` (in `my-calendar-tab.tsx`) likewise covers all 8.

- [ ] **Step 1: Fix `EVENT_TYPE_LABEL`**

In `src/features/employees/components/my-calendar/EventDetailsModal.tsx`, replace:

```ts
export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  shift: 'Shift',
  meeting: 'Meeting',
  leave: 'Leave',
  holiday: 'Company event',
  reminder: 'Deadline/Form',
};
```

with:

```ts
export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  shift: 'Shift',
  meeting: 'Meeting',
  leave: 'Leave',
  holiday: 'Holiday',
  reminder: 'Deadline/Form',
  training: 'Training',
  'out-of-office': 'Out of Office',
  'company-event': 'Company Event',
};
```

- [ ] **Step 2: Add the new types to the filter panel**

In `src/features/employees/components/my-calendar/CalendarFilterPanel.tsx`, replace:

```ts
const TYPE_ORDER: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday', 'reminder'];
```

with:

```ts
const TYPE_ORDER: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday', 'reminder', 'training', 'out-of-office', 'company-event'];
```

- [ ] **Step 3: Add icon imports and extend `ALL_EVENT_TYPES`/`AGENDA_TYPE_ICON`**

In `src/features/employees/components/my-calendar/my-calendar-tab.tsx`, replace the lucide-react import:

```tsx
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X,
  Sun, Plane, Clock, Bell, CalendarX2, Settings
} from 'lucide-react';
```

with:

```tsx
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X,
  Sun, Plane, Clock, Bell, CalendarX2, Settings,
  GraduationCap, LogOut, Building2
} from 'lucide-react';
```

Replace:

```tsx
const ALL_EVENT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday', 'reminder'];
```

with:

```tsx
const ALL_EVENT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday', 'reminder', 'training', 'out-of-office', 'company-event'];
```

Replace:

```tsx
const AGENDA_TYPE_ICON: Record<CalendarEventType, React.ComponentType<{ size?: number }>> = {
  meeting: Users,
  holiday: Sun,
  leave: Plane,
  shift: Clock,
  reminder: Bell,
};
```

with:

```tsx
const AGENDA_TYPE_ICON: Record<CalendarEventType, React.ComponentType<{ size?: number }>> = {
  meeting: Users,
  holiday: Sun,
  leave: Plane,
  shift: Clock,
  reminder: Bell,
  training: GraduationCap,
  'out-of-office': LogOut,
  'company-event': Building2,
};
```

- [ ] **Step 4: Add pill and rail-dot colors**

In `src/styles/employee-my-calendar.css`, find:

```css
.emc-evpill--meeting  { --ev-color: var(--accent);                        --ev-bg: var(--accent-bg, color-mix(in srgb, var(--accent) 10%, transparent)); }
.emc-evpill--holiday  { --ev-color: var(--nexus-warning, #b45309);         --ev-bg: color-mix(in srgb, var(--nexus-warning, #f59e0b) 12%, transparent); }
.emc-evpill--leave    { --ev-color: var(--success, #047857);               --ev-bg: color-mix(in srgb, var(--success, #10b981) 12%, transparent); }
.emc-evpill--shift    { --ev-color: var(--nexus-accent, #4338ca);          --ev-bg: color-mix(in srgb, var(--nexus-accent, #6366f1) 12%, transparent); }
.emc-evpill--reminder { --ev-color: var(--nexus-warning, #c2410c);         --ev-bg: color-mix(in srgb, var(--nexus-warning, #f97316) 14%, transparent); }
.emc-evpill--more     { --ev-color: var(--nexus-text-muted);               --ev-bg: var(--surface-muted); }
```

add these three lines directly below it:

```css
.emc-evpill--training      { --ev-color: #7c3aed; --ev-bg: color-mix(in srgb, #7c3aed 12%, transparent); }
.emc-evpill--out-of-office { --ev-color: #0891b2; --ev-bg: color-mix(in srgb, #0891b2 12%, transparent); }
.emc-evpill--company-event { --ev-color: #be123c; --ev-bg: color-mix(in srgb, #be123c 12%, transparent); }
```

Find:

```css
.emc-rail__dot--meeting  { background: var(--accent); }
.emc-rail__dot--holiday  { background: var(--nexus-warning, #f59e0b); }
.emc-rail__dot--leave    { background: var(--success, #10b981); }
.emc-rail__dot--shift    { background: var(--nexus-accent, #6366f1); }
.emc-rail__dot--reminder { background: var(--nexus-warning, #f97316); }
```

add these three lines directly below it:

```css
.emc-rail__dot--training      { background: #7c3aed; }
.emc-rail__dot--out-of-office { background: #0891b2; }
.emc-rail__dot--company-event { background: #be123c; }
```

- [ ] **Step 5: Type-check — should now be fully clean**

Run: `npx tsc -b --noEmit`
Expected: no errors from any of the files touched in Tasks 1–5 (the `Record<CalendarEventType, ...>` errors from Task 1 are now resolved).

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx src/features/employees/components/my-calendar/CalendarFilterPanel.tsx src/features/employees/components/my-calendar/my-calendar-tab.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): surface training/out-of-office/company-event types in labels, icons, filters, and pill colors"
```

---

### Task 6: End-to-end manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`, open the My Calendar tab in the browser.

- [ ] **Step 2: Verify the sidebar and 6 type options**

Click "New Event". Confirm a left sidebar lists Basic Info / Schedule / Details / Reminders & Repeat, and the Basic Info section shows 6 type radios (Leave, Meeting, Company event, Training, Out of office, Holiday) plus Category and Priority dropdowns. Click each sidebar item and confirm the form scrolls to that section without losing any entered values.

- [ ] **Step 3: Verify Training requires attendees**

Fill Title "Test Training", select type Training, pick a date/time, leave Attendees empty, click "Create Event" — confirm "Select at least one attendee." appears (same message Meeting already produces). Select 2 attendees, click "Create Event" again — confirm it's created, and opening it shows RSVP "pending" badges for both attendees (reuses the existing RSVP display).

- [ ] **Step 4: Verify Out Of Office**

Create an Out Of Office event with no attendees — confirm it's created immediately (`confirmed`), with its own pill color (distinct from Leave's green) and no attendee section ever shown for this type.

- [ ] **Step 5: Verify Company Event still approval-gated**

Create a Company Event — confirm it's `pending`/dashed-pill same as before, and Approve/Reject in `EventDetailsModal` still work (this flow is untouched by this sub-project, just renamed/retyped).

- [ ] **Step 6: Verify Holiday is directly creatable**

Create a Holiday event (e.g. title "Office Closure Day", all-day) — confirm it's created immediately as `confirmed` (no approval step, no attendee section shown), and appears with the same Holiday pill styling as the existing system holidays already in the mock data.

- [ ] **Step 7: Verify Category/Priority persist**

Create any event with Category "Compliance" and Priority "Critical" set. Confirm no validation error blocks submission (both are optional/defaulted). There's no UI to view these fields yet (Event Details Modal display is a later sub-project) — verify via React DevTools or a temporary `console.log` in `handleCreateEvents` (`my-calendar-tab.tsx`) that the created event object has `category: 'compliance'` and `priority: 'critical'`, then remove the temporary log.

- [ ] **Step 8: Verify widened conflict detection**

Find a date with an existing Holiday in the mock data (`employee-calendar.data.ts`), or temporarily note one. Create an event on that same date — confirm the Conflict Warning screen now appears (previously holidays weren't checked), and both Reschedule and Confirm anyway still work.

- [ ] **Step 9: Verify the filter panel**

Open the filter panel (funnel icon) — confirm Training, Out of Office, and Company Event now appear as togglable type filters with their own swatch colors, and toggling them hides/shows matching pills on the calendar.

- [ ] **Step 10: Final check**

Run: `npx tsc -b --noEmit` and `npm run lint`. Confirm no new errors beyond the pre-existing unrelated ones (`Step6ConfirmImport.tsx`, `navbar.tsx`, and the pre-existing lint findings noted in the previous sub-project's plan).
