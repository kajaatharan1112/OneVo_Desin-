import React, { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, Ban, Plus, X } from 'lucide-react';

function useTaskElapsedTime(task?: { startDate?: string | null; endDate?: string | null; status: string }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!task || !task.startDate) {
      setElapsed('');
      return;
    }

    const calculate = () => {
      const start = new Date(task.startDate + 'T00:00:00');
      
      if (task.status === 'done' && task.endDate) {
        const end = new Date(task.endDate + 'T23:59:59');
        const diffMs = end.getTime() - start.getTime();
        if (diffMs <= 0) return '0s';
        const diffSecs = Math.floor(diffMs / 1000);
        const days = Math.floor(diffSecs / 86400);
        const hours = Math.floor((diffSecs % 86400) / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        return parts.join(' ') || 'Completed';
      }

      if (task.status === 'in_progress') {
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        if (diffMs <= 0) return '0s';
        const diffSecs = Math.floor(diffMs / 1000);
        const days = Math.floor(diffSecs / 86400);
        const hours = Math.floor((diffSecs % 86400) / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        parts.push(`${hours}h`, `${minutes}m`, `${secs}s`);
        return parts.join(' ');
      }

      return '';
    };

    setElapsed(calculate());

    if (task.status !== 'in_progress') {
      return;
    }

    const timer = setInterval(() => {
      setElapsed(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, [task?.startDate, task?.endDate, task?.status]);

  return elapsed;
}

function useSessionTimer(clockInTime?: string | null, isActive?: boolean) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!isActive || !clockInTime) {
      setSecs(0);
      return;
    }

    const start = new Date(clockInTime);
    const update = () => {
      const diffMs = Date.now() - start.getTime();
      setSecs(Math.max(0, Math.floor(diffMs / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [clockInTime, isActive]);

  return secs;
}
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
  const { selectedTaskId, closeTaskDetail, updateTask, tasks, workspaces, getProject, milestones, updateMilestone, openTaskDetail } = useWork();
  const task = useMemo(
    () => (selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : undefined),
    [selectedTaskId, tasks],
  );
  const subtasks = useMemo(() => {
    return task ? tasks.filter(t => t.parentTaskId === task.id) : [];
  }, [tasks, task]);
  const elapsed = useTaskElapsedTime(task);
  const activeSessionSecs = useSessionTimer(task?.clockInStartTime, task?.isClockedIn);

  const formatSecsToHms = (sNum: number) => {
    const h = Math.floor(sNum / 3600);
    const m = Math.floor((sNum % 3600) / 60);
    const s = sNum % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatHoursToMinutesAndSeconds = (hours: number) => {
    const totalSecs = Math.round(hours * 3600);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    if (m === 0) return `${s} seconds`;
    return `${m} minutes ${s} seconds`;
  };

  const activeSessionTime = formatSecsToHms(activeSessionSecs);
  const currentSessionHours = task?.isClockedIn ? (activeSessionSecs / 3600) : 0;
  const totalWorkedHoursWithActive = (task?.totalWorkedHours ?? 0) + currentSessionHours;

  const project = projectProp ?? (task ? getProject(task.projectId) : undefined);
  const projectTaskList = useMemo(
    () => (project ? projectTasks(project.id, tasks) : []),
    [project, tasks],
  );
  const assignees = useMemo(() => (project ? projectAssignees(project) : []), [project]);

  const handleClockIn = () => {
    if (!task) return;
    const nowStr = new Date().toISOString();
    const currentAssignee = MOCK_EMPLOYEES.find(e => e.id === task.assigneeId);
    const assigneeName = currentAssignee ? currentAssignee.name : 'Unknown';
    
    const newSession = {
      id: `sess-${Date.now()}`,
      assigneeId: task.assigneeId,
      assigneeName,
      startTime: nowStr,
      endTime: null,
      hours: 0,
    };
    
    const sessions = task.timeSessions ? [...task.timeSessions] : [];
    
    patch({
      isClockedIn: true,
      clockInStartTime: nowStr,
      status: 'in_progress',
      timeSessions: [...sessions, newSession],
    });
  };

  const handleClockOut = () => {
    if (!task || !task.clockInStartTime) return;
    
    const endTime = new Date();
    const startTime = new Date(task.clockInStartTime);
    const diffMs = endTime.getTime() - startTime.getTime();
    const sessionHours = Number((diffMs / (1000 * 60 * 60)).toFixed(4));
    
    const sessions = task.timeSessions ? [...task.timeSessions] : [];
    const updatedSessions = sessions.map(sess => {
      if (sess.endTime === null) {
        return {
          ...sess,
          endTime: endTime.toISOString(),
          hours: sessionHours,
        };
      }
      return sess;
    });
    
    const newTotalHours = Number(((task.totalWorkedHours ?? 0) + sessionHours).toFixed(4));
    
    patch({
      isClockedIn: false,
      clockInStartTime: null,
      totalWorkedHours: newTotalHours,
      timeSessions: updatedSessions,
    });
  };

  if (!task || !project) return null;

  const assigneeIds = task.assigneeIds ?? [task.assigneeId];
  const hasLeaveConflict = assigneeIds.includes(LEAVE_CONFLICT_USER);
  const showApproval = project.approvalRequired || task.approvalRequired;
  const checklist = task.checklist ?? [];
  const watchers = task.watchers ?? [];
  const activity = task.activity ?? [];

  const patch = (p: Partial<WorkTask>) => updateTask(task.id, p);

  const currentMs = milestones.find(m => m.linkedWorkItemIds.includes(task.id));
  const handleMilestoneChange = (newMsId: string) => {
    if (currentMs) {
      updateMilestone(currentMs.id, {
        linkedWorkItemIds: currentMs.linkedWorkItemIds.filter(id => id !== task.id)
      });
    }
    if (newMsId) {
      const target = milestones.find(m => m.id === newMsId);
      if (target && !target.linkedWorkItemIds.includes(task.id)) {
        updateMilestone(newMsId, {
          linkedWorkItemIds: [...target.linkedWorkItemIds, task.id]
        });
      }
    }
  };

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="work-task-key">{task.key}</span>
              {elapsed && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                  ⏱ {elapsed}
                </span>
              )}
            </div>
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

          {/* Time Tracking Section */}
          <section className="work-settings-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
            <h3 className="work-settings-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱ Time Tracking & Clock
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Worked Time</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  {formatHoursToMinutesAndSeconds(totalWorkedHoursWithActive)}
                </div>
                {task.isClockedIn && (
                  <div style={{ fontSize: '12.5px', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    Active Session: {activeSessionTime}
                  </div>
                )}
              </div>
              
              <div>
                {task.isClockedIn ? (
                  <button
                    type="button"
                    onClick={handleClockOut}
                    className="org-btn"
                    style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ⏹ Clock Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClockIn}
                    className="org-btn"
                    style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ▶ Clock In
                  </button>
                )}
              </div>
            </div>
            
            {/* Session Logs History */}
            {task.timeSessions && task.timeSessions.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Time Log Sessions</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', background: '#ffffff' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '6px 12px', fontWeight: 600, color: '#475569' }}>User</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600, color: '#475569' }}>Start</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600, color: '#475569' }}>End</th>
                        <th style={{ padding: '6px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {task.timeSessions.map(sess => (
                        <tr key={sess.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 12px', color: '#0f172a', fontWeight: 500 }}>{sess.assigneeName}</td>
                          <td style={{ padding: '6px 12px', color: '#64748b' }}>{new Date(sess.startTime).toLocaleString()}</td>
                          <td style={{ padding: '6px 12px', color: '#64748b' }}>
                            {sess.endTime ? new Date(sess.endTime).toLocaleString() : <span style={{ color: '#16a34a', fontWeight: 600 }}>Active Now</span>}
                          </td>
                          <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                            {sess.endTime ? formatHoursToMinutesAndSeconds(sess.hours) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

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
                <label htmlFor="wid-start">Start date</label>
                <input
                  id="wid-start"
                  type="date"
                  value={task.startDate ?? ''}
                  onChange={e => patch({ startDate: e.target.value || null })}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="wid-end">End date</label>
                <input
                  id="wid-end"
                  type="date"
                  value={task.endDate ?? ''}
                  onChange={e => patch({ endDate: e.target.value || null })}
                />
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

            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="wid-milestone">Allocated Milestone</label>
                <select
                  id="wid-milestone"
                  value={currentMs?.id ?? ''}
                  onChange={e => handleMilestoneChange(e.target.value)}
                >
                  <option value="">None</option>
                  {milestones.filter(m => m.projectId === project.id).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="wid-estimate">Allocated Hours</label>
                <input
                  id="wid-estimate"
                  type="number"
                  min={0}
                  value={task.estimate ?? ''}
                  onChange={e => patch({ estimate: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 8"
                />
              </div>
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

          {/* Subtasks Section */}
          <section className="work-settings-section">
            <h3 className="work-settings-section__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Subtasks ({subtasks.length})</span>
            </h3>
            
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={sub.status === 'done'}
                      onChange={(e) => {
                        updateTask(sub.id, { status: e.target.checked ? 'done' : 'todo' });
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span
                      style={{
                        color: 'var(--text-h)',
                        fontWeight: 500,
                        textDecoration: sub.status === 'done' ? 'line-through' : 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        openTaskDetail(sub.id);
                      }}
                    >
                      {sub.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                      {sub.key}
                    </span>
                    <span className={`cfg-badge cfg-badge--${priorityBadgeClass(sub.priority)}`}>
                      {sub.priority}
                    </span>
                  </div>
                </div>
              ))}
              {subtasks.length === 0 && (
                <p className="work-panel__desc" style={{ fontStyle: 'italic', fontSize: '12px', color: '#64748b', margin: 0 }}>
                  No subtasks linked to this item.
                </p>
              )}
            </div>
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

          {/* Files & Attachments Section */}
          <section className="work-settings-section">
            <h3 className="work-settings-section__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📎 Files & Attachments</span>
              <button
                type="button"
                className="org-btn org-btn--secondary org-btn--sm"
                onClick={() => {
                  const fname = window.prompt("Enter file name to attach (e.g. mockup.png):");
                  if (fname && fname.trim()) {
                    const currentFiles = task.customFieldValues?.files ? String(task.customFieldValues.files).split(',') : [];
                    const nextFiles = [...currentFiles, fname.trim()].filter(Boolean).join(',');
                    patch({
                      customFieldValues: {
                        ...task.customFieldValues,
                        files: nextFiles
                      }
                    });
                  }
                }}
              >
                + Add files
              </button>
            </h3>
            
            <div style={{ marginTop: '10px' }}>
              {(() => {
                const files = task.customFieldValues?.files ? String(task.customFieldValues.files).split(',').filter(Boolean) : [];
                if (files.length === 0) {
                  return <p className="work-panel__desc" style={{ fontStyle: 'italic', fontSize: '12px', color: '#64748b' }}>No attachments yet.</p>;
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {files.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>📄 {file}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextFiles = files.filter((_, i) => i !== idx).join(',');
                            patch({
                              customFieldValues: {
                                ...task.customFieldValues,
                                files: nextFiles
                              }
                            });
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '11px', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </section>

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
