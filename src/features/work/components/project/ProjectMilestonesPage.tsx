import React, { useMemo, useState, useEffect } from 'react';
import {
  Calendar,
  Flag,
  Pencil,
  Plus,
  Trash2,
  User,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowUpDown,
  History,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Kanban,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  formatWorkDate,
  priorityBadgeClass,
  employeeName,
  MOCK_EMPLOYEES,
  type PlannerMilestone,
  type MilestoneStatus,
  type WorkProject,
  type WorkTask,
  type TaskStatus,
} from '../../workMockData';
import { AddMilestoneDrawer, type AddMilestoneInput } from './AddMilestoneDrawer';
import { AddWorkItemDrawer } from './AddWorkItemDrawer';

const getTaskDelay = (task: any) => {
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
};

const getMilestoneDelay = (ms: PlannerMilestone) => {
  if (ms.status === 'Achieved') return null;
  if (!ms.dueDate) return null;
  const due = new Date(ms.dueDate + 'T23:59:59');
  const now = new Date();
  if (now > due) {
    const diffMs = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days: diffDays, hours: diffHours };
  }
  return null;
};

const getMilestoneActivityLogs = (ms: PlannerMilestone, linkedTasks: WorkTask[]) => {
  const logs = [
    { text: `Milestone "${ms.name}" created`, time: '10d ago' },
    { text: `Owner set to ${employeeName(ms.ownerId)}`, time: '10d ago' },
  ];
  if (linkedTasks.length > 0) {
    logs.push({ text: `Linked ${linkedTasks.length} work items`, time: '8d ago' });
  }
  linkedTasks.forEach((t, index) => {
    if (t.status === 'done') {
      logs.push({ text: `Task ${t.key} completed by ${employeeName(t.assigneeId)}`, time: `${index + 1}d ago` });
    }
  });
  if (ms.status === 'Achieved') {
    logs.push({ text: `Milestone status changed to Achieved`, time: 'Just now' });
  }
  return logs.slice(-5).reverse();
};

interface Props {
  project: WorkProject;
}

export const ProjectMilestonesPage: React.FC<Props> = ({ project }) => {
  const {
    milestones,
    tasks,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    updateTask,
    openTaskDetail,
    addMilestoneSignal,
  } = useWork();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PlannerMilestone | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Navigation & board status states
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [addTaskMilestoneId, setAddTaskMilestoneId] = useState<string | null>(null);
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (addMilestoneSignal > 0) {
      setEditTarget(null);
      setDrawerOpen(true);
    }
  }, [addMilestoneSignal]);

  // Search/Sort states
  const [boardSearch, setBoardSearch] = useState<Record<string, string>>({});
  const [boardSort, setBoardSort] = useState<Record<string, string>>({});
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({});
  const [activeOwnerDropdown, setActiveOwnerDropdown] = useState<string | null>(null);

  // Drag over states for visual drop target highlights
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const projectMilestones = useMemo(
    () => milestones.filter(m => m.projectId === project.id),
    [milestones, project.id]
  );

  const handleAddMilestone = (input: AddMilestoneInput) => {
    if (editTarget) {
      updateMilestone(editTarget.id, {
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        dueDate: input.dueDate,
        ownerId: input.ownerId,
        priority: input.priority,
        status: input.status,
        linkedWorkItemIds: input.linkedWorkItemIds,
        goalId: input.goalId,
      });
      setEditTarget(null);
    } else {
      const milestone: PlannerMilestone = {
        id: `ms-${Date.now()}`,
        name: input.name,
        description: input.description,
        projectId: project.id,
        startDate: input.startDate,
        dueDate: input.dueDate,
        status: input.status,
        ownerId: input.ownerId,
        priority: input.priority,
        linkedWorkItemIds: input.linkedWorkItemIds,
        goalId: input.goalId,
      };
      addMilestone(milestone);
    }
    setDrawerOpen(false);
  };

  const getLinkedTasks = (milestone: PlannerMilestone) =>
    tasks.filter(t => milestone.linkedWorkItemIds.includes(t.id));

  const statusBadgeClass: Record<MilestoneStatus, string> = {
    upcoming: 'open',
    reached: 'active',
    missed: 'failed',
    Achieved: 'success',
  };



  // Priority and Status Sorters
  const priorityWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const statusWeight: Record<string, number> = { todo: 1, in_progress: 2, review: 3, done: 4, backlog: 0 };

  const getFilteredAndSortedTasks = (msId: string, linkedTasks: WorkTask[]) => {
    let result = [...linkedTasks];
    
    // Filter
    const searchVal = (boardSearch[msId] || '').trim().toLowerCase();
    if (searchVal) {
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(searchVal) ||
          t.key.toLowerCase().includes(searchVal) ||
          employeeName(t.assigneeId).toLowerCase().includes(searchVal) ||
          t.labels.some(l => l.toLowerCase().includes(searchVal))
      );
    }

    // Sort
    const sortVal = boardSort[msId] || 'key';
    result.sort((a, b) => {
      if (sortVal === 'priority') {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortVal === 'status') {
        return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
      }
      if (sortVal === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortVal === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default: key
      return a.key.localeCompare(b.key);
    });

    return result;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, { status });
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Current active milestone details
  const activeMilestone = useMemo(() => {
    if (!selectedMilestoneId) return null;
    return milestones.find(m => m.id === selectedMilestoneId) || null;
  }, [selectedMilestoneId, milestones]);

  const activeMilestoneTasks = useMemo(() => {
    if (!activeMilestone) return [];
    return getLinkedTasks(activeMilestone);
  }, [activeMilestone, tasks]);

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      {/* Embedded High-Fidelity Style Block */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ms-board-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .ms-board-card {
          position: relative;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          transition: all 0.22s ease-in-out;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ms-board-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
        }
        .ms-board-card--overdue {
          border: 2px solid #ef4444 !important;
          background: #fffcfc;
        }
        .ms-board-card--achieved {
          border: 1px solid #10b981 !important;
          background: #fafdfb;
        }
        .ms-banner {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ms-banner--overdue {
          background: #fee2e2;
          color: #b91c1c;
        }
        .ms-banner--schedule {
          background: #dcfce7;
          color: #15803d;
        }
        .ms-banner--achieved {
          background: #e6fbf2;
          color: #047857;
        }
        .ms-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px dashed #e2e8f0;
          background: #f8fafc;
          font-size: 12px;
        }
        .ms-header-label {
          color: #64748b;
          font-weight: 500;
        }
        .ms-header-value {
          color: #0f172a;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ms-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          padding: 12px 16px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }
        .ms-metric-box {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 8px;
          text-align: center;
        }
        .ms-metric-box-title {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .ms-metric-box-value {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }
        .ms-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          gap: 8px;
        }
        .ms-action-btn-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ms-action-btn-pill:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .ms-action-btn-pill--primary {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .ms-action-btn-pill--primary:hover {
          background: #dbeafe;
          color: #1e40af;
        }
        .ms-action-btn-pill--danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .ms-action-btn-pill--danger:hover {
          background: #fee2e2;
          color: #991b1b;
        }
        
        /* Kanban Task Board styling */
        .kb-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 16px;
        }
        .kb-back-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .kb-board-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          margin-top: 16px;
          align-items: flex-start;
        }
        .kb-column {
          flex: 1;
          min-width: 280px;
          background: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          max-height: 600px;
          transition: all 0.2s ease;
        }
        .kb-column--dragover {
          border-color: #3b82f6 !important;
          background: #eff6ff !important;
        }
        .kb-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #cbd5e1;
          background: #ffffff;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }
        .kb-column-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .kb-column-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #334155;
        }
        .kb-column-count {
          font-size: 10.5px;
          font-weight: 700;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 9999px;
        }
        .kb-column-add-btn {
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        .kb-column-add-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .kb-cards-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 150px;
        }
        .kb-task-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          cursor: grab;
          transition: all 0.2s;
        }
        .kb-task-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .kb-task-card:active {
          cursor: grabbing;
        }
        .kb-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .kb-card-key {
          font-size: 10.5px;
          font-weight: 700;
          color: #64748b;
        }
        .kb-card-title {
          font-size: 12.5px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px;
          cursor: pointer;
          line-height: 1.4;
        }
        .kb-card-title:hover {
          color: var(--accent);
          text-decoration: underline;
        }
        .kb-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #f1f5f9;
        }
        .kb-card-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #475569;
          font-size: 8.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kb-card-hours {
          font-size: 10.5px;
          color: #64748b;
        }
        .kb-card-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 6px;
        }
        .kb-card-pill {
          font-size: 9px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 4px;
        }
        
        .ms-history-panel {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 10px 16px;
          font-size: 11px;
        }
        .ms-history-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px dashed #f1f5f9;
          color: #475569;
        }
        .ms-history-item:last-child {
          border-bottom: none;
        }
        .ms-owner-select-overlay {
          position: absolute;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          z-index: 10;
          padding: 6px;
          max-height: 180px;
          overflow-y: auto;
          width: 160px;
        }
        .ms-owner-select-item {
          width: 100%;
          text-align: left;
          padding: 6px 8px;
          border: none;
          background: transparent;
          font-size: 12px;
          cursor: pointer;
          border-radius: 4px;
        }
        .ms-owner-select-item:hover {
          background: #f1f5f9;
        }
      ` }} />

      {activeMilestone ? (
        /* ── MILESTONE KANBAN TASK BOARD VIEW ─────────────────────────── */
        <div>
          <button
            type="button"
            className="kb-back-btn"
            onClick={() => setSelectedMilestoneId(null)}
          >
            <ArrowLeft size={14} /> Back to Milestones
          </button>

          <div
            className={`ms-board-card ${getMilestoneDelay(activeMilestone) ? 'ms-board-card--overdue' : ''} ${activeMilestone.status === 'Achieved' ? 'ms-board-card--achieved' : ''}`}
            style={{ marginBottom: '20px' }}
          >
            {/* Status Monitoring Banner */}
            {activeMilestone.status === 'Achieved' ? (
              <div className="ms-banner ms-banner--achieved">
                <CheckCircle2 size={13} />
                <span>Milestone Achieved</span>
              </div>
            ) : getMilestoneDelay(activeMilestone) ? (
              <div className="ms-banner ms-banner--overdue">
                <AlertTriangle size={13} />
                <span>Overdue - Delay: {getMilestoneDelay(activeMilestone)?.days} days, {getMilestoneDelay(activeMilestone)?.hours} hours</span>
              </div>
            ) : (
              <div className="ms-banner ms-banner--schedule">
                <CheckCircle2 size={13} />
                <span>On Schedule</span>
              </div>
            )}

            {/* Info / Header */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: activeMilestone.status === 'Achieved' ? '#e6fbf2' : getMilestoneDelay(activeMilestone) ? '#fee2e2' : '#eff6ff',
                    color: activeMilestone.status === 'Achieved' ? '#10b981' : getMilestoneDelay(activeMilestone) ? '#ef4444' : '#3b82f6',
                  }}>
                    <Flag size={16} />
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{activeMilestone.name}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                      Milestone Phase Task Board
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
                  <button
                    type="button"
                    className={`cfg-badge cfg-badge--${statusBadgeClass[activeMilestone.status]}`}
                    onClick={() => {
                      const next: Record<MilestoneStatus, MilestoneStatus> = {
                        upcoming: 'reached',
                        reached: 'missed',
                        missed: 'upcoming',
                        Achieved: 'upcoming',
                      };
                      updateMilestone(activeMilestone.id, { status: next[activeMilestone.status] });
                    }}
                    title="Click to cycle status"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {activeMilestone.status === 'upcoming' ? 'Not Started' : activeMilestone.status === 'reached' ? 'In Progress' : activeMilestone.status}
                  </button>
                  <button
                    type="button"
                    className="org-btn org-btn--secondary org-btn--sm"
                    style={{ padding: '2px 8px' }}
                    onClick={() => { setEditTarget(activeMilestone); setDrawerOpen(true); }}
                  >
                    Edit Milestone
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ margin: '14px 0 4px' }}>
                {(() => {
                  const totalTasks = activeMilestoneTasks.length;
                  const completedTasks = activeMilestoneTasks.filter(t => t.status === 'done').length;
                  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span>Progress ({completedTasks}/{totalTasks} Tasks Completed)</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: activeMilestone.status === 'Achieved' ? '#10b981' : getMilestoneDelay(activeMilestone) ? '#ef4444' : '#3b82f6',
                            width: `${progressPercent}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Metadata Fields grid */}
            <div className="ms-header-grid">
              <span className="ms-header-label">Start Date:</span>
              <span className="ms-header-value"><Calendar size={12} /> {activeMilestone.startDate ? formatWorkDate(activeMilestone.startDate) : 'Not set'}</span>
              
              <span className="ms-header-label">Due Date:</span>
              <span className="ms-header-value"><Calendar size={12} /> {formatWorkDate(activeMilestone.dueDate)}</span>

              <span className="ms-header-label">Owner:</span>
              <span className="ms-header-value" style={{ position: 'relative' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', fontWeight: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setActiveOwnerDropdown(activeOwnerDropdown === activeMilestone.id ? null : activeMilestone.id)}
                >
                  <User size={12} /> {employeeName(activeMilestone.ownerId)} <ChevronDown size={10} />
                </button>
                {activeOwnerDropdown === activeMilestone.id && (
                  <div className="ms-owner-select-overlay" style={{ right: 0, top: '20px' }}>
                    {MOCK_EMPLOYEES.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        className="ms-owner-select-item"
                        onClick={() => {
                          updateMilestone(activeMilestone.id, { ownerId: emp.id });
                          setActiveOwnerDropdown(null);
                        }}
                      >
                        {emp.name}
                      </button>
                    ))}
                  </div>
                )}
              </span>

              <span className="ms-header-label">Priority:</span>
              <span className="ms-header-value">
                <span className={`cfg-badge cfg-badge--${priorityBadgeClass(activeMilestone.priority || 'Medium')}`}>
                  {activeMilestone.priority || 'Medium'}
                </span>
              </span>
            </div>

            {/* Stats row & details/history expanders */}
            <div className="ms-actions-bar">
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
                <div>
                  Est. Hours: <strong style={{ color: '#0f172a' }}>{activeMilestoneTasks.reduce((sum, t) => sum + (t.estimate ?? 0), 0)}h</strong>
                </div>
                <div>
                  Actual Hours: <strong style={{ color: '#0f172a' }}>{activeMilestoneTasks.reduce((sum, t) => sum + (t.totalWorkedHours ?? 0), 0).toFixed(1)}h</strong>
                </div>
                <div>
                  Overdue Tasks: <strong style={{ color: '#ef4444' }}>{activeMilestoneTasks.filter(t => getTaskDelay(t)).length}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className="ms-action-btn-pill"
                  onClick={() => setExpandedDetails(prev => ({ ...prev, [activeMilestone.id]: !prev[activeMilestone.id] }))}
                >
                  <Info size={12} /> Milestone Details
                  {expandedDetails[activeMilestone.id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
                <button
                  type="button"
                  className="ms-action-btn-pill"
                  onClick={() => setShowHistory(prev => ({ ...prev, [activeMilestone.id]: !prev[activeMilestone.id] }))}
                >
                  <History size={12} /> History Logs
                  {showHistory[activeMilestone.id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
              </div>
            </div>

            {/* Expandable Details */}
            {expandedDetails[activeMilestone.id] && (
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Description:</div>
                <div>{activeMilestone.description || 'No description provided.'}</div>
              </div>
            )}

            {/* Expandable History */}
            {showHistory[activeMilestone.id] && (
              <div className="ms-history-panel">
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Activity logs:</div>
                {getMilestoneActivityLogs(activeMilestone, activeMilestoneTasks).map((log, idx) => (
                  <div key={idx} className="ms-history-item">
                    <span>{log.text}</span>
                    <span style={{ color: '#94a3b8' }}>{log.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kanban Board Filtering and Sorting */}
          <div className="ms-filter-row" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div className="ms-search-input-wrapper">
              <Search size={12} />
              <input
                type="text"
                placeholder="Filter board items..."
                value={boardSearch[activeMilestone.id] || ''}
                onChange={(e) => setBoardSearch(prev => ({ ...prev, [activeMilestone.id]: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={12} style={{ color: '#64748b' }} />
              <select
                className="ms-sort-select"
                value={boardSort[activeMilestone.id] || 'key'}
                onChange={(e) => setBoardSort(prev => ({ ...prev, [activeMilestone.id]: e.target.value }))}
              >
                <option value="key">Key</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>
          </div>

          {/* The Kanban Board grid */}
          <div className="kb-board-container">
            {(['todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map(status => {
              const columnTasks = getFilteredAndSortedTasks(activeMilestone.id, activeMilestoneTasks).filter(t => t.status === status);
              const isOver = dragOverColumn === status;

              return (
                <div
                  key={status}
                  className={`kb-column ${isOver ? 'kb-column--dragover' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="kb-column-header">
                    <div className="kb-column-title-box">
                      <span className="kb-column-title">
                        {status === 'todo' ? 'To Do' : status === 'in_progress' ? 'In Progress' : status === 'review' ? 'Review' : 'Done'}
                      </span>
                      <span className="kb-column-count">{columnTasks.length}</span>
                    </div>
                    <button
                      type="button"
                      className="kb-column-add-btn"
                      onClick={() => {
                        setAddTaskStatus(status);
                        setAddTaskMilestoneId(activeMilestone.id);
                      }}
                      title="Add task in this column"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="kb-cards-list">
                    {columnTasks.length === 0 ? (
                      <div style={{ padding: '24px 0', color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
                        Drag tasks here
                      </div>
                    ) : (
                      columnTasks.map(t => {
                        const tDelay = getTaskDelay(t);
                        return (
                          <div
                            key={t.id}
                            className="kb-task-card"
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, t.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="kb-card-header">
                              <span className="kb-card-key">{t.key}</span>
                              <div style={{ display: 'flex', gap: '3px' }}>
                                {tDelay && (
                                  <span className="cfg-badge cfg-badge--failed" style={{ fontSize: '8px', padding: '1px 3px' }} title="Overdue">
                                    Overdue
                                  </span>
                                )}
                                <span className={`cfg-badge cfg-badge--${priorityBadgeClass(t.priority)}`} style={{ fontSize: '8px', padding: '1px 3px' }}>
                                  {t.priority}
                                </span>
                              </div>
                            </div>
                            
                            <h5 className="kb-card-title" onClick={() => openTaskDetail(t.id)}>
                              {t.title}
                            </h5>

                            {t.labels && t.labels.length > 0 && (
                              <div className="kb-card-pills">
                                {t.labels.map((lbl, idx) => (
                                  <span key={idx} className="kb-card-pill" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                    {lbl}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="kb-card-footer">
                              <span className="kb-card-hours" title="Estimated vs Actual hours">
                                {t.estimate ?? 0}h / {(t.totalWorkedHours ?? 0).toFixed(1)}h
                              </span>
                              <div className="kb-card-avatar" title={employeeName(t.assigneeId)}>
                                {employeeName(t.assigneeId).slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── MILESTONE OVERVIEW CARDS LIST VIEW ─────────────────────────── */
        <div>
          {/* Milestone Cards Grid */}
          <div className="ms-board-grid">
            {projectMilestones.map(ms => {
              const linkedTasks = getLinkedTasks(ms);
              
              // Calculate milestone specific metrics
              const totalTasks = linkedTasks.length;
              const completedTasks = linkedTasks.filter(t => t.status === 'done').length;
              const pendingTasks = totalTasks - completedTasks;
              const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              let overdueTasksCount = 0;
              linkedTasks.forEach(t => {
                if (getTaskDelay(t)) overdueTasksCount++;
              });

              let estTime = 0;
              let actTime = 0;
              linkedTasks.forEach(t => {
                estTime += t.estimate ?? 0;
                actTime += t.totalWorkedHours ?? 0;
              });

              const delayObj = getMilestoneDelay(ms);
              const isOverdue = Boolean(delayObj);
              const isAchieved = ms.status === 'Achieved';

              return (
                <div
                  key={ms.id}
                  className={`ms-board-card ${isOverdue ? 'ms-board-card--overdue' : ''} ${isAchieved ? 'ms-board-card--achieved' : ''}`}
                >
                  {/* Status Banner */}
                  {isAchieved ? (
                    <div className="ms-banner ms-banner--achieved">
                      <CheckCircle2 size={13} />
                      <span>Milestone Achieved</span>
                    </div>
                  ) : isOverdue ? (
                    <div className="ms-banner ms-banner--overdue">
                      <AlertTriangle size={13} />
                      <span>Overdue - Delay: {delayObj?.days} days, {delayObj?.hours} hours</span>
                    </div>
                  ) : (
                    <div className="ms-banner ms-banner--schedule">
                      <CheckCircle2 size={13} />
                      <span>On Schedule</span>
                    </div>
                  )}

                  {/* Card Title & General Info */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isAchieved ? '#e6fbf2' : isOverdue ? '#fee2e2' : '#eff6ff',
                          color: isAchieved ? '#10b981' : isOverdue ? '#ef4444' : '#3b82f6',
                        }}>
                          <Flag size={16} />
                        </span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{ms.name}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                            Priority: <span style={{ fontWeight: 600 }}>{ms.priority || 'Medium'}</span>
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
                        <span className={`cfg-badge cfg-badge--${statusBadgeClass[ms.status]}`}>
                          {ms.status === 'upcoming' ? 'Not Started' : ms.status === 'reached' ? 'In Progress' : ms.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ margin: '14px 0 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span>Progress ({completedTasks}/{totalTasks} Tasks)</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            background: isAchieved ? '#10b981' : isOverdue ? '#ef4444' : '#3b82f6',
                            width: `${progressPercent}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Overview Dates Fields */}
                  <div className="ms-header-grid">
                    <span className="ms-header-label">Start Date:</span>
                    <span className="ms-header-value"><Calendar size={12} /> {ms.startDate ? formatWorkDate(ms.startDate) : 'Not set'}</span>
                    
                    <span className="ms-header-label">Due Date:</span>
                    <span className="ms-header-value"><Calendar size={12} /> {formatWorkDate(ms.dueDate)}</span>

                    <span className="ms-header-label">Owner:</span>
                    <span className="ms-header-value"><User size={12} /> {employeeName(ms.ownerId)}</span>

                    <span className="ms-header-label">Priority:</span>
                    <span className="ms-header-value">
                      <span className={`cfg-badge cfg-badge--${priorityBadgeClass(ms.priority || 'Medium')}`}>
                        {ms.priority || 'Medium'}
                      </span>
                    </span>
                  </div>

                  {/* Summary widgets */}
                  <div className="ms-metrics-grid">
                    <div className="ms-metric-box">
                      <div className="ms-metric-box-title">Tasks (C/P/O)</div>
                      <div className="ms-metric-box-value" style={{ fontSize: '11.5px' }}>
                        <span style={{ color: '#16a34a' }}>{completedTasks}</span>/
                        <span style={{ color: '#475569' }}>{pendingTasks}</span>/
                        <span style={{ color: '#ef4444' }}>{overdueTasksCount}</span>
                      </div>
                    </div>
                    <div className="ms-metric-box">
                      <div className="ms-metric-box-title">Est. Hours</div>
                      <div className="ms-metric-box-value">{estTime}h</div>
                    </div>
                    <div className="ms-metric-box">
                      <div className="ms-metric-box-title">Actual Hours</div>
                      <div className="ms-metric-box-value">{actTime.toFixed(1)}h</div>
                    </div>
                  </div>

                  {/* Primary view actions */}
                  <div className="ms-actions-bar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      className="org-btn org-btn--primary org-btn--sm"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}
                      onClick={() => setSelectedMilestoneId(ms.id)}
                    >
                      <Kanban size={13} /> Open Task Board
                    </button>
                    
                    <div style={{ display: 'flex', gap: '4px', width: '100%', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        className="ms-action-btn-pill"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => { setEditTarget(ms); setDrawerOpen(true); }}
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      
                      {deleteConfirmId === ms.id ? (
                        <button
                          type="button"
                          className="ms-action-btn-pill ms-action-btn-pill--danger"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => { deleteMilestone(ms.id); setDeleteConfirmId(null); }}
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ms-action-btn-pill"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => setDeleteConfirmId(ms.id)}
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {projectMilestones.length === 0 && (
              <div className="work-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
                <Flag size={32} style={{ color: 'var(--text-m)', opacity: 0.5, marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-h)' }}>No Milestones Yet</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-m)' }}>Create phase wise milestones to break down project goals.</p>
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setDrawerOpen(true)}>
                  Create First Milestone
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Milestone Drawer */}
      <AddMilestoneDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        project={project}
        onSubmit={handleAddMilestone}
        editTarget={editTarget ?? undefined}
      />

      {/* Add Task Drawer */}
      {addTaskMilestoneId && (
        <AddWorkItemDrawer
          open={Boolean(addTaskMilestoneId)}
          onClose={() => setAddTaskMilestoneId(null)}
          project={project}
          defaultStatus={addTaskStatus}
          defaultAssigneeId={CURRENT_USER_ID}
          defaultMilestoneId={addTaskMilestoneId}
        />
      )}
    </div>
  );
};
