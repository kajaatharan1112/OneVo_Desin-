import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { type WorkProject } from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

export const AddWorkspaceModal: React.FC<Props> = ({ open, onClose, project }) => {
  const { linkWorkspace, workspaces } = useWork();
  const [selected, setSelected] = useState('');

  if (!open) return null;

  const available = workspaces.filter(
    w => w.status === 'active' && !project.workspaceIds.includes(w.id)
  );

  const handleLink = () => {
    if (!selected) return;
    linkWorkspace(project.id, selected);
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal" role="dialog" aria-modal="true" aria-label="Add workspace" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Add workspace</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <p className="admin-hint">Select a workspace you can manage directly. It will be linked immediately.</p>
          <div className="org-form-field">
            <label htmlFor="add-ws">Workspace</label>
            <select id="add-ws" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">Select workspace…</option>
              {available.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!selected} onClick={handleLink}>Link workspace</button>
        </footer>
      </div>
    </div>
  );
};
