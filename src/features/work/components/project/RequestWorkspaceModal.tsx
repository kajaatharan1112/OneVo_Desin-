import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { requestableWorkspaces, type WorkProject } from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

export const RequestWorkspaceModal: React.FC<Props> = ({ open, onClose, project }) => {
  const { requestWorkspaceLink } = useWork();
  const [workspaceId, setWorkspaceId] = useState('');
  const [reason, setReason] = useState('');

  if (!open) return null;

  const available = requestableWorkspaces().filter(
    w => !project.linkedWorkspaces.some(lw => lw.workspaceId === w.id),
  );

  const handleSubmit = () => {
    if (!workspaceId || !reason.trim()) return;
    requestWorkspaceLink(project.id, workspaceId, reason.trim());
    setWorkspaceId('');
    setReason('');
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal" role="dialog" aria-modal="true" aria-label="Request workspace participation" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Request participation</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <p className="admin-hint">
            Request collaboration with workspaces in your request scope. Creates a pending approval link.
          </p>
          {available.length > 0 ? (
            <div className="org-form-field">
              <label htmlFor="req-ws">Workspace</label>
              <select id="req-ws" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
                <option value="">Select workspace…</option>
                {available.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="admin-hint">No requestable workspaces remain. Use the out-of-scope request action instead.</p>
          )}
          <div className="org-form-field">
            <label htmlFor="req-reason">Purpose</label>
            <textarea id="req-reason" rows={3} value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!workspaceId || !reason.trim()} onClick={handleSubmit}>
            Submit request
          </button>
        </footer>
      </div>
    </div>
  );
};
