import React, { useMemo } from 'react';
import { AlertTriangle, Ban, Plus, X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  MOCK_EMPLOYEES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  priorityBadgeClass,
  projectAssignees,
  projectTasks,
  workspaceName,
  type ApprovalStatus,
  type TaskPriority,
  type TaskStatus,
  type WorkProject,
  type WorkTask,
  type WorkTaskChecklistGroup,
} from '../../workMockData';

interface Props {
  project?: WorkProject;
}

const LEAVE_CONFLICT_USER = 'user-2';

export const WorkItemDetailDrawer: React.FC<Props> = ({ project: projectProp }) => {
  const { selectedTaskId, closeTaskDetail, updateTask, tasks, workspaces, getProject } = useWork();
  const task = useMemo(
    () => (selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : undefined),
    [selectedTaskId, tasks],
  );
  const project = projectProp ?? (task ? getProject(task.projectId) : undefined);
  const projectTaskList = useMemo(
    () => (project ? projectTasks(project.id, tasks) : []),
    [project, tasks],
  );
  const assignees = useMemo(() => (project ? projectAssignees(project) : []), [project]);

  if (!task || !project) return null;

  const assigneeIds = task.assigneeIds ?? [task.assigneeId];
  const hasLeaveConflict = assigneeIds.includes(LEAVE_CONFLICT_USER);
  const showApproval = project.approvalRequired || task.approvalRequired;
  const checklist = task.checklist ?? [];
  const watchers = task.watchers ?? [];
  const activity = task.activity ?? [];

  const patch = (p: Partial<WorkTask>) => updateTask(task.id, p);

  const toggleAssignee = (id: string) => {
    const next = assigneeIds.includes(id)
      ? assigneeIds.filter(a => a !== id)
      : [...assigneeIds, id];
    const primary = next[0] ?? task.assigneeId;
    patch({ assigneeIds: next, assigneeId: primary });
  };

  const toggleLabel = (name: string) => {
    const next = task.labels.includes(name)
      ? task.labels.filter(l => l !== name)
      : [...task.labels, name];
    patch({ labels: next });
  };

  const toggleWatcher = (id: string) => {
    const next = watchers.includes(id)
      ? watchers.filter(w => w !== id)
      : [...watchers, id];
    patch({ watchers: next });
  };

  const toggleCheckItem = (groupId: string, itemId: string) => {
    const nextChecklist = checklist.map(g =>
      g.id !== groupId
        ? g
        : {
            ...g,
            items: g.items.map(item =>
              item.id === itemId ? { ...item, done: !item.done } : item,
            ),
          },
    );
    patch({ checklist: nextChecklist });
  };

  const addChecklistItem = (groupId: string, text: string) => {
    if (!text.trim()) return;
    const nextChecklist = checklist.map(g =>
      g.id !== groupId
        ? g
        : {
            ...g,
            items: [...g.items, { id: `cli-${Date.now()}`, text: text.trim(), done: false }],
          },
    );
    patch({ checklist: nextChecklist });
  };

  const ensureChecklist = (): WorkTaskChecklistGroup[] => {
    if (checklist.length > 0) return checklist;
    return [{ id: 'cl-default', name: 'Checklist', items: [] }];
  };

  const addDep = (field: 'blocks' | 'blockedBy' | 'relatesTo', key: string) => {
    if (!key) return;
    const current = task[field] ?? [];
    if (current.includes(key)) return;
    patch({ [field]: [...current, key] });
  };

  const removeDep = (field: 'blocks' | 'blockedBy' | 'relatesTo', key: string) => {
    patch({ [field]: (task[field] ?? []).filter(k => k !== key) });
  };

  const otherTasks = projectTaskList.filter(t => t.id !== task.id);

  return (
    <div className="org-slideover-backdrop" onClick={closeTaskDetail}>
      <div
        className="org-slideover org-slideover--wide work-item-detail"
        role="dialog"
        aria-modal="true"
        aria-label={`Work item ${task.key}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <div>
            <span className="work-task-key">{task.key}</span>
            <h2>{task.title}</h2>
          </div>
          <button type="button" className="org-slideover__close" onClick={closeTaskDetail} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body work-item-detail__body">
          {hasLeaveConflict && (
            <div className="work-availability-warning" role="alert">
              <AlertTriangle size={14} />
              <span>Priya Sharma is on leave Jun 12–16 — assignment may conflict with availability.</span>
            </div>
          )}

          <section className="work-settings-section">
            <h3 className="work-settings-section__title">Basic info</h3>
            <div className="org-form-field">
              <label htmlFor="wid-title">Title</label>
              <input
                id="wid-title"
                value={task.title}
                onChange={e => patch({ title: e.target.value })}
              />
            </div>
            <div className="org-form-field">
              <label htmlFor="wid-desc">Description</label>
              <textarea
                id="wid-desc"
                rows={3}
                value={task.description}
                onChange={e => patch({ description: e.target.value })}
              />
            </div>
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="wid-status">Status</label>
                <select
                  id="wid-status"
                  value={task.status}
                  onChange={e => patch({ status: e.target.value as TaskStatus })}
                >
                  {TASK_STATUSES.map(s => (
                    <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="wid-priority">Priority</label>
                <select
                  id="wid-priority"
                  value={task.priority}
                  onChange={e => patch({ priority: e.target.value as TaskPriority })}
                >
                  {(['Low', 'Medium', 'High', 'Critical'] as TaskPriority[]).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="wid-due">Due date</label>
                <input
                  id="wid-due"
                  type="date"
                  value={task.dueDate ?? ''}
                  onChange={e => patch({ dueDate: e.target.value || null })}
                />
              </div>
              {project.workspaceIds.length > 0 && (
                <div className="org-form-field">
                  <label htmlFor="wid-ws">Linked workspace</label>
                  <select
                    id="wid-ws"
                    value={task.linkedWorkspaceId ?? ''}
                    onChange={e => patch({ linkedWorkspaceId: e.target.value || null })}
                  >
                    <option value="">None</option>
                    {project.workspaceIds.map(wsId => (
                      <option key={wsId} value={wsId}>{workspaceName(wsId, workspaces)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="org-form-field">
              <label>Assignees</label>
              <div className="work-checkbox-list">
                {assignees.map(e => (
                  <label key={e.id} className="work-checkbox-item">
                    <input
                      type="checkbox"
                      checked={assigneeIds.includes(e.id)}
                      onChange={() => toggleAssignee(e.id)}
                    />
                    {e.name}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="work-settings-section">
            <h3 className="work-settings-section__title">Checklist</h3>
            {ensureChecklist().map(group => (
              <ChecklistGroup
                key={group.id}
                group={group}
                onToggle={toggleCheckItem}
                onAdd={text => addChecklistItem(group.id, text)}
              />
            ))}
          </section>

          <section className="work-settings-section">
            <h3 className="work-settings-section__title">Dependencies</h3>
            <DependencySection
              label="Blocks"
              keys={task.blocks ?? []}
              options={otherTasks}
              onAdd={key => addDep('blocks', key)}
              onRemove={key => removeDep('blocks', key)}
            />
            <DependencySection
              label="Blocked by"
              keys={task.blockedBy ?? []}
              options={otherTasks}
              onAdd={key => addDep('blockedBy', key)}
              onRemove={key => removeDep('blockedBy', key)}
            />
            <DependencySection
              label="Relates to"
              keys={task.relatesTo ?? []}
              options={otherTasks}
              onAdd={key => addDep('relatesTo', key)}
              onRemove={key => removeDep('relatesTo', key)}
            />
          </section>

          <section className="work-settings-section">
            <h3 className="work-settings-section__title">Labels</h3>
            <div className="work-task-card__labels">
              {project.labels.map(lbl => (
                <button
                  key={lbl.id}
                  type="button"
                  className={`work-label-tag${task.labels.includes(lbl.name) ? ' work-label-tag--active' : ''}`}
                  style={task.labels.includes(lbl.name) ? { borderColor: lbl.color, color: lbl.color } : undefined}
                  onClick={() => toggleLabel(lbl.name)}
                >
                  {lbl.name}
                </button>
              ))}
            </div>
          </section>

          {showApproval && (
            <section className="work-settings-section">
              <h3 className="work-settings-section__title">Approval</h3>
              <label className="work-checkbox-item">
                <input
                  type="checkbox"
                  checked={Boolean(task.approvalRequired ?? project.approvalRequired)}
                  onChange={e => patch({ approvalRequired: e.target.checked })}
                />
                Approval required
              </label>
              <div className="settings-form-grid">
                <div className="org-form-field">
                  <label htmlFor="wid-approver">Approver</label>
                  <select
                    id="wid-approver"
                    value={task.approverId ?? project.defaultApproverId ?? ''}
                    onChange={e => patch({ approverId: e.target.value || null })}
                  >
                    <option value="">Select approver</option>
                    {assignees.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div className="org-form-field">
                  <label htmlFor="wid-approval-status">Status</label>
                  <select
                    id="wid-approval-status"
                    value={task.approvalStatus ?? 'pending'}
                    onChange={e => patch({ approvalStatus: e.target.value as ApprovalStatus })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          <section className="work-settings-section">
            <h3 className="work-settings-section__title">Watchers</h3>
            <div className="work-checkbox-list">
              {MOCK_EMPLOYEES.filter(e => assignees.some(a => a.id === e.id) || watchers.includes(e.id)).map(e => (
                <label key={e.id} className="work-checkbox-item">
                  <input
                    type="checkbox"
                    checked={watchers.includes(e.id)}
                    onChange={() => toggleWatcher(e.id)}
                  />
                  {e.name}
                </label>
              ))}
            </div>
          </section>

          {activity.length > 0 && (
            <section className="work-settings-section">
              <h3 className="work-settings-section__title">Activity</h3>
              <ul className="work-activity-list">
                {activity.map(a => (
                  <li key={a.id}>
                    <span>{a.text}</span>
                    <span className="work-activity-list__time">{a.time}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <footer className="org-slideover__footer">
          <span className={`cfg-badge cfg-badge--${priorityBadgeClass(task.priority)}`}>{task.priority}</span>
          {task.blocked && (
            <span className="work-task-card__blocked-badge">
              <Ban size={12} /> Blocked
            </span>
          )}
          <button type="button" className="org-btn org-btn--secondary" onClick={closeTaskDetail}>Close</button>
        </footer>
      </div>
    </div>
  );
};

const ChecklistGroup: React.FC<{
  group: WorkTaskChecklistGroup;
  onToggle: (groupId: string, itemId: string) => void;
  onAdd: (text: string) => void;
}> = ({ group, onToggle, onAdd }) => {
  const [draft, setDraft] = React.useState('');
  return (
    <div className="work-item-detail__checklist-group">
      <p className="work-panel__subtitle">{group.name}</p>
      <ul className="work-mini-list">
        {group.items.map(item => (
          <li key={item.id}>
            <label className="work-checkbox-item">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggle(group.id, item.id)}
              />
              <span style={item.done ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}>
                {item.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="work-item-detail__add-row">
        <input
          placeholder="Add checklist item…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onAdd(draft);
              setDraft('');
            }
          }}
        />
        <button
          type="button"
          className="org-btn org-btn--secondary org-btn--sm"
          onClick={() => { onAdd(draft); setDraft(''); }}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

const DependencySection: React.FC<{
  label: string;
  keys: string[];
  options: WorkTask[];
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
}> = ({ label, keys, options, onAdd, onRemove }) => {
  const [sel, setSel] = React.useState('');
  return (
    <div className="work-item-detail__dep">
      <p className="work-panel__subtitle">{label}</p>
      {keys.length > 0 ? (
        <ul className="work-mini-list">
          {keys.map(k => (
            <li key={k}>
              <span className="work-task-key">{k}</span>
              <button type="button" className="org-btn org-btn--secondary org-btn--sm org-btn--icon" onClick={() => onRemove(k)} aria-label={`Remove ${k}`}>
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="work-panel__desc">None linked</p>
      )}
      <div className="work-item-detail__add-row">
        <select value={sel} onChange={e => setSel(e.target.value)}>
          <option value="">Link work item…</option>
          {options.filter(t => !keys.includes(t.key)).map(t => (
            <option key={t.id} value={t.key}>{t.key} — {t.title}</option>
          ))}
        </select>
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" disabled={!sel} onClick={() => { onAdd(sel); setSel(''); }}>
          Add
        </button>
      </div>
    </div>
  );
};
