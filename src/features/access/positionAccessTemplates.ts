import type { AccessScope } from './visibilityModel';
import type { GeneratedAccessGrant } from './accessTypes';

export interface PositionAccessTemplateEntry {
  roleId: string;
  roleName: string;
  scope: AccessScope;
  permissionCodes: string[];
}

/** Default position → suggested access templates. Editable via position form. */
export const POSITION_ACCESS_TEMPLATES: Record<string, PositionAccessTemplateEntry[]> = {
  'pos-ceo': [
    {
      roleId: 'role-ceo-exec',
      roleName: 'Executive Administrator',
      scope: 'organization',
      permissionCodes: [
        'roles:manage',
        'access:approve',
        'employees:manage',
        'org:manage'
      ]
    }
  ],
  'pos-mgr': [
    {
      roleId: 'role-line-manager',
      roleName: 'Line Manager',
      scope: 'reporting_structure',
      permissionCodes: ['employees:read', 'leave:approve', 'attendance:read']
    }
  ],
  'pos-hr-mgr': [
    {
      roleId: 'role-people-admin',
      roleName: 'People Administrator',
      scope: 'hr_coverage',
      permissionCodes: ['employees:read', 'leave:read', 'attendance:read']
    }
  ],
  'pos-be-lead': [
    {
      roleId: 'role-people-admin',
      roleName: 'People Administrator',
      scope: 'reporting_structure',
      permissionCodes: [
        'employees:read',
        'leave:read',
        'leave:approve',
        'attendance:read'
      ]
    }
  ],
  'pos-eng-mgr': [
    {
      roleId: 'role-people-admin',
      roleName: 'People Administrator',
      scope: 'reporting_structure',
      permissionCodes: ['employees:read', 'leave:read', 'leave:approve', 'attendance:read']
    }
  ],
  'pos-swe': [],
  'pos-fe-eng': [],
  'pos-qa-eng': []
};

/** @deprecated Use getPositionAccessTemplate from positionAccessConfigStore */
export function getPositionAccessTemplateLegacy(positionId: string): GeneratedAccessGrant[] {
  const entries = POSITION_ACCESS_TEMPLATES[positionId] ?? [];
  return entries.map(e => ({
    roleId: e.roleId,
    roleName: e.roleName,
    scope: e.scope,
    permissionCodes: [...e.permissionCodes]
  }));
}
