import { useMemo } from 'react';
import { useEmployeeContext } from '../employees/context/employee-context';
import { useAccessStore } from './accessStore';
import { orgEmployeeIdForProfile } from './employeeProfileMap';
import { canManageAccess, getEffectivePermissionCodes } from './accessUtils';

export function useActorAccess() {
  const { selectedEmployeeId } = useEmployeeContext();
  const actorOrgEmployeeId = orgEmployeeIdForProfile(selectedEmployeeId);
  const grants = useAccessStore(s => s.grants);
  const actorGrants = useMemo(
    () => grants.filter(g => g.employeeId === actorOrgEmployeeId && g.status === 'active'),
    [grants, actorOrgEmployeeId]
  );
  const permissions = useMemo(
    () => getEffectivePermissionCodes(actorGrants),
    [actorGrants]
  );
  const canManage = canManageAccess(permissions);

  return {
    selectedEmployeeId,
    actorOrgEmployeeId,
    actorGrants,
    permissions,
    canManageAccess: canManage,
    hasPermission: (code: string) => permissions.has(code)
  };
}
