export type LeaveCategory =
  | 'Annual'
  | 'Sick'
  | 'Maternity'
  | 'Paternity'
  | 'Compassionate'
  | 'Unpaid'
  | 'Custom';

export type LeaveStatus = 'active' | 'inactive';
export type AccrualMethod = 'yearly' | 'monthly' | 'daily';
export type PolicyScope = 'company' | 'department' | 'position';
export type EntitlementSource = 'generated' | 'manual';
export type EntitlementStatus = 'active' | 'missing-policy';

export type GenderApplicability = 'all' | 'male' | 'female';
export type LeaveLimitUnit = 'hours' | 'minutes';
export type LeaveLimitPeriod = 'yearly' | 'monthly';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  category: LeaveCategory;
  description: string;
  paidLeave: boolean;
  active: boolean;
  status: LeaveStatus;
  genderApplicability: GenderApplicability;
}

export interface LeavePolicy {
  id: string;
  name: string;
  leaveTypeId: string;
  description: string;
  effectiveFrom: string;
  status: LeaveStatus;
  appliesTo: PolicyScope;
  departmentIds: string[];
  positionIds: string[];
  limitValue: number;
  limitUnit: LeaveLimitUnit;
  limitPeriod: LeaveLimitPeriod;
  accrualMethod: AccrualMethod;
  proRataNewJoiners: boolean;
  carryForwardAllowed: boolean;
  maxCarryForwardValue: number;
  carryForwardExpiryMonths: number;
  minNoticeDays: number;
  maxConsecutiveDays: number | null;
  minRequestValue: number;
  blackoutPeriods: string;
  requiresDocument: boolean;
  documentRequiredAfterValue: number | null;
}

export interface LeaveEntitlement {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  policyId: string | null;
  policyName: string | null;
  year: number;
  totalValue: number;
  usedValue: number;
  pendingValue: number;
  remainingValue: number;
  limitUnit: LeaveLimitUnit;
  limitPeriod: LeaveLimitPeriod;
  source: EntitlementSource;
  status: EntitlementStatus;
}

export interface EntitlementAuditEntry {
  id: string;
  entitlementId: string;
  date: string;
  employeeId: string;
  leaveTypeId: string;
  changeType: string;
  daysChanged: number;
  balanceAfter: number;
  reason: string;
  changedBy: string;
}

export interface LeaveTypeFormState {
  open: boolean;
  mode: 'create' | 'edit';
  leaveTypeId: string | null;
}

export interface LeavePolicyFormState {
  open: boolean;
  mode: 'create' | 'edit';
  policyId: string | null;
}

export interface GeneratePreviewRow {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  positionName: string;
  leaveTypeName: string;
  policyName: string | null;
  days: number;
  skipped: boolean;
  skipReason?: string;
}
