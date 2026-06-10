import type { StepConfig } from './automationTypes';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';
import type { PersonTargetType } from './personTargetUtils';

const EMPLOYEE_CONTEXT_TRIGGERS = new Set([
  'employee_created',
  'employee_offboarding_started',
  'position_assignment_changed',
  'department_changed',
  'department_head_changed',
  'reporting_manager_missing',
  'leave_request_submitted',
  'attendance_correction_submitted',
  'employee_checked_in_late',
  'app_usage_violation_detected',
  'idle_time_exceeded_threshold',
  'device_offline_too_long',
  'location_mismatch_detected',
  'monitoring_alert_manually_created'
]);

export const ONE_TIME_TASK_ACTION_KEY = 'create_one_time_task';

export const TASK_PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITY_OPTIONS)[number];

export const TASK_MINUTE_OPTIONS = [0, 15, 30, 45] as const;

export const TASK_MIN_DURATION_MINUTES = 15;
export const TASK_MAX_DURATION_MINUTES = 720 * 60;
export const TASK_DEFAULT_HOURS = 4;
export const TASK_DEFAULT_MINUTES = 0;

export function isOneTimeTaskAction(actionKey: string | undefined): boolean {
  return actionKey === ONE_TIME_TASK_ACTION_KEY;
}

export function isEmployeeContextTrigger(triggerKey: string): boolean {
  return EMPLOYEE_CONTEXT_TRIGGERS.has(triggerKey);
}

export function getDefaultOneTimeTaskConfig(): Partial<StepConfig> {
  return {
    taskTitle: '',
    taskDescription: '',
    taskAssigneeType: '',
    taskAssigneeRole: '',
    taskAssigneePositionId: '',
    taskAssigneeEmployeeId: '',
    taskDueHours: TASK_DEFAULT_HOURS,
    taskDueMinutes: TASK_DEFAULT_MINUTES,
    taskPriority: 'medium',
    taskRelatedEmployeeFromTrigger: true
  };
}

export function normalizeTaskMinutes(value: number): number {
  const allowed = TASK_MINUTE_OPTIONS as readonly number[];
  if (allowed.includes(value)) return value;
  return allowed.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

export function clampTaskHours(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  if (value > 720) return 720;
  return Math.floor(value);
}

export function getTotalDurationMinutes(hours: number, minutes: number): number {
  return clampTaskHours(hours) * 60 + normalizeTaskMinutes(minutes);
}

export const TASK_MIN_DURATION_ERROR = 'Choose a duration of at least 15 minutes.';

export function formatDurationHHMM(hours: number, minutes: number): string {
  const h = clampTaskHours(hours);
  const m = normalizeTaskMinutes(minutes);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function adjustDurationByQuarterHour(
  hours: number,
  minutes: number,
  delta: 15 | -15
): { hours: number; minutes: number } {
  let total = getTotalDurationMinutes(hours, minutes) + delta;
  if (total < 0) total = 0;
  if (total > TASK_MAX_DURATION_MINUTES) total = TASK_MAX_DURATION_MINUTES;
  return {
    hours: Math.floor(total / 60),
    minutes: normalizeTaskMinutes(total % 60)
  };
}

export function formatDurationLabel(hours: number, minutes: number): string {
  const h = clampTaskHours(hours);
  const m = normalizeTaskMinutes(minutes);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m > 0) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  if (parts.length === 0) return '0 minutes';
  return parts.join(' ');
}

export function formatTaskAssigneePhrase(
  config: StepConfig,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string {
  const type = config.taskAssigneeType as PersonTargetType | '' | undefined;
  switch (type) {
    case 'Employee':
      return 'Employee';
    case 'Reporting Manager':
      return 'Reporting Manager';
    case 'Department Head':
      return 'Department Head';
    case 'Role':
      return config.taskAssigneeRole ? `${config.taskAssigneeRole} role` : 'role';
    case 'Specific Position': {
      const name = positions.find(p => p.id === config.taskAssigneePositionId)?.name;
      return name ? `${name} position` : 'position';
    }
    case 'Specific Employee': {
      const name = employees.find(e => e.id === config.taskAssigneeEmployeeId)?.name;
      return name || 'employee';
    }
    default:
      return 'assignee';
  }
}

export function oneTimeTaskStepPreview(
  config: StepConfig,
  positions: PositionOption[],
  employees: EmployeeOption[]
): string {
  const title = String(config.taskTitle ?? '').trim();
  if (!title) return 'Create one-time task';

  const assignee = formatTaskAssigneePhrase(config, positions, employees);
  const hours = Number(config.taskDueHours ?? TASK_DEFAULT_HOURS);
  const minutes = Number(config.taskDueMinutes ?? TASK_DEFAULT_MINUTES);
  const duration = formatDurationLabel(hours, minutes);

  return `Create task "${title}" for ${assignee}, due in ${duration}`;
}

export interface OneTimeTaskValidationIssue {
  id: string;
  message: string;
}

export function validateOneTimeTaskConfig(stepId: string, config: StepConfig): OneTimeTaskValidationIssue[] {
  const issues: OneTimeTaskValidationIssue[] = [];

  if (!String(config.taskTitle ?? '').trim()) {
    issues.push({ id: `task-title-${stepId}`, message: 'Task title is required.' });
  }

  const assigneeType = config.taskAssigneeType as PersonTargetType | '' | undefined;
  if (!assigneeType) {
    issues.push({ id: `task-assignee-type-${stepId}`, message: 'Assignee type is required.' });
  } else {
    if (assigneeType === 'Role' && !config.taskAssigneeRole) {
      issues.push({ id: `task-assignee-role-${stepId}`, message: 'Role is required when assignee type is Role.' });
    }
    if (assigneeType === 'Specific Position' && !config.taskAssigneePositionId) {
      issues.push({ id: `task-assignee-pos-${stepId}`, message: 'Position is required when assignee type is Specific Position.' });
    }
    if (assigneeType === 'Specific Employee' && !config.taskAssigneeEmployeeId) {
      issues.push({ id: `task-assignee-emp-${stepId}`, message: 'Employee is required when assignee type is Specific Employee.' });
    }
  }

  const hours = Number(config.taskDueHours ?? 0);
  const minutes = Number(config.taskDueMinutes ?? 0);
  const total = getTotalDurationMinutes(hours, minutes);

  if (total < TASK_MIN_DURATION_MINUTES) {
    issues.push({ id: `task-due-min-${stepId}`, message: TASK_MIN_DURATION_ERROR });
  }
  if (total > TASK_MAX_DURATION_MINUTES) {
    issues.push({ id: `task-due-max-${stepId}`, message: 'Due duration must not exceed 720 hours.' });
  }

  const priority = String(config.taskPriority ?? '');
  if (!priority || !TASK_PRIORITY_OPTIONS.includes(priority as TaskPriority)) {
    issues.push({ id: `task-priority-${stepId}`, message: 'Priority is required.' });
  }

  return issues;
}

export function computeDueAt(hours: number, minutes: number): string {
  const totalMs = getTotalDurationMinutes(hours, minutes) * 60 * 1000;
  return new Date(Date.now() + totalMs).toISOString();
}
