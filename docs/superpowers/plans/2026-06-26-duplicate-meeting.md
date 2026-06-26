# Duplicate Meeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the organizer duplicate a meeting from either the event details modal or a right-click on the event in the calendar grid, landing in the New Event wizard prefilled with the original meeting's details.

**Architecture:** A pure reverse-mapping function (`CalendarEvent` → `Partial<NewEventFormState>`) feeds the existing `NewEventWizard`'s `initialOverrides` prop. Two UI entry points (a modal button, a grid context menu) both funnel into one handler in `my-calendar-tab.tsx` that opens the wizard prefilled. No new modal component.

**Tech Stack:** React 19 + TypeScript, Vite. No test runner is configured in this repo (`package.json` has no `test` script, no Jest/Vitest dependency) — verification is via `npx tsc -b --noEmit`, `npm run lint`, and manual exercise in the running app (`npm run dev`), per the project's existing convention (this codebase has zero `*.test.*` files).

## Global Constraints

- Duplicate is available **only** for `event.type === 'meeting'` — never for shift/leave/holiday/reminder/training/out-of-office/company-event, in either entry point.
- The duplicated title is copied **unchanged** (no "(Copy)" suffix — per explicit user direction during design review).
- `recurring` is always `false` on the prefilled form — `CalendarEvent` does not persist recurrence state.
- Reuse `NewEventWizard` via its existing `initialOverrides: Partial<NewEventFormState>` prop — do not create a new modal/component for duplication.

---

### Task 1: `eventToFormOverrides` reverse-mapping utility

**Files:**
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`

**Interfaces:**
- Consumes: existing `CalendarEvent` type (from `../../types/employee-calendar.types`), existing `NewEventFormState`, `CALENDAR_DIRECTORY`, `DirectoryPerson`, `AttendeeRef` — all already defined in this file.
- Produces: `export function eventToFormOverrides(event: CalendarEvent): Partial<NewEventFormState>` — consumed by Task 2 and Task 3.

This file already imports `CalendarEvent` is **not** currently imported — check the top of the file before editing; only `CalendarEventType`, `CalendarEventStatus`, `CalendarEventSource`, `CalendarEventCategory`, `CalendarEventPriority`, `CalendarScope` are imported today. Add `CalendarEvent` to that import.

- [ ] **Step 1: Add `CalendarEvent` to the existing type import**

At the top of `new-event-wizard.utils.ts`, change:

```ts
import type {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventSource,
  CalendarEventCategory,
  CalendarEventPriority,
  CalendarScope,
} from '../../types/employee-calendar.types';
```

(If `CalendarEvent` is already in this import list, skip this step — re-check the current file content first since the type is used elsewhere in this file already as a parameter type in `findEventConflicts`.)

- [ ] **Step 2: Implement `eventToFormOverrides`**

Add this function at the end of `new-event-wizard.utils.ts`, after `buildEventsFromForm`:

```ts
export function eventToFormOverrides(event: CalendarEvent): Partial<NewEventFormState> {
  const attendees: AttendeeRef[] = (event.attendees ?? []).map(name => {
    const match = CALENDAR_DIRECTORY.find(person => person.name === name);
    return match
      ? { kind: 'user', id: match.id, name: match.name, role: match.role }
      : { kind: 'external', email: name };
  });

  const overrides: Partial<NewEventFormState> = {
    title: event.title,
    type: 'meeting',
    allDay: false,
    date: event.date,
    audience: event.scope,
    recurring: false,
    attendees,
  };

  if (event.start) overrides.start = event.start;
  if (event.end) overrides.end = event.end;
  if (event.location) overrides.location = event.location;
  if (event.note) overrides.notes = event.note;
  if (event.category) overrides.category = event.category;
  if (event.priority) overrides.priority = event.priority;
  if (event.reminderMinutesBefore) overrides.reminderMinutesBefore = event.reminderMinutesBefore;

  return overrides;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc -b --noEmit`
Expected: no errors mentioning `new-event-wizard.utils.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts
git commit -m "feat(calendar): add eventToFormOverrides for meeting duplication"
```

---

### Task 2: Duplicate button in EventDetailsModal, wired end-to-end

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `eventToFormOverrides` from Task 1 (`./new-event-wizard.utils`).
- Produces: `EventDetailsModal`'s new `onDuplicate: (event: CalendarEvent) => void` prop; `my-calendar-tab.tsx`'s `handleDuplicateEvent(event: CalendarEvent): void` — Task 3 also calls this same handler.

This task is one deliverable because adding a required prop to `EventDetailsModal` and not passing it from `my-calendar-tab.tsx` would leave the build broken — both files change together.

- [ ] **Step 1: Add the `Copy` icon import and `onDuplicate` prop to `EventDetailsModal.tsx`**

Change the lucide import at the top of `EventDetailsModal.tsx`:

```tsx
import { X, MapPin, Users as UsersIcon, Trash2, Pencil, Copy } from 'lucide-react';
```

Update the props interface:

```tsx
interface EventDetailsModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (updated: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
  existingMyEvents?: CalendarEvent[];
}
```

Update the component signature to destructure it:

```tsx
export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onDelete, onSave, onDuplicate, existingMyEvents = [] }) => {
```

- [ ] **Step 2: Render the Duplicate button**

In `EventDetailsModal.tsx`, find the non-editing `emc-modal__actions` block (currently Edit + Delete, around line 144-153):

```tsx
            <div className="emc-modal__actions">
              <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={startEdit}>
                <Pencil size={13} />
                Edit
              </button>
              <button type="button" className="era-btn emc-modal__action emc-modal__action--danger" onClick={() => onDelete(event.id)}>
                <Trash2 size={13} />
                Delete
              </button>
            </div>
```

Replace it with (Duplicate inserted between Edit and Delete, gated on `event.type === 'meeting'`):

```tsx
            <div className="emc-modal__actions">
              <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={startEdit}>
                <Pencil size={13} />
                Edit
              </button>
              {event.type === 'meeting' && (
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => onDuplicate(event)}>
                  <Copy size={13} />
                  Duplicate
                </button>
              )}
              <button type="button" className="era-btn emc-modal__action emc-modal__action--danger" onClick={() => onDelete(event.id)}>
                <Trash2 size={13} />
                Delete
              </button>
            </div>
```

- [ ] **Step 3: Add `handleDuplicateEvent` and wire it in `my-calendar-tab.tsx`**

In `my-calendar-tab.tsx`, add `eventToFormOverrides` to the existing import from `new-event-wizard.utils`:

```ts
import { addMinutesToTime, eventToFormOverrides, findEventConflicts, type NewEventFormState } from './new-event-wizard.utils';
```

Immediately after the existing `handleRsvp` function (search for `const handleRsvp = (id: string, accepted: boolean) => {`), add:

```ts
  const handleDuplicateEvent = (event: CalendarEvent) => {
    setSelectedEvent(null);
    setDragPrefill(eventToFormOverrides(event));
    setNewEventOpen(true);
  };
```

- [ ] **Step 4: Pass `onDuplicate` to `EventDetailsModal`**

Find the `<EventDetailsModal ... />` render (search for `{selectedEvent && (`):

```tsx
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
        />
      )}
```

Add the new prop:

```tsx
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
          onDuplicate={handleDuplicateEvent}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
        />
      )}
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no new errors in `EventDetailsModal.tsx` or `my-calendar-tab.tsx`.

- [ ] **Step 6: Manually verify in the browser**

Run: `npm run dev`, open the My Calendar tab.

1. Click any **meeting** event to open its details modal. Confirm a "Duplicate" button with a copy icon appears between Edit and Delete.
2. Click Duplicate. Confirm the details modal closes and the New Event wizard opens, prefilled with the same title, date, start/end time, location, notes, audience, and attendees as the original meeting.
3. Click any **non-meeting** event (e.g. a Shift or Leave). Confirm there is no Duplicate button — only Edit and Delete.
4. In the prefilled wizard, change the date and click "Create Event". Confirm a new, separate meeting is created (the original is untouched) and "Recurring" is unchecked even if the original was part of a recurring series.

- [ ] **Step 7: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): duplicate a meeting from the event details modal"
```

---

### Task 3: Right-click "Duplicate" context menu on calendar event pills

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: `handleDuplicateEvent` from Task 2 (already in this same file).
- Produces: nothing consumed elsewhere — this is the last task.

- [ ] **Step 1: Add context-menu state and outside-click handling**

In `my-calendar-tab.tsx`, find the "+N more" day popover state block (search for `const [dayPopover, setDayPopover] = useState`). Immediately after that block's closing `}, [dayPopover]);`, add:

```ts
  // Right-click "Duplicate" menu on meeting event pills
  const [eventMenu, setEventMenu] = useState<{ event: CalendarEvent; top: number; left: number } | null>(null);
  const eventMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventMenu) return;
    const onClickOutside = (e: MouseEvent) => {
      if (eventMenuRef.current && !eventMenuRef.current.contains(e.target as Node)) {
        setEventMenu(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [eventMenu]);

  const handleEventContextMenu = (e: React.MouseEvent, ev: CalendarEvent) => {
    if (ev.type !== 'meeting') return;
    e.preventDefault();
    e.stopPropagation();
    setEventMenu({ event: ev, top: e.clientY, left: e.clientX });
  };
```

- [ ] **Step 2: Attach `onContextMenu` to every event pill**

Add `onContextMenu={e => handleEventContextMenu(e, ev)}` to each event pill element below (all are inside this same file):

In `renderMonth` (month event pill, search for `className={\`emc-month__evpill`):
```tsx
                    <div
                      key={ev.id}
                      className={`emc-month__evpill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}`}
                      onClick={e => openEvent(e, ev)}
                      onContextMenu={e => handleEventContextMenu(e, ev)}
                    >
                      {ev.title}
                    </div>
```

In `renderWeek` all-day pill (search for `className={\`emc-week__evpill`):
```tsx
                  <div key={ev.id} className={`emc-week__evpill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}`} onClick={e => openEvent(e, ev)} onContextMenu={e => handleEventContextMenu(e, ev)}>{ev.title}</div>
```

In `renderWeek` timed event (search for `className={\`emc-week__ev `):
```tsx
                      <div
                        key={ev.id}
                        className={`emc-week__ev emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}${draggedEventId === ev.id ? ' emc-week__ev--dragging' : ''}`}
                        onClick={e => openEvent(e, ev)}
                        onContextMenu={e => handleEventContextMenu(e, ev)}
                        draggable
                        onDragStart={e => handleEventDragStart(e, ev)}
                        onDragEnd={handleEventDragEnd}
                      >
                        <span className="emc-week__ev-time">{formatTime(ev.start!)}</span>
                        <span className="emc-week__ev-title">{ev.title}</span>
                      </div>
```

In `renderDay` all-day pill (search for `className={\`emc-day__alldaypill`):
```tsx
              <div key={ev.id} className={`emc-day__alldaypill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}`} onClick={e => openEvent(e, ev)} onContextMenu={e => handleEventContextMenu(e, ev)}>{ev.title}</div>
```

In `renderDay` timed event (search for `className={\`emc-day__ev `):
```tsx
                    <div
                      key={ev.id}
                      className={`emc-day__ev emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}${draggedEventId === ev.id ? ' emc-day__ev--dragging' : ''}`}
                      onClick={e => openEvent(e, ev)}
                      onContextMenu={e => handleEventContextMenu(e, ev)}
                      draggable
                      onDragStart={e => handleEventDragStart(e, ev)}
                      onDragEnd={handleEventDragEnd}
                    >
                      <div className="emc-day__ev-title">{ev.title}</div>
                      <div className="emc-day__ev-time">
                        {formatTime(ev.start!)}{ev.end ? ` – ${formatTime(ev.end)}` : ''}
                        {ev.note ? ` · ${ev.note}` : ''}
                      </div>
                    </div>
```

In `renderAgenda` event row (search for `className="emc-agenda__ev"`):
```tsx
                    <div key={ev.id} className="emc-agenda__ev" onClick={e => openEvent(e, ev)} onContextMenu={e => handleEventContextMenu(e, ev)}>
```

- [ ] **Step 3: Render the context menu popup**

In `my-calendar-tab.tsx`, find the "+N more" day popover render block (search for `{/* "+N more" day popover */}`), and add the new menu immediately after that block's closing `)}`:

```tsx
      {/* Right-click "Duplicate" menu on a meeting event */}
      {eventMenu && (
        <div
          ref={eventMenuRef}
          className="emc-eventmenu"
          style={{ top: eventMenu.top, left: eventMenu.left }}
        >
          <button
            type="button"
            className="emc-eventmenu__item"
            onClick={() => handleDuplicateEvent(eventMenu.event)}
          >
            <Copy size={13} />
            Duplicate
          </button>
        </div>
      )}
```

Add `Copy` to the existing lucide-react import at the top of `my-calendar-tab.tsx` (currently imports `ChevronLeft, ChevronRight, CalendarDays, ChevronDown, Users, RefreshCw, Filter, Plus, Check, X, Sun, Plane, Clock, Bell, CalendarX2, Settings, GraduationCap, LogOut, Building2`):

```ts
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X,
  Sun, Plane, Clock, Bell, CalendarX2, Settings,
  GraduationCap, LogOut, Building2, Copy
} from 'lucide-react';
```

- [ ] **Step 4: Add `.emc-eventmenu` styles**

In `src/styles/employee-my-calendar.css`, find the existing `.emc-daypopover` rule block at line 1114 (it defines position, background, border, shadow, padding, z-index for the "+N more" popover, using project tokens `--border`, `--surface-panel`, `--surface-muted`, `--text-h`). Add a new block right after the `.emc-daypopover__ev-title` rule (before the `/* ── Event details / edit modal ── */` comment at line 1169), reusing the same tokens:

```css
.emc-eventmenu {
  position: fixed;
  z-index: 30;
  min-width: 140px;
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-panel);
  box-shadow: 0 8px 24px color-mix(in srgb, #000 14%, transparent);
}

.emc-eventmenu__item {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  width: 100%;
  padding: 0.3125rem 0.375rem;
  background: none;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-h);
  text-align: left;
  cursor: pointer;
}

.emc-eventmenu__item:hover {
  background: var(--surface-muted);
}
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc -b --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no new errors in `my-calendar-tab.tsx`.

- [ ] **Step 6: Manually verify in the browser**

Run: `npm run dev`, open the My Calendar tab.

1. In Week view, right-click a **meeting** event pill. Confirm a small menu appears at the cursor with a single "Duplicate" item, and the browser's native context menu does *not* appear.
2. Click "Duplicate". Confirm the New Event wizard opens prefilled with that meeting's details (same check as Task 2).
3. Right-click a **non-meeting** event pill (e.g. Shift, Leave, Holiday). Confirm the browser's native context menu appears instead (not intercepted).
4. Right-click a meeting in Month view, then in Day view, then in Agenda view. Confirm the same "Duplicate" menu appears in all four views.
5. Open the menu, then click elsewhere on the page without selecting "Duplicate". Confirm the menu closes.

- [ ] **Step 7: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): add right-click Duplicate menu on meeting event pills"
```
