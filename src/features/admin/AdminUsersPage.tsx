import React, { useMemo, useState } from 'react';
import {
  Plus, Search, Mail, Ban, CheckCircle, Eye, Shield, ShieldOff, Send, X,
} from 'lucide-react';
import {
  MOCK_USERS,
  MOCK_ROLES,
  DEPARTMENTS,
  ACCESS_SCOPE_OPTIONS,
  MOCK_USER_OVERRIDES,
  MOCK_USER_SESSIONS,
  MOCK_ACCESS_CHANGES,
  formatRelativeTime,
  formatDateTime,
  scopeLabel,
  resolveEffectivePermissions,
  type AdminUser,
  type AccessScope,
  type UserStatus,
} from './adminMockData';

type DrawerMode = 'invite' | 'access' | null;

const EMPLOYEE_OPTIONS = [
  { id: '', name: 'None' },
  { id: 'emp-7', name: 'Jordan Wright' },
  { id: 'emp-8', name: 'Casey Morgan' },
  { id: 'emp-9', name: 'Riley Brooks' },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    roleId: '',
    accessScope: 'own' as AccessScope,
    departmentId: '',
    sendWelcome: true,
  });

  const summary = useMemo(() => ({
    active: users.filter(u => u.status === 'active').length,
    invited: users.filter(u => u.status === 'invited').length,
    disabled: users.filter(u => u.status === 'disabled').length,
    noRole: users.filter(u => u.roleIds.length === 0).length,
  }), [users]);

  const activeRoles = useMemo(() => MOCK_ROLES.filter(r => r.active), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (q && !name.includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (roleFilter !== 'all' && !u.roleIds.includes(roleFilter)) return false;
      return true;
    });
  }, [users, search, statusFilter, roleFilter]);

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  const openInvite = () => {
    setInviteForm({
      email: '',
      firstName: '',
      lastName: '',
      employeeId: '',
      roleId: activeRoles[0]?.id ?? '',
      accessScope: 'own',
      departmentId: '',
      sendWelcome: true,
    });
    setDrawer('invite');
  };

  const openAccess = (userId: string) => {
    setSelectedUserId(userId);
    setDrawer('access');
  };

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedUserId(null);
  };

  const handleInvite = () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.roleId) return;
    const emp = EMPLOYEE_OPTIONS.find(e => e.id === inviteForm.employeeId);
    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      firstName: inviteForm.firstName,
      lastName: inviteForm.lastName,
      email: inviteForm.email,
      employeeId: inviteForm.employeeId || null,
      employeeName: emp && emp.id ? emp.name : null,
      roleIds: [inviteForm.roleId],
      status: 'invited',
      mfaEnabled: false,
      lastLogin: null,
      accessScope: inviteForm.accessScope,
      accessScopeDepartmentId: inviteForm.accessScope === 'department' ? inviteForm.departmentId || null : null,
    };
    setUsers(prev => [newUser, ...prev]);
    closeDrawer();
  };

  const toggleStatus = (userId: string, enable: boolean) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        if (u.status === 'invited') return u;
        return { ...u, status: enable ? 'active' : 'disabled' };
      })
    );
  };

  const resendInvitation = (userId: string) => {
    void userId;
    window.alert('Invitation resent (mock).');
  };

  const initials = (u: AdminUser) => `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Users</h1>
          <p className="cfg-page__subtitle">
            Manage login accounts, invitations, and user-level access. Employee profiles belong under People.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openInvite}>
          <Plus size={14} /> Invite User
        </button>
      </div>

      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Active Users</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Invited Users</span>
          <strong>{summary.invited}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Disabled Users</span>
          <strong>{summary.disabled}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Users Without Role</span>
          <strong>{summary.noRole}</strong>
        </div>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="cfg-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as UserStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
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
                <th>Email</th>
                <th>Employee</th>
                <th>Roles</th>
                <th>Status</th>
                <th>MFA</th>
                <th>Last Login</th>
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
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.employeeName ?? '—'}</td>
                  <td>
                    <div className="admin-role-tags">
                      {u.roleIds.length === 0 && <span className="cfg-table__meta">No role</span>}
                      {u.roleIds.map(rid => {
                        const role = MOCK_ROLES.find(r => r.id === rid);
                        if (!role) return null;
                        return (
                          <span
                            key={rid}
                            className={`admin-role-tag${role.type === 'system' ? ' admin-role-tag--system' : ''}`}
                          >
                            {role.name}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${u.status === 'active' ? 'active' : u.status}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-mfa${u.mfaEnabled ? ' admin-mfa--on' : ' admin-mfa--off'}`}>
                      {u.mfaEnabled ? <Shield size={13} /> : <ShieldOff size={13} />}
                      {u.mfaEnabled ? 'On' : 'Off'}
                    </span>
                  </td>
                  <td>{formatRelativeTime(u.lastLogin)}</td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      {u.status === 'invited' && (
                        <button type="button" className="cfg-action-btn" onClick={() => resendInvitation(u.id)}>
                          <Send size={13} /> Resend
                        </button>
                      )}
                      {u.status === 'active' && (
                        <button type="button" className="cfg-action-btn" onClick={() => toggleStatus(u.id, false)}>
                          <Ban size={13} /> Disable
                        </button>
                      )}
                      {u.status === 'disabled' && (
                        <button type="button" className="cfg-action-btn" onClick={() => toggleStatus(u.id, true)}>
                          <CheckCircle size={13} /> Enable
                        </button>
                      )}
                      <button type="button" className="cfg-action-btn" onClick={() => openAccess(u.id)}>
                        <Eye size={13} /> View Access
                      </button>
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

      {drawer === 'invite' && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--narrow"
            role="dialog"
            aria-modal="true"
            aria-label="Invite user"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Invite User</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="org-form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@company.com"
                />
              </div>
              <div className="org-form-field">
                <label>First Name</label>
                <input
                  value={inviteForm.firstName}
                  onChange={e => setInviteForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="org-form-field">
                <label>Last Name</label>
                <input
                  value={inviteForm.lastName}
                  onChange={e => setInviteForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div className="org-form-field">
                <label>Link Employee (optional)</label>
                <select
                  value={inviteForm.employeeId}
                  onChange={e => setInviteForm(f => ({ ...f, employeeId: e.target.value }))}
                >
                  {EMPLOYEE_OPTIONS.map(e => (
                    <option key={e.id || 'none'} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label>Assign Role</label>
                <select
                  value={inviteForm.roleId}
                  onChange={e => setInviteForm(f => ({ ...f, roleId: e.target.value }))}
                >
                  {activeRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-section">
                <h3>Access Scope</h3>
                <p className="admin-hint admin-hint--info">
                  A role grants permissions. Access scope controls whose employee records those permissions can reach.
                </p>
                <div className="admin-segmented">
                  {ACCESS_SCOPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`admin-segmented__btn${inviteForm.accessScope === opt.value ? ' admin-segmented__btn--active' : ''}`}
                      onClick={() => setInviteForm(f => ({ ...f, accessScope: opt.value }))}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {inviteForm.accessScope === 'department' && (
                  <div className="org-form-field">
                    <label>Department</label>
                    <select
                      value={inviteForm.departmentId}
                      onChange={e => setInviteForm(f => ({ ...f, departmentId: e.target.value }))}
                    >
                      <option value="">Select department…</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <label className="leave-cfg-toggle">
                <input
                  type="checkbox"
                  checked={inviteForm.sendWelcome}
                  onChange={e => setInviteForm(f => ({ ...f, sendWelcome: e.target.checked }))}
                />
                Send welcome email
              </label>
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>Cancel</button>
              <button type="button" className="org-btn org-btn--primary" onClick={handleInvite}>
                <Mail size={14} /> Send Invitation
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
                <h3>Assigned Roles</h3>
                <div className="admin-role-tags">
                  {selectedUser.roleIds.length === 0 && <span className="cfg-table__meta">No roles assigned</span>}
                  {selectedUser.roleIds.map(rid => {
                    const role = MOCK_ROLES.find(r => r.id === rid);
                    return role ? (
                      <span key={rid} className={`admin-role-tag${role.type === 'system' ? ' admin-role-tag--system' : ''}`}>
                        {role.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="admin-section">
                <h3>Access Scope</h3>
                <p className="admin-detail-row__value">
                  {scopeLabel(selectedUser.accessScope, selectedUser.accessScopeDepartmentId)}
                </p>
              </div>

              <div className="admin-section">
                <h3>Effective Permissions</h3>
                <div className="admin-review-list">
                  {resolveEffectivePermissions(selectedUser.roleIds, selectedUser.id).map(code => (
                    <span key={code} className="admin-review-chip">{code}</span>
                  ))}
                </div>
              </div>

              <div className="admin-section">
                <h3>Permission Overrides</h3>
                <p className="admin-hint">
                  Overrides require a reason and optional expiry. Universal auto-grant permissions cannot be overridden.
                </p>
                {(MOCK_USER_OVERRIDES[selectedUser.id] ?? []).length === 0 ? (
                  <p className="cfg-table__meta">No active overrides</p>
                ) : (
                  (MOCK_USER_OVERRIDES[selectedUser.id] ?? []).map(o => (
                    <div key={o.permissionCode} className="admin-access-item">
                      <strong>{o.permissionCode}</strong>
                      <span className={`cfg-badge cfg-badge--${o.grantType === 'grant' ? 'active' : 'failed'}`}>
                        {o.grantType}
                      </span>
                      <div className="cfg-table__meta">Reason: {o.reason}</div>
                      {o.expiresAt && (
                        <div className="cfg-table__meta">Expires: {formatDateTime(o.expiresAt)}</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="admin-section">
                <h3>Active Sessions</h3>
                {(MOCK_USER_SESSIONS[selectedUser.id] ?? []).length === 0 ? (
                  <p className="cfg-table__meta">No active sessions</p>
                ) : (
                  (MOCK_USER_SESSIONS[selectedUser.id] ?? []).map(s => (
                    <div key={s.id} className="admin-access-item">
                      <div>{s.device}</div>
                      <div className="cfg-table__meta">{s.ipAddress} · Last active {formatRelativeTime(s.lastActivityAt)}</div>
                    </div>
                  ))
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
