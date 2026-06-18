import React, { useMemo, useState } from 'react';
import {
  Download, Ban, CheckCircle, Eye, Send, X,
  Unlock, LogOut, Plus, Trash2,
  Users,
} from 'lucide-react';
import { ConfigShellHeader } from '../../shared/components/config-shell-header/ConfigShellHeader';
import {
  MOCK_USERS,
  MOCK_ROLES,
  EMPLOYEES_WITHOUT_LOGIN,
  TENANT_LOGIN_METHOD,
  GRANTABLE_PERMISSIONS,
  UNIVERSAL_PERMISSIONS,
  MOCK_USER_SESSIONS,
  MOCK_ACCESS_CHANGES,
  formatRelativeTime,
  formatDateTime,
  formatRoleSource,
  resolveEffectivePermissions,
  type AdminUser,
  type AccountStatus,
  type InviteStatus,
  type PermissionOverride,
  type ActiveSession,
} from './adminMockData';

type DrawerMode = 'create-access' | 'access' | null;

const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  disabled: 'Disabled',
  locked: 'Locked',
  no_login_access: 'No Login Access',
};

const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  sent: 'Sent',
  accepted: 'Accepted',
  expired: 'Expired',
  not_sent: 'Not Sent',
};

function accountBadgeClass(status: AccountStatus): string {
  if (status === 'active') return 'active';
  if (status === 'disabled') return 'disabled';
  if (status === 'locked') return 'failed';
  return 'inactive';
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [employeesWithoutLogin, setEmployeesWithoutLogin] = useState(EMPLOYEES_WITHOUT_LOGIN);
  const [overrides, setOverrides] = useState<Record<string, PermissionOverride[]>>({
    'user-3': [
      {
        permissionCode: 'leave:manage',
        grantType: 'grant',
        reason: 'Temporary leave policy admin during HR transition',
        expiresAt: '2026-07-01T00:00:00Z',
      },
    ],
  });
  const [sessions, setSessions] = useState<Record<string, ActiveSession[]>>(MOCK_USER_SESSIONS);

  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<AccountStatus | 'all'>('all');
  const [inviteFilter, setInviteFilter] = useState<InviteStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({ employeeId: '', email: '' });

  const [assignRoleId, setAssignRoleId] = useState('');
  const [overrideForm, setOverrideForm] = useState({
    permissionCode: '',
    grantType: 'grant' as 'grant' | 'revoke',
    reason: '',
    expiresAt: '',
  });

  const activeRoles = useMemo(() => MOCK_ROLES.filter(r => r.active), []);

  const summary = useMemo(() => ({
    activeLogins: users.filter(u => u.accountStatus === 'active').length,
    invitesPending: users.filter(u => u.inviteStatus === 'sent').length,
    disabledLocked: users.filter(u => u.accountStatus === 'disabled' || u.accountStatus === 'locked').length,
    noConfirmedRoles: users.filter(u => u.roleIds.length === 0).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (q && !name.includes(q) && !u.email.toLowerCase().includes(q) && !(u.position ?? '').toLowerCase().includes(q)) {
        return false;
      }
      if (accountFilter !== 'all' && u.accountStatus !== accountFilter) return false;
      if (inviteFilter !== 'all' && u.inviteStatus !== inviteFilter) return false;
      if (roleFilter !== 'all' && !u.roleIds.includes(roleFilter)) return false;
      return true;
    });
  }, [users, search, accountFilter, inviteFilter, roleFilter]);

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;
  const selectedEmployee = createForm.employeeId
    ? employeesWithoutLogin.find(e => e.id === createForm.employeeId)
    : null;

  const openCreateAccess = () => {
    setCreateForm({ employeeId: '', email: '' });
    setDrawer('create-access');
  };

  const openAccess = (userId: string) => {
    setSelectedUserId(userId);
    setAssignRoleId('');
    setOverrideForm({ permissionCode: '', grantType: 'grant', reason: '', expiresAt: '' });
    setDrawer('access');
  };

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedUserId(null);
  };

  const updateUser = (userId: string, patch: Partial<AdminUser>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...patch } : u)));
  };

  const handleCreateAccess = () => {
    if (!selectedEmployee || !createForm.email.trim()) return;
    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      firstName: selectedEmployee.firstName,
      lastName: selectedEmployee.lastName,
      email: createForm.email.trim(),
      employeeId: selectedEmployee.id,
      employeeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      position: selectedEmployee.position,
      department: selectedEmployee.department,
      roleIds: selectedEmployee.confirmedRoleIds,
      suggestedRoleIds: selectedEmployee.suggestedRoleIds.filter(
        id => !selectedEmployee.confirmedRoleIds.includes(id)
      ),
      roleSources: Object.fromEntries(
        selectedEmployee.confirmedRoleIds.map(id => [id, 'position' as const])
      ),
      accountStatus: 'no_login_access',
      inviteStatus: 'sent',
      mfaEnabled: false,
      lastLogin: null,
      accessScope: 'own',
      accessScopeDepartmentId: null,
    };
    setUsers(prev => [newUser, ...prev]);
    setEmployeesWithoutLogin(prev => prev.filter(e => e.id !== selectedEmployee.id));
    closeDrawer();
  };

  const enableLogin = (userId: string) => {
    updateUser(userId, { accountStatus: 'active' });
  };

  const disableLogin = (userId: string) => {
    updateUser(userId, { accountStatus: 'disabled' });
  };

  const unlockAccount = (userId: string) => {
    updateUser(userId, { accountStatus: 'active' });
  };

  const resendInvite = (userId: string) => {
    updateUser(userId, { inviteStatus: 'sent', accountStatus: 'no_login_access' });
  };

  const revokeSessions = (userId: string) => {
    setSessions(prev => ({ ...prev, [userId]: [] }));
  };

  const assignRole = (userId: string, roleId: string) => {
    if (!roleId) return;
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId || u.roleIds.includes(roleId)) return u;
        return {
          ...u,
          roleIds: [...u.roleIds, roleId],
          roleSources: { ...u.roleSources, [roleId]: 'manual' },
        };
      })
    );
    setAssignRoleId('');
  };

  const removeRole = (userId: string, roleId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        const { [roleId]: _, ...roleSources } = u.roleSources;
        return { ...u, roleIds: u.roleIds.filter(id => id !== roleId), roleSources };
      })
    );
  };

  const addOverride = (userId: string) => {
    if (!overrideForm.permissionCode || !overrideForm.reason.trim()) return;
    if (UNIVERSAL_PERMISSIONS.some(p => p.code === overrideForm.permissionCode)) return;
    const entry: PermissionOverride = {
      permissionCode: overrideForm.permissionCode,
      grantType: overrideForm.grantType,
      reason: overrideForm.reason.trim(),
      expiresAt: overrideForm.expiresAt ? new Date(overrideForm.expiresAt).toISOString() : null,
    };
    setOverrides(prev => ({
      ...prev,
      [userId]: [...(prev[userId] ?? []), entry],
    }));
    setOverrideForm({ permissionCode: '', grantType: 'grant', reason: '', expiresAt: '' });
  };

  const removeOverride = (userId: string, permissionCode: string) => {
    setOverrides(prev => ({
      ...prev,
      [userId]: (prev[userId] ?? []).filter(o => o.permissionCode !== permissionCode),
    }));
  };

  const resolvePermissions = (user: AdminUser) => {
    const base = resolveEffectivePermissions(user.roleIds);
    const userOverrides = overrides[user.id] ?? [];
    const codes = new Set(base);
    for (const o of userOverrides) {
      if (o.grantType === 'grant') codes.add(o.permissionCode);
      else codes.delete(o.permissionCode);
    }
    return Array.from(codes).sort();
  };

  const exportCsv = () => {
    const headers = ['User', 'Email', 'Position', 'Department', 'Account Status', 'Invite Status', 'Roles', 'MFA', 'Last Login'];
    const rows = filtered.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.position ?? '—',
      u.department ?? '—',
      ACCOUNT_STATUS_LABELS[u.accountStatus],
      INVITE_STATUS_LABELS[u.inviteStatus],
      u.roleIds.map(id => MOCK_ROLES.find(r => r.id === id)?.name).filter(Boolean).join('; '),
      u.mfaEnabled ? 'On' : 'Off',
      u.lastLogin ? formatDateTime(u.lastLogin) : 'Never',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const initials = (u: AdminUser) => `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();

  const selectablePermissions = GRANTABLE_PERMISSIONS.filter(
    p => !UNIVERSAL_PERMISSIONS.some(u => u.code === p.code)
  );

  return (
    <div className="cfg-page">
      <ConfigShellHeader
        title="Users"
        icon={<Users size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search by name, email, or position...',
          label: 'Search users'
        }}
        actions={
          <>
          <button type="button" className="org-btn org-btn--secondary" onClick={exportCsv}>
            <Download size={14} /> Export
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={openCreateAccess}>
            <Plus size={14} /> Create Login Access
          </button>
          </>
        }
      />

      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Active Logins</span>
          <strong>{summary.activeLogins}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Pending Invites</span>
          <strong>{summary.invitesPending}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Disabled / Locked</span>
          <strong>{summary.disabledLocked}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">No Confirmed Roles</span>
          <strong>{summary.noConfirmedRoles}</strong>
        </div>
      </div>

      <div className="cfg-page__toolbar">
        <select
          className="cfg-filter-select"
          value={accountFilter}
          onChange={e => setAccountFilter(e.target.value as AccountStatus | 'all')}
        >
          <option value="all">All account statuses</option>
          {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="cfg-filter-select"
          value={inviteFilter}
          onChange={e => setInviteFilter(e.target.value as InviteStatus | 'all')}
        >
          <option value="all">All invite statuses</option>
          {Object.entries(INVITE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          className="cfg-filter-select"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          {activeRoles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Employee</th>
                <th>Position</th>
                <th>Access status</th>
                <th>Last active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-user-cell">
                      <span className="admin-user-avatar">{initials(u)}</span>
                      <div>
                        <div className="cfg-table__name">{u.firstName} {u.lastName}</div>
                        {u.employeeName && u.employeeName !== `${u.firstName} ${u.lastName}` && (
                          <div className="cfg-table__meta">{u.employeeName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cfg-table__name">{u.employeeName ?? '—'}</div>
                    {u.email && <div className="cfg-table__meta">{u.email}</div>}
                  </td>
                  <td>{u.position ?? '—'}</td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${accountBadgeClass(u.accountStatus)}`}>
                      {ACCOUNT_STATUS_LABELS[u.accountStatus]}
                    </span>
                    {u.inviteStatus !== 'accepted' && (
                      <div className="cfg-table__meta">Invite {INVITE_STATUS_LABELS[u.inviteStatus]}</div>
                    )}
                  </td>
                  <td>{formatRelativeTime(u.lastLogin)}</td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      <button type="button" className="cfg-action-btn" onClick={() => openAccess(u.id)}>
                        <Eye size={13} /> View Access
                      </button>
                      {(u.inviteStatus === 'sent' || u.inviteStatus === 'expired') && (
                        <button type="button" className="cfg-action-btn" onClick={() => resendInvite(u.id)}>
                          <Send size={13} /> Resend Invite
                        </button>
                      )}
                      {u.accountStatus !== 'active' && u.accountStatus !== 'no_login_access' && (
                        <button type="button" className="cfg-action-btn" onClick={() => enableLogin(u.id)}>
                          <CheckCircle size={13} /> Enable Login
                        </button>
                      )}
                      {u.accountStatus === 'active' && (
                        <button type="button" className="cfg-action-btn" onClick={() => disableLogin(u.id)}>
                          <Ban size={13} /> Disable Login
                        </button>
                      )}
                      {u.accountStatus === 'locked' && (
                        <button type="button" className="cfg-action-btn" onClick={() => unlockAccount(u.id)}>
                          <Unlock size={13} /> Unlock Account
                        </button>
                      )}
                      {(sessions[u.id] ?? []).length > 0 && (
                        <button type="button" className="cfg-action-btn" onClick={() => revokeSessions(u.id)}>
                          <LogOut size={13} /> Revoke Sessions
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="cfg-empty">
              <p className="cfg-empty__title">No users match your filters</p>
            </div>
          )}
        </div>
      </div>

      {drawer === 'create-access' && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--narrow"
            role="dialog"
            aria-modal="true"
            aria-label="Create login access"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Create Login Access</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              <p className="admin-hint admin-hint--info">
                For employees who already exist in People but do not yet have a login account — e.g. migration, contractor, or delayed access.
              </p>

              <div className="org-form-field">
                <label>Employee</label>
                <select
                  value={createForm.employeeId}
                  onChange={e => {
                    const emp = employeesWithoutLogin.find(x => x.id === e.target.value);
                    setCreateForm({
                      employeeId: e.target.value,
                      email: emp?.workEmail ?? '',
                    });
                  }}
                >
                  <option value="">Select employee…</option>
                  {employeesWithoutLogin.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="org-form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="login@company.com"
                />
              </div>

              {selectedEmployee && (
                <div className="admin-section">
                  <h3>Employee Context</h3>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Position</span>
                      <span className="admin-detail-row__value">{selectedEmployee.position ?? '—'}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Department</span>
                      <span className="admin-detail-row__value">{selectedEmployee.department ?? '—'}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Confirmed Roles / Access</span>
                      <span className="admin-detail-row__value">
                        {selectedEmployee.confirmedRoleIds.length === 0
                          ? 'None confirmed'
                          : selectedEmployee.confirmedRoleIds
                              .map(id => MOCK_ROLES.find(r => r.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')}
                      </span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="admin-detail-row__label">Login Method</span>
                      <span className="admin-detail-row__value">{TENANT_LOGIN_METHOD}</span>
                    </div>
                  </div>

                  {!selectedEmployee.position && (
                    <p className="admin-hint admin-hint--warning">
                      This employee has no position assignment. Reporting and access scope may not resolve correctly.
                    </p>
                  )}
                  {selectedEmployee.confirmedRoleIds.length === 0 && (
                    <p className="admin-hint admin-hint--warning">
                      No confirmed access is available for this employee. Confirm role access before creating login access.
                    </p>
                  )}
                </div>
              )}
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>Cancel</button>
              <button
                type="button"
                className="org-btn org-btn--primary"
                disabled={!selectedEmployee || !createForm.email.trim()}
                onClick={handleCreateAccess}
              >
                Create Access &amp; Send Invite
              </button>
            </footer>
          </div>
        </div>
      )}

      {drawer === 'access' && selectedUser && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--wide"
            role="dialog"
            aria-modal="true"
            aria-label="View access"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Access — {selectedUser.firstName} {selectedUser.lastName}</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="admin-section">
                <h3>Employee</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Name</span>
                    <span className="admin-detail-row__value">{selectedUser.employeeName ?? `${selectedUser.firstName} ${selectedUser.lastName}`}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Position</span>
                    <span className="admin-detail-row__value">{selectedUser.position ?? '—'}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Department</span>
                    <span className="admin-detail-row__value">{selectedUser.department ?? '—'}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Account Status</span>
                    <span className="admin-detail-row__value">{ACCOUNT_STATUS_LABELS[selectedUser.accountStatus]}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Invite Status</span>
                    <span className="admin-detail-row__value">{INVITE_STATUS_LABELS[selectedUser.inviteStatus]}</span>
                  </div>
                </div>
              </div>

              <div className="admin-section">
                <h3>Assigned Roles</h3>
                {selectedUser.roleIds.length === 0 ? (
                  <p className="cfg-table__meta">No assigned roles</p>
                ) : (
                  <div className="admin-role-access-list">
                    {selectedUser.roleIds.map(rid => {
                      const role = MOCK_ROLES.find(r => r.id === rid);
                      if (!role) return null;
                      const source = selectedUser.roleSources[rid] ?? 'position';
                      return (
                        <div key={rid} className="admin-role-access-card">
                          <div className="admin-role-access-card__grid">
                            <div className="admin-detail-row">
                              <span className="admin-detail-row__label">Role</span>
                              <span className="admin-detail-row__value">{role.name}</span>
                            </div>
                            <div className="admin-detail-row">
                              <span className="admin-detail-row__label">Source</span>
                              <span className="admin-detail-row__value">
                                {formatRoleSource(selectedUser.position, source)}
                              </span>
                            </div>
                            <div className="admin-detail-row">
                              <span className="admin-detail-row__label">Status</span>
                              <span className="cfg-badge cfg-badge--active">Active</span>
                            </div>
                          </div>
                          {role.type !== 'system' && (
                            <button
                              type="button"
                              className="cfg-action-btn cfg-action-btn--danger admin-role-access-card__action"
                              onClick={() => removeRole(selectedUser.id, rid)}
                            >
                              <Trash2 size={13} /> Remove role
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="admin-assign-role">
                  <select
                    className="cfg-filter-select"
                    value={assignRoleId}
                    onChange={e => setAssignRoleId(e.target.value)}
                  >
                    <option value="">Assign role…</option>
                    {activeRoles
                      .filter(r => !selectedUser.roleIds.includes(r.id))
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="cfg-action-btn"
                    disabled={!assignRoleId}
                    onClick={() => assignRole(selectedUser.id, assignRoleId)}
                  >
                    <Plus size={13} /> Assign
                  </button>
                </div>
              </div>

              <div className="admin-section">
                <h3>Effective Permissions</h3>
                <div className="admin-review-list">
                  {resolvePermissions(selectedUser).map(code => (
                    <span key={code} className="admin-review-chip">{code}</span>
                  ))}
                </div>
              </div>

              <div className="admin-section">
                <h3>Permission Overrides</h3>
                <p className="admin-hint">
                  Overrides require a reason and optional expiry. Universal auto-grant permissions cannot be overridden.
                </p>
                {(overrides[selectedUser.id] ?? []).map(o => (
                  <div key={o.permissionCode} className="admin-access-item">
                    <div className="admin-access-item__header">
                      <strong>{o.permissionCode}</strong>
                      <span className={`cfg-badge cfg-badge--${o.grantType === 'grant' ? 'active' : 'failed'}`}>
                        {o.grantType}
                      </span>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--danger"
                        onClick={() => removeOverride(selectedUser.id, o.permissionCode)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="cfg-table__meta">Reason: {o.reason}</div>
                    {o.expiresAt && (
                      <div className="cfg-table__meta">Expires: {formatDateTime(o.expiresAt)}</div>
                    )}
                  </div>
                ))}
                <div className="admin-override-form">
                  <select
                    className="cfg-filter-select"
                    value={overrideForm.permissionCode}
                    onChange={e => setOverrideForm(f => ({ ...f, permissionCode: e.target.value }))}
                  >
                    <option value="">Select permission…</option>
                    {selectablePermissions.map(p => (
                      <option key={p.id} value={p.code}>{p.code}</option>
                    ))}
                  </select>
                  <select
                    className="cfg-filter-select"
                    value={overrideForm.grantType}
                    onChange={e => setOverrideForm(f => ({ ...f, grantType: e.target.value as 'grant' | 'revoke' }))}
                  >
                    <option value="grant">Grant</option>
                    <option value="revoke">Revoke</option>
                  </select>
                  <input
                    placeholder="Reason (required)"
                    value={overrideForm.reason}
                    onChange={e => setOverrideForm(f => ({ ...f, reason: e.target.value }))}
                  />
                  <input
                    type="date"
                    title="Expiry (optional)"
                    value={overrideForm.expiresAt}
                    onChange={e => setOverrideForm(f => ({ ...f, expiresAt: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="cfg-action-btn"
                    disabled={!overrideForm.permissionCode || !overrideForm.reason.trim()}
                    onClick={() => addOverride(selectedUser.id)}
                  >
                    Add Override
                  </button>
                </div>
              </div>

              <div className="admin-section">
                <h3>Active Sessions</h3>
                {(sessions[selectedUser.id] ?? []).length === 0 ? (
                  <p className="cfg-table__meta">No active sessions</p>
                ) : (
                  <>
                    {(sessions[selectedUser.id] ?? []).map(s => (
                      <div key={s.id} className="admin-access-item">
                        <div>{s.device}</div>
                        <div className="cfg-table__meta">
                          {s.ipAddress} · Started {formatRelativeTime(s.startedAt)} · Last active {formatRelativeTime(s.lastActivityAt)}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="cfg-action-btn"
                      style={{ marginTop: 8 }}
                      onClick={() => revokeSessions(selectedUser.id)}
                    >
                      <LogOut size={13} /> Revoke All Sessions
                    </button>
                  </>
                )}
              </div>

              <div className="admin-section">
                <h3>Recent Access Changes</h3>
                <div className="admin-access-list">
                  {(MOCK_ACCESS_CHANGES[selectedUser.id] ?? []).length === 0 ? (
                    <p className="cfg-table__meta">No recent changes</p>
                  ) : (
                    (MOCK_ACCESS_CHANGES[selectedUser.id] ?? []).map((c, i) => (
                      <div key={i} className="admin-access-item">
                        <div className="admin-access-item__time">{formatDateTime(c.timestamp)}</div>
                        <div>{c.description}</div>
                        <div className="cfg-table__meta">By {c.changedBy}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
