import React, { useMemo, useRef, useState } from 'react';
import {
  Ban,
  Edit,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ConfigShellHeader } from '../../shared/components/config-shell-header/ConfigShellHeader';
import {
  ENABLED_MODULES,
  GRANTABLE_PERMISSIONS,
  permissionsByModule,
  formatRelativeTime,
} from './adminMockData';
import { useRoleStore } from '../../store/roleStore';
import { useActorAccess } from '../access/useActorAccess';

type DrawerMode = 'create' | 'edit' | null;

const groupedPermissions = permissionsByModule(ENABLED_MODULES);

export const RolesPermissionsPage: React.FC = () => {
  const { hasPermission } = useActorAccess();
  const canView = hasPermission('roles:view');
  const canCreate = hasPermission('roles:create');
  const canEdit = hasPermission('roles:edit');
  const canDelete = hasPermission('roles:delete');
  const roles = useRoleStore(state => state.roles);
  const createRole = useRoleStore(state => state.createRole);
  const updateRole = useRoleStore(state => state.updateRole);
  const deactivateStoredRole = useRoleStore(state => state.deactivateRole);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [permSearch, setPermSearch] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const summary = useMemo(
    () => ({
      total: roles.filter(role => role.active).length,
      system: roles.filter(role => role.type === 'system' && role.active).length,
      custom: roles.filter(role => role.type === 'custom' && role.active).length,
      usersAssigned: roles.reduce((sum, role) => sum + (role.active ? role.userCount : 0), 0),
    }),
    [roles],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return roles.filter(
      role => !q || role.name.toLowerCase().includes(q) || role.description.toLowerCase().includes(q),
    );
  }, [roles, search]);

  const selectedRole = selectedRoleId ? roles.find(role => role.id === selectedRoleId) ?? null : null;
  const editingRole = drawer === 'edit' ? selectedRole : null;
  const isProtectedRole = editingRole?.id === 'role-owner';
  const isSystemTemplateEdit = editingRole?.type === 'system' && !isProtectedRole;

  const openCreate = () => {
    setSelectedRoleId(null);
    setRoleForm({ name: '', description: '', permissionIds: [] });
    setPermSearch('');
    setDrawer('create');
  };

  const openEdit = (roleId: string) => {
    const role = roles.find(item => item.id === roleId);
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

  const closeDrawer = () => {
    setDrawer(null);
    setSelectedRoleId(null);
    setPermSearch('');
  };

  const togglePermission = (permissionId: string) => {
    setRoleForm(form => ({
      ...form,
      permissionIds: form.permissionIds.includes(permissionId)
        ? form.permissionIds.filter(id => id !== permissionId)
        : [...form.permissionIds, permissionId],
    }));
  };

  const toggleModuleAll = (permissionIds: string[], select: boolean) => {
    setRoleForm(form => {
      const without = form.permissionIds.filter(id => !permissionIds.includes(id));
      return {
        ...form,
        permissionIds: select ? [...without, ...permissionIds] : without,
      };
    });
  };

  const removeSelectedPermission = (permissionId: string) => {
    setRoleForm(form => ({
      ...form,
      permissionIds: form.permissionIds.filter(id => id !== permissionId),
    }));
  };

  const saveRole = () => {
    if (!roleForm.name.trim() || roleForm.permissionIds.length === 0) return;
    if (drawer === 'edit' && selectedRoleId) {
      updateRole(selectedRoleId, {
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      });
    } else {
      createRole({
        name: roleForm.name.trim(),
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      });
    }
    closeDrawer();
  };

  const deactivateRole = (roleId: string) => {
    const role = roles.find(item => item.id === roleId);
    if (!role || role.type === 'system') return;
    if (
      window.confirm(
        `Deactivate "${role.name}"? Existing users keep history, but this role cannot be assigned to new positions.`,
      )
    ) {
      deactivateStoredRole(roleId);
    }
  };

  const filteredModules = useMemo(() => {
    const q = permSearch.toLowerCase().trim();
    const entries: { module: string; perms: typeof GRANTABLE_PERMISSIONS }[] = [];
    for (const module of ENABLED_MODULES) {
      const perms = groupedPermissions[module];
      if (!perms?.length) continue;
      const matched = q
        ? perms.filter(
            permission =>
              permission.code.includes(q) ||
              permission.description.toLowerCase().includes(q) ||
              permission.module.toLowerCase().includes(q),
          )
        : perms;
      if (matched.length) entries.push({ module, perms: matched });
    }
    return entries;
  }, [permSearch]);

  const selectedPermissions = useMemo(
    () =>
      roleForm.permissionIds
        .map(id => GRANTABLE_PERMISSIONS.find(permission => permission.id === id))
        .filter((permission): permission is (typeof GRANTABLE_PERMISSIONS)[number] => Boolean(permission)),
    [roleForm.permissionIds],
  );

  const canSaveRole = roleForm.name.trim().length > 0 && roleForm.permissionIds.length > 0 && !isProtectedRole;

  if (!canView) {
    return (
      <div className="cfg-page">
        <div className="cfg-empty-state">
          <Lock size={24} />
          <h2>Access restricted</h2>
          <p>You do not have permission to view roles and permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cfg-page admin-roles-page">
      <ConfigShellHeader
        title="Roles & Permissions"
        icon={<ShieldCheck size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search roles...',
          label: 'Search roles',
        }}
        actions={
          canCreate ? (
            <button type="button" className="org-btn org-btn--primary" onClick={openCreate}>
              <Plus size={14} /> Create Role
            </button>
          ) : null
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

      <div className="cfg-page__body">
        <div className="cfg-table-wrap role-table-wrap">
          <table className="cfg-table role-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th>Type</th>
                <th>Permissions</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(role => (
                <RoleRow
                  key={role.id}
                  role={role}
                  isActionOpen={openActionId === role.id}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onToggleActionMenu={() => setOpenActionId(current => (current === role.id ? null : role.id))}
                  onCloseActionMenu={() => setOpenActionId(null)}
                  onEdit={() => openEdit(role.id)}
                  onDeactivate={() => deactivateRole(role.id)}
                />
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
            onClick={event => event.stopPropagation()}
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
                      onChange={event => setRoleForm(form => ({ ...form, name: event.target.value }))}
                      disabled={isProtectedRole}
                      placeholder="e.g. HR Approver"
                    />
                  </div>
                  <div className="org-form-field org-form-field--compact">
                    <label htmlFor="role-description">Description</label>
                    <input
                      id="role-description"
                      type="text"
                      value={roleForm.description}
                      onChange={event => setRoleForm(form => ({ ...form, description: event.target.value }))}
                      disabled={isProtectedRole}
                      placeholder="Short description"
                    />
                  </div>
                </div>
              </section>

              {isSystemTemplateEdit && (
                <p className="admin-hint admin-hint--info">
                  This is a default system role template. Any edits here will customize the permissions available for
                  this role in your workspace.
                </p>
              )}

              <section className="admin-section">
                <h3>Permissions</h3>
                <div className="admin-perm-toolbar">
                  <div className="cfg-search admin-perm-toolbar__search">
                    <Search size={14} />
                    <input
                      placeholder="Search permissions..."
                      value={permSearch}
                      onChange={event => setPermSearch(event.target.value)}
                      disabled={isProtectedRole}
                    />
                  </div>
                  <span className="admin-selected-count admin-selected-count--inline">
                    {roleForm.permissionIds.length} selected
                  </span>
                </div>

                {selectedPermissions.length > 0 && (
                  <div className="admin-selected-strip" aria-label="Selected permissions">
                    {selectedPermissions.map(permission => (
                      <span key={permission.id} className="admin-review-chip">
                        {permission.code}
                        {!isProtectedRole && (
                          <button
                            type="button"
                            className="admin-review-chip__remove"
                            aria-label={`Remove ${permission.code}`}
                            onClick={() => removeSelectedPermission(permission.id)}
                          >
                            <X size={10} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {filteredModules.map(({ module, perms }) => {
                  const visibleIds = perms.map(permission => permission.id);
                  const selectedInModule = perms.filter(permission => roleForm.permissionIds.includes(permission.id)).length;
                  return (
                    <div key={module} className="admin-perm-module">
                      <div className="admin-perm-module__header">
                        <span className="admin-perm-module__title">{module}</span>
                        <div className="admin-perm-module__actions">
                          <span className="admin-perm-module__count">
                            {selectedInModule}/{perms.length}
                          </span>
                          {!isProtectedRole && (
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
                        {perms.map(permission => (
                          <label key={permission.id} className={`admin-perm-item${isProtectedRole ? ' admin-perm-item--readonly' : ''}`}>
                            <input
                              type="checkbox"
                              checked={roleForm.permissionIds.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              disabled={isProtectedRole}
                            />
                            <div className="admin-perm-item__content">
                              <div className="admin-perm-item__row">
                                <span className="admin-perm-item__code">{permission.code}</span>
                                <span className="admin-perm-module-badge">{permission.module}</span>
                              </div>
                              <div className="admin-perm-item__desc">{permission.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredModules.length === 0 && <p className="cfg-table__meta">No permissions match your search.</p>}
              </section>

              {drawer === 'edit' && editingRole && editingRole.userCount > 0 && (
                <p className="admin-hint admin-hint--warning">
                  Editing this role affects {editingRole.userCount} assigned user
                  {editingRole.userCount !== 1 ? 's' : ''}.
                </p>
              )}
            </div>

            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeDrawer}>
                Cancel
              </button>
              <button type="button" className="org-btn org-btn--primary" disabled={!canSaveRole} onClick={saveRole}>
                {drawer === 'edit' ? 'Save Changes' : 'Create Role'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const RoleRow: React.FC<{
  role: ReturnType<typeof useRoleStore.getState>['roles'][number];
  isActionOpen: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onToggleActionMenu: () => void;
  onCloseActionMenu: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}> = ({ role, isActionOpen, canEdit, canDelete, onToggleActionMenu, onCloseActionMenu, onEdit, onDeactivate }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActionOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onCloseActionMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActionOpen, onCloseActionMenu]);

  const isTenantOwner = role.name === 'Tenant Owner';

  return (
    <tr className="role-table__row" style={{ opacity: role.active ? 1 : 0.55 }}>
      <td>
        <div className="cfg-table__name">
          {role.type === 'system' && <Lock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
          {role.name}
          {!role.active && (
            <span className="cfg-badge cfg-badge--inactive" style={{ marginLeft: 6 }}>
              Inactive
            </span>
          )}
        </div>
      </td>
      <td>
        <span className="cfg-table__meta">{role.description}</span>
      </td>
      <td>
        <span className={`cfg-badge cfg-badge--${role.type === 'system' ? 'open' : 'active'}`}>
          {role.type === 'system' ? 'System Template' : 'Custom'}
        </span>
      </td>
      <td>{role.permissionIds.length}</td>
      <td>{formatRelativeTime(role.updatedAt)}</td>
      <td>
        <div className="dept-table__actions" ref={menuRef}>
          <button type="button" className="dept-table__menu-btn" onClick={onToggleActionMenu} aria-label="Role actions">
            <MoreHorizontal size={16} />
          </button>
          {isActionOpen && (
            <div className="dept-table__menu" role="menu">
              {canEdit && !isTenantOwner && role.active && (
                <button type="button" role="menuitem" onClick={onEdit}>
                  <Edit size={13} /> Edit
                </button>
              )}
              {isTenantOwner && (
                <button type="button" role="menuitem" disabled>
                  <Lock size={13} /> Protected
                </button>
              )}
              {canDelete && role.type === 'custom' && role.active && (
                <button type="button" role="menuitem" className="is-danger" onClick={onDeactivate}>
                  <Ban size={13} /> Deactivate
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
