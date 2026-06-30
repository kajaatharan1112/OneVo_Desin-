import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Ban,
  Download,
  Link2,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useInbox } from '../../core/notifications/inbox-context';
import { ConfigShellHeader } from '../../shared/components/config-shell-header/ConfigShellHeader';
import { downloadCsv, downloadSimplePdf } from '../../shared/utils/exportUtils';
import { recordHistory } from '../../store/historyStore';
import {
  GRANTABLE_PERMISSIONS,
  MOCK_ACCESS_CHANGES,
  MOCK_ROLES,
  MOCK_USERS,
  UNIVERSAL_PERMISSIONS,
  formatDateTime,
  formatRelativeTime,
  formatRoleSource,
  resolveEffectivePermissions,
  type AccessChange,
  type AccountStatus,
  type AdminUser,
  type InviteStatus,
  type PermissionOverride,
} from './adminMockData';

type DrawerMode = 'access' | null;
type ActionMenu = 'block' | 'reinvite' | 'revoke';

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

function generateInviteLink(userId: string): string {
  const token = Math.random().toString(36).slice(2, 10);
  return `https://app.onevo.local/invite/${userId}?token=${token}`;
}

function initials(u: AdminUser) {
  return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
}

export const AdminUsersPage: React.FC = () => {
  const { addInboxItem } = useInbox();
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
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
  const [, setAccessChanges] = useState<Record<string, AccessChange[]>>(MOCK_ACCESS_CHANGES);
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<AccountStatus | 'all'>('all');
  const [inviteFilter, setInviteFilter] = useState<InviteStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [overrideForm, setOverrideForm] = useState({
    permissionCodes: [] as string[],
    grantType: 'grant' as 'grant' | 'revoke',
    reason: '',
    expiresAt: '',
  });
  const [revokeMode, setRevokeMode] = useState<'all' | 'selected'>('selected');
  const [revokePermissions, setRevokePermissions] = useState<string[]>([]);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [reinviteUserId, setReinviteUserId] = useState<string | null>(null);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');

  const activeRoles = useMemo(() => MOCK_ROLES.filter(r => r.active), []);
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) ?? null : null;
  const reinviteUser = reinviteUserId ? users.find(u => u.id === reinviteUserId) ?? null : null;

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [exportMenuOpen]);

  const summary = useMemo(
    () => ({
      activeLogins: users.filter(u => u.accountStatus === 'active').length,
      invitesPending: users.filter(u => u.inviteStatus === 'sent').length,
      disabledLocked: users.filter(
        u => u.accountStatus === 'disabled' || u.accountStatus === 'locked' || u.accountStatus === 'no_login_access',
      ).length,
      noConfirmedRoles: users.filter(u => u.roleIds.length === 0).length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (
        q &&
        !name.includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !(u.position ?? '').toLowerCase().includes(q) &&
        !(u.department ?? '').toLowerCase().includes(q)
      ) {
        return false;
      }
      if (accountFilter !== 'all' && u.accountStatus !== accountFilter) return false;
      if (inviteFilter !== 'all' && u.inviteStatus !== inviteFilter) return false;
      if (roleFilter !== 'all' && !u.roleIds.includes(roleFilter)) return false;
      return true;
    });
  }, [users, search, accountFilter, inviteFilter, roleFilter]);

  const selectablePermissions = useMemo(
    () =>
      GRANTABLE_PERMISSIONS.filter(
        permission => !UNIVERSAL_PERMISSIONS.some(universal => universal.code === permission.code),
      ),
    [],
  );

  const appendAccessChange = (userId: string, description: string, changedBy = 'Priya Sharma') => {
    const entry = {
      timestamp: new Date().toISOString(),
      description,
      changedBy,
    };
    setAccessChanges(prev => ({
      ...prev,
      [userId]: [entry, ...(prev[userId] ?? [])],
    }));
  };

  const resolvePermissions = (user: AdminUser) => {
    const base = resolveEffectivePermissions(user.roleIds);
    const userOverrides = overrides[user.id] ?? [];
    const codes = new Set(base);
    for (const override of userOverrides) {
      if (override.grantType === 'grant') codes.add(override.permissionCode);
      else codes.delete(override.permissionCode);
    }
    return Array.from(codes).sort();
  };

  const exportRows = useMemo(
    () => [
      ['User', 'Email', 'Position', 'Department', 'Account Status', 'Invite Status', 'Role', 'Last Login'],
      ...filtered.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.position ?? '—',
        user.department ?? '—',
        ACCOUNT_STATUS_LABELS[user.accountStatus],
        INVITE_STATUS_LABELS[user.inviteStatus],
        user.roleIds[0] ? MOCK_ROLES.find(role => role.id === user.roleIds[0])?.name ?? 'Unknown role' : 'No role',
        user.lastLogin ? formatDateTime(user.lastLogin) : 'Never',
      ]),
    ],
    [filtered],
  );

  const exportData = (format: 'csv' | 'pdf') => {
    setExportMenuOpen(false);
    if (format === 'csv') {
      downloadCsv('user-access.csv', exportRows);
    } else {
      downloadSimplePdf('user-access.pdf', [
        'ONEVO USER ACCESS',
        '',
        ...filtered.map(
          user =>
            `${user.firstName} ${user.lastName} | ${user.email} | ${ACCOUNT_STATUS_LABELS[user.accountStatus]} | ${
              user.roleIds[0] ? MOCK_ROLES.find(role => role.id === user.roleIds[0])?.name ?? 'No role' : 'No role'
            }`,
        ),
      ]);
    }

    recordHistory({
      title: 'User access exported',
      description: `User access list was exported as ${format.toUpperCase()}.`,
      category: 'Access',
      target: 'Users',
    });
  };

  const openAccess = (userId: string) => {
    setOpenActionId(null);
    setSelectedUserId(userId);
    setPermissionSearch('');
    setOverrideForm({ permissionCodes: [], grantType: 'grant', reason: '', expiresAt: '' });
    setRevokeMode('selected');
    setRevokePermissions([]);
    setDrawer('access');
  };

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedUserId(null);
    setPermissionSearch('');
  };

  const updateUser = (userId: string, patch: Partial<AdminUser>) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, ...patch } : user)));
  };

  const addOverride = (userId: string) => {
    if (overrideForm.permissionCodes.length === 0 || !overrideForm.reason.trim()) return;
    const entries: PermissionOverride[] = overrideForm.permissionCodes
      .filter(code => !UNIVERSAL_PERMISSIONS.some(permission => permission.code === code))
      .map(permissionCode => ({
        permissionCode,
        grantType: overrideForm.grantType,
        reason: overrideForm.reason.trim(),
        expiresAt: overrideForm.expiresAt ? new Date(overrideForm.expiresAt).toISOString() : null,
      }));

    setOverrides(prev => ({
      ...prev,
      [userId]: [
        ...(prev[userId] ?? []).filter(existing => !entries.some(entry => entry.permissionCode === existing.permissionCode)),
        ...entries,
      ],
    }));

    appendAccessChange(
      userId,
      `${overrideForm.grantType === 'grant' ? 'Override granted for' : 'Override revoked for'} ${entries
        .map(entry => entry.permissionCode)
        .join(', ')}.`,
    );
    recordHistory({
      title: 'Permission override updated',
      description: `${entries.length} permission override(s) were saved for ${selectedUser?.firstName ?? 'user'}.`,
      category: 'Access',
      target: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User',
    });
    setOverrideForm({ permissionCodes: [], grantType: 'grant', reason: '', expiresAt: '' });
  };

  const removeOverride = (userId: string, permissionCode: string) => {
    setOverrides(prev => ({
      ...prev,
      [userId]: (prev[userId] ?? []).filter(override => override.permissionCode !== permissionCode),
    }));
    appendAccessChange(userId, `Override removed for ${permissionCode}.`);
  };

  const revokeAccess = (userId: string) => {
    if (revokeMode === 'all') {
      updateUser(userId, { accountStatus: 'no_login_access', roleIds: [], roleSources: {} });
      setOverrides(prev => ({ ...prev, [userId]: [] }));
      appendAccessChange(userId, 'All access revoked for this user.');
      recordHistory({
        title: 'User access revoked',
        description: `All access was revoked for ${selectedUser?.firstName ?? 'this user'}.`,
        category: 'Access',
        target: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User',
      });
      return;
    }

    if (revokePermissions.length === 0) return;
    const entries: PermissionOverride[] = revokePermissions.map(permissionCode => ({
      permissionCode,
      grantType: 'revoke',
      reason: 'Access revoked by administrator',
      expiresAt: null,
    }));
    setOverrides(prev => ({
      ...prev,
      [userId]: [
        ...(prev[userId] ?? []).filter(existing => !revokePermissions.includes(existing.permissionCode)),
        ...entries,
      ],
    }));
    appendAccessChange(userId, `Selected permissions revoked: ${revokePermissions.join(', ')}.`);
    recordHistory({
      title: 'Permission access revoked',
      description: `${revokePermissions.length} permission(s) were revoked for ${selectedUser?.firstName ?? 'this user'}.`,
      category: 'Access',
      target: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User',
    });
    setRevokePermissions([]);
  };

  const handleQuickAction = (user: AdminUser, action: ActionMenu) => {
    setOpenActionId(null);
    if (action === 'block') {
      updateUser(user.id, { accountStatus: 'locked' });
      appendAccessChange(user.id, 'User account was blocked.');
      addInboxItem({
        id: `notif-access-blocked-${user.id}`,
        category: 'warning',
        title: 'Access blocked',
        message: `${user.firstName} ${user.lastName} login access was blocked.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: [],
      });
      recordHistory({
        title: 'User blocked',
        description: `${user.firstName} ${user.lastName} login access was blocked.`,
        category: 'Access',
        target: `${user.firstName} ${user.lastName}`,
      });
      return;
    }

    if (action === 'revoke') {
      updateUser(user.id, { accountStatus: 'no_login_access', roleIds: [], roleSources: {} });
      setOverrides(prev => ({ ...prev, [user.id]: [] }));
      appendAccessChange(user.id, 'User access was revoked from the quick action menu.');
      recordHistory({
        title: 'User access revoked',
        description: `${user.firstName} ${user.lastName} access was revoked.`,
        category: 'Access',
        target: `${user.firstName} ${user.lastName}`,
      });
      return;
    }

    setReinviteUserId(user.id);
    setGeneratedInviteLink(generateInviteLink(user.id));
  };

  const sendReinvite = () => {
    if (!reinviteUser) return;
    updateUser(reinviteUser.id, { inviteStatus: 'sent', accountStatus: 'active' });
    appendAccessChange(reinviteUser.id, 'New invite link was generated and sent.');
    addInboxItem({
      id: `notif-user-reinvite-${reinviteUser.id}`,
      category: 'warning',
      title: 'Invite sent',
      message: `A new invite link was sent to ${reinviteUser.firstName} ${reinviteUser.lastName}.`,
      timeLabel: 'Just now',
      filter: 'new',
      actions: [],
    });
    recordHistory({
      title: 'User reinvited',
      description: `A new invite link was sent to ${reinviteUser.firstName} ${reinviteUser.lastName}.`,
      category: 'Access',
      target: `${reinviteUser.firstName} ${reinviteUser.lastName}`,
    });
    setReinviteUserId(null);
    setGeneratedInviteLink('');
  };

  const filteredPermissions = selectedUser
    ? resolvePermissions(selectedUser).filter(permissionCode =>
        permissionCode.toLowerCase().includes(permissionSearch.toLowerCase().trim()),
      )
    : [];

  return (
    <div className="cfg-page admin-users-page">
      <ConfigShellHeader
        title="User Access"
        icon={<Users size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search by name, email, position, or department...',
          label: 'Search users',
        }}
        actions={
          <div className="dept-table__actions admin-export-wrap" ref={exportMenuRef}>
            <button
              type="button"
              className="org-btn org-btn--secondary"
              onClick={() => setExportMenuOpen(value => !value)}
            >
              <Download size={14} /> Export
            </button>
            {exportMenuOpen && (
              <div className="dept-table__menu admin-export-menu">
                <button type="button" onClick={() => exportData('csv')}>
                  Export CSV
                </button>
                <button type="button" onClick={() => exportData('pdf')}>
                  Export PDF
                </button>
              </div>
            )}
          </div>
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
          <span className="admin-summary-card__label">Disabled / Blocked</span>
          <strong>{summary.disabledLocked}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">No Confirmed Roles</span>
          <strong>{summary.noConfirmedRoles}</strong>
        </div>
      </div>

      <div className="cfg-page__toolbar admin-users-toolbar">
        <select
          className="cfg-filter-select"
          value={accountFilter}
          onChange={event => setAccountFilter(event.target.value as AccountStatus | 'all')}
        >
          <option value="all">All account statuses</option>
          {Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="cfg-filter-select"
          value={inviteFilter}
          onChange={event => setInviteFilter(event.target.value as InviteStatus | 'all')}
        >
          <option value="all">All invite statuses</option>
          {Object.entries(INVITE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select className="cfg-filter-select" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>
          <option value="all">All roles</option>
          {activeRoles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap admin-table-wrap">
          <table className="cfg-table admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Position</th>
                <th>Role</th>
                <th>Access status</th>
                <th>Last active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  roleName={
                    user.roleIds[0]
                      ? MOCK_ROLES.find(role => role.id === user.roleIds[0])?.name ?? 'Unknown role'
                      : 'No role'
                  }
                  isActionOpen={openActionId === user.id}
                  onRowClick={() => openAccess(user.id)}
                  onToggleActionMenu={() => setOpenActionId(current => (current === user.id ? null : user.id))}
                  onCloseActionMenu={() => setOpenActionId(null)}
                  onAction={action => handleQuickAction(user, action)}
                />
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

      {drawer === 'access' && selectedUser && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--wide admin-access-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Manage access"
            onClick={event => event.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Manage Access — {selectedUser.firstName} {selectedUser.lastName}</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="org-slideover__body">
              <div className="admin-section admin-section--surface">
                <h3>Employee</h3>
                <div className="admin-detail-grid admin-detail-grid--two admin-detail-grid--surface">
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Name</span>
                    <span className="admin-detail-row__value">
                      {selectedUser.employeeName ?? `${selectedUser.firstName} ${selectedUser.lastName}`}
                    </span>
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
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Last Login</span>
                    <span className="admin-detail-row__value">
                      {selectedUser.lastLogin ? formatDateTime(selectedUser.lastLogin) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-section">
                <h3>Assigned Role</h3>
                {selectedUser.roleIds.length === 0 ? (
                  <p className="cfg-table__meta">No assigned role.</p>
                ) : (
                  <div className="admin-role-access-list">
                    {selectedUser.roleIds.slice(0, 1).map(roleId => {
                      const role = MOCK_ROLES.find(item => item.id === roleId);
                      if (!role) return null;
                      const source = selectedUser.roleSources[roleId] ?? 'position';
                      return (
                        <div key={roleId} className="admin-role-access-card admin-role-access-card--feature">
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
                              <span className="admin-detail-row__label">Permissions</span>
                              <span className="admin-detail-row__value">{role.permissionIds.length}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="admin-section">
                <div className="admin-section__title-row">
                  <h3>Effective Permissions</h3>
                  <div className="cfg-search admin-manage-search">
                    <Search size={14} />
                    <input
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={event => setPermissionSearch(event.target.value)}
                    />
                  </div>
                </div>
                <div className="admin-review-list admin-permission-cloud">
                  {filteredPermissions.length === 0 ? (
                    <span className="cfg-table__meta">No permissions match your search.</span>
                  ) : (
                    filteredPermissions.map(code => (
                      <span key={code} className="admin-review-chip">
                        {code}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="admin-section admin-section--surface">
                <h3>Permission Overrides</h3>
                <p className="admin-hint">
                  Choose multiple permissions, then add the override. Added overrides are included in the user's
                  effective permissions immediately.
                </p>
                {(overrides[selectedUser.id] ?? []).map(override => (
                  <div key={override.permissionCode} className="admin-access-item">
                    <div className="admin-access-item__header">
                      <strong>{override.permissionCode}</strong>
                      <span className={`cfg-badge cfg-badge--${override.grantType === 'grant' ? 'active' : 'failed'}`}>
                        {override.grantType}
                      </span>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--danger"
                        onClick={() => removeOverride(selectedUser.id, override.permissionCode)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="cfg-table__meta">Reason: {override.reason}</div>
                    {override.expiresAt && <div className="cfg-table__meta">Expires: {formatDateTime(override.expiresAt)}</div>}
                  </div>
                ))}

                <div className="admin-override-form">
                  <div className="admin-override-permissions">
                    <strong>Select permissions</strong>
                    {selectablePermissions.map(permission => (
                      <label key={permission.id}>
                        <input
                          type="checkbox"
                          checked={overrideForm.permissionCodes.includes(permission.code)}
                          onChange={event =>
                            setOverrideForm(form => ({
                              ...form,
                              permissionCodes: event.target.checked
                                ? [...form.permissionCodes, permission.code]
                                : form.permissionCodes.filter(code => code !== permission.code),
                            }))
                          }
                        />
                        <span>
                          <b>{permission.code}</b>
                          <small>{permission.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <select
                    className="cfg-filter-select"
                    value={overrideForm.grantType}
                    onChange={event =>
                      setOverrideForm(form => ({
                        ...form,
                        grantType: event.target.value as 'grant' | 'revoke',
                      }))
                    }
                  >
                    <option value="grant">Grant override</option>
                    <option value="revoke">Revoke override</option>
                  </select>
                  <input
                    value={overrideForm.reason}
                    onChange={event => setOverrideForm(form => ({ ...form, reason: event.target.value }))}
                    placeholder="Reason (required)"
                  />
                  <input
                    type="date"
                    title="Expiry"
                    value={overrideForm.expiresAt}
                    onChange={event => setOverrideForm(form => ({ ...form, expiresAt: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="cfg-action-btn"
                    disabled={overrideForm.permissionCodes.length === 0 || !overrideForm.reason.trim()}
                    onClick={() => addOverride(selectedUser.id)}
                  >
                    Add Override
                  </button>
                </div>
              </div>

              <div className="admin-section admin-section--surface">
                <h3>Revoke Access</h3>
                <div className="admin-revoke-options">
                  <label>
                    <input
                      type="radio"
                      name="revoke-mode"
                      checked={revokeMode === 'selected'}
                      onChange={() => setRevokeMode('selected')}
                    />
                    Revoke selected permissions
                  </label>
                  <label>
                    <input type="radio" name="revoke-mode" checked={revokeMode === 'all'} onChange={() => setRevokeMode('all')} />
                    Revoke all access
                  </label>
                </div>
                {revokeMode === 'selected' && (
                  <div className="admin-override-permissions admin-override-permissions--compact">
                    {resolvePermissions(selectedUser).map(permissionCode => (
                      <label key={permissionCode}>
                        <input
                          type="checkbox"
                          checked={revokePermissions.includes(permissionCode)}
                          onChange={event =>
                            setRevokePermissions(current =>
                              event.target.checked
                                ? [...current, permissionCode]
                                : current.filter(code => code !== permissionCode),
                            )
                          }
                        />
                        <span>
                          <b>{permissionCode}</b>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="cfg-action-btn cfg-action-btn--danger"
                  disabled={revokeMode === 'selected' && revokePermissions.length === 0}
                  onClick={() => revokeAccess(selectedUser.id)}
                >
                  {revokeMode === 'all' ? 'Revoke All Access' : 'Revoke Selected Permissions'}
                </button>
              </div>

            </div>

            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {reinviteUser && (
        <div className="org-slideover-backdrop" onClick={() => setReinviteUserId(null)}>
          <div
            className="org-slideover org-slideover--narrow admin-reinvite-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Reinvite user"
            onClick={event => event.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Reinvite User</h2>
              <button
                type="button"
                className="org-slideover__close"
                onClick={() => setReinviteUserId(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>

            <div className="org-slideover__body">
              <div className="admin-section admin-section--compact">
                <h3>Employee</h3>
                <div className="admin-detail-grid admin-detail-grid--surface">
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Name</span>
                    <span className="admin-detail-row__value">
                      {reinviteUser.firstName} {reinviteUser.lastName}
                    </span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Email</span>
                    <span className="admin-detail-row__value">{reinviteUser.email}</span>
                  </div>
                  <div className="admin-detail-row">
                    <span className="admin-detail-row__label">Access View</span>
                    <span className="admin-detail-row__value">
                      Employee details are shown read-only until the new invite is accepted.
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-section admin-section--compact">
                <h3>Generated Invite Link</h3>
                <div className="admin-generated-link">
                  <Link2 size={14} />
                  <span>{generatedInviteLink}</span>
                </div>
              </div>
            </div>

            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setReinviteUserId(null)}>
                Cancel
              </button>
              <button type="button" className="org-btn org-btn--primary" onClick={sendReinvite}>
                <Send size={14} /> Send Invite
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const UserRow: React.FC<{
  user: AdminUser;
  roleName: string;
  isActionOpen: boolean;
  onRowClick: () => void;
  onToggleActionMenu: () => void;
  onCloseActionMenu: () => void;
  onAction: (action: ActionMenu) => void;
}> = ({ user, roleName, isActionOpen, onRowClick, onToggleActionMenu, onCloseActionMenu, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActionOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onCloseActionMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionOpen, onCloseActionMenu]);

  return (
    <tr className="admin-users-table__row" onClick={onRowClick}>
      <td>
        <div className="admin-user-cell">
          <span className="admin-user-avatar">{initials(user)}</span>
          <div>
            <div className="cfg-table__name">
              {user.firstName} {user.lastName}
            </div>
            <div className="cfg-table__meta">{user.email}</div>
          </div>
        </div>
      </td>
      <td>{user.position ?? '—'}</td>
      <td>{roleName}</td>
      <td>
        <span className={`cfg-badge cfg-badge--${accountBadgeClass(user.accountStatus)}`}>
          {ACCOUNT_STATUS_LABELS[user.accountStatus]}
        </span>
        {user.inviteStatus !== 'accepted' && (
          <div className="cfg-table__meta">Invite {INVITE_STATUS_LABELS[user.inviteStatus]}</div>
        )}
      </td>
      <td>{formatRelativeTime(user.lastLogin)}</td>
      <td onClick={event => event.stopPropagation()}>
        <div className="dept-table__actions" ref={menuRef}>
          <button type="button" className="dept-table__menu-btn" onClick={onToggleActionMenu} aria-label="User actions">
            <MoreHorizontal size={16} />
          </button>
          {isActionOpen && (
            <div className="dept-table__menu" role="menu">
              <button type="button" role="menuitem" onClick={() => onAction('block')}>
                <Ban size={13} /> Block
              </button>
              <button type="button" role="menuitem" onClick={() => onAction('reinvite')}>
                <Send size={13} /> Reinvite
              </button>
              <button type="button" role="menuitem" className="is-danger" onClick={() => onAction('revoke')}>
                <ShieldCheck size={13} /> Revoke
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
