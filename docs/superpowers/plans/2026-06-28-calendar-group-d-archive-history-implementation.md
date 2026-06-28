# Calendar Group D: Archive/Restore + History/Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Archive/Restore to calendar events and wire major calendar lifecycle actions (create/edit/delete/archive/restore) into the existing `historyStore`/`AuditLogPage` infrastructure.

**Architecture:** `calendarStore.ts` gains an `archived` flag and two targeted actions. `recordHistory` (already exported from `historyStore.ts`, already used by `roleStore.ts`) is called directly from the calendar feature's UI-level handlers — never from inside `calendarStore.ts`'s generic actions — so only "major lifecycle" actions get logged, never RSVP/drag-reschedule/sync.

**Tech Stack:** React 19, TypeScript, zustand 5 (`persist` middleware, already in use). No test runner in this repo.

## Global Constraints

- No backend, no network calls.
- `target` on every `recordHistory` call is the event's **title** (matching the existing `roleStore.ts` convention of using a name, not introducing an id-linking field into the shared `historyStore`). Two same-titled events will share history entries in the per-event view — accepted simplification.
- `actor` is omitted on every `recordHistory` call, consistent with every existing call site in this codebase (`roleStore.ts` never passes one either — `historyStore.record` defaults it).
- Only these 7 actions get logged: create, single-event edit, series-wide edit, single-event delete, series delete, archive, restore. RSVP (`handleRsvp`), drag-and-drop reschedule (`handleCellDrop`), and all sync actions (Connect/Sync Now/Disconnect/conflict resolution) must NOT call `recordHistory` anywhere.
- Archive/Restore apply to a single event only — no series-wide archive/restore in this plan.
- Pulled sync events (`syncOrigin === 'pulled'`) stay read-only — the Archive button must be gated by the same `event.syncOrigin !== 'pulled'` rule as Edit/Duplicate/Delete.
- No test runner exists in this repo (no Jest/Vitest, no `test` script in `package.json`). Verification per task is `npm run build` for type safety plus a manual/code-level walkthrough via `npm run dev`.

---

## File Structure

- Modify: `src/features/employees/types/employee-calendar.types.ts` — add `archived?: boolean`.
- Modify: `src/store/calendarStore.ts` — add `archiveEvent`/`restoreEvent` actions.
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx` — history logging for create/delete; archived-events filtering; new "Archived Events" settings tab + Restore.
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx` — history logging for edit/series-edit/series-delete; Archive button; View Event History section.
- Modify: `src/styles/employee-my-calendar.css` — archived-list row styles, history-section styles.

---

### Task 1: Data model — `archived` field

**Files:**
- Modify: `src/features/employees/types/employee-calendar.types.ts`

**Interfaces:**
- Produces: `CalendarEvent.archived?: boolean` — every later task reads/writes this exact field name.

- [ ] **Step 1: Add the field**

In `employee-calendar.types.ts`, add `archived` right after `seriesId?: string;`:

```ts
export interface CalendarEvent {
  // ...existing fields...
  seriesId?: string;
  archived?: boolean;
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: no new TypeScript errors (additive, optional field).

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/types/employee-calendar.types.ts
git commit -m "feat(calendar): add archived field to CalendarEvent"
```

---

### Task 2: `calendarStore.ts` — `archiveEvent`/`restoreEvent` actions

**Files:**
- Modify: `src/store/calendarStore.ts`

**Interfaces:**
- Consumes: `CalendarEvent.archived` (Task 1).
- Produces: `useCalendarStore`'s `archiveEvent(id: string): void` and `restoreEvent(id: string): void` — Task 4 calls `archiveEvent`, Task 5 calls `restoreEvent`.

- [ ] **Step 1: Add to the `CalendarState` interface**

Add after `deleteSeries: (seriesId: string) => void;`:

```ts
  archiveEvent: (id: string) => void;
  restoreEvent: (id: string) => void;
```

- [ ] **Step 2: Add the implementations**

Add after the `deleteSeries: seriesId => set(...)` block, before `setSyncStatus`:

```ts
      archiveEvent: id => set(state => ({
        events: state.events.map(e => (e.id === id ? { ...e, archived: true } : e))
      })),
      restoreEvent: id => set(state => ({
        events: state.events.map(e => (e.id === id ? { ...e, archived: false } : e))
      })),
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expect no new TypeScript errors. This file isn't called by anything new yet, so this only checks the file itself is valid.

- [ ] **Step 4: Commit**

```bash
git add src/store/calendarStore.ts
git commit -m "feat(calendar): add archiveEvent/restoreEvent store actions"
```

---

### Task 3: History logging for create / edit / delete

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`

**Interfaces:**
- Consumes: `recordHistory` from `src/store/historyStore.ts` (already exists, already used by `src/store/roleStore.ts` — read that file for the exact call shape if you want a second reference).
- Produces: nothing new consumed by later tasks — Task 6 reads the *entries* these calls produce, but not any new exported symbol.

- [ ] **Step 1: Import `recordHistory` in `my-calendar-tab.tsx`**

Add alongside the existing `useCalendarStore` import (currently on its own line near the top of the file):

```tsx
import { recordHistory } from '../../../../store/historyStore';
```

- [ ] **Step 2: Log event creation in `handleCreateEvents`**

Find the current function:

```tsx
  const handleCreateEvents = (events: CalendarEvent[]) => {
    const provider: SyncProvider | null =
      connectedProviders.length === 1 ? connectedProviders[0]
      : connectedProviders.length > 1 ? lastConnectedProvider
      : null;

    const tagged = provider
      ? events.map(ev => ({ ...ev, syncProvider: provider, syncOrigin: 'pushed' as const }))
      : events;

    addEvents(tagged);
    setScope('my');
    setEnabledTypes(prev => {
      const next = new Set(prev);
      tagged.forEach(ev => next.add(ev.type));
      return next;
    });
  };
```

Insert a `recordHistory` call right after `addEvents(tagged);`:

```tsx
  const handleCreateEvents = (events: CalendarEvent[]) => {
    const provider: SyncProvider | null =
      connectedProviders.length === 1 ? connectedProviders[0]
      : connectedProviders.length > 1 ? lastConnectedProvider
      : null;

    const tagged = provider
      ? events.map(ev => ({ ...ev, syncProvider: provider, syncOrigin: 'pushed' as const }))
      : events;

    addEvents(tagged);
    const titleSample = tagged[0]?.title ?? 'event';
    recordHistory({
      category: 'Calendar',
      title: 'Event created',
      description: tagged.length > 1
        ? `Created ${tagged.length} occurrences of "${titleSample}".`
        : `Created "${titleSample}".`,
      target: titleSample
    });
    setScope('my');
    setEnabledTypes(prev => {
      const next = new Set(prev);
      tagged.forEach(ev => next.add(ev.type));
      return next;
    });
  };
```

- [ ] **Step 3: Log single-event deletion in `handleDeleteEvent`**

Replace:

```tsx
  const handleDeleteEvent = (id: string) => {
    deleteEventInStore(id);
    setSelectedEvent(null);
  };
```

with:

```tsx
  const handleDeleteEvent = (id: string) => {
    const target = localEvents.find(e => e.id === id);
    deleteEventInStore(id);
    if (target) {
      recordHistory({
        category: 'Calendar',
        title: 'Event deleted',
        description: `"${target.title}" was deleted.`,
        target: target.title
      });
    }
    setSelectedEvent(null);
  };
```

(The event must be looked up *before* `deleteEventInStore(id)` removes it from the store — `localEvents` is the existing store selector already in scope.)

- [ ] **Step 4: Import `recordHistory` in `EventDetailsModal.tsx`**

Add alongside the existing `useCalendarStore` import:

```tsx
import { recordHistory } from '../../../../store/historyStore';
```

- [ ] **Step 5: Log edit and series-edit in `finalizeSave`**

Replace:

```tsx
  const finalizeSave = () => {
    if (editingSeriesWide && event.seriesId) {
      updateSeries(event.seriesId, { title: form.title, location: form.location, note: form.note });
    } else {
      onSave(form);
    }
    setEditing(false);
    setConflicts(null);
    setEditingSeriesWide(false);
  };
```

with:

```tsx
  const finalizeSave = () => {
    if (editingSeriesWide && event.seriesId) {
      updateSeries(event.seriesId, { title: form.title, location: form.location, note: form.note });
      recordHistory({
        category: 'Calendar',
        title: 'Series updated',
        description: `All occurrences of "${event.title}" were updated.`,
        target: event.title
      });
    } else {
      onSave(form);
      recordHistory({
        category: 'Calendar',
        title: 'Event updated',
        description: `"${event.title}" was updated.`,
        target: event.title
      });
    }
    setEditing(false);
    setConflicts(null);
    setEditingSeriesWide(false);
  };
```

- [ ] **Step 6: Log series deletion**

Find the "All events in series" button's `onClick` (inside the `seriesAction ? (...) : (...)` block):

```tsx
                    } else if (event.seriesId) {
                      deleteSeries(event.seriesId);
                      onClose();
                    }
```

Replace with:

```tsx
                    } else if (event.seriesId) {
                      recordHistory({
                        category: 'Calendar',
                        title: 'Series deleted',
                        description: `All occurrences of "${event.title}" were deleted.`,
                        target: event.title
                      });
                      deleteSeries(event.seriesId);
                      onClose();
                    }
```

(The "This event" delete branch already routes through `onDelete(event.id)` → `handleDeleteEvent` in `my-calendar-tab.tsx`, Step 3 above — no separate change needed here for single-event series-member deletes.)

- [ ] **Step 7: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Create a new meeting — open Admin → History (or wherever this app's `AuditLogPage` is routed) and confirm a "Event created" entry with category "Calendar" appears. Edit that event's title and save — confirm an "Event updated" entry appears. Delete it — confirm "Event deleted" appears. Create a recurring meeting (3 occurrences), edit "all events in series" — confirm "Series updated" appears once (not 3 times). Delete "all events in series" — confirm "Series deleted" appears once. Confirm RSVP (Accept/Decline/Tentative) and a drag-and-drop reschedule do NOT add any history entries.

- [ ] **Step 8: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx src/features/employees/components/my-calendar/EventDetailsModal.tsx
git commit -m "feat(calendar): log create/edit/delete actions to history/audit"
```

---

### Task 4: Archive button

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `archiveEvent` from `useCalendarStore` (Task 2); `recordHistory` (Task 3's import, already in this file).
- Produces: nothing new consumed by later tasks (Task 5's Archived Events tab reads `ev.archived` directly from the store, not anything this task exports).

- [ ] **Step 1: Add the `Archive` icon import and `archiveEvent` selector**

In `EventDetailsModal.tsx`, change the lucide-react import line:

```tsx
import { X, MapPin, Users as UsersIcon, Trash2, Pencil, Copy } from 'lucide-react';
```

to:

```tsx
import { X, MapPin, Users as UsersIcon, Trash2, Pencil, Copy, Archive } from 'lucide-react';
```

Add the selector alongside `updateSeries`/`deleteSeries`:

```tsx
  const updateSeries = useCalendarStore(s => s.updateSeries);
  const deleteSeries = useCalendarStore(s => s.deleteSeries);
  const archiveEvent = useCalendarStore(s => s.archiveEvent);
```

- [ ] **Step 2: Add `handleArchive`**

Add right after `finalizeSave`/`handleSave` (after the `handleSave` function):

```tsx
  const handleArchive = () => {
    archiveEvent(event.id);
    recordHistory({
      category: 'Calendar',
      title: 'Event archived',
      description: `"${event.title}" was archived.`,
      target: event.title
    });
    onClose();
  };
```

- [ ] **Step 3: Add the Archive button**

In the normal (non-`seriesAction`) actions block, add a 4th button after Delete:

```tsx
                {event.syncOrigin !== 'pulled' && (
                  <button
                    type="button"
                    className="era-btn emc-modal__action emc-modal__action--danger"
                    onClick={() => (event.seriesId ? setSeriesAction('delete') : onDelete(event.id))}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
```

becomes:

```tsx
                {event.syncOrigin !== 'pulled' && (
                  <button
                    type="button"
                    className="era-btn emc-modal__action emc-modal__action--danger"
                    onClick={() => (event.seriesId ? setSeriesAction('delete') : onDelete(event.id))}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
                {event.syncOrigin !== 'pulled' && (
                  <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={handleArchive}>
                    <Archive size={13} />
                    Archive
                  </button>
                )}
```

- [ ] **Step 4: Exclude archived events from the calendar grid**

In `my-calendar-tab.tsx`, replace `filteredEvents`:

```tsx
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedEvents.filter(ev =>
      enabledTypes.has(ev.type) && (!q || ev.title.toLowerCase().includes(q))
    );
  }, [scopedEvents, enabledTypes, searchQuery]);
```

with:

```tsx
  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedEvents.filter(ev =>
      !ev.archived && enabledTypes.has(ev.type) && (!q || ev.title.toLowerCase().includes(q))
    );
  }, [scopedEvents, enabledTypes, searchQuery]);
```

- [ ] **Step 5: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Open any plain event, click Archive — confirm the modal closes and the event disappears from every calendar view (Month/Week/Day/Agenda). Confirm a pulled sync event shows no Archive button (same as it shows no Edit/Duplicate/Delete).

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): add Archive action, hide archived events from calendar views"
```

---

### Task 5: Archived Events settings tab + Restore

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: `restoreEvent` from `useCalendarStore` (Task 2); `recordHistory` (Task 3's import, already in this file); `ev.archived` (Task 1, set via Task 4's Archive button).
- Produces: nothing consumed by later tasks — leaf feature.

- [ ] **Step 1: Add the `archived` settings tab**

Change:

```tsx
type SettingsTabId = 'sync';

const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'sync', label: 'Calendar Sync' },
];
```

to:

```tsx
type SettingsTabId = 'sync' | 'archived';

const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'sync', label: 'Calendar Sync' },
  { id: 'archived', label: 'Archived Events' },
];
```

- [ ] **Step 2: Add the `Archive`/`ArchiveRestore` icon imports and `restoreEvent` selector**

Change the lucide-react import block:

```tsx
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X, HelpCircle,
  Sun, Plane, Clock, Bell, CalendarX2, Settings,
  GraduationCap, LogOut, Building2, Copy
} from 'lucide-react';
```

to:

```tsx
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X, HelpCircle,
  Sun, Plane, Clock, Bell, CalendarX2, Settings,
  GraduationCap, LogOut, Building2, Copy, Archive, ArchiveRestore
} from 'lucide-react';
```

Add the store selector alongside `deleteEventInStore`:

```tsx
  const deleteEventInStore = useCalendarStore(s => s.deleteEvent);
  const restoreEventInStore = useCalendarStore(s => s.restoreEvent);
```

- [ ] **Step 3: Compute `archivedEvents` and add `handleRestoreEvent`**

Add this near the other `useMemo`s (e.g. right after `scopedEvents`):

```tsx
  const archivedEvents = useMemo(() => localEvents.filter(ev => ev.archived), [localEvents]);
```

Add this near `handleDeleteEvent`/`handleSaveEvent`:

```tsx
  const handleRestoreEvent = (event: CalendarEvent) => {
    restoreEventInStore(event.id);
    recordHistory({
      category: 'Calendar',
      title: 'Event restored',
      description: `"${event.title}" was restored.`,
      target: event.title
    });
  };
```

- [ ] **Step 4: Render the Archived Events panel**

In the Calendar Settings modal's body, right after the existing `{settingsTab === 'sync' && (...)}` block (before the closing `</div>` of `emc-modal__body emc-modal__body--lg`), add:

```tsx
              {settingsTab === 'archived' && (
                <div className="emc-settings__panel">
                  <div className="emc-rail__head">
                    <Archive size={13} />
                    <span className="emc-rail__title">Archived Events</span>
                  </div>
                  {archivedEvents.length === 0 ? (
                    <p className="emc-rail__empty">No archived events</p>
                  ) : (
                    <div className="emc-archived__list">
                      {archivedEvents.map(ev => (
                        <div key={ev.id} className="emc-archived__row">
                          <span className="emc-archived__title">{ev.title}</span>
                          <span className="emc-archived__date">{ev.date}</span>
                          <button
                            type="button"
                            className="era-btn era-btn--ghost emc-sync__btn"
                            onClick={() => handleRestoreEvent(ev)}
                          >
                            <ArchiveRestore size={12} />
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
```

- [ ] **Step 5: Add CSS**

In `employee-my-calendar.css`, after the `.emc-sync__meta` block:

```css
.emc-archived__list {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
}

.emc-archived__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.emc-archived__title {
  font-size: 0.75rem;
  color: var(--text);
  flex: 1;
}

.emc-archived__date {
  font-size: 0.6875rem;
  color: var(--nexus-text-muted);
}
```

- [ ] **Step 6: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Archive an event (per Task 4), then open Calendar Settings → "Archived Events" tab — confirm it lists the archived event with its title/date and a Restore button. Click Restore — confirm the event disappears from this list and reappears in the normal calendar grid. With nothing archived, confirm the tab shows "No archived events".

- [ ] **Step 7: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): add Archived Events settings tab with restore"
```

---

### Task 6: View Event History (#93)

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: `useHistoryStore` from `src/store/historyStore.ts`; history entries produced by Tasks 3 and 4's `recordHistory` calls.
- Produces: nothing consumed by later tasks — leaf feature, last task in this plan.

- [ ] **Step 1: Extend the history-store import and add the selector**

Change the import added in Task 3:

```tsx
import { recordHistory } from '../../../../store/historyStore';
```

to:

```tsx
import { recordHistory, useHistoryStore } from '../../../../store/historyStore';
```

Add this near the top of the component, alongside the other store selectors:

```tsx
  const historyEntries = useHistoryStore(s => s.entries).filter(
    e => e.category === 'Calendar' && e.target === event.title
  );
```

- [ ] **Step 2: Render the History section**

In the non-editing view, right after the tentative-status note and before the `seriesAction ? (...) : (...)` actions block:

```tsx
            {event.status === 'tentative' && (
              <p className="emc-modal__tentative-note">Tentative response.</p>
            )}

            {historyEntries.length > 0 && (
              <div className="emc-modal__history">
                <p className="emc-modal__history-label">History</p>
                <ul className="emc-modal__history-list">
                  {historyEntries.map(entry => (
                    <li key={entry.id}>{entry.title} — {new Date(entry.createdAt).toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            )}
```

(Only the new block is added — the tentative-note paragraph above it is unchanged, shown here for placement context.)

- [ ] **Step 3: Add CSS**

In `employee-my-calendar.css`, after the `.emc-modal__tentative-note` block:

```css
.emc-modal__history-label {
  margin: 0.5rem 0 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--nexus-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.emc-modal__history-list {
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
}
```

- [ ] **Step 4: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Create an event, then edit it once and delete... actually don't delete it (deleting closes the modal) — instead: create an event, edit its title once, then reopen it — confirm a "History" section appears showing both "Event created" and "Event updated" entries with timestamps. Open a brand-new, never-touched mock event from the seed data (e.g. "Sprint Review") — confirm no History section renders (no entries exist for it).

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): show per-event history in the details modal"
```

---

## Self-Review Notes

- Spec §1 (data model) → Task 1. §2 (store actions) → Task 2. §3 (history wiring, 7 call sites) → Tasks 3 (5 sites: create, edit, series-edit, delete, series-delete), 4 (archive), 5 (restore). §4 (Archive/Restore UI) → Tasks 4–5. §5 (View Event History) → Task 6. §6 (out of scope: series-wide archive, id-based linking, RSVP/reschedule/sync logging, confirmation dialogs, AuditLogPage changes) → none of these appear in any task. §7 (verification convention) → reflected in Global Constraints and every task's verify step.
- Type/name consistency check: `archived`, `archiveEvent`, `restoreEvent`, `archivedEvents`, `handleRestoreEvent`, `handleArchive` are spelled identically everywhere they appear across Tasks 1, 2, 4, and 5.
- Confirmed `historyStore.ts`'s `recordHistory` accepts `{ category, title, description, target }` with `actor`/`outcome` optional and auto-filled — every call site in this plan matches that shape exactly (no `actor` passed anywhere, matching the `roleStore.ts` convention).
