import type { EmployeeAccessArea } from './visibilityModel';
import type { GeneratedAccessGrant } from './accessTypes';

export interface PositionAccessTemplateEntry {
  enabled: boolean;
  roleId: string;
  roleName: string;
  accessArea: EmployeeAccessArea;
  departmentIds?: string[];
  departmentNames?: string[];
  positionIds?: string[];
  positionNames?: string[];
  requiresApproval: boolean;
  permissionCodes: string[];
}

/** Default position access templates. Editable from the position form. */
export const POSITION_ACCESS_TEMPLATES: Record<string, PositionAccessTemplateEntry[]> = {
  'pos-ceo': [
    {
      enabled: true,
      roleId: 'role-ceo-exec',
      roleName: 'Executive Administrator',
      accessArea: 'organization',
      requiresApproval: false,
      permissionCodes: ['roles:manage', 'access:approve', 'employees:manage', 'org:manage']
    }
  ],
  'pos-mgr': [
    {
      enabled: true,
      roleId: 'role-line-manager',
      roleName: 'Line Manager',
      accessArea: 'none',
      requiresApproval: true,
      permissionCodes: ['employees:read', 'leave:approve', 'attendance:read']
    }
  ],
  'pos-hr-mgr': [
    {
      enabled: true,
      roleId: 'role-people-admin',
      roleName: 'People Administrator',
      accessArea: 'selected_departments',
      departmentIds: ['dept-hr', 'dept-eng'],
      departmentNames: ['Human Resources', 'Engineering'],
      requiresApproval: true,
      permissionCodes: ['employees:read', 'leave:read', 'attendance:read']
    }
  ],
  'pos-eng-mgr': [
    {
      enabled: true,
      roleId: 'role-people-admin',
      roleName: 'People Administrator',
      accessArea: 'selected_departments',
      departmentIds: ['dept-eng', 'dept-backend', 'dept-frontend', 'dept-qa'],
      departmentNames: ['Engineering', 'Backend', 'Frontend', 'QA'],
      requiresApproval: true,
      permissionCodes: ['employees:read', 'leave:read', 'leave:approve', 'attendance:read']
    }
  ],
  'pos-be-lead': [
    {
      enabled: false,
      roleId: 'role-people-admin',
      roleName: 'People Administrator',
      accessArea: 'none',
      requiresApproval: true,
      permissionCodes: ['employees:read', 'leave:read', 'leave:approve', 'attendance:read']
    }
  ],
  'pos-swe': [],
  'pos-fe-eng': [],
  'pos-qa-eng': [],
  'pos-acct': []
};

/** @deprecated Use getPositionAccessTemplate from positionAccessConfigStore */
export function getPositionAccessTemplateLegacy(positionId: string): GeneratedAccessGrant[] {
  const entries = POSITION_ACCESS_TEMPLATES[positionId] ?? [];
  return entries
    .filter(e => e.enabled && e.roleId)
    .map(e => ({
      roleId: e.roleId,
      roleName: e.roleName,
      accessArea: e.accessArea,
      departmentIds: e.departmentIds ? [...e.departmentIds] : undefined,
      departmentNames: e.departmentNames ? [...e.departmentNames] : undefined,
      positionIds: e.positionIds ? [...e.positionIds] : undefined,
      positionNames: e.positionNames ? [...e.positionNames] : undefined,
      requiresApproval: e.requiresApproval,
      permissionCodes: [...e.permissionCodes]
    }));
}
