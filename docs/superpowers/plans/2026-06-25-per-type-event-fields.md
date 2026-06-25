# Per-Event-Type New Event Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the New Event wizard show only the fields relevant to the selected event type (Meeting/Training stay rich; Company event/Holiday/Leave become leaner), driven by one declarative config table, without changing the wizard's fixed modal size.

**Architecture:** A new `TYPE_FIELD_CONFIG: Record<NewEventType, TypeFieldConfig>` table in `new-event-wizard.utils.ts` (same pattern as the existing `TYPE_META`) centralizes which fields show and what they're labeled per type. `NewEventWizard.tsx` reads this config once per render and conditionally renders rows/sections/nav-links from it instead of scattering `form.type === 'x'` checks. A new `leaveType` field flows from the form, into `CalendarEvent`, and out to `EventDetailsModal`.

**Tech Stack:** React + TypeScript (Vite), existing `employee-my-calendar.css` BEM classes. No test framework exists in this repo — verification is `npx tsc -p tsconfig.app.json` (type-check, already `noEmit`/`noUnusedLocals`/`noUnusedParameters`) plus manual exercise of the dev server in a headless browser (Playwright, installed ad-hoc into a scratch `/tmp` directory — do not add it to the project's `package.json`).

## Global Constraints

- Field visibility matrix (verbatim from spec):

  | Field | Meeting | Training | Company event | Holiday | Leave |
  |---|---|---|---|---|---|
  | Title | shown | shown | shown | shown | shown |
  | Category / Priority row | shown | shown | hidden | hidden | replaced by Leave Type |
  | Leave Type (Annual/Sick/Casual) | — | — | — | — | shown |
  | All-day toggle + timed schedule | shown | shown | shown | hidden (forced all-day, date-range only) | hidden (forced all-day, date-range only) |
  | Location field | shown, "Meeting link / Room" | shown, "Location" | shown, "Location" | hidden | hidden |
  | Notes field | shown, "Agenda" | shown, "Notes" | shown, "Notes" | hidden | shown, "Reason" |
  | Attendees | shown | shown | hidden | hidden | hidden |
  | Reminder | shown | shown | hidden | hidden | hidden |
  | Recurring | shown | shown | hidden | hidden | hidden |

- The fixed `.emc-wizard` modal size (set in a prior change: `min-height: 600px` on `.emc-wizard`, `flex: 1` on `.emc-wizard__layout`) must NOT change. Leaner forms leave blank space below — that's expected and approved.
- When a whole section (Details, or Reminders & Repeat) has nothing left to show for a type, the section box AND its left-nav link must be omitted — never an empty box or a dead nav link.
- `leaveType` values are exactly `'Annual' | 'Sick' | 'Casual'` (reusing the existing `LeaveTypeKey` values from `employee-leave.tsx`), defaulting to `'Annual'`.
- No changes to the standalone Leave request page (`employee-leave.tsx`), no new validation rules, no backend changes.
- Run `npx tsc -p tsconfig.app.json` after every code change in this plan — it must report no errors in `src/features/employees/components/my-calendar/` or `src/features/employees/types/` before moving on.

---

### Task 1: `TYPE_FIELD_CONFIG` + `leaveType` in form state (`new-event-wizard.utils.ts`)

**Files:**
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`

**Interfaces:**
- Consumes: existing `NewEventType`, `NewEventFormState`, `EMPTY_NEW_EVENT_FORM`, `buildEventsFromForm` in this file.
- Produces: `export interface TypeFieldConfig { showCategoryPriority: boolean; showLeaveType: boolean; allowTimedSchedule: boolean; locationLabel: string | null; notesLabel: string | null; showAttendees: boolean; showReminder: boolean; showRecurring: boolean }`, `export const TYPE_FIELD_CONFIG: Record<NewEventType, TypeFieldConfig>`, `export type LeaveTypeKey = 'Annual' | 'Sick' | 'Casual'`. `NewEventFormState.leaveType: LeaveTypeKey`. `buildEventsFromForm` now also sets `event.leaveType` for leave events (Task 2 makes `CalendarEvent.leaveType` exist so this compiles).

- [ ] **Step 1: Add `LeaveTypeKey` and `TYPE_FIELD_CONFIG`**

Insert directly after the `RsvpStatus` type declaration (currently line 11):

```ts
export type LeaveTypeKey = 'Annual' | 'Sick' | 'Casual';

export interface TypeFieldConfig {
  showCategoryPriority: boolean;
  showLeaveType: boolean;
  allowTimedSchedule: boolean;
  locationLabel: string | null;
  notesLabel: string | null;
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

- [ ] **Step 2: Add `leaveType` to `NewEventFormState` and `EMPTY_NEW_EVENT_FORM`**

In the `NewEventFormState` interface, add a field right after `priority: CalendarEventPriority;`:

```ts
  priority: CalendarEventPriority;
  leaveType: LeaveTypeKey;
```

In `EMPTY_NEW_EVENT_FORM`, add right after `priority: 'medium',`:

```ts
  priority: 'medium',
  leaveType: 'Annual',
```

- [ ] **Step 3: Set `event.leaveType` in `buildEventsFromForm`**

Replace:

```ts
    if (form.category) event.category = form.category;
    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
```

with:

```ts
    if (form.category) event.category = form.category;
    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
    if (form.type === 'leave') event.leaveType = form.leaveType;
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: one error, `Property 'leaveType' does not exist on type 'CalendarEvent'` (at the new `event.leaveType = form.leaveType` line) — Task 2 fixes this. No other errors in this file.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts
git commit -m "feat(calendar): add TYPE_FIELD_CONFIG and leaveType to New Event form state"
```

---

### Task 2: `leaveType` on `CalendarEvent` + display in `EventDetailsModal`

**Files:**
- Modify: `src/features/employees/types/employee-calendar.types.ts`
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`

**Interfaces:**
- Consumes: `LeaveTypeKey` from `./new-event-wizard.utils` (Task 1).
- Produces: `CalendarEvent.leaveType?: LeaveTypeKey`, displayed in `EventDetailsModal`.

- [ ] **Step 1: Add `leaveType` to `CalendarEvent`**

In `src/features/employees/types/employee-calendar.types.ts`, add this import at the top of the file:

```ts
import type { LeaveTypeKey } from '../components/my-calendar/new-event-wizard.utils';
```

Then add a field to the `CalendarEvent` interface, right after `priority?: CalendarEventPriority;`:

```ts
  category?: CalendarEventCategory;
  priority?: CalendarEventPriority;
  leaveType?: LeaveTypeKey;
```

- [ ] **Step 2: Display it in `EventDetailsModal`**

In `src/features/employees/components/my-calendar/EventDetailsModal.tsx`, insert a new row right after the attendees row (currently lines 66-71, ending with the closing `)}` before the `attendeeRsvp` block):

```tsx
            {event.attendees && event.attendees.length > 0 && (
              <div className="emc-modal__row">
                <UsersIcon size={13} className="emc-modal__row-icon" />
                <span className="emc-modal__row-value">{event.attendees.join(', ')}</span>
              </div>
            )}

            {event.leaveType && (
              <div className="emc-modal__row">
                <span className="emc-modal__row-label">Leave Type</span>
                <span className="emc-modal__row-value">{event.leaveType}</span>
              </div>
            )}

            {event.attendeeRsvp && (
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors anywhere in `src/features/employees/`.

- [ ] **Step 4: Commit**

```bash
git add src/features/employees/types/employee-calendar.types.ts src/features/employees/components/my-calendar/EventDetailsModal.tsx
git commit -m "feat(calendar): add leaveType to CalendarEvent and show it in event details"
```

---

### Task 3: Wire `TYPE_FIELD_CONFIG` into `NewEventWizard.tsx`

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `TYPE_FIELD_CONFIG`, `TypeFieldConfig`, `LeaveTypeKey` from `./new-event-wizard.utils` (Task 1).
- Produces: nothing new for later tasks — this is the last code task.

- [ ] **Step 1: Update imports**

Replace:

```ts
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  getDefaultEndTime,
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
  TYPE_FIELD_CONFIG,
  type LeaveTypeKey,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';
```

- [ ] **Step 2: Compute the active config and force `allDay` on type change**

Replace:

```ts
export const NewEventWizard: React.FC<NewEventWizardProps> = ({ onClose, onCreate, existingMyEvents }) => {
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<CalendarEvent[] | null>(null);

  const update = (patch: Partial<NewEventFormState>) => setForm(f => ({ ...f, ...patch }));
```

with:

```ts
export const NewEventWizard: React.FC<NewEventWizardProps> = ({ onClose, onCreate, existingMyEvents }) => {
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<CalendarEvent[] | null>(null);

  const update = (patch: Partial<NewEventFormState>) => setForm(f => ({ ...f, ...patch }));

  const fieldConfig = TYPE_FIELD_CONFIG[form.type];

  const handleTypeChange = (nextType: NewEventType) => {
    update({
      type: nextType,
      end: getDefaultEndTime(form.start, nextType),
      allDay: TYPE_FIELD_CONFIG[nextType].allowTimedSchedule ? form.allDay : true,
    });
  };
```

- [ ] **Step 3: Use `handleTypeChange` in the type radio**

Replace:

```tsx
              <input
                type="radio"
                name="event-type"
                checked={form.type === opt.value}
                onChange={() => update({ type: opt.value, end: getDefaultEndTime(form.start, opt.value) })}
              />
```

with:

```tsx
              <input
                type="radio"
                name="event-type"
                checked={form.type === opt.value}
                onChange={() => handleTypeChange(opt.value)}
              />
```

- [ ] **Step 4: Make the Category/Priority row conditional, add Leave Type**

Replace:

```tsx
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

with:

```tsx
      {fieldConfig.showCategoryPriority && (
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
      )}
      {fieldConfig.showLeaveType && (
        <div className="emc-wizard__field-row">
          <label className="emc-wizard__field">
            <span>Leave Type</span>
            <select value={form.leaveType} onChange={e => update({ leaveType: e.target.value as LeaveTypeKey })}>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
```

(`LeaveTypeKey`, used in the `onChange` cast above, was already added to the import in Step 1.)

- [ ] **Step 5: Hide the All-day toggle when `allowTimedSchedule` is false**

Replace:

```tsx
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
        <span>All-day</span>
      </label>
      <label className="emc-wizard__field">
```

with:

```tsx
      {fieldConfig.allowTimedSchedule && (
        <label className="emc-wizard__field emc-wizard__field--checkbox">
          <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
          <span>All-day</span>
        </label>
      )}
      <label className="emc-wizard__field">
```

Replace the `form.allDay ? ... : ...` branch right below it:

```tsx
      {form.allDay ? (
        <label className="emc-wizard__field">
          <span>End date (optional, for multi-day)</span>
          <input type="date" value={form.endDate} onChange={e => update({ endDate: e.target.value })} />
        </label>
      ) : (
```

with:

```tsx
      {form.allDay || !fieldConfig.allowTimedSchedule ? (
        <label className="emc-wizard__field">
          <span>End date (optional, for multi-day)</span>
          <input type="date" value={form.endDate} onChange={e => update({ endDate: e.target.value })} />
        </label>
      ) : (
```

(`form.allDay` is already forced `true` by `handleTypeChange` for Holiday/Leave, so `!fieldConfig.allowTimedSchedule` here is a belt-and-suspenders guard against the time-input branch ever rendering for those types.)

- [ ] **Step 6: Make Details section fields conditional; hide the whole section when empty**

Replace the entire `renderDetailsSection`:

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
          <AttendeeSearchField selected={form.attendees} onChange={attendees => update({ attendees })} />
        </div>
      )}
    </div>
  );
```

with:

```tsx
  const showDetailsSection = fieldConfig.locationLabel !== null || fieldConfig.notesLabel !== null || fieldConfig.showAttendees;

  const renderDetailsSection = () => (
    <div className="emc-wizard__section" id="details">
      <h4 className="emc-wizard__section-title"><FileText size={14} /> Details</h4>
      {fieldConfig.locationLabel !== null && (
        <label className="emc-wizard__field">
          <span>{fieldConfig.locationLabel}</span>
          <input value={form.location} onChange={e => update({ location: e.target.value })} placeholder="Optional" />
        </label>
      )}
      {fieldConfig.notesLabel !== null && (
        <label className="emc-wizard__field">
          <span>{fieldConfig.notesLabel}</span>
          <textarea value={form.notes} onChange={e => update({ notes: e.target.value })} placeholder="Optional" rows={3} />
        </label>
      )}
      {fieldConfig.showAttendees && (
        <div className="emc-wizard__field">
          <span>Attendees</span>
          <AttendeeSearchField selected={form.attendees} onChange={attendees => update({ attendees })} />
        </div>
      )}
    </div>
  );
```

- [ ] **Step 7: Make Reminders & Repeat section conditional; hide the whole section when empty**

Replace the entire `renderRemindersSection`:

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

with:

```tsx
  const showRemindersSection = fieldConfig.showReminder || fieldConfig.showRecurring;

  const renderRemindersSection = () => (
    <div className="emc-wizard__section" id="reminders">
      <h4 className="emc-wizard__section-title"><Bell size={14} /> Reminders &amp; repeat</h4>
      {fieldConfig.showReminder && (
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
      )}
      {fieldConfig.showRecurring && (
        <>
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
        </>
      )}
    </div>
  );
```

- [ ] **Step 8: Filter the nav and the rendered sections**

Replace:

```tsx
const NAV_SECTIONS: { id: string; label: string }[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'details', label: 'Details' },
  { id: 'reminders', label: 'Reminders & Repeat' },
];
```

with:

```tsx
const ALL_NAV_SECTIONS: { id: string; label: string }[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'details', label: 'Details' },
  { id: 'reminders', label: 'Reminders & Repeat' },
];
```

Replace the nav-rendering block:

```tsx
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
```

with:

```tsx
          {!conflicts && (
            <nav className="emc-wizard__nav" aria-label="Form sections">
              {ALL_NAV_SECTIONS
                .filter(s => s.id !== 'details' || showDetailsSection)
                .filter(s => s.id !== 'reminders' || showRemindersSection)
                .map(s => (
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
                {showDetailsSection && renderDetailsSection()}
                {showRemindersSection && renderRemindersSection()}
              </div>
            )}
          </div>
```

- [ ] **Step 9: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors anywhere in `src/features/employees/`.

- [ ] **Step 10: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): render New Event fields per type using TYPE_FIELD_CONFIG"
```

---

### Task 4: Manual verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL with no compile errors. Note the port (it auto-increments if busy).

- [ ] **Step 2: Verify Meeting still shows the full field set**

Open the app → Schedule → Calendar → New Event → select "Meeting". Confirm: Category/Priority row shown, Location labeled "Meeting link / Room", Notes labeled "Agenda", Attendees field shown, Reminder + Recurring shown. Confirm no "Leave Type" field appears.

- [ ] **Step 3: Verify Training is unchanged**

Select "Training". Confirm: Category/Priority shown, Location labeled "Location" (not renamed), Notes labeled "Notes" (not renamed), Attendees shown, Reminder + Recurring shown.

- [ ] **Step 4: Verify Company event is leaner**

Select "Company event". Confirm: no Category/Priority row, no Leave Type, All-day toggle still present (timed schedule allowed), Location labeled "Location", Notes labeled "Notes", no Attendees field, the entire "Reminders & Repeat" section and its nav link are gone.

- [ ] **Step 5: Verify Holiday is leanest**

Select "Holiday". Confirm: no Category/Priority/Leave Type row, no All-day checkbox (schedule shows only Start date + "End date (optional, for multi-day)"), the entire "Details" section and its nav link are gone, the entire "Reminders & Repeat" section and its nav link are gone. Confirm the modal box is still the same size as it was for Meeting (no shrink).

- [ ] **Step 6: Verify Leave shows Leave Type + Reason**

Select "Leave". Confirm: a "Leave Type" dropdown appears (Annual/Sick/Casual, defaulting to Annual) in place of Category/Priority, no All-day checkbox, Details section shows only a "Reason" field (no Location, no Attendees), Reminders & Repeat section and nav link are gone.

- [ ] **Step 7: Verify the created Leave event displays its Leave Type**

With "Leave" selected, fill Title "Test Leave", pick a Start date, leave Leave Type as "Annual", click "Create Event". Click the newly created event on the calendar to open its details. Confirm a "Leave Type: Annual" row appears in the details popup.

- [ ] **Step 8: Stop the dev server**

Stop the `npm run dev` process (Ctrl+C) once verification passes.

No commit for this task — it's verification only, not a code change.
