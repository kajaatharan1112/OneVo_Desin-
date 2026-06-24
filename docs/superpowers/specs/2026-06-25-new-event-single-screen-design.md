# New Event Form — Single-Screen Redesign

Date: 2026-06-25
Module: Employee My Calendar (`src/features/employees/components/my-calendar/`)

## Context

`NewEventWizard.tsx` currently implements event creation as a 5-step wizard (Details → Schedule → More info → Reminders & repeat → Review), with a step indicator, per-step validation, and Back/Next navigation. Users get lost moving between steps and lose track of what they've already entered. This spec replaces the step-by-step flow with a single-screen form inside one larger popup, modeled on Microsoft Teams' "New meeting" dialog: one dialog, clearly labeled sections, no forced linear navigation.

This is a UI/flow restructuring only. The underlying data model, conflict-detection logic, and type-based creation rules defined in `docs/superpowers/specs/2026-06-24-new-event-wizard-design.md` are unchanged and still apply.

## Scope

- Replace the step-switched rendering in `NewEventWizard.tsx` with always-rendered, sectioned form content.
- Remove step indicator, `STEPS` array, `step` state, `goNext`/`goBack`, and per-step `validateStep`.
- Keep existing helpers unchanged: `new-event-wizard.utils.ts` (`buildEventsFromForm`, `findConflicts`, `EMPTY_NEW_EVENT_FORM`, `MOCK_ATTENDEES`, types).
- Keep the existing conflict-warning screen behavior (popup body swaps to conflict list on clash).
- No changes to `EventDetailsModal.tsx`, RSVP/approval logic, or `employee-calendar.types.ts`.

## Layout

One modal (`emc-modal`), sized larger than the current wizard modal to comfortably fit all sections without heavy scrolling. No step indicator. Sections, stacked top to bottom:

1. **Title & Type** — Title input; event type radio (Leave / Meeting / Company event).
2. **Schedule** — All-day toggle; when off, Date + Start time + End time; when on, Date or date range.
3. **Details** — Location (optional), Notes (optional); Attendees multi-select, shown only when type = Meeting.
4. **Reminders & Repeat** — Reminder dropdown (None / 10 min / 1 hr / 1 day before); Recurring toggle, with Frequency + Occurrences fields shown only when Recurring is on.

Each section has a heading but is always visible and editable — no expand/collapse, no step gating. Conditional fields (Attendees, Recurrence options) show/hide inline based on the Type/Recurring selections, same as today's per-step conditionals.

## Validation

Validate on submit only (clicking "Create Event"), not per field or per section. All applicable errors are collected at once and rendered together near the top of the form:

- Title is required.
- End time must be after start time (when not all-day).
- At least one attendee required when type = Meeting.
- Occurrences must be between 1 and 12 when Recurring is on.

This replaces the current `validateStep`/`stepError` (single message, blocks Next) with a list of all current errors shown together, since there are no more steps to block.

## Conflict Detection

Unchanged trigger and logic (see `2026-06-24-new-event-wizard-design.md`): clicking "Create Event" checks for clashes against existing `scope: 'my'` events before creating.

- If conflicts found, the popup body swaps from the form to the existing conflict list view (clashing event(s), Reschedule / Confirm anyway buttons) — same single dialog, just no step number involved.
- **Reschedule** → swaps back to the form (no step navigation needed, since Schedule is just a section already on screen).
- **Confirm anyway** → proceeds to create, same as today.

## Footer

Single primary action: **Create Event**. Plus the existing close (X) / implicit cancel via overlay click. No Back/Next.

## Component Changes

- `NewEventWizard.tsx`: remove `step`, `STEPS`, `goNext`, `goBack`, `validateStep`, the step-indicator JSX, and the `step === N &&` conditionals. Render all four sections unconditionally (with their own internal conditionals for type/recurring). Replace `stepError: string | null` with `errors: string[]`, computed at submit time.
- Consider renaming the file/component to `NewEventForm.tsx` / `NewEventForm` since "Wizard" no longer describes the UX. If the rename is deferred, the existing filename and import in `my-calendar-tab.tsx` stay as-is.
- CSS: existing `emc-wizard__*` classes in `employee-my-calendar.css` are reused where they still apply (fields, field-row, radio-group, attendees, conflict list, review-row patterns are not needed since there's no Review step). New/adjusted classes needed for section headings and a larger modal size; no changes to `EventDetailsModal.tsx` styles.

## Manual Testing

Same scenarios as the original spec, verified against the single-screen form instead of the wizard:

1. Create a Leave event with only Title + Schedule filled → appears immediately as confirmed.
2. Leave Title blank and click Create → error shown inline, form stays open, no other section's data is lost.
3. Create a Meeting with 0 attendees and click Create → attendee error shown alongside any other current errors.
4. Create a Meeting with 2+ attendees → RSVP badges show "Pending" in details modal.
5. Create a Company event → pending/dashed pill; Approve/Reject in `EventDetailsModal` work as before.
6. Create an event overlapping an existing "Morning Shift" → conflict view appears in the same popup; verify both Reschedule (returns to form, Schedule section still visible/editable) and Confirm anyway.
7. Create a weekly recurring Leave (4 occurrences) → 4 separate confirmed events on the correct dates.
