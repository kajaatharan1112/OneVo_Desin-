# Calendar Event Notifications (#58–61) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fire in-app inbox notifications for the four calendar lifecycle actions that already log to history (create, meeting-invite, update, cancel/delete), reusing the existing `useInbox()`/`addInboxItem()` system already used by Leave and Work.

**Architecture:** Both call sites already exist (Group D's history-logging hooks). This plan adds one `useInbox()` import and matching `addInboxItem(...)` calls right next to each existing `recordHistory(...)` call, in the same two files.

**Tech Stack:** React 19, TypeScript. No new store, no test runner in this repo.

## Global Constraints

- Reuse the existing `'meeting'` `NotificationCategory` — no new category, no changes to `notification.types.ts` or `notification-item.tsx`.
- No `recipientId` on any of these notifications (self-confirmation to the current user, same as Leave's existing notifications) — a targeted, attendee-visible notification is not achievable given the disjoint id spaces between `CALENDAR_DIRECTORY` and `EmployeeId` (see spec Context).
- `timeLabel: 'Just now'`, `filter: 'new'`, `actions: []` on every notification in this plan.
- Never fire a notification for RSVP (`handleRsvp`), drag-and-drop reschedule (`handleCellDrop`), Archive/Restore, or any sync action — same exclusions Group D already established for history logging.
- No test runner exists in this repo (no Jest/Vitest, no `test` script in `package.json`). Verification per task is `npm run build` for type safety plus a manual/code-level walkthrough via `npm run dev`.

---

## File Structure

- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx` — `handleCreateEvents` gains "Event created" + conditional "Meeting invitation sent"; `handleDeleteEvent` gains "Event cancelled".
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx` — `finalizeSave`'s two branches gain "Event updated"; the series-delete branch gains "Event cancelled" (series wording).

---

### Task 1: `my-calendar-tab.tsx` — created, invitation, cancelled (single)

**Files:**
- Modify: `src/features/employees/components/my-calendar/my-calendar-tab.tsx`

**Interfaces:**
- Consumes: `useInbox` from `../../../../core/notifications/inbox-context` (already exists, already used the same way by `employee-leave.tsx`).
- Produces: nothing consumed by Task 2 (different file) — both tasks are independent, sharing only the established `addInboxItem` call shape.

- [ ] **Step 1: Import `useInbox` and grab `addInboxItem`**

Add the import alongside the existing `recordHistory` import:

```tsx
import { recordHistory } from '../../../../store/historyStore';
import { useInbox } from '../../../../core/notifications/inbox-context';
```

Add the hook call inside the component, near the other store/context hooks at the top of `MyCalendarTab`:

```tsx
  const { addInboxItem } = useInbox();
```

- [ ] **Step 2: Add "Event created" + conditional "Meeting invitation sent" to `handleCreateEvents`**

Replace:

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

with:

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
    addInboxItem({
      id: `notif-${Date.now()}-created`,
      category: 'meeting',
      title: 'Event created',
      message: tagged.length > 1
        ? `Created ${tagged.length} occurrences of "${titleSample}".`
        : `Created "${titleSample}".`,
      timeLabel: 'Just now',
      filter: 'new',
      actions: []
    });
    const withAttendees = tagged.find(ev => ev.attendees && ev.attendees.length > 0);
    if (withAttendees) {
      addInboxItem({
        id: `notif-${Date.now()}-invite`,
        category: 'meeting',
        title: 'Meeting invitation sent',
        message: `Invited ${withAttendees.attendees!.length} attendees to "${withAttendees.title}".`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: []
      });
    }
    setScope('my');
    setEnabledTypes(prev => {
      const next = new Set(prev);
      tagged.forEach(ev => next.add(ev.type));
      return next;
    });
  };
```

- [ ] **Step 3: Add "Event cancelled" to `handleDeleteEvent`**

Replace:

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
      addInboxItem({
        id: `notif-${Date.now()}-cancelled`,
        category: 'meeting',
        title: 'Event cancelled',
        message: `"${target.title}" was cancelled.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: []
      });
    }
    setSelectedEvent(null);
  };
```

- [ ] **Step 4: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Create a plain event (no attendees) via New Event — open the notification bell/panel and confirm an "Event created" entry appears, with no "Meeting invitation sent" entry. Create a meeting WITH attendees — confirm BOTH "Event created" and "Meeting invitation sent" appear, the latter naming the correct attendee count and title. Delete any event — confirm "Event cancelled" appears.

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/my-calendar-tab.tsx
git commit -m "feat(calendar): notify on event create, meeting invite, and delete"
```

---

### Task 2: `EventDetailsModal.tsx` — updated, cancelled (series)

**Files:**
- Modify: `src/features/employees/components/my-calendar/EventDetailsModal.tsx`

**Interfaces:**
- Consumes: `useInbox` from `../../../../core/notifications/inbox-context` (same import as Task 1, different file — no shared state between the two tasks).
- Produces: nothing consumed by later tasks — this plan has only 2 tasks.

- [ ] **Step 1: Import `useInbox` and grab `addInboxItem`**

Add the import alongside the existing `recordHistory`/`useHistoryStore` import:

```tsx
import { recordHistory, useHistoryStore } from '../../../../store/historyStore';
import { useInbox } from '../../../../core/notifications/inbox-context';
```

Add the hook call inside the component, near the other store hooks at the top of `EventDetailsModal`:

```tsx
  const { addInboxItem } = useInbox();
```

- [ ] **Step 2: Add "Event updated" to both branches of `finalizeSave`**

Replace:

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
      addInboxItem({
        id: `notif-${Date.now()}-updated`,
        category: 'meeting',
        title: 'Event updated',
        message: `All occurrences of "${event.title}" were updated.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: []
      });
    } else {
      onSave(form);
      recordHistory({
        category: 'Calendar',
        title: 'Event updated',
        description: `"${event.title}" was updated.`,
        target: event.title
      });
      addInboxItem({
        id: `notif-${Date.now()}-updated`,
        category: 'meeting',
        title: 'Event updated',
        message: `"${event.title}" was updated.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: []
      });
    }
    setEditing(false);
    setConflicts(null);
    setEditingSeriesWide(false);
  };
```

- [ ] **Step 3: Add "Event cancelled" to the series-delete branch**

Replace:

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

with:

```tsx
                    } else if (event.seriesId) {
                      recordHistory({
                        category: 'Calendar',
                        title: 'Series deleted',
                        description: `All occurrences of "${event.title}" were deleted.`,
                        target: event.title
                      });
                      addInboxItem({
                        id: `notif-${Date.now()}-cancelled`,
                        category: 'meeting',
                        title: 'Event cancelled',
                        message: `All occurrences of "${event.title}" were cancelled.`,
                        timeLabel: 'Just now',
                        filter: 'new',
                        actions: []
                      });
                      deleteSeries(event.seriesId);
                      onClose();
                    }
```

(The "This event" single-delete branch already routes through `onDelete(event.id)` → `my-calendar-tab.tsx`'s `handleDeleteEvent`, Task 1 — no separate change needed here for that path.)

- [ ] **Step 4: Verify**

Run: `npm run build` — expect no new TypeScript errors.
Run: `npm run dev`. Edit a plain event's title and save — confirm "Event updated" appears in the notification panel. Create a recurring event (3 occurrences), edit "all events in series" — confirm "Event updated" appears once (not 3 times), with the series wording. Delete "all events in series" — confirm "Event cancelled" appears once with the series wording. Delete a single non-series event — confirm "Event cancelled" still appears (via Task 1's `handleDeleteEvent` hook, unaffected by this task).

- [ ] **Step 5: Commit**

```bash
git add src/features/employees/components/my-calendar/EventDetailsModal.tsx
git commit -m "feat(calendar): notify on event update and series cancellation"
```

---

## Self-Review Notes

- Spec §1 (notification content/wording) → both tasks' exact message strings match the spec's table verbatim. §2 (call sites) → Task 1 covers `handleCreateEvents`/`handleDeleteEvent`, Task 2 covers `finalizeSave`'s two branches and the series-delete branch. §3 (out of scope: #62-65, targeted invites, action buttons, RSVP/drag/archive/sync exclusions, no new category) → none of these appear in either task. §4 (verification convention) → reflected in Global Constraints and both tasks' verify steps.
- Type/name consistency check: `addInboxItem`, the `category: 'meeting'` literal, `timeLabel: 'Just now'`, `filter: 'new'`, `actions: []` are spelled identically across both tasks.
