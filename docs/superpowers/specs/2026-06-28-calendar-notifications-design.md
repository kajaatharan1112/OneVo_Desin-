# Calendar Event Notifications (#58–61) — Design Spec

## Context

Continuing the 100-item Calendar Management Module audit, this spec covers the four "easy" notification journeys (#58 Event Created, #59 Meeting Invitation, #60 Event Updated, #61 Event Cancelled). The other four notification journeys (#62 Reminder, #63 Upcoming Event Reminder, #64 Daily Schedule Reminder, #65 Missed Event Notification) are explicitly deferred — they need real time-based scheduling logic that the existing notification system doesn't have (`timeLabel` is a free-text string like `"25 min ago"`, not a real timestamp), and they collide with the same "fake demo today vs. real clock" question already flagged during Group E. That's a separate, later spec.

This app already has a fully-built Inbox/Notification system (`src/core/notifications/inbox-context.tsx`, `useInbox()`/`addInboxItem()`, `AppNotification` type) already used by the Leave and Work modules — Calendar has simply never connected to it. This spec is wiring, not new infrastructure, matching the pattern of Group D's `historyStore` discovery and Group E's Leave/Work wiring.

**Investigated and ruled out:** a "real" targeted Meeting Invitation notification (one an invited attendee could actually see by switching context) is not achievable in this demo — the switchable employee profiles (`EmployeeId`: `'marcus' | 'manager' | 'alex'`) live in a completely different id space than calendar attendees (`CALENDAR_DIRECTORY`'s `'d-1'..'d-12'`) or Work's users (`'current-user'`/`'user-2'`/...). A `recipientId` set to a directory id would never match a `selectedEmployeeId`, so it would never actually render to anyone. All four notifications in this spec are therefore self-confirmations to the current user — the same shape Leave's existing "Leave request submitted" notification already uses.

## Goal

Fire an in-app inbox notification at the same four calendar lifecycle points Group D already hooks for history logging:

1. **Event Created** (`handleCreateEvents`) — every time, count-aware for recurring series.
2. **Meeting Invitation** (`handleCreateEvents`, same call) — only when the created event has attendees, as an *additional* notification alongside #1.
3. **Event Updated** (`finalizeSave`, single + series-wide) — one notification per save action.
4. **Event Cancelled** (delete, single + series) — one notification per delete action.

No backend, no network calls, no new `NotificationCategory` (reuses the existing `'meeting'` category, which already has an icon/label in `notification-item.tsx`), no scheduling/polling logic.

## 1. Notification content

All four reuse `category: 'meeting'`, `filter: 'new'`, `actions: []`, `timeLabel: 'Just now'` — matching the existing `'meeting'`-category seed entry's shape and Leave's self-confirmation convention. No `recipientId` is set (defaults to visible-to-current-user, same as Leave's notifications).

| # | Trigger | `title` | `message` |
|---|---|---|---|
| 58 | `handleCreateEvents` | `'Event created'` | `Created "X".` or `Created N occurrences of "X".` (count-aware, same wording Group D's history log already uses) |
| 59 | `handleCreateEvents`, only if `tagged.some(ev => ev.attendees?.length)` | `'Meeting invitation sent'` | `Invited N attendees to "X".` (N = the unique attendee count on the first tagged event with attendees) |
| 60 | `finalizeSave`, single-edit branch | `'Event updated'` | `"X" was updated.` |
| 60 | `finalizeSave`, series-edit branch | `'Event updated'` | `All occurrences of "X" were updated.` |
| 61 | `handleDeleteEvent` (single) | `'Event cancelled'` | `"X" was cancelled.` |
| 61 | series-delete branch | `'Event cancelled'` | `All occurrences of "X" were cancelled.` |

Each `AppNotification.id` is a fresh string (e.g. `notif-${Date.now()}-${Math.random().toString(36).slice(2,7)}`) — these are independent of the `recordHistory` entries already fired at the same call sites; the two systems (History/Audit page vs. Inbox notification feed) serve different purposes and are not deduplicated against each other.

## 2. Call sites

In `my-calendar-tab.tsx`'s `handleCreateEvents` (already imports `recordHistory`; this adds `useInbox`'s `addInboxItem` alongside it, same relative import path `../../../../core/notifications/inbox-context` Leave already uses):

```tsx
const { addInboxItem } = useInbox();
// ...inside handleCreateEvents, alongside the existing recordHistory call:
addInboxItem({
  id: `notif-${Date.now()}-created`,
  category: 'meeting',
  title: 'Event created',
  message: tagged.length > 1 ? `Created ${tagged.length} occurrences of "${titleSample}".` : `Created "${titleSample}".`,
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
```

In `EventDetailsModal.tsx`'s `finalizeSave` (already imports `recordHistory`; add `useInbox`/`addInboxItem` the same way):

```tsx
const { addInboxItem } = useInbox();
// alongside each existing recordHistory call in finalizeSave's two branches:
addInboxItem({
  id: `notif-${Date.now()}-updated`,
  category: 'meeting',
  title: 'Event updated',
  message: editingSeriesWide ? `All occurrences of "${event.title}" were updated.` : `"${event.title}" was updated.`,
  timeLabel: 'Just now',
  filter: 'new',
  actions: []
});
```

In `my-calendar-tab.tsx`'s `handleDeleteEvent` and `EventDetailsModal.tsx`'s series-delete branch (both already call `recordHistory` for "Event deleted"/"Series deleted" — add the matching `addInboxItem` call right next to each, titled `'Event cancelled'` per the journey's wording even though the underlying action is the existing Delete button, not a separate "Cancel" concept):

```tsx
addInboxItem({
  id: `notif-${Date.now()}-cancelled`,
  category: 'meeting',
  title: 'Event cancelled',
  message: `"${target.title}" was cancelled.`, // or the series-wide wording for the series-delete branch
  timeLabel: 'Just now',
  filter: 'new',
  actions: []
});
```

## 3. Out of scope

- #62 Reminder, #63 Upcoming Event Reminder, #64 Daily Schedule Reminder, #65 Missed Event Notification — deferred to a separate spec (needs real scheduling/"what counts as now" design work).
- Targeted, attendee-visible Meeting Invitation notifications — not achievable given the disjoint id spaces between calendar attendees and switchable employee profiles (see Context).
- Notification action buttons (e.g. "View Event") that would navigate back into the calendar — no click-through wiring in this pass.
- Firing notifications for RSVP (`handleRsvp`), drag-and-drop reschedule (`handleCellDrop`), Archive/Restore, or any sync action (Connect/Sync Now/Disconnect/conflict resolution) — consistent with the same exclusions Group D already established for history logging.
- A new `NotificationCategory` — reuses the existing `'meeting'` category.
- Deduplicating or cross-referencing inbox notifications against `historyStore` entries fired at the same call sites — they remain two independent, parallel side effects.

## 4. Verification

No test runner exists in this repo. Verification is `npm run build` for type safety, plus manual/code-level walkthrough via `npm run dev` (create an event, check the notification bell/panel for "Event created"; create a meeting with attendees, check for both "Event created" and "Meeting invitation sent"; edit and delete events, single and series-wide, and confirm the matching notifications appear) — consistent with every prior calendar increment's verification convention.
