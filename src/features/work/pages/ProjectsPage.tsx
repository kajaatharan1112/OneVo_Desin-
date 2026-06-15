import React, { useMemo, useState } from 'react';
import { LayoutGrid, List, Plus, Search, Settings } from 'lucide-react';
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
} from '../workMockData';
import { ProjectIcon } from '../components/project/projectIcon';
import { projectCoverStyle, projectIconSurfaceStyle } from '../components/project/projectMedia';

type ViewMode = 'cards' | 'table';
type SortOrder = 'newest' | 'oldest' | 'due-date' | 'name';

export const ProjectsPage: React.FC = () => {
  const { workspaceFilterId, workspaces, projects, openProject, openModal, openProjectSettings } = useWork();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const visibleWs = useMemo(() => new Set(visibleWorkspaceIds()), []);

  const filtered = useMemo(() => {
    let list = accessibleProjects(workspaceFilterId, undefined, projects);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (healthFilter !== 'all') list = list.filter(p => p.health === healthFilter);
    list = [...list].sort((a, b) => {
      if (sortOrder === 'due-date') {
        const aDue = a.dueDate ?? '9999-12-31';
        const bDue = b.dueDate ?? '9999-12-31';
        return aDue.localeCompare(bDue);
      }
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      const cmp = a.startDate.localeCompare(b.startDate);
      return sortOrder === 'newest' ? -cmp : cmp;
    });
    return list;
  }, [workspaceFilterId, projects, search, statusFilter, healthFilter, sortOrder]);

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Projects</h1>
          <p className="cfg-page__subtitle">
            Projects you can access in the selected workspace scope.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={() => openModal('create-project')}>
          <Plus size={14} /> Add Project
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="cfg-filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)}>
          <option value="newest">Created date · Newest</option>
          <option value="oldest">Created date · Oldest</option>
          <option value="due-date">Due date</option>
          <option value="name">Name</option>
        </select>
        <select className="cfg-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="on_hold">On hold</option>
          <option value="completed">Completed</option>
        </select>
        <select className="cfg-filter-select" value={healthFilter} onChange={e => setHealthFilter(e.target.value)}>
          <option value="all">All health</option>
          <option value="on_track">On track</option>
          <option value="at_risk">At risk</option>
          <option value="delayed">Delayed</option>
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

      <div className="cfg-page__body">
        {viewMode === 'cards' ? (
          <div className="work-project-grid">
            {filtered.map(p => (
              <article key={p.id} className="work-project-card">
                <div className="work-project-card__media">
                  <div className="work-project-card__cover" style={projectCoverStyle(p)} />
                  <div className="work-project-card__icon" style={projectIconSurfaceStyle(p)}>
                    <ProjectIcon icon={p.icon} size={18} />
                  </div>
                </div>
                <div className="work-project-card__body">
                  <div className="work-project-card__header">
                    <div>
                      <h2 className="work-project-card__title">{p.name}</h2>
                      <span className="work-project-card__key">{p.key}</span>
                    </div>
                    <div className="work-project-card__badges">
                      <span className="work-visibility-badge">{visibilityBadgeShort(p.visibility)}</span>
                      <span className={`cfg-badge cfg-badge--${statusBadgeClass(p.status)}`}>{p.status.replace('_', ' ')}</span>
                      <span className={`cfg-badge cfg-badge--${healthBadgeClass(p.health)}`}>{healthLabel(p.health)}</span>
                    </div>
                  </div>
                  <p className="work-project-card__desc">{p.description}</p>
                  <div className="work-project-card__ws-badges">
                    {p.workspaceIds
                      .filter(wsId => visibleWs.has(wsId))
                      .map(wsId => (
                        <span key={wsId} className="work-ws-badge">{workspaceName(wsId, workspaces)}</span>
                      ))}
                  </div>
                  <dl className="work-project-card__meta">
                    <div><dt>Members</dt><dd>{p.members.filter(m => m.status === 'active').length}</dd></div>
                    <div><dt>Open tasks</dt><dd>{p.openTasks}</dd></div>
                  </dl>
                  <div className="work-project-card__actions">
                    <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={() => openProject(p.id)}>
                      Open
                    </button>
                    {isProjectAdmin(p) && (
                      <button
                        type="button"
                        className="org-btn org-btn--secondary org-btn--sm org-btn--icon"
                        onClick={() => { openProject(p.id, 'overview'); openProjectSettings(); }}
                        aria-label="Project settings"
                      >
                        <Settings size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Workspaces</th>
                  <th>Members</th>
                  <th>Open tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="cfg-table__name">{p.name}</div>
                      <div className="cfg-table__meta">{p.key} · {p.description}</div>
                    </td>
                    <td><span className="work-visibility-badge">{visibilityBadgeShort(p.visibility)}</span></td>
                    <td><span className={`cfg-badge cfg-badge--${statusBadgeClass(p.status)}`}>{p.status.replace('_', ' ')}</span></td>
                    <td><span className={`cfg-badge cfg-badge--${healthBadgeClass(p.health)}`}>{healthLabel(p.health)}</span></td>
                    <td>
                      <div className="work-project-card__ws-badges">
                        {p.workspaceIds
                          .filter(wsId => visibleWs.has(wsId))
                          .map(wsId => (
                            <span key={wsId} className="work-ws-badge">{workspaceName(wsId, workspaces)}</span>
                          ))}
                      </div>
                    </td>
                    <td>{p.members.filter(m => m.status === 'active').length}</td>
                    <td>{p.openTasks}</td>
                    <td>
                      <div className="work-table-actions">
                        <button type="button" className="cfg-action-btn" onClick={() => openProject(p.id)}>Open</button>
                        {isProjectAdmin(p) && (
                          <button type="button" className="cfg-action-btn" onClick={() => { openProject(p.id, 'overview'); openProjectSettings(); }}>Settings</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="cfg-empty">
            <p className="cfg-empty__title">No accessible projects in this workspace context</p>
            <p className="cfg-empty__desc">Project visibility depends on project membership, not workspace membership alone.</p>
          </div>
        )}
      </div>
    </div>
  );
};
