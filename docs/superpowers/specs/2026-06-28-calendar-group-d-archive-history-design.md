# Calendar Group D: Archive/Restore + History/Audit Wiring — Design Spec

## Context

Following Group A (Tentative RSVP, recurring-series editing, drag-conflict recheck), this is the second increment toward closing gaps in the 100-item Calendar Management Module audit, for a CEO-facing prototype demo. Group D covers four related journeys:

- **#91 Archive Event** / **#92 Restore Event** — no archive state exists on `CalendarEvent` today; Delete is permanent.
- **#93 View Event History** / **#94 Audit Event Changes** — no calendar-specific history or audit trail exists, but a generic, already-built admin History/Audit system (`src/store/historyStore.ts`, `src/features/admin/AuditLogPage.tsx`) already has an unused `'Calendar'` category, ready to be wired in.

This spec reuses that existing infrastructure rather than building a new one — `historyStore.ts` already follows the zustand+persist convention (like `calendarStore.ts` from Group A), and other stores (`roleStore.ts`) already call `recordHistory(...)` directly from their own mutating actions; this spec follows that same pattern, but from the calendar feature's UI-level handlers rather than from `calendarStore.ts`'s generic actions (see §2).

## Goal

1. Add an `archived` flag to `CalendarEvent`, with dedicated `archiveEvent`/`restoreEvent` store actions.
2. Hide archived events from the normal calendar grid; surface them in a new "Archived Events" tab in Calendar Settings, with a Restore action.
3. Record major calendar lifecycle actions (create, edit, delete, archive, restore) to the existing `historyStore`, tagged `category: 'Calendar'` — this alone satisfies #94 (Audit Event Changes), since those entries already appear in the existing Admin → History page.
4. Show a small, per-event history section inside `EventDetailsModal` for #93 (View Event History).

No backend, no network calls. No new persistence mechanism — `historyStore` is already `persist`-backed.

## 1. Data model

In `employee-calendar.types.ts`:

```ts
export interface CalendarEvent {
  // ...existing fields...
  seriesId?: string;
  archived?: boolean;
}
```

Additive and optional — no existing object literal changes.

## 2. `calendarStore.ts` — two new actions

```ts
interface CalendarState {
  // ...existing fields/actions...
  archiveEvent: (id: string) => void;
  restoreEvent: (id: string) => void;
}
```

```ts
archiveEvent: id => set(state => ({
  events: state.events.map(e => (e.id === id ? { ...e, archived: true } : e))
})),
restoreEvent: id => set(state => ({
  events: state.events.map(e => (e.id === id ? { ...e, archived: false } : e))
})),
```

These are intentionally separate from `updateEvent` (which takes a full replacement object) — `archiveEvent`/`restoreEvent` are simple, self-documenting, single-purpose setters. **`recordHistory` is NOT called inside these store actions** — `calendarStore.ts` stays a plain data store with no knowledge of audit logging, the same way it has no knowledge of sync or series logic. Logging happens at the call sites in §3, which is also where the "major lifecycle only" filtering naturally happens (RSVP/drag-reschedule/sync call *different* store actions — `updateEvent` directly — that are never wrapped with logging).

## 3. History/Audit wiring

`recordHistory` (already exported from `historyStore.ts`) is called from exactly 5 places, all in UI-level handler functions (not inside `calendarStore.ts`):

| Call site | File | `title` | `description` example |
|---|---|---|---|
| `handleCreateEvents` | `my-calendar-tab.tsx` | `'Event created'` | `Created 3 occurrences of "Standup".` (recurring) or `Created "Team Sync".` (single) |
| `finalizeSave`, single-event path | `EventDetailsModal.tsx` | `'Event updated'` | `"Team Sync" was updated.` |
| `finalizeSave`, series-wide path | `EventDetailsModal.tsx` | `'Series updated'` | `All occurrences of "Standup" were updated.` |
| Delete (single, via `onDelete`) | `EventDetailsModal.tsx`'s "This event" delete branch | `'Event deleted'` | `"Team Sync" was deleted.` |
| Delete (series, via `deleteSeries`) | `EventDetailsModal.tsx`'s "All events in series" delete branch | `'Series deleted'` | `All occurrences of "Standup" were deleted.` |
| Archive (new, §4) | `EventDetailsModal.tsx` | `'Event archived'` | `"Team Sync" was archived.` |
| Restore (new, §4) | `my-calendar-tab.tsx`'s Archived Events tab | `'Event restored'` | `"Team Sync" was restored.` |

Every call passes `category: 'Calendar'` and `target: <event title>`. `actor` is omitted at every call site, consistent with this app's existing convention (`roleStore.ts` never passes `actor` either — `historyStore.record` defaults it).

**Known simplification:** `target` is the event's title, not a stable id (matching the `roleStore` convention of using a name as `target`, not introducing a new id-based linking field into the shared `historyStore`). Two events sharing a title (e.g. two separate "Annual Leave" entries, or occurrences of the same recurring series) will show each other's history entries in the per-event view in §5. Accepted for this demo.

**Explicitly NOT logged** (per "major lifecycle only"): RSVP responses (`handleRsvp`), drag-and-drop reschedule (`handleCellDrop`), and all sync actions (Connect/Sync Now/Disconnect, conflict resolution) — none of these call sites get a `recordHistory` call.

This wiring alone satisfies **#94 Audit Event Changes** — these entries already render in the existing `AuditLogPage.tsx`, filterable to "Calendar" via its existing category dropdown. No changes needed to that page.

## 4. Archive / Restore UI

In `EventDetailsModal.tsx`'s normal (non-`seriesAction`) actions row, add a 4th button after Delete, gated identically to the existing three (`event.syncOrigin !== 'pulled'`):

```tsx
{event.syncOrigin !== 'pulled' && (
  <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => handleArchive(event)}>
    <Archive size={13} />
    Archive
  </button>
)}
```

`handleArchive` calls `useCalendarStore.getState().archiveEvent(event.id)`, records history per §3, then closes the modal (`onClose()`) — archiving removes the event from the currently-visible grid immediately. Applies to the single event only — for a `seriesId` event, Archive does not get a "this event / all events" prompt (out of scope, §6).

In `my-calendar-tab.tsx`, `SettingsTabId` becomes `'sync' | 'archived'`, and `SETTINGS_TABS` gains `{ id: 'archived', label: 'Archived Events' }`. The new tab's panel lists every event in the store with `archived === true` (read directly from the store, not scope-filtered — archiving is a cross-scope concern), each row showing title + date with a Restore button (icon: `ArchiveRestore` from `lucide-react`, same package already used for `Archive`) that calls `restoreEvent(id)` + records history per §3. If the list is empty, show a simple empty-state message ("No archived events") rather than an empty panel.

Calendar views (`eventsByDate`, and therefore every Month/Week/Day/Agenda render) filter out `archived === true` events — add `&& !ev.archived` to the existing `filteredEvents` computation in `my-calendar-tab.tsx`, so archived events vanish from the grid in one place.

## 5. View Event History (#93)

In `EventDetailsModal.tsx`'s non-editing view, after the existing rows (location/attendees/leave type/etc.) and before the Actions row, add:

```tsx
const historyEntries = useHistoryStore(s => s.entries).filter(
  e => e.category === 'Calendar' && e.target === event.title
);

{historyEntries.length > 0 && (
  <div className="emc-modal__history">
    <p className="emc-modal__history-label">History</p>
    <ul className="emc-modal__history-list">
      {historyEntries.map(e => (
        <li key={e.id}>{e.title} — {new Date(e.createdAt).toLocaleString()}</li>
      ))}
    </ul>
  </div>
)}
```

Only renders when at least one matching entry exists — no empty-state noise for the majority of events that have no recorded history yet (anything that existed before this feature shipped, or was never edited/deleted/archived).

## 6. Out of scope

- Archive/Restore applying to an entire recurring series at once (single-event only).
- Any id-based linking field in `historyStore.ts` (sticking with title-based `target`).
- Logging RSVP, drag-reschedule, or sync actions.
- A confirmation step before Archive or Restore (both are reversible/instant, unlike Delete which already has no confirmation either, for consistency).
- Changes to `AuditLogPage.tsx` itself — it already supports filtering by "Calendar" with zero changes.

## 7. Verification

No test runner exists in this repo. Verification is `npm run build` for type safety, plus manual/code-level walkthrough via `npm run dev`, consistent with prior calendar work.
