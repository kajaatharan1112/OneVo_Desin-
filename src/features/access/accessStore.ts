import { create } from 'zustand';
import { useOrganizationStore } from '../../store/organizationStore';
import type { AccessScope } from './visibilityModel';
import { getPositionAccessTemplate } from './positionAccessConfigStore';
import type {
  AccessAuditEntry,
  GeneratedAccessGrant,
  PositionAccessApprovalRequest,
  PositionChangeAccessInput,
  UserRoleGrant
} from './accessTypes';
import {
  canManageAccess,
  generatedAccessRequiresApproval,
  getEffectivePermissionCodes,
  grantsToRoleScopeSummary
} from './accessUtils';
import { getEmployeeActiveAssignment, getReportingManagerPreviewForPosition, applyEmployeePositionAssignment } from '../../utils/organizationUtils';
import { profileIdForOrgEmployee } from './employeeProfileMap';
import type { AppNotification } from '../../shared/types/notification.types';

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const SEED_GRANTS: UserRoleGrant[] = [
  {
    id: 'grant-ceo-1',
    employeeId: 'emp-1',
    roleId: 'role-ceo-exec',
    roleName: 'Executive Administrator',
    scope: 'organization',
    permissionCodes: [
      'roles:manage',
      'access:approve',
      'employees:manage',
      'org:manage'
    ],
    source: 'position-template',
    sourcePositionId: 'pos-ceo',
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    status: 'active'
  },
  {
    id: 'grant-mgr-1',
    employeeId: 'emp-13',
    roleId: 'role-line-manager',
    roleName: 'Line Manager',
    scope: 'reporting_structure',
    permissionCodes: ['employees:read', 'leave:approve', 'attendance:read'],
    source: 'position-template',
    sourcePositionId: 'pos-mgr',
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    status: 'active'
  }
];

const SEED_REQUESTS: PositionAccessApprovalRequest[] = [
  {
    id: 'access-req-seed-1',
    employeeId: 'emp-8',
    employeeName: 'Sam Patel',
    requestedByEmployeeId: 'emp-5',
    requestedByName: 'Maria Gomez',
    actionType: 'promotion',
    currentPositionId: 'pos-swe',
    currentPositionName: 'Software Engineer',
    targetPositionId: 'pos-be-lead',
    targetPositionName: 'Backend Lead',
    targetDepartmentId: 'dept-backend',
    targetDepartmentName: 'Backend',
    currentDepartmentId: 'dept-backend',
    currentDepartmentName: 'Backend',
    newReportingManager: 'Alex Rivera',
    generatedGrants: getPositionAccessTemplate('pos-be-lead'),
    previousGrants: [],
    effectiveDate: '2026-06-20',
    status: 'pending',
    createdAt: '2026-06-14T09:30:00Z'
  },
  {
    id: 'access-req-seed-2',
    employeeId: 'emp-9',
    employeeName: 'Taylor Brooks',
    requestedByEmployeeId: 'emp-13',
    requestedByName: 'Dana Brooks',
    actionType: 'transfer',
    currentPositionId: 'pos-swe',
    currentPositionName: 'Software Engineer',
    targetPositionId: 'pos-fe-eng',
    targetPositionName: 'Frontend Engineer',
    targetDepartmentId: 'dept-frontend',
    targetDepartmentName: 'Frontend',
    currentDepartmentId: 'dept-backend',
    currentDepartmentName: 'Backend',
    newReportingManager: 'Jordan Chen',
    generatedGrants: getPositionAccessTemplate('pos-fe-eng'),
    previousGrants: [],
    effectiveDate: '2026-06-22',
    status: 'pending',
    createdAt: '2026-06-14T10:15:00Z'
  }
];

function employeeName(employeeId: string): string {
  const emp = useOrganizationStore.getState().employees.find(e => e.id === employeeId);
  return emp ? `${emp.firstName} ${emp.lastName}` : employeeId;
}

function currentActiveGrants(employeeId: string): GeneratedAccessGrant[] {
  return useAccessStore
    .getState()
    .grants.filter(g => g.employeeId === employeeId && g.status === 'active')
    .map(g => ({
      roleId: g.roleId,
      roleName: g.roleName,
      scope: g.scope,
      permissionCodes: [...g.permissionCodes]
    }));
}

function appendAudit(entry: Omit<AccessAuditEntry, 'id' | 'timestamp'>) {
  const next: AccessAuditEntry = {
    id: createId('audit'),
    timestamp: new Date().toISOString(),
    ...entry
  };
  useAccessStore.setState(s => ({ auditEntries: [next, ...s.auditEntries] }));
}

interface AccessStore {
  grants: UserRoleGrant[];
  approvalRequests: PositionAccessApprovalRequest[];
  auditEntries: AccessAuditEntry[];
  activeApprovalRequestId: string | null;
  toast: string | null;
  requesterNotices: AppNotification[];

  getGrantsForEmployee: (employeeId: string) => UserRoleGrant[];
  getActorPermissions: (actorEmployeeId: string) => Set<string>;
  actorCanManageAccess: (actorEmployeeId: string) => boolean;
  openApprovalRequest: (requestId: string) => void;
  closeApprovalRequest: () => void;
  clearToast: () => void;
  clearRequesterNotice: (id: string) => void;

  applyPositionChangeAccess: (input: PositionChangeAccessInput) => {
    ok: boolean;
    error?: string;
    requiresApproval?: boolean;
    requestId?: string;
  };

  approveAccessRequest: (requestId: string, approverEmployeeId: string, comment?: string) => { ok: boolean; error?: string };
  rejectAccessRequest: (requestId: string, approverEmployeeId: string, comment?: string) => { ok: boolean; error?: string };

  getPendingRequestsForApprover: (approverEmployeeId: string) => PositionAccessApprovalRequest[];
}

export const useAccessStore = create<AccessStore>((set, get) => ({
  grants: SEED_GRANTS,
  approvalRequests: SEED_REQUESTS,
  auditEntries: [],
  activeApprovalRequestId: null,
  toast: null,
  requesterNotices: [],

  getGrantsForEmployee: employeeId =>
    get().grants.filter(g => g.employeeId === employeeId),

  getActorPermissions: actorEmployeeId => {
    const grants = get().grants.filter(
      g => g.employeeId === actorEmployeeId && g.status === 'active'
    );
    return getEffectivePermissionCodes(grants);
  },

  actorCanManageAccess: actorEmployeeId =>
    canManageAccess(get().getActorPermissions(actorEmployeeId)),

  openApprovalRequest: requestId => set({ activeApprovalRequestId: requestId }),
  closeApprovalRequest: () => set({ activeApprovalRequestId: null }),
  clearToast: () => set({ toast: null }),
  clearRequesterNotice: id =>
    set(s => ({ requesterNotices: s.requesterNotices.filter(n => n.id !== id) })),

  applyPositionChangeAccess: input => {
    const org = useOrganizationStore.getState();
    const { employees, positions, departments, assignments } = org;
    const targetPosition = positions.find(p => p.id === input.targetPositionId);
    if (!targetPosition) return { ok: false, error: 'Target position not found.' };

    const targetEmployee = employees.find(e => e.id === input.targetEmployeeId);
    if (!targetEmployee) return { ok: false, error: 'Employee not found.' };

    const actorPerms = get().getActorPermissions(input.actorOrgEmployeeId);
    const canManage = canManageAccess(actorPerms);
    const generated =
      input.grants ?? getPositionAccessTemplate(input.targetPositionId);
    const needsApproval = generatedAccessRequiresApproval(actorPerms, generated);

    const activeAssignment = getEmployeeActiveAssignment(
      input.targetEmployeeId,
      assignments
    );
    const currentPosition = activeAssignment
      ? positions.find(p => p.id === activeAssignment.positionId)
      : null;
    const currentDept = currentPosition
      ? departments.find(d => d.id === currentPosition.departmentId)
      : null;
    const dept = departments.find(d => d.id === targetPosition.departmentId);
    const newReportingManager = getReportingManagerPreviewForPosition(
      targetPosition,
      positions,
      assignments,
      employees
    ).label;
    const previousGrants = currentActiveGrants(input.targetEmployeeId);
    const actorName = employeeName(input.actorOrgEmployeeId);
    const targetName = `${targetEmployee.firstName} ${targetEmployee.lastName}`;

    if (needsApproval) {
      const request: PositionAccessApprovalRequest = {
        id: createId('access-req'),
        employeeId: input.targetEmployeeId,
        employeeName: targetName,
        requestedByEmployeeId: input.actorOrgEmployeeId,
        requestedByName: actorName,
        actionType: input.actionType,
        currentPositionId: currentPosition?.id ?? '',
        currentPositionName: currentPosition?.name ?? '—',
        targetPositionId: targetPosition.id,
        targetPositionName: targetPosition.name,
        targetDepartmentId: targetPosition.departmentId,
        targetDepartmentName: dept?.name ?? '—',
        currentDepartmentId: currentPosition?.departmentId ?? '',
        currentDepartmentName: currentDept?.name ?? '—',
        newReportingManager,
        generatedGrants: generated,
        previousGrants,
        effectiveDate: input.effectiveDate,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      set(s => ({
        approvalRequests: [request, ...s.approvalRequests],
        toast: 'Position change submitted. Access changes require approval.'
      }));

      appendAudit({
        actorEmployeeId: input.actorOrgEmployeeId,
        actorName,
        employeeId: input.targetEmployeeId,
        employeeName: targetName,
        actionType: 'access.requested',
        oldPositionName: currentPosition?.name ?? '—',
        newPositionName: targetPosition.name,
        oldRoleScope: grantsToRoleScopeSummary(previousGrants),
        newRoleScope: grantsToRoleScopeSummary(generated),
        effectiveDate: input.effectiveDate,
        status: 'success',
        detail: `${input.actionType} access approval requested`
      });

      return { ok: true, requiresApproval: true, requestId: request.id };
    }

    if (canManage && generated.length > 0) {
      const endedGrants = get().grants.map(g => {
        if (
          g.employeeId === input.targetEmployeeId &&
          g.status === 'active' &&
          g.source === 'position-template'
        ) {
          return {
            ...g,
            status: 'ended' as const,
            effectiveTo: input.effectiveDate
          };
        }
        return g;
      });

      const newGrants: UserRoleGrant[] = generated.map(g => ({
        id: createId('grant'),
        employeeId: input.targetEmployeeId,
        roleId: g.roleId,
        roleName: g.roleName,
        scope: g.scope,
        permissionCodes: [...g.permissionCodes],
        source: 'position-template',
        sourcePositionId: input.targetPositionId,
        effectiveFrom: input.effectiveDate,
        effectiveTo: null,
        status: 'active'
      }));

      set({ grants: [...endedGrants, ...newGrants] });
    }

    appendAudit({
      actorEmployeeId: input.actorOrgEmployeeId,
      actorName,
      employeeId: input.targetEmployeeId,
      employeeName: targetName,
      actionType: input.actionType,
      oldPositionName: currentPosition?.name ?? '—',
      newPositionName: targetPosition.name,
      oldRoleScope: grantsToRoleScopeSummary(previousGrants),
      newRoleScope: grantsToRoleScopeSummary(generated),
      effectiveDate: input.effectiveDate,
      status: 'success',
      detail: canManage ? 'Access grants applied' : 'No access changes'
    });

    return { ok: true, requiresApproval: false };
  },

  approveAccessRequest: (requestId, approverEmployeeId, comment) => {
    const request = get().approvalRequests.find(r => r.id === requestId);
    if (!request) return { ok: false, error: 'Request not found.' };
    if (request.status !== 'pending') return { ok: false, error: 'Request already resolved.' };

    const approverPerms = get().getActorPermissions(approverEmployeeId);
    if (!canManageAccess(approverPerms)) {
      return { ok: false, error: 'You do not have permission to approve access changes.' };
    }

    const approverName = employeeName(approverEmployeeId);

    const org = useOrganizationStore.getState();
    const assignmentResult = applyEmployeePositionAssignment(
      request.employeeId,
      request.targetPositionId,
      request.effectiveDate,
      org.positions,
      org.assignments
    );
    if (!assignmentResult.ok || !assignmentResult.assignments) {
      return { ok: false, error: assignmentResult.error ?? 'Unable to apply position change.' };
    }
    useOrganizationStore.setState({ assignments: assignmentResult.assignments });

    const endedGrants = get().grants.map(g => {
      if (
        g.employeeId === request.employeeId &&
        g.status === 'active' &&
        g.source === 'position-template'
      ) {
        return { ...g, status: 'ended' as const, effectiveTo: request.effectiveDate };
      }
      return g;
    });

    const newGrants: UserRoleGrant[] = request.generatedGrants.map(g => ({
      id: createId('grant'),
      employeeId: request.employeeId,
      roleId: g.roleId,
      roleName: g.roleName,
      scope: g.scope as AccessScope,
      permissionCodes: [...g.permissionCodes],
      source: 'position-template',
      sourcePositionId: request.targetPositionId,
      effectiveFrom: request.effectiveDate,
      effectiveTo: null,
      status: 'active'
    }));

    set(s => ({
      grants: [...endedGrants, ...newGrants],
      approvalRequests: s.approvalRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              comment,
              resolvedAt: new Date().toISOString(),
              resolvedByEmployeeId: approverEmployeeId,
              resolvedByName: approverName
            }
          : r
      ),
      activeApprovalRequestId: null,
      toast: 'Access approval granted. Employee permissions updated.'
    }));

    const requesterProfile = profileIdForOrgEmployee(request.requestedByEmployeeId);
    const resolutionNotice: AppNotification | null = requesterProfile
      ? {
          id: `access-resolved-${requestId}-approved`,
          category: 'approval',
          title: 'Position access request approved',
          message: `Your ${request.actionType} request for ${request.employeeName} to ${request.targetPositionName} was approved.`,
          timeLabel: 'Just now',
          filter: 'new',
          actions: [],
          recipientId: requesterProfile
        }
      : null;

    if (resolutionNotice) {
      set(s => ({ requesterNotices: [resolutionNotice, ...s.requesterNotices] }));
    }

    appendAudit({
      actorEmployeeId: approverEmployeeId,
      actorName: approverName,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      actionType: 'access.approved',
      oldPositionName: request.currentPositionName,
      newPositionName: request.targetPositionName,
      oldRoleScope: grantsToRoleScopeSummary(request.previousGrants),
      newRoleScope: grantsToRoleScopeSummary(request.generatedGrants),
      effectiveDate: request.effectiveDate,
      status: 'success',
      detail: comment
    });

    return { ok: true };
  },

  rejectAccessRequest: (requestId, approverEmployeeId, comment) => {
    const request = get().approvalRequests.find(r => r.id === requestId);
    if (!request) return { ok: false, error: 'Request not found.' };
    if (request.status !== 'pending') return { ok: false, error: 'Request already resolved.' };

    const approverPerms = get().getActorPermissions(approverEmployeeId);
    if (!canManageAccess(approverPerms)) {
      return { ok: false, error: 'You do not have permission to reject access changes.' };
    }

    const approverName = employeeName(approverEmployeeId);

    set(s => ({
      approvalRequests: s.approvalRequests.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              comment,
              resolvedAt: new Date().toISOString(),
              resolvedByEmployeeId: approverEmployeeId,
              resolvedByName: approverName
            }
          : r
      ),
      activeApprovalRequestId: null,
      toast: 'Access approval rejected.'
    }));

    const requesterProfile = profileIdForOrgEmployee(request.requestedByEmployeeId);
    const resolutionNotice: AppNotification | null = requesterProfile
      ? {
          id: `access-resolved-${requestId}-rejected`,
          category: 'approval',
          title: 'Position access request rejected',
          message: `Your ${request.actionType} request for ${request.employeeName} to ${request.targetPositionName} was rejected.`,
          timeLabel: 'Just now',
          filter: 'new',
          actions: [],
          recipientId: requesterProfile
        }
      : null;

    if (resolutionNotice) {
      set(s => ({ requesterNotices: [resolutionNotice, ...s.requesterNotices] }));
    }

    appendAudit({
      actorEmployeeId: approverEmployeeId,
      actorName: approverName,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      actionType: 'access.rejected',
      oldPositionName: request.currentPositionName,
      newPositionName: request.targetPositionName,
      oldRoleScope: grantsToRoleScopeSummary(request.previousGrants),
      newRoleScope: grantsToRoleScopeSummary(request.generatedGrants),
      effectiveDate: request.effectiveDate,
      status: 'success',
      detail: comment
    });

    return { ok: true };
  },

  getPendingRequestsForApprover: approverEmployeeId => {
    const perms = get().getActorPermissions(approverEmployeeId);
    if (!canManageAccess(perms)) return [];
    return get().approvalRequests.filter(r => r.status === 'pending');
  }
}));
