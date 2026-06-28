import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Clock,
  Flag,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  Settings,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import {
  accessibleProjects,
  healthBadgeClass,
  healthLabel,
  isProjectAdmin,
  statusBadgeClass,
  visibilityBadgeShort,
  visibleWorkspaceIds,
  workspaceName,
  MOCK_TASKS,
} from '../workMockData';
import { ProjectIcon } from '../components/project/projectIcon';
import { projectCoverStyle, projectIconSurfaceStyle } from '../components/project/projectMedia';

type ViewMode = 'cards' | 'table';
type SortOrder = 'newest' | 'oldest' | 'due-date' | 'name';

const PRIORITY_COLOR: Record<string, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function progressPct(projectId: string): number {
  const all = MOCK_TASKS.filter(t => t.projectId === projectId);
  if (!all.length) return 0;
  const done = all.filter(t => t.status === 'done').length;
  return Math.round((done / all.length) * 100);
}

function elapsedHours(startDateIso: string): number {
  const start = new Date(startDateIso).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60));
}

/** Live per-second ticker for elapsed hours */
function useElapsedHours(startDateIso: string, isActive: boolean) {
  const [hours, setHours] = useState(() => elapsedHours(startDateIso));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) return;
    setHours(elapsedHours(startDateIso));
    intervalRef.current = setInterval(() => {
      setHours(elapsedHours(startDateIso));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startDateIso, isActive]);

  return hours;
}

/* ── Project Card with live timer ────────────────────────── */
interface ProjectCardProps {
  p: ReturnType<typeof accessibleProjects>[0];
  workspaces: ReturnType<typeof useWork>['workspaces'];
  visibleWs: Set<string>;
  openProject: ReturnType<typeof useWork>['openProject'];
  openProjectSettings: ReturnType<typeof useWork>['openProjectSettings'];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ p, workspaces, visibleWs, openProject, openProjectSettings }) => {
  const pct = progressPct(p.id);
  const priorityColor = PRIORITY_COLOR[p.priority ?? 'Medium'] ?? '#f59e0b';
  const isAdmin = isProjectAdmin(p);
  const isActiveProject = p.status === 'active';
  const elapsed = useElapsedHours(p.startDate, isActiveProject);

  const progressColor =
    pct >= 100 ? '#10b981' : pct >= 60 ? '#6366f1' : pct >= 30 ? '#f59e0b' : '#f97316';

  return (
    <article className="wpc">
      {/* Cover */}
      <div className="wpc__cover-wrap">
        <div className="wpc__cover" style={projectCoverStyle(p)} />
        <div className="wpc__cover-overlay" />
        {/* Badges float on cover */}
        <div className="wpc__cover-badges">
          <span className={`cfg-badge cfg-badge--${statusBadgeClass(p.status)}`}>
            {p.status.replace('_', ' ')}
          </span>
          <span className={`cfg-badge cfg-badge--${healthBadgeClass(p.health)}`}>
            {healthLabel(p.health)}
          </span>
        </div>
        {/* Icon */}
        <div className="wpc__icon" style={projectIconSurfaceStyle(p)}>
          <ProjectIcon icon={p.icon} size={20} />
        </div>
      </div>

      {/* Body */}
      <div className="wpc__body">
        {/* Title row */}
        <div className="wpc__title-row">
          <div>
            <span className="wpc__key">{p.key}</span>
            <h2 className="wpc__title">{p.name}</h2>
          </div>
          <span
            className="wpc__priority"
            style={{ background: `${priorityColor}18`, color: priorityColor }}
          >
            <Flag size={9} />
            {p.priority}
          </span>
        </div>

        {/* Description */}
        {p.description && (
          <p className="wpc__desc">{p.description}</p>
        )}

        {/* Workspace badges */}
        <div className="wpc__ws-row">
          {p.workspaceIds
            .filter(wsId => visibleWs.has(wsId))
            .map(wsId => (
              <span key={wsId} className="work-ws-badge">
                {workspaceName(wsId, workspaces)}
              </span>
            ))}
        </div>

        {/* Live Timer (hours only, for active projects) */}
        {isActiveProject && elapsed >= 0 && (
          <div className="wpc__timer">
            <Timer size={11} className="wpc__timer-icon" />
            <span className="wpc__timer-value">{elapsed.toLocaleString()}h</span>
            <span className="wpc__timer-label">running</span>
            <span className="wpc__timer-dot" />
          </div>
        )}

        {/* Progress */}
        <div className="wpc__progress-wrap">
          <div className="wpc__progress-header">
            <span className="wpc__progress-label">Progress</span>
            <span className="wpc__progress-pct" style={{ color: progressColor }}>{pct}%</span>
          </div>
          <div className="wpc__progress-track">
            <div
              className="wpc__progress-fill"
              style={{ width: `${pct}%`, background: progressColor }}
            />
          </div>
        </div>



        {/* Actions */}
        <div className="wpc__actions">
          <button
            type="button"
            className="wpc__btn-open"
            onClick={() => openProject(p.id)}
          >
            Open Project
          </button>
          {isAdmin && (
            <button
              type="button"
              className="wpc__btn-settings"
              onClick={() => { openProject(p.id, 'overview'); openProjectSettings(); }}
              aria-label="Project settings"
            >
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProjectsPage: React.FC = () => {
  const { workspaceFilterId, workspaces, projects, openProject, openModal, openProjectSettings } = useWork();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const visibleWs = useMemo(() => new Set(visibleWorkspaceIds()), []);

  const allAccessible = useMemo(
    () => accessibleProjects(workspaceFilterId, undefined, projects),
    [workspaceFilterId, projects]
  );

  const filtered = useMemo(() => {
    let list = allAccessible;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    return [...list].sort((a, b) => {
      if (sortOrder === 'due-date') {
        const aDue = a.dueDate ?? '9999-12-31';
        const bDue = b.dueDate ?? '9999-12-31';
        return aDue.localeCompare(bDue);
      }
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      const cmp = a.startDate.localeCompare(b.startDate);
      return sortOrder === 'newest' ? -cmp : cmp;
    });
  }, [allAccessible, search, statusFilter, sortOrder]);

  const active = useMemo(
    () => filtered.filter(p => p.status === 'active' || p.status === 'on_hold'),
    [filtered]
  );
  const archived = useMemo(
    () => filtered.filter(p => p.status === 'archived' || p.status === 'completed'),
    [filtered]
  );

  const showGrouped = !search.trim() && statusFilter === 'all';

  const totalActive = allAccessible.filter(p => p.status === 'active').length;
  const totalArchived = allAccessible.filter(p => p.status === 'archived' || p.status === 'completed').length;
  const totalOnHold = allAccessible.filter(p => p.status === 'on_hold').length;

  /* ── Table row ──────────────────────────────────────────── */
  const renderTableRow = (p: (typeof filtered)[0]) => {
    const pct = progressPct(p.id);
    const isAdmin = isProjectAdmin(p);
    return (
      <tr key={p.id}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={projectIconSurfaceStyle(p)} className="work-project-card__icon">
              <ProjectIcon icon={p.icon} size={14} />
            </div>
            <div>
              <div className="cfg-table__name">{p.name}</div>
              <div className="cfg-table__meta">{p.key} · {p.description}</div>
            </div>
          </div>
        </td>
        <td><span className="work-visibility-badge">{visibilityBadgeShort(p.visibility)}</span></td>
        <td><span className={`cfg-badge cfg-badge--${statusBadgeClass(p.status)}`}>{p.status.replace('_', ' ')}</span></td>
        <td><span className={`cfg-badge cfg-badge--${healthBadgeClass(p.health)}`}>{healthLabel(p.health)}</span></td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 100 }}>
            <div className="work-project-card__progress-bar" style={{ flex: 1, margin: 0 }}>
              <div className="work-project-card__progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-h)', minWidth: 28 }}>{pct}%</span>
          </div>
        </td>
        <td>
          <div className="work-project-card__ws-badges" style={{ flexWrap: 'nowrap' }}>
            {p.workspaceIds.filter(wsId => visibleWs.has(wsId)).map(wsId => (
              <span key={wsId} className="work-ws-badge">{workspaceName(wsId, workspaces)}</span>
            ))}
          </div>
        </td>
        <td>{p.members.filter(m => m.status === 'active').length}</td>
        <td>{p.openTasks}</td>
        <td>{formatDate(p.dueDate) ?? '—'}</td>
        <td>
          <div className="work-table-actions">
            <button type="button" className="cfg-action-btn" onClick={() => openProject(p.id)}>Open</button>
            {isAdmin && (
              <button
                type="button"
                className="cfg-action-btn"
                onClick={() => { openProject(p.id, 'overview'); openProjectSettings(); }}
              >
                Settings
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const cardProps = { workspaces, visibleWs, openProject, openProjectSettings };

  return (
    <div className="proj-page">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="proj-page__hero">
        <div className="proj-page__hero-content">
          <div>
            <h1 className="proj-page__title">Projects</h1>
            <p className="proj-page__subtitle">Manage your project portfolio across workspaces.</p>
          </div>
          <button
            type="button"
            className="proj-page__new-btn"
            id="create-project-btn"
            onClick={() => openModal('create-project')}
          >
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Stats strip */}
        <div className="proj-page__stats">
          {[
            { label: 'Total', value: allAccessible.length, icon: <FolderOpen size={15} />, color: '#6366f1' },
            { label: 'Active', value: totalActive, icon: <TrendingUp size={15} />, color: '#10b981' },
            { label: 'On Hold', value: totalOnHold, icon: <Clock size={15} />, color: '#f59e0b' },
            { label: 'Archived', value: totalArchived, icon: <Archive size={15} />, color: '#94a3b8' },
          ].map(stat => (
            <div key={stat.label} className="proj-stat">
              <div className="proj-stat__icon" style={{ color: stat.color, background: `${stat.color}18` }}>
                {stat.icon}
              </div>
              <div>
                <p className="proj-stat__value" style={{ color: stat.color }}>{stat.value}</p>
                <p className="proj-stat__label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="proj-page__toolbar">
        <div className="proj-search">
          <Search size={14} className="proj-search__icon" />
          <input
            id="projects-search"
            className="proj-search__input"
            placeholder="Search by name, key or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="proj-page__filters">
          <select
            className="cfg-filter-select"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            aria-label="Sort order"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="due-date">Due date</option>
            <option value="name">Name A–Z</option>
          </select>
          <select
            className="cfg-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Status filter"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="on_hold">On hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <div className="work-view-toggle admin-segmented">
            <button
              type="button"
              className={`admin-segmented__btn${viewMode === 'cards' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setViewMode('cards')}
              aria-label="Card view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              className={`admin-segmented__btn${viewMode === 'table' ? ' admin-segmented__btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="proj-page__body">
        {viewMode === 'table' ? (
          <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Progress</th>
                  <th>Workspaces</th>
                  <th>Members</th>
                  <th>Tasks</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(renderTableRow)}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="cfg-empty">
                <p className="cfg-empty__title">No projects match your filters</p>
                <p className="cfg-empty__desc">Try adjusting your search or status filter.</p>
              </div>
            )}
          </div>
        ) : showGrouped ? (
          <>
            {active.length > 0 && (
              <section className="proj-section">
                <div className="proj-section__header">
                  <TrendingUp size={13} />
                  <span>Active Projects</span>
                  <span className="proj-section__count">{active.length}</span>
                </div>
                <div className="proj-grid">
                  {active.map(p => <ProjectCard key={p.id} p={p} {...cardProps} />)}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section className="proj-section">
                <div className="proj-section__header">
                  <Archive size={13} />
                  <span>Completed &amp; Archived</span>
                  <span className="proj-section__count">{archived.length}</span>
                </div>
                <div className="proj-grid">
                  {archived.map(p => <ProjectCard key={p.id} p={p} {...cardProps} />)}
                </div>
              </section>
            )}

            {allAccessible.length === 0 && (
              <div className="proj-empty">
                <FolderOpen size={48} className="proj-empty__icon" />
                <p className="proj-empty__title">No projects yet</p>
                <p className="proj-empty__desc">Create your first project to get started.</p>
                <button
                  type="button"
                  className="org-btn org-btn--primary"
                  style={{ marginTop: 16 }}
                  onClick={() => openModal('create-project')}
                >
                  <Plus size={14} /> Create Project
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="proj-grid">
              {filtered.map(p => <ProjectCard key={p.id} p={p} {...cardProps} />)}
            </div>
            {filtered.length === 0 && (
              <div className="cfg-empty">
                <p className="cfg-empty__title">No projects match your filters</p>
                <p className="cfg-empty__desc">Try adjusting your search or status filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
