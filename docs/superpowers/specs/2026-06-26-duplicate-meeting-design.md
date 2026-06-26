# Duplicate Meeting

## Context

`EventDetailsModal.tsx` ([EventDetailsModal.tsx](../../../src/features/employees/components/my-calendar/EventDetailsModal.tsx)) currently offers Edit and Delete on an event. There is no way to clone an existing meeting into a new one without re-entering title, attendees, location, etc. by hand. `NewEventWizard.tsx` already supports prefilling its form via an `initialOverrides: Partial<NewEventFormState>` prop (used today for drag-to-create), and `my-calendar-tab.tsx` already has the plumbing — `setDragPrefill` + `setNewEventOpen` — to open it prefilled.

Goal: let the organizer duplicate a **meeting** (not other event types) from either the event details modal or a right-click on the event in the calendar grid, landing in the New Event wizard prefilled with the original meeting's details so they can adjust the date/time and confirm.

## 1. Reverse-mapping utility

New function in `new-event-wizard.utils.ts`:

```ts
export function eventToFormOverrides(event: CalendarEvent): Partial<NewEventFormState>;
```

Maps a meeting `CalendarEvent` back into wizard form fields:
- `title`: copied unchanged
- `type: 'meeting'`, `allDay: false` (meetings are always timed)
- `date`, `start`, `end`: copied unchanged from the original event
- `location`: from `event.location`
- `notes`: from `event.note`
- `audience`: from `event.scope`
- `category`, `priority`, `reminderMinutesBefore`: copied as-is when present
- `attendees`: each name in `event.attendees` (a `string[]`) is looked up against `CALENDAR_DIRECTORY` by name — a match becomes `{ kind: 'user', id, name, role }`; no match becomes `{ kind: 'external', email: name }` (consistent with how `attendeeKey` already treats external attendees as keyed by email string)
- `recurring: false` always — `CalendarEvent` does not persist recurrence state (each occurrence is already materialized as its own event), so duplicating any meeting — recurring or not — produces a single new one-off meeting in the wizard; the user can re-enable recurring there if they want

## 2. Entry point A — EventDetailsModal

`EventDetailsModal` gains a new required prop `onDuplicate: (event: CalendarEvent) => void`.

A "Duplicate" button (lucide `Copy` icon) is added between the existing Edit and Delete buttons in `emc-modal__actions`, **rendered only when `event.type === 'meeting'`** and only in the non-editing view. Clicking it calls `onDuplicate(event)` — the modal itself does not close on click; the parent's handler is responsible for closing it (matching how `onDelete` already works).

## 3. Entry point B — right-click context menu on the calendar grid

In `my-calendar-tab.tsx`, every place an event pill is rendered (Month `emc-month__evpill`, Week `emc-week__ev` / `emc-week__evpill`, Day `emc-day__ev` / `emc-day__alldaypill`, Agenda `emc-agenda__ev`) gains an `onContextMenu` handler:

```ts
const handleEventContextMenu = (e: React.MouseEvent, ev: CalendarEvent) => {
  if (ev.type !== 'meeting') return; // let the browser's default menu show
  e.preventDefault();
  e.stopPropagation();
  setEventMenu({ event: ev, top: e.clientY, left: e.clientX });
};
```

New state: `const [eventMenu, setEventMenu] = useState<{ event: CalendarEvent; top: number; left: number } | null>(null);`

Renders a small absolutely-positioned popup (new class `emc-eventmenu`, styled like the existing `emc-daypopover`) containing a single "Duplicate" item. Clicking it calls `handleDuplicateEvent(eventMenu.event)` and clears `eventMenu`. Closes on outside click via the same `mousedown` + ref pattern already used for `scopeMenuOpen`, `filterPanelOpen`, and `dayPopover`.

## 4. Wiring

One new handler in `my-calendar-tab.tsx`, used by both entry points:

```ts
const handleDuplicateEvent = (event: CalendarEvent) => {
  setSelectedEvent(null);
  setEventMenu(null);
  setDragPrefill(eventToFormOverrides(event));
  setNewEventOpen(true);
};
```

This is passed as `onDuplicate` to `EventDetailsModal` and called directly from the context-menu item. It reuses the existing `NewEventWizard` + `initialOverrides` + conflict-check flow unchanged — no new modal component is introduced. The wizard's existing "Create Event" flow (validation, conflict detection, `buildEventsFromForm`) handles the rest exactly as it does for any new meeting.

## 5. Out of scope

- Non-meeting event types (Shift, Leave, Holiday, Training, Out of Office, Company Event) get no Duplicate action in either entry point.
- Carrying over recurrence settings (`recurring`/`frequency`/`occurrences`) — duplicating always produces a one-off meeting in the wizard.
- An "instant copy" path that skips the wizard.
- Duplicating into a different scope/audience than the wizard's existing Audience field already allows editing.
- RSVP state (`attendeeRsvp`) is not carried over — the duplicate is a brand-new meeting, so attendees start at `pending` once created, same as any new meeting.
