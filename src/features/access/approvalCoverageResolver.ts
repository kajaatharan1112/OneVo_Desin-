import type { CoverageTarget, Department, Position } from '../../types/organization';
import { useOrganizationStore } from '../../store/organizationStore';
import { useRoleStore } from '../../store/roleStore';
import { GRANTABLE_PERMISSIONS } from '../admin/adminMockData';

export type ApprovalResolutionSource =
  | 'reporting-manager'
  | 'primary-coverage'
  | 'secondary-coverage';

export type ApprovalResolution =
  | {
      status: 'resolved';
      targetPositionId: string;
      source: ApprovalResolutionSource;
    }
  | {
      status: 'unresolved';
      reason: string;
    };

interface ResolveApprovalTargetInput {
  requesterPositionId: string;
  requiredPermission: string;
  positions: Position[];
  departments: Department[];
  positionHasPermission: (positionId: string, permission: string) => boolean;
}

function resolveCoverageTarget(
  target: CoverageTarget,
  positions: Position[],
  departments: Department[],
  requiredPermission: string,
  positionHasPermission: ResolveApprovalTargetInput['positionHasPermission']
): string | null {
  if (target.type === 'user') return null;

  if (target.type === 'position') {
    const position = positions.find(candidate => candidate.id === target.id);
    if (!position || position.status !== 'active') return null;
    return positionHasPermission(position.id, requiredPermission) ? position.id : null;
  }

  const department = departments.find(candidate => candidate.id === target.id);
  if (!department || department.status !== 'active') return null;

  const activeDepartmentPositions = positions.filter(position =>
    position.departmentId === department.id && position.status === 'active'
  );
  const orderedCandidates = [
    ...activeDepartmentPositions.filter(position => position.id === department.headPositionId),
    ...activeDepartmentPositions
      .filter(position => position.id !== department.headPositionId)
      .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id))
  ];
  return orderedCandidates.find(position =>
    positionHasPermission(position.id, requiredPermission)
  )?.id ?? null;
}

export function resolveApprovalTarget({
  requesterPositionId,
  requiredPermission,
  positions,
  departments,
  positionHasPermission
}: ResolveApprovalTargetInput): ApprovalResolution {
  const requester = positions.find(position => position.id === requesterPositionId);
  if (!requester || requester.status !== 'active') {
    return { status: 'unresolved', reason: 'Requester position is missing or inactive.' };
  }

  if (requester.coverageEnabled) {
    if (!requester.primaryCoverage) {
      return { status: 'unresolved', reason: 'Coverage is enabled but no primary coverage is configured.' };
    }

    const primary = resolveCoverageTarget(
      requester.primaryCoverage,
      positions,
      departments,
      requiredPermission,
      positionHasPermission
    );
    if (primary) return { status: 'resolved', targetPositionId: primary, source: 'primary-coverage' };

    for (const secondary of requester.secondaryCoverage) {
      const target = resolveCoverageTarget(
        secondary,
        positions,
        departments,
        requiredPermission,
        positionHasPermission
      );
      if (target) return { status: 'resolved', targetPositionId: target, source: 'secondary-coverage' };
    }

    return {
      status: 'unresolved',
      reason: `No configured coverage target has ${requiredPermission} permission.`
    };
  }

  const manager = requester.reportsToPositionId
    ? positions.find(position => position.id === requester.reportsToPositionId)
    : null;
  if (manager?.status === 'active' && positionHasPermission(manager.id, requiredPermission)) {
    return { status: 'resolved', targetPositionId: manager.id, source: 'reporting-manager' };
  }

  return {
    status: 'unresolved',
    reason: requester.reportsToPositionId
      ? `Reporting manager does not have ${requiredPermission} permission.`
      : 'No reporting manager is configured.'
  };
}

export function resolveOrganizationApprovalTarget(
  requesterPositionId: string,
  requiredPermission: string
): ApprovalResolution {
  const { positions, departments } = useOrganizationStore.getState();
  const roles = useRoleStore.getState().roles;
  return resolveApprovalTarget({
    requesterPositionId,
    requiredPermission,
    positions,
    departments,
    positionHasPermission: (positionId, permission) => {
      const position = positions.find(candidate => candidate.id === positionId);
      const role = position ? roles.find(candidate => candidate.id === position.roleId && candidate.active) : null;
      if (!role) return false;
      return role.permissionIds.some(permissionId =>
        GRANTABLE_PERMISSIONS.find(candidate => candidate.id === permissionId)?.code === permission
      );
    }
  });
}
