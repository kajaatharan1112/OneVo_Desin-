import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  employeeName,
  projectTasks,
  type TaskPriority,
  type WorkProject,
} from '../../workMockData';

interface Props {
  project: WorkProject;
}

const TODAY = '2026-06-14';

export const WorkAnalyticsPanel: React.FC<Props> = ({ project }) => {
  const { analyticsOpen, closeAnalytics, tasks } = useWork();
  const projectTaskList = useMemo(() => projectTasks(project.id, tasks), [project.id, tasks]);

  const stats = useMemo(() => {
    const total = projectTaskList.length;
    const byStatus = TASK_STATUSES.map(status => ({
      status,
      count: projectTaskList.filter(t => t.status === status).length,
    }));
    const done = projectTaskList.filter(t => t.status === 'done');
    const open = projectTaskList.filter(t => t.status !== 'done');
    const overdue = open.filter(t => t.dueDate && t.dueDate < TODAY);
    const totalEstimate = open.reduce((s, t) => s + (t.estimate ?? 0), 0);
    const doneEstimate = done.reduce((s, t) => s + (t.estimate ?? 0), 0);
    const velocity = doneEstimate > 0 ? Math.round(doneEstimate / 2) : done.length;

    const byAssignee = new Map<string, number>();
    projectTaskList.forEach(t => {
      const id = t.assigneeId;
      byAssignee.set(id, (byAssignee.get(id) ?? 0) + 1);
    });

    const priorities: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low'];
    const byPriority = priorities.map(p => ({
      priority: p,
      count: projectTaskList.filter(t => t.priority === p).length,
    }));

    const completionPct = total > 0 ? Math.round((done.length / total) * 100) : 0;
    const burndownNote = overdue.length > 0
      ? `${overdue.length} item${overdue.length === 1 ? '' : 's'} overdue — ${totalEstimate} pts remaining across ${open.length} open items.`
      : `On track — ${totalEstimate} pts remaining, ${completionPct}% complete.`;

    return { total, byStatus, overdue, velocity, byAssignee, byPriority, burndownNote, done: done.length, open: open.length };
  }, [projectTaskList]);

  if (!analyticsOpen) return null;

  return (
    <div className="org-slideover-backdrop" onClick={closeAnalytics}>
      <div
        className="org-slideover org-slideover--narrow work-analytics-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Work analytics"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>Analytics</h2>
          <button type="button" className="org-slideover__close" onClick={closeAnalytics} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body">
          <section className="work-panel">
            <h3 className="work-panel__title">Status breakdown</h3>
            <div className="work-status-bars">
              {stats.byStatus.map(({ status, count }) => (
                <div key={status} className="work-status-bar">
                  <span className="work-status-bar__label">{TASK_STATUS_LABELS[status]}</span>
                  <div className="work-status-bar__track">
                    <div
                      className={`work-status-bar__fill work-status-bar__fill--${status}`}
                      style={{ width: stats.total ? `${(count / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="work-status-bar__count">{count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="work-panel">
            <h3 className="work-panel__title">Burndown</h3>
            <p className="work-panel__desc">{stats.burndownNote}</p>
            <p className="work-panel__stat">{stats.done} / {stats.total} done</p>
          </section>

          <section className="work-panel">
            <h3 className="work-panel__title">Velocity</h3>
            <p className="work-panel__stat">{stats.velocity} pts</p>
            <p className="work-panel__desc">Estimated throughput per cycle (demo)</p>
          </section>

          <section className="work-panel">
            <h3 className="work-panel__title">Overdue</h3>
            <p className={`work-panel__stat${stats.overdue.length ? ' work-overview-stat__value--warn' : ''}`}>
              {stats.overdue.length}
            </p>
          </section>

          <section className="work-panel">
            <h3 className="work-panel__title">By assignee</h3>
            <ul className="work-cycle-breakdown__list">
              {[...stats.byAssignee.entries()].map(([id, count]) => (
                <li key={id}>
                  <span>{employeeName(id)}</span>
                  <span className="work-cycle-breakdown__count">{count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-panel">
            <h3 className="work-panel__title">By priority</h3>
            <ul className="work-cycle-breakdown__list">
              {stats.byPriority.map(({ priority, count }) => (
                <li key={priority}>
                  <span>{priority}</span>
                  <span className="work-cycle-breakdown__count">{count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
