import { useMemo } from 'react';
import { useEmployeeContext } from '../employees/context/employee-context';
import { useAccessStore } from './accessStore';
import { orgEmployeeIdForProfile } from './employeeProfileMap';
import { canManageAccess, getEffectivePermissionCodes } from './accessUtils';
import { GRANTABLE_PERMISSIONS } from '../admin/adminMockData';
import { useRoleStore } from '../../store/roleStore';

const LEGACY_PERMISSION_ALIASES: Record<string, string[]> = {
  'roles:view': ['roles:manage', 'roles:read'],
  'roles:create': ['roles:manage'],
  'roles:edit': ['roles:manage'],
  'roles:delete': ['roles:manage'],
  'roles:assign': ['roles:manage'],
  'positions:view': ['org:manage', 'org:read'],
  'positions:create': ['org:manage'],
  'positions:edit': ['org:manage'],
  'departments:view': ['org:manage', 'org:read'],
  'departments:create': ['org:manage'],
  'departments:edit': ['org:manage'],
  'employees:view': ['employees:read', 'employees:manage'],
  'attendance:view': ['attendance:read'],
  'leave:request:approve': ['leave:approve']
};

export function useActorAccess() {
  const { selectedEmployeeId } = useEmployeeContext();
  const actorOrgEmployeeId = orgEmployeeIdForProfile(selectedEmployeeId);
  const grants = useAccessStore(s => s.grants);
  const roles = useRoleStore(s => s.roles);
  const directAssignments = useRoleStore(s => s.userAssignments);
  const actorGrants = useMemo(
    () => grants.filter(g => g.employeeId === actorOrgEmployeeId && g.status === 'active'),
    [grants, actorOrgEmployeeId]
  );
  const permissions = useMemo(() => {
    const resolved = getEffectivePermissionCodes(actorGrants);
    for (const role of roles) {
      if (!role.active || !(directAssignments[role.id] ?? []).includes(actorOrgEmployeeId)) continue;
      for (const permissionId of role.permissionIds) {
        const code = GRANTABLE_PERMISSIONS.find(permission => permission.id === permissionId)?.code;
        if (code) resolved.add(code);
      }
    }
    return resolved;
  }, [actorGrants, actorOrgEmployeeId, directAssignments, roles]);
  const canManage = canManageAccess(permissions);

  return {
    selectedEmployeeId,
    actorOrgEmployeeId,
    actorGrants,
    permissions,
    canManageAccess: canManage,
    hasPermission: (code: string) =>
      permissions.has(code) ||
      (LEGACY_PERMISSION_ALIASES[code] ?? []).some(alias => permissions.has(alias))
  };
}
