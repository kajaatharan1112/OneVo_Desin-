import React, { useMemo, useState } from 'react';
import { Lock, MoreHorizontal, Plus, Search } from 'lucide-react';
import { useWork } from '../context/work-context';
import {
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
  const { workspaceFilterId, workspaces, projects, documents, updateDocument } = useWork();
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [selectedDoc, setSelectedDoc] = useState<WorkDocument | null>(null);

  const filtered = useMemo(() => {
    let list = accessibleDocuments(workspaceFilterId, undefined, projects, documents);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
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
    setSelectedDoc(prev => prev?.id === doc.id ? { ...prev, status: 'in_review', locked: false } : prev);
  };

  const isLocked = (doc: WorkDocument) => doc.locked || doc.status === 'approved' || doc.status === 'published';

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Documents</h1>
          <p className="cfg-page__subtitle">Project and workspace documents across your accessible scope</p>
        </div>
        <button
          type="button"
          className="org-btn org-btn--primary"
          onClick={() => window.alert('Document upload is disabled in this demo.')}
        >
          <Plus size={14} /> Add document
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="cfg-filter-select" value={scopeFilter} onChange={e => setScopeFilter(e.target.value as ScopeFilter)}>
          <option value="all">All scopes</option>
          <option value="workspace">Workspace</option>
          <option value="project">Project</option>
        </select>
        <select className="cfg-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as DocumentStatus | 'all')}>
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="cfg-page__body">
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
                    <div className="cfg-table__name">{d.name}</div>
                    <div className="cfg-table__meta">{d.type}</div>
                  </td>
                  <td><span className="cfg-badge cfg-badge--open">{d.scope}</span></td>
                  <td>{d.projectName ?? '—'}</td>
                  <td>
                    <div className="work-project-card__ws-badges">
                      {d.workspaceIds.map(wsId => (
                        <span key={wsId} className="work-ws-badge">{workspaceName(wsId, workspaces)}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className="cfg-badge cfg-badge--open">{STATUS_LABELS[d.status]}</span></td>
                  <td>{d.version}</td>
                  <td>{formatRelativeTime(d.updatedAt)}</td>
                  <td>{employeeName(d.ownerId)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button type="button" className="cfg-action-btn" aria-label="Actions" onClick={() => setSelectedDoc(d)}>
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="cfg-empty"><p className="cfg-empty__title">No documents in this workspace context</p></div>
          )}
        </div>
      </div>

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
              <button type="button" className="org-slideover__close" onClick={() => setSelectedDoc(null)} aria-label="Close">
                ×
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="work-detail-meta">
                <span className="cfg-badge cfg-badge--open">{STATUS_LABELS[selectedDoc.status]}</span>
                <span className="cfg-badge cfg-badge--open">v{selectedDoc.version}</span>
                {isLocked(selectedDoc) && (
                  <span className="cfg-badge cfg-badge--inactive"><Lock size={10} /> Locked</span>
                )}
              </div>

              <dl className="work-detail-grid">
                <div><dt>Scope</dt><dd>{selectedDoc.scope}</dd></div>
                <div><dt>Project</dt><dd>{selectedDoc.projectName ?? '—'}</dd></div>
                <div><dt>Owner</dt><dd>{employeeName(selectedDoc.ownerId)}</dd></div>
                <div><dt>Updated</dt><dd>{formatWorkDate(selectedDoc.updatedAt.slice(0, 10))}</dd></div>
              </dl>

              {isLocked(selectedDoc) ? (
                <p className="admin-hint">
                  <Lock size={12} /> This document is locked and cannot be edited while approved or published.
                </p>
              ) : (
                <button
                  type="button"
                  className="org-btn org-btn--primary org-btn--sm"
                  onClick={() => handleSubmitForApproval(selectedDoc)}
                  disabled={selectedDoc.status === 'in_review'}
                >
                  {selectedDoc.status === 'in_review' ? 'Pending approval' : 'Submit for approval'}
                </button>
              )}

              <section className="work-doc-versions">
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
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setSelectedDoc(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
