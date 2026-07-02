import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ban, GripVertical, LayoutGrid, List, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, User, SlidersHorizontal, MessageSquare, Calendar, Clock } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  employeeName,
  formatWorkDate,
  formatWorkDateShort,
  priorityBadgeClass,
  projectTasks,
  type TaskStatus,
  type WorkProject,
  type WorkTask,
} from '../../workMockData';
import { AddWorkItemDrawer } from './AddWorkItemDrawer';
import { WorkAnalyticsPanel } from './WorkAnalyticsPanel';
import { WorkItemDetailDrawer } from './WorkItemDetailDrawer';

import { MOCK_EMPLOYEES } from '../../workMockData';

const MONDAY_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  backlog: { label: 'Not Started', color: '#ffffff', bg: '#c4c4c4' },
  todo: { label: 'Waiting', color: '#ffffff', bg: '#579bfc' },
  in_progress: { label: 'Working on it', color: '#ffffff', bg: '#fdab3d' },
  review: { label: 'Review', color: '#ffffff', bg: '#a25ddc' },
  done: { label: 'Done', color: '#ffffff', bg: '#00c875' },
};

const MONDAY_PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Low: { label: 'Low', color: '#ffffff', bg: '#579bfc' },
  Medium: { label: 'Medium', color: '#ffffff', bg: '#4e5cdb' },
  High: { label: 'High', color: '#ffffff', bg: '#784bd1' },
  Critical: { label: 'Critical', color: '#ffffff', bg: '#df2f4a' },
};

const getAssigneeColor = (name: string): string => {
  const colors = ['#1e4fbc', '#0073ea', '#a25ddc', '#00c875', '#fdab3d', '#df2f4a'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
};

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
  const { tasks, addWorkItemSignal, updateTask, openTaskDetail, addTask } = useWork();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStatus, setDrawerStatus] = useState<TaskStatus>('todo');
  const [drawerDueDate, setDrawerDueDate] = useState<string | null>(null);
  const [drawerParentTaskId, setDrawerParentTaskId] = useState<string | null>(null);

  // Monday table list view states
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [newTitles, setNewTitles] = useState<Record<string, string>>({});

  // Drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Calendar specific state
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() => new Date());
  const [calendarViewType, setCalendarViewType] = useState<'month' | 'week' | 'day'>('month');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [dragOverUnscheduled, setDragOverUnscheduled] = useState(false);
  const [inlineAddDate, setInlineAddDate] = useState<string | null>(null);
  const [inlineAddTitle, setInlineAddTitle] = useState('');
  const [hoveredCellDate, setHoveredCellDate] = useState<string | null>(null);

  const initialSignalRef = useRef(addWorkItemSignal);

  useEffect(() => {
    if (addWorkItemSignal > initialSignalRef.current) {
      setDrawerStatus('todo');
      setDrawerDueDate(null);
      setDrawerOpen(true);
    }
    initialSignalRef.current = addWorkItemSignal;
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
    setDrawerParentTaskId(null);
    setDrawerOpen(true);
  };

  const openAddWithDate = (dateStr: string) => {
    setDrawerStatus('todo');
    setDrawerDueDate(dateStr);
    setDrawerParentTaskId(null);
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
  const handlePrev = () => {
    setCalendarAnchorDate(prev => {
      const d = new Date(prev);
      if (calendarViewType === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (calendarViewType === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCalendarAnchorDate(prev => {
      const d = new Date(prev);
      if (calendarViewType === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (calendarViewType === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  };

  const goToToday = () => {
    setCalendarAnchorDate(new Date());
  };

  const getWeekRangeLabel = (anchor: Date) => {
    const start = new Date(anchor);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    const format = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
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
    const year = calendarAnchorDate.getFullYear();
    const month = calendarAnchorDate.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = daysInMonth(year, month);
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevM = month === 0 ? 11 : month - 1;
    const prevTotalDays = daysInMonth(prevMonthYear, prevM);
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevTotalDays - i;
      const cellDate = new Date(prevMonthYear, prevM, d);
      cells.push({ dateStr: toIso(cellDate), dayNum: d, isCurrentMonth: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const cellDate = new Date(year, month, d);
      cells.push({ dateStr: toIso(cellDate), dayNum: d, isCurrentMonth: true });
    }

    const remaining = 42 - cells.length;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextM = month === 11 ? 0 : month + 1;
    for (let d = 1; d <= remaining; d++) {
      const cellDate = new Date(nextMonthYear, nextM, d);
      cells.push({ dateStr: toIso(cellDate), dayNum: d, isCurrentMonth: false });
    }

    return cells;
  }, [calendarAnchorDate]);

  const weekCells = useMemo(() => {
    const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; weekdayName: string }[] = [];
    const day = calendarAnchorDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    
    const start = new Date(calendarAnchorDate);
    start.setDate(start.getDate() + diffToMonday);

    const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + i);
      cells.push({
        dateStr: toIso(cellDate),
        dayNum: cellDate.getDate(),
        isCurrentMonth: cellDate.getMonth() === calendarAnchorDate.getMonth(),
        weekdayName: weekdayNames[i]
      });
    }
    return cells;
  }, [calendarAnchorDate]);

  const scheduledTasks = useMemo(() => {
    return projectTaskList.filter(t => t.dueDate && !t.parentTaskId);
  }, [projectTaskList]);

  const unscheduledTasks = useMemo(() => {
    return projectTaskList.filter(t => !t.dueDate && !t.parentTaskId);
  }, [projectTaskList]);

  return (
    <div className="work-board-page" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '0', overflow: 'hidden' }}>
      {/* Views Tab Bar */}
      <div className="work-views-tab-bar" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #cbd5e1', padding: '0 20px', background: '#ffffff', gap: '20px', flexShrink: 0 }}>
        <button
          type="button"
          className={`work-view-tab${viewMode !== 'calendar' ? ' work-view-tab--active' : ''}`}
          onClick={() => setViewMode('board')}
          style={{
            padding: '12px 4px',
            fontSize: '14px',
            fontWeight: 500,
            color: viewMode !== 'calendar' ? '#1e4fbc' : '#64748b',
            border: 'none',
            background: 'transparent',
            borderBottom: viewMode !== 'calendar' ? '2px solid #1e4fbc' : '2px solid transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Main table
        </button>
        <button
          type="button"
          className={`work-view-tab${viewMode === 'calendar' ? ' work-view-tab--active' : ''}`}
          onClick={() => setViewMode('calendar')}
          style={{
            padding: '12px 4px',
            fontSize: '14px',
            fontWeight: 500,
            color: viewMode === 'calendar' ? '#1e4fbc' : '#64748b',
            border: 'none',
            background: 'transparent',
            borderBottom: viewMode === 'calendar' ? '2px solid #1e4fbc' : '2px solid transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Calendar
        </button>
        <span style={{ color: '#cbd5e1', fontSize: '14px', cursor: 'default' }}>...</span>
        <span style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>+</span>
      </div>

      {/* Mode-specific Toolbar */}
      {viewMode !== 'calendar' ? (
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
            </div>
          </div>
        </div>
      ) : (
        /* Monday-like Calendar Toolbar */
        <div className="work-board-calendar-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#ffffff', borderBottom: '1px solid #cbd5e1', gap: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* New task button */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#0073ea', color: '#ffffff', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => openAdd('todo')}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                New task
              </button>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)', alignSelf: 'stretch' }} />
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#ffffff', padding: '6px 8px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Add widget button */}
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <Plus size={14} />
              <span>Add widget</span>
            </button>

            {/* Search input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '4px 10px', fontSize: '13px', color: '#334155', minWidth: '150px' }}>
              <Search size={14} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Person button */}
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <User size={14} />
              <span>Person</span>
            </button>

            {/* Filter button */}
            <button
              type="button"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              <ChevronDown size={12} />
            </button>

            {/* Sidebar toggle button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span>{isSidebarOpen ? 'Hide Unscheduled' : 'Show Unscheduled'}</span>
            </button>
          </div>

          {/* Right side navigation & controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Today button */}
            <button
              type="button"
              onClick={goToToday}
              style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '6px 12px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
            >
              Today
            </button>

            {/* Navigation arrows */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', background: '#ffffff' }}>
              <button
                type="button"
                onClick={handlePrev}
                style={{ background: 'transparent', border: 'none', padding: '6px 10px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={14} />
              </button>
              <div style={{ width: '1px', background: '#cbd5e1', alignSelf: 'stretch' }} />
              <button
                type="button"
                onClick={handleNext}
                style={{ background: 'transparent', border: 'none', padding: '6px 10px', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Month / Week / Day Label */}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', minWidth: '95px', textAlign: 'center' }}>
              {calendarViewType === 'month' && calendarAnchorDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              {calendarViewType === 'week' && getWeekRangeLabel(calendarAnchorDate)}
              {calendarViewType === 'day' && calendarAnchorDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            {/* View type select (Month/Week/Day) */}
            <div style={{ position: 'relative' }}>
              <select
                value={calendarViewType}
                onChange={e => setCalendarViewType(e.target.value as any)}
                style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '6px 24px 6px 12px', fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', fontFamily: 'inherit' }}
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'board' && (
        <div className={`work-kanban${dragState ? ' work-kanban--dragging' : ''}`}>
          {TASK_STATUSES.map(status => {
            const items = projectTaskList.filter(t => t.status === status && !t.parentTaskId);
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
                      onAddSubtask={() => {
                        setDrawerStatus(task.status);
                        setDrawerParentTaskId(task.id);
                        setDrawerDueDate(null);
                        setDrawerOpen(true);
                      }}
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
        <div className="work-monday-container">
          {TASK_STATUSES.map(status => {
            const groupTasks = projectTaskList.filter(t => t.status === status && !t.parentTaskId);
            const isCollapsed = collapsedGroups[status];
            const config = MONDAY_STATUS_CONFIG[status];

            // Calculate status & priority distribution for progress bars
            const statusCounts = groupTasks.reduce((acc, t) => {
              acc[t.status] = (acc[t.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const priorityCounts = groupTasks.reduce((acc, t) => {
              acc[t.priority] = (acc[t.priority] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const totalCount = groupTasks.length;

            // Calculate date range (timeline)
            const dueDates = groupTasks.map(t => t.dueDate).filter(Boolean) as string[];
            dueDates.sort();
            let dateRangeStr = 'Not set';
            if (dueDates.length > 0) {
              const start = new Date(dueDates[0]);
              const end = new Date(dueDates[dueDates.length - 1]);
              const formatShort = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              dateRangeStr = `${formatShort(start)} - ${formatShort(end)}`;
            }

            return (
              <div 
                key={status} 
                className={`work-monday-group work-monday-group--${status}`} 
                style={{ 
                  border: '1px solid #e2e8f0',
                  borderLeft: `6px solid ${config.bg}`, 
                  borderRadius: '12px', 
                  background: '#ffffff', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {/* Collapsible Group Header */}
                <div 
                  onClick={() => setCollapsedGroups(prev => ({ ...prev, [status]: !prev[status] }))}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '16px 20px', 
                    background: '#ffffff', 
                    borderBottom: isCollapsed ? 'none' : '1px solid #f1f5f9',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '12px'
                  }}
                >
                  <span style={{ display: 'inline-flex', color: config.bg, transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={16} />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: config.bg, letterSpacing: '-0.01em' }}>
                    {TASK_STATUS_LABELS[status]}
                  </h3>
                  <span style={{ fontSize: '11px', background: `${config.bg}15`, color: config.bg, padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    {groupTasks.length} tasks
                  </span>
                </div>

                {!isCollapsed && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="work-monday-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ width: '38px', padding: '12px' }}>
                            <input type="checkbox" disabled style={{ cursor: 'not-allowed', opacity: 0.5 }} />
                          </th>
                          <th style={{ padding: '12px', minWidth: '240px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task</th>
                          <th style={{ width: '120px', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</th>
                          <th style={{ width: '150px', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                          <th style={{ width: '150px', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due date</th>
                          <th style={{ width: '140px', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</th>
                          <th style={{ width: '40px', padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>+</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupTasks.map(task => {
                          const assignee = MOCK_EMPLOYEES.find(e => e.id === task.assigneeId);
                          const assigneeInitials = assignee ? assignee.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U';

                          return (
                            <tr 
                              key={task.id} 
                              className="work-monday-row"
                              style={{ borderBottom: '1px solid #f1f1f1', cursor: 'pointer' }}
                              onClick={() => openTaskDetail(task.id)}
                            >
                              {/* Checkbox Column */}
                              <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                                <input type="checkbox" style={{ cursor: 'pointer' }} />
                              </td>

                              {/* Task Title Column */}
                              <td style={{ padding: '10px 12px', color: '#0f172a', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {task.blocked && <Ban size={12} style={{ color: '#ef4444' }} />}
                                  <span>{task.title}</span>
                                  <button 
                                    type="button" 
                                    style={{ border: 'none', background: 'transparent', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '2px', cursor: 'pointer', padding: '2px' }}
                                    title="Open comments"
                                  >
                                    <MessageSquare size={13} />
                                  </button>
                                </div>
                              </td>

                              {/* Owner/Assignee Column */}
                              <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: assignee ? getAssigneeColor(assignee.name) : '#cbd5e1', color: '#ffffff', fontSize: '11px', fontWeight: 600, overflow: 'hidden' }} title={assignee?.name || 'Unassigned'}>
                                  {assigneeInitials}
                                </div>
                              </td>

                              {/* Status Select Column */}
                              <td style={{ padding: '8px 12px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <div style={{ position: 'relative', width: '100%', height: '32px', borderRadius: '4px', overflow: 'hidden', background: MONDAY_STATUS_CONFIG[task.status]?.bg || '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
                                    {MONDAY_STATUS_CONFIG[task.status]?.label}
                                  </span>
                                  <select
                                    value={task.status}
                                    onChange={e => moveTask(task.id, e.target.value as TaskStatus)}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      opacity: 0,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {TASK_STATUSES.map(s => (
                                      <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
                                    ))}
                                  </select>
                                </div>
                              </td>

                              {/* Due Date Column */}
                              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Calendar size={12} style={{ color: '#94a3b8' }} />
                                  <span>{task.dueDate ? formatWorkDate(task.dueDate) : '—'}</span>
                                </div>
                              </td>

                              {/* Priority Column */}
                              <td style={{ padding: '8px 12px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <div style={{ position: 'relative', width: '100%', height: '32px', borderRadius: '4px', overflow: 'hidden', background: MONDAY_PRIORITY_CONFIG[task.priority]?.bg || '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
                                    {task.priority}
                                  </span>
                                  <select
                                    value={task.priority}
                                    onChange={e => updateTask(task.id, { priority: e.target.value as any })}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      opacity: 0,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                  </select>
                                </div>
                              </td>

                              {/* Plus Column placeholder */}
                              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#cbd5e1' }}>+</td>
                            </tr>
                          );
                        })}

                        {/* Quick Task Creation Row */}
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <input type="checkbox" disabled style={{ opacity: 0.3 }} />
                          </td>
                          <td colSpan={6} style={{ padding: '8px 12px' }}>
                            <input
                              type="text"
                              placeholder="+ Add task"
                              value={newTitles[status] ?? ''}
                              onChange={e => setNewTitles(prev => ({ ...prev, [status]: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  const val = newTitles[status]?.trim();
                                  if (val) {
                                    addTask({
                                      projectId: project.id,
                                      title: val,
                                      status: status as TaskStatus,
                                      priority: 'Medium',
                                      assigneeId: CURRENT_USER_ID,
                                    });
                                    setNewTitles(prev => ({ ...prev, [status]: '' }));
                                  }
                                }
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                width: '100%',
                                fontSize: '13px',
                                color: '#0f172a',
                                padding: '4px 0'
                              }}
                            />
                          </td>
                        </tr>

                        {/* Group Summary Row (Footer) */}
                        <tr style={{ background: '#fafafa', borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 12px' }}></td>
                          <td style={{ padding: '8px 12px' }}></td>
                          <td style={{ padding: '8px 12px' }}></td>

                          {/* Status distribution summary bar */}
                          <td style={{ padding: '8px 12px' }}>
                            {totalCount > 0 && (
                              <div style={{ display: 'flex', width: '100%', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                                {TASK_STATUSES.map(s => {
                                  const count = statusCounts[s] || 0;
                                  if (count === 0) return null;
                                  const pct = (count / totalCount) * 100;
                                  return (
                                    <div 
                                      key={s} 
                                      style={{ 
                                        width: `${pct}%`, 
                                        background: MONDAY_STATUS_CONFIG[s as TaskStatus]?.bg || '#cbd5e1',
                                        height: '100%'
                                      }} 
                                      title={`${TASK_STATUS_LABELS[s as TaskStatus]}: ${count}`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          {/* Due Date Summary Bar (Timeline Oval) */}
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            {totalCount > 0 && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', background: '#333333', color: '#ffffff', borderRadius: '12px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                                <Clock size={10} style={{ marginRight: '4px' }} />
                                <span>{dateRangeStr}</span>
                              </div>
                            )}
                          </td>

                          {/* Priority summary bar */}
                          <td style={{ padding: '8px 12px' }}>
                            {totalCount > 0 && (
                              <div style={{ display: 'flex', width: '100%', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                                {['Low', 'Medium', 'High', 'Critical'].map(p => {
                                  const count = priorityCounts[p] || 0;
                                  if (count === 0) return null;
                                  const pct = (count / totalCount) * 100;
                                  return (
                                    <div 
                                      key={p} 
                                      style={{ 
                                        width: `${pct}%`, 
                                        background: MONDAY_PRIORITY_CONFIG[p]?.bg || '#94a3b8',
                                        height: '100%'
                                      }} 
                                      title={`${p}: ${count}`}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '8px 12px' }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="work-board-calendar-container">
          <div className="work-board-calendar-main">
            {calendarViewType !== 'day' && (
              <div className="work-board-calendar-weekdays">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="work-board-calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>
            )}

            <div 
              className="work-board-calendar-grid"
              style={
                calendarViewType === 'week'
                  ? { gridTemplateRows: 'minmax(280px, 1fr)' }
                  : calendarViewType === 'day'
                  ? { gridTemplateColumns: '1fr', gridTemplateRows: '1fr', minHeight: '380px' }
                  : {}
              }
            >
              {calendarViewType === 'month' &&
                calendarCells.map(cell => {
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
                      <div className="work-board-calendar-cell-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
                        <span className="work-board-calendar-cell-day">
                          {String(cell.dayNum).padStart(2, '0')}
                        </span>
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

              {calendarViewType === 'week' &&
                weekCells.map(cell => {
                  const dayTasks = scheduledTasks.filter(t => t.dueDate === cell.dateStr);
                  const isToday = cell.dateStr === toIso(new Date());
                  const isDragOver = dragOverDate === cell.dateStr;

                  return (
                    <div
                      key={cell.dateStr}
                      className={`work-board-calendar-cell${isToday ? ' work-board-calendar-cell--today' : ''}${isDragOver ? ' work-board-calendar-cell--dragover' : ''}`}
                      onDragOver={e => handleCellDragOver(e, cell.dateStr)}
                      onDrop={e => handleCellDrop(e, cell.dateStr)}
                      onDragLeave={() => setDragOverDate(null)}
                      style={{ minHeight: '280px' }}
                    >
                      <div className="work-board-calendar-cell-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{cell.weekdayName}</span>
                        <span className="work-board-calendar-cell-day" style={{ fontWeight: 700 }}>
                          {String(cell.dayNum).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="work-board-calendar-cell-tasks" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

              {calendarViewType === 'day' && (() => {
                const dayCellStr = toIso(calendarAnchorDate);
                const dayTasks = scheduledTasks.filter(t => t.dueDate === dayCellStr);
                const isToday = dayCellStr === toIso(new Date());
                const isDragOver = dragOverDate === dayCellStr;

                return (
                  <div
                    className={`work-board-calendar-cell${isToday ? ' work-board-calendar-cell--today' : ''}${isDragOver ? ' work-board-calendar-cell--dragover' : ''}`}
                    onDragOver={e => handleCellDragOver(e, dayCellStr)}
                    onDrop={e => handleCellDrop(e, dayCellStr)}
                    onDragLeave={() => setDragOverDate(null)}
                    style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                          {calendarAnchorDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                          {dayTasks.length} tasks scheduled for this day
                        </p>
                      </div>
                      <button
                        type="button"
                        className="org-btn org-btn--primary org-btn--sm"
                        onClick={() => openAddWithDate(dayCellStr)}
                      >
                        + Schedule Task
                      </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                      {dayTasks.length === 0 ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', padding: '40px 0' }}>
                          <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>No tasks scheduled for today</p>
                          <p style={{ fontSize: '12px', marginTop: '4px' }}>Drag an unscheduled task here, or click the button above to create one.</p>
                        </div>
                      ) : (
                        dayTasks.map(task => (
                          <div 
                            key={task.id}
                            onClick={() => openTaskDetail(task.id)}
                            style={{ 
                              background: '#ffffff', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '8px', 
                              padding: '12px 16px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                          >
                            <div>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-s)', textTransform: 'uppercase', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                                {task.key}
                              </span>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{task.title}</span>
                            </div>
                            <span className={`cfg-badge cfg-badge--${priorityBadgeClass(task.priority)}`} style={{ fontSize: '10px' }}>
                              {task.priority}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
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
        onClose={() => {
          setDrawerOpen(false);
          setDrawerParentTaskId(null);
        }}
        project={project}
        defaultStatus={drawerStatus}
        defaultAssigneeId={CURRENT_USER_ID}
        defaultDueDate={drawerDueDate}
        defaultParentTaskId={drawerParentTaskId}
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
  onAddSubtask: () => void;
}> = ({ task, isDragging, onOpen, onMove, onDragStart, onDragEnd, onAddSubtask }) => {
  const { tasks, updateTask, openTaskDetail } = useWork();
  const elapsed = useTaskElapsedTime(task);
  const [isHovered, setIsHovered] = useState(false);
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

  const handleClockIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowStr = new Date().toISOString();
    const currentAssignee = MOCK_EMPLOYEES.find(emp => emp.id === task.assigneeId);
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

    updateTask(task.id, {
      isClockedIn: true,
      clockInStartTime: nowStr,
      status: 'in_progress',
      timeSessions: [...sessions, newSession],
    });
  };

  const handleClockOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.clockInStartTime) return;

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

    updateTask(task.id, {
      isClockedIn: false,
      clockInStartTime: null,
      totalWorkedHours: newTotalHours,
      timeSessions: updatedSessions,
    });
  };

  const subtasks = useMemo(() => {
    return tasks.filter(t => t.parentTaskId === task.id);
  }, [tasks, task.id]);

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
    <>
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      <div className="work-task-card__drag-handle" title="Drag to move" onClick={e => e.stopPropagation()}>
        <GripVertical size={13} />
      </div>

      <div className="work-task-card__top">
        <span className="work-task-key">{task.key}</span>
        <div className="work-task-card__top-actions" onClick={e => e.stopPropagation()}>
          {isHovered && !task.parentTaskId && (
            <button
              type="button"
              title="Add Subtask"
              onClick={() => onAddSubtask()}
              style={{
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                width: '18px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                marginRight: '6px'
              }}
            >
              +
            </button>
          )}
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

      <div className="work-task-card__footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          <button
            type="button"
            onClick={task.isClockedIn ? handleClockOut : handleClockIn}
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 600,
              borderRadius: '4px',
              border: task.isClockedIn ? '1px solid #ef4444' : '1px solid #0073ea',
              background: task.isClockedIn ? '#fee2e2' : '#e0f2fe',
              color: task.isClockedIn ? '#b91c1c' : '#0369a1',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'inherit',
              flexShrink: 0
            }}
          >
            <span>{task.isClockedIn ? 'Clock Out' : 'Clock In'}</span>
          </button>
        </div>

        {/* Collapsible toggle header inside footer */}
        {subtasks.length > 0 && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setSubtasksExpanded(prev => !prev);
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.78rem', 
              color: 'var(--text-m)', 
              cursor: 'pointer',
              userSelect: 'none',
              marginTop: '4px',
              borderTop: '1px solid var(--border)',
              paddingTop: '8px'
            }}
          >
            <ChevronDown 
              size={14} 
              style={{ 
                transform: subtasksExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
                transition: 'transform 0.15s ease',
                color: 'var(--text-s)'
              }} 
            />
            <span style={{ fontWeight: 500 }}>
              {subtasks.length} {subtasks.length === 1 ? 'subtask' : 'subtasks'}
            </span>
          </div>
        )}
      </div>
    </article>

    {/* Collapsed subtask mini-cards rendered outside of parent article block */}
    {subtasks.length > 0 && subtasksExpanded && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingLeft: '16px' }} onClick={e => e.stopPropagation()}>
        {subtasks.map(sub => {
          const subAssignee = MOCK_EMPLOYEES.find(e => e.id === sub.assigneeId);
          const subInitials = subAssignee ? subAssignee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
          const subAvatarBg = subAssignee ? getAssigneeColor(subAssignee.name) : '#cbd5e1';

          return (
            <div
              key={sub.id}
              onClick={() => openTaskDetail(sub.id)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-h)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {sub.title}
              </div>
              
              {/* Subtask Meta Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {/* Owner avatar */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: subAvatarBg, color: '#ffffff', fontSize: '9px', fontWeight: 600 }} title={subAssignee?.name || 'Unassigned'}>
                  {subInitials}
                </div>

                {/* Due Date */}
                {sub.dueDate && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 4px', fontSize: '9px', color: 'var(--text-m)', background: 'var(--surface-muted)' }}>
                    <Calendar size={9} style={{ color: 'var(--text-s)' }} />
                    <span>{formatWorkDateShort(sub.dueDate)}</span>
                  </div>
                )}

                {/* Priority Flag */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 4px', fontSize: '9px', color: 'var(--text-m)', background: 'var(--surface-muted)' }}>
                  <span style={{ color: sub.priority === 'Critical' || sub.priority === 'High' ? '#ef4444' : '#3b82f6', fontSize: '8px' }}>🚩</span>
                  <span>{sub.priority}</span>
                </div>

                {/* Label Tag icon */}
                {sub.labels.length > 0 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 4px', fontSize: '9px', color: 'var(--text-m)', background: 'var(--surface-muted)' }}>
                    <span>🏷️</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </>
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
