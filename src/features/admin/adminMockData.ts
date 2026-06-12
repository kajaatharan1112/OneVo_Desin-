export type UserStatus = 'active' | 'invited' | 'disabled';
export type AccessScope = 'own' | 'direct_reports' | 'reporting_tree' | 'department' | 'organization';
export type RoleType = 'system' | 'custom';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string | null;
  employeeName: string | null;
  roleIds: string[];
  status: UserStatus;
  mfaEnabled: boolean;
  lastLogin: string | null;
  accessScope: AccessScope;
  accessScopeDepartmentId: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  permissionIds: string[];
  userCount: number;
  updatedAt: string;
  active: boolean;
}

export interface PermissionDef {
  id: string;
  code: string;
  description: string;
  module: string;
  universal?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceName: string;
  resourceId: string;
  module: string;
  ipAddress: string;
  status: 'success' | 'failed';
  beforeValues: Record<string, unknown> | null;
  afterValues: Record<string, unknown> | null;
  correlationId: string;
}

export interface PermissionOverride {
  permissionCode: string;
  grantType: 'grant' | 'revoke';
  reason: string;
  expiresAt: string | null;
}

export interface ActiveSession {
  id: string;
  device: string;
  ipAddress: string;
  startedAt: string;
  lastActivityAt: string;
}

export interface AccessChange {
  timestamp: string;
  description: string;
  changedBy: string;
}

export const ENABLED_MODULES = [
  'Employees',
  'Organization',
  'Leave',
  'Attendance',
  'Documents',
  'Payroll',
  'Performance',
  'Monitoring',
  'Analytics',
  'Settings',
  'Users',
  'Roles',
  'Automations',
] as const;

export const ACCESS_SCOPE_OPTIONS: { value: AccessScope; label: string }[] = [
  { value: 'own', label: 'Own' },
  { value: 'direct_reports', label: 'Direct Reports' },
  { value: 'reporting_tree', label: 'Reporting Tree' },
  { value: 'department', label: 'Department' },
  { value: 'organization', label: 'Organization' },
];

export const DEPARTMENTS = [
  { id: 'dept-eng', name: 'Engineering' },
  { id: 'dept-hr', name: 'Human Resources' },
  { id: 'dept-sales', name: 'Sales' },
  { id: 'dept-finance', name: 'Finance' },
];

export const UNIVERSAL_PERMISSIONS: PermissionDef[] = [
  { id: 'u1', code: 'inbox:read', description: 'Read inbox messages', module: 'Universal', universal: true },
  { id: 'u2', code: 'notifications:read', description: 'Read notifications', module: 'Universal', universal: true },
  { id: 'u3', code: 'employees:read-own', description: 'View own employee profile', module: 'Universal', universal: true },
  { id: 'u4', code: 'leave:read-own', description: 'View own leave records', module: 'Universal', universal: true },
  { id: 'u5', code: 'attendance:read-own', description: 'View own attendance', module: 'Universal', universal: true },
  { id: 'u6', code: 'calendar:read', description: 'View calendar', module: 'Universal', universal: true },
];

export const GRANTABLE_PERMISSIONS: PermissionDef[] = [
  { id: 'p1', code: 'employees:read', description: 'View employee records', module: 'Employees' },
  { id: 'p2', code: 'employees:write', description: 'Create and edit employees', module: 'Employees' },
  { id: 'p3', code: 'employees:delete', description: 'Delete employee records', module: 'Employees' },
  { id: 'p4', code: 'org:read', description: 'View organization structure', module: 'Organization' },
  { id: 'p5', code: 'org:manage', description: 'Manage departments and positions', module: 'Organization' },
  { id: 'p6', code: 'leave:read', description: 'View leave requests', module: 'Leave' },
  { id: 'p7', code: 'leave:approve', description: 'Approve leave requests', module: 'Leave' },
  { id: 'p8', code: 'leave:manage', description: 'Manage leave configuration', module: 'Leave' },
  { id: 'p9', code: 'attendance:read', description: 'View attendance records', module: 'Attendance' },
  { id: 'p10', code: 'attendance:approve', description: 'Approve attendance corrections', module: 'Attendance' },
  { id: 'p11', code: 'documents:read', description: 'View documents', module: 'Documents' },
  { id: 'p12', code: 'documents:write', description: 'Upload and manage documents', module: 'Documents' },
  { id: 'p13', code: 'payroll:read', description: 'View payroll data', module: 'Payroll' },
  { id: 'p14', code: 'payroll:run', description: 'Run payroll cycles', module: 'Payroll' },
  { id: 'p15', code: 'performance:read', description: 'View performance reviews', module: 'Performance' },
  { id: 'p16', code: 'performance:manage', description: 'Manage performance cycles', module: 'Performance' },
  { id: 'p17', code: 'monitoring:view-settings', description: 'View monitoring settings', module: 'Monitoring' },
  { id: 'p18', code: 'monitoring:configure', description: 'Configure monitoring policies', module: 'Monitoring' },
  { id: 'p19', code: 'analytics:view', description: 'View analytics dashboards', module: 'Analytics' },
  { id: 'p20', code: 'analytics:export', description: 'Export analytics data', module: 'Analytics' },
  { id: 'p21', code: 'settings:read', description: 'View tenant settings', module: 'Settings' },
  { id: 'p22', code: 'settings:admin', description: 'Manage tenant administration', module: 'Settings' },
  { id: 'p23', code: 'users:read', description: 'View user accounts', module: 'Users' },
  { id: 'p24', code: 'users:manage', description: 'Invite and manage users', module: 'Users' },
  { id: 'p25', code: 'roles:read', description: 'View roles', module: 'Roles' },
  { id: 'p26', code: 'roles:manage', description: 'Create and assign roles', module: 'Roles' },
  { id: 'p27', code: 'automations:read', description: 'View automations', module: 'Automations' },
  { id: 'p28', code: 'automations:manage', description: 'Create and edit automations', module: 'Automations' },
];

export const MOCK_ROLES: AdminRole[] = [
  {
    id: 'role-owner',
    name: 'Tenant Owner',
    description: 'Full administration within enabled modules',
    type: 'system',
    permissionIds: GRANTABLE_PERMISSIONS.map(p => p.id),
    userCount: 1,
    updatedAt: '2026-06-01T10:00:00Z',
    active: true,
  },
  {
    id: 'role-people-admin',
    name: 'People Administrator',
    description: 'Manage employees, leave, and attendance within assigned scope',
    type: 'custom',
    permissionIds: ['p1', 'p2', 'p6', 'p7', 'p9', 'p10', 'p11'],
    userCount: 3,
    updatedAt: '2026-06-08T14:30:00Z',
    active: true,
  },
  {
    id: 'role-leave-approver',
    name: 'Leave Approver',
    description: 'Approve leave for reporting tree',
    type: 'custom',
    permissionIds: ['p6', 'p7'],
    userCount: 5,
    updatedAt: '2026-06-05T09:15:00Z',
    active: true,
  },
  {
    id: 'role-readonly',
    name: 'Read Only Analyst',
    description: 'View-only access to analytics and employee data',
    type: 'custom',
    permissionIds: ['p1', 'p19'],
    userCount: 2,
    updatedAt: '2026-05-20T16:00:00Z',
    active: true,
  },
  {
    id: 'role-legacy',
    name: 'Legacy Operations',
    description: 'Deactivated custom role from prior org structure',
    type: 'custom',
    permissionIds: ['p4', 'p27'],
    userCount: 0,
    updatedAt: '2026-03-12T11:00:00Z',
    active: false,
  },
];

export const MOCK_USERS: AdminUser[] = [
  {
    id: 'user-1',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@acme.com',
    employeeId: 'emp-1',
    employeeName: 'Priya Sharma',
    roleIds: ['role-owner'],
    status: 'active',
    mfaEnabled: true,
    lastLogin: '2026-06-12T08:42:00Z',
    accessScope: 'organization',
    accessScopeDepartmentId: null,
  },
  {
    id: 'user-2',
    firstName: 'James',
    lastName: 'Chen',
    email: 'james.chen@acme.com',
    employeeId: 'emp-2',
    employeeName: 'James Chen',
    roleIds: ['role-people-admin'],
    status: 'active',
    mfaEnabled: true,
    lastLogin: '2026-06-11T17:20:00Z',
    accessScope: 'department',
    accessScopeDepartmentId: 'dept-hr',
  },
  {
    id: 'user-3',
    firstName: 'Maria',
    lastName: 'Lopez',
    email: 'maria.lopez@acme.com',
    employeeId: 'emp-3',
    employeeName: 'Maria Lopez',
    roleIds: ['role-leave-approver'],
    status: 'active',
    mfaEnabled: false,
    lastLogin: '2026-06-10T09:05:00Z',
    accessScope: 'reporting_tree',
    accessScopeDepartmentId: null,
  },
  {
    id: 'user-4',
    firstName: 'Alex',
    lastName: 'Kim',
    email: 'alex.kim@acme.com',
    employeeId: null,
    employeeName: null,
    roleIds: [],
    status: 'invited',
    mfaEnabled: false,
    lastLogin: null,
    accessScope: 'own',
    accessScopeDepartmentId: null,
  },
  {
    id: 'user-5',
    firstName: 'Sam',
    lastName: 'Taylor',
    email: 'sam.taylor@acme.com',
    employeeId: 'emp-5',
    employeeName: 'Sam Taylor',
    roleIds: ['role-readonly'],
    status: 'disabled',
    mfaEnabled: false,
    lastLogin: '2026-05-28T14:00:00Z',
    accessScope: 'organization',
    accessScopeDepartmentId: null,
  },
  {
    id: 'user-6',
    firstName: 'Nina',
    lastName: 'Patel',
    email: 'nina.patel@acme.com',
    employeeId: 'emp-6',
    employeeName: 'Nina Patel',
    roleIds: ['role-leave-approver'],
    status: 'invited',
    mfaEnabled: false,
    lastLogin: null,
    accessScope: 'direct_reports',
    accessScopeDepartmentId: null,
  },
];

export const MOCK_USER_OVERRIDES: Record<string, PermissionOverride[]> = {
  'user-3': [
    {
      permissionCode: 'leave:manage',
      grantType: 'grant',
      reason: 'Temporary leave policy admin during HR transition',
      expiresAt: '2026-07-01T00:00:00Z',
    },
  ],
};

export const MOCK_USER_SESSIONS: Record<string, ActiveSession[]> = {
  'user-1': [
    {
      id: 'sess-1',
      device: 'Chrome on Windows',
      ipAddress: '203.0.113.42',
      startedAt: '2026-06-12T08:42:00Z',
      lastActivityAt: '2026-06-12T10:15:00Z',
    },
    {
      id: 'sess-2',
      device: 'Safari on iPhone',
      ipAddress: '203.0.113.88',
      startedAt: '2026-06-11T19:30:00Z',
      lastActivityAt: '2026-06-11T20:05:00Z',
    },
  ],
  'user-2': [
    {
      id: 'sess-3',
      device: 'Firefox on macOS',
      ipAddress: '198.51.100.12',
      startedAt: '2026-06-11T17:20:00Z',
      lastActivityAt: '2026-06-12T09:00:00Z',
    },
  ],
};

export const MOCK_ACCESS_CHANGES: Record<string, AccessChange[]> = {
  'user-3': [
    {
      timestamp: '2026-06-01T11:00:00Z',
      description: 'Granted leave:manage override (expires Jul 1)',
      changedBy: 'Priya Sharma',
    },
    {
      timestamp: '2026-05-15T09:30:00Z',
      description: 'Assigned Leave Approver role with reporting_tree scope',
      changedBy: 'Priya Sharma',
    },
  ],
};

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: '2026-06-12T10:15:00Z',
    actorName: 'Priya Sharma',
    actorId: 'user-1',
    action: 'user.invited',
    resourceType: 'User',
    resourceName: 'Alex Kim',
    resourceId: 'user-4',
    module: 'Users',
    ipAddress: '203.0.113.42',
    status: 'success',
    beforeValues: null,
    afterValues: { status: 'invited', email: 'alex.kim@acme.com' },
    correlationId: 'corr-a1b2c3',
  },
  {
    id: 'audit-2',
    timestamp: '2026-06-12T09:30:00Z',
    actorName: 'Priya Sharma',
    actorId: 'user-1',
    action: 'role.permissions.updated',
    resourceType: 'Role',
    resourceName: 'People Administrator',
    resourceId: 'role-people-admin',
    module: 'Roles',
    ipAddress: '203.0.113.42',
    status: 'success',
    beforeValues: { permissions: ['employees:read', 'leave:read'] },
    afterValues: { permissions: ['employees:read', 'employees:write', 'leave:read', 'leave:approve'] },
    correlationId: 'corr-d4e5f6',
  },
  {
    id: 'audit-3',
    timestamp: '2026-06-12T08:00:00Z',
    actorName: 'James Chen',
    actorId: 'user-2',
    action: 'user.login.disabled',
    resourceType: 'User',
    resourceName: 'Sam Taylor',
    resourceId: 'user-5',
    module: 'Users',
    ipAddress: '198.51.100.12',
    status: 'success',
    beforeValues: { status: 'active' },
    afterValues: { status: 'disabled' },
    correlationId: 'corr-g7h8i9',
  },
  {
    id: 'audit-4',
    timestamp: '2026-06-11T22:45:00Z',
    actorName: 'Unknown',
    actorId: 'user-unknown',
    action: 'auth.login.failed',
    resourceType: 'Session',
    resourceName: 'Login attempt',
    resourceId: 'sess-fail-1',
    module: 'Security',
    ipAddress: '185.220.101.5',
    status: 'failed',
    beforeValues: null,
    afterValues: { reason: 'invalid_password', email: 'admin@acme.com' },
    correlationId: 'corr-j0k1l2',
  },
  {
    id: 'audit-5',
    timestamp: '2026-06-11T16:20:00Z',
    actorName: 'Maria Lopez',
    actorId: 'user-3',
    action: 'user.permissions.overridden',
    resourceType: 'User',
    resourceName: 'Maria Lopez',
    resourceId: 'user-3',
    module: 'Roles',
    ipAddress: '192.0.2.55',
    status: 'success',
    beforeValues: { overrides: [] },
    afterValues: { overrides: [{ code: 'leave:manage', grantType: 'grant' }] },
    correlationId: 'corr-m3n4o5',
  },
  {
    id: 'audit-6',
    timestamp: '2026-06-11T14:00:00Z',
    actorName: 'Priya Sharma',
    actorId: 'user-1',
    action: 'role.assigned',
    resourceType: 'UserRole',
    resourceName: 'Nina Patel → Leave Approver',
    resourceId: 'user-6',
    module: 'Roles',
    ipAddress: '203.0.113.42',
    status: 'success',
    beforeValues: null,
    afterValues: { roleId: 'role-leave-approver', scope: 'direct_reports' },
    correlationId: 'corr-p6q7r8',
  },
  {
    id: 'audit-7',
    timestamp: '2026-06-10T11:30:00Z',
    actorName: 'System',
    actorId: '',
    action: 'role.created',
    resourceType: 'Role',
    resourceName: 'Read Only Analyst',
    resourceId: 'role-readonly',
    module: 'Roles',
    ipAddress: '127.0.0.1',
    status: 'success',
    beforeValues: null,
    afterValues: { name: 'Read Only Analyst', type: 'custom' },
    correlationId: 'corr-s9t0u1',
  },
];

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function scopeLabel(scope: AccessScope, deptId: string | null): string {
  if (scope === 'department' && deptId) {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    return dept ? `Department · ${dept.name}` : 'Department';
  }
  return ACCESS_SCOPE_OPTIONS.find(o => o.value === scope)?.label ?? scope;
}

export function permissionsByModule(modules: readonly string[] = ENABLED_MODULES) {
  const set = new Set(modules);
  const grouped: Record<string, PermissionDef[]> = {};
  for (const p of GRANTABLE_PERMISSIONS) {
    if (!set.has(p.module)) continue;
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push(p);
  }
  return grouped;
}

export function resolveEffectivePermissions(roleIds: string[], userId: string): string[] {
  const codes = new Set<string>();
  for (const u of UNIVERSAL_PERMISSIONS) codes.add(u.code);
  for (const roleId of roleIds) {
    const role = MOCK_ROLES.find(r => r.id === roleId);
    if (!role) continue;
    for (const pid of role.permissionIds) {
      const perm = GRANTABLE_PERMISSIONS.find(p => p.id === pid);
      if (perm) codes.add(perm.code);
    }
  }
  const overrides = MOCK_USER_OVERRIDES[userId] ?? [];
  for (const o of overrides) {
    if (o.grantType === 'grant') codes.add(o.permissionCode);
    else codes.delete(o.permissionCode);
  }
  return Array.from(codes).sort();
}
