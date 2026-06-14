import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  PARTICIPATING_ROLE_OPTIONS,
  type LinkedWorkspace,
  type ParticipatingWorkspaceAccess,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  workspace: LinkedWorkspace;
}

const ACCESS_OPTIONS: { id: ParticipatingWorkspaceAccess; label: string }[] = [
  { id: 'private', label: 'Private' },
  { id: 'workspace_visible', label: 'Workspace visible' },
];

export const ManageParticipatingWorkspaceModal: React.FC<Props> = ({
  open,
  onClose,
  project,
  workspace,
}) => {
  const { updateParticipatingWorkspace } = useWork();
  const roleId = PARTICIPATING_ROLE_OPTIONS.find(r => r.label === workspace.role)?.id ?? 'supporting_team';
  const [projectRole, setProjectRole] = useState<string>(roleId);
  const [access, setAccess] = useState<ParticipatingWorkspaceAccess>(
    workspace.access ?? 'private',
  );

  if (!open) return null;

  const handleSave = () => {
    const roleLabel = PARTICIPATING_ROLE_OPTIONS.find(r => r.id === projectRole)?.label ?? 'Supporting team';
    updateParticipatingWorkspace(project.id, workspace.workspaceId, {
      role: roleLabel,
      access,
    });
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal" role="dialog" aria-modal="true" aria-label="Manage participating workspace" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Manage participating workspace</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <div className="org-form-field">
            <label htmlFor="mgr-ws-role">Role in project</label>
            <select id="mgr-ws-role" value={projectRole} onChange={e => setProjectRole(e.target.value)}>
              {PARTICIPATING_ROLE_OPTIONS.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="mgr-ws-access">Access</label>
            <select id="mgr-ws-access" value={access} onChange={e => setAccess(e.target.value as ParticipatingWorkspaceAccess)}>
              {ACCESS_OPTIONS.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>Save</button>
        </footer>
      </div>
    </div>
  );
};
