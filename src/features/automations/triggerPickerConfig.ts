import type { LucideIcon } from 'lucide-react';
import {
  UserPlus,
  UserMinus,
  Briefcase,
  Building2,
  Crown,
  UserX,
  Calendar,
  ClipboardCheck,
  Clock,
  Monitor,
  Timer,
  WifiOff,
  MapPinOff,
  BellRing
} from 'lucide-react';
import type { DemoTriggerKey } from './automationContextRules';
import { TRIGGER_GROUPS } from './automationContextRules';

export const TRIGGER_HELPER_TEXT: Record<DemoTriggerKey, string> = {
  employee_created: 'Starts when a new employee profile is created.',
  employee_offboarding_started: 'Starts when an employee offboarding process begins.',
  position_assignment_changed: 'Starts when an employee moves to another position.',
  department_changed: 'Starts when an employee\'s department assignment changes.',
  department_head_changed: 'Starts when a department\'s head role is updated.',
  reporting_manager_missing: 'Starts when an employee has no assigned reporting manager.',
  leave_request_submitted: 'Starts when an employee submits a leave request.',
  attendance_correction_submitted: 'Starts when an employee submits an attendance correction.',
  employee_checked_in_late: 'Starts when an employee checks in after the allowed time.',
  app_usage_violation_detected: 'Starts when monitored app usage violates policy.',
  idle_time_exceeded_threshold: 'Starts when idle time exceeds the configured threshold.',
  device_offline_too_long: 'Starts when a device stays offline longer than allowed.',
  location_mismatch_detected: 'Starts when an employee\'s location does not match expectations.',
  monitoring_alert_manually_created: 'Starts when someone manually creates a monitoring alert.'
};

export const TRIGGER_ICONS: Record<DemoTriggerKey, LucideIcon> = {
  employee_created: UserPlus,
  employee_offboarding_started: UserMinus,
  position_assignment_changed: Briefcase,
  department_changed: Building2,
  department_head_changed: Crown,
  reporting_manager_missing: UserX,
  leave_request_submitted: Calendar,
  attendance_correction_submitted: ClipboardCheck,
  employee_checked_in_late: Clock,
  app_usage_violation_detected: Monitor,
  idle_time_exceeded_threshold: Timer,
  device_offline_too_long: WifiOff,
  location_mismatch_detected: MapPinOff,
  monitoring_alert_manually_created: BellRing
};

/** Picker groups — Employee label (not Employee Lifecycle) with user-specified order. */
export const TRIGGER_PICKER_GROUP_ORDER = [
  'Employee',
  'Organization',
  'Leave',
  'Attendance',
  'Monitoring'
] as const;

const PICKER_GROUP_LABELS: Record<string, string> = {
  'Employee Lifecycle': 'Employee',
  Organization: 'Organization',
  Leave: 'Leave',
  Attendance: 'Attendance',
  Monitoring: 'Monitoring'
};

const ATTENDANCE_TRIGGER_ORDER: DemoTriggerKey[] = [
  'attendance_correction_submitted',
  'employee_checked_in_late'
];

export const TRIGGER_PICKER_GROUPS = TRIGGER_PICKER_GROUP_ORDER.map(groupKey => {
  const sourceKey = groupKey === 'Employee' ? 'Employee Lifecycle' : groupKey;
  const group = TRIGGER_GROUPS[sourceKey];
  const triggers = groupKey === 'Attendance'
    ? ATTENDANCE_TRIGGER_ORDER
        .map(key => group.triggers.find(t => t.key === key))
        .filter((t): t is (typeof group.triggers)[number] => Boolean(t))
    : group.triggers;
  return {
    key: groupKey,
    label: PICKER_GROUP_LABELS[sourceKey] ?? group.label,
    triggers
  };
});

export function triggerHelperText(key: string): string {
  return TRIGGER_HELPER_TEXT[key as DemoTriggerKey] ?? '';
}
