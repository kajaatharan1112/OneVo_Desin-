import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  employeeById,
  inviteableEmployees,
  workspaceName,
  type ProjectAccessLevel,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

interface SelectedInvite {
  employeeId: string;
  accessLevel: ProjectAccessLevel;
}

export const AddMemberDrawer: React.FC<Props> = ({ open, onClose, project }) => {
  const { addProjectMember, workspaces } = useWork();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedInvite[]>([]);
  const [note, setNote] = useState('');

  const existingIds = useMemo(
    () => new Set(project.members.map(m => m.employeeId)),
    [project.members],
  );

  const candidates = useMemo(() => {
    const pool = inviteableEmployees(project.workspaceIds, [
      ...existingIds,
      ...selected.map(s => s.employeeId),
    ]);
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return pool.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    );
  }, [project.workspaceIds, existingIds, selected, search]);

  if (!open) return null;

  const addPerson = (employeeId: string) => {
    if (selected.some(s => s.employeeId === employeeId)) return;
    setSelected(prev => [...prev, { employeeId, accessLevel: 'member' }]);
    setSearch('');
  };

  const removePerson = (employeeId: string) => {
    setSelected(prev => prev.filter(s => s.employeeId !== employeeId));
  };

  const updateAccess = (employeeId: string, accessLevel: ProjectAccessLevel) => {
    setSelected(prev =>
      prev.map(s => (s.employeeId === employeeId ? { ...s, accessLevel } : s)),
    );
  };

  const handleInvite = () => {
    selected.forEach(inv => {
      const emp = employeeById(inv.employeeId);
      const wsSource = emp?.workspaceIds.find(wsId => project.workspaceIds.includes(wsId)) ?? null;
      addProjectMember(project.id, inv.employeeId, inv.accessLevel, wsSource);
    });
    setSelected([]);
    setNote('');
    setSearch('');
    onClose();
  };

  const wsSourceLabel = (employeeId: string) => {
    const emp = employeeById(employeeId);
    const wsId = emp?.workspaceIds.find(id => project.workspaceIds.includes(id));
    return wsId ? workspaceName(wsId, workspaces) : 'Employee directory';
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow work-invite-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Invite people"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>Invite people</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body">
          <div className="org-form-field">
            <label htmlFor="invite-search">Search people</label>
            <div className="cfg-search">
              <Search size={14} />
              <input
                id="invite-search"
                placeholder="Search by name or position…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {search.trim() && (
            <div className="work-invite-results work-invite-results--drawer">
              {candidates.map(e => (
                <button
                  key={e.id}
                  type="button"
                  className="work-invite-result"
                  onClick={() => addPerson(e.id)}
                >
                  <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                    {e.name.slice(0, 2)}
                  </span>
                  <span className="work-invite-result__info">
                    <span className="work-invite-result__name">{e.name}</span>
                    <span className="work-invite-result__meta">
                      {e.position} · {wsSourceLabel(e.id)}
                    </span>
                  </span>
                </button>
              ))}
              {candidates.length === 0 && (
                <p className="admin-hint">No matching people in linked workspaces.</p>
              )}
            </div>
          )}

          {selected.length > 0 && (
            <div className="work-form-section">
              <h3 className="work-form-section__title">Selected people</h3>
              {selected.map(inv => {
                const emp = employeeById(inv.employeeId);
                if (!emp) return null;
                return (
                  <div key={inv.employeeId} className="work-invite-row">
                    <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                      {emp.name.slice(0, 2)}
                    </span>
                    <div className="work-invite-row__info">
                      <span className="work-invite-row__name">{emp.name}</span>
                      <span className="work-invite-row__meta">{emp.position}</span>
                    </div>
                    <select
                      className="work-invite-row__access"
                      value={inv.accessLevel}
                      onChange={e => updateAccess(inv.employeeId, e.target.value as ProjectAccessLevel)}
                      aria-label={`Access for ${emp.name}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      className="work-invite-row__remove"
                      onClick={() => removePerson(inv.employeeId)}
                      aria-label={`Remove ${emp.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="org-form-field">
            <label htmlFor="invite-note">Optional note</label>
            <textarea
              id="invite-note"
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a short note with the invite…"
            />
          </div>
        </div>

        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="org-btn org-btn--primary"
            disabled={selected.length === 0}
            onClick={handleInvite}
          >
            Invite
          </button>
        </footer>
      </div>
    </div>
  );
};
