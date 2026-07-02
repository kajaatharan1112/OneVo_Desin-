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
                    <td className="cfg-table__name">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'var(--surface-raised)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          border: '1px solid var(--border)',
                          flexShrink: 0,
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {w.logoUrl ? (
                            w.logoUrl.startsWith('http') || w.logoUrl.includes('/') || w.logoUrl.includes('.') ? (
                              <img
                                src={w.logoUrl}
                                alt={w.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('span');
                                    fallback.innerText = '🖼️';
                                    fallback.style.fontSize = '14px';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '14px' }}>🖼️</span>
                            )
                          ) : (
                            w.icon || '🏢'
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{w.name}</div>
                          {w.logoUrl && (
                            <div style={{ fontSize: '10px', color: 'var(--text-s)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                              <span>🖼️ Logo:</span>
                              <strong style={{ color: 'var(--text-m)' }}>{w.logoUrl}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
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
