import React, { useState } from 'react';
import { Archive, Trash2, Link2, Plus, Unlink } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  employeeById,
  workspaceName,
  type ProjectHealth,
  type ProjectStatus,
  type TaskPriority,
  type WorkProject,
} from '../../workMockData';
import { AddWorkspaceModal } from './AddWorkspaceModal';
import { RequestWorkspaceModal } from './RequestWorkspaceModal';

interface Props {
  project: WorkProject;
  embedded?: boolean;
}

export const ProjectSettings: React.FC<Props> = ({ project, embedded = false }) => {
  const { updateProject, unlinkWorkspace, workspaces } = useWork();
  const [addWsOpen, setAddWsOpen] = useState(false);
  const [requestWsOpen, setRequestWsOpen] = useState(false);
  const [form, setForm] = useState({
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    health: project.health,
    startDate: project.startDate,
    endDate: project.endDate ?? '',
    defaultPriority: project.defaultPriority,
    timezone: project.timezone,
  });

  const save = () => {
    updateProject(project.id, {
      name: form.name,
      key: form.key.toUpperCase(),
      description: form.description,
      status: form.status as ProjectStatus,
      health: form.health as ProjectHealth,
      startDate: form.startDate,
      endDate: form.endDate || null,
      defaultPriority: form.defaultPriority as TaskPriority,
      timezone: form.timezone,
    });
  };

  const projectMembersFromWs = (wsId: string) =>
    project.members.filter(m => {
      const emp = employeeById(m.employeeId);
      return emp?.workspaceIds.includes(wsId);
    }).length;

  return (
    <div className={`work-settings${embedded ? ' work-settings--embedded' : ' work-screen'}`}>
      {!embedded && (
        <div className="work-screen__head work-screen__head--compact">
          <p className="work-screen__desc">Configure project details, access, linked workspaces, and work structure.</p>
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={save}>Save changes</button>
        </div>
      )}
      {embedded && (
        <div className="work-settings__save-row">
          <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={save}>Save changes</button>
        </div>
      )}

      <section className="work-settings-section">
        <h3 className="work-settings-section__title">General</h3>
        <div className="settings-form-grid work-settings-grid">
          <div className="org-form-field">
            <label htmlFor="set-name">Project name</label>
            <input id="set-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="set-key">Project key / code</label>
            <input id="set-key" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))} />
          </div>
          <div className="org-form-field work-settings-grid__full">
            <label htmlFor="set-desc">Description</label>
            <textarea id="set-desc" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="set-status">Status</label>
            <select id="set-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="set-health">Health</label>
            <select id="set-health" value={form.health} onChange={e => setForm(f => ({ ...f, health: e.target.value as ProjectHealth }))}>
              <option value="on_track">On track</option>
              <option value="at_risk">At risk</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="set-start">Start date</label>
            <input id="set-start" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="set-end">End date</label>
            <input id="set-end" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="set-priority">Default priority</label>
            <select id="set-priority" value={form.defaultPriority} onChange={e => setForm(f => ({ ...f, defaultPriority: e.target.value as TaskPriority }))}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="set-tz">Project timezone</label>
            <select id="set-tz" value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        </div>
      </section>

      <section className="work-settings-section">
        <div className="work-screen__head work-screen__head--compact">
          <div>
            <h3 className="work-settings-section__title">Linked workspaces</h3>
            <p className="work-screen__desc">
              Linked workspaces provide team context. Project visibility still depends on project membership.
            </p>
          </div>
          <div className="work-screen__actions">
            <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setAddWsOpen(true)}>
              <Plus size={14} /> Add workspace
            </button>
            <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setRequestWsOpen(true)}>
              Request workspace
            </button>
          </div>
        </div>
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Members in workspace</th>
                <th>Project members from workspace</th>
                <th>Status</th>
                <th>Context / purpose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {project.linkedWorkspaces.map(lw => {
                const ws = workspaces.find(w => w.id === lw.workspaceId);
                return (
                  <tr key={lw.workspaceId}>
                    <td className="cfg-table__name"><Link2 size={12} /> {workspaceName(lw.workspaceId, workspaces)}</td>
                    <td>{ws?.memberCount ?? '—'}</td>
                    <td>{projectMembersFromWs(lw.workspaceId)}</td>
                    <td><span className={`cfg-badge cfg-badge--${lw.status === 'active' ? 'active' : 'open'}`}>{lw.status}</span></td>
                    <td>{lw.role}</td>
                    <td>
                      {lw.status === 'active' && (
                        <button type="button" className="cfg-action-btn" onClick={() => unlinkWorkspace(project.id, lw.workspaceId)}>
                          <Unlink size={12} /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="work-settings-section">
        <h3 className="work-settings-section__title">Members & access</h3>
        <p className="admin-hint">{project.members.length} project members with explicit access. Manage members from project settings.</p>
      </section>

      <section className="work-settings-section">
        <h3 className="work-settings-section__title">Work item states</h3>
        <div className="settings-readonly">Backlog · Todo · In Progress · Review · Done</div>
      </section>

      <section className="work-settings-section">
        <h3 className="work-settings-section__title">Labels</h3>
        <div className="settings-readonly">design, frontend, backend, ux, security, infra, docs, planning, mobile, metrics, tracing, navigation, settings</div>
      </section>

      <section className="work-settings-section work-settings-section--danger">
        <h3 className="work-settings-section__title">Danger zone</h3>
        <div className="work-danger-actions">
          <button type="button" className="org-btn org-btn--secondary org-btn--sm"><Archive size={14} /> Archive project</button>
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" disabled title="Disabled in demo"><Trash2 size={14} /> Delete project</button>
        </div>
        <p className="admin-hint admin-hint--warning">Delete is disabled in demo. Archive requires confirmation in production.</p>
      </section>

      <AddWorkspaceModal open={addWsOpen} onClose={() => setAddWsOpen(false)} project={project} />
      <RequestWorkspaceModal open={requestWsOpen} onClose={() => setRequestWsOpen(false)} project={project} />
    </div>
  );
};
