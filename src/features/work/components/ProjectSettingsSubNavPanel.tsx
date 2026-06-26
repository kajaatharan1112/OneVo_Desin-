import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  PanelLeftClose,
  Settings,
  Calendar,
  Users,
  Clock,
  RotateCw,
  Kanban,
  CheckSquare,
  Tag,
  Database,
  Layers,
  Link,
  Sliders,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import { PROJECT_SETTINGS_NAV, type ProjectSettingsSectionId } from '../projectSettingsNav';
import { ProjectIcon } from './project/projectIcon';
import {
  CURRENT_USER_ID,
  canAccessProject,
  type WorkProject,
} from '../workMockData';

const SETTINGS_ICON_MAP: Record<ProjectSettingsSectionId, React.ComponentType<{ size?: number; className?: string }>> = {
  general: Settings,
  schedule: Calendar,
  members: Users,
  worklogs: Clock,
  cycle: RotateCw,
  planner: Kanban,
  'work-items': CheckSquare,
  labels: Tag,
  'custom-fields': Database,
  'participating-workspaces': Layers,
  'related-projects': Link,
  advanced: Sliders,
};

function projectRoleLabel(project: WorkProject, userId = CURRENT_USER_ID): string {
  const member = project.members.find(m => m.employeeId === userId && m.status === 'active');
  if (!member) return 'Member';
  if (member.accessLevel === 'admin') return 'Admin';
  if (member.accessLevel === 'viewer') return 'Viewer';
  return 'Member';
}

interface Props {
  onCollapse: () => void;
}

export const ProjectSettingsSubNavPanel: React.FC<Props> = ({ onCollapse }) => {
  const {
    projects,
    selectedProjectId,
    getProject,
    settingsSectionId,
    setSettingsSectionId,
    closeProjectSettings,
    switchSettingsProject,
  } = useWork();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const project = selectedProjectId ? getProject(selectedProjectId) : undefined;
  const accessibleList = useMemo(
    () => projects.filter(p => canAccessProject(p)),
    [projects],
  );

  useEffect(() => {
    if (!selectorOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [selectorOpen]);

  if (!project) return null;

  const role = projectRoleLabel(project);

  return (
    <div className="sub-nav-panel work-settings-sub-nav">
      <div className="sub-nav-panel__toolbar work-settings-sub-nav__toolbar">
        <button
          type="button"
          className="work-settings-sub-nav__header-back"
          onClick={closeProjectSettings}
          aria-label="Back to project"
          title="Back to project"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
        </button>
        <p className="sub-nav-panel__header">Project settings</p>
        <button
          type="button"
          className="sub-nav-panel__collapse"
          onClick={onCollapse}
          aria-label="Collapse section menu"
          title="Collapse section menu"
        >
          <PanelLeftClose size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="work-sub-nav__selector work-settings-sub-nav__selector" ref={selectorRef}>
        <button
          type="button"
          className={`work-settings-sub-nav__project-trigger${selectorOpen ? ' work-settings-sub-nav__project-trigger--open' : ''}`}
          onClick={() => setSelectorOpen(o => !o)}
          aria-expanded={selectorOpen}
          aria-haspopup="listbox"
        >
          <span className="work-settings-sub-nav__project-icon" aria-hidden="true">
            <ProjectIcon icon={project.icon} size={16} />
          </span>
          <span className="work-settings-sub-nav__project-info">
            <span className="work-settings-sub-nav__project-name">{project.name}</span>
            <span className="work-settings-sub-nav__project-role">{role}</span>
          </span>
          <ChevronDown
            size={14}
            className={`work-sub-nav__selector-chevron${selectorOpen ? ' work-sub-nav__selector-chevron--open' : ''}`}
          />
        </button>
        {selectorOpen && (
          <ul className="work-sub-nav__selector-menu" role="listbox" aria-label="Select project">
            {accessibleList.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.id === project.id}
                  className={`work-sub-nav__selector-option work-settings-sub-nav__project-option${p.id === project.id ? ' work-sub-nav__selector-option--active' : ''}`}
                  onClick={() => {
                    if (p.id !== project.id) switchSettingsProject(p.id);
                    setSelectorOpen(false);
                  }}
                >
                  <span className="work-settings-sub-nav__option-icon" aria-hidden="true">
                    <ProjectIcon icon={p.icon} size={14} />
                  </span>
                  <span className="work-settings-sub-nav__option-label">{p.name}</span>
                </button>
              </li>
            ))}
            {accessibleList.length === 0 && (
              <li className="work-settings-sub-nav__empty">No accessible projects.</li>
            )}
          </ul>
        )}
      </div>

      <nav className="work-settings-sub-nav__sections" aria-label="Project settings">
        {PROJECT_SETTINGS_NAV.map(group => (
          <div key={group.title} className="sub-nav-section">
            <p className="sub-nav-section__header">{group.title}</p>
            {group.items.map(item => {
              const Icon = SETTINGS_ICON_MAP[item.id] || Settings;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sub-nav-panel__item${settingsSectionId === item.id ? ' sub-nav-panel__item--active' : ''}`}
                  onClick={() => setSettingsSectionId(item.id as ProjectSettingsSectionId)}
                  aria-current={settingsSectionId === item.id ? 'page' : undefined}
                >
                  <span className="sub-nav-panel__item-icon" aria-hidden="true">
                    <Icon size={14} />
                  </span>
                  <span className="sub-nav-panel__item-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
};
