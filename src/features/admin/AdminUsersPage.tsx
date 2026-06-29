import React, { useMemo, useState } from 'react';
import {
  Download, Ban, CheckCircle, Eye, Send, X,
  Unlock, LogOut, Plus, Save, ShieldCheck, Monitor, MoreHorizontal,
  Users, Search, AlertTriangle, KeyRound, UserX,
} from 'lucide-react';
import { ConfigShellHeader } from '../../shared/components/config-shell-header/ConfigShellHeader';
import { recordHistory } from '../../store/historyStore';
import {
  MOCK_USERS,
  MOCK_ROLES,
  EMPLOYEES_WITHOUT_LOGIN,
  TENANT_LOGIN_METHOD,
  GRANTABLE_PERMISSIONS,
  UNIVERSAL_PERMISSIONS,
  MOCK_USER_SESSIONS,
  formatRelativeTime,
  formatDateTime,
  resolveEffectivePermissions,
  type AdminUser,
  type AccountStatus,
  type InviteStatus,
  type PermissionOverride,
  type ActiveSession,
} from './adminMockData';

type DrawerMode = 'create-access' | 'access' | null;
type AccessTab = 'overview' | 'permissions' | 'sessions';
type RevokeMode = 'selected' | 'all' | null;

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
  const [openActionUserId, setOpenActionUserId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({ employeeId: '', email: '' });

  const [accessTab, setAccessTab] = useState<AccessTab>('overview');
  const [draftRoleId, setDraftRoleId] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [overrideForm, setOverrideForm] = useState({
    permissionCodes: [] as string[],
    grantType: 'grant' as 'grant' | 'revoke',
    reason: '',
    expiresAt: '',
  });
  const [revokeMode, setRevokeMode] = useState<RevokeMode>(null);
  const [revokePermissionCodes, setRevokePermissionCodes] = useState<string[]>([]);
  const [revokeReason, setRevokeReason] = useState('');

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
    const user = users.find(item => item.id === userId);
    setSelectedUserId(userId);
    setAccessTab('overview');
    setDraftRoleId(user?.roleIds[0] ?? '');
    setPermissionSearch('');
    setOverrideForm({ permissionCodes: [], grantType: 'grant', reason: '', expiresAt: '' });
    setRevokeMode(null);
    setDrawer('access');
  };

  const closeDrawer = () => {
    if (drawer === 'access' && selectedUser && draftRoleId !== (selectedUser.roleIds[0] ?? '')) {
      if (!window.confirm('Discard the unsaved role change?')) return;
    }
    setDrawer(null);
    setSelectedUserId(null);
  };

  const updateUser = (userId: string, patch: Partial<AdminUser>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...patch } : u)));
  };

  const handleCreateAccess = () => {
    if (!selectedEmployee || !createForm.email.trim()) return;
    const newUser: AdminUser = {
      id: `user-${users.length + employeesWithoutLogin.length + 1}`,
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

  const resendInvite = (userId: string) => {
    updateUser(userId, { inviteStatus: 'sent', accountStatus: 'no_login_access' });
  };

  const revokeSessions = (userId: string) => {
    setSessions(prev => ({ ...prev, [userId]: [] }));
  };

  const saveRole = (userId: string, roleId: string) => {
    if (!roleId) return;
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        return {
          ...u,
          roleIds: [roleId],
          roleSources: { [roleId]: 'manual' },
        };
      })
    );
    const role = MOCK_ROLES.find(item => item.id === roleId);
    recordHistory({ title: 'User role updated', description: `${role?.name ?? 'Role'} was saved as the user's access role.`, category: 'Settings' });
  };

  const addOverride = (userId: string) => {
    if (overrideForm.permissionCodes.length === 0 || !overrideForm.reason.trim()) return;
    const entries: PermissionOverride[] = overrideForm.permissionCodes
      .filter(code => !UNIVERSAL_PERMISSIONS.some(p => p.code === code))
      .map(permissionCode => ({
        permissionCode,
        grantType: overrideForm.grantType,
        reason: overrideForm.reason.trim(),
        expiresAt: overrideForm.expiresAt ? new Date(overrideForm.expiresAt).toISOString() : null,
      }));
    setOverrides(prev => ({
      ...prev,
      [userId]: [
        ...(prev[userId] ?? []).filter(item => !entries.some(entry => entry.permissionCode === item.permissionCode)),
        ...entries,
      ],
    }));
    recordHistory({ title: 'Permission overrides updated', description: `${entries.length} permission override${entries.length === 1 ? '' : 's'} applied.`, category: 'Settings' });
    setOverrideForm({ permissionCodes: [], grantType: 'grant', reason: '', expiresAt: '' });
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

  const toggleOverridePermission = (permissionCode: string) => {
    setOverrideForm(form => ({
      ...form,
      permissionCodes: form.permissionCodes.includes(permissionCode)
        ? form.permissionCodes.filter(code => code !== permissionCode)
        : [...form.permissionCodes, permissionCode],
    }));
  };

  const openRevoke = (mode: Exclude<RevokeMode, null>) => {
    setRevokeMode(mode);
    setRevokePermissionCodes([]);
    setRevokeReason('');
  };

  const openRevokeForUser = (userId: string) => {
    setSelectedUserId(userId);
    setOpenActionUserId(null);
    openRevoke('all');
  };

  const blockLogin = (userId: string) => {
    updateUser(userId, { accountStatus: 'locked' });
    revokeSessions(userId);
    setOpenActionUserId(null);
  };

  const applyRevoke = (user: AdminUser) => {
    if (!revokeReason.trim()) return;
    const permissionCodes = revokeMode === 'all'
      ? GRANTABLE_PERMISSIONS.map(permission => permission.code)
      : revokePermissionCodes;
    if (permissionCodes.length === 0) return;
    const entries: PermissionOverride[] = permissionCodes.map(permissionCode => ({
      permissionCode,
      grantType: 'revoke',
      reason: revokeReason.trim(),
      expiresAt: null,
    }));
    setOverrides(prev => ({
      ...prev,
      [user.id]: [
        ...(prev[user.id] ?? []).filter(item => !permissionCodes.includes(item.permissionCode)),
        ...entries,
      ],
    }));
    if (revokeMode === 'all') {
      updateUser(user.id, { accountStatus: 'disabled' });
      revokeSessions(user.id);
    }
    recordHistory({
      title: revokeMode === 'all' ? 'All user access revoked' : 'Selected user access revoked',
      description: revokeMode === 'all' ? `All access was revoked for ${user.firstName} ${user.lastName}.` : `${permissionCodes.length} permissions were revoked for ${user.firstName} ${user.lastName}.`,
      category: 'Settings',
      target: user.email,
    });
    setRevokeMode(null);
    setRevokePermissionCodes([]);
    setRevokeReason('');
  };

  const revokeSession = (userId: string, sessionId: string) => {
    setSessions(prev => ({ ...prev, [userId]: (prev[userId] ?? []).filter(session => session.id !== sessionId) }));
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
                    <div className="admin-user-actions">
                      <button type="button" className="admin-user-actions__trigger" aria-label={`Actions for ${u.firstName} ${u.lastName}`} aria-expanded={openActionUserId === u.id} onClick={() => setOpenActionUserId(current => current === u.id ? null : u.id)}><MoreHorizontal size={17} /></button>
                      {openActionUserId === u.id && <div className="admin-user-actions__menu" role="menu">
                        <button type="button" onClick={() => { setOpenActionUserId(null); openAccess(u.id); }}><Eye size={14} /><span><strong>View access</strong><small>Review role and permissions</small></span></button>
                        <button type="button" disabled={u.accountStatus === 'disabled'} onClick={() => { disableLogin(u.id); setOpenActionUserId(null); }}><Ban size={14} /><span><strong>Disable login</strong><small>Temporarily stop sign-in</small></span></button>
                        <button type="button" onClick={() => { setOpenActionUserId(null); resendInvite(u.id); }}><Send size={14} /><span><strong>Reinvite user</strong><small>Send a new invitation</small></span></button>
                        <button type="button" className="is-danger" onClick={() => openRevokeForUser(u.id)}><UserX size={14} /><span><strong>Revoke access</strong><small>Remove all grantable access</small></span></button>
                        <button type="button" className="is-danger" disabled={u.accountStatus === 'locked'} onClick={() => blockLogin(u.id)}><Unlock size={14} /><span><strong>Block account</strong><small>Lock sign-in and end sessions</small></span></button>
                      </div>}
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
          <aside className="org-slideover org-slideover--wide admin-access-workspace" role="dialog" aria-modal="true" aria-label="Manage user access" onClick={event => event.stopPropagation()}>
            <header className="org-slideover__header">
              <div><span className="admin-access-eyebrow">User access</span><h2>{selectedUser.firstName} {selectedUser.lastName}</h2></div>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close"><X size={18} /></button>
            </header>

            <div className="admin-access-profile">
              <span className="admin-access-profile__avatar">{initials(selectedUser)}</span>
              <div className="admin-access-profile__identity"><strong>{selectedUser.employeeName}</strong><span>{selectedUser.position ?? 'No position'} · {selectedUser.department ?? 'No department'}</span><small>{selectedUser.email}</small></div>
              <div className="admin-access-profile__status"><span className={`cfg-badge cfg-badge--${accountBadgeClass(selectedUser.accountStatus)}`}>{ACCOUNT_STATUS_LABELS[selectedUser.accountStatus]}</span><span className="cfg-badge cfg-badge--inactive">Invite {INVITE_STATUS_LABELS[selectedUser.inviteStatus]}</span></div>
              <div className="admin-access-profile__actions">
                {selectedUser.accountStatus === 'active' ? <button type="button" className="org-btn org-btn--secondary" onClick={() => disableLogin(selectedUser.id)}><Ban size={14} /> Disable login</button> : <button type="button" className="org-btn org-btn--secondary" onClick={() => enableLogin(selectedUser.id)}><CheckCircle size={14} /> Enable login</button>}
                <button type="button" className="org-btn org-btn--danger" onClick={() => openRevoke('all')}><AlertTriangle size={14} /> Revoke access</button>
              </div>
            </div>

            <nav className="admin-access-tabs" aria-label="User access sections">
              {([['overview', KeyRound, 'Overview'], ['permissions', ShieldCheck, 'Role & Permissions'], ['sessions', Monitor, 'Sessions']] as const).map(([id, Icon, label]) => <button key={id} type="button" className={accessTab === id ? 'is-active' : ''} onClick={() => setAccessTab(id)}><Icon size={15} />{label}</button>)}
            </nav>

            <div className="org-slideover__body admin-access-body">
              {accessTab === 'overview' && <div className="admin-access-overview-grid">
                <section className="admin-access-panel"><div className="admin-access-panel__heading"><div><span>Primary role</span><h3>{MOCK_ROLES.find(role => role.id === selectedUser.roleIds[0])?.name ?? 'No role'}</h3></div><ShieldCheck size={20} /></div><p>One role controls the user's standard access.</p><button className="cfg-action-btn" onClick={() => setAccessTab('permissions')}>Manage role</button></section>
                <section className="admin-access-panel"><div className="admin-access-panel__heading"><div><span>Effective permissions</span><h3>{resolvePermissions(selectedUser).length}</h3></div><KeyRound size={20} /></div><p>Combined role and direct permission access.</p><button className="cfg-action-btn" onClick={() => setAccessTab('permissions')}>Review access</button></section>
                <section className="admin-access-panel"><div className="admin-access-panel__heading"><div><span>Active sessions</span><h3>{(sessions[selectedUser.id] ?? []).length}</h3></div><Monitor size={20} /></div><p>Browsers and devices currently signed in.</p><button className="cfg-action-btn" onClick={() => setAccessTab('sessions')}>View sessions</button></section>
                <section className="admin-access-panel admin-access-panel--details"><h3>Account details</h3><dl><div><dt>Login method</dt><dd>{TENANT_LOGIN_METHOD}</dd></div><div><dt>Last active</dt><dd>{formatRelativeTime(selectedUser.lastLogin)}</dd></div><div><dt>MFA</dt><dd>{selectedUser.mfaEnabled ? 'Enabled' : 'Not enabled'}</dd></div><div><dt>Access scope</dt><dd>{selectedUser.accessScope.replaceAll('_', ' ')}</dd></div></dl></section>
              </div>}

              {accessTab === 'permissions' && <div className="admin-access-stack">
                <section className="admin-access-panel"><div className="admin-access-section-heading"><div><h3>Primary role</h3><p>Select one role and save the change.</p></div>{draftRoleId !== (selectedUser.roleIds[0] ?? '') && <span className="admin-unsaved-badge">Unsaved</span>}</div><div className="admin-role-editor"><select value={draftRoleId} onChange={event => setDraftRoleId(event.target.value)}><option value="">Select a role</option>{activeRoles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select><button type="button" className="org-btn org-btn--primary" disabled={!draftRoleId || draftRoleId === (selectedUser.roleIds[0] ?? '')} onClick={() => saveRole(selectedUser.id, draftRoleId)}><Save size={14} /> Save role</button></div>{draftRoleId && <p className="admin-role-description">{MOCK_ROLES.find(role => role.id === draftRoleId)?.description}</p>}</section>

                <section className="admin-access-panel"><div className="admin-access-section-heading"><div><h3>Effective permissions</h3><p>{resolvePermissions(selectedUser).length} permissions available.</p></div><button type="button" className="org-btn org-btn--secondary org-btn--danger-text" onClick={() => openRevoke('selected')}>Revoke selected</button></div><div className="admin-permission-search"><Search size={15} /><input value={permissionSearch} onChange={event => setPermissionSearch(event.target.value)} placeholder="Search effective permissions" /></div><div className="admin-effective-permissions">{resolvePermissions(selectedUser).filter(code => { const permission = [...GRANTABLE_PERMISSIONS, ...UNIVERSAL_PERMISSIONS].find(item => item.code === code); return `${code} ${permission?.description ?? ''} ${permission?.module ?? ''}`.toLowerCase().includes(permissionSearch.toLowerCase()); }).map(code => { const permission = [...GRANTABLE_PERMISSIONS, ...UNIVERSAL_PERMISSIONS].find(item => item.code === code); const override = (overrides[selectedUser.id] ?? []).find(item => item.permissionCode === code); return <div key={code} className="admin-effective-permission"><div><strong>{permission?.description ?? code}</strong><span>{code}</span></div><em>{permission?.universal ? 'System' : override?.grantType === 'grant' ? 'Direct' : 'Role'}</em></div>; })}</div></section>

                <section className="admin-access-panel"><div className="admin-access-section-heading"><div><h3>Permission overrides</h3><p>Select several permissions, then apply them together.</p></div><span className="admin-selected-pill">{overrideForm.permissionCodes.length} selected</span></div><div className="admin-permission-search"><Search size={15} /><input value={permissionSearch} onChange={event => setPermissionSearch(event.target.value)} placeholder="Search permissions" /></div><div className="admin-permission-picker">{selectablePermissions.filter(permission => `${permission.code} ${permission.description} ${permission.module}`.toLowerCase().includes(permissionSearch.toLowerCase())).map(permission => <label key={permission.id} className={overrideForm.permissionCodes.includes(permission.code) ? 'is-selected' : ''}><input type="checkbox" checked={overrideForm.permissionCodes.includes(permission.code)} onChange={() => toggleOverridePermission(permission.code)} /><span><strong>{permission.description}</strong><small>{permission.module} · {permission.code}</small></span></label>)}</div><div className="admin-override-form admin-override-form--batch"><label><span>Action</span><select value={overrideForm.grantType} onChange={event => setOverrideForm(form => ({ ...form, grantType: event.target.value as 'grant' | 'revoke' }))}><option value="grant">Grant access</option><option value="revoke">Revoke access</option></select></label><label><span>Expiry (optional)</span><input type="date" value={overrideForm.expiresAt} onChange={event => setOverrideForm(form => ({ ...form, expiresAt: event.target.value }))} /></label><label className="admin-override-reason"><span>Reason</span><input value={overrideForm.reason} onChange={event => setOverrideForm(form => ({ ...form, reason: event.target.value }))} placeholder="Why is this override needed?" /></label><button type="button" className="org-btn org-btn--primary" disabled={overrideForm.permissionCodes.length === 0 || !overrideForm.reason.trim()} onClick={() => addOverride(selectedUser.id)}>Add override ({overrideForm.permissionCodes.length})</button></div>{(overrides[selectedUser.id] ?? []).length > 0 && <div className="admin-current-overrides"><h4>Current overrides</h4>{(overrides[selectedUser.id] ?? []).map(item => <div key={item.permissionCode}><span><strong>{item.permissionCode}</strong><small>{item.reason}</small></span><em className={item.grantType}>{item.grantType}</em><button onClick={() => removeOverride(selectedUser.id, item.permissionCode)}>Remove</button></div>)}</div>}</section>
              </div>}

              {accessTab === 'sessions' && <section className="admin-access-panel"><div className="admin-access-section-heading"><div><h3>Active sessions</h3><p>Review and revoke signed-in devices.</p></div>{(sessions[selectedUser.id] ?? []).length > 0 && <button className="org-btn org-btn--secondary" onClick={() => revokeSessions(selectedUser.id)}><LogOut size={14} /> Revoke all</button>}</div><div className="admin-session-list">{(sessions[selectedUser.id] ?? []).length === 0 ? <div className="admin-access-empty"><Monitor size={24} /><strong>No active sessions</strong><span>This account is not signed in anywhere.</span></div> : (sessions[selectedUser.id] ?? []).map(session => <div key={session.id}><span className="admin-session-icon"><Monitor size={17} /></span><div><strong>{session.device}</strong><span>{session.ipAddress} · Last active {formatRelativeTime(session.lastActivityAt)}</span><small>Started {formatRelativeTime(session.startedAt)}</small></div><button className="cfg-action-btn cfg-action-btn--danger" onClick={() => revokeSession(selectedUser.id, session.id)}>Revoke</button></div>)}</div></section>}

            </div>
          </aside>
        </div>
      )}

      {/* Legacy access drawer retained temporarily for reference.
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
      */}
      {revokeMode && selectedUser && (
        <div className="billing-inner-modal billing-inner-modal--top" onClick={() => setRevokeMode(null)}>
          <div className="billing-inner-modal__card admin-revoke-modal" role="dialog" aria-modal="true" aria-label="Revoke access" onClick={event => event.stopPropagation()}>
            <header><div><h3>{revokeMode === 'all' ? 'Revoke all access' : 'Revoke selected permissions'}</h3><p>{revokeMode === 'all' ? 'Disable login, end sessions and remove all grantable access.' : 'Choose only the permissions this user should lose.'}</p></div><button onClick={() => setRevokeMode(null)} aria-label="Close"><X /></button></header>
            {revokeMode === 'all' ? <div className="admin-revoke-warning"><AlertTriangle size={20} /><div><strong>High-impact action</strong><span>System-required personal access remains protected.</span></div></div> : <div className="admin-revoke-picker">{resolvePermissions(selectedUser).filter(code => !UNIVERSAL_PERMISSIONS.some(permission => permission.code === code)).map(code => { const permission = GRANTABLE_PERMISSIONS.find(item => item.code === code); return <label key={code} className={revokePermissionCodes.includes(code) ? 'is-selected' : ''}><input type="checkbox" checked={revokePermissionCodes.includes(code)} onChange={() => setRevokePermissionCodes(codes => codes.includes(code) ? codes.filter(item => item !== code) : [...codes, code])} /><span><strong>{permission?.description ?? code}</strong><small>{code}</small></span></label>; })}</div>}
            <label className="org-form-field"><span>Reason</span><textarea rows={3} value={revokeReason} onChange={event => setRevokeReason(event.target.value)} placeholder="Explain why access is being revoked" /></label>
            <footer><button className="org-btn org-btn--secondary" onClick={() => setRevokeMode(null)}>Cancel</button><button className="org-btn org-btn--danger" disabled={!revokeReason.trim() || (revokeMode === 'selected' && revokePermissionCodes.length === 0)} onClick={() => applyRevoke(selectedUser)}>{revokeMode === 'all' ? 'Revoke all access' : `Revoke selected (${revokePermissionCodes.length})`}</button></footer>
          </div>
        </div>
      )}
    </div>
  );
};
