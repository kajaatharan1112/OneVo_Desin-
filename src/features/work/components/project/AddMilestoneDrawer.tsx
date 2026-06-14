import React, { useState } from 'react';
import { X } from 'lucide-react';
import { projectTasks, type WorkProject } from '../../workMockData';

export interface AddMilestoneInput {
  name: string;
  description: string;
  dueDate: string;
  linkedWorkItemIds: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  onSubmit: (input: AddMilestoneInput) => void;
}

export const AddMilestoneDrawer: React.FC<Props> = ({ open, onClose, project, onSubmit }) => {
  const projectTaskList = projectTasks(project.id);
  const [form, setForm] = useState({
    name: '',
    description: '',
    dueDate: '',
    linkedWorkItemIds: [] as string[],
  });

  if (!open) return null;

  const toggleWorkItem = (id: string) => {
    setForm(f => ({
      ...f,
      linkedWorkItemIds: f.linkedWorkItemIds.includes(id)
        ? f.linkedWorkItemIds.filter(wid => wid !== id)
        : [...f.linkedWorkItemIds, id],
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.dueDate) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      linkedWorkItemIds: form.linkedWorkItemIds,
    });
    setForm({ name: '', description: '', dueDate: '', linkedWorkItemIds: [] });
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow"
        role="dialog"
        aria-modal="true"
        aria-label="Add milestone"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>Add milestone</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="org-slideover__body">
          <div className="org-form-field">
            <label htmlFor="ms-name">Milestone name</label>
            <input
              id="ms-name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Beta release"
            />
          </div>
          <div className="org-form-field">
            <label htmlFor="ms-desc">Description</label>
            <textarea
              id="ms-desc"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What does reaching this milestone mean?"
            />
          </div>
          <div className="org-form-field">
            <label htmlFor="ms-due">Due date</label>
            <input
              id="ms-due"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          <div className="org-form-field">
            <label>Linked work items</label>
            <div className="work-checkbox-list">
              {projectTaskList.map(task => (
                <label key={task.id} className="work-checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.linkedWorkItemIds.includes(task.id)}
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
          <button type="button" className="org-btn org-btn--primary" onClick={handleSubmit}>Add milestone</button>
        </footer>
      </div>
    </div>
  );
};

