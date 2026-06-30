# Simulated Zoom Meeting Link Generation — Design Spec

## Context

The New Event wizard's "Meeting link / Room" field (`form.location` for `type: 'meeting'`, labeled via `TYPE_FIELD_CONFIG.meeting.locationLabel`) is currently a plain free-text input — you type your own link or room name. This app has no backend and no real third-party integrations anywhere (the existing Google/Outlook calendar sync is also fully simulated, no real OAuth). This spec adds a simulated Zoom link generator, following the same honesty-about-being-mocked precedent as that sync feature.

## Goal

1. Add a "Connect Zoom" toggle to the existing Calendar Sync settings tab, alongside Google/Outlook — Connect/Disconnect only, no "Sync Now" (Zoom doesn't pull/push events, so the 3-button sync pattern doesn't apply).
2. When Zoom is connected and you create a meeting with an empty "Meeting link / Room" field, auto-fill it with a generated fake Zoom link before the event is created.
3. Manual input always wins — if you've typed something into the field, it's never overwritten.

No backend, no network calls, no real Zoom API.

## 1. State — `calendarStore.ts`

A new, deliberately separate boolean (not part of `CalendarSyncStatus`/`SyncProvider`, since Zoom has no pull/push/conflict concept):

```ts
interface CalendarState {
  // ...existing fields/actions...
  zoomConnected: boolean;
  setZoomConnected: (connected: boolean) => void;
}
```

Seeded `false`. `setZoomConnected` is a plain setter, no side effects (no history logging, no calendar events — connecting/disconnecting Zoom is not itself a calendar lifecycle action).

## 2. Settings UI — `my-calendar-tab.tsx`

In the existing "Calendar Sync" settings panel, the `([{key:'google',...},{key:'outlook',...}] as const).map(...)` row list gains a third, structurally different row for Zoom (it can't reuse the same `{key, label, status}` shape since there's no `SyncConnectionStatus`/Sync-Now button):

```tsx
<div className="emc-sync__row">
  <div className={`emc-sync__dot emc-sync__dot--${zoomConnected ? 'connected' : 'disconnected'}`} />
  <span className="emc-sync__label">Zoom</span>
  <span className={`emc-sync__badge emc-sync__badge--${zoomConnected ? 'connected' : 'disconnected'}`}>
    {zoomConnected ? 'Connected' : 'Not connected'}
  </span>
  <button
    type="button"
    className="era-btn era-btn--ghost emc-sync__btn"
    disabled={connectingZoom}
    onClick={() => handleZoomToggle()}
  >
    <RefreshCw size={12} className={connectingZoom ? 'emc-sync__spin' : ''} />
    {connectingZoom ? 'Connecting…' : zoomConnected ? 'Disconnect' : 'Connect'}
  </button>
</div>
```

`handleZoomToggle`: if already connected, disconnects immediately (`setZoomConnected(false)`, no spinner needed for disconnect, matching Google/Outlook's existing Disconnect behavior which is instant). If disconnected, shows an 800ms spinner (`connectingZoom` local state, same pattern as `connectingProvider`) then calls `setZoomConnected(true)`.

Reuses the existing `.emc-sync__dot`/`.emc-sync__badge`/`.emc-sync__btn`/`.emc-sync__spin` CSS classes — no new CSS needed.

## 3. Link generation — `zoom.utils.ts`

New file `src/features/employees/components/my-calendar/zoom.utils.ts`:

```ts
export function generateZoomLink(): string {
  const id = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000);
  return `https://zoom.us/j/${id}`;
}
```

A separate file from `calendar-sync.utils.ts` (which is specifically about Google/Outlook pull/push/conflict logic) — this is a different, simpler concern with a single pure function.

## 4. Wizard wiring — `NewEventWizard.tsx`

`NewEventWizard.tsx` reads `zoomConnected` directly from the store (same pattern `EventDetailsModal.tsx` already uses for `useCalendarStore`):

```tsx
const zoomConnected = useCalendarStore(s => s.zoomConnected);
```

In `finalizeCreate`, right before calling `buildEventsFromForm(form)`:

```ts
const finalizeCreate = () => {
  const effectiveForm = (form.type === 'meeting' && zoomConnected && !form.location.trim())
    ? { ...form, location: generateZoomLink() }
    : form;
  onCreate(buildEventsFromForm(effectiveForm));
  onClose();
};
```

`buildEventsFromForm` itself is untouched — it has no knowledge of Zoom, exactly as it has no knowledge of sync-tagging (which also happens outside it, in `my-calendar-tab.tsx`'s `handleCreateEvents`).

## 5. Out of scope

- Real Zoom OAuth/API calls — simulated only, same as Google/Outlook sync.
- A manual "Generate link" button in the wizard — auto-fill on create is the only trigger.
- Applying auto-fill to Training/Company-event types — only `type: 'meeting'`.
- A visual "Zoom" badge on event pills or in the details modal — the generated link just appears in the existing Location row like any manually-typed link.
- Disconnecting Zoom stripping links already generated on existing events — one-way, fire-and-forget, same precedent as Leave/Work auto-events.

## 6. Verification

No test runner exists in this repo. Verification is `npm run build` for type safety, plus manual/code-level walkthrough via `npm run dev`: connect Zoom, create a meeting with the link field empty, confirm a `https://zoom.us/j/...` link appears in the saved event's Location row; create another meeting with a manually-typed link, confirm it's preserved; disconnect Zoom and create a meeting, confirm the field stays empty (no auto-fill).
