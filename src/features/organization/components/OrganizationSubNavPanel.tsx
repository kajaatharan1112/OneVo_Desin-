import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Building,
  ChevronDown,
  PanelLeftClose,
  Plus,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  ENABLED_MODULES,
  GRANTABLE_PERMISSIONS,
  MOCK_ROLES,
  permissionsByModule,
  type AdminRole
} from '../../admin/adminMockData';

interface OrganizationSubNavPanelProps {
  activeId: string;
  onSelect: (id: string) => void;
  onCollapse: () => void;
}

const baseGroupedPermissions = permissionsByModule(ENABLED_MODULES);

export const OrganizationSubNavPanel: React.FC<OrganizationSubNavPanelProps> = ({
  activeId,
  onSelect,
  onCollapse
}) => {
  const [roles, setRoles] = useState<AdminRole[]>(MOCK_ROLES);
  const [rolesOpen, setRolesOpen] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[]
  });

  const activeRoles = useMemo(() => roles.filter(role => role.active), [roles]);
  const selectedRole = selectedRoleId ? roles.find(role => role.id === selectedRoleId) ?? null : null;

  const selectedPermissions = useMemo(
    () =>
      selectedRole
        ? selectedRole.permissionIds
            .map(id => GRANTABLE_PERMISSIONS.find(permission => permission.id === id))
            .filter((permission): permission is (typeof GRANTABLE_PERMISSIONS)[number] => Boolean(permission))
        : [],
    [selectedRole]
  );

  const selectedPermissionsByModule = useMemo(() => {
    const grouped: Record<string, typeof GRANTABLE_PERMISSIONS> = {};
    selectedPermissions.forEach(permission => {
      if (!grouped[permission.module]) grouped[permission.module] = [];
      grouped[permission.module].push(permission);
    });
    return grouped;
  }, [selectedPermissions]);

  const togglePermission = (permissionId: string) => {
    setRoleForm(form => ({
      ...form,
      permissionIds: form.permissionIds.includes(permissionId)
        ? form.permissionIds.filter(id => id !== permissionId)
        : [...form.permissionIds, permissionId]
    }));
  };

  const openCreate = () => {
    setRoleForm({ name: '', description: '', permissionIds: [] });
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setRoleForm({ name: '', description: '', permissionIds: [] });
  };

  const createRole = () => {
    if (!roleForm.name.trim() || roleForm.permissionIds.length === 0) return;
    const next: AdminRole = {
      id: `role-org-${Date.now()}`,
      name: roleForm.name.trim(),
      description: roleForm.description.trim() || 'Custom organization role',
      type: 'custom',
      permissionIds: [...roleForm.permissionIds],
      userCount: 0,
      updatedAt: new Date().toISOString(),
      active: true
    };
    setRoles(current => [next, ...current]);
    setRolesOpen(true);
    setSelectedRoleId(next.id);
    closeCreate();
  };

  const canCreate = roleForm.name.trim().length > 0 && roleForm.permissionIds.length > 0;

  return (
    <>
      <div className="sub-nav-panel org-sub-nav">
        <div className="sub-nav-panel__toolbar">
          <p className="sub-nav-panel__header">Organization</p>
          <button
            type="button"
            className="sub-nav-panel__collapse"
            onClick={onCollapse}
            aria-label="Collapse section menu"
            title="Collapse section menu"
          >
            <PanelLeftClose size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="sub-nav-section">
          <button
            type="button"
            className={`sub-nav-panel__item${activeId === 'departments' ? ' sub-nav-panel__item--active' : ''}`}
            onClick={() => onSelect('departments')}
            aria-current={activeId === 'departments' ? 'page' : undefined}
          >
            <span className="sub-nav-panel__item-icon"><Building size={13} /></span>
            <span className="sub-nav-panel__item-label">Departments</span>
          </button>
          <button
            type="button"
            className={`sub-nav-panel__item${activeId === 'positions' ? ' sub-nav-panel__item--active' : ''}`}
            onClick={() => onSelect('positions')}
            aria-current={activeId === 'positions' ? 'page' : undefined}
          >
            <span className="sub-nav-panel__item-icon"><Briefcase size={13} /></span>
            <span className="sub-nav-panel__item-label">Positions</span>
          </button>
          <button
            type="button"
            className={`sub-nav-panel__item${activeId === 'roles-permissions' ? ' sub-nav-panel__item--active' : ''}`}
            onClick={() => onSelect('roles-permissions')}
            aria-current={activeId === 'roles-permissions' ? 'page' : undefined}
          >
            <span className="sub-nav-panel__item-icon"><ShieldCheck size={13} /></span>
            <span className="sub-nav-panel__item-label">Roles and Permission</span>
          </button>

          <div className="org-sub-nav__roles-section">
            <div className={`sub-nav-panel__item org-sub-nav__roles-row${rolesOpen ? ' org-sub-nav__roles-row--open' : ''}`}>
              <button
                type="button"
                className="org-sub-nav__roles-main"
                onClick={() => setRolesOpen(open => !open)}
                aria-expanded={rolesOpen}
              >
                <span className="sub-nav-panel__item-icon"><ShieldCheck size={13} /></span>
                <span className="sub-nav-panel__item-label">Roles &amp; Permissions</span>
              </button>
              <div className="org-sub-nav__roles-actions">
                <button
                  type="button"
                  className="org-sub-nav__roles-action"
                  onClick={openCreate}
                  aria-label="Create role"
                  title="Create role"
                >
                  <Plus size={13} />
                </button>
                <button
                  type="button"
                  className="org-sub-nav__roles-action"
                  onClick={() => setRolesOpen(open => !open)}
                  aria-label={rolesOpen ? 'Collapse roles' : 'Expand roles'}
                  aria-expanded={rolesOpen}
                >
                  <ChevronDown size={13} className={rolesOpen ? 'org-sub-nav__chevron--open' : ''} />
                </button>
              </div>
            </div>

            {rolesOpen && (
              <div className="org-sub-nav__role-list">
                {activeRoles.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    className={`sub-nav-panel__item org-sub-nav__role-row${selectedRoleId === role.id ? ' sub-nav-panel__item--active' : ''}`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <span className="sub-nav-panel__item-label">{role.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRole && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setSelectedRoleId(null)}>
          <div
            className="schedules-cfg-modal org-role-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedRole.name} role details`}
            onClick={event => event.stopPropagation()}
          >
            <header className="schedules-cfg-modal__header">
              <div>
                <h2>{selectedRole.name}</h2>
                <p className="org-role-modal__subtitle">{selectedRole.description}</p>
              </div>
              <button
                type="button"
                className="org-slideover__close"
                onClick={() => setSelectedRoleId(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>
            <div className="schedules-cfg-modal__body">
              <dl className="org-role-modal__summary">
                <div><dt>Type</dt><dd>{selectedRole.type === 'system' ? 'System role' : 'Custom role'}</dd></div>
                <div><dt>Status</dt><dd>{selectedRole.active ? 'Active' : 'Inactive'}</dd></div>
                <div><dt>Users assigned</dt><dd>{selectedRole.userCount}</dd></div>
                <div><dt>Permissions</dt><dd>{selectedRole.permissionIds.length}</dd></div>
                <div><dt>Updated</dt><dd>{new Date(selectedRole.updatedAt).toLocaleString()}</dd></div>
              </dl>

              <section className="org-role-modal__section">
                <h3>Permission List</h3>
                {Object.entries(selectedPermissionsByModule).map(([moduleName, permissions]) => (
                  <div key={moduleName} className="org-role-modal__module">
                    <div className="org-role-modal__module-title">{moduleName}</div>
                    <ul>
                      {permissions.map(permission => (
                        <li key={permission.id}>
                          <span>{permission.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            </div>
            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setSelectedRoleId(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="schedules-cfg-modal-overlay" onClick={closeCreate}>
          <div
            className="schedules-cfg-modal org-role-modal org-role-modal--create"
            role="dialog"
            aria-modal="true"
            aria-label="Create role"
            onClick={event => event.stopPropagation()}
          >
            <header className="schedules-cfg-modal__header">
              <h2>Create Role</h2>
              <button type="button" className="org-slideover__close" onClick={closeCreate} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label htmlFor="org-role-name">Role name</label>
                <input
                  id="org-role-name"
                  value={roleForm.name}
                  onChange={event => setRoleForm(form => ({ ...form, name: event.target.value }))}
                  placeholder="e.g. Department Coordinator"
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="org-role-description">Description</label>
                <textarea
                  id="org-role-description"
                  rows={2}
                  value={roleForm.description}
                  onChange={event => setRoleForm(form => ({ ...form, description: event.target.value }))}
                  placeholder="What this role is allowed to do"
                />
              </div>

              <section className="org-role-modal__section">
                <h3>Permissions</h3>
                {Object.entries(baseGroupedPermissions).map(([moduleName, permissions]) => (
                  <div key={moduleName} className="org-role-create-module">
                    <div className="org-role-modal__module-title">{moduleName}</div>
                    <div className="org-role-create-module__list">
                      {permissions.map(permission => (
                        <label key={permission.id} className="org-role-create-permission">
                          <input
                            type="checkbox"
                            checked={roleForm.permissionIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span>
                            <strong>{permission.description}</strong>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            </div>
            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={closeCreate}>Cancel</button>
              <button type="button" className="org-btn org-btn--primary" disabled={!canCreate} onClick={createRole}>
                Create Role
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};
