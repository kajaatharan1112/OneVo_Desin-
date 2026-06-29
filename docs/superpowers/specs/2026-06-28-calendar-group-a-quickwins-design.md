# Calendar Group A: Tentative RSVP, Recurring Series Editing, Drag-Conflict Recheck — Design Spec

## Context

This app's My Calendar feature (`src/features/employees/components/my-calendar/`) was audited against a 100-item "Calendar Management Module" user-journey list. Three small, calendar-native gaps were identified that need no other module's involvement (unlike sharing/permissions or cross-module auto-event creation, which are separate, larger efforts):

- **#36 Tentative Response** — `attendeeRsvp` already supports a `'tentative'` value per-attendee, but the *self* RSVP flow (Accept/Decline buttons in the Invitations rail) is binary only.
- **#48/#49 Edit Single Occurrence / Edit Entire Series** — investigation found the original audit was wrong on both: there is no `seriesId` linking recurring occurrences together at all. Each occurrence created by the wizard is a fully independent `CalendarEvent` row. This means "edit single occurrence" already works by accident (editing any row only ever touches that row), while "edit entire series" was never actually built (there's no way to push one edit to every occurrence). This spec builds real series semantics so both journeys have correct, intentional behavior instead of one accidental and one missing.
- **#57 Conflict Recheck After Reschedule** — drag-and-drop reschedule (`my-calendar-tab.tsx`) hard-blocks a move when a conflict is found, with no override. This is inconsistent with the New Event wizard and the Edit form in `EventDetailsModal`, both of which already show conflicts and offer "Reschedule" / "Confirm anyway".

A fourth item from the same audit, **#97 Override Holiday**, was investigated and found to depend on a separate, already-built admin module (`src/features/time-attendance/configuration/` — `HolidayCalendarPage.tsx`, `HolidayFormModal.tsx`, etc.) that is currently disconnected from My Calendar. That work is cross-module wiring, not calendar-native, so it is explicitly **out of scope** for this spec and deferred to a later "Group E" effort.

This is one of three planned increments (Group A → Group D → Group E) toward closing remaining gaps in the calendar module for a CEO-facing prototype demo. Group A is first because it's the lowest-risk, most self-contained slice, and because it introduces the state-management foundation (a persisted store) that Groups D and E will both depend on.

## Goal

1. Move My Calendar's event/sync state out of component-local `useState` into a persisted zustand store, so other modules (Groups D/E) can read and write calendar state later, and so the calendar survives a page refresh during a live demo.
2. Add a real third RSVP option (Tentative) with its own visual treatment.
3. Add real recurring-series semantics: a shared `seriesId`, and an explicit "this event / all events in the series" choice on edit and delete.
4. Make drag-and-drop reschedule offer the same conflict override pattern already used elsewhere in this app, instead of hard-blocking.

No backend, no network calls — this app has none anywhere. Persistence is browser `localStorage` only, via zustand's `persist` middleware (the same mechanism already used by `src/store/historyStore.ts` and `src/store/roleStore.ts`).

## 1. `calendarStore.ts` — state relocation

New file: `src/store/calendarStore.ts`, following the exact convention already established by `historyStore.ts`/`roleStore.ts`:

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
  updateSeries: (seriesId: string, changes: Partial<CalendarEvent>) => void;
  deleteSeries: (seriesId: string) => void;
  setSyncStatus: (syncStatus: CalendarSyncStatus) => void;
  setLastConnectedProvider: (provider: SyncProvider | null) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: employeeCalendarData.events,
      syncStatus: employeeCalendarData.syncStatus,
      lastConnectedProvider: employeeCalendarData.syncStatus.google === 'connected' ? 'google' : null,

      addEvents: events => set(state => ({ events: [...state.events, ...events] })),
      updateEvent: (id, updated) => set(state => ({
        events: state.events.map(e => (e.id === id ? updated : e))
      })),
      deleteEvent: id => set(state => ({ events: state.events.filter(e => e.id !== id) })),
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

`my-calendar-tab.tsx` is updated to read `events`/`syncStatus`/`lastConnectedProvider` from `useCalendarStore()` instead of local `useState`, and to call the store's actions instead of `setLocalEvents`/`setSyncStatus`. All existing handlers (`handleCreateEvents`, `handleSaveEvent`, `handleDeleteEvent`, `handleConnect`, `handleSyncNow`, `handleDisconnect`, etc. — this includes the previously-shipped calendar-sync feature's Connect/Sync Now/Disconnect handlers, since they read/write `syncStatus`/`lastConnectedProvider`/`events`) keep their current signatures and call sites — only their internals change from `setLocalEvents(...)` to `useCalendarStore.getState().addEvents(...)` (or the equivalent action). No UI or behavior change from this section alone; it's a pure relocation.

`connectingProvider`, `activeConflict` (the sync conflict modal state), drag state, filter state, and all other purely-UI/transient state **stay as component-local `useState`** — only data that needs to survive a refresh or be reachable from outside the component moves into the store.

## 2. Data model changes

In `employee-calendar.types.ts`:

```ts
export type CalendarEventStatus = 'confirmed' | 'pending' | 'needs-response' | 'rejected' | 'tentative';

export interface CalendarEvent {
  // ...existing fields...
  seriesId?: string;
}
```

Both additive and optional — no existing object literal needs to change.

## 3. Tentative Response (#36)

- `handleRsvp(id: string, response: 'accepted' | 'declined' | 'tentative')` replaces the current `(id: string, accepted: boolean)` signature. Sets `status` to `'confirmed' | 'rejected' | 'tentative'` respectively, and always clears `needsResponse`.
- A third icon button is added to `RailEvent`'s actions (`my-calendar-tab.tsx:797-800`), using `HelpCircle` from `lucide-react` (already a dependency), styled `emc-iconbtn emc-iconbtn--tentative`.
- New CSS modifier `emc-evpill--tentative-status`, added alongside the existing `--pending-status`/`--rejected-status` modifiers in every location they currently appear: Month pill, Week (all-day + timed) pill, Day (all-day + timed) pill, Agenda pill, and the rail dot (`emc-rail__dot--${ev.type}` already exists per-type; the status modifier is a separate class applied the same way `--pending-status` is today).
- `EventDetailsModal.tsx`: alongside the existing `event.status === 'rejected'` note (`"Rejected by manager."`), add `event.status === 'tentative' && <p className="emc-modal__tentative-note">Tentative response.</p>`.

## 4. Recurring series — real semantics (#48 corrected, #49 built)

- `buildEventsFromForm` (`new-event-wizard.utils.ts:242-283`): when `form.recurring` is `true` and `dates.length > 1`, generate one `seriesId` (`series-${ts}`) once before the `.map()`, and set `event.seriesId = seriesId` on every generated occurrence. When `form.recurring` is `false`, no `seriesId` is set (unchanged from today).
- `EventDetailsModal.tsx`, in the non-editing view's action row: when `event.seriesId` is set (and `event.syncOrigin !== 'pulled'`, per the existing read-only rule), clicking **Edit** or **Delete** first shows an inline two-button choice in place of the icon row — *"This event"* / *"All events in series"* — instead of immediately opening the edit form or deleting:
  - **Edit → This event**: opens the edit form exactly as today, saves via `updateEvent` (single row, unaffected by series).
  - **Edit → All events in series**: opens a reduced edit form (title, location, notes only — fields that are safe to apply identically to every occurrence; date/time are excluded since occurrences are on different dates/times by definition) and saves via `useCalendarStore.getState().updateSeries(event.seriesId, changes)`.
  - **Delete → This event**: existing single-row delete, unchanged.
  - **Delete → All events in series**: calls `useCalendarStore.getState().deleteSeries(event.seriesId)`.
  - Events without `seriesId` show the existing Edit/Delete buttons directly, no extra step — zero behavior change for any event created before this ships, and for all non-recurring event types.

## 5. Conflict Recheck After Reschedule (#57)

- `handleCellDrop` (`my-calendar-tab.tsx:363-394`): when `findEventConflicts` returns clashes, instead of `showDropNotice(...)` + `return`, store `{ candidate, clashes, dropPoint }` in a new `dragConflict` state (component-local `useState`, transient) and render a small inline confirm popup positioned at the drop cell:

  ```
  Clashes with {clashes.map(c => c.title).join(', ')}
  [Cancel]  [Move anyway]
  ```

  - **Cancel**: clears `dragConflict`; event visually stays at its original position (no state change was made yet, since the candidate was never committed).
  - **Move anyway**: applies the same `updateEvent(candidate.id, candidate)` call the no-conflict path already uses, then clears `dragConflict` and shows the existing `showDropNotice` success message.
- The existing no-conflict path (`clashes.length === 0`) is unchanged — moves immediately, as today.

## 6. Out of scope

- **#97 Override Holiday** — depends on wiring My Calendar to the separate `time-attendance/configuration` holiday admin module; deferred to Group E.
- Any change to how recurring events are *previewed* before creation (the wizard's existing recurrence UI is unchanged) — this spec only adds series-editing *after* creation.
- Tentative response notifications, reminders, or any notification-system work (Group "notifications" territory, not this spec).
- Persisting anything beyond `events`/`syncStatus`/`lastConnectedProvider` — transient UI state (open modals, drag state, filter selections) intentionally stays session-only.
- Migrating any other My-Calendar `useState` not listed in Section 1 into the store — only the three fields Groups D/E actually need to reach are moved.

## 7. Verification

No test runner exists in this repo (no Jest/Vitest, no `test` script in `package.json` — confirmed during the prior calendar-sync feature). Verification is `npm run build` for type safety, plus manual/code-level walkthrough via `npm run dev`, consistent with how the calendar-sync feature was verified.
