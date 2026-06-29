import React, { useMemo, useState } from 'react';
import {
  Plus, Search, Edit, Copy, Users, Eye, Ban, X, Lock, ShieldCheck,
} from 'lucide-react';
import { ConfigShellHeader } from '../../shared/components/config-shell-header/ConfigShellHeader';
import {
  MOCK_ROLES,
  MOCK_USERS,
  DEPARTMENTS,
  ACCESS_SCOPE_OPTIONS,
  ENABLED_MODULES,
  GRANTABLE_PERMISSIONS,
  permissionsByModule,
  formatRelativeTime,
  type AdminRole,
  type AccessScope,
} from './adminMockData';

type DrawerMode = 'create' | 'edit' | 'details' | null;

const groupedPermissions = permissionsByModule(ENABLED_MODULES);

export const RolesPermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<AdminRole[]>(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permSearch, setPermSearch] = useState('');

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const [assignForm, setAssignForm] = useState({
    userIds: [] as string[],
    accessScope: 'reporting_structure' as AccessScope,
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
  const isProtectedEdit = editingRole?.id === 'role-owner';

  const openCreate = () => {
    setSelectedRoleId(null);
    setRoleForm({ name: '', description: '', permissionIds: [] });
    setPermSearch('');
    setDrawer('create');
  };

  const openEdit = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.id === 'role-owner') return;
    setSelectedRoleId(roleId);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissionIds: [...role.permissionIds],
    });
    setPermSearch('');
    setDrawer('edit');
  };

  const openRoleDetails = (roleId: string) => {
    setSelectedRoleId(roleId);
    setDrawer('details');
  };

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedRoleId(null);
    setPermSearch('');
  };

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
    !isProtectedEdit;

  const usersForRole = selectedRoleId
    ? MOCK_USERS.filter(u => u.roleIds.includes(selectedRoleId))
    : [];

  const assignableUsers = MOCK_USERS.filter(u => u.accountStatus !== 'disabled');

  return (
    <div className="cfg-page">
      <ConfigShellHeader
        title="Roles & Permissions"
        icon={<ShieldCheck size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search roles...',
          label: 'Search roles'
        }}
        actions={
        <button type="button" className="org-btn org-btn--primary" onClick={openCreate}>
          <Plus size={14} /> Create Role
        </button>
        }
      />

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
                <tr
                  key={r.id}
                  className="admin-role-row"
                  style={{ opacity: r.active ? 1 : 0.55 }}
                  tabIndex={0}
                  aria-label={`View details for ${r.name}`}
                  onClick={() => openRoleDetails(r.id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openRoleDetails(r.id);
                    }
                  }}
                >
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
                      disabled={isProtectedEdit}
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
                      disabled={isProtectedEdit}
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
                      disabled={isProtectedEdit}
                    />
                  </div>
                  <span className="admin-selected-count admin-selected-count--inline">
                    {roleForm.permissionIds.length} selected
                  </span>
                </div>

                {selectedPermissions.length > 0 && (
                  <div className="admin-selected-strip" aria-label="Selected permissions">
                    {selectedPermissions.map(p => (
                      <span key={p.id} className="admin-review-chip">
                        {p.code}
                        {!isProtectedEdit && (
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
                          {!isProtectedEdit && (
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
                              disabled={isProtectedEdit}
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

      {legacyAssignOpen && selectedRole && (
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
                <input value={selectedRole?.name ?? ''} readOnly />
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
                {assignForm.accessScope === 'selected_departments' && (
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

      {drawer === 'details' && selectedRole && (
        <div className="org-slideover-backdrop" onClick={closeDrawer}>
          <div
            className="org-slideover org-slideover--role-details"
            role="dialog"
            aria-modal="true"
            aria-label={`Role details for ${selectedRole.name}`}
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <div>
                <h2>{selectedRole.name}</h2>
                <div className="admin-role-details__badges">
                  <span className={`cfg-badge cfg-badge--${selectedRole.type === 'system' ? 'open' : 'active'}`}>
                    {selectedRole.type === 'system' ? 'System' : 'Custom'}
                  </span>
                  <span className={`cfg-badge cfg-badge--${selectedRole.active ? 'active' : 'inactive'}`}>
                    {selectedRole.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button type="button" className="org-slideover__close" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body admin-role-details">
              <section className="admin-role-details__summary">
                <div className="admin-role-details__description">
                  <span>Description</span>
                  <p>{selectedRole.description || 'No description provided.'}</p>
                </div>
                <div className="admin-role-details__stat"><strong>{selectedRole.permissionIds.length}</strong><span>Permissions</span></div>
                <div className="admin-role-details__stat"><strong>{selectedRole.userCount}</strong><span>Assigned users</span></div>
                <div className="admin-role-details__stat"><strong>{formatRelativeTime(selectedRole.updatedAt)}</strong><span>Last updated</span></div>
              </section>
              <section className="admin-section">
                <h3>Permissions</h3>
                {ENABLED_MODULES.map(module => {
                  const permissions = (groupedPermissions[module] ?? []).filter(permission => selectedRole.permissionIds.includes(permission.id));
                  if (permissions.length === 0) return null;
                  return (
                    <div key={module} className="admin-perm-module admin-perm-module--readonly">
                      <div className="admin-perm-module__header">
                        <span className="admin-perm-module__title">{module}</span>
                        <span className="admin-perm-module__count">{permissions.length}</span>
                      </div>
                      <div className="admin-perm-list">
                        {permissions.map(permission => (
                          <div key={permission.id} className="admin-role-details__permission">
                            <span className="admin-perm-item__code">{permission.code}</span>
                            <span className="admin-perm-item__desc">{permission.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>Close</button>
              {canDelete && selectedRole.type === 'custom' && selectedRole.active && (
                <button type="button" className="org-btn admin-role-details__deactivate" onClick={() => deactivateRole(selectedRole.id)}>
                  <Ban size={14} /> Deactivate
                </button>
              )}
              {canEdit && selectedRole.id !== 'role-owner' && selectedRole.active && (
                <button type="button" className="org-btn org-btn--primary" onClick={() => openEdit(selectedRole.id)}>
                  <Edit size={14} /> Edit Role
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
