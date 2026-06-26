import React, { useEffect, useRef, useState } from 'react';
import { Archive, Image, Link2, Lock, Pencil, Plus, Trash2, Unlink, Users, X, Calendar, Clock, Zap } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { CompactPillDropdown, type PillDropdownOption } from '../CompactPillDropdown';
import {
  employeeById,
  isProjectAdmin,
  participatingAccessShort,
  projectHasWorkItems,
  resolveRelatedProjectDisplay,
  type LinkedWorkspace,
  type ProjectHealth,
  type ProjectStatus,
  type ProjectVisibility,
  type WorkProject,
} from '../../workMockData';
import type { ProjectSettingsSectionId } from '../../projectSettingsNav';
import { AddWorkspaceModal } from './AddWorkspaceModal';
import { LinkRelatedProjectDrawer } from './LinkRelatedProjectDrawer';
import { ManageParticipatingWorkspaceModal } from './ManageParticipatingWorkspaceModal';
import { RequestWorkspaceModal } from './RequestWorkspaceModal';
import { ProjectMembersSettings } from './ProjectMembersSettings';
import { ProjectWorklogsSettings } from './ProjectWorklogsSettings';
import { PROJECT_COVER_COLORS } from './ProjectCoverColors';
import { ProjectIconPicker } from './ProjectIconPicker';
import { ProjectIcon } from './projectIcon';
import { projectCoverStyle, resolveProjectIconType } from './projectMedia';

interface Props {
  project: WorkProject;
  section: ProjectSettingsSectionId;
}

const LABEL_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#64748b', '#0ea5e9'];

const SETTINGS_VISIBILITY_OPTIONS: PillDropdownOption[] = [
  {
    id: 'private',
    label: 'Private',
    subtext: 'Only invited project members can open this project.',
  },
  {
    id: 'public_workspace',
    label: 'Workspace visible',
    subtext: 'Members of participating workspaces can open this project.',
  },
];

const FEATURE_PLACEHOLDERS: Record<'cycle' | 'planner', string> = {
  cycle: 'Cycle settings are managed from the Cycle view in this project.',
  planner: 'Planner settings are managed from the Planner view in this project.',
};

function daysBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}
function daysFromNow(iso: string): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.round(ms / 86400000);
}

export const ProjectSettings: React.FC<Props> = ({ project, section }) => {
  const {
    updateProject,
    restoreProject,
    duplicateProject,
    openProject,
    unlinkWorkspace,
    workspaces,
    tasks,
    relatedProjects,
    removeRelatedProject,
  } = useWork();
  const iconRef = useRef<HTMLButtonElement>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [addWsOpen, setAddWsOpen] = useState(false);
  const [requestWsOpen, setRequestWsOpen] = useState(false);
  const [linkRelatedOpen, setLinkRelatedOpen] = useState(false);
  const [manageWs, setManageWs] = useState<LinkedWorkspace | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  
  // Custom Fields Configuration States
  const [newCfName, setNewCfName] = useState('');
  const [newCfType, setNewCfType] = useState<'text' | 'number' | 'select'>('text');
  const [newCfOptions, setNewCfOptions] = useState('');

  // Duplication States
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [cloneTasks, setCloneTasks] = useState(true);

  const keyLocked = projectHasWorkItems(project.id, tasks);
  const [form, setForm] = useState({
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    health: project.health,
    priority: project.priority || 'Medium',
    visibility: project.visibility,
    icon: project.icon,
    coverColor: project.coverColor,
    coverImage: project.coverImage,
    iconColor: project.iconColor,
    startDate: project.startDate || '',
    dueDate: project.dueDate || '',
    allocatedHours: project.allocatedHours !== undefined ? String(project.allocatedHours) : '',
    budgetLimit: project.budgetLimit !== undefined ? String(project.budgetLimit) : '',
    riskLevel: project.riskLevel || 'Medium',
    tags: project.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setForm({
      name: project.name,
      key: project.key,
      description: project.description,
      status: project.status,
      health: project.health,
      priority: project.priority || 'Medium',
      visibility: project.visibility,
      icon: project.icon,
      coverColor: project.coverColor,
      coverImage: project.coverImage,
      iconColor: project.iconColor,
      startDate: project.startDate || '',
      dueDate: project.dueDate || '',
      allocatedHours: project.allocatedHours !== undefined ? String(project.allocatedHours) : '',
      budgetLimit: project.budgetLimit !== undefined ? String(project.budgetLimit) : '',
      riskLevel: project.riskLevel || 'Medium',
      tags: project.tags || [],
    });
    setTagInput('');
  }, [project]);

  const addTag = (t: string) => {
    const tag = t.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || form.tags.includes(tag)) return;
    setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (t: string) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const saveGeneral = () => {
    updateProject(project.id, {
      name: form.name,
      description: form.description,
      status: form.status as ProjectStatus,
      health: form.health as ProjectHealth,
      priority: form.priority as 'Low' | 'Medium' | 'High',
      icon: form.icon,
      iconType: resolveProjectIconType(form.icon),
      iconColor: form.iconColor,
      coverColor: form.coverColor,
      coverImage: form.coverImage,
      ...(!keyLocked ? { key: form.key.trim().toUpperCase() } : {}),
    });
  };

  const saveSchedule = () => {
    updateProject(project.id, {
      startDate: form.startDate,
      dueDate: form.dueDate || null,
      allocatedHours: form.allocatedHours ? parseInt(form.allocatedHours, 10) : undefined,
      priority: form.priority as 'Low' | 'Medium' | 'High',
    });
  };

  const saveAdvanced = () => {
    updateProject(project.id, {
      budgetLimit: form.budgetLimit ? parseInt(form.budgetLimit, 10) : undefined,
      riskLevel: form.riskLevel as 'Low' | 'Medium' | 'High' | 'Critical',
      tags: form.tags,
    });
  };

  const handleStartDateChange = (newStart: string) => {
    setForm(f => {
      const nextForm = { ...f, startDate: newStart };
      if (newStart && nextForm.dueDate) {
        const days = daysBetween(newStart, nextForm.dueDate) + 1;
        nextForm.allocatedHours = String(days * 8);
      }
      return nextForm;
    });
  };

  const handleDueDateChange = (newDue: string) => {
    setForm(f => {
      const nextForm = { ...f, dueDate: newDue };
      if (nextForm.startDate && newDue) {
        const days = daysBetween(nextForm.startDate, newDue) + 1;
        nextForm.allocatedHours = String(days * 8);
      }
      return nextForm;
    });
  };

  const changeVisibility = (next: ProjectVisibility) => {
    if (next === form.visibility) return;
    if (next === 'public_workspace') {
      const ok = window.confirm(
        'Members of participating workspaces will be able to open this project.',
      );
      if (!ok) return;
    } else {
      const ok = window.confirm(
        'Only invited project members will keep access.',
      );
      if (!ok) return;
    }
    setForm(f => ({ ...f, visibility: next }));
    updateProject(project.id, { visibility: next });
  };

  const workspaceLabel = (wsId: string, role?: string) => {
    const ws = workspaces.find(w => w.id === wsId);
    if (ws) return ws.name;
    return role?.startsWith('Request:') ? role.replace('Request: ', 'Participation request — ') : 'Pending workspace';
  };

  const visibilityAccessForWs = (lw: LinkedWorkspace) =>
    participatingAccessShort(lw.access, form.visibility);

  const projectRelatedLinks = relatedProjects.filter(l => l.projectId === project.id);

  const projectMembersFromWs = (wsId: string) =>
    project.members.filter(m => {
      const emp = employeeById(m.employeeId);
      return emp?.workspaceIds.includes(wsId);
    }).length;

  const addLabel = () => {
    const name = newLabelName.trim().toLowerCase();
    if (!name || project.labels.some(l => l.name === name)) return;
    updateProject(project.id, {
      labels: [
        ...project.labels,
        {
          id: `lbl-${Date.now()}`,
          name,
          color: LABEL_COLORS[project.labels.length % LABEL_COLORS.length],
        },
      ],
    });
    setNewLabelName('');
  };

  const saveLabelEdit = (labelId: string) => {
    const name = editLabelName.trim().toLowerCase();
    if (!name) return;
    updateProject(project.id, {
      labels: project.labels.map(l => (l.id === labelId ? { ...l, name } : l)),
    });
    setEditingLabelId(null);
  };

  const deleteLabel = (labelId: string) => {
    updateProject(project.id, {
      labels: project.labels.filter(l => l.id !== labelId),
    });
  };

  const archiveProject = () => {
    if (window.confirm('Archive this project? It will be marked as archived.')) {
      updateProject(project.id, { status: 'archived' });
      setForm(f => ({ ...f, status: 'archived' }));
    }
  };

  const leadName = employeeById(project.leadId)?.name ?? 'Project lead';

  const cycleCoverColor = () => {
    const idx = PROJECT_COVER_COLORS.indexOf(form.coverColor);
    const next = PROJECT_COVER_COLORS[(idx + 1) % PROJECT_COVER_COLORS.length];
    setForm(f => ({ ...f, coverColor: next, coverImage: null }));
  };

  const renderSection = () => {
    const totalDays = daysBetween(form.startDate, form.dueDate);
    const remaining = daysFromNow(form.dueDate);
    const healthStatus =
      !form.dueDate ? 'On Track'
      : remaining < 0 ? 'Overdue'
      : remaining <= 7 ? 'Due Soon'
      : 'On Track';
    const healthColor =
      healthStatus === 'Overdue' ? '#ef4444'
      : healthStatus === 'Due Soon' ? '#f59e0b'
      : '#10b981';

    switch (section) {
      case 'general':
        return (
          <div className="work-settings-general">
            <div className="work-settings-cover-block work-settings-cover-block--full">
              <div className="work-settings-cover-block__banner" style={projectCoverStyle(form)}>
                <button type="button" className="work-create-modal__cover-btn" onClick={cycleCoverColor}>
                  <Image size={14} /> Change cover
                </button>
                <button
                  ref={iconRef}
                  type="button"
                  className="work-create-modal__icon"
                  onClick={() => setIconPickerOpen(true)}
                  aria-label="Choose project icon"
                >
                  <ProjectIcon icon={form.icon} size={22} />
                </button>
              </div>
            </div>

            <div className="settings-form-grid work-settings-general__grid">
              <div className="org-form-field">
                <label htmlFor="set-name">Project name</label>
                <input id="set-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="org-form-field work-form-field--secondary">
                <label htmlFor="set-key">Project key</label>
                <input
                  id="set-key"
                  value={form.key}
                  disabled={keyLocked}
                  onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))}
                />
                {keyLocked ? (
                  <p className="admin-hint">Project key is locked because work item IDs already exist.</p>
                ) : (
                  <p className="admin-hint">Used for work item IDs, for example ONEVO-15.</p>
                )}
              </div>
              <div className="org-form-field">
                <label htmlFor="set-status">Status</label>
                <select id="set-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                  <option value="active">Active</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="set-health">Health</label>
                <select id="set-health" value={form.health} onChange={e => setForm(f => ({ ...f, health: e.target.value as ProjectHealth }))}>
                  <option value="on_track">On track</option>
                  <option value="at_risk">At risk</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="set-priority">Priority</label>
                <select id="set-priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="work-settings-general__visibility work-settings-grid__full">
                <div className="work-settings-visibility-row work-settings-visibility-row--inline">
                  <div className="work-settings-visibility-row__info">
                    <span className="work-settings-visibility-row__label">Project visibility</span>
                    <p className="work-settings-visibility-row__helper">
                      Private projects are invite-only. Workspace visible projects can be opened by members of participating workspaces.
                    </p>
                  </div>
                  <CompactPillDropdown
                    icon={form.visibility === 'private' ? <Lock size={14} /> : <Users size={14} />}
                    value={form.visibility}
                    options={SETTINGS_VISIBILITY_OPTIONS}
                    onChange={id => changeVisibility(id as ProjectVisibility)}
                    ariaLabel="Project visibility"
                  />
                </div>
              </div>
              <div className="org-form-field work-settings-grid__full">
                <label htmlFor="set-desc">Description</label>
                <textarea id="set-desc" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div className="work-settings__save-row work-settings__save-row--end">
              <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={saveGeneral}>Save changes</button>
            </div>

            <section className="work-settings-section work-settings-section--danger work-settings-general__danger">
              <h3 className="work-settings-section__title">Danger zone</h3>
              <div className="work-danger-actions">
                {(project.status === 'archived' || project.status === 'completed') && (
                  <button
                    type="button"
                    className="org-btn org-btn--secondary org-btn--sm"
                    onClick={() => {
                      restoreProject(project.id);
                      setForm(f => ({ ...f, status: 'active' }));
                    }}
                  >
                    <Archive size={14} /> Restore project
                  </button>
                )}
                {project.status === 'active' && (
                  <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={archiveProject}>
                    <Archive size={14} /> Archive project
                  </button>
                )}
                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm"
                  onClick={() => setDuplicateModalOpen(true)}
                >
                  Duplicate project
                </button>
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" disabled title="Disabled in demo">
                  <Trash2 size={14} /> Delete project
                </button>
              </div>
              <p className="admin-hint admin-hint--warning">Delete is disabled in demo. Archive requires confirmation.</p>
            </section>

            {/* Duplication Confirmation Modal */}
            {duplicateModalOpen && (
              <div className="org-slideover-backdrop" onClick={() => setDuplicateModalOpen(false)}>
                <div
                  className="work-create-modal"
                  style={{ maxWidth: 440, height: 'auto', minHeight: 0 }}
                  onClick={e => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Duplicate project"
                >
                  <header className="work-create-modal__header">
                    <h2>Duplicate project</h2>
                    <button type="button" className="org-slideover__close" onClick={() => setDuplicateModalOpen(false)}>
                      <X size={18} />
                    </button>
                  </header>
                  <div className="work-create-modal__body" style={{ padding: '1.25rem' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--clr-text-secondary)', fontSize: '0.875rem' }}>
                      This will create a copy of <strong>{project.name}</strong> with the same settings, members, and milestones.
                    </p>
                    <label className="work-settings-toggle-row" style={{ alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={cloneTasks}
                        onChange={e => setCloneTasks(e.target.checked)}
                        id="clone-tasks"
                      />
                      <span style={{ fontSize: '0.875rem' }}>Also copy all work items (tasks)</span>
                    </label>
                  </div>
                  <footer className="work-create-modal__footer">
                    <button type="button" className="org-btn org-btn--secondary" onClick={() => setDuplicateModalOpen(false)}>Cancel</button>
                    <button
                      type="button"
                      className="org-btn org-btn--primary"
                      onClick={() => {
                        const newId = duplicateProject(project.id, cloneTasks);
                        setDuplicateModalOpen(false);
                        if (newId) openProject(newId, 'overview');
                      }}
                    >
                      Duplicate
                    </button>
                  </footer>
                </div>
              </div>
            )}

            <ProjectIconPicker
              open={iconPickerOpen}
              anchorRef={iconRef}
              value={form.icon}
              onChange={icon => setForm(f => ({ ...f, icon }))}
              onClose={() => setIconPickerOpen(false)}
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="work-settings-schedule">
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="set-start-date">Start date</label>
                <input
                  id="set-start-date"
                  type="date"
                  value={form.startDate}
                  onChange={e => handleStartDateChange(e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="set-due-date">Due date</label>
                <input
                  id="set-due-date"
                  type="date"
                  value={form.dueDate}
                  min={form.startDate}
                  onChange={e => handleDueDateChange(e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="set-allocated-hours">Estimated / Allocated hours</label>
                <input
                  id="set-allocated-hours"
                  type="number"
                  min="0"
                  placeholder="e.g. 120"
                  value={form.allocatedHours}
                  onChange={e => setForm(f => ({ ...f, allocatedHours: e.target.value }))}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="set-priority-sel">Priority</label>
                <select
                  id="set-priority-sel"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {form.startDate && (
              <div className="cpw-schedule-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="cpw-schedule-card__stat">
                  <Calendar size={16} style={{ color: 'var(--accent)' }} />
                  <div>
                    <p className="cpw-schedule-card__label">Duration</p>
                    <p className="cpw-schedule-card__value">{totalDays > 0 ? `${totalDays} days` : '—'}</p>
                  </div>
                </div>
                <div className="cpw-schedule-card__divider" />
                <div className="cpw-schedule-card__stat">
                  <Clock size={16} style={{ color: healthColor }} />
                  <div>
                    <p className="cpw-schedule-card__label">Remaining</p>
                    <p className="cpw-schedule-card__value" style={{ color: healthColor }}>
                      {form.dueDate
                        ? remaining < 0 ? `${Math.abs(remaining)} days overdue` : `${remaining} days`
                        : '—'}
                    </p>
                  </div>
                </div>
                {totalDays > 0 && form.allocatedHours && (
                  <>
                    <div className="cpw-schedule-card__divider" />
                    <div className="cpw-schedule-card__stat">
                      <Zap size={16} style={{ color: 'var(--clr-text-secondary)' }} />
                      <div>
                        <p className="cpw-schedule-card__label">Intensity</p>
                        <p className="cpw-schedule-card__value">
                          {(parseFloat(form.allocatedHours) / totalDays).toFixed(1)} hrs/day
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="cpw-schedule-card__divider" />
                <div className="cpw-schedule-card__stat">
                  <div
                    className="cpw-health-dot"
                    style={{ background: healthColor, boxShadow: `0 0 0 4px ${healthColor}22` }}
                  />
                  <div>
                    <p className="cpw-schedule-card__label">Status</p>
                    <p className="cpw-schedule-card__value" style={{ color: healthColor }}>{healthStatus}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="work-settings__save-row work-settings__save-row--end">
              <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={saveSchedule}>
                Save changes
              </button>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="work-settings-advanced">
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="set-budget-limit">Budget limit (USD)</label>
                <input
                  id="set-budget-limit"
                  type="number"
                  min="0"
                  placeholder="e.g. 120000"
                  value={form.budgetLimit}
                  onChange={e => setForm(f => ({ ...f, budgetLimit: e.target.value }))}
                />
              </div>

              <div className="org-form-field">
                <label>Risk level</label>
                <div className="cpw-risk-row" style={{ marginTop: '0.25rem' }}>
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map(level => {
                    const isActive = form.riskLevel === level;
                    const color =
                      level === 'Low' ? '#10b981'
                      : level === 'Medium' ? '#f59e0b'
                      : level === 'High' ? '#f97316'
                      : '#ef4444';
                    return (
                      <button
                        key={level}
                        type="button"
                        className={`cpw-risk-btn${isActive ? ' cpw-risk-btn--active' : ''}`}
                        style={isActive ? { borderColor: color, background: `${color}18`, color } : {}}
                        onClick={() => setForm(f => ({ ...f, riskLevel: level }))}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="work-settings-general__visibility work-settings-grid__full" style={{ padding: 0, marginTop: '0.5rem' }}>
                <div className="work-settings-visibility-row work-settings-visibility-row--inline" style={{ padding: 0 }}>
                  <div className="work-settings-visibility-row__info">
                    <span className="work-settings-visibility-row__label" style={{ fontSize: '0.875rem' }}>Project visibility</span>
                    <p className="work-settings-visibility-row__helper" style={{ margin: 0 }}>
                      Configure whether this project is Private or visible to all Workspace members.
                    </p>
                  </div>
                  <CompactPillDropdown
                    icon={form.visibility === 'private' ? <Lock size={14} /> : <Users size={14} />}
                    value={form.visibility}
                    options={SETTINGS_VISIBILITY_OPTIONS}
                    onChange={id => changeVisibility(id as ProjectVisibility)}
                    ariaLabel="Project visibility"
                  />
                </div>
              </div>

              <div className="org-form-field work-settings-grid__full" style={{ marginTop: '1rem' }}>
                <label>Tags</label>
                <div className="cpw-tags-wrap" style={{ marginTop: '0.5rem' }}>
                  <div className="cpw-tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {form.tags.map(t => (
                      <span key={t} className="cpw-tag-chip" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--clr-bg-tertiary)', border: '1px solid var(--clr-border)', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem' }}>
                        {t}
                        <button type="button" onClick={() => removeTag(t)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', color: 'var(--clr-text-secondary)' }}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {form.tags.length === 0 && (
                      <span style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>No tags added yet.</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      style={{ flex: 1, maxWidth: '240px' }}
                    />
                    <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => addTag(tagInput)}>
                      Add tag
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="work-settings__save-row work-settings__save-row--end" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={saveAdvanced}>
                Save changes
              </button>
            </div>
          </div>
        );

      case 'participating-workspaces':
        return (
          <>
            <p className="work-screen__desc">
              Add another workspace when another team is responsible for part of this project.
            </p>
            <div className="work-screen__head work-screen__head--compact">
              <div className="work-screen__actions">
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setAddWsOpen(true)}>
                  <Plus size={14} /> Add workspace
                </button>
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setRequestWsOpen(true)}>
                  Request participation
                </button>
              </div>
            </div>
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Role in project</th>
                    <th>Access</th>
                    <th>Members added</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.linkedWorkspaces.map(lw => {
                    const ws = workspaces.find(w => w.id === lw.workspaceId);
                    return (
                      <tr key={lw.workspaceId}>
                        <td className="cfg-table__name"><Link2 size={12} /> {workspaceLabel(lw.workspaceId, lw.role)}</td>
                        <td>{lw.role}</td>
                        <td><span className="cfg-table__meta">{visibilityAccessForWs(lw)}</span></td>
                        <td>{ws ? projectMembersFromWs(lw.workspaceId) : '—'}</td>
                        <td><span className={`cfg-badge cfg-badge--${lw.status === 'active' ? 'active' : 'open'}`}>{lw.status}</span></td>
                        <td>
                          <div className="work-table-actions">
                            {lw.status === 'active' && ws && (
                              <>
                                <button type="button" className="cfg-action-btn" onClick={() => setManageWs(lw)}>
                                  Manage
                                </button>
                                <button type="button" className="cfg-action-btn" onClick={() => unlinkWorkspace(project.id, lw.workspaceId)}>
                                  <Unlink size={12} /> Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'members':
        return <ProjectMembersSettings project={project} />;

      case 'related-projects':
        return (
          <>
            <p className="work-screen__desc">
              Link parent, child, or dependency projects without exposing private projects you cannot access.
            </p>
            {isProjectAdmin(project) && (
              <div className="work-screen__head work-screen__head--compact">
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => setLinkRelatedOpen(true)}>
                  <Plus size={14} /> Add related project
                </button>
              </div>
            )}
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>Related project</th>
                    <th>Relationship</th>
                    <th>Status</th>
                    <th>Health</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectRelatedLinks.map(link => {
                    const display = resolveRelatedProjectDisplay(link);
                    return (
                      <tr key={link.id}>
                        <td className="cfg-table__name">
                          {display.restricted ? (
                            <span className="work-related-restricted">{display.label} — access required</span>
                          ) : (
                            display.label
                          )}
                        </td>
                        <td>{display.relationship}</td>
                        <td>
                          {display.restricted ? (
                            <span className={`cfg-badge cfg-badge--${display.linkStatus === 'active' ? 'active' : 'open'}`}>
                              {display.linkStatus}
                            </span>
                          ) : (
                            display.projectStatus
                          )}
                        </td>
                        <td>{display.restricted ? '—' : (display.health ?? '—')}</td>
                        <td>
                          {isProjectAdmin(project) && (
                            <button type="button" className="cfg-action-btn" onClick={() => removeRelatedProject(link.id)}>
                              <Unlink size={12} /> Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {projectRelatedLinks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="admin-hint">No related projects linked yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'worklogs':
        return <ProjectWorklogsSettings project={project} />;

      case 'labels':
        return (
          <>
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Color</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.labels.map(label => (
                    <tr key={label.id}>
                      <td>
                        {editingLabelId === label.id ? (
                          <input
                            value={editLabelName}
                            onChange={e => setEditLabelName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveLabelEdit(label.id);
                              if (e.key === 'Escape') setEditingLabelId(null);
                            }}
                            aria-label="Edit label name"
                          />
                        ) : (
                          <span className="work-label-tag" style={{ borderColor: label.color, color: label.color }}>
                            {label.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="work-settings-color-swatch" style={{ background: label.color }} aria-hidden="true" />
                      </td>
                      <td>
                        {editingLabelId === label.id ? (
                          <>
                            <button type="button" className="cfg-action-btn" onClick={() => saveLabelEdit(label.id)}>Save</button>
                            <button type="button" className="cfg-action-btn" onClick={() => setEditingLabelId(null)}><X size={12} /></button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="cfg-action-btn"
                              onClick={() => {
                                setEditingLabelId(label.id);
                                setEditLabelName(label.name);
                              }}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                            <button type="button" className="cfg-action-btn" onClick={() => deleteLabel(label.id)}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="work-settings-label-add">
              <input
                value={newLabelName}
                onChange={e => setNewLabelName(e.target.value)}
                placeholder="New label name"
                onKeyDown={e => { if (e.key === 'Enter') addLabel(); }}
                aria-label="New label name"
              />
              <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={addLabel} disabled={!newLabelName.trim()}>
                <Plus size={14} /> Add label
              </button>
            </div>
          </>
        );

      case 'cycle':
      case 'planner':
        return (
          <p className="work-screen__desc work-settings-placeholder">
            {FEATURE_PLACEHOLDERS[section]}
          </p>
        );

      case 'work-items':
        return (
          <>
            <p className="work-screen__desc">Board and work item display settings for this project.</p>
            <div className="work-settings-toggle-row">
              <div className="work-settings-toggle-row__info">
                <span className="work-settings-toggle-row__label">Require project lead approval before Done</span>
                <p className="work-settings-toggle-row__helper">Completion approval: {leadName}</p>
              </div>
              <label className="work-settings-toggle">
                <input
                  type="checkbox"
                  checked={project.approvalRequired}
                  onChange={e => {
                    const checked = e.target.checked;
                    updateProject(project.id, {
                      approvalRequired: checked,
                      defaultApproverId: checked ? project.leadId : null,
                    });
                  }}
                  aria-label="Require project lead approval before Done"
                />
                <span className="work-settings-toggle__track" aria-hidden="true" />
              </label>
            </div>
          </>
        );

      case 'custom-fields': {
        const defs = project.customFieldDefinitions ?? [];
        const addCustomField = () => {
          const name = newCfName.trim();
          if (!name) return;
          const options = newCfType === 'select'
            ? newCfOptions.split(',').map(o => o.trim()).filter(Boolean)
            : undefined;
          const newDef = {
            id: `cf-${Date.now()}`,
            name,
            type: newCfType,
            ...(options ? { options } : {}),
          };
          updateProject(project.id, {
            customFieldDefinitions: [...defs, newDef],
          });
          setNewCfName('');
          setNewCfOptions('');
          setNewCfType('text');
        };
        const deleteCustomField = (id: string) => {
          updateProject(project.id, {
            customFieldDefinitions: defs.filter(d => d.id !== id),
          });
        };
        return (
          <>
            <p className="work-screen__desc">
              Define extra fields that appear on all work items in this project. Task-level values can be filled in from the work item detail drawer.
            </p>
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>Field name</th>
                    <th>Type</th>
                    <th>Options</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {defs.map(d => (
                    <tr key={d.id}>
                      <td className="cfg-table__name">{d.name}</td>
                      <td><span className="cfg-badge cfg-badge--active">{d.type}</span></td>
                      <td>{d.options ? d.options.join(', ') : '—'}</td>
                      <td>
                        <button type="button" className="cfg-action-btn" onClick={() => deleteCustomField(d.id)}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {defs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="admin-hint">No custom fields defined for this project yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="work-settings-label-add" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                value={newCfName}
                onChange={e => setNewCfName(e.target.value)}
                placeholder="Field name"
                aria-label="New custom field name"
                style={{ flex: 1, minWidth: 140 }}
              />
              <select
                value={newCfType}
                onChange={e => setNewCfType(e.target.value as 'text' | 'number' | 'select')}
                aria-label="Custom field type"
                style={{ minWidth: 100 }}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
              </select>
              {newCfType === 'select' && (
                <input
                  value={newCfOptions}
                  onChange={e => setNewCfOptions(e.target.value)}
                  placeholder="Option1, Option2, …"
                  aria-label="Custom field select options"
                  style={{ flex: 1, minWidth: 160 }}
                />
              )}
              <button
                type="button"
                className="org-btn org-btn--secondary org-btn--sm"
                onClick={addCustomField}
                disabled={!newCfName.trim()}
              >
                <Plus size={14} /> Add field
              </button>
            </div>
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="work-settings work-settings--page">
      {renderSection()}

      <AddWorkspaceModal open={addWsOpen} onClose={() => setAddWsOpen(false)} project={project} />
      <RequestWorkspaceModal open={requestWsOpen} onClose={() => setRequestWsOpen(false)} project={project} />
      {manageWs && (
        <ManageParticipatingWorkspaceModal
          open={Boolean(manageWs)}
          onClose={() => setManageWs(null)}
          project={project}
          workspace={manageWs}
        />
      )}
      <LinkRelatedProjectDrawer open={linkRelatedOpen} onClose={() => setLinkRelatedOpen(false)} project={project} />
    </div>
  );
};
