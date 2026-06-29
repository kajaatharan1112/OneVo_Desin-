# Roles & Permissions Row Details Popup — Implementation Plan

## Goal

Simplify the Roles & Permissions table by removing the Action column and every
three-dot action menu. Clicking anywhere on a role row opens one full role-details
popup. The popup supports viewing, editing, and deactivating where permitted. Role
assignment is not exposed from this page.

## Confirmed UX Rules

- Remove the `Action` header, action cells, three-dot icons, and menu.
- Make each role row clickable and visually indicate that it is interactive.
- Clicking a row opens a wide, responsive `Role Details` popup.
- The popup shows the complete role information:
  - role name, description, type, and active/inactive status;
  - permission count and permissions grouped by module;
  - assigned-user count and assigned-user list;
  - last-updated value.
- The initial popup state is view-only.
- An eligible custom active role can switch to edit mode inside the same popup.
- Edit mode supports role name, description, and permissions, using the existing
  permission search, module selection, and validation behavior.
- Deactivate is available in the popup only for an active custom role when the actor
  has `roles:delete`.
- System roles are always read-only and cannot be deactivated.
- Inactive roles remain viewable but do not show Edit or Deactivate actions.
- Do not show `Assign` anywhere in this table or popup.
- Keep Create Role as a separate existing flow.

## Implementation

### 1. Consolidate page state

Update `src/features/admin/RolesPermissionsPage.tsx`.

- Replace the current action-menu state and modes with explicit role-detail state,
  for example `create | details | details-edit | null`.
- Add `openRoleDetails(roleId)` and attach it to the table row.
- Reuse the existing role form state when details mode transitions to edit mode.
- Preserve the selected role after save so the popup returns to refreshed view mode
  instead of closing unexpectedly.
- Remove unused menu/assignment handlers, form state, permission checks, and icon
  imports after the UI is removed.

### 2. Remove row actions and add accessible row interaction

In the roles table:

- Delete the Action column header and corresponding body cell.
- Delete `openActionId` and the complete three-dot menu implementation.
- Add row click handling plus keyboard support (`Enter` and `Space`), `tabIndex=0`,
  and an accessible label so the behavior is not mouse-only.
- Ensure controls inside a future row do not accidentally trigger the row click.
- Retain inactive-row styling while keeping the row readable and focusable.

### 3. Build the unified full-view popup

Replace the narrow users-only drawer with a wide role-details popup/drawer using the
existing organization slideover design system.

- Header: role name, type/status badges, updated value, and close control.
- Summary section: description, permission count, and assigned-user count.
- Permissions section: group permission definitions by module and render readable
  permission code/description rows.
- Users section: reuse `usersForRole`; retain the empty state when no users are assigned.
- Footer in view mode:
  - `Close`;
  - `Edit` only when `roles:edit`, custom, and active;
  - `Deactivate` only when `roles:delete`, custom, and active.
- Footer must never contain Assign or Duplicate.

### 4. Edit inside the same popup

- Transition the details popup into edit mode without opening a second overlay.
- Reuse the current Basic Info and Permissions editor.
- Keep existing validation: non-empty name and at least one permission.
- Save through `roleStore.updateRole` and display the updated details immediately.
- Cancel returns to view mode without losing the selected role.
- Disable backdrop close while there are unsaved changes, or confirm before discarding.

### 5. Deactivation behavior

- Trigger the existing confirmation before deactivation.
- Call `roleStore.deactivateRole` only after confirmation.
- On success, keep the popup open in refreshed read-only state and show the Inactive
  badge; Edit and Deactivate actions disappear.
- Do not alter existing user assignments as part of deactivation.

### 6. Remove assignment UI from this page

- Delete the `assign` drawer markup and all supporting local state/handlers.
- Remove this component's use of `assignRoleToUsers`, `ACCESS_SCOPE_OPTIONS`, and
  department/assignment-specific inputs.
- Keep assignment methods in `roleStore` because employee and other access flows may
  still depend on them; this change only removes assignment from Roles & Permissions UI.
- Keep assigned-user data read-only in the details popup.

### 7. Styling

Update `src/features/admin/admin.css` (and only shared organization styles if truly
required).

- Add role-row hover, focus-visible, and cursor states.
- Add responsive detail-popup layout and compact summary metadata.
- Style permission groups and user list for both light and dark theme tokens.
- Keep the popup usable at narrow widths with a stacked layout and sticky footer.

## Acceptance Checks

1. The table has six columns and no Action column or three-dot icon at any viewport.
2. Mouse click, Enter, and Space on a role row open the correct role details.
3. Details show correct role metadata, grouped permissions, and assigned users.
4. An authorized user can edit an active custom role and see saved values immediately.
5. System and inactive roles cannot enter edit mode.
6. An authorized user can deactivate an active custom role; it becomes read-only.
7. Users without edit/delete permissions see a view-only popup.
8. Assign and Duplicate do not appear anywhere in the row-details flow.
9. Create Role continues to work unchanged.
10. Search, summary counts, persisted role data, and access guards remain correct.
11. `npm run build` and `npm run lint` pass.

## Files Expected to Change

- `src/features/admin/RolesPermissionsPage.tsx`
- `src/features/admin/admin.css`

No store schema change is required for this UI slice.
