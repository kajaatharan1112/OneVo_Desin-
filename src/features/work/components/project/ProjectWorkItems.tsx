import React, { useEffect, useMemo, useState } from 'react';
import { Ban, Calendar, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  employeeName,
  formatWorkDate,
  priorityBadgeClass,
  projectTasks,
  type TaskStatus,
  type WorkProject,
  type WorkTask,
} from '../../workMockData';
import { AddWorkItemDrawer } from './AddWorkItemDrawer';
import { WorkAnalyticsPanel } from './WorkAnalyticsPanel';
import { WorkItemDetailDrawer } from './WorkItemDetailDrawer';

interface Props {
  project: WorkProject;
}

type ViewMode = 'board' | 'list' | 'calendar';

export const ProjectWorkItems: React.FC<Props> = ({ project }) => {
  const { tasks, addWorkItemSignal, updateTask, openTaskDetail } = useWork();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (addWorkItemSignal > 0) {
      setDrawerStatus('todo');
      setDrawerOpen(true);
    }
  }, [addWorkItemSignal]);

  const projectTaskList = useMemo(() => {
    let list = projectTasks(project.id, tasks);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.labels.some(l => l.toLowerCase().includes(q))
      );
    }
    return list;
  }, [project.id, tasks, search]);

  const openAdd = (status: TaskStatus = 'todo') => {
    setDrawerStatus(status);
    setDrawerOpen(true);
  };

  const moveTask = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
  };

  return (
    <div className="work-board-page">
      <div className="work-board-page__toolbar">
        <div className="cfg-search work-board-page__search">
          <Search size={14} />
          <input placeholder="Search work items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="work-board-page__controls">
          <div className="work-view-toggle admin-segmented">
            <button
              type="button"
              className={`admin-segmented__btn${viewMode === 'board' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setViewMode('board')}
              aria-label="Board view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              className={`admin-segmented__btn${viewMode === 'list' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              className={`admin-segmented__btn${viewMode === 'calendar' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setViewMode('calendar')}
              aria-label="Calendar view"
            >
              <Calendar size={14} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'board' && (
        <div className="work-kanban">
          {TASK_STATUSES.map(status => {
            const items = projectTaskList.filter(t => t.status === status);
            return (
              <div key={status} className="work-kanban__column">
                <div className="work-kanban__column-header">
                  <span className="work-kanban__column-title">{TASK_STATUS_LABELS[status]}</span>
                  <span className="work-kanban__column-count">{items.length}</span>
                  <button
                    type="button"
                    className="work-kanban__add-col"
                    onClick={() => openAdd(status)}
                    aria-label={`Add to ${TASK_STATUS_LABELS[status]}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="work-kanban__cards">
                  {items.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpen={() => openTaskDetail(task.id)}
                      onMove={s => moveTask(task.id, s)}
                    />
                  ))}
                  <button type="button" className="work-kanban__new-inline" onClick={() => openAdd(status)}>
                    <Plus size={12} /> New work item
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="work-cycle-items__table-wrap">
          <table className="work-cycle-items__table work-board-list">
            <thead>
              <tr>
                <th>Key</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due</th>
                <th>Est.</th>
              </tr>
            </thead>
            <tbody>
              {projectTaskList.map(task => (
                <tr key={task.id} className="work-board-list__row" onClick={() => openTaskDetail(task.id)}>
                  <td><span className="work-task-key">{task.key}</span></td>
                  <td>
                    {task.blocked && <Ban size={12} className="work-task-card__blocked-icon" aria-label="Blocked" />}
                    {task.title}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <select
                      className="cfg-filter-select cfg-filter-select--inline"
                      value={task.status}
                      onChange={e => moveTask(task.id, e.target.value as TaskStatus)}
                    >
                      {TASK_STATUSES.map(s => (
                        <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${priorityBadgeClass(task.priority)}`}>{task.priority}</span>
                  </td>
                  <td>{employeeName(task.assigneeId)}</td>
                  <td>{formatWorkDate(task.dueDate)}</td>
                  <td>{task.estimate ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="work-board-calendar">
          <p className="work-panel__desc">Calendar view coming soon — switch to Board or List to manage work items.</p>
        </div>
      )}

      <AddWorkItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={project}
        defaultStatus={drawerStatus}
        defaultAssigneeId={CURRENT_USER_ID}
      />
      <WorkItemDetailDrawer project={project} />
      <WorkAnalyticsPanel project={project} />
    </div>
  );
};

const TaskCard: React.FC<{
  task: WorkTask;
  onOpen: () => void;
  onMove: (status: TaskStatus) => void;
}> = ({ task, onOpen, onMove }) => (
  <article
    className={`work-task-card${task.blocked ? ' work-task-card--blocked' : ''}`}
    onClick={onOpen}
    onKeyDown={e => { if (e.key === 'Enter') onOpen(); }}
    role="button"
    tabIndex={0}
  >
    <div className="work-task-card__top">
      <span className="work-task-key">{task.key}</span>
      <div className="work-task-card__top-actions" onClick={e => e.stopPropagation()}>
        {task.blocked && (
          <span className="work-task-card__blocked-badge" title="Blocked">
            <Ban size={12} />
          </span>
        )}
        {task.estimate != null && (
          <span className="work-task-card__estimate">{task.estimate}pt</span>
        )}
        <select
          className="cfg-filter-select cfg-filter-select--inline work-task-card__status-select"
          value={task.status}
          onChange={e => onMove(e.target.value as TaskStatus)}
          aria-label="Move work item"
        >
          {TASK_STATUSES.map(s => (
            <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <span className={`cfg-badge cfg-badge--${priorityBadgeClass(task.priority)}`}>{task.priority}</span>
      </div>
    </div>
    <h3 className="work-task-card__title">{task.title}</h3>
    {task.labels.length > 0 && (
      <div className="work-task-card__labels">
        {task.labels.map(l => <span key={l} className="work-label-tag">{l}</span>)}
      </div>
    )}
    <div className="work-task-card__footer">
      <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
        {employeeName(task.assigneeId).slice(0, 2)}
      </span>
      <span className="work-task-card__assignee">{employeeName(task.assigneeId)}</span>
      {task.dueDate && <span className="work-task-card__due">{formatWorkDate(task.dueDate)}</span>}
    </div>
  </article>
);
