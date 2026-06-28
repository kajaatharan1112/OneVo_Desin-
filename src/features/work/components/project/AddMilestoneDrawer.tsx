import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { projectTasks, MOCK_EMPLOYEES, CURRENT_USER_ID, type PlannerMilestone, type WorkProject, type MilestoneStatus } from '../../workMockData';
import { useWork } from '../../context/work-context';

export interface AddMilestoneInput {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  ownerId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: MilestoneStatus;
  linkedWorkItemIds: string[];
  goalId: string | undefined;
}

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  onSubmit: (input: AddMilestoneInput) => void;
  /** If provided, the drawer will pre-populate fields for editing */
  editTarget?: PlannerMilestone;
}

export const AddMilestoneDrawer: React.FC<Props> = ({ open, onClose, project, onSubmit, editTarget }) => {
  const { goals } = useWork();
  const projectGoals = goals.filter(g => g.projectId === project.id);
  const projectTaskList = projectTasks(project.id);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    ownerId: CURRENT_USER_ID,
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'upcoming' as MilestoneStatus,
    linkedWorkItemIds: [] as string[],
    goalId: '',
  });

  // Sync form when editTarget changes
  useEffect(() => {
    if (editTarget) {
      setForm({
        name: editTarget.name,
        description: editTarget.description,
        startDate: editTarget.startDate ?? '',
        dueDate: editTarget.dueDate,
        ownerId: editTarget.ownerId ?? CURRENT_USER_ID,
        priority: editTarget.priority ?? 'Medium',
        status: editTarget.status,
        linkedWorkItemIds: [...editTarget.linkedWorkItemIds],
        goalId: editTarget.goalId ?? '',
      });
    } else {
      setForm({
        name: '',
        description: '',
        startDate: '',
        dueDate: '',
        ownerId: CURRENT_USER_ID,
        priority: 'Medium',
        status: 'upcoming',
        linkedWorkItemIds: [],
        goalId: '',
      });
    }
  }, [editTarget, open]);

  if (!open) return null;

  const isEdit = Boolean(editTarget);

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
      startDate: form.startDate,
      dueDate: form.dueDate,
      ownerId: form.ownerId,
      priority: form.priority,
      status: form.status,
      linkedWorkItemIds: form.linkedWorkItemIds,
      goalId: form.goalId || undefined,
    });
    setForm({
      name: '',
      description: '',
      startDate: '',
      dueDate: '',
      ownerId: CURRENT_USER_ID,
      priority: 'Medium',
      status: 'upcoming',
      linkedWorkItemIds: [],
      goalId: '',
    });
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit milestone' : 'Add milestone'}
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit milestone' : 'Add milestone'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="org-slideover__body">
          <div className="org-form-field">
            <label htmlFor="ms-goal-select">Parent Goal</label>
            <select
              id="ms-goal-select"
              value={form.goalId}
              onChange={e => setForm(f => ({ ...f, goalId: e.target.value }))}
            >
              <option value="">None / No Goal</option>
              {projectGoals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

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
            <label htmlFor="ms-start">Start date</label>
            <input
              id="ms-start"
              type="date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
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
          <div className="settings-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="org-form-field">
              <label htmlFor="ms-owner">Owner</label>
              <select
                id="ms-owner"
                value={form.ownerId}
                onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
              >
                {MOCK_EMPLOYEES.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="org-form-field">
              <label htmlFor="ms-priority">Priority</label>
              <select
                id="ms-priority"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="org-form-field">
            <label htmlFor="ms-status">Status</label>
            <select
              id="ms-status"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as MilestoneStatus }))}
            >
              <option value="upcoming">Not Started</option>
              <option value="reached">In Progress</option>
              <option value="missed">Missed</option>
              <option value="Achieved">Achieved</option>
            </select>
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
          <button
            type="button"
            className="org-btn org-btn--primary"
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.dueDate}
          >
            {isEdit ? 'Save changes' : 'Add milestone'}
          </button>
        </footer>
      </div>
    </div>
  );
};
