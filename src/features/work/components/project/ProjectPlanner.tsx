import React, { useMemo, useState } from 'react';
import { Flag, Plus } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  MOCK_ROADMAP_ITEMS,
  TASK_STATUS_LABELS,
  formatWorkDate,
  formatWorkDateRange,
  formatWorkDateShort,
  priorityBadgeClass,
  type PlannerMilestone,
  type WorkProject,
} from '../../workMockData';
import { AddMilestoneDrawer, type AddMilestoneInput } from './AddMilestoneDrawer';

interface Props {
  project: WorkProject;
}

type PlanView = 'current' | 'baseline';

function dateToPct(date: string, rangeStart: number, rangeEnd: number): number {
  const t = new Date(date).getTime();
  return Math.min(100, Math.max(0, ((t - rangeStart) / (rangeEnd - rangeStart)) * 100));
}

export const ProjectPlanner: React.FC<Props> = ({ project }) => {
  const { milestones, tasks, addMilestone } = useWork();
  const [planView, setPlanView] = useState<PlanView>('current');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const projectMilestones = useMemo(
    () => milestones.filter(m => m.projectId === project.id),
    [milestones, project.id]
  );

  const roadmapItems = useMemo(
    () => MOCK_ROADMAP_ITEMS.filter(r => r.projectId === project.id),
    [project.id]
  );

  const timelineRange = useMemo(() => {
    const dates = [
      project.startDate,
      project.endDate,
      ...roadmapItems.flatMap(r => [r.startDate, r.endDate]),
      ...projectMilestones.map(m => m.dueDate),
    ].filter(Boolean) as string[];
    const times = dates.map(d => new Date(d).getTime());
    return {
      start: Math.min(...times),
      end: Math.max(...times),
    };
  }, [project, roadmapItems, projectMilestones]);

  const handleAddMilestone = (input: AddMilestoneInput) => {
    const milestone: PlannerMilestone = {
      id: `ms-${Date.now()}`,
      name: input.name,
      description: input.description,
      projectId: project.id,
      dueDate: input.dueDate,
      status: 'upcoming',
      ownerId: CURRENT_USER_ID,
      linkedWorkItemIds: input.linkedWorkItemIds,
      goalId: input.goalId,
    };
    addMilestone(milestone);
  };

  const getLinkedTasks = (milestone: PlannerMilestone) =>
    tasks.filter(t => milestone.linkedWorkItemIds.includes(t.id));

  return (
    <div className="work-screen">
      <div className="work-screen__head">
        <div>
          <h3 className="work-screen__title">Project planner</h3>
          <p className="work-screen__desc">Timeline, milestones, and planned work for {project.name}</p>
        </div>
        <div className="work-screen__actions">
          <div className="admin-segmented work-planner-baseline">
            <button
              type="button"
              className={`admin-segmented__btn${planView === 'current' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setPlanView('current')}
            >
              Current plan
            </button>
            <button
              type="button"
              className={`admin-segmented__btn${planView === 'baseline' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setPlanView('baseline')}
            >
              Baseline
            </button>
          </div>
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={() => setDrawerOpen(true)}>
            <Plus size={14} /> Add milestone
          </button>
        </div>
      </div>

      <section className={`work-panel work-panel--wide work-roadmap-panel${planView === 'baseline' ? ' work-roadmap-panel--baseline' : ''}`}>
        <h3 className="work-panel__title">Timeline / roadmap</h3>
        {planView === 'baseline' && (
          <p className="work-panel__desc">Baseline snapshot as of {formatWorkDate(project.startDate)}</p>
        )}
        <div className="work-roadmap-timeline">
          <div className="work-roadmap-timeline__axis">
            <span>{formatWorkDateShort(new Date(timelineRange.start).toISOString().slice(0, 10))}</span>
            <span>{formatWorkDateShort(new Date(timelineRange.end).toISOString().slice(0, 10))}</span>
          </div>
          <div className="work-roadmap-timeline__track">
            {roadmapItems.map(item => {
              const left = dateToPct(item.startDate, timelineRange.start, timelineRange.end);
              const right = dateToPct(item.endDate, timelineRange.start, timelineRange.end);
              return (
                <div
                  key={item.id}
                  className={`work-roadmap-bar work-roadmap-bar--${item.status.replace('_', '-')}`}
                  style={{ left: `${left}%`, width: `${Math.max(right - left, 4)}%` }}
                  title={`${item.name} (${formatWorkDateRange(item.startDate, item.endDate)})`}
                >
                  <span className="work-roadmap-bar__label">{item.name}</span>
                </div>
              );
            })}
            {projectMilestones.map(ms => {
              const left = dateToPct(ms.dueDate, timelineRange.start, timelineRange.end);
              return (
                <div
                  key={ms.id}
                  className={`work-roadmap-milestone work-roadmap-milestone--${ms.status}`}
                  style={{ left: `${left}%` }}
                  title={`${ms.name} · ${formatWorkDate(ms.dueDate)}`}
                >
                  <Flag size={10} />
                </div>
              );
            })}
          </div>
        </div>
        {roadmapItems.length === 0 && (
          <p className="admin-hint">No roadmap items for this project.</p>
        )}
      </section>

      <div className="work-cycle-columns">
        <section className="work-panel">
          <h3 className="work-panel__title">Milestones</h3>
          {projectMilestones.length === 0 ? (
            <p className="admin-hint">No milestones yet.</p>
          ) : (
            <ul className="work-mini-list">
              {projectMilestones.map(m => (
                <li key={m.id}>
                  <span>{m.name}</span>
                  <span className="work-mini-list__meta">
                    <span className={`cfg-badge cfg-badge--open`}>{m.status}</span>
                    {formatWorkDate(m.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="work-panel">
          <h3 className="work-panel__title">Planned work by milestone</h3>
          {projectMilestones.length === 0 ? (
            <p className="admin-hint">Add milestones to group planned work.</p>
          ) : (
            <div className="work-planner-milestone-groups">
              {projectMilestones.map(ms => {
                const linked = getLinkedTasks(ms);
                return (
                  <div key={ms.id} className="work-planner-milestone-group">
                    <h4 className="work-planner-milestone-group__title">
                      {ms.name}
                      <span className="work-mini-list__meta">{linked.length} items</span>
                    </h4>
                    {linked.length === 0 ? (
                      <p className="admin-hint">No linked work items.</p>
                    ) : (
                      <ul className="work-mini-list">
                        {linked.map(t => (
                          <li key={t.id}>
                            <span className="work-task-key">{t.key}</span>
                            <span>{t.title}</span>
                            <span className="work-mini-list__meta">
                              <span className={`cfg-badge cfg-badge--${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                              {TASK_STATUS_LABELS[t.status]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <AddMilestoneDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={project}
        onSubmit={handleAddMilestone}
      />
    </div>
  );
};
