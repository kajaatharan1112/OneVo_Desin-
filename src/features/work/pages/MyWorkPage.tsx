import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useWork } from '../context/work-context';
import { WorkItemDetailDrawer } from '../components/project/WorkItemDetailDrawer';
import {
  CURRENT_USER_ID,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  formatWorkDate,
  myTasks,
  priorityBadgeClass,
  type TaskPriority,
  type TaskStatus,
  type WorkTask,
} from '../workMockData';

type DueFilter = 'all' | 'overdue' | 'this-week';

const TODAY = '2026-06-14';

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate < TODAY;
}

function isThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date(TODAY);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return due >= today && due <= weekEnd;
}

function groupByProject(tasks: WorkTask[]): { projectId: string; projectName: string; tasks: WorkTask[] }[] {
  const map = new Map<string, { projectName: string; tasks: WorkTask[] }>();
  for (const t of tasks) {
    const existing = map.get(t.projectId);
    if (existing) existing.tasks.push(t);
    else map.set(t.projectId, { projectName: t.projectName, tasks: [t] });
  }
  return Array.from(map.entries()).map(([projectId, { projectName, tasks: groupTasks }]) => ({
    projectId,
    projectName,
    tasks: groupTasks,
  }));
}

export const MyWorkPage: React.FC = () => {
  const { workspaceFilterId, projects, tasks, openTaskDetail } = useWork();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');

  const filtered = useMemo(() => {
    let list = myTasks(workspaceFilterId, CURRENT_USER_ID, projects, tasks);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') list = list.filter(t => t.priority === priorityFilter);
    if (dueFilter === 'overdue') list = list.filter(t => isOverdue(t.dueDate));
    if (dueFilter === 'this-week') list = list.filter(t => isThisWeek(t.dueDate));
    return list;
  }, [workspaceFilterId, projects, tasks, search, statusFilter, priorityFilter, dueFilter]);

  const groups = useMemo(() => groupByProject(filtered), [filtered]);

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">My Work</h1>
          <p className="cfg-page__subtitle">Tasks assigned to you across projects</p>
        </div>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="cfg-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as TaskStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {TASK_STATUSES.map(s => (
            <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          className="cfg-filter-select"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')}
        >
          <option value="all">All priorities</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
        <select
          className="cfg-filter-select"
          value={dueFilter}
          onChange={e => setDueFilter(e.target.value as DueFilter)}
        >
          <option value="all">All due dates</option>
          <option value="overdue">Overdue</option>
          <option value="this-week">This week</option>
        </select>
      </div>

      <div className="cfg-page__body">
        {groups.map(group => (
          <section key={group.projectId} className="work-my-work-group">
            <h2 className="work-my-work-group__title">{group.projectName}</h2>
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {group.tasks.map(t => (
                    <tr
                      key={t.id}
                      className="cfg-table__clickable"
                      onClick={() => openTaskDetail(t.id)}
                    >
                      <td><span className="work-task-key">{t.key}</span></td>
                      <td className="cfg-table__name">{t.title}</td>
                      <td>{t.projectName}</td>
                      <td>
                        <span className="cfg-badge cfg-badge--open">{TASK_STATUS_LABELS[t.status]}</span>
                      </td>
                      <td>
                        <span className={`cfg-badge cfg-badge--${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                      </td>
                      <td className={isOverdue(t.dueDate) && t.status !== 'done' ? 'work-due--overdue' : ''}>
                        {formatWorkDate(t.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="cfg-empty">
            <p className="cfg-empty__title">No tasks assigned to you</p>
            <p className="cfg-empty__desc">Try adjusting filters or check another workspace scope.</p>
          </div>
        )}
      </div>

      <WorkItemDetailDrawer />
    </div>
  );
};
