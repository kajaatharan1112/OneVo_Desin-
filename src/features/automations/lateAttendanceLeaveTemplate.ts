import type { AutomationStep } from './automationTypes';

export type LateAttendanceRounding = 'exact' | 'nearest_15' | 'nearest_30';
export type LateAttendanceApprovalMode = 'auto_apply' | 'require_approval';

export const LATE_ATTENDANCE_LEAVE_ACTION_KEYS = [
  'convert_attendance_to_full_day_leave',
  'convert_attendance_to_half_day_leave',
  'deduct_late_time_from_leave_balance',
  'create_attendance_alert'
] as const;

export type LateAttendanceLeaveActionKey = (typeof LATE_ATTENDANCE_LEAVE_ACTION_KEYS)[number];

export const DEFAULT_LATE_ATTENDANCE_SETUP = {
  leaveTypeId: 'lt-annual',
  leaveTypeName: 'Annual Leave',
  workdayHours: 8,
  gracePeriodMinutes: 15,
  halfDayThresholdMinutes: 120,
  fullDayThresholdMinutes: 240,
  rounding: 'exact' as LateAttendanceRounding,
  approvalMode: 'auto_apply' as LateAttendanceApprovalMode
};

const stepId = () => `step-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

export function isLateAttendanceLeaveAction(actionKey: string): actionKey is LateAttendanceLeaveActionKey {
  return (LATE_ATTENDANCE_LEAVE_ACTION_KEYS as readonly string[]).includes(actionKey);
}

export function lateAttendanceActionLabel(actionKey: string): string {
  switch (actionKey) {
    case 'convert_attendance_to_full_day_leave':
      return 'Convert attendance to full-day leave';
    case 'convert_attendance_to_half_day_leave':
      return 'Convert attendance to half-day leave';
    case 'deduct_late_time_from_leave_balance':
      return 'Deduct late time from leave balance';
    case 'create_attendance_alert':
      return 'Create attendance alert';
    default:
      return actionKey;
  }
}

function sharedActionConfig() {
  const defaults = DEFAULT_LATE_ATTENDANCE_SETUP;
  return {
    leaveTypeId: defaults.leaveTypeId,
    leaveTypeName: defaults.leaveTypeName,
    workdayHours: defaults.workdayHours,
    approvalMode: defaults.approvalMode
  };
}

export function buildLateAttendanceLeaveSteps(): AutomationStep[] {
  const defaults = DEFAULT_LATE_ATTENDANCE_SETUP;
  const shared = sharedActionConfig();
  let sort = 0;

  const condition = (
    id: string,
    ruleLabel: string,
    operator: 'greater_than_or_equal' | 'greater_than',
    value: number,
    elseIf: boolean
  ): AutomationStep => ({
    id,
    type: 'condition',
    sectionId: 'main',
    sortOrder: sort++,
    config: {
      conditions: [
        {
          id: `cc-${id}`,
          field: 'late_minutes',
          operator,
          value: String(value)
        }
      ],
      hasBranch: false,
      ruleLabel,
      elseIf
    }
  });

  const fullConditionId = stepId();
  const halfConditionId = stepId();
  const graceConditionId = stepId();

  return [
    {
      id: stepId(),
      type: 'trigger',
      sectionId: 'main',
      sortOrder: sort++,
      config: { triggerKey: 'employee_checked_in_late' }
    },
    condition(
      fullConditionId,
      'Full-day rule',
      'greater_than_or_equal',
      defaults.fullDayThresholdMinutes,
      false
    ),
    {
      id: stepId(),
      type: 'action',
      sectionId: 'main',
      sortOrder: sort++,
      config: {
        actionKey: 'convert_attendance_to_full_day_leave',
        ...shared,
        deductionAmount: 1
      }
    },
    {
      id: stepId(),
      type: 'end',
      sectionId: 'main',
      sortOrder: sort++,
      config: { endReason: 'stop_if_matched', label: 'Stop if matched' }
    },
    condition(
      halfConditionId,
      'Half-day rule',
      'greater_than_or_equal',
      defaults.halfDayThresholdMinutes,
      true
    ),
    {
      id: stepId(),
      type: 'action',
      sectionId: 'main',
      sortOrder: sort++,
      config: {
        actionKey: 'convert_attendance_to_half_day_leave',
        ...shared,
        deductionAmount: 0.5
      }
    },
    {
      id: stepId(),
      type: 'end',
      sectionId: 'main',
      sortOrder: sort++,
      config: { endReason: 'stop_if_matched', label: 'Stop if matched' }
    },
    condition(
      graceConditionId,
      'Late-minute deduction rule',
      'greater_than',
      defaults.gracePeriodMinutes,
      true
    ),
    {
      id: stepId(),
      type: 'action',
      sectionId: 'main',
      sortOrder: sort++,
      config: {
        actionKey: 'deduct_late_time_from_leave_balance',
        ...shared,
        deductionSource: 'late_minutes',
        rounding: defaults.rounding
      }
    },
    {
      id: stepId(),
      type: 'end',
      sectionId: 'main',
      sortOrder: sort++,
      config: { endReason: 'stop_if_matched', label: 'Stop if matched' }
    },
    {
      id: stepId(),
      type: 'end',
      sectionId: 'main',
      sortOrder: sort++,
      config: { endReason: 'no_deduction', label: 'No leave deduction' }
    }
  ];
}
