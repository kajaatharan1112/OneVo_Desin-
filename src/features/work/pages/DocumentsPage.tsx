import React, { useMemo, useState } from 'react';
import {
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  File,
  Trash2,
  Edit2,
  Shield,
  FolderOpen,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import {
  CURRENT_USER_ID,
  accessibleDocuments,
  employeeName,
  formatWorkDate,
  workspaceName,
  type DocumentStatus,
  type WorkDocument,
} from '../workMockData';
import { formatRelativeTime } from '../../settings/settingsMockData';

type ScopeFilter = 'all' | 'workspace' | 'project';

const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

function mockVersionHistory(doc: WorkDocument): { version: string; date: string; author: string }[] {
  const major = parseFloat(doc.version) || 1;
  return [
    { version: doc.version, date: doc.updatedAt, author: employeeName(doc.ownerId) },
    { version: (major - 0.1).toFixed(1), date: '2026-05-28T10:00:00Z', author: employeeName(doc.ownerId) },
    { version: (major - 0.2).toFixed(1), date: '2026-05-15T09:00:00Z', author: employeeName(doc.ownerId) },
  ].filter(v => parseFloat(v.version) > 0);
}

export const DocumentsPage: React.FC = () => {
  const {
    workspaceFilterId,
    workspaces,
    projects,
    documents,
    updateDocument,
    addDocument,
    deleteDocument,
  } = useWork();

  const [activeTab, setActiveTab] = useState<'explorer' | 'settings'>('explorer');

  // Explorer states
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [selectedDoc, setSelectedDoc] = useState<WorkDocument | null>(null);

  // Editing state
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editingForm, setEditingForm] = useState({ name: '', type: '' });

  // Creation states
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    name: '',
    type: 'PDF Document',
    scope: 'project' as 'workspace' | 'project',
    projectId: '',
    workspaceId: workspaces[0]?.id || '',
  });

  // Settings states
  const [settings, setSettings] = useState({
    maxFileSize: 25,
    defaultAccess: 'edit' as 'full' | 'edit' | 'comment' | 'view',
    allowPdf: true,
    allowDoc: true,
    allowImages: true,
    allowSheets: true,
  });
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const filtered = useMemo(() => {
    let list = accessibleDocuments(workspaceFilterId, undefined, projects, documents);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          (d.projectName?.toLowerCase().includes(q) ?? false) ||
          d.type.toLowerCase().includes(q)
      );
    }
    if (scopeFilter !== 'all') list = list.filter(d => d.scope === scopeFilter);
    if (statusFilter !== 'all') list = list.filter(d => d.status === statusFilter);
    return list;
  }, [workspaceFilterId, projects, documents, search, scopeFilter, statusFilter]);

  const handleSubmitForApproval = (doc: WorkDocument) => {
    updateDocument(doc.id, { status: 'in_review', locked: false });
    setSelectedDoc(prev =>
      prev?.id === doc.id ? { ...prev, status: 'in_review', locked: false } : prev
    );
  };

  const isLocked = (doc: WorkDocument) =>
    doc.locked || doc.status === 'approved' || doc.status === 'published';

  // Document management handlers
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.name.trim()) return;

    const proj = projects.find(p => p.id === newDocForm.projectId);
    const newDoc: WorkDocument = {
      id: `doc-${Date.now()}`,
      name: newDocForm.name.trim(),
      type: newDocForm.type,
      ownerId: CURRENT_USER_ID,
      projectId: newDocForm.scope === 'project' ? newDocForm.projectId : null,
      projectName: newDocForm.scope === 'project' && proj ? proj.name : null,
      workspaceIds: [newDocForm.workspaceId],
      scope: newDocForm.scope,
      status: 'draft',
      version: '1.0',
      locked: false,
      updatedAt: new Date().toISOString(),
    };

    addDocument(newDoc);
    setIsAddingDoc(false);
    setNewDocForm({
      name: '',
      type: 'PDF Document',
      scope: 'project',
      projectId: '',
      workspaceId: workspaces[0]?.id || '',
    });
  };

  const handleEditDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !editingForm.name.trim()) return;

    updateDocument(selectedDoc.id, {
      name: editingForm.name.trim(),
      type: editingForm.type.trim(),
      updatedAt: new Date().toISOString(),
    });

    setSelectedDoc(prev =>
      prev
        ? {
            ...prev,
            name: editingForm.name.trim(),
            type: editingForm.type.trim(),
          }
        : null
    );
    setIsEditingDoc(false);
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Document?')) {
      deleteDocument(id);
      setSelectedDoc(null);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  return (
    <div className="cfg-page" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .doc-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .doc-tab-btn {
          background: none;
          border: none;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-m);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .doc-tab-btn:hover {
          color: var(--accent);
        }
        .doc-tab-btn--active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        
        .doc-settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
          margin-top: 16px;
        }
        .doc-settings-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .doc-settings-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-h);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .success-banner {
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #15803d;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .doc-drawer-backdrop {
          position: fixed;
          top: 0; right: 0; bottom: 0; left: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .doc-drawer {
          width: 460px;
          background: #ffffff;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 25px -5px rgba(0,0,0,0.1);
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      ` }} />

      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Documents</h1>
          <p className="cfg-page__subtitle">Project and workspace documents across your accessible scope</p>
        </div>
        {activeTab === 'explorer' && (
          <button
            type="button"
            className="org-btn org-btn--primary"
            onClick={() => setIsAddingDoc(true)}
          >
            <Plus size={14} /> Add document
          </button>
        )}
      </div>

      <div className="doc-tabs">
        <button
          type="button"
          className={`doc-tab-btn${activeTab === 'explorer' ? ' doc-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <FolderOpen size={14} /> Document Explorer
        </button>
        <button
          type="button"
          className={`doc-tab-btn${activeTab === 'settings' ? ' doc-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={14} /> Document Settings
        </button>
      </div>

      {activeTab === 'explorer' ? (
        /* ─── TAB 1: DOCUMENT EXPLORER (Explorer & Manager) ─── */
        <div>
          <div className="cfg-page__toolbar">
            <div className="cfg-search">
              <Search size={14} />
              <input
                placeholder="Search documents…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="cfg-filter-select"
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value as ScopeFilter)}
            >
              <option value="all">All scopes</option>
              <option value="workspace">Workspace</option>
              <option value="project">Project</option>
            </select>
            <select
              className="cfg-filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as DocumentStatus | 'all')}
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="cfg-page__body" style={{ marginTop: '16px' }}>
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Scope</th>
                    <th>Project</th>
                    <th>Workspace</th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Updated</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr
                      key={d.id}
                      className="cfg-table__clickable"
                      onClick={() => setSelectedDoc(d)}
                    >
                      <td>
                        <div className="cfg-table__name">📄 {d.name}</div>
                        <div className="cfg-table__meta">{d.type}</div>
                      </td>
                      <td>
                        <span className="cfg-badge cfg-badge--open">{d.scope}</span>
                      </td>
                      <td>{d.projectName ?? '—'}</td>
                      <td>
                        <div className="work-project-card__ws-badges">
                          {d.workspaceIds.map(wsId => (
                            <span key={wsId} className="work-ws-badge">
                              {workspaceName(wsId, workspaces)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="cfg-badge cfg-badge--open">
                          {STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td>{d.version}</td>
                      <td>{formatRelativeTime(d.updatedAt)}</td>
                      <td>{employeeName(d.ownerId)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          className="cfg-action-btn"
                          aria-label="Actions"
                          onClick={() => setSelectedDoc(d)}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="cfg-empty">
                  <p className="cfg-empty__title">No documents in this workspace context</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── TAB 2: DOCUMENT SETTINGS ─── */
        <form onSubmit={handleSaveSettings} style={{ maxWidth: '900px' }}>
          {settingsSuccess && (
            <div className="success-banner">✓ Document management parameters updated successfully!</div>
          )}

          <div className="doc-settings-grid">
            <div className="doc-settings-card">
              <h3 className="doc-settings-title">
                <File size={16} /> Storage & Upload Limits
              </h3>
              <div className="org-form-field">
                <label htmlFor="sets-limit">Maximum Upload File Size (MB)</label>
                <input
                  id="sets-limit"
                  type="number"
                  min={1}
                  value={settings.maxFileSize}
                  onChange={e => setSettings(s => ({ ...s, maxFileSize: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="org-form-field">
                <label>Default Access Permissions</label>
                <select
                  value={settings.defaultAccess}
                  onChange={e => setSettings(s => ({ ...s, defaultAccess: e.target.value as any }))}
                >
                  <option value="full">Full Control (Owner)</option>
                  <option value="edit">Editor access (Collaborators)</option>
                  <option value="comment">Commentator access (Viewers+Comment)</option>
                  <option value="view">Read-only view</option>
                </select>
              </div>
            </div>

            <div className="doc-settings-card">
              <h3 className="doc-settings-title">
                <Shield size={16} /> Restricted Formats
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-s)' }}>
                Select format configurations allowed inside workspace folders.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={settings.allowPdf}
                    onChange={e => setSettings(s => ({ ...s, allowPdf: e.target.checked }))}
                  />
                  Allow PDF Documents (.pdf)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={settings.allowDoc}
                    onChange={e => setSettings(s => ({ ...s, allowDoc: e.target.checked }))}
                  />
                  Allow Text/Word Documents (.docx, .txt)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={settings.allowSheets}
                    onChange={e => setSettings(s => ({ ...s, allowSheets: e.target.checked }))}
                  />
                  Allow Spreadsheets & Data (.xlsx, .csv)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={settings.allowImages}
                    onChange={e => setSettings(s => ({ ...s, allowImages: e.target.checked }))}
                  />
                  Allow Images & Assets (.png, .jpg, .svg)
                </label>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="org-btn org-btn--primary">
              Save Document Configs
            </button>
          </div>
        </form>
      )}

      {/* ─── ADD DOCUMENT MODAL/DRAWER ─── */}
      {isAddingDoc && (
        <div className="doc-drawer-backdrop" onClick={() => setIsAddingDoc(false)}>
          <div className="doc-drawer" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add Workspace Document</h3>
              <button
                type="button"
                onClick={() => setIsAddingDoc(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDocument} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              <div className="org-form-field">
                <label htmlFor="newdoc-name">Document Title <span style={{ color: 'red' }}>*</span></label>
                <input
                  id="newdoc-name"
                  placeholder="e.g. Project Scope Guidelines"
                  value={newDocForm.name}
                  onChange={e => setNewDocForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="org-form-field">
                <label htmlFor="newdoc-type">Document Type</label>
                <select
                  id="newdoc-type"
                  value={newDocForm.type}
                  onChange={e => setNewDocForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="PDF Document">PDF Document (.pdf)</option>
                  <option value="Word Document">Word Document (.docx)</option>
                  <option value="Spreadsheet">Spreadsheet (.xlsx)</option>
                  <option value="Markdown File">Markdown File (.md)</option>
                  <option value="Image Asset">Image Asset (.png, .jpg)</option>
                </select>
              </div>

              <div className="org-form-field">
                <label htmlFor="newdoc-scope">Attachment Scope</label>
                <select
                  id="newdoc-scope"
                  value={newDocForm.scope}
                  onChange={e => setNewDocForm(f => ({ ...f, scope: e.target.value as any }))}
                >
                  <option value="project">Project Scope</option>
                  <option value="workspace">Workspace Scope</option>
                </select>
              </div>

              {newDocForm.scope === 'project' ? (
                <div className="org-form-field">
                  <label htmlFor="newdoc-project">Select Project</label>
                  <select
                    id="newdoc-project"
                    value={newDocForm.projectId}
                    onChange={e => setNewDocForm(f => ({ ...f, projectId: e.target.value }))}
                    required
                  >
                    <option value="">Choose Project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="org-form-field">
                  <label htmlFor="newdoc-workspace">Select Workspace Source</label>
                  <select
                    id="newdoc-workspace"
                    value={newDocForm.workspaceId}
                    onChange={e => setNewDocForm(f => ({ ...f, workspaceId: e.target.value }))}
                    required
                  >
                    {workspaces.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #cbd5e1' }}>
                <button type="button" className="org-btn org-btn--secondary" onClick={() => setIsAddingDoc(false)}>Cancel</button>
                <button type="submit" className="org-btn org-btn--primary" disabled={!newDocForm.name.trim() || (newDocForm.scope === 'project' && !newDocForm.projectId)}>Add Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DOCUMENT DETAIL SLIDEOVER ─── */}
      {selectedDoc && (
        <div className="org-slideover-backdrop" onClick={() => setSelectedDoc(null)}>
          <div
            className="org-slideover org-slideover--wide"
            role="dialog"
            aria-modal="true"
            aria-label="Document detail"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <div>
                <span className="cfg-table__meta">{selectedDoc.type}</span>
                <h2>{selectedDoc.name}</h2>
              </div>
              <button
                type="button"
                className="org-slideover__close"
                onClick={() => setSelectedDoc(null)}
                aria-label="Close"
              >
                ×
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="work-detail-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="cfg-badge cfg-badge--open">{STATUS_LABELS[selectedDoc.status]}</span>
                <span className="cfg-badge cfg-badge--open">v{selectedDoc.version}</span>
                {isLocked(selectedDoc) && (
                  <span className="cfg-badge cfg-badge--inactive">
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>

              {isEditingDoc ? (
                /* Inline Document Editing Form */
                <form onSubmit={handleEditDocumentSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="org-form-field">
                    <label>Edit Title</label>
                    <input
                      value={editingForm.name}
                      onChange={e => setEditingForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="org-form-field">
                    <label>Edit Type</label>
                    <input
                      value={editingForm.type}
                      onChange={e => setEditingForm(f => ({ ...f, type: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setIsEditingDoc(false)}>Cancel</button>
                    <button type="submit" className="org-btn org-btn--primary org-btn--sm">Save Changes</button>
                  </div>
                </form>
              ) : (
                <dl className="work-detail-grid" style={{ marginTop: '16px' }}>
                  <div>
                    <dt>Scope</dt>
                    <dd>{selectedDoc.scope}</dd>
                  </div>
                  <div>
                    <dt>Project</dt>
                    <dd>{selectedDoc.projectName ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{employeeName(selectedDoc.ownerId)}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatWorkDate(selectedDoc.updatedAt.slice(0, 10))}</dd>
                  </div>
                </dl>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                {!isLocked(selectedDoc) && (
                  <button
                    type="button"
                    className="org-btn org-btn--primary org-btn--sm"
                    onClick={() => handleSubmitForApproval(selectedDoc)}
                    disabled={selectedDoc.status === 'in_review'}
                  >
                    {selectedDoc.status === 'in_review' ? 'Pending approval' : 'Submit for approval'}
                  </button>
                )}

                {!isEditingDoc && (
                  <button
                    type="button"
                    className="org-btn org-btn--secondary org-btn--sm"
                    onClick={() => {
                      setEditingForm({ name: selectedDoc.name, type: selectedDoc.type });
                      setIsEditingDoc(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={12} /> Edit File Details
                  </button>
                )}

                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm"
                  onClick={() => handleDeleteDocument(selectedDoc.id)}
                  style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={12} /> Delete Document
                </button>
              </div>

              <section className="work-doc-versions" style={{ marginTop: '24px' }}>
                <h3 className="work-panel__title">Version history</h3>
                <ul className="work-mini-list">
                  {mockVersionHistory(selectedDoc).map(v => (
                    <li key={v.version}>
                      <span>v{v.version}</span>
                      <span className="work-mini-list__meta">
                        {v.author} · {formatRelativeTime(v.date)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <footer className="org-slideover__footer">
              <button
                type="button"
                className="org-btn org-btn--secondary"
                onClick={() => setSelectedDoc(null)}
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
