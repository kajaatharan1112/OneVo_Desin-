import { GRANTABLE_PERMISSIONS } from '../admin/adminMockData';
import type { GeneratedAccessGrant, UserRoleGrant } from './accessTypes';
import type { EmployeeAccessArea } from './visibilityModel';
import { accessAreaLabel, normalizeEmployeeAccessArea } from './visibilityModel';

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

export function scopeLabel(scope: EmployeeAccessArea | string): string {
  return accessAreaLabel(normalizeEmployeeAccessArea(scope));
}

export function formatGrantSummary(grant: GeneratedAccessGrant): string {
  const perms = grant.permissionCodes.length
    ? grant.permissionCodes.map(permissionLabel).join(', ')
    : 'No elevated permissions';
  const coverage =
    grant.accessArea === 'selected_departments' && grant.departmentNames?.length
      ? `: ${grant.departmentNames.join(', ')}`
      : grant.accessArea === 'selected_positions' && grant.positionNames?.length
        ? `: ${grant.positionNames.join(', ')}`
        : '';
  return `${grant.roleName} - ${scopeLabel(grant.accessArea)}${coverage} - ${perms}`;
}

export function grantsToRoleScopeSummary(grants: GeneratedAccessGrant[]): string {
  if (grants.length === 0) return 'None';
  return grants.map(g => `${g.roleName} (${scopeLabel(g.accessArea)})`).join('; ');
}

export function formatAccessDiff(
  previous: GeneratedAccessGrant[],
  next: GeneratedAccessGrant[]
): { added: string[]; removed: string[] } {
  const grantKey = (g: GeneratedAccessGrant) =>
    [
      g.roleId,
      g.accessArea,
      ...(g.departmentIds ?? []),
      ...(g.positionIds ?? [])
    ].join(':');
  const prevKeys = new Set(previous.map(grantKey));
  const nextKeys = new Set(next.map(grantKey));
  const added = next
    .filter(g => !prevKeys.has(grantKey(g)))
    .map(g => `Role: ${g.roleName} - ${scopeLabel(g.accessArea)}`);
  const removed = previous
    .filter(g => !nextKeys.has(grantKey(g)))
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
  generated: GeneratedAccessGrant[]
): boolean {
  if (generated.length === 0) return false;
  if (generated.some(g => g.requiresApproval)) return true;
  return !canManageAccess(actorPermissions);
}

export function actorHasOrganizationAccess(grants: UserRoleGrant[]): boolean {
  return grants.some(
    g => g.status === 'active' && normalizeEmployeeAccessArea(g.accessArea) === 'organization'
  );
}

export function actorHasSelectedDepartmentAccess(grants: UserRoleGrant[]): boolean {
  return grants.some(
    g => g.status === 'active' && normalizeEmployeeAccessArea(g.accessArea) === 'selected_departments'
  );
}

export function actorHasSelectedPositionAccess(grants: UserRoleGrant[]): boolean {
  return grants.some(
    g => g.status === 'active' && normalizeEmployeeAccessArea(g.accessArea) === 'selected_positions'
  );
}

export function canActorViewEmployee(
  actorEmployeeId: string,
  targetEmployeeId: string,
  grants: UserRoleGrant[]
): boolean {
  if (actorEmployeeId === targetEmployeeId) return true;
  if (actorHasOrganizationAccess(grants)) return true;
  if (actorHasSelectedDepartmentAccess(grants) || actorHasSelectedPositionAccess(grants)) {
    // TODO: Resolve selected department/position access with target employee assignment context.
    return false;
  }
  return false;
}
