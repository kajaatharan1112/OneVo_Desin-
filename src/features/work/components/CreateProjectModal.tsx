import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Lock, Search, UserCircle, Users, X } from 'lucide-react';
import { useWork } from '../context/work-context';
import { CompactPillDropdown, type PillDropdownOption } from './CompactPillDropdown';
import { ProjectIconPicker } from './project/ProjectIconPicker';
import { PROJECT_COVER_COLORS, randomCoverColor } from './project/ProjectCoverColors';
import { ProjectIcon } from './project/projectIcon';
import { projectCoverStyle, resolveProjectIconType } from './project/projectMedia';
import {
  ALL_WORKSPACES_ID,
  CURRENT_USER_ID,
  canViewWorkspaceMemberCount,
  deriveProjectKey,
  employeeById,
  inviteableEmployees,
  linkableWorkspaces,
  type ProjectAccessLevel,
  type ProjectVisibility,
} from '../workMockData';

interface InviteRow {
  employeeId: string;
  accessLevel: ProjectAccessLevel;
}

const VISIBILITY_OPTIONS: PillDropdownOption[] = [
  {
    id: 'private',
    label: 'Private',
    subtext: 'Only people you invite can open this project.',
  },
  {
    id: 'public_workspace',
    label: 'Workspace visible',
    subtext: 'Everyone in the selected workspace can open this project.',
  },
];

export const CreateProjectModal: React.FC = () => {
  const { activeModal, closeModal, workspaceFilterId, projects, createProject, openProject } = useWork();
  const iconRef = useRef<HTMLButtonElement>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    key: '',
    keyTouched: false,
    description: '',
    workspaceId: '',
    visibility: 'private' as ProjectVisibility,
    leadId: CURRENT_USER_ID,
    icon: '📁',
    coverColor: randomCoverColor(),
    coverImage: null as string | null,
    iconColor: null as string | null,
    invites: [] as InviteRow[],
  });
  const [wsSearch, setWsSearch] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');

  useEffect(() => {
    if (activeModal === 'create-project') {
      const ws = workspaceFilterId !== ALL_WORKSPACES_ID ? workspaceFilterId : '';
      setForm({
        name: '',
        key: '',
        keyTouched: false,
        description: '',
        workspaceId: ws,
        visibility: 'private',
        leadId: CURRENT_USER_ID,
        icon: '📁',
        coverColor: randomCoverColor(),
        coverImage: null,
        iconColor: null,
        invites: [],
      });
      setWsSearch('');
      setPeopleSearch('');
      setIconPickerOpen(false);
    }
  }, [activeModal, workspaceFilterId]);

  const existingKeys = useMemo(() => projects.map(p => p.key), [projects]);
  const autoKey = useMemo(
    () => (form.name.trim() ? deriveProjectKey(form.name, existingKeys) : ''),
    [form.name, existingKeys],
  );
  const displayKey = form.keyTouched ? form.key : autoKey;

  const excludeIds = useMemo(
    () => [CURRENT_USER_ID, ...form.invites.map(i => i.employeeId)],
    [form.invites],
  );
  const peoplePool = useMemo(
    () => inviteableEmployees(form.workspaceId ? [form.workspaceId] : [], excludeIds),
    [form.workspaceId, excludeIds],
  );

  const leadOptions = useMemo((): PillDropdownOption[] => {
    const creator = employeeById(CURRENT_USER_ID);
    const fromWs = form.workspaceId
      ? inviteableEmployees([form.workspaceId], [], CURRENT_USER_ID)
      : [];
    const byId = new Map<string, PillDropdownOption>();
    if (creator) {
      byId.set(creator.id, { id: creator.id, label: creator.id === CURRENT_USER_ID ? 'You' : creator.name });
    }
    fromWs.forEach(e => {
      if (!byId.has(e.id)) byId.set(e.id, { id: e.id, label: e.name, subtext: e.position });
    });
    return [...byId.values()];
  }, [form.workspaceId]);

  const scopedWorkspaces = useMemo(() => linkableWorkspaces(), []);
  const filteredWorkspaces = useMemo(() => {
    const q = wsSearch.toLowerCase();
    return scopedWorkspaces.filter(w => w.name.toLowerCase().includes(q));
  }, [scopedWorkspaces, wsSearch]);

  const selectedWorkspace = useMemo(
    () => scopedWorkspaces.find(w => w.id === form.workspaceId),
    [scopedWorkspaces, form.workspaceId],
  );

  const inviteSearchResults = useMemo(() => {
    const q = peopleSearch.trim().toLowerCase();
    if (!q) return peoplePool.slice(0, 3);
    return peoplePool.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q),
    );
  }, [peopleSearch, peoplePool]);

  if (activeModal !== 'create-project') return null;

  const canSubmit = Boolean(form.name.trim() && displayKey.trim() && form.workspaceId);

  const selectWorkspace = (workspaceId: string) => {
    setForm(f => ({ ...f, workspaceId, leadId: CURRENT_USER_ID }));
  };

  const addInvite = (employeeId: string) => {
    if (form.invites.some(i => i.employeeId === employeeId)) return;
    setForm(f => ({
      ...f,
      invites: [...f.invites, { employeeId, accessLevel: 'member' }],
    }));
    setPeopleSearch('');
  };

  const removeInvite = (employeeId: string) => {
    setForm(f => ({
      ...f,
      invites: f.invites.filter(i => i.employeeId !== employeeId),
    }));
  };

  const updateInviteAccess = (employeeId: string, accessLevel: ProjectAccessLevel) => {
    setForm(f => ({
      ...f,
      invites: f.invites.map(i => (i.employeeId === employeeId ? { ...i, accessLevel } : i)),
    }));
  };

  const cycleCoverColor = () => {
    const idx = PROJECT_COVER_COLORS.indexOf(form.coverColor);
    const next = PROJECT_COVER_COLORS[(idx + 1) % PROJECT_COVER_COLORS.length];
    setForm(f => ({ ...f, coverColor: next, coverImage: null }));
  };

  const handleCreate = () => {
    if (!canSubmit || !form.workspaceId) return;
    const id = createProject({
      name: form.name.trim(),
      key: displayKey.trim(),
      description: form.description,
      workspaceIds: [form.workspaceId],
      primaryWorkspaceId: form.workspaceId,
      visibility: form.visibility,
      leadId: form.leadId,
      icon: form.icon,
      iconType: resolveProjectIconType(form.icon),
      iconColor: form.iconColor,
      coverColor: form.coverColor,
      coverImage: form.coverImage,
      invites: form.invites.map(inv => ({
        ...inv,
        workspaceSourceId: form.workspaceId,
      })),
    });
    closeModal();
    openProject(id, 'overview');
  };

  const creator = employeeById(CURRENT_USER_ID);
  const visibilityIcon = form.visibility === 'private' ? <Lock size={14} /> : <Users size={14} />;

  return (
    <div className="org-slideover-backdrop work-create-modal-backdrop" onClick={closeModal}>
      <div
        className="work-create-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Create project"
        onClick={e => e.stopPropagation()}
      >
        <header className="work-create-modal__header">
          <h2>Create project</h2>
          <button type="button" className="org-slideover__close" onClick={closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="work-create-modal__body">
          <div className="work-create-modal__cover-wrap">
            <div className="work-create-modal__cover" style={projectCoverStyle(form)}>
              <button type="button" className="work-create-modal__cover-btn" onClick={cycleCoverColor}>
                <Image size={14} /> Change cover
              </button>
            </div>
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

          <div className="work-create-modal__scroll">
            <div className="work-create-modal__form">
              <div className="work-create-modal__name-key-block">
                <div className="work-create-modal__row work-create-modal__row--name-key">
                  <div className="org-form-field work-create-modal__field--name">
                    <label htmlFor="proj-name" className="work-create-modal__field-label">Project name</label>
                    <input
                      id="proj-name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. OneVo Platform Refresh"
                    />
                  </div>
                  <div className="org-form-field work-create-modal__field--key">
                    <label htmlFor="proj-key" className="work-create-modal__field-label">Project ID</label>
                    <input
                      id="proj-key"
                      value={displayKey}
                      onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase(), keyTouched: true }))}
                      placeholder="Auto-generated from name"
                    />
                  </div>
                </div>
                <div className="work-create-modal__field-hint-row">
                  <p className="work-create-modal__field-hint">
                    Used for work item IDs, for example ONEVO-15.
                  </p>
                </div>
              </div>

              <div className="work-create-modal__row">
                <div className="org-form-field work-create-modal__field--desc">
                  <label htmlFor="proj-desc" className="work-create-modal__sr-only">Description</label>
                  <textarea
                    id="proj-desc"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                  />
                </div>
              </div>

              <div className="work-create-modal__row work-create-modal__row--controls">
                <CompactPillDropdown
                  icon={visibilityIcon}
                  value={form.visibility}
                  options={VISIBILITY_OPTIONS}
                  onChange={id => setForm(f => ({ ...f, visibility: id as ProjectVisibility }))}
                  ariaLabel="Project visibility"
                />
                <CompactPillDropdown
                  icon={<UserCircle size={14} />}
                  value={form.leadId}
                  options={leadOptions}
                  onChange={id => setForm(f => ({ ...f, leadId: id }))}
                  ariaLabel="Project lead"
                  prefixLabel="Lead"
                />
              </div>

              <div className="work-create-modal__row work-create-modal__row--split">
                <section className="work-create-modal__col">
                  <h3 className="work-create-modal__section-title">Workspace</h3>
                  <label className="work-create-modal__search-field">
                    <Search size={14} aria-hidden />
                    <input
                      type="search"
                      placeholder="Search workspaces…"
                      value={wsSearch}
                      onChange={e => setWsSearch(e.target.value)}
                    />
                  </label>
                  {selectedWorkspace && (
                    <div className="work-ws-picker__selected work-ws-picker__selected--modal">
                      <span className="work-ws-picker__name">{selectedWorkspace.name}</span>
                      {canViewWorkspaceMemberCount(selectedWorkspace.id) && (
                        <span className="work-ws-picker__meta">{selectedWorkspace.memberCount} members</span>
                      )}
                    </div>
                  )}
                  <div className="work-ws-picker work-ws-picker--single work-ws-picker--modal">
                    {filteredWorkspaces.map(w => (
                      <button
                        key={w.id}
                        type="button"
                        className={`work-ws-picker__card work-ws-picker__card--modal${form.workspaceId === w.id ? ' work-ws-picker__card--active' : ''}`}
                        onClick={() => selectWorkspace(w.id)}
                      >
                        <span className="work-ws-picker__name">{w.name}</span>
                        {canViewWorkspaceMemberCount(w.id) && (
                          <span className="work-ws-picker__meta">{w.memberCount} members</span>
                        )}
                      </button>
                    ))}
                    {filteredWorkspaces.length === 0 && (
                      <p className="work-create-modal__empty-hint">No workspaces match your search.</p>
                    )}
                  </div>
                </section>

                <section className="work-create-modal__col work-create-modal__col--invite">
                  <h3 className="work-create-modal__section-title">Invite people</h3>

                  <label className="work-create-modal__search-field">
                    <Search size={14} aria-hidden />
                    <input
                      type="search"
                      placeholder="Search people by name or position…"
                      value={peopleSearch}
                      onChange={e => setPeopleSearch(e.target.value)}
                    />
                  </label>
                  {inviteSearchResults.length > 0 && (
                    <div className="work-invite-results work-invite-results--modal">
                      {inviteSearchResults.map(e => (
                        <button
                          key={e.id}
                          type="button"
                          className="work-invite-result work-invite-result--modal"
                          onClick={() => addInvite(e.id)}
                        >
                          <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                            {e.name.slice(0, 2)}
                          </span>
                          <span className="work-invite-result__info">
                            <span className="work-invite-result__name">{e.name}</span>
                            <span className="work-invite-result__meta">{e.position}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {peopleSearch.trim() && inviteSearchResults.length === 0 && (
                    <p className="work-create-modal__empty-hint">No people found.</p>
                  )}

                  <div className="work-create-modal__selected-people">
                    <div className="work-invite-row work-invite-row--modal work-invite-row--creator">
                      <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                        {(creator?.name ?? 'You').slice(0, 2)}
                      </span>
                      <div className="work-invite-row__info">
                        <span className="work-invite-row__name">You</span>
                        <span className="work-invite-row__meta">Project Admin</span>
                      </div>
                    </div>

                    {form.invites.map(inv => {
                      const emp = employeeById(inv.employeeId);
                      if (!emp) return null;
                      return (
                        <div key={inv.employeeId} className="work-invite-row work-invite-row--modal">
                          <span className="work-avatar-chip__circle work-avatar-chip__circle--sm">
                            {emp.name.slice(0, 2)}
                          </span>
                          <div className="work-invite-row__info">
                            <span className="work-invite-row__name">{emp.name}</span>
                            <span className="work-invite-row__meta">{emp.position}</span>
                          </div>
                          <select
                            className="work-invite-row__access"
                            value={inv.accessLevel}
                            onChange={e => updateInviteAccess(inv.employeeId, e.target.value as ProjectAccessLevel)}
                            aria-label={`Access for ${emp.name}`}
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            type="button"
                            className="work-invite-row__remove"
                            onClick={() => removeInvite(inv.employeeId)}
                            aria-label={`Remove ${emp.name}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <footer className="work-create-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeModal}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!canSubmit} onClick={handleCreate}>
            Create project
          </button>
        </footer>

        <ProjectIconPicker
          open={iconPickerOpen}
          anchorRef={iconRef}
          value={form.icon}
          onChange={icon => setForm(f => ({ ...f, icon }))}
          onClose={() => setIconPickerOpen(false)}
        />
      </div>
    </div>
  );
};
