import type { Position, PositionAssignment } from '../../../types/organization';
import type { LeavePolicy, LeaveStatus, PolicyScope } from './leaveConfigTypes';

export const POLICY_ADVANCED_DEFAULTS = {
  proRataNewJoiners: true,
  carryForwardAllowed: false,
  maxCarryForwardDays: 0,
  carryForwardExpiryMonths: 3,
  minNoticeDays: 7,
  maxConsecutiveDays: null as number | null,
  minDaysPerRequest: 0.5,
  blackoutPeriods: '',
  requiresDocument: false,
  documentRequiredAfterDays: null as number | null
};

export interface PolicyConflict {
  message: string;
}

function effectiveYearsOverlap(a: string, b: string): boolean {
  return a.slice(0, 4) === b.slice(0, 4);
}

export function detectPolicyConflict(
  candidate: {
    id?: string;
    leaveTypeId: string;
    status: LeaveStatus;
    appliesTo: PolicyScope;
    departmentIds: string[];
    positionIds: string[];
    effectiveFrom: string;
  },
  policies: LeavePolicy[],
  departments: { id: string; name: string }[],
  positions: { id: string; name: string }[],
  leaveTypes: { id: string; name: string }[]
): PolicyConflict | null {
  if (candidate.status !== 'active') return null;

  const leaveTypeName = leaveTypes.find(t => t.id === candidate.leaveTypeId)?.name ?? 'Leave';
  const peers = policies.filter(
    p =>
      p.id !== candidate.id &&
      p.status === 'active' &&
      p.leaveTypeId === candidate.leaveTypeId &&
      p.appliesTo === candidate.appliesTo &&
      effectiveYearsOverlap(p.effectiveFrom, candidate.effectiveFrom)
  );

  if (candidate.appliesTo === 'company') {
    if (peers.length > 0) {
      return {
        message: `A Full Company ${leaveTypeName} policy is already active for this period.`
      };
    }
    return null;
  }

  if (candidate.appliesTo === 'department') {
    for (const id of candidate.departmentIds) {
      if (peers.some(p => p.departmentIds.includes(id))) {
        const deptName = departments.find(d => d.id === id)?.name ?? 'This department';
        return {
          message: `${deptName} already has an active ${leaveTypeName} policy for this period.`
        };
      }
    }
    return null;
  }

  for (const id of candidate.positionIds) {
    if (peers.some(p => p.positionIds.includes(id))) {
      const posName = positions.find(p => p.id === id)?.name ?? 'This position';
      return {
        message: `${posName} already has an active ${leaveTypeName} policy for this period.`
      };
    }
  }

  return null;
}

export function formatAppliesTo(
  policy: LeavePolicy,
  departments: { id: string; name: string }[],
  positions: { id: string; name: string }[]
): string {
  if (policy.appliesTo === 'company') return 'Full Company';

  if (policy.appliesTo === 'department') {
    const ids = policy.departmentIds;
    if (ids.length === 0) return 'Departments';
    if (ids.length <= 2) {
      return ids
        .map(id => departments.find(d => d.id === id)?.name ?? id)
        .join(', ');
    }
    return `${ids.length} Departments`;
  }

  const ids = policy.positionIds;
  if (ids.length === 0) return 'Positions';
  if (ids.length <= 2) {
    return ids
      .map(id => positions.find(p => p.id === id)?.name ?? id)
      .join(', ');
  }
  return `${ids.length} Positions`;
}

export function scopePriority(scope: PolicyScope): number {
  if (scope === 'position') return 3;
  if (scope === 'department') return 2;
  return 1;
}

export function matchPolicyForEmployee(
  employeeId: string,
  leaveTypeId: string,
  policies: LeavePolicy[],
  assignments: PositionAssignment[],
  positions: Position[]
): LeavePolicy | null {
  const active = policies.filter(p => p.leaveTypeId === leaveTypeId && p.status === 'active');
  const assignment = assignments.find(
    a => a.employeeId === employeeId && a.status === 'active' && !a.effectiveTo
  );
  const position = assignment
    ? positions.find(p => p.id === assignment.positionId)
    : undefined;
  const departmentId = position?.departmentId ?? null;
  const positionId = assignment?.positionId ?? null;

  if (positionId) {
    const match = active.find(
      p => p.appliesTo === 'position' && p.positionIds.includes(positionId)
    );
    if (match) return match;
  }

  if (departmentId) {
    const match = active.find(
      p => p.appliesTo === 'department' && p.departmentIds.includes(departmentId)
    );
    if (match) return match;
  }

  return active.find(p => p.appliesTo === 'company') ?? null;
}

export function accrualLabel(method: string): string {
  if (method === 'monthly') return 'Monthly';
  if (method === 'daily') return 'Daily';
  return 'Yearly';
}
