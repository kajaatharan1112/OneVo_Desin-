import type { WorkMode } from '../../../types/organization';
import type { WorkTypeRule } from '../../time-attendance/clock-in-policy/clockInPolicyTypes';

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'field', label: 'Field' }
];

export function workModeLabel(mode: WorkMode | null | undefined): string {
  if (!mode) return '—';
  return WORK_MODE_OPTIONS.find(o => o.value === mode)?.label ?? mode;
}

export function workModeBadgeClass(mode: WorkMode): string {
  switch (mode) {
    case 'onsite':
      return 'emp-work-mode-badge--onsite';
    case 'remote':
      return 'emp-work-mode-badge--remote';
    case 'hybrid':
      return 'emp-work-mode-badge--hybrid';
    case 'field':
      return 'emp-work-mode-badge--field';
    default:
      return '';
  }
}

/** Clock-in Policy work type rule id for a given employee work mode. */
export function workModeToPolicyRuleId(mode: WorkMode): string {
  return `wt-${mode}`;
}

/** Resolve the Clock-in Policy row that applies to an employee's work mode. */
export function getClockInPolicyRuleForWorkMode(
  mode: WorkMode,
  rules: WorkTypeRule[]
): WorkTypeRule | undefined {
  return rules.find(r => r.workMode === mode);
}

/**
 * Clock-in Policy reads employee work mode — profile only stores the value.
 * - Onsite: biometric by default unless fallback is active
 * - Remote: web/tray with photo verification
 * - Hybrid: biometric onsite, web/tray when remote
 * - Field: field clock-in policy
 */
export function clockInPolicySummaryForWorkMode(mode: WorkMode): string {
  switch (mode) {
    case 'onsite':
      return 'Biometric by default unless fallback is active.';
    case 'remote':
      return 'Web/tray clock-in; photo verification may apply.';
    case 'hybrid':
      return 'Biometric when onsite; web/tray when remote.';
    case 'field':
      return 'Follow field clock-in policy.';
    default:
      return '';
  }
}
