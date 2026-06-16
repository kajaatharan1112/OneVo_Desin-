import type { AccessScope } from './visibilityModel';

export type GrantSource = 'position-template' | 'manual';
export type GrantStatus = 'active' | 'pending' | 'ended';
export type AccessActionType = 'transfer' | 'promotion';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface GeneratedAccessGrant {
  roleId: string;
  roleName: string;
  scope: AccessScope;
  permissionCodes: string[];
}

export interface UserRoleGrant {
  id: string;
  employeeId: string;
  roleId: string;
  roleName: string;
  scope: AccessScope;
  permissionCodes: string[];
  source: GrantSource;
  sourcePositionId?: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: GrantStatus;
}

export interface PositionAccessApprovalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestedByEmployeeId: string;
  requestedByName: string;
  actionType: AccessActionType;
  currentPositionId: string;
  currentPositionName: string;
  targetPositionId: string;
  targetPositionName: string;
  targetDepartmentId: string;
  targetDepartmentName: string;
  currentDepartmentId: string;
  currentDepartmentName: string;
  newReportingManager: string;
  generatedGrants: GeneratedAccessGrant[];
  previousGrants: GeneratedAccessGrant[];
  effectiveDate: string;
  status: ApprovalStatus;
  comment?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedByEmployeeId?: string;
  resolvedByName?: string;
}

export interface AccessAuditEntry {
  id: string;
  timestamp: string;
  actorEmployeeId: string;
  actorName: string;
  employeeId: string;
  employeeName: string;
  actionType: AccessActionType | 'access.approved' | 'access.rejected' | 'access.requested';
  oldPositionName: string;
  newPositionName: string;
  oldRoleScope: string;
  newRoleScope: string;
  effectiveDate: string;
  status: 'success' | 'failed';
  detail?: string;
}

export interface PositionChangeAccessInput {
  actorOrgEmployeeId: string;
  targetEmployeeId: string;
  actionType: AccessActionType;
  targetPositionId: string;
  effectiveDate: string;
  /** CEO-edited grants when actor can manage access */
  grants?: GeneratedAccessGrant[];
}
