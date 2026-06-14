import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  canViewWorkspaceMemberCount,
  linkableWorkspaces,
  PARTICIPATING_ROLE_OPTIONS,
  requestableWorkspaces,
  workspaceManagePermission,
  type ParticipatingWorkspaceAccess,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

const ACCESS_OPTIONS: { id: ParticipatingWorkspaceAccess; label: string }[] = [
  { id: 'private', label: 'Private' },
  { id: 'workspace_visible', label: 'Workspace visible' },
];

export const AddWorkspaceModal: React.FC<Props> = ({ open, onClose, project }) => {
  const { linkWorkspace, requestWorkspaceLink } = useWork();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [projectRole, setProjectRole] = useState('supporting_team');
  const [access, setAccess] = useState<ParticipatingWorkspaceAccess>('private');

  const available = useMemo(() => {
    const linked = new Set(project.workspaceIds);
    const pending = new Set(project.linkedWorkspaces.filter(lw => lw.status === 'pending').map(lw => lw.workspaceId));
    const manage = linkableWorkspaces().filter(w => !linked.has(w.id) && !pending.has(w.id));
    const request = requestableWorkspaces().filter(w => !linked.has(w.id) && !pending.has(w.id));
    const byId = new Map([...manage, ...request].map(w => [w.id, w]));
    return [...byId.values()];
  }, [project]);

  const filtered = useMemo(() => {
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(w => w.name.toLowerCase().includes(q));
  }, [available, search]);

  if (!open) return null;

  const roleLabel = PARTICIPATING_ROLE_OPTIONS.find(r => r.id === projectRole)?.label ?? 'Supporting team';

  const handleAdd = () => {
    if (!selected) return;
    const permission = workspaceManagePermission(selected);
    const options = {
      role: roleLabel,
      access,
    };
    if (permission === 'manage') {
      linkWorkspace(project.id, selected, options);
    } else {
      requestWorkspaceLink(project.id, selected, 'Participating workspace request', options);
    }
    setSelected('');
    setSearch('');
    setProjectRole('supporting_team');
    setAccess('private');
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal work-modal--wide" role="dialog" aria-modal="true" aria-label="Add participating workspace" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Add participating workspace</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <p className="admin-hint">
            Add another team when they are responsible for part of this project. Only workspaces you can see appear here.
          </p>
          <div className="cfg-search">
            <Search size={14} />
            <input
              placeholder="Search workspaces…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="org-form-field">
            <label htmlFor="add-ws-select">Workspace</label>
            <select id="add-ws-select" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select workspace…</option>
              {filtered.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}{canViewWorkspaceMemberCount(w.id) ? ` · ${w.memberCount} members` : ''}
                </option>
              ))}
            </select>
          </div>
          {available.length === 0 && (
            <p className="admin-hint">No additional workspaces available in your scope.</p>
          )}
          <div className="org-form-field">
            <label htmlFor="add-ws-role">Role in project</label>
            <select id="add-ws-role" value={projectRole} onChange={e => setProjectRole(e.target.value)}>
              {PARTICIPATING_ROLE_OPTIONS.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="add-ws-access">Access</label>
            <select id="add-ws-access" value={access} onChange={e => setAccess(e.target.value as ParticipatingWorkspaceAccess)}>
              {ACCESS_OPTIONS.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
            <p className="admin-hint">
              {access === 'workspace_visible'
                ? 'Members of this workspace can open the project.'
                : 'Only invited project members from this workspace can open the project.'}
            </p>
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!selected} onClick={handleAdd}>
            {selected && workspaceManagePermission(selected) === 'manage' ? 'Add workspace' : 'Request participation'}
          </button>
        </footer>
      </div>
    </div>
  );
};
