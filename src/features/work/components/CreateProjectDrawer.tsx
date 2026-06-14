import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../context/work-context';
import { ALL_WORKSPACES_ID, CURRENT_USER_ID, MOCK_EMPLOYEES, type TaskPriority } from '../workMockData';

export const CreateProjectDrawer: React.FC = () => {
  const { activeModal, closeModal, workspaceFilterId, workspaces, createProject, openProject } = useWork();
  const [form, setForm] = useState({
    name: '',
    key: '',
    description: '',
    startDate: '',
    endDate: '',
    linkedWorkspaces: workspaceFilterId !== ALL_WORKSPACES_ID ? [workspaceFilterId] : [] as string[],
    memberIds: [] as string[],
    priority: 'Medium' as TaskPriority,
  });

  useEffect(() => {
    if (activeModal === 'create-project') {
      setForm({
        name: '',
        key: '',
        description: '',
        startDate: '',
        endDate: '',
        linkedWorkspaces: workspaceFilterId !== ALL_WORKSPACES_ID ? [workspaceFilterId] : [],
        memberIds: [],
        priority: 'Medium',
      });
    }
  }, [activeModal, workspaceFilterId]);

  if (activeModal !== 'create-project') return null;

  const needsWorkspacePick = workspaceFilterId === ALL_WORKSPACES_ID;
  const canSubmit = form.name.trim() && form.key.trim() && form.linkedWorkspaces.length > 0;

  const toggleWorkspace = (wsId: string) => {
    setForm(f => ({
      ...f,
      linkedWorkspaces: f.linkedWorkspaces.includes(wsId)
        ? f.linkedWorkspaces.filter(id => id !== wsId)
        : [...f.linkedWorkspaces, wsId],
    }));
  };

  const toggleMember = (empId: string) => {
    if (empId === CURRENT_USER_ID) return;
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(empId)
        ? f.memberIds.filter(id => id !== empId)
        : [...f.memberIds, empId],
    }));
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    const id = createProject({
      name: form.name.trim(),
      key: form.key.trim(),
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      workspaceIds: form.linkedWorkspaces,
      memberIds: form.memberIds,
      defaultPriority: form.priority,
    });
    closeModal();
    openProject(id);
  };

  const deriveKey = (name: string) =>
    name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4);

  return (
    <div className="org-slideover-backdrop" onClick={closeModal}>
      <div className="org-slideover org-slideover--narrow" role="dialog" aria-modal="true" aria-label="Create project" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Create Project</h2>
          <button type="button" className="org-slideover__close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="org-slideover__body">
          <div className="org-form-field">
            <label htmlFor="proj-name">Project name</label>
            <input
              id="proj-name"
              value={form.name}
              onChange={e => {
                const name = e.target.value;
                setForm(f => ({ ...f, name, key: f.key || deriveKey(name) }));
              }}
            />
          </div>
          <div className="org-form-field">
            <label htmlFor="proj-key">Project key</label>
            <input id="proj-key" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase().slice(0, 6) }))} placeholder="ONEVO" />
          </div>
          <div className="org-form-field">
            <label htmlFor="proj-desc">Description</label>
            <textarea id="proj-desc" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="settings-form-grid">
            <div className="org-form-field">
              <label htmlFor="proj-start">Start date</label>
              <input id="proj-start" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="org-form-field">
              <label htmlFor="proj-end">End date</label>
              <input id="proj-end" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>

          <div className="org-form-field">
            <label>Linked workspaces{needsWorkspacePick ? ' (select at least one)' : ''}</label>
            {needsWorkspacePick ? (
              <div className="work-checkbox-list">
                {workspaces.filter(w => w.status === 'active').map(w => (
                  <label key={w.id} className="work-checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.linkedWorkspaces.includes(w.id)}
                      onChange={() => toggleWorkspace(w.id)}
                    />
                    {w.name}
                  </label>
                ))}
              </div>
            ) : (
              <div className="settings-readonly">{workspaces.find(w => w.id === workspaceFilterId)?.name}</div>
            )}
          </div>

          <div className="org-form-field">
            <label>Members (creator becomes admin)</label>
            <div className="work-checkbox-list">
              <label className="work-checkbox-item work-checkbox-item--disabled">
                <input type="checkbox" checked disabled /> You (Admin)
              </label>
              {MOCK_EMPLOYEES.filter(e => e.id !== CURRENT_USER_ID).map(e => (
                <label key={e.id} className="work-checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(e.id)}
                    onChange={() => toggleMember(e.id)}
                  />
                  {e.name} — {e.position}
                </label>
              ))}
            </div>
          </div>

          <div className="org-form-field">
            <label htmlFor="proj-priority">Default priority</label>
            <select id="proj-priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeModal}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!canSubmit} onClick={handleCreate}>Create Project</button>
        </footer>
      </div>
    </div>
  );
};
