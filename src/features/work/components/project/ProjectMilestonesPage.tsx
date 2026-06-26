import React, { useMemo, useState } from 'react';
import { Calendar, Flag, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  TASK_STATUS_LABELS,
  formatWorkDate,
  priorityBadgeClass,
  type PlannerMilestone,
  type MilestoneStatus,
  type WorkProject,
} from '../../workMockData';
import { AddMilestoneDrawer, type AddMilestoneInput } from './AddMilestoneDrawer';

interface Props {
  project: WorkProject;
}

export const ProjectMilestonesPage: React.FC<Props> = ({ project }) => {
  const { milestones, tasks, addMilestone, updateMilestone, deleteMilestone } = useWork();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PlannerMilestone | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const projectMilestones = useMemo(
    () => milestones.filter(m => m.projectId === project.id),
    [milestones, project.id]
  );

  const handleAddMilestone = (input: AddMilestoneInput) => {
    if (editTarget) {
      updateMilestone(editTarget.id, {
        name: input.name,
        description: input.description,
        dueDate: input.dueDate,
        linkedWorkItemIds: input.linkedWorkItemIds,
      });
      setEditTarget(null);
    } else {
      const milestone: PlannerMilestone = {
        id: `ms-${Date.now()}`,
        name: input.name,
        description: input.description,
        projectId: project.id,
        dueDate: input.dueDate,
        status: 'upcoming',
        ownerId: CURRENT_USER_ID,
        linkedWorkItemIds: input.linkedWorkItemIds,
      };
      addMilestone(milestone);
    }
    setDrawerOpen(false);
  };

  const getLinkedTasks = (milestone: PlannerMilestone) =>
    tasks.filter(t => milestone.linkedWorkItemIds.includes(t.id));

  const cycleStatus = (ms: PlannerMilestone) => {
    const next: Record<MilestoneStatus, MilestoneStatus> = {
      upcoming: 'reached',
      reached: 'missed',
      missed: 'upcoming',
    };
    updateMilestone(ms.id, { status: next[ms.status] });
  };

  const statusBadgeClass: Record<MilestoneStatus, string> = {
    upcoming: 'open',
    reached: 'active',
    missed: 'failed',
  };

  return (
    <div className="work-screen" style={{ padding: '0 20px 24px' }}>
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project Milestones</h3>
          <p className="work-screen__desc">Manage key project phases, deliverables, and timeline targets.</p>
        </div>
        <div className="work-screen__actions">
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={() => { setEditTarget(null); setDrawerOpen(true); }}>
            <Plus size={14} /> Add Milestone
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginTop: '16px' }}>
        {projectMilestones.map(ms => {
          const linkedTasks = getLinkedTasks(ms);
          const reached = ms.status === 'reached';

          return (
            <div key={ms.id} className="work-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: reached ? 'rgba(34, 197, 94, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    color: reached ? '#22c55e' : '#6366f1'
                  }}>
                    <Flag size={16} />
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-h)' }}>{ms.name}</h4>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-m)', marginTop: '2px' }}>
                      <Calendar size={12} />
                      Due {formatWorkDate(ms.dueDate)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className={`cfg-badge cfg-badge--${statusBadgeClass[ms.status]}`}
                    onClick={() => cycleStatus(ms)}
                    title="Click to cycle status"
                    style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                  >
                    {ms.status}
                  </button>
                  <button
                    type="button"
                    className="cfg-action-btn"
                    onClick={() => { setEditTarget(ms); setDrawerOpen(true); }}
                    aria-label={`Edit milestone ${ms.name}`}
                  >
                    <Pencil size={12} />
                  </button>
                  {deleteConfirmId === ms.id ? (
                    <>
                      <button
                        type="button"
                        className="org-btn org-btn--sm"
                        style={{ background: 'var(--clr-danger)', color: '#fff', fontSize: '11px', padding: '2px 8px' }}
                        onClick={() => { deleteMilestone(ms.id); setDeleteConfirmId(null); }}
                      >
                        Confirm
                      </button>
                      <button type="button" className="cfg-action-btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="cfg-action-btn"
                      onClick={() => setDeleteConfirmId(ms.id)}
                      aria-label={`Delete milestone ${ms.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {ms.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-m)', lineHeight: '1.4' }}>
                  {ms.description}
                </p>
              )}

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Layers size={13} style={{ color: 'var(--text-m)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-h)' }}>
                    Linked items ({linkedTasks.length})
                  </span>
                </div>

                {linkedTasks.length === 0 ? (
                  <p className="admin-hint" style={{ margin: 0, padding: '4px 0' }}>No work items linked to this milestone.</p>
                ) : (
                  <ul className="work-mini-list" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {linkedTasks.map(t => (
                      <li key={t.id} style={{ padding: '6px 0' }}>
                        <span className="work-task-key" style={{ marginRight: '6px' }}>{t.key}</span>
                        <span style={{ fontSize: '12.5px' }}>{t.title}</span>
                        <span className="work-mini-list__meta" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`cfg-badge cfg-badge--${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                          <span style={{ fontSize: '11px' }}>{TASK_STATUS_LABELS[t.status]}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
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

      <AddMilestoneDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        project={project}
        onSubmit={handleAddMilestone}
        editTarget={editTarget ?? undefined}
      />
    </div>
  );
};
