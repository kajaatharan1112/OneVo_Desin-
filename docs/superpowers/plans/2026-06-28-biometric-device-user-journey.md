# Biometric Device User Journey Implementation Plan

**Goal:** Add a tenant-admin biometric terminal workflow covering device overview, guided connection, validation, assignment, synchronization settings, activation, health monitoring, and attendance-ingestion visibility.

**Current boundary:** This repository is a React 19 + TypeScript + Vite frontend. It has no backend or hardware connector runtime. Phase 1 therefore implements a truthful interactive prototype with a typed mock service. Phase 2 defines the production API and connector responsibilities; browser code must never connect directly to a LAN biometric device or store its password.

**Placement:** The approved navigation is `Settings -> Devices -> Biometric Devices`. Preserve the existing employee-computer/WorkPulse device screen as a separate `Employee Devices` view inside the Devices workspace; biometric terminals and employee computers must not share data types, actions, or tables. Employee-role users must not receive biometric administration access.

## Journey and state model

Wizard sequence:

Functional sequence:

`Dashboard -> Select brand -> Connection details -> Test & validate -> Assign organization -> Configure synchronization -> Review -> Save & activate -> Device details`

The reference image compresses this into four visible milestones (`Brand`, `Connection Details`, `Test Connection`, `Complete`). The implementation will keep that compact visual stepper, while organization, synchronization, and review appear as clearly separated sections after a successful connection test and before the final activation. This preserves both the approved visual and every requirement in the written flow.

Setup statuses: `draft | validating | connection_failed | validated | activating | active`.

Operational statuses: `online | offline | attention | disabled | archived`. Sync statuses: `idle | syncing | success | partial | failed`.

The user may move backward without losing entered values. Forward navigation is gated by validation. Closing an incomplete wizard keeps a local draft; credentials are never persisted in frontend storage. Activation is idempotent and cannot occur until connection validation succeeds.

## Phase 1 — Interactive frontend

### Task 1: Add the feature domain and typed contracts

Create `src/features/biometric-devices/` as an independent device-management domain (it is reached through Settings, while its normalized events feed attendance) with:

- `types/biometric-device.types.ts`: brand, protocol, connection input, safe connection summary, device, assignment, sync configuration, health check, sync run, wizard state, and API-result types.
- `constants/biometric-device.constants.ts`: supported brands (`zkteco`, `hikvision`, `essl`, `suprema`, `anviz`, `other`), brand capabilities, default ports, wizard steps, and safe defaults.
- `mocks/biometric-device.mock-data.ts`: four devices covering online, offline, warning, and empty/error states; branches and attendance policies used by the prototype.
- `services/biometric-device.service.ts`: an async interface for list, validate, create/activate, update, test, sync-now, retry-sync, disable/enable, archive/restore, remove, and restart-connection. Phase 1 implementation returns deterministic mock responses with short latency.
- `utils/biometric-device.utils.ts`: status totals, date/relative-time formatting, form validation, masked endpoint formatting, and device filtering.

Rules:

- Use discriminated unions; no `any`.
- A device returned to UI contains `credentialConfigured: boolean`, never a password.
- Validation errors use field codes so the UI can associate them with controls.
- Keep transport/protocol details out of presentation components.

### Task 2: Build the feature store and wizard orchestration

Create:

- `store/biometric-device.store.ts` using Zustand for device collection, selected device, filters, async operation state, and toast state.
- `hooks/use-biometric-device-wizard.ts` for step transitions, per-step validation, draft values, test results, retry, and activation.

Store server-like data separately from temporary wizard form state. Do not use Zustand persistence for credentials. Prevent double submission while validation/activation is running. Normalize service errors into `unreachable`, `authentication_failed`, `unsupported_protocol`, `timeout`, and `unknown`.

### Task 3: Create the Settings > Devices workspace hierarchy

Modify:

- `src/shared/components/main-menu/main-menu.tsx`
- `src/features/settings/DevicesSettingsPage.tsx`
- `src/app/App.tsx` only if a route/deep-link adapter is required

Rename the existing Settings label from `Device` to `Devices`. Refactor `DevicesSettingsPage` into a small Devices workspace shell with two isolated child views:

- `Biometric Devices` — the approved default tenant-admin view and this feature's central dashboard.
- `Employee Devices` — the current WorkPulse/registered-computer implementation moved intact into its own child component.

Use an internal sub-navigation or route-aware tabs so the hierarchy is visible and keyboard accessible. Support a stable deep link such as `/settings/devices/biometric`; entering it must restore `Settings`, `Devices`, and `Biometric Devices`. Do not add this feature to `Time & Attendance` and do not expose it in employee-role navigation.

Prefer lazy-loading the page if routing is refactored; do not broaden this task into a full application-router rewrite.

### Task 4: Build the overview page

Create:

- `pages/biometric-devices-page.tsx`
- `components/device-summary-cards.tsx`
- `components/device-table.tsx`
- `components/device-empty-state.tsx`
- `components/device-status-badge.tsx`

The page includes title/description, `Connect Device` action, total/online/offline/warning cards, search, brand/status/branch filters, device table, loading skeleton, empty state, and recoverable error state. Table columns: name, brand/model, branch, endpoint (masked), last heartbeat, last sync, status, actions.

Reuse `ConfigShellHeader`, existing button/table primitives and semantic theme tokens. Summary cards are filters when clicked. Row selection opens device detail. At mobile widths, convert nonessential columns into a compact metadata stack.

### Task 5: Build the compact four-milestone wizard with seven functional sections

Create `components/connect-device-wizard/` with one orchestrator and focused step components:

1. `brand-step.tsx`: accessible radio-card selection for ZKTeco, Hikvision, eSSL, Suprema, Anviz, and Others. Brand controls adapter/SDK validation behavior.
2. `connection-step.tsx`: required device name, IP address, port, communication key, username, and password; optional timezone and description. Show/hide secrets and inline validation. Provide Back, Test Connection, and gated Next actions.
3. `validate-step.tsx`: run and display device reachable, authentication, communication key, SDK compatibility, firmware readable, and device-time checks. On success show model, serial number, and firmware; on failure distinguish offline, invalid IP, authentication failure, invalid communication key, and unreachable port, with edit/retry paths.
4. `assignment-step.tsx`: company, branch, location, and timezone. Consume existing organization data where possible and keep any prototype seed adapter isolated.
5. `sync-configuration-step.tsx`: frequency (`realtime`, `5 minutes`, `15 minutes`, `hourly`, `manual`), direction (`HRMS to device`, `device to HRMS`, `two-way`), auto-retry, and retry-attempt count.
6. `review-step.tsx`: device information, masked connection details, organization assignment, and synchronization settings. Credentials and communication keys display only as “Configured”.
7. `activation-step.tsx`: register device, save configuration, enable health monitoring, activate, show “Device Connected Successfully”, then offer `Go to Device` and `Go to Devices`.

Also create shared `wizard-stepper.tsx`, `wizard-footer.tsx`, and `connection-check-list.tsx`. Modal/dialog must trap focus, close on Escape only when no mutation is running, restore focus to the launch button, expose progress to screen readers, and warn before discarding meaningful unsaved input.

### Task 6: Build device detail and operational actions

Create:

- `pages/biometric-device-detail-page.tsx` or a route-aware detail panel
- `components/device-health-panel.tsx`
- `components/device-information-panel.tsx`
- `components/sync-history-table.tsx`
- `components/device-actions-menu.tsx`

Provide tabbed `Overview`, `Health`, `Attendance Sync`, `Logs`, and `Settings` views matching the reference journey:

- Overview: device name, brand, model, firmware, serial number, IP address, branch, location, connected-since, last sync, and current status.
- Health: health score, online state, last heartbeat, network latency, and connection state; optional CPU/memory/storage metrics render only when the adapter reports them.
- Attendance Sync: last/next sync, synchronization status, `Sync Now`, and `Retry Synchronization`.
- Logs: filterable/exportable activity entries for connected, disconnected, validation, sync started/completed/failed, configuration updated, and connection restarted.
- Settings: rename, update connection details, restart connection, disable/enable, archive/restore, and remove.

`Disable` is reversible and stops normal syncing, `Archive` is reversible and removes the device from the active default list while preserving history, and `Remove` is destructive. Archive and remove must never be treated as aliases. Service-affecting actions require confirmation and pending/success/failure feedback; remove requires stronger confirmation and must not silently delete historical attendance events.

### Task 7: Styling and responsive behavior

Create `biometric-devices.css`, scoped with a feature prefix. Use existing semantic CSS variables only; no hardcoded theme colors and no `!important`. Cover desktop, tablet, and mobile layouts, keyboard focus, reduced motion, long device names, empty tables, overflow, and dark/high-contrast themes.

### Task 8: Verification

Automated checks available in this repo:

- `npm run build`
- `npm run lint`

Manual acceptance matrix:

- Overview renders seeded devices and accurate status totals.
- Search and combined filters work; zero results differ from zero devices.
- Happy path completes all seven steps and adds an active device.
- Invalid IP/port, authentication failure, timeout, and unsupported protocol have actionable recovery.
- Back/next gating preserves non-secret values and never leaks a password into review, logs, or stored state.
- Double-clicking test/activate does not create duplicate requests/devices.
- Device detail actions update pending and final states correctly.
- Tenant admin can access `Settings -> Devices -> Biometric Devices`; employee-role view cannot.
- Existing Employee Devices/WorkPulse management remains functional and visually separate.
- Health score and summary totals derive from device state rather than hardcoded card values.
- Disable, archive, and remove follow their distinct lifecycle rules.
- Full flow works by keyboard with correct focus order and dialog semantics.
- Layout is checked at approximately 1440, 1024, 768, and 390 px, in light and dark themes.

## Phase 2 — Production backend and hardware connector

This work belongs in the backend/agent repository, not this frontend repository.

### Required architecture

Use a site connector/edge agent inside the customer network for terminals that are not publicly reachable:

`Biometric terminal <-> Site connector (outbound TLS) <-> OneVo device API <-> Queue/workers <-> Attendance ingestion`

The web browser calls OneVo APIs only. The connector owns vendor SDK/protocol communication. Vendor adapters implement a common interface: discover/validate identity, heartbeat, fetch users, fetch attendance logs by cursor, read clock, and optional clock correction.

### Minimum API contract

- `GET /api/biometric-devices`
- `POST /api/biometric-devices/connection-tests` (returns a test/job ID)
- `GET /api/biometric-devices/connection-tests/:id`
- `POST /api/biometric-devices` with an idempotency key
- `GET/PATCH /api/biometric-devices/:id`
- `POST /api/biometric-devices/:id/test`
- `POST /api/biometric-devices/:id/sync`
- `POST /api/biometric-devices/:id/disable`
- `POST /api/biometric-devices/:id/enable`
- `POST /api/biometric-devices/:id/archive`
- `POST /api/biometric-devices/:id/restore`
- `DELETE /api/biometric-devices/:id` (privileged, explicit retention behavior)
- `POST /api/biometric-devices/:id/restart-connection`
- `GET /api/biometric-devices/:id/health`
- `GET /api/biometric-devices/:id/sync-runs`

Long-running test/sync endpoints return `202 Accepted`; UI polls initially, with SSE/WebSocket optional later. Every resource and query is tenant-scoped and authorization-checked.

### Persistence and ingestion

Core records: `biometric_devices`, `device_credentials` (vault reference only), `device_assignments`, `device_health_events`, `device_sync_configs`, `device_sync_runs`, `raw_attendance_events`, and `employee_device_mappings`.

Raw attendance events are immutable and deduplicated by tenant + device + vendor event ID, with a deterministic fallback hash. Preserve device timestamp, device timezone, received-at timestamp, employee/device-user mapping, and processing status. Sync uses durable cursors and safe overlap windows so retries cannot lose or duplicate punches. Attendance policy processing consumes normalized events; payroll never consumes raw device events directly.

### Security and operations gates

- Encrypt credentials using a managed KMS/vault; never return them after creation.
- Outbound-only connector connectivity with per-site certificate rotation.
- RBAC permissions for view, connect, edit, sync, disable, archive, remove, export logs, and credential rotation.
- Audit every credential/communication-key change, validation, activation, assignment, manual sync, connection restart, disable/enable, archive/restore, remove request, and clock correction.
- Rate limits, timeouts, retry with backoff, circuit breaking, and queue dead-letter handling.
- Metrics/alerts for heartbeat age, sync lag, failure rate, clock drift, mapping failures, and queue depth.
- Define retention and biometric/privacy policy. OneVo should store attendance identifiers/events, not fingerprint templates, unless a separately approved requirement demands it.

## Delivery order

1. Tasks 1–3: contracts, mock service/store, navigation.
2. Tasks 4–5: overview and complete connection wizard.
3. Tasks 6–7: dashboard/actions and visual polish.
4. Task 8: build/lint plus browser acceptance pass.
5. Backend team implements the Phase 2 contract and one vendor adapter (recommend the actual pilot hardware, not all brands at once).
6. Replace the mock service behind the same frontend interface; run staging with a real terminal and failure simulations before rollout.

## Definition of done

Phase 1 is done when the complete journey is interactive, responsive, accessible, type-safe, build/lint clean relative to baseline, and clearly identified as simulated connectivity. Production is done only when a real device passes connect, incremental sync, duplicate replay, offline recovery, credential rotation, tenant isolation, audit, and attendance-to-payroll reconciliation tests.
