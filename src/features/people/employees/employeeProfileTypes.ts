export type ProfileTab = 'overview' | 'employment' | 'access' | 'documents' | 'activity';

export type OverrideScope = 'own' | 'direct-reports' | 'department' | 'company';

export interface RoleOverride {
  id: string;
  employeeId: string;
  roleId: string;
  roleName: string;
  scope: OverrideScope;
  effectiveFrom: string;
  effectiveTo: string | null;
  reason?: string;
}

export interface LeavePolicyOverride {
  id: string;
  employeeId: string;
  policyId: string;
  policyName: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  reason?: string;
}

export interface ScheduleOverride {
  id: string;
  employeeId: string;
  scheduleId: string;
  scheduleTitle: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  reason?: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  status: 'uploaded' | 'generated' | 'pending';
  date: string;
}

export interface EmployeeActivityEntry {
  id: string;
  employeeId: string;
  type:
    | 'created'
    | 'position-changed'
    | 'department-changed'
    | 'role-override-added'
    | 'leave-override-added'
    | 'schedule-override-added'
    | 'transfer'
    | 'offboarding-started';
  label: string;
  detail?: string;
  occurredAt: string;
}

export interface TransferFormValues {
  departmentId: string;
  positionId: string;
  effectiveDate: string;
  reportingManager: string;
  reason: string;
}

export interface OffboardingFormValues {
  lastWorkingDay: string;
  templateId: string;
  reason: string;
  notifyManager: boolean;
  disableAccessOnLastDay: boolean;
}

export interface RoleOverrideFormValues {
  roleId: string;
  scope: OverrideScope;
  effectiveFrom: string;
  effectiveTo: string;
  noEndDate: boolean;
  reason: string;
}

export interface LeaveOverrideFormValues {
  policyId: string;
  effectiveFrom: string;
  effectiveTo: string;
  noEndDate: boolean;
  reason: string;
}

export interface ScheduleOverrideFormValues {
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo: string;
  noEndDate: boolean;
  reason: string;
}

export type ProfileModal =
  | 'edit-profile'
  | 'transfer'
  | 'offboarding'
  | 'role-override'
  | 'leave-override'
  | 'schedule-override'
  | null;
