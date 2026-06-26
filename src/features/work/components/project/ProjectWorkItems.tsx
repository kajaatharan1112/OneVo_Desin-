import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ban, Calendar, GripVertical, LayoutGrid, List, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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

/* ── Drag state shared across the board ─────────────────────────── */
interface DragState {
  taskId: string;
  fromStatus?: TaskStatus;
  fromType?: 'board' | 'calendar' | 'unscheduled';
  fromDate?: string;
}

export const ProjectWorkItems: React.FC<Props> = ({ project }) => {
  const { tasks, addWorkItemSignal, updateTask, openTaskDetail } = useWork();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState<TaskStatus>('todo');
  const [drawerDueDate, setDrawerDueDate] = useState<string | null>(null);

  // Drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Calendar specific state
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dragOverUnscheduled, setDragOverUnscheduled] = useState(false);

  useEffect(() => {
    if (addWorkItemSignal > 0) {
      setDrawerStatus('todo');
      setDrawerDueDate(null);
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
    setDrawerDueDate(null);
    setDrawerOpen(true);
  };

  const openAddWithDate = (dateStr: string) => {
    setDrawerStatus('todo');
    setDrawerDueDate(dateStr);
    setDrawerOpen(true);
  };

  const moveTask = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
  };

  /* ── Drag handlers ──────────────────────────────────────────── */
  const handleDragStart = useCallback((
    taskId: string,
    fromStatus?: TaskStatus,
    fromType?: 'board' | 'calendar' | 'unscheduled',
    fromDate?: string
  ) => {
    setDragState({ taskId, fromStatus, fromType, fromDate });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState(null);
    setDragOverCol(null);
    setDragOverDate(null);
    setDragOverUnscheduled(false);
  }, []);

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverCol(status);
    },
    []
  );

  const handleColumnDrop = useCallback(
    (e: React.DragEvent, status: TaskStatus) => {
      e.preventDefault();
      if (dragState && dragState.fromStatus !== status) {
        moveTask(dragState.taskId, status);
      }
      setDragState(null);
      setDragOverCol(null);
    },
    [dragState]
  );

  const handleColumnDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the column entirely (not moving to a child)
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      setDragOverCol(null);
    }
  }, []);

  /* ── Calendar Handlers & Helpers ────────────────────────────── */
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleCellDragOver = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateStr);
  }, []);

  const handleCellDrop = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || dragState?.taskId;
    if (taskId) {
      updateTask(taskId, { dueDate: dateStr });
    }
    setDragState(null);
    setDragOverDate(null);
  }, [dragState, updateTask]);

  const handleUnscheduledDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverUnscheduled(true);
  }, []);

  const handleUnscheduledDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || dragState?.taskId;
    if (taskId) {
      updateTask(taskId, { dueDate: null });
    }
    setDragState(null);
    setDragOverUnscheduled(false);
  }, [dragState, updateTask]);

  const toIso = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const daysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevTotalDays = daysInMonth(prevMonthYear, prevM);
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevTotalDays - i;
      const cellDate = new Date(prevMonthYear, prevM, d);
      cells.push({ dateStr: toIso(cellDate), dayNum: d, isCurrentMonth: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      cells.push({ dateStr: toIso(cellDate), dayNum: d, isCurrentMonth: true });
    }

    const remaining = 42 - cells.length;
    const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    for (let d = 1; d <= remaining; d++) {
      const cellDate = new Date(nextMonthYear, nextM, d);
      cells.push({ dateStr: toIso(cellDate), dayNum: d, isCurrentMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const scheduledTasks = useMemo(() => {
    return projectTaskList.filter(t => t.dueDate);
  }, [projectTaskList]);

  const unscheduledTasks = useMemo(() => {
    return projectTaskList.filter(t => !t.dueDate);
  }, [projectTaskList]);

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
        <div className={`work-kanban${dragState ? ' work-kanban--dragging' : ''}`}>
          {TASK_STATUSES.map(status => {
            const items = projectTaskList.filter(t => t.status === status);
            const isOver = dragOverCol === status;
            const isSource = dragState?.fromStatus === status;

            return (
              <div
                key={status}
                className={`work-kanban__column${isOver && !isSource ? ' work-kanban__column--drop-target' : ''}${isSource ? ' work-kanban__column--dragging-from' : ''}`}
                onDragOver={e => handleColumnDragOver(e, status)}
                onDrop={e => handleColumnDrop(e, status)}
                onDragLeave={handleColumnDragLeave}
              >
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
                  {/* Drop zone indicator at top when dragging */}
                  {isOver && !isSource && (
                    <div className="work-kanban__drop-indicator" />
                  )}

                  {items.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isDragging={dragState?.taskId === task.id}
                      onOpen={() => openTaskDetail(task.id)}
                      onMove={s => moveTask(task.id, s)}
                      onDragStart={() => handleDragStart(task.id, status)}
                      onDragEnd={handleDragEnd}
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
        <div className="work-board-calendar-container">
          <div className="work-board-calendar-main">
            <div className="work-board-calendar-header">
              <h2 className="work-board-calendar-title">
                {new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h2>
              <div className="work-board-calendar-nav">
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={prevMonth}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={goToToday}>
                  Today
                </button>
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={nextMonth}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
              <button
                type="button"
                className="org-btn org-btn--secondary org-btn--sm work-calendar-toggle-sidebar"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? 'Hide Unscheduled' : 'Show Unscheduled'}
              </button>
            </div>

            <div className="work-board-calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="work-board-calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="work-board-calendar-grid">
              {calendarCells.map(cell => {
                const dayTasks = scheduledTasks.filter(t => t.dueDate === cell.dateStr);
                const isToday = cell.dateStr === toIso(new Date());
                const isDragOver = dragOverDate === cell.dateStr;

                return (
                  <div
                    key={cell.dateStr}
                    className={`work-board-calendar-cell${!cell.isCurrentMonth ? ' work-board-calendar-cell--other-month' : ''}${isToday ? ' work-board-calendar-cell--today' : ''}${isDragOver ? ' work-board-calendar-cell--dragover' : ''}`}
                    onDragOver={e => handleCellDragOver(e, cell.dateStr)}
                    onDrop={e => handleCellDrop(e, cell.dateStr)}
                    onDragLeave={() => setDragOverDate(null)}
                  >
                    <div className="work-board-calendar-cell-header">
                      <span className="work-board-calendar-cell-day">{cell.dayNum}</span>
                      <button
                        type="button"
                        className="work-board-calendar-cell-add"
                        onClick={() => openAddWithDate(cell.dateStr)}
                        title="Add task for this day"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <div className="work-board-calendar-cell-tasks">
                      {dayTasks.map(task => (
                        <CompactTaskCard
                          key={task.id}
                          task={task}
                          isDragging={dragState?.taskId === task.id}
                          onOpen={() => openTaskDetail(task.id)}
                          onDragStart={() => handleDragStart(task.id, undefined, 'calendar', cell.dateStr)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isSidebarOpen && (
            <div
              className={`work-board-calendar-sidebar${dragOverUnscheduled ? ' work-board-calendar-sidebar--dragover' : ''}`}
              onDragOver={handleUnscheduledDragOver}
              onDrop={handleUnscheduledDrop}
              onDragLeave={() => setDragOverUnscheduled(false)}
            >
              <div className="work-board-calendar-sidebar-header">
                <h3>Unscheduled</h3>
                <span className="work-board-calendar-sidebar-count">{unscheduledTasks.length}</span>
              </div>
              <div className="work-board-calendar-sidebar-desc">
                Drag items to calendar to schedule, or drag here to unschedule.
              </div>
              <div className="work-board-calendar-sidebar-list">
                {unscheduledTasks.length === 0 ? (
                  <div className="work-board-calendar-sidebar-empty">
                    No unscheduled tasks
                  </div>
                ) : (
                  unscheduledTasks.map(task => (
                    <CompactTaskCard
                      key={task.id}
                      task={task}
                      isDragging={dragState?.taskId === task.id}
                      onOpen={() => openTaskDetail(task.id)}
                      onDragStart={() => handleDragStart(task.id, undefined, 'unscheduled')}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AddWorkItemDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={project}
        defaultStatus={drawerStatus}
        defaultAssigneeId={CURRENT_USER_ID}
        defaultDueDate={drawerDueDate}
      />
      <WorkItemDetailDrawer project={project} />
      <WorkAnalyticsPanel project={project} />
    </div>
  );
};

function useTaskElapsedTime(task: WorkTask) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!task.startDate) {
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
  }, [task.startDate, task.endDate, task.status]);

  return elapsed;
}

const TaskCard: React.FC<{
  task: WorkTask;
  isDragging: boolean;
  onOpen: () => void;
  onMove: (status: TaskStatus) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ task, isDragging, onOpen, onMove, onDragStart, onDragEnd }) => {
  const elapsed = useTaskElapsedTime(task);

  const delayInfo = useMemo(() => {
    if (!task.dueDate || task.status === 'done') return null;
    const due = new Date(task.dueDate + 'T23:59:59');
    const now = new Date();
    if (now > due) {
      const diffMs = now.getTime() - due.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return { days: diffDays, hours: diffHours };
    }
    return null;
  }, [task.dueDate, task.status]);

  return (
    <article
      className={`work-task-card${task.blocked ? ' work-task-card--blocked' : ''}${isDragging ? ' work-task-card--ghost' : ''}`}
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter') onOpen(); }}
      role="button"
      tabIndex={0}
    >
      <div className="work-task-card__drag-handle" title="Drag to move" onClick={e => e.stopPropagation()}>
        <GripVertical size={13} />
      </div>

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

      {delayInfo && (
        <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
          ⚠️ Overdue ({delayInfo.days}d / {delayInfo.hours}h)
        </div>
      )}

      <div className="work-task-card__footer">
        <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
          {employeeName(task.assigneeId).slice(0, 2)}
        </span>
        <span className="work-task-card__assignee">{employeeName(task.assigneeId)}</span>
        {elapsed && (
          <span className="work-task-card__elapsed" title="Active duration" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: '999px', fontSize: '0.62rem', fontWeight: 600 }}>
            ⏱ {elapsed}
          </span>
        )}
        {task.dueDate && <span className="work-task-card__due">{formatWorkDate(task.dueDate)}</span>}
      </div>
    </article>
  );
};

const CompactTaskCard: React.FC<{
  task: WorkTask;
  isDragging: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}> = ({ task, isDragging, onOpen, onDragStart, onDragEnd }) => {
  const elapsed = useTaskElapsedTime(task);
  const priorityColor =
    task.priority === 'Critical' ? '#ef4444' :
    task.priority === 'High' ? '#f97316' :
    task.priority === 'Medium' ? '#eab308' : '#3b82f6';

  return (
    <div
      className={`work-calendar-card${isDragging ? ' work-calendar-card--dragging' : ''}${task.blocked ? ' work-calendar-card--blocked' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={e => {
        e.stopPropagation();
        onOpen();
      }}
      title={`${task.key}: ${task.title} (${task.priority})`}
    >
      <span className="work-calendar-card__priority-dot" style={{ backgroundColor: priorityColor }} />
      <span className="work-calendar-card__key">{task.key}</span>
      <span className="work-calendar-card__title">
        {task.title} {elapsed && `(⏱ ${elapsed.split(' ')[0]})`}
      </span>
    </div>
  );
};
