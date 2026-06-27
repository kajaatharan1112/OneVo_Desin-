# Simulated Calendar Sync (Google/Outlook)

## Context

The My Calendar settings modal already has a "Calendar Sync" tab ([my-calendar-tab.tsx:960-981](../../../src/features/employees/components/my-calendar/my-calendar-tab.tsx#L960-L981)) showing static mock status — `{ google: 'connected', outlook: 'disconnected', lastSynced: '10 min ago' }` from `employeeCalendarData.syncStatus` ([employee-calendar.data.ts](../../../src/features/employees/data/employee-calendar.data.ts)) — with no buttons and no actual behavior. This app has no backend, no OAuth, and no external API integration anywhere; every other feature (attendees, timezones, employee data) is mock data manipulated in React state. This spec makes the sync panel actually do something, entirely simulated, covering six journeys: Pull External Events, Push Internal Events, Two-way Sync, Read-only Synced Events, Sync Conflict Handling, Disconnect Calendar Account.

Goal: clicking Connect on a provider pulls in a few fake external events; creating a new event while connected marks it as pushed; clicking Sync Now re-pulls/re-pushes and occasionally surfaces a fake conflict to resolve; pulled events can't be edited/deleted; disconnecting cleans up appropriately. All client-side, no network calls.

## 1. Data model

`CalendarEvent` ([employee-calendar.types.ts](../../../src/features/employees/types/employee-calendar.types.ts)) gains two optional fields:

```ts
export type SyncProvider = 'google' | 'outlook';

export interface CalendarEvent {
  // ...existing fields...
  syncProvider?: SyncProvider;
  syncOrigin?: 'pulled' | 'pushed';
}
```

- `syncOrigin: 'pulled'` — event originated from the provider; read-only in this app (section 4).
- `syncOrigin: 'pushed'` — event was created locally in this app and is synced out to that provider; still fully editable here.
- Events with neither field are plain local events, unaffected by any of this (shifts, holidays, leave, and any event created while no provider is connected).

No changes to `CalendarSyncStatus` — `lastSynced` is already a free-form string, updated to `'just now'` after any Connect or Sync Now action.

## 2. New mock-sync utility module

New file `src/features/employees/components/my-calendar/calendar-sync.utils.ts`:

```ts
export const MOCK_PULLED_EVENTS: Record<SyncProvider, Omit<CalendarEvent, 'id'>[]>;
// 3-5 canned events per provider, e.g. for google:
//   { title: 'Client Call — Acme Corp', date: '2026-06-19', start: '14:00', end: '14:30', type: 'meeting', status: 'confirmed', source: 'personal', scope: 'my', allDay: false }
//   { title: 'Dentist Appointment', date: '2026-06-22', start: '09:00', end: '10:00', type: 'reminder', status: 'confirmed', source: 'personal', scope: 'my', allDay: false }
// (outlook gets a different set of 3-5, so reconnecting/switching providers looks distinct)

export function pullEvents(provider: SyncProvider): CalendarEvent[];
// Maps MOCK_PULLED_EVENTS[provider] to full CalendarEvent objects with fresh ids
// (`pulled-${provider}-${Date.now()}-${i}`), syncProvider: provider, syncOrigin: 'pulled'.

export interface SyncConflict {
  eventId: string;
  eventTitle: string;
  mineStart: string;
  mineEnd: string;
  theirsStart: string;
  theirsEnd: string;
}

export function detectConflict(pushedEvents: CalendarEvent[], provider: SyncProvider): SyncConflict | null;
// Picks the first pushed event for `provider` (if any) and returns a conflict shifting
// its time by 60 minutes ("theirs"), e.g. mine 9:00–10:00 → theirs 10:00–11:00.
// Returns null if there are no pushed events for that provider — no conflict to show.
```

`detectConflict` always returns a conflict when a pushed event exists for that provider (not randomized) — deterministic and demoable, per the "always-on for the demo" resolution from brainstorming. If there are multiple pushed events, only the first (by array order) is used — one conflict per Sync Now click, never a queue.

## 3. Calendar Settings panel — Connect / Sync Now / Disconnect

In `my-calendar-tab.tsx`'s sync tab render block, each provider row's badge is followed by an action button based on its current status (component-local `syncStatus` state, lifted from the static `employeeCalendarData.syncStatus` into `useState` so it can change). A second piece of state, `lastConnectedProvider: SyncProvider | null`, is set whenever a Connect button succeeds — this is what section 4's push-tagging logic reads when both providers are connected.

- **Disconnected → "Connect" button.** On click: set a brief `connecting` flag (button shows a spinner via existing `RefreshCw` icon with a spin class for ~800ms via `setTimeout`), then: set that provider's status to `'connected'`, call `pullEvents(provider)` and append the results to `localEvents` (via the same `setLocalEvents` already used by `handleCreateEvents` etc.), and set `lastSynced` to `'just now'`.
- **Connected → "Sync Now" and "Disconnect" buttons.**
  - **Sync Now:** re-runs `pullEvents(provider)` (appending only events whose mock-source title doesn't already exist among current pulled events for that provider, to avoid duplicate pulls on repeat clicks), then calls `detectConflict` against current `localEvents` filtered to `syncOrigin === 'pushed' && syncProvider === provider`. If a conflict is found, open the conflict modal (section 5) instead of immediately updating `lastSynced` — `lastSynced` updates once the conflict is resolved (or immediately if no conflict).
  - **Disconnect:** remove all `localEvents` where `syncProvider === provider && syncOrigin === 'pulled'`; for events where `syncProvider === provider && syncOrigin === 'pushed'`, strip both fields (`syncProvider: undefined, syncOrigin: undefined`) so they become plain local events, not deleted. Set that provider's status to `'disconnected'`.

## 4. Push — tagging new events

In `NewEventWizard.tsx`'s `handleCreateClick` → `buildEventsFromForm` flow (or immediately after, in `my-calendar-tab.tsx`'s `handleCreateEvents`), any newly created event gets tagged if exactly one provider is currently connected: `syncProvider: connectedProvider, syncOrigin: 'pushed'`. If both are connected, tag with whichever was connected most recently (track a `lastConnectedProvider` value alongside `syncStatus` state — simplest deterministic rule, per brainstorming). If neither is connected, no tagging — unchanged from today.

A small sync icon (provider-specific, e.g. a small "G"/"O" badge or the existing lucide icons already used for Google/Outlook elsewhere) appears on the event pill in Month/Week/Day/Agenda views, and on the row in `EventDetailsModal`, whenever `event.syncProvider` is set — regardless of `syncOrigin` (both pulled and pushed events show this, just pulled ones also lose their action buttons per section 5 below).

## 5. Read-only pulled events

In `EventDetailsModal.tsx`, when `event.syncOrigin === 'pulled'`:
- The Edit, Duplicate (if a meeting), and Delete buttons are all hidden — only a Close action remains in `emc-modal__actions`.
- A label appears near the title: `Synced from {Google|Outlook}` (capitalized `syncProvider`).
- The "Edit Event" form view is never reachable for this event since `startEdit` is only triggered by the (now-hidden) Edit button.

Pushed events (`syncOrigin === 'pushed'`) are unaffected — fully editable/deletable as today, just visually tagged per section 4.

## 6. Conflict resolution modal

New small modal in `my-calendar-tab.tsx` (reusing the existing `emc-modal-overlay`/`emc-modal` classes, not a new component file — this is a single-purpose, ~20-line addition):

```
This event's time was also changed in {Google|Outlook}.

{event title}
  Mine:    {mineStart}–{mineEnd}
  Theirs:  {theirsStart}–{theirsEnd}

[Keep mine]  [Keep theirs]
```

"Keep mine" closes the modal and finalizes the sync (updates `lastSynced`, no change to the event). "Keep theirs" updates that event's `start`/`end` to the conflict's `theirsStart`/`theirsEnd` in `localEvents`, then finalizes. Either choice also completes the Sync Now action's pull step if it hadn't already (i.e. pulled events from that same Sync Now click are appended whether or not a conflict was shown).

## 7. Out of scope

- Real OAuth, real Google/Outlook API calls, any network request — everything in this spec is synchronous mock data manipulation plus a single `setTimeout` for the Connect spinner.
- Automatic/background sync on a timer — Sync Now is always a manual click (per brainstorming decision).
- More than one conflict per Sync Now click, or a conflict history/log.
- Syncing event types other than meetings/personal events — shifts, holidays, and leave are never pulled, pushed, or tagged.
- Persisting sync state across a page reload — like the rest of this app's mock data, sync status and tagged events live only in React state for the session.
