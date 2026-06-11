export type RequestStatus =
  | 'pending'
  | 'needs-action'
  | 'approved'
  | 'rejected'
  | 'forwarded';

export type RequestType = 'leave' | 'expense' | 'wfh' | 'asset' | 'attendance';

export type ReviewerRole = 'Manager' | 'Finance' | 'HR' | 'IT';

export type RequestRowAction = 'upload-receipt' | 'view-reason';

export type RequestStatusGroupId = 'needs-action' | 'pending' | 'approved' | 'rejected';

export interface EmployeeRequest {
  id: string;
  title: string;
  type: RequestType;
  typeLabel: string;
  status: RequestStatus;
  with: ReviewerRole;
  expected: string;
  nextAction: string;
  rowAction?: RequestRowAction;
}

export interface RequestStatusGroup {
  id: RequestStatusGroupId;
  title: string;
  requests: EmployeeRequest[];
}

export interface NeedsActionItem {
  requestTitle: string;
  message: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  needsAction: number;
}

export interface RequestCategoryCount {
  typeLabel: string;
  count: number;
}

export interface DecisionLogEntry {
  id: string;
  title: string;
  date: string;
  detail: string;
  status: RequestStatus;
}

export interface PendingApprovalTimelineItem {
  id: string;
  title: string;
  submitted: string;
  currentStep: string;
  expectedDecision: string;
}

export interface QuickRequestType {
  id: string;
  label: string;
  type: RequestType;
}

export interface RequestPolicyNote {
  id: string;
  text: string;
}

export interface LeaveBalanceItem {
  id: string;
  label: string;
  used: number;
  total: number;
}

export interface LeaveBalance {
  items: LeaveBalanceItem[];
  totalRemaining: number;
}
