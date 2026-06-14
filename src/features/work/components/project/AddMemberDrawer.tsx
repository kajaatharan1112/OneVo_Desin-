import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  MOCK_EMPLOYEES,
  type ProjectAccessLevel,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

type MemberSource = 'project' | 'workspace' | 'search';

export const AddMemberDrawer: React.FC<Props> = ({ open, onClose, project }) => {
  const { addProjectMember } = useWork();
  const [source, setSource] = useState<MemberSource>('search');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [accessLevel, setAccessLevel] = useState<ProjectAccessLevel>('member');

  const existingIds = new Set(project.members.map(m => m.employeeId));

  const candidates = useMemo(() => {
    let pool = MOCK_EMPLOYEES.filter(e => !existingIds.has(e.id));
    if (source === 'project') {
      pool = pool.filter(e => project.members.some(m => m.employeeId === e.id));
    } else if (source === 'workspace') {
      pool = pool.filter(e => e.workspaceIds.some(wsId => project.workspaceIds.includes(wsId)));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    }
    return pool;
  }, [source, search, project, existingIds]);

  if (!open) return null;

  const handleAdd = () => {
    if (!selectedId) return;
    const emp = MOCK_EMPLOYEES.find(e => e.id === selectedId);
    const wsSource = emp?.workspaceIds.find(wsId => project.workspaceIds.includes(wsId)) ?? null;
    addProjectMember(project.id, selectedId, accessLevel, wsSource);
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="org-slideover org-slideover--narrow" role="dialog" aria-modal="true" aria-label="Add project member" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Add member</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="org-slideover__body">
          <div className="org-form-field">
            <label>Source</label>
            <div className="admin-segmented">
              {(['search', 'workspace', 'project'] as MemberSource[]).map(s => (
                <button
                  key={s}
                  type="button"
                  className={`admin-segmented__btn${source === s ? ' admin-segmented__btn--active' : ''}`}
                  onClick={() => setSource(s)}
                >
                  {s === 'search' ? 'Search employee' : s === 'workspace' ? 'Linked workspace' : 'Current members'}
                </button>
              ))}
            </div>
          </div>
          <div className="cfg-search">
            <Search size={14} />
            <input placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="org-form-field">
            <label htmlFor="member-pick">Employee</label>
            <select id="member-pick" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">Select employee…</option>
              {candidates.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.position}</option>
              ))}
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="member-access">Access level</label>
            <select id="member-access" value={accessLevel} onChange={e => setAccessLevel(e.target.value as ProjectAccessLevel)}>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <p className="admin-hint">Adding a project member grants project access regardless of workspace membership.</p>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!selectedId} onClick={handleAdd}>Add member</button>
        </footer>
      </div>
    </div>
  );
};
