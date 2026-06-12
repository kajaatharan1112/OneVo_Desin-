import React, { useMemo, useState } from 'react';
import {
  Plus, Search, Edit, Copy, Users, Eye, Ban, X, ChevronRight, Lock,
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
type FormStep = 'basic' | 'permissions' | 'review';

const groupedPermissions = permissionsByModule(ENABLED_MODULES);

export const RolesPermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<AdminRole[]>(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [formStep, setFormStep] = useState<FormStep>('basic');
  const [permSearch, setPermSearch] = useState('');

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
    setFormStep('basic');
    setPermSearch('');
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
    setFormStep('basic');
    setPermSearch('');
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
    setFormStep('basic');
    setPermSearch('');
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
    setFormStep('basic');
  };

  const togglePermission = (permId: string) => {
    setRoleForm(f => ({
      ...f,
      permissionIds: f.permissionIds.includes(permId)
        ? f.permissionIds.filter(id => id !== permId)
        : [...f.permissionIds, permId],
    }));
  };

  const toggleModuleAll = (module: string, select: boolean) => {
    const modulePermIds = groupedPermissions[module]?.map(p => p.id) ?? [];
    setRoleForm(f => {
      const without = f.permissionIds.filter(id => !modulePermIds.includes(id));
      return {
        ...f,
        permissionIds: select ? [...without, ...modulePermIds] : without,
      };
    });
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
    const q = permSearch.toLowerCase();
    if (!q) return groupedPermissions;
    const result: Record<string, typeof GRANTABLE_PERMISSIONS> = {};
    for (const [mod, perms] of Object.entries(groupedPermissions)) {
      const matched = perms.filter(
        p => p.code.includes(q) || p.description.toLowerCase().includes(q)
      );
      if (matched.length) result[mod] = matched;
    }
    return result;
  }, [permSearch]);

  const usersForRole = selectedRoleId
    ? MOCK_USERS.filter(u => u.roleIds.includes(selectedRoleId))
    : [];

  const assignableUsers = MOCK_USERS.filter(u => u.status !== 'disabled');

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
            className="org-slideover org-slideover--wide"
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

            <div className="admin-role-form-steps">
              {(['basic', 'permissions', 'review'] as FormStep[]).map(step => (
                <button
                  key={step}
                  type="button"
                  className={`admin-role-form-step${formStep === step ? ' admin-role-form-step--active' : ''}${(['basic', 'permissions', 'review'].indexOf(formStep) > ['basic', 'permissions', 'review'].indexOf(step)) ? ' admin-role-form-step--done' : ''}`}
                  onClick={() => setFormStep(step)}
                >
                  {step === 'basic' ? '1. Basic Info' : step === 'permissions' ? '2. Permissions' : '3. Review'}
                </button>
              ))}
            </div>

            <div className="org-slideover__body">
              {formStep === 'basic' && (
                <>
                  <div className="org-form-field">
                    <label>Role Name</label>
                    <input
                      value={roleForm.name}
                      onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                      disabled={isSystemEdit}
                    />
                  </div>
                  <div className="org-form-field">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={roleForm.description}
                      onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                      disabled={isSystemEdit}
                    />
                  </div>
                  <div>
                    <span className={`cfg-badge cfg-badge--${drawer === 'edit' && editingRole?.type === 'system' ? 'open' : 'active'}`}>
                      {drawer === 'edit' && editingRole?.type === 'system' ? 'System' : 'Custom'}
                    </span>
                  </div>
                </>
              )}

              {formStep === 'permissions' && (
                <>
                  <div className="admin-section">
                    <h3>Universal Auto-Grants (read-only)</h3>
                    <div className="admin-perm-list">
                      {UNIVERSAL_PERMISSIONS.map(p => (
                        <div key={p.id} className="admin-perm-item admin-perm-item--readonly">
                          <Lock size={12} />
                          <div>
                            <div className="admin-perm-item__code">{p.code}</div>
                            <div className="admin-perm-item__desc">{p.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-perm-search cfg-search">
                    <Search size={14} />
                    <input
                      placeholder="Search permissions…"
                      value={permSearch}
                      onChange={e => setPermSearch(e.target.value)}
                    />
                  </div>

                  <p className="admin-selected-count">
                    {roleForm.permissionIds.length} permission{roleForm.permissionIds.length !== 1 ? 's' : ''} selected
                  </p>

                  {Object.entries(filteredModules).map(([mod, perms]) => {
                    const selectedInModule = perms.filter(p => roleForm.permissionIds.includes(p.id)).length;
                    const allSelected = selectedInModule === perms.length;
                    return (
                      <div key={mod} className="admin-perm-module">
                        <div className="admin-perm-module__header">
                          <span className="admin-perm-module__title">{mod}</span>
                          <span className="admin-perm-module__count">
                            {selectedInModule}/{perms.length}
                            {!isSystemEdit && (
                              <button
                                type="button"
                                className="cfg-action-btn"
                                style={{ marginLeft: 8 }}
                                onClick={() => toggleModuleAll(mod, !allSelected)}
                              >
                                {allSelected ? 'Deselect all' : 'Select all'}
                              </button>
                            )}
                          </span>
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
                              <div>
                                <div className="admin-perm-item__code">{p.code}</div>
                                <div className="admin-perm-item__desc">{p.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {formStep === 'review' && (
                <>
                  <div className="admin-section">
                    <h3>Role Summary</h3>
                    <div className="admin-detail-grid">
                      <div className="admin-detail-row">
                        <span className="admin-detail-row__label">Name</span>
                        <span className="admin-detail-row__value">{roleForm.name || '—'}</span>
                      </div>
                      <div className="admin-detail-row">
                        <span className="admin-detail-row__label">Description</span>
                        <span className="admin-detail-row__value">{roleForm.description || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-section">
                    <h3>Permission Summary</h3>
                    <div className="admin-review-list">
                      {roleForm.permissionIds.map(pid => {
                        const p = GRANTABLE_PERMISSIONS.find(x => x.id === pid);
                        return p ? <span key={pid} className="admin-review-chip">{p.code}</span> : null;
                      })}
                    </div>
                  </div>
                  {drawer === 'edit' && editingRole && editingRole.userCount > 0 && (
                    <p className="admin-hint admin-hint--warning">
                      Editing this role affects {editingRole.userCount} user{editingRole.userCount !== 1 ? 's' : ''} who currently have it assigned. Changes propagate on next token refresh.
                    </p>
                  )}
                </>
              )}
            </div>

            <footer className="org-slideover__footer">
              {formStep !== 'basic' && (
                <button
                  type="button"
                  className="org-btn org-btn--secondary"
                  onClick={() => setFormStep(formStep === 'review' ? 'permissions' : 'basic')}
                >
                  Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {formStep !== 'review' ? (
                <button
                  type="button"
                  className="org-btn org-btn--primary"
                  disabled={formStep === 'basic' && !roleForm.name.trim()}
                  onClick={() => setFormStep(formStep === 'basic' ? 'permissions' : 'review')}
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="org-btn org-btn--primary"
                  disabled={!roleForm.name.trim() || roleForm.permissionIds.length === 0 || isSystemEdit}
                  onClick={saveRole}
                >
                  {drawer === 'edit' ? 'Save Changes' : 'Create Role'}
                </button>
              )}
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
                    <span className={`cfg-badge cfg-badge--${u.status === 'active' ? 'active' : u.status}`}>
                      {u.status}
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
