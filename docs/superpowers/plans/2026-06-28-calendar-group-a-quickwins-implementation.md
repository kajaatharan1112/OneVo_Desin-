# Calendar Group A Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move My Calendar's state into a persisted zustand store, then add a Tentative RSVP response, real recurring-series edit/delete semantics, and a conflict-override prompt on drag-and-drop reschedule.

**Architecture:** A new `src/store/calendarStore.ts` (zustand + `persist`, matching `historyStore.ts`/`roleStore.ts`) becomes the single source of truth for calendar events and sync status. `my-calendar-tab.tsx` is first mechanically migrated to read/write through this store with zero behavior change, then each of the three features is layered on top as its own task.

**Tech Stack:** React 19, TypeScript, zustand 5 (`persist` middleware), no test runner in this repo (no Jest/Vitest, no `test` script in `package.json`).

## Global Constraints

- No backend, no network calls — persistence is `localStorage` only, via zustand's `persist` middleware.
- Follow the exact store convention already used by `src/store/historyStore.ts` and `src/store/roleStore.ts`: `create<State>()(persist((set) => ({...}), { name: 'onevo-<x>-store', version: 1 }))`.
- Events without `seriesId` (everything created today, and all non-recurring types) must behave with **zero change** — no extra prompts, no new UI.
- Pulled sync events (`syncOrigin === 'pulled'`) remain read-only — the existing rule in `EventDetailsModal.tsx` (`event.syncOrigin !== 'pulled'`) must keep gating Edit/Duplicate/Delete exactly as today; series-editing UI must not appear for pulled events either.
- No test runner exists in this repo. Verification per task is `npm run build` (type safety) plus a manual/code-level walkthrough via `npm run dev`, consistent with how the calendar-sync feature was verified.
- Component-local, purely-transient UI state (`connectingProvider`, `activeConflict`, drag state, filter state, modal-open flags) stays as `useState` — only `events`, `syncStatus`, and `lastConnectedProvider` move into the store.

---

## File Structure

- Modify: `src/features/employees/types/employee-calendar.types.ts` — add `'tentative'` to `CalendarEventStatus`, add `seriesId?: string` to `CalendarEvent`.
- Create: `src/store/calendarStore.ts` — persisted zustand store for calendar events/sync status.
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx` — migrate state to the store; add Tentative button + series-edit entry point + drag-conflict popup.
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx` — tentative note; series this-event/all-events choice on Edit/Delete.
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts` — stamp `seriesId` on recurring event creation.
- Modify: `src/styles/employee-my-calendar.css` — tentative button/pill styles, drag-conflict popup styles, series-choice button styles.

---

### Task 1: Data model — tentative status and seriesId field

**Files:**
- Modify: `src/features/employees/types/employee-calendar.types.ts`

**Interfaces:**
- Produces: `CalendarEventStatus` including `'tentative'`, and `CalendarEvent.seriesId?: string` — every later task reads/writes these.

- [ ] **Step 1: Add `'tentative'` to `CalendarEventStatus` and `seriesId` to `CalendarEvent`**

In `employee-calendar.types.ts`, change line 7:

```ts
export type CalendarEventStatus = 'confirmed' | 'pending' | 'needs-response' | 'rejected' | 'tentative';
```

Add `seriesId` to `CalendarEvent`, right after `syncOrigin?: 'pulled' | 'pushed';`:

```ts
export interface CalendarEvent {
  // ...existing fields...
  syncProvider?: SyncProvider;
  syncOrigin?: 'pulled' | 'pushed';
  seriesId?: string;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run build`
Expected: no new TypeScript errors. Both changes are additive/optional — no existing object literal needs to change. (The repo has pre-existing, unrelated errors in `src/features/work/` — confirm your change doesn't add to that count by comparing the error list before/after, e.g. via `git stash`.)

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/types/employee-calendar.types.ts
git commit -m "feat(calendar): add tentative status and seriesId field"
```

---

### Task 2: `calendarStore.ts` — persisted zustand store

**Files:**
- Create: `src/store/calendarStore.ts`

**Interfaces:**
- Consumes: `CalendarEvent`, `CalendarSyncStatus`, `SyncProvider` from `../features/employees/types/employee-calendar.types`; `employeeCalendarData` from `../features/employees/data/employee-calendar.data`.
- Produces: `useCalendarStore` hook with state `events: CalendarEvent[]`, `syncStatus: CalendarSyncStatus`, `lastConnectedProvider: SyncProvider | null`, and actions `addEvents`, `updateEvent`, `deleteEvent`, `setEvents`, `updateSeries`, `deleteSeries`, `setSyncStatus`, `setLastConnectedProvider` — Task 3 calls every one of these by exact name.

Note: `setEvents` is one addition beyond the original design note — it's a plain bulk replace, needed because Task 3's `handleDisconnect` migration does a single filter-then-map pass over all events (remove pulled events for a provider AND strip tags from pushed events for that provider, in one pass) that doesn't decompose cleanly into the other five mutating actions. The component still computes the transformed list; the store just stores it — same division of responsibility as every other action here.

- [ ] **Step 1: Write the store**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { employeeCalendarData } from '../features/employees/data/employee-calendar.data';
import type { CalendarEvent, CalendarSyncStatus, SyncProvider } from '../features/employees/types/employee-calendar.types';

interface CalendarState {
  events: CalendarEvent[];
  syncStatus: CalendarSyncStatus;
  lastConnectedProvider: SyncProvider | null;

  addEvents: (events: CalendarEvent[]) => void;
  updateEvent: (id: string, updated: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
  updateSeries: (seriesId: string, changes: Partial<CalendarEvent>) => void;
  deleteSeries: (seriesId: string) => void;
  setSyncStatus: (syncStatus: CalendarSyncStatus) => void;
  setLastConnectedProvider: (provider: SyncProvider | null) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    set => ({
      events: employeeCalendarData.events,
      syncStatus: employeeCalendarData.syncStatus,
      lastConnectedProvider: employeeCalendarData.syncStatus.google === 'connected' ? 'google' : null,

      addEvents: events => set(state => ({ events: [...state.events, ...events] })),
      updateEvent: (id, updated) => set(state => ({
        events: state.events.map(e => (e.id === id ? updated : e))
      })),
      deleteEvent: id => set(state => ({ events: state.events.filter(e => e.id !== id) })),
      setEvents: events => set({ events }),
      updateSeries: (seriesId, changes) => set(state => ({
        events: state.events.map(e => (e.seriesId === seriesId ? { ...e, ...changes } : e))
      })),
      deleteSeries: seriesId => set(state => ({
        events: state.events.filter(e => e.seriesId !== seriesId)
      })),
      setSyncStatus: syncStatus => set({ syncStatus }),
      setLastConnectedProvider: provider => set({ lastConnectedProvider: provider })
    }),
    { name: 'onevo-calendar-store', version: 1 }
  )
);
```

- [ ] **Step 2: Verify types compile**

Run: `npm run build`
Expected: no new TypeScript errors. This file is not imported anywhere yet, so it cannot affect other files' compilation — this step only checks the file itself is valid.

- [ ] **Step 3: Commit**

```bash
git add src/store/calendarStore.ts
git commit -m "feat(calendar): add persisted calendarStore"
```

---

### Task 3: Migrate `my-calendar-tab.tsx` to `calendarStore`

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `useCalendarStore` and all eight state fields/actions from Task 2.
- Produces: `my-calendar-tab.tsx` with no local `localEvents`/`syncStatus`/`lastConnectedProvider` state — Tasks 4, 5, and 6 all build on top of this migrated version and call the same store actions.

This task is a **pure relocation** — every behavior must stay identical to today. Do not change any UI, validation, or business logic while doing this task; that happens in Tasks 4–6.

- [ ] **Step 1: Replace state declarations**

Replace lines 108–115:

```tsx
export const MyCalendarTab: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState(employeeCalendarData.syncStatus);
  const [lastConnectedProvider, setLastConnectedProvider] = useState<SyncProvider | null>(
    employeeCalendarData.syncStatus.google === 'connected' ? 'google' : null
  );
  const [connectingProvider, setConnectingProvider] = useState<SyncProvider | null>(null);

  // Local mutable copy of the one events table — Edit/Delete write back here.
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(employeeCalendarData.events);
```

with:

```tsx
export const MyCalendarTab: React.FC = () => {
  const localEvents = useCalendarStore(s => s.events);
  const syncStatus = useCalendarStore(s => s.syncStatus);
  const lastConnectedProvider = useCalendarStore(s => s.lastConnectedProvider);
  const addEvents = useCalendarStore(s => s.addEvents);
  const updateEvent = useCalendarStore(s => s.updateEvent);
  const deleteEventInStore = useCalendarStore(s => s.deleteEvent);
  const setEventsInStore = useCalendarStore(s => s.setEvents);
  const setSyncStatusInStore = useCalendarStore(s => s.setSyncStatus);
  const setLastConnectedProviderInStore = useCalendarStore(s => s.setLastConnectedProvider);
  const [connectingProvider, setConnectingProvider] = useState<SyncProvider | null>(null);
```

Add the import, alongside the other imports near the top of the file (after the `calendar-sync.utils` import on line 11):

```tsx
import { useCalendarStore } from '../../../../store/calendarStore';
```

(Path check: `my-calendar-tab.tsx` lives at `src/features/employees/components/my-calendar/`, four directories below `src/`, so `../../../../store/calendarStore` resolves to `src/store/calendarStore`.)

`localEvents` keeps its existing name on purpose — every other line in this file (line 140 `scopedEvents`, line 387 `findEventConflicts`, line 1019/1148 `existingMyEvents`, etc.) already reads `localEvents` and needs zero further changes as a result.

- [ ] **Step 2: Migrate `handleCreateEvents` (lines 190–207)**

Replace:

```tsx
    setLocalEvents(prev => [...prev, ...tagged]);
    setScope('my');
```

with:

```tsx
    addEvents(tagged);
    setScope('my');
```

(The rest of the function — computing `provider` and `tagged`, and the `setEnabledTypes` call — is unchanged.)

- [ ] **Step 3: Migrate `handleConnect` (lines 209–217)**

Replace the whole function:

```tsx
  const handleConnect = (provider: SyncProvider) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, [provider]: 'connected', lastSynced: 'just now' }));
      setLastConnectedProvider(provider);
      setLocalEvents(prev => [...prev, ...pullEvents(provider)]);
      setConnectingProvider(null);
    }, 800);
  };
```

with:

```tsx
  const handleConnect = (provider: SyncProvider) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      const store = useCalendarStore.getState();
      store.setSyncStatus({ ...store.syncStatus, [provider]: 'connected', lastSynced: 'just now' });
      store.setLastConnectedProvider(provider);
      store.addEvents(pullEvents(provider));
      setConnectingProvider(null);
    }, 800);
  };
```

(`useCalendarStore.getState()` is used here instead of the `syncStatus`/`addEvents` selectors from Step 1 because this code runs inside a `setTimeout` 800ms after the click — reading fresh state at execution time, rather than a value closed over at click time, avoids a stale-state bug if anything else changes calendar state in that window.)

- [ ] **Step 4: Migrate `finishSync` and `handleSyncNow` (lines 221–248)**

Replace:

```tsx
  const finishSync = (_provider: SyncProvider) => {
    setSyncStatus(prev => ({ ...prev, lastSynced: 'just now' }));
    setConnectingProvider(null);
  };

  const handleSyncNow = (provider: SyncProvider) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      setLocalEvents(prev => {
        const existingTitles = new Set(
          prev.filter(ev => ev.syncProvider === provider && ev.syncOrigin === 'pulled').map(ev => ev.title)
        );
        const fresh = pullEvents(provider).filter(ev => !existingTitles.has(ev.title));
        const next = [...prev, ...fresh];

        const conflict = detectConflict(
          next.filter(ev => ev.syncProvider === provider && ev.syncOrigin === 'pushed'),
          provider
        );
        if (conflict) {
          setActiveConflict({ provider, conflict });
        } else {
          finishSync(provider);
        }
        return next;
      });
    }, 800);
  };
```

with:

```tsx
  const finishSync = (_provider: SyncProvider) => {
    const store = useCalendarStore.getState();
    store.setSyncStatus({ ...store.syncStatus, lastSynced: 'just now' });
    setConnectingProvider(null);
  };

  const handleSyncNow = (provider: SyncProvider) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      const store = useCalendarStore.getState();
      const existingTitles = new Set(
        store.events.filter(ev => ev.syncProvider === provider && ev.syncOrigin === 'pulled').map(ev => ev.title)
      );
      const fresh = pullEvents(provider).filter(ev => !existingTitles.has(ev.title));
      store.addEvents(fresh);

      const next = [...store.events, ...fresh];
      const conflict = detectConflict(
        next.filter(ev => ev.syncProvider === provider && ev.syncOrigin === 'pushed'),
        provider
      );
      if (conflict) {
        setActiveConflict({ provider, conflict });
      } else {
        finishSync(provider);
      }
    }, 800);
  };
```

(This also resolves a Minor finding from the calendar-sync feature's final review: the old version called `setActiveConflict`/`finishSync` as side effects *inside* a `setLocalEvents` updater function, which violates React's updater-purity contract under StrictMode. The new version reads/writes the store directly in a plain sequential handler — no updater function, no purity violation.)

- [ ] **Step 5: Migrate `handleDisconnect` (lines 250–260)**

Replace:

```tsx
  const handleDisconnect = (provider: SyncProvider) => {
    setLocalEvents(prev => prev
      .filter(ev => !(ev.syncProvider === provider && ev.syncOrigin === 'pulled'))
      .map(ev => (ev.syncProvider === provider && ev.syncOrigin === 'pushed')
        ? { ...ev, syncProvider: undefined, syncOrigin: undefined }
        : ev
      )
    );
    setSyncStatus(prev => ({ ...prev, [provider]: 'disconnected' }));
    if (lastConnectedProvider === provider) setLastConnectedProvider(null);
  };
```

with:

```tsx
  const handleDisconnect = (provider: SyncProvider) => {
    const store = useCalendarStore.getState();
    store.setEvents(store.events
      .filter(ev => !(ev.syncProvider === provider && ev.syncOrigin === 'pulled'))
      .map(ev => (ev.syncProvider === provider && ev.syncOrigin === 'pushed')
        ? { ...ev, syncProvider: undefined, syncOrigin: undefined }
        : ev
      )
    );
    store.setSyncStatus({ ...store.syncStatus, [provider]: 'disconnected' });
    if (store.lastConnectedProvider === provider) store.setLastConnectedProvider(null);
  };
```

- [ ] **Step 6: Migrate `handleConflictKeepTheirs` (lines 268–276)**

Replace:

```tsx
  const handleConflictKeepTheirs = () => {
    if (!activeConflict) return;
    const { provider, conflict } = activeConflict;
    setLocalEvents(prev => prev.map(ev => (
      ev.id === conflict.eventId ? { ...ev, start: conflict.theirsStart, end: conflict.theirsEnd } : ev
    )));
    finishSync(provider);
    setActiveConflict(null);
  };
```

with:

```tsx
  const handleConflictKeepTheirs = () => {
    if (!activeConflict) return;
    const { provider, conflict } = activeConflict;
    const store = useCalendarStore.getState();
    const target = store.events.find(ev => ev.id === conflict.eventId);
    if (target) {
      store.updateEvent(target.id, { ...target, start: conflict.theirsStart, end: conflict.theirsEnd });
    }
    finishSync(provider);
    setActiveConflict(null);
  };
```

(`handleConflictKeepMine`, just above it at lines 262–266, makes no event-list change and needs no edit.)

- [ ] **Step 7: Migrate `handleDeleteEvent`, `handleSaveEvent`, `handleRsvp` (lines 403–415)**

Replace:

```tsx
  const handleDeleteEvent = (id: string) => {
    setLocalEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  };
  const handleSaveEvent = (updated: CalendarEvent) => {
    setLocalEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    setSelectedEvent(updated);
  };
  const handleRsvp = (id: string, accepted: boolean) => {
    setLocalEvents(prev => prev.map(e => (
      e.id === id ? { ...e, needsResponse: false, status: accepted ? 'confirmed' : 'rejected' } : e
    )));
  };
```

with:

```tsx
  const handleDeleteEvent = (id: string) => {
    deleteEventInStore(id);
    setSelectedEvent(null);
  };
  const handleSaveEvent = (updated: CalendarEvent) => {
    updateEvent(updated.id, updated);
    setSelectedEvent(updated);
  };
  const handleRsvp = (id: string, accepted: boolean) => {
    const target = localEvents.find(e => e.id === id);
    if (!target) return;
    updateEvent(id, { ...target, needsResponse: false, status: accepted ? 'confirmed' : 'rejected' });
  };
```

(`handleRsvp`'s signature stays binary for this task — Task 4 changes it to the 3-way version. `localEvents` here is the selector value from Step 1, safe to use since this runs synchronously on click, not inside a delayed callback.)

- [ ] **Step 8: Migrate the Calendar Settings sync panel JSX (lines 1062–1063, 1104)**

These two reads already work unchanged, since `syncStatus` is still in scope (now from the Step 1 selector instead of local `useState`) — **no edit needed** for `syncStatus.google`/`syncStatus.outlook` (lines 1062–1063) or `Synced {syncStatus.lastSynced}` (line 1104). Confirm by reading the file that no `setSyncStatus`/`setLastConnectedProvider`/`setLocalEvents` calls remain anywhere outside the functions already migrated in Steps 2–7 — search the file for those three identifiers; any remaining hit is a bug in this task.

- [ ] **Step 9: Verify build and behavior**

Run: `npm run build` — expect no new TypeScript errors (and zero remaining references to `setLocalEvents`, `setSyncStatus`, or bare `setLastConnectedProvider` — grep the file to confirm).

Run: `npm run dev` and manually verify every calendar-sync journey still works exactly as before this task (since this is a pure relocation, nothing should look or behave differently): Connect Google/Outlook (spinner, mock events appear), Sync Now twice in a row (no duplicate pulls), trigger a conflict and resolve it both ways (Keep mine / Keep theirs), Disconnect (pulled events removed, pushed events untagged), create/edit/delete a plain event, Accept/Decline an invite.

- [ ] **Step 10: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "refactor(calendar): migrate my-calendar-tab state into calendarStore"
```

---

### Task 4: Tentative Response

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: `'tentative'` from `CalendarEventStatus` (Task 1); `updateEvent`, `localEvents` from the Task 3 migration.
- Produces: nothing consumed by later tasks — this is a leaf feature.

- [ ] **Step 1: Change `handleRsvp`'s signature**

In `my-calendar-tab.tsx`, replace the Task 3 version of `handleRsvp`:

```tsx
  const handleRsvp = (id: string, accepted: boolean) => {
    const target = localEvents.find(e => e.id === id);
    if (!target) return;
    updateEvent(id, { ...target, needsResponse: false, status: accepted ? 'confirmed' : 'rejected' });
  };
```

with:

```tsx
  const handleRsvp = (id: string, response: 'accepted' | 'declined' | 'tentative') => {
    const target = localEvents.find(e => e.id === id);
    if (!target) return;
    const status = response === 'accepted' ? 'confirmed' : response === 'declined' ? 'rejected' : 'tentative';
    updateEvent(id, { ...target, needsResponse: false, status });
  };
```

- [ ] **Step 2: Add the third button to `RailEvent`**

Add `HelpCircle` to the `lucide-react` import at the top of the file (line 2–7 currently reads `Check, X,` among the icon imports — add `HelpCircle` next to them):

```tsx
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X, HelpCircle,
  Sun, Plane, Clock, Bell, CalendarX2, Settings,
  GraduationCap, LogOut, Building2, Copy
} from 'lucide-react';
```

Replace the `RailEvent` actions block (lines 797–802):

```tsx
        {ev.needsResponse && (
          <div className="emc-rail__ev-actions">
            <button type="button" className="emc-iconbtn emc-iconbtn--accept" aria-label="Accept" onClick={() => handleRsvp(ev.id, true)}><Check size={10} /></button>
            <button type="button" className="emc-iconbtn emc-iconbtn--decline" aria-label="Decline" onClick={() => handleRsvp(ev.id, false)}><X size={10} /></button>
          </div>
        )}
```

with:

```tsx
        {ev.needsResponse && (
          <div className="emc-rail__ev-actions">
            <button type="button" className="emc-iconbtn emc-iconbtn--accept" aria-label="Accept" onClick={() => handleRsvp(ev.id, 'accepted')}><Check size={10} /></button>
            <button type="button" className="emc-iconbtn emc-iconbtn--tentative" aria-label="Tentative" onClick={() => handleRsvp(ev.id, 'tentative')}><HelpCircle size={10} /></button>
            <button type="button" className="emc-iconbtn emc-iconbtn--decline" aria-label="Decline" onClick={() => handleRsvp(ev.id, 'declined')}><X size={10} /></button>
          </div>
        )}
```

- [ ] **Step 3: Add the tentative pill modifier in all 4 calendar views + agenda icon**

This file has 6 spots where `ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''` already appears (Month pill ~line 541, Week all-day pill ~line 608, Week timed pill ~line 640, Day all-day pill ~line 674, Day timed pill ~line 700, Agenda icon ~line 760). In every one of these 6 spots, change the ternary chain from:

```tsx
${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ''}
```

to:

```tsx
${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}
```

Do this in all 6 locations — search the file for `emc-evpill--rejected-status` to find every occurrence; each one needs this same edit.

- [ ] **Step 4: Add the tentative note in `EventDetailsModal.tsx`**

After the existing rejected note (around line 146–148):

```tsx
            {event.status === 'rejected' && (
              <p className="emc-modal__rejected-note">Rejected by manager.</p>
            )}
```

add:

```tsx
            {event.status === 'tentative' && (
              <p className="emc-modal__tentative-note">Tentative response.</p>
            )}
```

- [ ] **Step 5: Add CSS**

In `employee-my-calendar.css`, after `.emc-iconbtn--decline:hover` (around line 908–910):

```css
.emc-iconbtn--tentative {
  color: #d97706;
  border-color: color-mix(in srgb, #d97706 30%, var(--border));
}

.emc-iconbtn--tentative:hover {
  background: color-mix(in srgb, #d97706 10%, transparent);
}
```

After `.emc-evpill--rejected-status` (around line 1895–1899):

```css
.emc-evpill--tentative-status {
  --ev-color: #d97706;
  --ev-bg: color-mix(in srgb, #d97706 10%, transparent);
  border-style: dashed;
}
```

After `.emc-modal__rejected-note` (around line 1880–1884):

```css
.emc-modal__tentative-note {
  margin: 0;
  font-size: 0.78rem;
  color: #d97706;
}
```

- [ ] **Step 6: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Find a pending invite in the Invitations rail (e.g. "Product Demo" or "Design Review" on 2026-06-18/19 in the default mock data — both have `needsResponse: true`). Click the new middle (Tentative) button — confirm the event gets a distinct amber dashed pill in Month/Week/Day/Agenda views, and opening it in the details modal shows "Tentative response."

- [ ] **Step 7: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx src/features/employees/components/my-calendar/EventDetailsModal.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): add tentative RSVP response"
```

---

### Task 5: Recurring series — real edit/delete semantics

**Files:**
- Modify: `src/features/employees/components/my-calendar/new-event-wizard.utils.ts`
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`

**Interfaces:**
- Consumes: `seriesId` field (Task 1); `updateSeries`/`deleteSeries` from `useCalendarStore` (Task 2).
- Produces: nothing consumed by later tasks — leaf feature.

- [ ] **Step 1: Stamp `seriesId` on recurring event creation**

In `new-event-wizard.utils.ts`, replace `buildEventsFromForm` (lines 242–283):

```ts
export function buildEventsFromForm(form: NewEventFormState): CalendarEvent[] {
  const dates = buildOccurrenceDates(form);
  const ts = Date.now();
  const { calendarType, source } = TYPE_META[form.type];
  const status: CalendarEventStatus = form.type === 'company-event' ? 'pending' : 'confirmed';
  const needsAttendees = form.type === 'meeting' || form.type === 'training';
  const seriesId = form.recurring && dates.length > 1 ? `series-${ts}` : undefined;

  return dates.map((date, i) => {
    const event: CalendarEvent = {
      id: `${form.type}-${ts}-${i}`,
      title: form.title.trim(),
      date,
      type: calendarType,
      status,
      source,
      scope: form.audience,
      allDay: form.allDay,
      priority: form.priority,
    };

    if (seriesId) event.seriesId = seriesId;
    if (form.category) event.category = form.category;
    if (form.location.trim()) event.location = form.location.trim();
    if (form.notes.trim()) event.note = form.notes.trim();
    if (form.type === 'leave') event.leaveType = form.leaveType;
    if (!form.allDay) {
      event.start = form.start;
      event.end = form.end;
    }
    if (needsAttendees && form.attendees.length > 0) {
      event.attendees = form.attendees.map(attendeeKey);
      event.attendeeRsvp = form.attendees.reduce<Record<string, RsvpStatus>>((acc, a) => {
        acc[attendeeKey(a)] = 'pending';
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

(Only two changes from the original: the new `seriesId` constant computed once before the `.map()`, and the `if (seriesId) event.seriesId = seriesId;` line inside it. Non-recurring forms, and recurring forms that happen to produce only 1 date, get no `seriesId` — consistent with "a series needs at least 2 members".)

- [ ] **Step 2: Add series-aware action state to `EventDetailsModal.tsx`**

Add the import, alongside the existing imports at the top of the file:

```tsx
import { useCalendarStore } from '../../../../store/calendarStore';
```

Add new state right after the existing `conflicts` state (line 38) — `seriesAction` tracks which two-button prompt (if any) is showing, `editingSeriesWide` tracks whether the edit form currently open is editing one event or the whole series:

```tsx
  const [seriesAction, setSeriesAction] = useState<'edit' | 'delete' | null>(null);
  const [editingSeriesWide, setEditingSeriesWide] = useState(false);
  const updateSeries = useCalendarStore(s => s.updateSeries);
  const deleteSeries = useCalendarStore(s => s.deleteSeries);
```

- [ ] **Step 3: Replace the actions block with series-aware branching**

Replace the actions block (lines 150–169):

```tsx
            <div className="emc-modal__actions">
              {event.syncOrigin !== 'pulled' && (
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={startEdit}>
                  <Pencil size={13} />
                  Edit
                </button>
              )}
              {event.syncOrigin !== 'pulled' && event.type === 'meeting' && (
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => onDuplicate(event)}>
                  <Copy size={13} />
                  Duplicate
                </button>
              )}
              {event.syncOrigin !== 'pulled' && (
                <button type="button" className="era-btn emc-modal__action emc-modal__action--danger" onClick={() => onDelete(event.id)}>
                  <Trash2 size={13} />
                  Delete
                </button>
              )}
            </div>
```

with:

```tsx
            {seriesAction ? (
              <div className="emc-modal__actions">
                <span className="emc-modal__series-prompt">
                  {seriesAction === 'edit' ? 'Edit' : 'Delete'} this event, or all events in the series?
                </span>
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => setSeriesAction(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="era-btn era-btn--ghost emc-modal__action"
                  onClick={() => {
                    setSeriesAction(null);
                    setEditingSeriesWide(false);
                    if (seriesAction === 'edit') startEdit(); else onDelete(event.id);
                  }}
                >
                  This event
                </button>
                <button
                  type="button"
                  className="era-btn emc-modal__action emc-modal__action--danger"
                  onClick={() => {
                    setSeriesAction(null);
                    if (seriesAction === 'edit') {
                      setEditingSeriesWide(true);
                      setForm(event);
                      setEditing(true);
                    } else if (event.seriesId) {
                      deleteSeries(event.seriesId);
                      onClose();
                    }
                  }}
                >
                  All events in series
                </button>
              </div>
            ) : (
              <div className="emc-modal__actions">
                {event.syncOrigin !== 'pulled' && (
                  <button
                    type="button"
                    className="era-btn era-btn--ghost emc-modal__action"
                    onClick={() => (event.seriesId ? setSeriesAction('edit') : startEdit())}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
                {event.syncOrigin !== 'pulled' && event.type === 'meeting' && (
                  <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => onDuplicate(event)}>
                    <Copy size={13} />
                    Duplicate
                  </button>
                )}
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
              </div>
            )}
```

Note on "All events in series" when `seriesAction === 'edit'`: this opens the same full edit form as "This event" (via `setForm`/`setEditing(true)`), reusing the existing title/date/start/end/location fields already in the edit form. The series-wide save path is wired in Step 4 below — `handleSave`/`finalizeSave` need to know whether the in-progress edit applies to one event or the whole series.

- [ ] **Step 4: Make `finalizeSave` series-aware**

`editingSeriesWide` (Step 2) is already set to `true` by the "All events in series" edit button and `false` by the "This event" edit button (both wired in Step 3) — this step only makes `finalizeSave` branch on it.

Replace `finalizeSave` (line 46):

```tsx
  const finalizeSave = () => { onSave(form); setEditing(false); setConflicts(null); };
```

with:

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

(Series-wide edits only apply `title`/`location`/`note` — date/time are intentionally excluded since occurrences are on different dates/times by definition, per the spec. The edit form still shows date/time fields for the single event being used as the editing template, but `updateSeries` only copies the three series-safe fields to every occurrence; the template event's own date/time is saved normally as part of its own row when `editingSeriesWide` is false, and is simply not propagated when `editingSeriesWide` is true.)

- [ ] **Step 5: Add CSS for the series prompt**

In `employee-my-calendar.css`, after `.emc-modal__action--danger:hover` (the existing rule near `.emc-modal__action`):

```css
.emc-modal__series-prompt {
  font-size: 0.78rem;
  color: var(--nexus-text-muted);
  margin-right: auto;
}
```

- [ ] **Step 6: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Create a recurring meeting (New Event → check "Recurring" → Weekly, 3 occurrences). Open one occurrence, click Edit — confirm the "this event / all events" prompt appears (it didn't before this task). Choose "This event", change the title, save — confirm only that one occurrence's title changed (check the other two are unaffected). Repeat, choosing "All events in series" this time on a different occurrence — confirm all 3 occurrences' titles update. Then open one occurrence and click Delete → "All events in series" — confirm all 3 are removed. Finally, open any non-recurring event (e.g. "Team Sync" in the default mock data) and confirm Edit/Delete work exactly as before, with no prompt.

- [ ] **Step 7: Commit**

```bash
git add src/features/employees/components/my-calendar/new-event-wizard.utils.ts src/features/employees/components/my-calendar/EventDetailsModal.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): add real recurring-series edit/delete semantics"
```

---

### Task 6: Conflict Recheck After Reschedule (drag-and-drop)

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`
- Modify: `src/styles/employee-my-calendar.css`

**Interfaces:**
- Consumes: `findEventConflicts` (already imported), `updateEvent`/`localEvents` from the Task 3 migration.
- Produces: nothing consumed by later tasks — leaf feature.

- [ ] **Step 1: Add `dragConflict` state**

Add this near the other drag-related state, right after `dropNoticeTimer` (around line 338):

```tsx
  const [dragConflict, setDragConflict] = useState<{ candidate: CalendarEvent; clashes: CalendarEvent[]; top: number; left: number } | null>(null);
```

- [ ] **Step 2: Change `handleCellDrop` to show a confirm popup instead of hard-blocking**

Replace `handleCellDrop` (lines 363–395):

```tsx
  const handleCellDrop = (e: React.DragEvent, dayKey: string, hour: number) => {
    e.preventDefault();
    setDropTargetCell(null);
    const id = draggedEventId ?? e.dataTransfer.getData('text/plain');
    setDraggedEventId(null);
    if (!id) return;

    const original = localEvents.find(ev => ev.id === id);
    if (!original || original.allDay || !original.start) return;

    const [oh, om] = original.start.split(':').map(Number);
    const durationMinutes = original.end
      ? (() => {
          const [eh, em] = original.end!.split(':').map(Number);
          return eh * 60 + em - (oh * 60 + om);
        })()
      : 30;

    const newStart = `${String(hour).padStart(2, '0')}:00`;
    const newEnd = addMinutesToTime(newStart, durationMinutes);

    if (original.date === dayKey && original.start === newStart) return;

    const candidate: CalendarEvent = { ...original, date: dayKey, start: newStart, end: newEnd };
    const clashes = findEventConflicts(candidate, localEvents.filter(ev => ev.scope === 'my'));
    if (clashes.length > 0) {
      showDropNotice(`Can't move "${original.title}" — clashes with ${clashes.map(c => c.title).join(', ')}.`);
      return;
    }

    setLocalEvents(prev => prev.map(ev => (ev.id === candidate.id ? candidate : ev)));
    showDropNotice(`Moved "${original.title}" to ${dayKey} · ${formatTime(newStart)}`);
  };
```

with:

```tsx
  const handleCellDrop = (e: React.DragEvent, dayKey: string, hour: number) => {
    e.preventDefault();
    setDropTargetCell(null);
    const id = draggedEventId ?? e.dataTransfer.getData('text/plain');
    setDraggedEventId(null);
    if (!id) return;

    const original = localEvents.find(ev => ev.id === id);
    if (!original || original.allDay || !original.start) return;

    const [oh, om] = original.start.split(':').map(Number);
    const durationMinutes = original.end
      ? (() => {
          const [eh, em] = original.end!.split(':').map(Number);
          return eh * 60 + em - (oh * 60 + om);
        })()
      : 30;

    const newStart = `${String(hour).padStart(2, '0')}:00`;
    const newEnd = addMinutesToTime(newStart, durationMinutes);

    if (original.date === dayKey && original.start === newStart) return;

    const candidate: CalendarEvent = { ...original, date: dayKey, start: newStart, end: newEnd };
    const clashes = findEventConflicts(candidate, localEvents.filter(ev => ev.scope === 'my'));
    if (clashes.length > 0) {
      setDragConflict({ candidate, clashes, top: e.clientY, left: e.clientX });
      return;
    }

    updateEvent(candidate.id, candidate);
    showDropNotice(`Moved "${original.title}" to ${dayKey} · ${formatTime(newStart)}`);
  };

  const handleDragConflictCancel = () => setDragConflict(null);
  const handleDragConflictMoveAnyway = () => {
    if (!dragConflict) return;
    const { candidate } = dragConflict;
    updateEvent(candidate.id, candidate);
    showDropNotice(`Moved "${candidate.title}" to ${candidate.date} · ${formatTime(candidate.start!)}`);
    setDragConflict(null);
  };
```

(Watch the `durationMinutes` line carefully when transcribing — it is unchanged from the original, copy it exactly as shown; this is the existing duration-calculation logic, not something this task modifies.)

- [ ] **Step 3: Render the confirm popup**

Add this JSX right after the `{dropNotice && ...}` line near the top of the component's return block (line 811):

```tsx
      {dragConflict && (
        <div
          className="emc-dragconflict"
          style={{ top: dragConflict.top, left: dragConflict.left }}
        >
          <p className="emc-dragconflict__text">
            Clashes with {dragConflict.clashes.map(c => c.title).join(', ')}
          </p>
          <div className="emc-dragconflict__actions">
            <button type="button" className="era-btn era-btn--ghost emc-dragconflict__btn" onClick={handleDragConflictCancel}>
              Cancel
            </button>
            <button type="button" className="era-btn emc-dragconflict__btn" onClick={handleDragConflictMoveAnyway}>
              Move anyway
            </button>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Add CSS**

In `employee-my-calendar.css`, near `.emc-dropnotice` (line 12):

```css
.emc-dragconflict {
  position: fixed;
  z-index: 50;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 0.625rem 0.75rem;
  max-width: 260px;
}

.emc-dragconflict__text {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  color: var(--text);
}

.emc-dragconflict__actions {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
}

.emc-dragconflict__btn {
  font-size: 0.6875rem;
  padding: 3px 9px;
}
```

- [ ] **Step 5: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`, switch to Week or Day view. Drag an existing timed event (e.g. "Team Sync" on 2026-06-17) onto a time slot that already has another event (e.g. onto "Sprint Review"'s slot the same day) — confirm a small popup appears at the drop point with "Clashes with Sprint Review" and Cancel/Move anyway buttons, instead of the event being silently blocked. Click "Move anyway" — confirm the event actually moves and the usual success toast appears. Repeat and click "Cancel" — confirm the event stays at its original position. Then drag an event to an empty slot with no clash — confirm it still moves immediately with no popup, exactly as before this task.

- [ ] **Step 6: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx src/styles/employee-my-calendar.css
git commit -m "feat(calendar): offer conflict override on drag-and-drop reschedule"
```

---

## Self-Review Notes

- Spec §1 (store relocation) → Tasks 1–3. §2 (data model) → Task 1. §3 (Tentative Response) → Task 4. §4 (recurring series) → Task 5. §5 (drag-conflict recheck) → Task 6. §6 (out of scope: holiday override, notifications, recurrence-preview changes, broader state migration) → not touched by any task, consistent with the spec. §7 (verification convention) → reflected in Global Constraints and every task's verify step.
- One deviation from the original spec worth flagging: Task 2 adds a `setEvents` bulk-replace action not in the original spec's store-interface sketch, needed by Task 3's `handleDisconnect` migration (a single filter+map pass that doesn't decompose into the other five mutating actions). Documented inline in Task 2.
- Type/name consistency check: `seriesId`, `updateSeries`, `deleteSeries`, `setEvents`, `addEvents`, `updateEvent`, `deleteEvent` are spelled identically everywhere they appear across Tasks 2, 3, and 5.
