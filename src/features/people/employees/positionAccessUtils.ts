import { MOCK_ROLES, type AdminRole } from '../../admin/adminMockData';

/** Demo mapping of positionId -> suggested role ids, used by Access Confirmation steps. */
export const POSITION_SUGGESTED_ROLES: Record<string, string[]> = {
  'pos-ceo': ['role-owner'],
  'pos-cto': ['role-owner'],
  'pos-cfo': ['role-owner'],
  'pos-hr-mgr': ['role-people-admin'],
  'pos-eng-mgr': ['role-leave-approver'],
  'pos-be-lead': ['role-leave-approver'],
  'pos-fe-lead': ['role-leave-approver'],
  'pos-qa-lead': ['role-leave-approver'],
  'pos-swe': ['role-readonly'],
  'pos-fe-eng': ['role-readonly'],
  'pos-qa-eng': ['role-readonly'],
  'pos-fin-mgr': ['role-people-admin'],
  'pos-acct': ['role-readonly']
};

export function getSuggestedRoleIdsForPosition(positionId: string): string[] {
  return POSITION_SUGGESTED_ROLES[positionId] ?? [];
}

export function getSuggestedRolesForPosition(positionId: string): AdminRole[] {
  const ids = getSuggestedRoleIdsForPosition(positionId);
  return MOCK_ROLES.filter(r => ids.includes(r.id) && r.active);
}
