# Week/Day View Drag-to-Create-Event Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clicking-and-dragging on an empty time slot in Week or Day view selects a time range and opens the New Event wizard pre-filled with that date/start/end time.

**Architecture:** New drag-tracking state lives in `MyCalendarTab` (where `renderWeek`/`renderDay` and the `NewEventWizard` render already live). Each hour cell gets a `mousedown` handler that starts a drag; a `document`-level `mousemove`/`mouseup` pair (attached only while dragging) extends the selection and finalizes it. `NewEventWizard` gains one new optional prop so its form can start pre-filled instead of always starting empty.

**Tech Stack:** React + TypeScript (Vite). No test framework exists in this repo — verification is `npx tsc -p tsconfig.app.json` plus manual exercise in a headless browser (Playwright installed ad-hoc into a scratch `/tmp` directory — do not add it to the project's `package.json`).

## Global Constraints

- 15-minute snapping for the stored start/end time, computed from cursor position within the hour cell under it.
- Visual highlight during drag is **whole-hour-cell granularity** (a CSS class on every hour cell touched by the range), not pixel-precise — hour rows use `min-height`, not a fixed height, so pixel math would be fragile.
- A drag cannot cross from one day column into another (Week view) — `mousemove` updates are ignored if the point under the cursor belongs to a different day than where the drag started.
- A click with no real drag movement still produces a valid 30-minute default range (this falls out naturally if `endMinutes` is initialized to `startMinutes + 30` at `mousedown` and only updated by later `mousemove`s).
- On `mouseup`, `console.log` the finalized date/start/end before opening the wizard.
- The wizard opens with `{ date, start, end, allDay: false, type: 'meeting' }` pre-filled; the user can still change any field afterward, including type.
- Month view is untouched. No drag-to-reschedule of existing events (separate, already-tracked to-do). No changes to `EventDetailsModal`, `CalendarFilterPanel`, or `findConflicts`.
- Run `npx tsc -p tsconfig.app.json` after every code change — it must report no errors in `src/features/employees/components/my-calendar/` before moving on.

---

### Task 1: `initialOverrides` prop on `NewEventWizard`

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: existing `NewEventFormState`, `EMPTY_NEW_EVENT_FORM` in this file.
- Produces: `NewEventWizardProps.initialOverrides?: Partial<NewEventFormState>`. Task 4 passes this from `MyCalendarTab`.

- [ ] **Step 1: Add the prop and use it to seed form state**

Replace:

```tsx
interface NewEventWizardProps {
  onClose: () => void;
  onCreate: (events: CalendarEvent[]) => void;
  existingMyEvents: CalendarEvent[];
}

export const NewEventWizard: React.FC<NewEventWizardProps> = ({ onClose, onCreate, existingMyEvents }) => {
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
```

with:

```tsx
interface NewEventWizardProps {
  onClose: () => void;
  onCreate: (events: CalendarEvent[]) => void;
  existingMyEvents: CalendarEvent[];
  initialOverrides?: Partial<NewEventFormState>;
}

export const NewEventWizard: React.FC<NewEventWizardProps> = ({ onClose, onCreate, existingMyEvents, initialOverrides }) => {
  const [form, setForm] = useState<NewEventFormState>(() => ({ ...EMPTY_NEW_EVENT_FORM, ...initialOverrides }));
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors in `src/features/employees/components/my-calendar/NewEventWizard.tsx`. (`my-calendar-tab.tsx` doesn't pass the new prop yet, which is fine — it's optional.)

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): add initialOverrides prop to NewEventWizard"
```

---

### Task 2: Drag state, helpers, and wizard wiring in `MyCalendarTab`

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `addMinutesToTime` from `./new-event-wizard.utils`; `initialOverrides` prop on `NewEventWizard` (Task 1).
- Produces: `handleCellMouseDown(e, dayKey, hour)` and `isHourInDragRange(dayKey, hour): boolean`, used by Tasks 3 and 4 to wire `renderWeek`/`renderDay`. `dragDayKey`/`dragRange`/`dragPrefill` state, used by nothing outside this file.

- [ ] **Step 1: Import `addMinutesToTime`**

Replace:

```ts
import { employeeCalendarData } from '../../data/employee-calendar.data';
import type { CalendarEvent, CalendarEventType, CalendarViewMode, CalendarScopeFilter } from '../../types/employee-calendar.types';
import { EventDetailsModal } from './EventDetailsModal';
import { CalendarFilterPanel } from './CalendarFilterPanel';
import { NewEventWizard } from './NewEventWizard';
```

with:

```ts
import { employeeCalendarData } from '../../data/employee-calendar.data';
import type { CalendarEvent, CalendarEventType, CalendarViewMode, CalendarScopeFilter } from '../../types/employee-calendar.types';
import { EventDetailsModal } from './EventDetailsModal';
import { CalendarFilterPanel } from './CalendarFilterPanel';
import { NewEventWizard } from './NewEventWizard';
import { addMinutesToTime, type NewEventFormState } from './new-event-wizard.utils';
```

- [ ] **Step 2: Add a module-level helper to read the point under the cursor**

Replace:

```ts
function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const MONTH_NAMES = [
```

with:

```ts
function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

interface DragPointInfo {
  dayKey: string;
  minutes: number;
}

function getDragPointInfo(clientX: number, clientY: number): DragPointInfo | null {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const cell = el?.closest<HTMLElement>('[data-drag-day][data-drag-hour]');
  if (!cell) return null;
  const dayKey = cell.dataset.dragDay!;
  const hour = Number(cell.dataset.dragHour);
  const rect = cell.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
  const withinHour = Math.min(45, Math.round((fraction * 60) / 15) * 15);
  return { dayKey, minutes: hour * 60 + withinHour };
}

const MONTH_NAMES = [
```

(the closing `];` and the rest of the file below `MONTH_NAMES` are untouched — this replace only inserts the new interface and function between `formatTime` and `MONTH_NAMES`.)

- [ ] **Step 3: Add drag state and handlers inside `MyCalendarTab`**

Replace:

```tsx
  // New event wizard
  const [newEventOpen, setNewEventOpen] = useState(false);
  const handleCreateEvents = (events: CalendarEvent[]) => {
    setLocalEvents(prev => [...prev, ...events]);
    setScope('my');
    setEnabledTypes(prev => {
      const next = new Set(prev);
      events.forEach(ev => next.add(ev.type));
      return next;
    });
  };
```

with:

```tsx
  // New event wizard
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [dragPrefill, setDragPrefill] = useState<Partial<NewEventFormState> | null>(null);
  const handleCreateEvents = (events: CalendarEvent[]) => {
    setLocalEvents(prev => [...prev, ...events]);
    setScope('my');
    setEnabledTypes(prev => {
      const next = new Set(prev);
      events.forEach(ev => next.add(ev.type));
      return next;
    });
  };

  // Drag-to-create-event (Week/Day views)
  const [dragDayKey, setDragDayKey] = useState<string | null>(null);
  const [dragRange, setDragRange] = useState<{ startMinutes: number; endMinutes: number } | null>(null);
  const dragStateRef = useRef<{ dayKey: string; startMinutes: number; endMinutes: number } | null>(null);

  const handleCellMouseDown = (e: React.MouseEvent<HTMLElement>, dayKey: string, hour: number) => {
    if ((e.target as HTMLElement).closest('.emc-week__ev, .emc-day__ev')) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const withinHour = Math.min(45, Math.round((fraction * 60) / 15) * 15);
    const startMinutes = hour * 60 + withinHour;
    const endMinutes = startMinutes + 30;
    dragStateRef.current = { dayKey, startMinutes, endMinutes };
    setDragDayKey(dayKey);
    setDragRange({ startMinutes, endMinutes });
  };

  const isHourInDragRange = (dayKey: string, hour: number): boolean => {
    if (dragDayKey !== dayKey || !dragRange) return false;
    const hourStart = hour * 60;
    const hourEnd = hourStart + 60;
    return hourStart < dragRange.endMinutes && hourEnd > dragRange.startMinutes;
  };

  useEffect(() => {
    if (!dragDayKey) return;
    const handleMouseMove = (e: MouseEvent) => {
      const info = getDragPointInfo(e.clientX, e.clientY);
      const current = dragStateRef.current;
      if (!info || !current || info.dayKey !== current.dayKey) return;
      const endMinutes = Math.max(current.startMinutes + 15, info.minutes);
      dragStateRef.current = { ...current, endMinutes };
      setDragRange({ startMinutes: current.startMinutes, endMinutes });
    };
    const handleMouseUp = () => {
      const current = dragStateRef.current;
      dragStateRef.current = null;
      setDragDayKey(null);
      setDragRange(null);
      if (current) {
        const startTime = addMinutesToTime('00:00', current.startMinutes);
        const endTime = addMinutesToTime('00:00', current.endMinutes);
        console.log('Selected:', current.dayKey, startTime, '–', endTime);
        setDragPrefill({ date: current.dayKey, start: startTime, end: endTime, allDay: false, type: 'meeting' });
        setNewEventOpen(true);
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragDayKey]);
```

- [ ] **Step 4: Clear `dragPrefill` when the wizard opens manually or closes**

Replace:

```tsx
          <button type="button" className="era-btn era-btn--ghost emc-header__btn" onClick={() => setNewEventOpen(true)}>
            <Plus size={13} />
            New Event
          </button>
```

with:

```tsx
          <button type="button" className="era-btn era-btn--ghost emc-header__btn" onClick={() => { setDragPrefill(null); setNewEventOpen(true); }}>
            <Plus size={13} />
            New Event
          </button>
```

Replace:

```tsx
      {newEventOpen && (
        <NewEventWizard
          onClose={() => setNewEventOpen(false)}
          onCreate={handleCreateEvents}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
        />
      )}
```

with:

```tsx
      {newEventOpen && (
        <NewEventWizard
          onClose={() => { setNewEventOpen(false); setDragPrefill(null); }}
          onCreate={handleCreateEvents}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
          initialOverrides={dragPrefill ?? undefined}
        />
      )}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors in `src/features/employees/components/my-calendar/my-calendar-tab.tsx`. (`handleCellMouseDown` and `isHourInDragRange` are unused until Tasks 3/4 — confirm there's no `noUnusedLocals` error; if there is, it means they're function *declarations* assigned to `const`, which TypeScript does flag as unused when never referenced anywhere in the file. Since Task 3 immediately follows and references them, this is expected to be a transient state — if you stop here, you would see `'handleCellMouseDown' is declared but its value is never read` and the same for `isHourInDragRange`. Continue to Task 3 before treating this as a problem.)

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): add drag-to-create-event state and handlers"
```

---

### Task 3: Wire drag handlers into Week view

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `handleCellMouseDown`, `isHourInDragRange` (Task 2).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add `data-drag-*` attributes, the mousedown handler, and the highlight class to each Week hour cell**

Replace:

```tsx
                return (
                  <div key={key} className={`emc-week__cell${isToday ? ' emc-week__cell--today' : ''}`}>
                    {hourEvts.map(ev => (
```

with:

```tsx
                const inDrag = isHourInDragRange(key, h);
                return (
                  <div
                    key={key}
                    className={`emc-week__cell${isToday ? ' emc-week__cell--today' : ''}${inDrag ? ' emc-week__cell--dragselect' : ''}`}
                    data-drag-day={key}
                    data-drag-hour={h}
                    onMouseDown={e => handleCellMouseDown(e, key, h)}
                  >
                    {hourEvts.map(ev => (
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors. `handleCellMouseDown` is now used; `isHourInDragRange` may still show as unused until Task 4 — that's expected.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): wire drag-to-create-event into Week view"
```

---

### Task 4: Wire drag handlers into Day view

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `handleCellMouseDown`, `isHourInDragRange` (Task 2).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add `data-drag-*` attributes, the mousedown handler, and the highlight class to each Day hour row**

Replace:

```tsx
            return (
              <div key={h} className="emc-day__row">
                <div className="emc-day__time">{formatHour(h)}</div>
                <div className="emc-day__slot">
```

with:

```tsx
            const inDrag = isHourInDragRange(key, h);
            return (
              <div
                key={h}
                className={`emc-day__row${inDrag ? ' emc-day__row--dragselect' : ''}`}
                data-drag-day={key}
                data-drag-hour={h}
                onMouseDown={e => handleCellMouseDown(e, key, h)}
              >
                <div className="emc-day__time">{formatHour(h)}</div>
                <div className="emc-day__slot">
```

- [ ] **Step 2: Type-check**

Run: `npx tsc -p tsconfig.app.json`
Expected: no errors anywhere in `src/features/employees/`.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): wire drag-to-create-event into Day view"
```

---

### Task 5: Drag-selection highlight styling

**Files:**
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: `.emc-week__cell--dragselect` and `.emc-day__row--dragselect` class names used in Tasks 3 and 4.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the highlight styles**

Find this existing rule (do not change it):

```css
.emc-week__cell--today {
  background: color-mix(in srgb, var(--accent) 3%, transparent);
}
```

Insert immediately after it:

```css
.emc-week__cell--dragselect {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}
```

Find this existing rule (do not change it):

```css
.emc-day__row:last-child {
  border-bottom: none;
}
```

Insert immediately after it:

```css
.emc-day__row--dragselect {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/employee-my-calendar.css
git commit -m "style(calendar): add drag-selection highlight for Week/Day views"
```

---

### Task 6: Manual verification in the browser

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite prints a local URL with no compile errors.

- [ ] **Step 2: Verify drag in Week view**

Open the app → Schedule → Calendar → switch to "Week" view. Press the mouse down inside an empty hour cell (e.g. the 11 AM row on a day with no events), drag down two rows, release. Confirm: while dragging, the cells you drag across get a visibly tinted background; after release, the browser console shows a `Selected: <date> <start> – <end>` line, and the New Event wizard opens with Event type "Meeting", `All-day` unchecked, and Start/End time fields matching what you dragged (rounded to the nearest 15 minutes).

- [ ] **Step 3: Verify plain click (no drag) in Week view**

Close the wizard. Click once (mouse down + up without moving) on an empty hour cell. Confirm the wizard opens with a 30-minute range (End time = Start time + 30 minutes).

- [ ] **Step 4: Verify drag in Day view**

Close the wizard, switch to "Day" view. Drag across a couple of empty hour rows. Confirm the same highlight-while-dragging and pre-filled wizard behavior as Week view.

- [ ] **Step 5: Verify clicking an existing event still opens its details, not a new drag**

In either Week or Day view, click directly on an existing event pill (e.g. "Team Sync"). Confirm `EventDetailsModal` opens for that event — dragging must not have been triggered by that click (no New Event wizard should appear).

- [ ] **Step 6: Verify the "+ New Event" button still works normally**

Click the header's "+ New Event" button directly (not via drag). Confirm the wizard opens with its normal defaults (Leave type, all-day, empty title) — not leftover values from a previous drag.

- [ ] **Step 7: Stop the dev server**

Stop the `npm run dev` process (Ctrl+C) once verification passes.

No commit for this task — it's verification only, not a code change.
