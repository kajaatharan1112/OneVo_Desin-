import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  MOCK_EMPLOYEES,
  type TaskPriority,
  type TaskStatus,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  defaultStatus: TaskStatus;
  defaultAssigneeId: string;
}

export const AddWorkItemDrawer: React.FC<Props> = ({
  open,
  onClose,
  project,
  defaultStatus,
  defaultAssigneeId,
}) => {
  const { addTask, workspaces } = useWork();
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: project.defaultPriority as TaskPriority,
    assigneeId: defaultAssigneeId,
    dueDate: '',
    linkedWorkspaceId: project.workspaceIds[0] ?? '',
    labels: '',
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    addTask({
      projectId: project.id,
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigneeId: form.assigneeId,
      dueDate: form.dueDate || null,
      linkedWorkspaceId: project.workspaceIds.length > 1 ? form.linkedWorkspaceId : null,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="org-slideover org-slideover--narrow" role="dialog" aria-modal="true" aria-label="Add work item" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Add work item</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="org-slideover__body">
          <div className="org-form-field">
            <label htmlFor="wi-title">Title</label>
            <input id="wi-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="wi-desc">Description</label>
            <textarea id="wi-desc" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="settings-form-grid">
            <div className="org-form-field">
              <label htmlFor="wi-status">Status</label>
              <select id="wi-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}>
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="org-form-field">
              <label htmlFor="wi-priority">Priority</label>
              <select id="wi-priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
          <div className="settings-form-grid">
            <div className="org-form-field">
              <label htmlFor="wi-assignee">Assignee</label>
              <select id="wi-assignee" value={form.assigneeId} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value }))}>
                {MOCK_EMPLOYEES.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="org-form-field">
              <label htmlFor="wi-due">Due date</label>
              <input id="wi-due" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          {project.workspaceIds.length > 1 && (
            <div className="org-form-field">
              <label htmlFor="wi-ws">Linked workspace context</label>
              <select id="wi-ws" value={form.linkedWorkspaceId} onChange={e => setForm(f => ({ ...f, linkedWorkspaceId: e.target.value }))}>
                {project.workspaceIds.map(wsId => (
                  <option key={wsId} value={wsId}>{workspaces.find(w => w.id === wsId)?.name ?? wsId}</option>
                ))}
              </select>
            </div>
          )}
          <div className="org-form-field">
            <label htmlFor="wi-labels">Labels (comma-separated)</label>
            <input id="wi-labels" value={form.labels} onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} placeholder="design, frontend" />
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!form.title.trim()} onClick={handleSubmit}>Add work item</button>
        </footer>
      </div>
    </div>
  );
};
