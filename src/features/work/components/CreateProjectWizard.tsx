import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import { ProjectIconPicker } from './project/ProjectIconPicker';
import { PROJECT_COVER_COLORS, randomCoverColor } from './project/ProjectCoverColors';
import { ProjectIcon } from './project/projectIcon';
import {
  ALL_WORKSPACES_ID,
  CURRENT_USER_ID,
  deriveProjectKey,
  MOCK_EMPLOYEES,
} from '../workMockData';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getAvatarColor = (id: string) => {
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#34d399', '#2dd4bf',
    '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#f472b6'
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

interface ProjectTypeOption {
  id: string;
  name: string;
  desc: string;
  template: string;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  { id: 'scrum', name: 'Scrum', desc: 'Sprint-based agile workflow', template: 'software' },
  { id: 'kanban', name: 'Kanban', desc: 'Visual board workflow', template: 'kanban' },
  { id: 'proj-mgmt', name: 'Project Management', desc: 'General project planning', template: 'none' },
  { id: 'marketing', name: 'Marketing', desc: 'Campaign workflow', template: 'marketing' },
  { id: 'custom', name: 'Custom', desc: 'Build your own workflow', template: 'none' },
];

export const CreateProjectWizard: React.FC = () => {
  const {
    activeModal,
    closeModal,
    workspaceFilterId,
    workspaces,
    projects,
    createProject,
    openProject,
  } = useWork();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [projectTypeId, setProjectTypeId] = useState('scrum');
  const [coverColor, setCoverColor] = useState(() => randomCoverColor());
  const [icon, setIcon] = useState('📁');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);



  // Dates and Invites States
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [inviteMenuOpen, setInviteMenuOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const inviteContainerRef = useRef<HTMLDivElement>(null);

  // Dropdown list
  const activeWorkspaces = useMemo(
    () => workspaces.filter(w => w.status === 'active'),
    [workspaces]
  );

  const existingKeys = useMemo(() => projects.map(p => p.key), [projects]);

  const filteredEmployees = useMemo(() => {
    const searchLower = memberSearch.toLowerCase().trim();
    if (!searchLower) return MOCK_EMPLOYEES;
    return MOCK_EMPLOYEES.filter(emp =>
      emp.name.toLowerCase().includes(searchLower) ||
      emp.position.toLowerCase().includes(searchLower) ||
      emp.department.toLowerCase().includes(searchLower)
    );
  }, [memberSearch]);

  const formatPreviewDates = (start: string, due: string | null) => {
    if (!start && !due) return '';
    
    const formatDate = (dStr: string) => {
      try {
        const parts = dStr.split('-');
        if (parts.length !== 3) return dStr;
        const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return dStr;
      }
    };

    if (start && due) {
      return `${formatDate(start)} - ${formatDate(due)}`;
    } else if (start) {
      return `Starts ${formatDate(start)}`;
    } else if (due) {
      return `Due ${formatDate(due)}`;
    }
    return '';
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inviteContainerRef.current && !inviteContainerRef.current.contains(event.target as Node)) {
        setInviteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (activeModal === 'create-project') {
      const defaultWs =
        workspaceFilterId !== ALL_WORKSPACES_ID
          ? workspaceFilterId
          : activeWorkspaces[0]?.id || '';
      setName('');
      setDescription('');
      setWorkspaceId(defaultWs);
      setProjectTypeId('scrum');
      setCoverColor(randomCoverColor());
      setIcon('📁');
      setIconPickerOpen(false);
      setStartDate(new Date().toISOString().slice(0, 10));
      setDueDate('');
      setSelectedMembers([]);
      setMemberSearch('');
      setInviteMenuOpen(false);
    }
  }, [activeModal, workspaceFilterId, activeWorkspaces]);

  if (activeModal !== 'create-project') return null;

  const selectedWorkspace = activeWorkspaces.find(w => w.id === workspaceId);
  const selectedType = PROJECT_TYPES.find(t => t.id === projectTypeId);

  const isFormValid = name.trim() !== '' && workspaceId !== '';

  const handleCreate = () => {
    if (!isFormValid) return;

    const key = deriveProjectKey(name, existingKeys).toUpperCase();
    const template = selectedType?.template || 'none';

    const id = createProject({
      name: name.trim(),
      key,
      description: description.trim(),
      workspaceIds: [workspaceId],
      primaryWorkspaceId: workspaceId,
      visibility: 'private',
      leadId: CURRENT_USER_ID,
      icon,
      iconType: 'emoji',
      iconColor: null,
      coverColor,
      coverImage: null,
      invites: selectedMembers.map(empId => ({
        employeeId: empId,
        accessLevel: 'member',
        workspaceSourceId: null
      })),
      startDate: startDate || new Date().toISOString().slice(0, 10),
      dueDate: dueDate || null,
      template,
      allocatedHours: undefined,
      budgetLimit: undefined,
      riskLevel: 'Medium',
      tags: [],
    });

    // Open the newly created project directly and close modal
    openProject(id, 'overview');
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div className="cpw-backdrop" onClick={handleCancel}>
      <style dangerouslySetInnerHTML={{ __html: `
        .qcm-container {
          display: flex;
          width: 100%;
          height: 100%;
          min-height: 520px;
          background: var(--surface);
          border-radius: 16px;
        }
        .qcm-left {
          flex: 1.25;
          padding: 32px 36px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          overflow-y: auto;
          max-height: 80vh;
        }
        .qcm-right {
          flex: 0.75;
          padding: 32px;
          background: var(--surface-raised);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-top-right-radius: 16px;
          border-bottom-right-radius: 16px;
          min-width: 280px;
        }
        .qcm-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-h);
          margin: 0 0 4px 0;
        }
        .qcm-desc {
          font-size: 0.875rem;
          color: var(--clr-text-secondary);
          margin: 0 0 24px 0;
        }
        .qcm-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1;
        }
        .qcm-field {
          display: flex;
          flex-direction: column;
        }
        .qcm-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--clr-text-secondary);
          margin-bottom: 6px;
        }
        .qcm-label span {
          color: var(--accent);
          margin-left: 2px;
        }
        .qcm-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-h);
          font-size: 0.875rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .qcm-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-bg);
          outline: none;
        }
        .qcm-type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .qcm-type-card {
          display: flex;
          flex-direction: column;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .qcm-type-card:hover {
          border-color: var(--accent);
          background: var(--surface-raised);
          transform: translateY(-1px);
        }
        .qcm-type-card.active {
          border-color: var(--accent);
          background: var(--accent-bg);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
        }
        .qcm-type-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-h);
        }
        .qcm-type-desc {
          font-size: 0.725rem;
          color: var(--clr-text-secondary);
          margin-top: 4px;
          line-height: 1.3;
        }
        .qcm-optional-row {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: 4px;
        }
        .qcm-icon-trigger {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.12s;
        }
        .qcm-icon-trigger:hover {
          background: var(--surface-raised);
        }
        .qcm-color-picker {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .qcm-color-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: transform 0.12s;
          padding: 0;
        }
        .qcm-color-dot:hover {
          transform: scale(1.15);
        }
        .qcm-color-dot.active {
          border-color: var(--text-h);
          box-shadow: 0 0 0 2px var(--surface);
        }
        .qcm-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }
        .qcm-preview-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--clr-text-secondary);
          margin-bottom: 16px;
        }
        .qcm-preview-card {
          width: 250px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          transition: transform 0.2s;
        }
        .qcm-preview-cover {
          height: 70px;
          width: 100%;
          transition: background 0.2s;
        }
        .qcm-preview-body {
          padding: 20px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .qcm-preview-icon-container {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -44px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
        }
        .qcm-preview-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-h);
          margin: 16px 0 6px 0;
          word-break: break-word;
          line-height: 1.35;
        }
        .qcm-preview-type {
          font-size: 0.75rem;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 16px;
        }
        .qcm-preview-workspace {
          font-size: 0.75rem;
          color: var(--clr-text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }
        .qcm-success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
          animation: cpw-fade-in 0.25s ease;
        }
        .qcm-success-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-h);
          margin: 16px 0 8px 0;
        }
        .qcm-success-desc {
          font-size: 0.875rem;
          color: var(--clr-text-secondary);
          margin-bottom: 28px;
        }
        .qcm-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
          margin-bottom: 32px;
        }
        .qcm-action-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .qcm-action-button:hover {
          background: var(--surface-raised);
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .qcm-action-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-h);
        }
        .qcm-row {
          display: flex;
          gap: 16px;
        }
        .qcm-members-selector-container {
          width: 100%;
          min-height: 42px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          cursor: text;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .qcm-members-selector-container:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px var(--accent-bg);
        }
        .qcm-selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          width: 100%;
        }
        .qcm-member-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 2px 8px 2px 4px;
          border-radius: 14px;
          background: var(--surface-raised);
          border: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-h);
        }
        .qcm-member-tag-avatar {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.6rem;
        }
        .qcm-member-tag-name {
          font-weight: 500;
        }
        .qcm-member-tag-remove {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          color: var(--clr-text-secondary);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.1s;
        }
        .qcm-member-tag-remove:hover {
          color: #ef4444;
        }
        .qcm-members-input-inline {
          flex: 1;
          min-width: 120px;
          border: none;
          background: transparent;
          color: var(--text-h);
          font-size: 0.875rem;
          padding: 4px 0;
        }
        .qcm-members-input-inline:focus {
          outline: none;
        }
        .qcm-members-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          z-index: 100;
          overflow: hidden;
        }
        .qcm-dropdown-scroll {
          max-height: 200px;
          overflow-y: auto;
          padding: 4px;
        }
        .qcm-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          color: var(--text-h);
          transition: background 0.12s;
        }
        .qcm-dropdown-item:hover {
          background: var(--surface-raised);
        }
        .qcm-dropdown-item.selected {
          background: var(--accent-bg);
        }
        .qcm-item-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.75rem;
          flex-shrink: 0;
        }
        .qcm-item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .qcm-item-name {
          font-size: 0.8125rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .qcm-item-role {
          font-size: 0.6875rem;
          color: var(--clr-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .qcm-item-check {
          color: var(--accent);
          font-weight: 700;
          font-size: 0.875rem;
          margin-right: 4px;
        }
        .qcm-no-results {
          padding: 12px;
          text-align: center;
          font-size: 0.8125rem;
          color: var(--clr-text-secondary);
        }
        .qcm-preview-dates {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--clr-text-secondary);
          margin-bottom: 12px;
        }
        .qcm-preview-members {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .qcm-preview-avatar-stack {
          display: flex;
          align-items: center;
        }
        .qcm-preview-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.65rem;
          margin-left: -6px;
          transition: transform 0.15s;
        }
        .qcm-preview-avatar:first-child {
          margin-left: 0;
        }
        .qcm-preview-avatar:hover {
          transform: translateY(-2px);
          z-index: 10;
        }
        .qcm-preview-avatar-more {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--surface);
          background: var(--surface-raised);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--clr-text-secondary);
          font-weight: 600;
          font-size: 0.65rem;
          margin-left: -6px;
        }
        .qcm-preview-members-text {
          font-size: 0.75rem;
          color: var(--clr-text-secondary);
        }
        @media (max-width: 768px) {
          .qcm-container {
            flex-direction: column;
          }
          .qcm-right {
            border-top-right-radius: 0;
            border-bottom-left-radius: 16px;
            padding: 24px;
          }
          .qcm-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      ` }} />

      <div
        className="cpw-modal"
        style={{ maxWidth: '800px', width: '100%', height: 'auto', minHeight: '520px', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {(
          /* Split Creator Screen */
          <div className="qcm-container">
            {/* Left Inputs */}
            <div className="qcm-left">
              <h2 className="qcm-title">Create Project</h2>
              <p className="qcm-desc">Create a new project and start collaborating immediately.</p>

              <div className="qcm-form">
                <div className="qcm-field">
                  <label htmlFor="qcm-name-input" className="qcm-label">
                    Project Name <span>*</span>
                  </label>
                  <input
                    id="qcm-name-input"
                    className="qcm-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Mobile App Development"
                    autoFocus
                  />
                </div>

                <div className="qcm-field">
                  <label htmlFor="qcm-ws-select" className="qcm-label">
                    Workspace <span>*</span>
                  </label>
                  <select
                    id="qcm-ws-select"
                    className="qcm-input"
                    value={workspaceId}
                    onChange={e => setWorkspaceId(e.target.value)}
                  >
                    <option value="" disabled>Select workspace...</option>
                    {activeWorkspaces.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="qcm-field">
                  <label className="qcm-label">
                    Project Type <span>*</span>
                  </label>
                  <div className="qcm-type-grid">
                    {PROJECT_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        className={`qcm-type-card${projectTypeId === type.id ? ' active' : ''}`}
                        onClick={() => setProjectTypeId(type.id)}
                      >
                        <span className="qcm-type-title">{type.name}</span>
                        <span className="qcm-type-desc">{type.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="qcm-row">
                  <div className="qcm-field" style={{ flex: 1 }}>
                    <label htmlFor="qcm-start-date" className="qcm-label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="qcm-start-date"
                      className="qcm-input"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="qcm-field" style={{ flex: 1 }}>
                    <label htmlFor="qcm-due-date" className="qcm-label">
                      Due Date
                    </label>
                    <input
                      type="date"
                      id="qcm-due-date"
                      className="qcm-input"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="qcm-field" style={{ position: 'relative' }} ref={inviteContainerRef}>
                  <label className="qcm-label">Invite Members</label>
                  
                  <div className="qcm-members-selector-container" onClick={() => setInviteMenuOpen(true)}>
                    <div className="qcm-selected-tags">
                      {selectedMembers.map(empId => {
                        const emp = MOCK_EMPLOYEES.find(e => e.id === empId);
                        if (!emp) return null;
                        return (
                          <div key={emp.id} className="qcm-member-tag">
                            <span
                              className="qcm-member-tag-avatar"
                              style={{ backgroundColor: getAvatarColor(emp.id) }}
                            >
                              {getInitials(emp.name)}
                            </span>
                            <span className="qcm-member-tag-name">{emp.name}</span>
                            <button
                              type="button"
                              className="qcm-member-tag-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMembers(prev => prev.filter(id => id !== emp.id));
                              }}
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                      
                      <input
                        type="text"
                        placeholder={selectedMembers.length === 0 ? "Search and add team members..." : ""}
                        className="qcm-members-input-inline"
                        value={memberSearch}
                        onChange={e => {
                          setMemberSearch(e.target.value);
                          setInviteMenuOpen(true);
                        }}
                        onFocus={() => setInviteMenuOpen(true)}
                      />
                    </div>
                  </div>

                  {inviteMenuOpen && (
                    <div className="qcm-members-dropdown">
                      <div className="qcm-dropdown-scroll">
                        {filteredEmployees.length === 0 ? (
                          <div className="qcm-no-results">No members found</div>
                        ) : (
                          filteredEmployees.map(emp => {
                            const isSelected = selectedMembers.includes(emp.id);
                            return (
                              <button
                                key={emp.id}
                                type="button"
                                className={`qcm-dropdown-item${isSelected ? ' selected' : ''}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedMembers(prev => prev.filter(id => id !== emp.id));
                                  } else {
                                    setSelectedMembers(prev => [...prev, emp.id]);
                                  }
                                  setMemberSearch('');
                                }}
                              >
                                <span
                                  className="qcm-item-avatar"
                                  style={{ backgroundColor: getAvatarColor(emp.id) }}
                                >
                                  {getInitials(emp.name)}
                                </span>
                                <div className="qcm-item-info">
                                  <span className="qcm-item-name">{emp.name}</span>
                                  <span className="qcm-item-role">{emp.position} &middot; {emp.department}</span>
                                </div>
                                {isSelected && (
                                  <span className="qcm-item-check">✓</span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="qcm-field">
                  <label htmlFor="qcm-description-input" className="qcm-label">Description</label>
                  <textarea
                    id="qcm-description-input"
                    className="qcm-input"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe this project's scope, goals, or milestones..."
                    rows={3}
                  />
                </div>

                <div className="qcm-field">
                  <span className="qcm-label">Branding & Customize</span>
                  <div className="qcm-optional-row">
                    {/* Emoji picker trigger */}
                    <button
                      ref={iconRef}
                      type="button"
                      className="qcm-icon-trigger"
                      onClick={() => setIconPickerOpen(true)}
                      aria-label="Choose icon"
                    >
                      <ProjectIcon icon={icon} size={20} />
                    </button>

                    {/* Color picker */}
                    <div className="qcm-color-picker">
                      {PROJECT_COVER_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          className={`qcm-color-dot${coverColor === c ? ' active' : ''}`}
                          style={{ background: c }}
                          onClick={() => setCoverColor(c)}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="qcm-footer">
                <button type="button" className="org-btn org-btn--secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="org-btn org-btn--primary"
                  disabled={!isFormValid}
                  onClick={handleCreate}
                >
                  Create Project
                </button>
              </div>
            </div>

            {/* Right Live Preview */}
            <div className="qcm-right">
              <span className="qcm-preview-title">Live Preview</span>
              <div className="qcm-preview-card">
                <div className="qcm-preview-cover" style={{ background: coverColor }} />
                <div className="qcm-preview-body">
                  <div className="qcm-preview-icon-container">
                    <ProjectIcon icon={icon} size={22} />
                  </div>
                  <h3 className="qcm-preview-name">{name.trim() || 'Untitled Project'}</h3>
                  <span className="qcm-preview-type">
                    {selectedType ? selectedType.name : 'Scrum'} Workflow
                  </span>

                  {/* Date Range Preview */}
                  {(startDate || dueDate) && (
                    <div className="qcm-preview-dates">
                      <Calendar size={12} style={{ flexShrink: 0 }} />
                      <span>
                        {formatPreviewDates(startDate, dueDate)}
                      </span>
                    </div>
                  )}

                  {/* Avatar Stack Preview */}
                  {selectedMembers.length > 0 && (
                    <div className="qcm-preview-members">
                      <div className="qcm-preview-avatar-stack">
                        {selectedMembers.slice(0, 4).map((empId) => {
                          const emp = MOCK_EMPLOYEES.find(e => e.id === empId);
                          if (!emp) return null;
                          return (
                            <span
                              key={emp.id}
                              className="qcm-preview-avatar"
                              style={{ backgroundColor: getAvatarColor(emp.id) }}
                              title={emp.name}
                            >
                              {getInitials(emp.name)}
                            </span>
                          );
                        })}
                        {selectedMembers.length > 4 && (
                          <span className="qcm-preview-avatar-more">
                            +{selectedMembers.length - 4}
                          </span>
                        )}
                      </div>
                      <span className="qcm-preview-members-text">
                        {selectedMembers.length} {selectedMembers.length === 1 ? 'member' : 'members'} invited
                      </span>
                    </div>
                  )}

                  <div className="qcm-preview-workspace">
                    <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                    <span>{selectedWorkspace ? selectedWorkspace.name : 'Engineering Workspace'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProjectIconPicker
        open={iconPickerOpen}
        anchorRef={iconRef}
        value={icon}
        onChange={emoji => setIcon(emoji)}
        onClose={() => setIconPickerOpen(false)}
      />
    </div>
  );
};
