# Week/Day View Drag-to-Create-Event — Design Spec

## Context

In Week view ([my-calendar-tab.tsx:renderWeek](../../../src/features/employees/components/my-calendar/my-calendar-tab.tsx)) and Day view (`renderDay`), the hour-grid cells (`.emc-week__cell`, `.emc-day__row`/`.emc-day__slot`) currently have no interaction of their own — only the event pills inside them are clickable (to open `EventDetailsModal`). Clicking/dragging on empty time has no effect. Creating a timed event today requires the "+ New Event" button and manually typing the date and time.

Goal: clicking-and-dragging on an empty time slot in Week or Day view starts a real time-range selection (like Google Calendar), and releasing the mouse opens the New Event wizard pre-filled with that date/time range.

## 1. Interaction model

- `mousedown` on an hour cell starts a drag. The initial minute offset is computed from the cursor's Y position within that specific cell's bounding rect, snapped to the nearest 15 minutes.
- A `document`-level `mousemove` listener (attached only while dragging) uses `document.elementFromPoint(clientX, clientY)` to find the hour cell currently under the cursor, and extends the selection's end time to that cell's snapped 15-minute mark — but only if it's the same day column the drag started in. Moving into a different day (Week view) does not change the day; only vertical movement extends/shrinks the time range.
- `mouseup` finalizes the drag: computes the final snapped `{ date, start, end }`, `console.log`s it (e.g. `console.log('Selected:', date, start, '–', end)`), and opens `NewEventWizard` with `initialOverrides = { date, start, end, allDay: false, type: 'meeting' }`.
- A click with no real drag movement (mouseup fires before any mousemove changed the end time) is treated as a 30-minute selection: end = start + 30 minutes. This reuses the same finalize path — there's no separate "click vs drag" branch, just whatever the end time computed out to.

## 2. Visual feedback while dragging

Hour rows use `min-height` (52px Week / 56px Day), not a fixed height — they grow when they contain event pills. Pixel-precise absolute-positioned highlight overlays would be fragile against that. Instead:

- Every hour cell currently within the drag's vertical range gets a CSS class (`emc-week__cell--dragselect` for Week, `emc-day__row--dragselect` for Day) applied for the duration of the drag — a soft accent-tinted background, removed on `mouseup`.
- This means the highlight is **whole-hour-cell granularity** even though the stored start/end time is 15-minute precise. This is an intentional simplification to avoid fragile pixel math; the wizard that opens afterward shows the exact snapped times in its Start/End time inputs, so the precision isn't lost — only the live-drag highlight is coarser than the final result.

## 3. Wizard changes

- `NewEventWizard` ([NewEventWizard.tsx](../../../src/features/employees/components/my-calendar/NewEventWizard.tsx)) gains one new optional prop: `initialOverrides?: Partial<NewEventFormState>`.
- Its form state initializes as `useState(() => ({ ...EMPTY_NEW_EVENT_FORM, ...initialOverrides }))` instead of always `EMPTY_NEW_EVENT_FORM`.
- The existing "+ New Event" header button keeps rendering `<NewEventWizard ... />` with no `initialOverrides` — unchanged behavior, defaults stay as today.
- The new drag-to-create flow renders the same `NewEventWizard` with `initialOverrides={{ date, start, end, allDay: false, type: 'meeting' }}`.
- No other wizard behavior changes — `TYPE_FIELD_CONFIG`, validation, conflict detection, etc. all apply normally since the user can still freely change the type/fields after the wizard opens.

## 4. State ownership

All new state (`dragging`, `dragDayKey`, `dragStartMinutes`, `dragEndMinutes`) lives in `MyCalendarTab` ([my-calendar-tab.tsx](../../../src/features/employees/components/my-calendar/my-calendar-tab.tsx)) alongside the existing `newEventOpen` state, since that's where `NewEventWizard` is already rendered and where `renderWeek`/`renderDay` already live. No new component file is needed — this is a behavior addition to the existing month/week/day rendering functions, not a new isolated unit.

## Out of scope

- Month view is unaffected — drag-to-create only applies to Week and Day views, where there's an hour grid to drag across.
- No cross-day dragging (a drag can't span from Monday into Tuesday in Week view).
- No drag-to-reschedule of *existing* events (that's a separate, already-tracked to-do item from the calendar journey audit — #40 Drag & Drop Reschedule).
- No persistence/undo of the drag selection if the wizard is cancelled — closing the wizard just discards the selection, same as today's "+ New Event" cancel behavior.
