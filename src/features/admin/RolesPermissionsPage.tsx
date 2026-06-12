import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, Edit, Copy, Users, Eye, Ban, X, Lock,
} from 'lucide-react';
import {
  MOCK_ROLES,
  MOCK_USERS,
  DEPARTMENTS,
  ACCESS_SCOPE_OPTIONS,
  ENABLED_MODULES,
  UNIVERSAL_PERMISSIONS,
  GRANTABLE_PERMISSIONS,
  permissionsByModule,
  formatRelativeTime,
  type AdminRole,
  type AccessScope,
} from './adminMockData';

type DrawerMode = 'create' | 'edit' | 'assign' | 'view-users' | null;

const groupedPermissions = permissionsByModule(ENABLED_MODULES);

export const RolesPermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<AdminRole[]>(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permSearch, setPermSearch] = useState('');
  const [includedPermsOpen, setIncludedPermsOpen] = useState(false);
  const includedPermsRef = useRef<HTMLDivElement>(null);

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const [assignForm, setAssignForm] = useState({
    userIds: [] as string[],
    accessScope: 'reporting_tree' as AccessScope,
    departmentId: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    expiresAt: '',
    reason: '',
  });

  const summary = useMemo(() => ({
    total: roles.filter(r => r.active).length,
    system: roles.filter(r => r.type === 'system' && r.active).length,
    custom: roles.filter(r => r.type === 'custom' && r.active).length,
    usersAssigned: roles.reduce((sum, r) => sum + (r.active ? r.userCount : 0), 0),
  }), [roles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roles.filter(r => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [roles, search]);

  const selectedRole = selectedRoleId ? roles.find(r => r.id === selectedRoleId) : null;
  const editingRole = drawer === 'edit' ? selectedRole : null;
  const isSystemEdit = editingRole?.type === 'system';

  const openCreate = () => {
    setSelectedRoleId(null);
    setRoleForm({ name: '', description: '', permissionIds: [] });
    setPermSearch('');
    setIncludedPermsOpen(false);
    setDrawer('create');
  };

  const openEdit = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.type === 'system') return;
    setSelectedRoleId(roleId);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissionIds: [...role.permissionIds],
    });
    setPermSearch('');
    setIncludedPermsOpen(false);
    setDrawer('edit');
  };

  const openClone = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    setSelectedRoleId(null);
    setRoleForm({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissionIds: [...role.permissionIds],
    });
    setPermSearch('');
    setIncludedPermsOpen(false);
    setDrawer('create');
  };

  const openAssign = (roleId: string) => {
    setSelectedRoleId(roleId);
    setAssignForm({
      userIds: [],
      accessScope: 'reporting_tree',
      departmentId: '',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      expiresAt: '',
      reason: '',
    });
    setDrawer('assign');
  };

  const openViewUsers = (roleId: string) => {
    setSelectedRoleId(roleId);
    setDrawer('view-users');
  };

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedRoleId(null);
    setPermSearch('');
    setIncludedPermsOpen(false);
  };

  useEffect(() => {
    if (!includedPermsOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (includedPermsRef.current && !includedPermsRef.current.contains(event.target as Node)) {
        setIncludedPermsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [includedPermsOpen]);

  const togglePermission = (permId: string) => {
    setRoleForm(f => ({
      ...f,
      permissionIds: f.permissionIds.includes(permId)
        ? f.permissionIds.filter(id => id !== permId)
        : [...f.permissionIds, permId],
    }));
  };

  const toggleModuleAll = (permIds: string[], select: boolean) => {
    setRoleForm(f => {
      const without = f.permissionIds.filter(id => !permIds.includes(id));
      return {
        ...f,
        permissionIds: select ? [...without, ...permIds] : without,
      };
    });
  };

  const removeSelectedPermission = (permId: string) => {
    setRoleForm(f => ({
      ...f,
      permissionIds: f.permissionIds.filter(id => id !== permId),
    }));
  };

  const saveRole = () => {
    if (!roleForm.name.trim() || roleForm.permissionIds.length === 0) return;
    if (drawer === 'edit' && selectedRoleId) {
      setRoles(prev =>
        prev.map(r =>
          r.id === selectedRoleId
            ? {
                ...r,
                name: roleForm.name.trim(),
                description: roleForm.description,
                permissionIds: roleForm.permissionIds,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    } else {
      const newRole: AdminRole = {
        id: `role-${Date.now()}`,
        name: roleForm.name.trim(),
        description: roleForm.description,
        type: 'custom',
        permissionIds: roleForm.permissionIds,
        userCount: 0,
        updatedAt: new Date().toISOString(),
        active: true,
      };
      setRoles(prev => [newRole, ...prev]);
    }
    closeDrawer();
  };

  const deactivateRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.type === 'system') return;
    if (window.confirm(`Deactivate "${role.name}"? Users keep assignments but the role cannot be assigned to new users.`)) {
      setRoles(prev => prev.map(r => (r.id === roleId ? { ...r, active: false } : r)));
    }
  };

  const handleAssign = () => {
    if (!selectedRoleId || assignForm.userIds.length === 0) return;
    setRoles(prev =>
      prev.map(r =>
        r.id === selectedRoleId
          ? { ...r, userCount: r.userCount + assignForm.userIds.length }
          : r
      )
    );
    closeDrawer();
  };

  const toggleAssignUser = (userId: string) => {
    setAssignForm(f => ({
      ...f,
      userIds: f.userIds.includes(userId)
        ? f.userIds.filter(id => id !== userId)
        : [...f.userIds, userId],
    }));
  };

  const filteredModules = useMemo(() => {
    const q = permSearch.toLowerCase().trim();
    const entries: { module: string; perms: typeof GRANTABLE_PERMISSIONS }[] = [];
    for (const mod of ENABLED_MODULES) {
      const perms = groupedPermissions[mod];
      if (!perms?.length) continue;
      const matched = q
        ? perms.filter(
            p =>
              p.code.includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.module.toLowerCase().includes(q)
          )
        : perms;
      if (matched.length) entries.push({ module: mod, perms: matched });
    }
    return entries;
  }, [permSearch]);

  const selectedPermissions = useMemo(
    () =>
      roleForm.permissionIds
        .map(id => GRANTABLE_PERMISSIONS.find(p => p.id === id))
        .filter((p): p is (typeof GRANTABLE_PERMISSIONS)[number] => Boolean(p)),
    [roleForm.permissionIds]
  );

  const canSaveRole =
    roleForm.name.trim().length > 0 &&
    roleForm.permissionIds.length > 0 &&
    !isSystemEdit;

  const usersForRole = selectedRoleId
    ? MOCK_USERS.filter(u => u.roleIds.includes(selectedRoleId))
    : [];

  const assignableUsers = MOCK_USERS.filter(u => u.accountStatus !== 'disabled');

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Roles &amp; Permissions</h1>
          <p className="cfg-page__subtitle">
            Create tenant security roles and assign module-filtered permissions. Roles are tenant-defined permission bundles.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreate}>
          <Plus size={14} /> Create Role
        </button>
      </div>

      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Total Roles</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">System Roles</span>
          <strong>{summary.system}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Custom Roles</span>
          <strong>{summary.custom}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Users Assigned</span>
          <strong>{summary.usersAssigned}</strong>
        </div>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search roles…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th>Type</th>
                <th>Permissions</th>
                <th>Users</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ opacity: r.active ? 1 : 0.55 }}>
                  <td>
                    <div className="cfg-table__name">
                      {r.type === 'system' && <Lock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                      {r.name}
                      {!r.active && <span className="cfg-badge cfg-badge--inactive" style={{ marginLeft: 6 }}>Inactive</span>}
                    </div>
                  </td>
                  <td><span className="cfg-table__meta">{r.description}</span></td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${r.type === 'system' ? 'open' : 'active'}`}>
                      {r.type === 'system' ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td>{r.permissionIds.length}</td>
                  <td>{r.userCount}</td>
                  <td>{formatRelativeTime(r.updatedAt)}</td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      {r.type === 'custom' && r.active && (
                        <button type="button" className="cfg-action-btn" onClick={() => openEdit(r.id)}>
                          <Edit size={13} /> Edit
                        </button>
                      )}
                      <button type="button" className="cfg-action-btn" onClick={() => openClone(r.id)}>
                        <Copy size={13} /> Clone
                      </button>
                      {r.active && (
                        <button type="button" className="cfg-action-btn" onClick={() => openAssign(r.id)}>
                          <Users size={13} /> Assign
                        </button>
                      )}
                      <button type="button" className="cfg-action-btn" onClick={() => openViewUsers(r.id)}>
                        <Eye size={13} /> View Users
                      </button>
                      {r.type === 'custom' && r.active && (
                        <button type="button" className="cfg-action-btn cfg-action-btn--danger" onClick={() => deactivateRole(r.id)}>
                          <Ban size={13} /> Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(drawer === 'create' || drawer === 'edit') && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--role-form"
            role="dialog"
            aria-modal="true"
            aria-label={drawer === 'edit' ? 'Edit role' : 'Create role'}
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>{drawer === 'edit' ? 'Edit Role' : 'Create Role'}</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="org-slideover__body admin-role-form">
              <section className="admin-section admin-section--compact">
                <h3>Basic Info</h3>
                <div className="admin-role-basic-row">
                  <div className="org-form-field org-form-field--compact">
                    <label htmlFor="role-name">Role Name</label>
                    <input
                      id="role-name"
                      type="text"
                      required
                      value={roleForm.name}
                      onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                      disabled={isSystemEdit}
                      placeholder="e.g. People Administrator"
                    />
                  </div>
                  <div className="org-form-field org-form-field--compact">
                    <label htmlFor="role-description">Description</label>
                    <input
                      id="role-description"
                      type="text"
                      value={roleForm.description}
                      onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                      disabled={isSystemEdit}
                      placeholder="Short description"
                    />
                  </div>
                </div>
              </section>

              <section className="admin-section">
                <h3>Permissions</h3>
                <div className="admin-perm-toolbar">
                  <div className="cfg-search admin-perm-toolbar__search">
                    <Search size={14} />
                    <input
                      placeholder="Search permissions…"
                      value={permSearch}
                      onChange={e => setPermSearch(e.target.value)}
                      disabled={isSystemEdit}
                    />
                  </div>
                  <span className="admin-selected-count admin-selected-count--inline">
                    {roleForm.permissionIds.length} selected
                  </span>
                </div>

                <div className="admin-universal-hint" ref={includedPermsRef}>
                  <span>
                    Basic self-service permissions are included automatically for every active employee.
                  </span>
                  <button
                    type="button"
                    className="admin-universal-hint__btn"
                    onClick={() => setIncludedPermsOpen(open => !open)}
                    aria-expanded={includedPermsOpen}
                  >
                    View included permissions
                  </button>
                  {includedPermsOpen && (
                    <div className="admin-included-popover" role="dialog" aria-label="Included permissions">
                      <ul className="admin-included-popover__list">
                        {UNIVERSAL_PERMISSIONS.map(p => (
                          <li key={p.id} className="admin-included-popover__item">
                            <span className="admin-included-popover__code">{p.code}</span>
                            <span className="admin-included-popover__desc">{p.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedPermissions.length > 0 && (
                  <div className="admin-selected-strip" aria-label="Selected permissions">
                    {selectedPermissions.map(p => (
                      <span key={p.id} className="admin-review-chip">
                        {p.code}
                        {!isSystemEdit && (
                          <button
                            type="button"
                            className="admin-review-chip__remove"
                            aria-label={`Remove ${p.code}`}
                            onClick={() => removeSelectedPermission(p.id)}
                          >
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {filteredModules.map(({ module: mod, perms }) => {
                  const visibleIds = perms.map(p => p.id);
                  const selectedInModule = perms.filter(p => roleForm.permissionIds.includes(p.id)).length;
                  return (
                    <div key={mod} className="admin-perm-module">
                      <div className="admin-perm-module__header">
                        <span className="admin-perm-module__title">{mod}</span>
                        <div className="admin-perm-module__actions">
                          <span className="admin-perm-module__count">{selectedInModule}/{perms.length}</span>
                          {!isSystemEdit && (
                            <>
                              <button
                                type="button"
                                className="cfg-action-btn"
                                onClick={() => toggleModuleAll(visibleIds, true)}
                              >
                                Select all
                              </button>
                              <button
                                type="button"
                                className="cfg-action-btn"
                                onClick={() => toggleModuleAll(visibleIds, false)}
                                disabled={selectedInModule === 0}
                              >
                                Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="admin-perm-list">
                        {perms.map(p => (
                          <label key={p.id} className="admin-perm-item">
                            <input
                              type="checkbox"
                              checked={roleForm.permissionIds.includes(p.id)}
                              onChange={() => togglePermission(p.id)}
                              disabled={isSystemEdit}
                            />
                            <div className="admin-perm-item__content">
                              <div className="admin-perm-item__row">
                                <span className="admin-perm-item__code">{p.code}</span>
                                <span className="admin-perm-module-badge">{p.module}</span>
                              </div>
                              <div className="admin-perm-item__desc">{p.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredModules.length === 0 && (
                  <p className="cfg-table__meta">No permissions match your search.</p>
                )}
              </section>

              {drawer === 'edit' && editingRole && editingRole.userCount > 0 && (
                <p className="admin-hint admin-hint--warning">
                  Editing this role affects {editingRole.userCount} user{editingRole.userCount !== 1 ? 's' : ''} who currently have it assigned. Changes propagate on next token refresh.
                </p>
              )}
            </div>

            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>
                Cancel
              </button>
              <button
                type="button"
                className="org-btn org-btn--primary"
                disabled={!canSaveRole}
                onClick={saveRole}
              >
                {drawer === 'edit' ? 'Save Changes' : 'Create Role'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {drawer === 'assign' && selectedRole && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--narrow"
            role="dialog"
            aria-modal="true"
            aria-label="Assign role"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Assign Role</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="org-form-field">
                <label>Role</label>
                <input value={selectedRole.name} readOnly />
              </div>

              <div className="admin-section">
                <h3>Select Users</h3>
                <div className="admin-perm-list">
                  {assignableUsers.map(u => (
                    <label key={u.id} className="admin-perm-item">
                      <input
                        type="checkbox"
                        checked={assignForm.userIds.includes(u.id)}
                        onChange={() => toggleAssignUser(u.id)}
                      />
                      <div>
                        <div className="admin-perm-item__code">{u.firstName} {u.lastName}</div>
                        <div className="admin-perm-item__desc">{u.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
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
                      className={`admin-segmented__btn${assignForm.accessScope === opt.value ? ' admin-segmented__btn--active' : ''}`}
                      onClick={() => setAssignForm(f => ({ ...f, accessScope: opt.value }))}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {assignForm.accessScope === 'department' && (
                  <div className="org-form-field">
                    <label>Department</label>
                    <select
                      value={assignForm.departmentId}
                      onChange={e => setAssignForm(f => ({ ...f, departmentId: e.target.value }))}
                    >
                      <option value="">Select department…</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="org-form-field">
                <label>Effective From</label>
                <input
                  type="date"
                  value={assignForm.effectiveFrom}
                  onChange={e => setAssignForm(f => ({ ...f, effectiveFrom: e.target.value }))}
                />
              </div>
              <div className="org-form-field">
                <label>Expires At (optional)</label>
                <input
                  type="date"
                  value={assignForm.expiresAt}
                  onChange={e => setAssignForm(f => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
              <div className="org-form-field">
                <label>Reason (optional)</label>
                <input
                  value={assignForm.reason}
                  onChange={e => setAssignForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Why is this assignment being made?"
                />
              </div>
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>Cancel</button>
              <button
                type="button"
                className="org-btn org-btn--primary"
                disabled={assignForm.userIds.length === 0}
                onClick={handleAssign}
              >
                Assign Role
              </button>
            </footer>
          </div>
        </div>
      )}

      {drawer === 'view-users' && selectedRole && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--narrow"
            role="dialog"
            aria-modal="true"
            aria-label="View users"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Users — {selectedRole.name}</h2>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              {usersForRole.length === 0 ? (
                <p className="cfg-table__meta">No users assigned to this role</p>
              ) : (
                usersForRole.map(u => (
                  <div key={u.id} className="admin-access-item">
                    <div className="admin-perm-item__code">{u.firstName} {u.lastName}</div>
                    <div className="admin-perm-item__desc">{u.email}</div>
                    <span className={`cfg-badge cfg-badge--${u.accountStatus === 'active' ? 'active' : u.accountStatus}`}>
                      {u.accountStatus === 'no_login_access' ? 'No Login Access' : u.accountStatus}
                    </span>
                  </div>
                ))
              )}
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
