import React from 'react';
import { Archive, Pencil, Users, X } from 'lucide-react';
import { useWork } from '../context/work-context';

export const ManageWorkspacesDrawer: React.FC = () => {
  const { activeModal, closeModal, workspaces } = useWork();

  if (activeModal !== 'manage-workspaces') return null;

  return (
    <div className="org-slideover-backdrop" onClick={closeModal}>
      <div className="org-slideover org-slideover--wide" role="dialog" aria-modal="true" aria-label="Manage workspaces" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Manage Workspaces</h2>
          <button type="button" className="org-slideover__close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="org-slideover__body">
          <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Workspace</th>
                  <th>Members</th>
                  <th>Linked Projects</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map(w => (
                  <tr key={w.id}>
                    <td className="cfg-table__name">{w.name}</td>
                    <td>{w.memberCount}</td>
                    <td>{w.linkedProjectCount}</td>
                    <td>{w.ownerName}</td>
                    <td>
                      <span className={`cfg-badge cfg-badge--${w.status === 'active' ? 'active' : 'inactive'}`}>{w.status}</span>
                    </td>
                    <td>
                      <div className="cfg-row-actions cfg-row-actions--labeled">
                        <button type="button" className="cfg-action-btn"><Pencil size={13} /> Rename</button>
                        <button type="button" className="cfg-action-btn"><Users size={13} /> Manage Members</button>
                        <button type="button" className="cfg-action-btn"><Archive size={13} /> Archive</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeModal}>Close</button>
        </footer>
      </div>
    </div>
  );
};
