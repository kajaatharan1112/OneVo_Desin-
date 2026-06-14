import React, { useState } from 'react';
import { X } from 'lucide-react';
import { requestableWorkspaces } from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, contextHint: string, workspaceId?: string) => void;
}

export const RequestWorkspaceParticipationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [contextHint, setContextHint] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  if (!open) return null;

  const requestable = requestableWorkspaces();

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim(), contextHint.trim(), workspaceId || undefined);
    setReason('');
    setContextHint('');
    setWorkspaceId('');
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal" role="dialog" aria-modal="true" aria-label="Request workspace participation" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Request workspace participation</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <p className="admin-hint">
            Request access to a workspace outside your current link scope. Hidden workspaces are not shown here.
          </p>
          {requestable.length > 0 && (
            <div className="org-form-field">
              <label htmlFor="req-ws-visible">Known workspace in your request scope</label>
              <select id="req-ws-visible" value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}>
                <option value="">Select if applicable…</option>
                {requestable.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="org-form-field">
            <label htmlFor="req-context">Team or context (if workspace is not visible)</label>
            <input
              id="req-context"
              value={contextHint}
              onChange={e => setContextHint(e.target.value)}
              placeholder="e.g. Platform infrastructure team"
            />
          </div>
          <div className="org-form-field">
            <label htmlFor="req-reason">Purpose</label>
            <textarea
              id="req-reason"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why does this project need this workspace context?"
            />
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!reason.trim()} onClick={handleSubmit}>
            Submit request
          </button>
        </footer>
      </div>
    </div>
  );
};
