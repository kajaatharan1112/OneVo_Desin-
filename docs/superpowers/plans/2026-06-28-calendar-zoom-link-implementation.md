# Simulated Zoom Meeting Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Connect/Disconnect-only "Zoom" row to Calendar Sync settings, and auto-fill a generated fake Zoom link into a meeting's empty "Meeting link / Room" field when Zoom is connected.

**Architecture:** `zoomConnected` is a new, deliberately separate boolean on `calendarStore.ts` (not part of the existing `CalendarSyncStatus`/`SyncProvider`, since Zoom has no pull/push/conflict concept). A new pure-function file generates the fake link. The wizard reads `zoomConnected` directly from the store and conditionally fills the field right before building the event.

**Tech Stack:** React 19, TypeScript, zustand (existing `calendarStore.ts`). No test runner in this repo.

## Global Constraints

- No backend, no network calls, no real Zoom API — simulated only, same honesty level as the existing Google/Outlook sync feature.
- Zoom's settings row has only Connect/Disconnect — no "Sync Now" button (Zoom doesn't pull/push events).
- Manual input in the Meeting link field always wins — never overwrite a non-empty `form.location`.
- Auto-fill only applies to `form.type === 'meeting'` — never Training/Company-event/Holiday.
- `buildEventsFromForm` (in `new-event-wizard.utils.ts`) stays completely unaware of Zoom — the auto-fill happens in `NewEventWizard.tsx` before that function is called, not inside it.
- Connecting/disconnecting Zoom does not log to `recordHistory` or create any calendar event — it's not itself a calendar lifecycle action, consistent with how Connect/Disconnect for Google/Outlook also don't log to history.
- No test runner exists in this repo (no Jest/Vitest, no `test` script in `package.json`). Verification per task is `npm run build` for type safety plus a manual/code-level walkthrough via `npm run dev`.

---

## File Structure

- Modify: `src/store/calendarStore.ts` — add `zoomConnected`/`setZoomConnected`.
- Create: `src/features/employees/components/my-calendar/zoom.utils.ts` — `generateZoomLink(): string`.
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx` — add the Zoom settings row + connect/disconnect handler.
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx` — read `zoomConnected`, auto-fill in `finalizeCreate`.

---

### Task 1: `calendarStore.ts` — `zoomConnected` state

**Files:**
- Modify: `src/store/calendarStore.ts`

**Interfaces:**
- Produces: `useCalendarStore`'s `zoomConnected: boolean` and `setZoomConnected(connected: boolean): void` — Task 3 reads/writes both, Task 4 reads `zoomConnected`.

- [ ] **Step 1: Add to the `CalendarState` interface**

Add after `setLastConnectedProvider: (provider: SyncProvider | null) => void;`:

```ts
  zoomConnected: boolean;
  setZoomConnected: (connected: boolean) => void;
```

- [ ] **Step 2: Add the state and implementation**

Add `zoomConnected: false,` right after the `lastConnectedProvider: ...` line in the store's initial state:

```ts
      events: employeeCalendarData.events,
      syncStatus: employeeCalendarData.syncStatus,
      lastConnectedProvider: employeeCalendarData.syncStatus.google === 'connected' ? 'google' : null,
      zoomConnected: false,
```

Add the setter right after `setLastConnectedProvider: provider => set({ lastConnectedProvider: provider })` (note the comma that needs to move):

```ts
      setLastConnectedProvider: provider => set({ lastConnectedProvider: provider }),
      setZoomConnected: connected => set({ zoomConnected: connected })
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expect no new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/store/calendarStore.ts
git commit -m "feat(calendar): add zoomConnected state to calendarStore"
```

---

### Task 2: `zoom.utils.ts` — fake link generator

**Files:**
- Create: `src/features/employees/components/my-calendar/zoom.utils.ts`

**Interfaces:**
- Produces: `generateZoomLink(): string` — Task 4 calls this by exact name.

- [ ] **Step 1: Write the file**

```ts
export function generateZoomLink(): string {
  const id = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000);
  return `https://zoom.us/j/${id}`;
}
```

- [ ] **Step 2: Verify**

Run: `npm run build` — expect no new TypeScript errors. This file isn't imported anywhere yet, so this only checks the file itself is valid.

- [ ] **Step 3: Commit**

```bash
git add src/features/employees/components/my-calendar/zoom.utils.ts
git commit -m "feat(calendar): add generateZoomLink utility"
```

---

### Task 3: Zoom row in Calendar Sync settings

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `zoomConnected`/`setZoomConnected` from `useCalendarStore` (Task 1).
- Produces: nothing consumed by later tasks — Task 4 reads `zoomConnected` directly from the store itself, not from anything this task exports.

- [ ] **Step 1: Add store selectors and local connecting state**

Add alongside the other `useCalendarStore` selectors near the top of `MyCalendarTab`:

```tsx
  const zoomConnected = useCalendarStore(s => s.zoomConnected);
  const setZoomConnected = useCalendarStore(s => s.setZoomConnected);
```

Add alongside the existing `connectingProvider` state:

```tsx
  const [connectingZoom, setConnectingZoom] = useState(false);
```

- [ ] **Step 2: Add `handleZoomToggle`**

Add near `handleConnect`/`handleDisconnect`:

```tsx
  const handleZoomToggle = () => {
    if (zoomConnected) {
      setZoomConnected(false);
      return;
    }
    setConnectingZoom(true);
    setTimeout(() => {
      setZoomConnected(true);
      setConnectingZoom(false);
    }, 800);
  };
```

- [ ] **Step 3: Render the Zoom row**

Find this exact block in the Calendar Sync settings panel (the closing of the Google/Outlook `.map(...)` and the `.emc-sync` wrapper, immediately followed by the "Synced ..." meta line):

```tsx
                    ))}
                  </div>
                  <div className="emc-sync__meta">Synced {syncStatus.lastSynced}</div>
```

Replace it with (the Zoom row is inserted between the closing `</div>` of `.emc-sync` content and the `.emc-sync__meta` line — i.e. still inside `.emc-sync`, as a sibling to the mapped Google/Outlook rows, not nested inside the `.map()`):

```tsx
                    ))}
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
                        onClick={handleZoomToggle}
                      >
                        <RefreshCw size={12} className={connectingZoom ? 'emc-sync__spin' : ''} />
                        {connectingZoom ? 'Connecting…' : zoomConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                  <div className="emc-sync__meta">Synced {syncStatus.lastSynced}</div>
```

- [ ] **Step 4: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Open Calendar Settings → Calendar Sync tab. Confirm a "Zoom" row appears below Google/Outlook, showing "Not connected" with a "Connect" button. Click Connect — confirm an 800ms spinner shows "Connecting…", then flips to "Connected" with a "Disconnect" button. Click Disconnect — confirm it flips back to "Not connected" / "Connect" instantly (no spinner).

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): add Zoom connect/disconnect row to sync settings"
```

---

### Task 4: Auto-fill the Meeting link field

**Files:**
- Modify: `src/features/employees/components/my-calendar/NewEventWizard.tsx`

**Interfaces:**
- Consumes: `useCalendarStore`'s `zoomConnected` (Task 1); `generateZoomLink` (Task 2).
- Produces: nothing consumed by later tasks — leaf task, final task in this plan.

- [ ] **Step 1: Import `useCalendarStore` and `generateZoomLink`**

Add to the imports at the top of `NewEventWizard.tsx`:

```tsx
import { useCalendarStore } from '../../../../store/calendarStore';
import { generateZoomLink } from './zoom.utils';
```

- [ ] **Step 2: Read `zoomConnected`**

Add inside the `NewEventWizard` component, near the other hooks:

```tsx
  const zoomConnected = useCalendarStore(s => s.zoomConnected);
```

- [ ] **Step 3: Update `finalizeCreate`**

Replace:

```tsx
  const finalizeCreate = () => {
    onCreate(buildEventsFromForm(form));
    onClose();
  };
```

with:

```tsx
  const finalizeCreate = () => {
    const effectiveForm = (form.type === 'meeting' && zoomConnected && !form.location.trim())
      ? { ...form, location: generateZoomLink() }
      : form;
    onCreate(buildEventsFromForm(effectiveForm));
    onClose();
  };
```

- [ ] **Step 4: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. With Zoom disconnected, create a meeting with an empty Meeting link field — confirm the saved event's Location row is empty (unchanged from today's behavior). Connect Zoom (Task 3's UI). Create a meeting with the Meeting link field left empty — open the created event and confirm its Location row shows a generated `https://zoom.us/j/...` link. Create another meeting, this time typing a custom value into the Meeting link field — confirm that exact typed value is preserved, not overwritten. Create a Training or Company event (with Zoom still connected) — confirm its Location field is NOT auto-filled (the auto-fill only applies to `type === 'meeting'`).

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/NewEventWizard.tsx
git commit -m "feat(calendar): auto-fill meeting link with simulated Zoom link"
```

---

## Self-Review Notes

- Spec §1 (state) → Task 1. §2 (settings UI) → Task 3. §3 (link generation) → Task 2. §4 (wizard wiring) → Task 4. §5 (out of scope: real API, manual generate button, non-meeting types, visual badge, disconnect not stripping existing links) → none of these appear in any task. §6 (verification convention) → reflected in Global Constraints and every task's verify step.
- Type/name consistency check: `zoomConnected`, `setZoomConnected`, `generateZoomLink`, `connectingZoom`, `handleZoomToggle` are spelled identically everywhere they appear across Tasks 1, 3, and 4.
