import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderKanban,
  ListTodo,
  PanelLeftClose,
  Plus,
  Settings,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import { PROJECT_NAV_TOOLS, type ProjectNavId } from '../projectNav';
import { ALL_WORKSPACES_ID, accessibleProjects } from '../workMockData';

interface WorkSubNavPanelProps {
  activeId: string;
  onSelect: (id: string) => void;
  onCollapse: () => void;
}

export const WorkSubNavPanel: React.FC<WorkSubNavPanelProps> = ({
  activeId,
  onSelect,
  onCollapse,
}) => {
  const {
    workspaceFilterId,
    setWorkspaceFilterId,
    workspaces,
    workspaceFilterLabel,
    openModal,
    projects,
    selectedProjectId,
    projectNavId,
    openProject,
    closeProject,
  } = useWork();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const selectorRef = useRef<HTMLDivElement>(null);

  const projectList = accessibleProjects(workspaceFilterId, undefined, projects);

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

  useEffect(() => {
    if (selectedProjectId) {
      setProjectsOpen(true);
      setExpandedIds(prev => new Set(prev).add(selectedProjectId));
    }
  }, [selectedProjectId]);

  const toggleProjectExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectTool = (projectId: string, nav: ProjectNavId) => {
    openProject(projectId, nav);
  };

  const toggleProjectsOpen = () => {
    setProjectsOpen(o => !o);
  };

  const handleProjectClick = (id: string) => {
    if (selectedProjectId === id) {
      toggleProjectExpanded(id);
      return;
    }
    setExpandedIds(prev => new Set(prev).add(id));
    openProject(id, 'overview');
  };

  const goToList = (id: string) => {
    closeProject();
    onSelect(id);
  };

  const projectsSectionActive = Boolean(selectedProjectId) || activeId === 'projects';

  return (
    <div className="sub-nav-panel work-sub-nav">
      <div className="sub-nav-panel__toolbar">
        <p className="sub-nav-panel__header">Work</p>
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

      <div className="work-sub-nav__selector" ref={selectorRef}>
        <button
          type="button"
          className={`work-sub-nav__selector-trigger${selectorOpen ? ' work-sub-nav__selector-trigger--open' : ''}`}
          onClick={() => setSelectorOpen(o => !o)}
          aria-expanded={selectorOpen}
          aria-haspopup="listbox"
        >
          <span className="work-sub-nav__selector-label">{workspaceFilterLabel}</span>
          <ChevronDown size={14} className={`work-sub-nav__selector-chevron${selectorOpen ? ' work-sub-nav__selector-chevron--open' : ''}`} />
        </button>
        {selectorOpen && (
          <ul className="work-sub-nav__selector-menu" role="listbox" aria-label="Select workspace context">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={workspaceFilterId === ALL_WORKSPACES_ID}
                className={`work-sub-nav__selector-option${workspaceFilterId === ALL_WORKSPACES_ID ? ' work-sub-nav__selector-option--active' : ''}`}
                onClick={() => { setWorkspaceFilterId(ALL_WORKSPACES_ID); setSelectorOpen(false); }}
              >
                All Workspaces
              </button>
            </li>
            {workspaces.filter(w => w.status === 'active').map(w => (
              <li key={w.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={workspaceFilterId === w.id}
                  className={`work-sub-nav__selector-option${workspaceFilterId === w.id ? ' work-sub-nav__selector-option--active' : ''}`}
                  onClick={() => { setWorkspaceFilterId(w.id); setSelectorOpen(false); }}
                >
                  {w.name}
                </button>
              </li>
            ))}
            <li className="work-sub-nav__selector-divider" aria-hidden />
            <li>
              <button
                type="button"
                className="work-sub-nav__selector-option work-sub-nav__selector-option--action"
                onClick={() => { openModal('manage-workspaces'); setSelectorOpen(false); }}
              >
                <Settings size={13} /> Manage Workspaces
              </button>
            </li>
            <li>
              <button
                type="button"
                className="work-sub-nav__selector-option work-sub-nav__selector-option--action"
                onClick={() => { openModal('create-workspace'); setSelectorOpen(false); }}
              >
                <Plus size={13} /> Create Workspace
              </button>
            </li>
          </ul>
        )}
      </div>

      <div className="sub-nav-section">
        <button
          type="button"
          className={`sub-nav-panel__item${!selectedProjectId && activeId === 'my-work' ? ' sub-nav-panel__item--active' : ''}`}
          onClick={() => goToList('my-work')}
        >
          <span className="sub-nav-panel__item-icon"><ListTodo size={13} /></span>
          <span className="sub-nav-panel__item-label">My Work</span>
        </button>

        <div className="work-sub-nav__projects-section">
          <div
            className={`sub-nav-panel__item work-sub-nav__projects-row${projectsSectionActive ? ' sub-nav-panel__item--active' : ''}${projectsOpen ? ' work-sub-nav__projects-row--open' : ''}`}
          >
            <button
              type="button"
              className="work-sub-nav__projects-main"
              onClick={() => goToList('projects')}
            >
              <span className="sub-nav-panel__item-icon"><FolderKanban size={13} /></span>
              <span className="sub-nav-panel__item-label">Projects</span>
            </button>
            <div className="work-sub-nav__projects-actions">
              <button
                type="button"
                className="work-sub-nav__projects-action"
                onClick={() => openModal('create-project')}
                aria-label="Create project"
                title="Create project"
              >
                <Plus size={13} />
              </button>
              <button
                type="button"
                className="work-sub-nav__projects-action"
                onClick={toggleProjectsOpen}
                aria-expanded={projectsOpen}
                aria-label={projectsOpen ? 'Collapse projects' : 'Expand projects'}
              >
                <ChevronDown size={13} className={projectsOpen ? 'work-sub-nav__chevron--open' : ''} />
              </button>
            </div>
          </div>

          {projectsOpen && (
            <div className="work-sub-nav__project-list">
              {projectList.map(p => {
                const expanded = expandedIds.has(p.id);
                const isSelectedProject = selectedProjectId === p.id;
                return (
                  <div key={p.id} className="work-sub-nav__project-branch">
                    <button
                      type="button"
                      className={`sub-nav-panel__item work-sub-nav__project-row${isSelectedProject ? ' sub-nav-panel__item--active' : ''}`}
                      onClick={() => handleProjectClick(p.id)}
                      aria-expanded={expanded}
                    >
                      <ChevronRight
                        size={13}
                        className={`work-sub-nav__project-chevron sub-nav-panel__item-icon${expanded ? ' work-sub-nav__project-chevron--open' : ''}`}
                        aria-hidden
                      />
                      <span className="sub-nav-panel__item-label">{p.name}</span>
                    </button>
                    {expanded && (
                      <div className="work-sub-nav__tree">
                        {PROJECT_NAV_TOOLS.map(tool => (
                          <button
                            key={tool.id}
                            type="button"
                            className={`sub-nav-panel__item work-sub-nav__tree-item${isSelectedProject && projectNavId === tool.id ? ' sub-nav-panel__item--active' : ''}`}
                            onClick={() => selectTool(p.id, tool.id)}
                            aria-current={isSelectedProject && projectNavId === tool.id ? 'page' : undefined}
                          >
                            <span className="sub-nav-panel__item-label">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {projectList.length === 0 && (
                <p className="work-sub-nav__empty">No projects in this workspace.</p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`sub-nav-panel__item${!selectedProjectId && activeId === 'documents' ? ' sub-nav-panel__item--active' : ''}`}
          onClick={() => goToList('documents')}
        >
          <span className="sub-nav-panel__item-icon"><FileText size={13} /></span>
          <span className="sub-nav-panel__item-label">Documents</span>
        </button>
      </div>
    </div>
  );
};
