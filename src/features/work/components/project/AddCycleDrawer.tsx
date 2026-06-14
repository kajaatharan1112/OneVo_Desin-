import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CURRENT_USER_ID, projectTasks, type ProjectCycle, type WorkProject } from '../../workMockData';

export interface AddCycleInput {
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  workItemIds: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  onSubmit: (input: AddCycleInput) => void;
}

export const AddCycleDrawer: React.FC<Props> = ({ open, onClose, project, onSubmit }) => {
  const projectTaskList = projectTasks(project.id);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: '',
    workItemIds: [] as string[],
  });

  if (!open) return null;

  const toggleWorkItem = (id: string) => {
    setForm(f => ({
      ...f,
      workItemIds: f.workItemIds.includes(id)
        ? f.workItemIds.filter(wid => wid !== id)
        : [...f.workItemIds, id],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) return;
    onSubmit({
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      goal: form.goal.trim(),
      workItemIds: form.workItemIds,
    });
    setForm({ name: '', startDate: '', endDate: '', goal: '', workItemIds: [] });
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow"
        role="dialog"
        aria-modal="true"
        aria-label="Add cycle"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>Add cycle</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="org-slideover__body">
          <div className="org-form-field">
            <label htmlFor="cyc-name">Cycle name</label>
            <input
              id="cyc-name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Cycle 2: Feature delivery"
            />
          </div>
          <div className="settings-form-grid">
            <div className="org-form-field">
              <label htmlFor="cyc-start">Start date</label>
              <input
                id="cyc-start"
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="org-form-field">
              <label htmlFor="cyc-end">End date</label>
              <input
                id="cyc-end"
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="org-form-field">
            <label htmlFor="cyc-goal">Goal</label>
            <textarea
              id="cyc-goal"
              rows={3}
              value={form.goal}
              onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
              placeholder="What should this cycle accomplish?"
            />
          </div>
          <div className="org-form-field">
            <label>Work items to include</label>
            <div className="work-checkbox-list">
              {projectTaskList.map(task => (
                <label key={task.id} className="work-checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.workItemIds.includes(task.id)}
                    onChange={() => toggleWorkItem(task.id)}
                  />
                  <span className="work-task-key">{task.key}</span>
                  <span>{task.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSubmit}>Add cycle</button>
        </footer>
      </div>
    </div>
  );
};

export type { ProjectCycle };
