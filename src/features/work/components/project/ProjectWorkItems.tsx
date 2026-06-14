import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
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

interface Props {
  project: WorkProject;
}

export const ProjectWorkItems: React.FC<Props> = ({ project }) => {
  const { tasks, addWorkItemSignal } = useWork();
  const [search, setSearch] = useState('');
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

  return (
    <div className="work-board-page">
      <div className="work-board-page__search-row">
        <div className="cfg-search work-board-page__search">
          <Search size={14} />
          <input placeholder="Search work items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

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
                  <TaskCard key={task.id} task={task} />
                ))}
                <button type="button" className="work-kanban__new-inline" onClick={() => openAdd(status)}>
                  <Plus size={12} /> New work item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddWorkItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={project}
        defaultStatus={drawerStatus}
        defaultAssigneeId={CURRENT_USER_ID}
      />
    </div>
  );
};

const TaskCard: React.FC<{ task: WorkTask }> = ({ task }) => (
  <article className="work-task-card">
    <div className="work-task-card__top">
      <span className="work-task-key">{task.key}</span>
      <span className={`cfg-badge cfg-badge--${priorityBadgeClass(task.priority)}`}>{task.priority}</span>
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
