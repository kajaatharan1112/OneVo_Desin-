import { GRANTABLE_PERMISSIONS } from '../admin/adminMockData';
import type { GeneratedAccessGrant, UserRoleGrant } from './accessTypes';
import type { AccessScope } from './visibilityModel';
import { normalizeAccessScope, visibilityLabel } from './visibilityModel';
import { employeeMatchesHRCoverage } from '../people/hr-coverage/hrCoverageUtils';
import { useHRCoverageStore } from '../people/hr-coverage/hrCoverageStore';

export const SENSITIVE_PERMISSION_CODES = new Set([
  'roles:manage',
  'access:approve',
  'org:manage',
  'employees:manage',
  'employees:write'
]);

export function permissionLabel(code: string): string {
  return GRANTABLE_PERMISSIONS.find(p => p.code === code)?.description ?? code;
}

export function scopeLabel(scope: AccessScope | string): string {
  return visibilityLabel(normalizeAccessScope(scope));
}

export function formatGrantSummary(grant: GeneratedAccessGrant): string {
  const perms = grant.permissionCodes.length
    ? grant.permissionCodes.map(permissionLabel).join(', ')
    : 'No elevated permissions';
  return `${grant.roleName} · ${scopeLabel(grant.scope)} · ${perms}`;
}

export function grantsToRoleScopeSummary(grants: GeneratedAccessGrant[]): string {
  if (grants.length === 0) return 'None';
  return grants.map(g => `${g.roleName} (${scopeLabel(g.scope)})`).join('; ');
}

export function formatAccessDiff(
  previous: GeneratedAccessGrant[],
  next: GeneratedAccessGrant[]
): { added: string[]; removed: string[] } {
  const prevKeys = new Set(previous.map(g => `${g.roleId}:${g.scope}`));
  const nextKeys = new Set(next.map(g => `${g.roleId}:${g.scope}`));
  const added = next
    .filter(g => !prevKeys.has(`${g.roleId}:${g.scope}`))
    .map(g => `Role: ${g.roleName} · ${scopeLabel(g.scope)}`);
  const removed = previous
    .filter(g => !nextKeys.has(`${g.roleId}:${g.scope}`))
    .map(g => `Role: ${g.roleName}`);
  return { added, removed };
}

export function getEffectivePermissionCodes(grants: UserRoleGrant[]): Set<string> {
  const codes = new Set<string>();
  for (const grant of grants) {
    if (grant.status !== 'active') continue;
    grant.permissionCodes.forEach(c => codes.add(c));
  }
  return codes;
}

export function canManageAccess(permissionCodes: Set<string>): boolean {
  return permissionCodes.has('roles:manage') || permissionCodes.has('access:approve');
}

export function generatedAccessRequiresApproval(
  actorPermissions: Set<string>,
  _generated: GeneratedAccessGrant[]
): boolean {
  return !canManageAccess(actorPermissions);
}

export function actorHasOrganizationAccess(grants: UserRoleGrant[]): boolean {
  return grants.some(
    g => g.status === 'active' && normalizeAccessScope(g.scope) === 'organization'
  );
}

export function actorHasReportingAccess(grants: UserRoleGrant[]): boolean {
  return grants.some(
    g => g.status === 'active' && normalizeAccessScope(g.scope) === 'reporting_structure'
  );
}

export function actorHasHRCoverageAccess(
  actorEmployeeId: string,
  grants: UserRoleGrant[]
): boolean {
  const hasHrGrant = grants.some(
    g => g.status === 'active' && normalizeAccessScope(g.scope) === 'hr_coverage'
  );
  if (!hasHrGrant) return false;
  const rules = useHRCoverageStore.getState().rules;
  return rules.some(
    r =>
      r.status === 'active' &&
      (r.ownerEmployeeId === actorEmployeeId ||
        (r.ownerType === 'position' && r.ownerPositionId != null))
  );
}

export function canActorViewEmployee(
  actorEmployeeId: string,
  targetEmployeeId: string,
  grants: UserRoleGrant[]
): boolean {
  if (actorEmployeeId === targetEmployeeId) return true;
  if (actorHasOrganizationAccess(grants)) return true;
  if (actorHasReportingAccess(grants)) {
    // Demo: managers see team via reporting structure (hierarchy resolved elsewhere)
    return true;
  }
  if (actorHasHRCoverageAccess(actorEmployeeId, grants)) {
    const rules = useHRCoverageStore.getState().rules.filter(
      r =>
        r.status === 'active' &&
        (r.ownerEmployeeId === actorEmployeeId ||
          (r.ownerType === 'position' && r.ownerPositionId != null))
    );
    return employeeMatchesHRCoverage(targetEmployeeId, rules);
  }
  return false;
}
