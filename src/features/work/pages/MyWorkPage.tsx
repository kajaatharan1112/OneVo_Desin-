import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckSquare,
  Layers,
  Plus,
  Search,
  User,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import { WorkItemDetailDrawer } from '../components/project/WorkItemDetailDrawer';
import {
  CURRENT_USER_ID,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  formatWorkDate,
  myTasks,
  priorityBadgeClass,
  type TaskPriority,
  type TaskStatus,
  type WorkTask,
} from '../workMockData';

type DueFilter = 'all' | 'overdue' | 'this-week';

const TODAY = '2026-06-14';

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate < TODAY;
}

function isThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date(TODAY);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return due >= today && due <= weekEnd;
}

function groupByProject(tasks: WorkTask[]): { projectId: string; projectName: string; tasks: WorkTask[] }[] {
  const map = new Map<string, { projectName: string; tasks: WorkTask[] }>();
  for (const t of tasks) {
    const existing = map.get(t.projectId);
    if (existing) existing.tasks.push(t);
    else map.set(t.projectId, { projectName: t.projectName, tasks: [t] });
  }
  return Array.from(map.entries()).map(([projectId, { projectName, tasks: groupTasks }]) => ({
    projectId,
    projectName,
    tasks: groupTasks,
  }));
}

export const MyWorkPage: React.FC = () => {
  const { workspaceFilterId, setWorkspaceFilterId, workspaces, projects, tasks, openTaskDetail, openModal } = useWork();
  const [activeTab, setActiveTab] = useState<'workspaces' | 'tasks' | 'activity'>('workspaces');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');

  const filtered = useMemo(() => {
    let list = myTasks(workspaceFilterId, CURRENT_USER_ID, projects, tasks);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') list = list.filter(t => t.priority === priorityFilter);
    if (dueFilter === 'overdue') list = list.filter(t => isOverdue(t.dueDate));
    if (dueFilter === 'this-week') list = list.filter(t => isThisWeek(t.dueDate));
    return list;
  }, [workspaceFilterId, projects, tasks, search, statusFilter, priorityFilter, dueFilter]);

  const groups = useMemo(() => groupByProject(filtered), [filtered]);

  // Mock workspace activity feed logs
  const activityLogs = useMemo(() => [
    { id: '1', user: 'Alex Rivera', action: 'completed milestone task', target: 'Design System Implementation', time: '10 mins ago', type: 'task' },
    { id: '2', user: 'Priya Sharma', action: 'added a new member owner to', target: 'Engineering Workspace', time: '1 hr ago', type: 'member' },
    { id: '3', user: 'Maria Lopez', action: 'linked project gateway cutover to', target: 'Backend Workspace', time: '3 hrs ago', type: 'link' },
    { id: '4', user: 'Sam Okonkwo', action: 'created milestone', target: 'Mobile beta launch', time: 'Yesterday', type: 'milestone' },
    { id: '5', user: 'James Chen', action: 'updated description parameters of', target: 'Product Workspace', time: '2 days ago', type: 'update' }
  ], []);

  return (
    <div className="cfg-page" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .mywork-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        .mywork-tab-btn {
          background: none;
          border: none;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-m);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .mywork-tab-btn:hover {
          color: var(--accent);
        }
        .mywork-tab-btn--active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .ws-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 16px;
        }
        .ws-card {
          background: var(--surface-card, #ffffff);
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ws-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
          border-color: var(--accent);
        }
        .ws-card-header {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .ws-card-logo {
          width: 44px;
          height: 44px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--accent);
        }
        .ws-card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-h, #0f172a);
          margin: 0;
        }
        .ws-card-type {
          font-size: 11px;
          color: var(--text-s);
          text-transform: uppercase;
          font-weight: 600;
        }
        .ws-card-desc {
          font-size: 13px;
          color: var(--text-m);
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }
        .ws-card-footer {
          border-top: 1px solid var(--border);
          padding-top: 12px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-s);
        }
        
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 12px;
        }
        .activity-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 8px;
          align-items: center;
        }
        .activity-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-m);
        }
        .activity-detail {
          font-size: 13px;
          color: var(--text-m);
          flex: 1;
        }
        .activity-time {
          font-size: 11.5px;
          color: var(--text-s);
        }
      ` }} />

      <div className="cfg-page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="cfg-page__title">My Work Workspace</h1>
            <p className="cfg-page__subtitle">Overview of your workspaces, goals, and tasks</p>
          </div>
          {activeTab === 'workspaces' && (
            <button
              type="button"
              className="org-btn org-btn--primary org-btn--sm"
              onClick={() => openModal('create-workspace')}
            >
              <Plus size={14} /> Create Workspace
            </button>
          )}
        </div>
      </div>

      <div className="mywork-tabs">
        <button
          type="button"
          className={`mywork-tab-btn${activeTab === 'workspaces' ? ' mywork-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('workspaces')}
        >
          <Layers size={14} /> Workspaces ({workspaces.length})
        </button>
        <button
          type="button"
          className={`mywork-tab-btn${activeTab === 'tasks' ? ' mywork-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={14} /> My Tasks ({filtered.length})
        </button>
        <button
          type="button"
          className={`mywork-tab-btn${activeTab === 'activity' ? ' mywork-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={14} /> Workspace Activity
        </button>
      </div>

      {activeTab === 'workspaces' && (
        /* ─── Tab 1: Workspaces Card Grid ─── */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 6px' }}>
            <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text-h)' }}>Available Workspaces</h3>
          </div>
          <div className="ws-grid">
            {workspaces.map(ws => (
              <div
                key={ws.id}
                className="ws-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setWorkspaceFilterId(ws.id)}
              >
                <div className="ws-card-header">
                  <div className="ws-card-logo" style={{ overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                    {ws.logoUrl ? (
                      ws.logoUrl.startsWith('http') || ws.logoUrl.includes('/') || ws.logoUrl.includes('.') ? (
                        <img
                          src={ws.logoUrl}
                          alt={ws.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallback = document.createElement('span');
                              fallback.innerText = '🖼️';
                              fallback.style.fontSize = '18px';
                              parent.appendChild(fallback);
                            }
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', padding: '2px', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.1 }}>
                          <span style={{ fontSize: '14px' }}>🖼️</span>
                          <span style={{ fontSize: '7px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.logoUrl}</span>
                        </div>
                      )
                    ) : (
                      ws.icon || '🏢'
                    )}
                  </div>
                  <div>
                    <h4 className="ws-card-title">{ws.name}</h4>
                    <span className="ws-card-type">{ws.type || 'General'} Template</span>
                  </div>
                  {workspaceFilterId === ws.id && (
                    <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Active</span>
                  )}
                </div>
                <p className="ws-card-desc">{ws.description || 'No description provided.'}</p>
                
                {ws.logoUrl && (
                  <div style={{ fontSize: '11px', color: 'var(--clr-text-secondary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span>🖼️ Attached Logo:</span>
                    <strong style={{ color: 'var(--text-m)' }}>{ws.logoUrl}</strong>
                  </div>
                )}

                <div className="ws-card-footer">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    Owner: <strong>{ws.ownerName}</strong>
                  </span>
                  <span>{ws.memberCount} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        /* ─── Tab 2: My Tasks List View ─── */
        <div>
          <div className="cfg-page__toolbar">
            <div className="cfg-search">
              <Search size={14} />
              <input
                placeholder="Search tasks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="cfg-filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as TaskStatus | 'all')}
            >
              <option value="all">All statuses</option>
              {TASK_STATUSES.map(s => (
                <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <select
              className="cfg-filter-select"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            >
              <option value="all">All priorities</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <select
              className="cfg-filter-select"
              value={dueFilter}
              onChange={e => setDueFilter(e.target.value as DueFilter)}
            >
              <option value="all">All due dates</option>
              <option value="overdue">Overdue</option>
              <option value="this-week">This week</option>
            </select>
          </div>

          <div className="cfg-page__body" style={{ marginTop: '16px' }}>
            {groups.map(group => (
              <section key={group.projectId} className="work-my-work-group" style={{ marginBottom: '24px' }}>
                <h2 className="work-my-work-group__title">{group.projectName}</h2>
                <div className="cfg-table-wrap">
                  <table className="cfg-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Project</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.tasks.map(t => (
                        <tr
                          key={t.id}
                          className="cfg-table__clickable"
                          onClick={() => openTaskDetail(t.id)}
                        >
                          <td><span className="work-task-key">{t.key}</span></td>
                          <td className="cfg-table__name">{t.title}</td>
                          <td>{t.projectName}</td>
                          <td>
                            <span className="cfg-badge cfg-badge--open">{TASK_STATUS_LABELS[t.status]}</span>
                          </td>
                          <td>
                            <span className={`cfg-badge cfg-badge--${priorityBadgeClass(t.priority)}`}>{t.priority}</span>
                          </td>
                          <td className={isOverdue(t.dueDate) && t.status !== 'done' ? 'work-due--overdue' : ''}>
                            {formatWorkDate(t.dueDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            {filtered.length === 0 && (
              <div className="cfg-empty">
                <p className="cfg-empty__title">No tasks assigned to you</p>
                <p className="cfg-empty__desc">Try adjusting filters or check another workspace scope.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        /* ─── Tab 3: Workspace Activity Timeline Feed ─── */
        <div>
          <h3 style={{ margin: '12px 0 8px', fontSize: '14.5px', fontWeight: 700, color: 'var(--text-h)' }}>Workspace Activity Feed</h3>
          <div className="activity-timeline">
            {activityLogs.map(log => (
              <div key={log.id} className="activity-item">
                <div className="activity-icon-wrap">
                  <Activity size={14} />
                </div>
                <div className="activity-detail">
                  <strong>{log.user}</strong> {log.action} <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{log.target}</span>
                </div>
                <div className="activity-time">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <WorkItemDetailDrawer />
    </div>
  );
};
