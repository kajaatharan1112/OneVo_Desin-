import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { type WorkProject } from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

export const RequestWorkspaceModal: React.FC<Props> = ({ open, onClose, project }) => {
  const { requestWorkspaceLink, workspaces } = useWork();
  const [form, setForm] = useState({ workspaceId: '', reason: '', visibility: 'project_members' });

  if (!open) return null;

  const available = workspaces.filter(
    w => !project.linkedWorkspaces.some(lw => lw.workspaceId === w.id)
  );

  const handleSubmit = () => {
    if (!form.workspaceId || !form.reason.trim()) return;
    requestWorkspaceLink(project.id, form.workspaceId, form.reason);
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal" role="dialog" aria-modal="true" aria-label="Request workspace" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Request workspace participation</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <p className="admin-hint">For workspaces outside your current authority. Creates a pending request in demo.</p>
          <div className="org-form-field">
            <label htmlFor="req-ws">Requested workspace</label>
            <select id="req-ws" value={form.workspaceId} onChange={e => setForm(f => ({ ...f, workspaceId: e.target.value }))}>
              <option value="">Select workspace…</option>
              {available.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="req-reason">Reason / purpose</label>
            <textarea id="req-reason" rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="req-vis">Requested visibility / member source</label>
            <select id="req-vis" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
              <option value="project_members">Project members only</option>
              <option value="workspace_members">Workspace members as candidates</option>
              <option value="read_only">Read-only context link</option>
            </select>
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!form.workspaceId || !form.reason.trim()} onClick={handleSubmit}>Submit request</button>
        </footer>
      </div>
    </div>
  );
};
