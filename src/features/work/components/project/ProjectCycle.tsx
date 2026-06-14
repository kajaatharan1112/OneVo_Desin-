import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  TASK_STATUS_LABELS,
  cycleWorkItems,
  employeeName,
  formatWorkDate,
  formatWorkDateRange,
  priorityBadgeClass,
  type ProjectCycle as ProjectCycleData,
  type TaskStatus,
  type WorkProject,
  type WorkTask,
} from '../../workMockData';
import { AddCycleDrawer, type AddCycleInput } from './AddCycleDrawer';
import { CycleBurndownChart } from './CycleBurndownChart';

interface Props {
  project: WorkProject;
}

interface BreakdownGroup {
  id: string;
  label: string;
  count: number;
}

const CYCLE_STATE_GROUPS: { id: string; label: string; match: (t: WorkTask, today: string) => boolean }[] = [
  {
    id: 'today',
    label: "Today's ideal pending",
    match: (t, today) => t.dueDate === today && t.status !== 'done',
  },
  { id: 'pending', label: 'Pending', match: t => t.status === 'todo' },
  { id: 'started', label: 'Started', match: t => t.status === 'in_progress' },
  { id: 'scope', label: 'Scope', match: t => t.status === 'review' },
];

const OTHER_STATE_GROUPS: { id: string; label: string; status: TaskStatus }[] = [
  { id: 'done', label: 'Done', status: 'done' },
  { id: 'unstarted', label: 'Unstarted', status: 'backlog' },
  { id: 'backlog', label: 'Backlog', status: 'backlog' },
];

const TODAY = '2026-06-14';

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000));
}

function daysElapsed(start: string, today: string): number {
  return Math.min(Math.max(0, daysBetween(start, today)), daysBetween(start, '2099-01-01'));
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="work-cycle-progress-ring" aria-label={`${pct}% complete`}>
      <svg viewBox="0 0 56 56" className="work-cycle-progress-ring__svg">
        <circle cx="28" cy="28" r={r} className="work-cycle-progress-ring__track" />
        <circle
          cx="28"
          cy="28"
          r={r}
          className="work-cycle-progress-ring__fill"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="work-cycle-progress-ring__label">{pct}%</span>
    </div>
  );
}

export const ProjectCycle: React.FC<Props> = ({ project }) => {
  const { addCycleSignal, cycles, addCycle, tasks } = useWork();
  const [activeExpanded, setActiveExpanded] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (addCycleSignal > 0) setDrawerOpen(true);
  }, [addCycleSignal]);

  const projectCycles = cycles.filter(c => c.projectId === project.id);
  const activeCycles = projectCycles.filter(c => c.status === 'active');
  const active = activeCycles[0];

  const cycleTasks = useMemo(
    () => (active ? cycleWorkItems(active, tasks) : []),
    [active, tasks]
  );

  const doneCount = cycleTasks.filter(t => t.status === 'done').length;
  const totalCount = cycleTasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const breakdown = useMemo((): BreakdownGroup[] => {
    const primary = CYCLE_STATE_GROUPS.map(g => ({
      id: g.id,
      label: g.label,
      count: cycleTasks.filter(t => g.match(t, TODAY)).length,
    }));
    const done = cycleTasks.filter(t => t.status === 'done').length;
    const backlog = cycleTasks.filter(t => t.status === 'backlog').length;
    return [
      ...primary,
      { id: 'done', label: 'Done', count: done },
      { id: 'unstarted', label: 'Unstarted', count: backlog },
      { id: 'backlog', label: 'Backlog', count: backlog },
    ];
  }, [cycleTasks]);

  const paceLabel = useMemo(() => {
    if (!active || totalCount === 0) return null;
    const totalDays = daysBetween(active.startDate, active.endDate);
    const elapsed = daysElapsed(active.startDate, TODAY);
    const idealDone = Math.floor((elapsed / totalDays) * totalCount);
    const diff = doneCount - idealDone;
    if (diff > 0) return `Leading by ${diff} work item${diff === 1 ? '' : 's'}`;
    if (diff < 0) return `Behind by ${Math.abs(diff)} work item${Math.abs(diff) === 1 ? '' : 's'}`;
    return 'On pace with ideal progress';
  }, [active, doneCount, totalCount]);

  const groupedTasks = useMemo(() => {
    const groups: { label: string; tasks: WorkTask[] }[] = [];
    for (const g of CYCLE_STATE_GROUPS) {
      const items = cycleTasks.filter(t => g.match(t, TODAY));
      if (items.length > 0) groups.push({ label: g.label, tasks: items });
    }
    for (const g of OTHER_STATE_GROUPS) {
      const items = cycleTasks.filter(t => t.status === g.status);
      if (items.length > 0 && !groups.some(gr => gr.label === g.label)) {
        groups.push({ label: g.label, tasks: items });
      }
    }
    return groups;
  }, [cycleTasks]);

  const handleAddCycle = (input: AddCycleInput) => {
    const newCycle: ProjectCycleData = {
      id: `cyc-${Date.now()}`,
      name: input.name,
      projectId: project.id,
      startDate: input.startDate,
      endDate: input.endDate,
      status: 'active',
      goal: input.goal,
      ownerId: CURRENT_USER_ID,
      workItemIds: input.workItemIds,
    };
    addCycle(newCycle);
    setActiveExpanded(true);
  };

  if (!active) {
    return (
      <div className="work-cycle-page">
        <div className="work-cycle-empty">
          <RefreshCw size={28} className="work-cycle-empty__icon" aria-hidden="true" />
          <h2 className="work-cycle-empty__title">No active cycle</h2>
          <p className="work-cycle-empty__desc">
            Create a cycle to plan focused work for this project.
          </p>
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={() => setDrawerOpen(true)}>
            <Plus size={14} /> Add cycle
          </button>
        </div>
        <AddCycleDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          project={project}
          onSubmit={handleAddCycle}
        />
      </div>
    );
  }

  const ownerId = active.ownerId ?? CURRENT_USER_ID;

  return (
    <div className="work-cycle-page">
      <section className="work-cycle-active-band">
        <button
          type="button"
          className="work-cycle-active-band__header"
          onClick={() => setActiveExpanded(e => !e)}
          aria-expanded={activeExpanded}
        >
          <span className="work-cycle-active-band__icon" aria-hidden="true">
            <RefreshCw size={14} />
          </span>
          <span className="work-cycle-active-band__label">Active cycle</span>
          <span className="work-cycle-active-band__count">{activeCycles.length}</span>
          <span className="work-cycle-active-band__chevron" aria-hidden="true">
            {activeExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {activeExpanded && (
          <div className="work-cycle-active-band__summary">
            <ProgressRing pct={progressPct} />
            <div className="work-cycle-active-band__info">
              <h2 className="work-cycle-active-band__name">{active.name}</h2>
              <span className="work-cycle-active-band__dates">
                {formatWorkDateRange(active.startDate, active.endDate)}
              </span>
            </div>
            <div className="work-cycle-active-band__owner" title={employeeName(ownerId)}>
              <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                {employeeName(ownerId).slice(0, 2)}
              </span>
            </div>
          </div>
        )}
      </section>

      {activeExpanded && (
        <>
          <div className="work-cycle-body">
            <section className="work-cycle-breakdown">
              <h3 className="work-cycle-breakdown__title">Cycle breakdown</h3>
              <p className="work-cycle-breakdown__desc">Breakdown of this cycle&apos;s work items</p>
              {paceLabel && (
                <p className={`work-cycle-breakdown__pace${paceLabel.startsWith('Behind') ? ' work-cycle-breakdown__pace--behind' : ''}`}>
                  {paceLabel}
                </p>
              )}
              <div className="work-cycle-breakdown__groups">
                <p className="work-cycle-breakdown__section-label">Work items by state</p>
                <ul className="work-cycle-breakdown__list">
                  {breakdown.slice(0, 4).map(g => (
                    <li key={g.id}>
                      <span>{g.label}</span>
                      <span className="work-cycle-breakdown__count">{g.count}</span>
                    </li>
                  ))}
                </ul>
                <p className="work-cycle-breakdown__section-label">Other states</p>
                <ul className="work-cycle-breakdown__list">
                  {breakdown.slice(4).map(g => (
                    <li key={g.id}>
                      <span>{g.label}</span>
                      <span className="work-cycle-breakdown__count">{g.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="work-cycle-breakdown__note">Excluded cancelled work items</p>
            </section>

            <section className="work-cycle-chart-panel">
              <div className="work-cycle-chart-panel__head">
                <select className="cfg-filter-select work-cycle-chart-panel__select" defaultValue="burndown" aria-label="Chart type">
                  <option value="burndown">Burn-down</option>
                </select>
                <span className="work-cycle-chart-panel__for">for Work items</span>
              </div>
              <CycleBurndownChart
                startDate={active.startDate}
                endDate={active.endDate}
                totalItems={totalCount}
                doneCount={doneCount}
                today={TODAY}
              />
            </section>
          </div>

          <section className="work-cycle-items">
            <h3 className="work-cycle-items__title">Work items in cycle</h3>
            {groupedTasks.map(group => (
              <div key={group.label} className="work-cycle-items__group">
                <h4 className="work-cycle-items__group-label">{group.label}</h4>
                <div className="work-cycle-items__table-wrap">
                  <table className="work-cycle-items__table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Assignee</th>
                        <th>Priority</th>
                        <th>Due date</th>
                        <th>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.tasks.map(task => (
                        <tr key={task.id}>
                          <td><span className="work-task-key">{task.key}</span></td>
                          <td>{task.title}</td>
                          <td>
                            <span className="work-cycle-items__assignee">
                              <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                                {employeeName(task.assigneeId).slice(0, 2)}
                              </span>
                              {employeeName(task.assigneeId)}
                            </span>
                          </td>
                          <td>
                            <span className={`cfg-badge cfg-badge--${priorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>{formatWorkDate(task.dueDate)}</td>
                          <td>{TASK_STATUS_LABELS[task.status]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      <AddCycleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        project={project}
        onSubmit={handleAddCycle}
      />
    </div>
  );
};
