import React from 'react';
import { BarChart3, Filter, Plus, Search, Settings, SlidersHorizontal } from 'lucide-react';
import { useWork } from '../context/work-context';
import { projectNavLabel } from '../projectNav';
import {
  formatWorkDate,
  healthBadgeClass,
  healthLabel,
  statusBadgeClass,
  workspaceName,
} from '../workMockData';
import { ProjectOverview } from '../components/project/ProjectOverview';
import { ProjectIcon } from '../components/project/projectIcon';
import { projectIconSurfaceStyle } from '../components/project/projectMedia';
import { ProjectWorkItems } from '../components/project/ProjectWorkItems';
import { ProjectCycle } from '../components/project/ProjectCycle';
import { ProjectPlanner } from '../components/project/ProjectPlanner';
import { ProjectSettingsPage } from '../components/project/ProjectSettingsPage';

export const ProjectDetailPage: React.FC = () => {
  const {
    selectedProjectId,
    projectNavId,
    getProject,
    workspaces,
    requestAddWorkItem,
    requestAddCycle,
    returnToProjectList,
    openProjectSettings,
    projectSettingsOpen,
    openAnalytics,
  } = useWork();
  const project = selectedProjectId ? getProject(selectedProjectId) : undefined;
  if (!project) return null;

  if (projectSettingsOpen) {
    return (
      <div className="work-proj-page work-proj-page--settings">
        <ProjectSettingsPage project={project} />
      </div>
    );
  }

  const toolLabel = projectNavLabel(projectNavId);
  const isOverview = projectNavId === 'overview';

  const renderContent = () => {
    switch (projectNavId) {
      case 'overview': return <ProjectOverview project={project} />;
      case 'work-items': return <ProjectWorkItems project={project} />;
      case 'cycle': return <ProjectCycle project={project} />;
      case 'planner': return <ProjectPlanner project={project} />;
      default: return null;
    }
  };

  const renderActions = () => {
    switch (projectNavId) {
      case 'work-items':
        return (
          <>
            <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={requestAddWorkItem}>
              <Plus size={14} /> Add work item
            </button>
            <button type="button" className="cfg-action-btn"><Filter size={14} /> Filter</button>
            <button type="button" className="cfg-action-btn"><SlidersHorizontal size={14} /> Display</button>
            <button type="button" className="cfg-action-btn" onClick={openAnalytics}>
              <BarChart3 size={14} /> Analytics
            </button>
            <button type="button" className="cfg-action-btn" onClick={() => openProjectSettings()}>
              <Settings size={14} /> Project settings
            </button>
          </>
        );
      case 'cycle':
        return (
          <>
            <button type="button" className="cfg-action-btn" aria-label="Search cycles">
              <Search size={14} />
            </button>
            <button type="button" className="cfg-action-btn"><Filter size={14} /> Filter</button>
            <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={requestAddCycle}>
              <Plus size={14} /> Add cycle
            </button>
            <button type="button" className="cfg-action-btn" onClick={() => openProjectSettings()}>
              <Settings size={14} /> Project settings
            </button>
          </>
        );
      case 'planner':
        return (
          <>
            <button type="button" className="org-btn org-btn--primary org-btn--sm">
              <Plus size={14} /> Add milestone
            </button>
            <button type="button" className="org-btn org-btn--secondary org-btn--sm">
              <Plus size={14} /> Add roadmap item
            </button>
            <button type="button" className="cfg-action-btn"><Filter size={14} /> Filter</button>
            <button type="button" className="cfg-action-btn" onClick={() => openProjectSettings()}>
              <Settings size={14} /> Project settings
            </button>
          </>
        );
      case 'overview':
        return (
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => openProjectSettings()}>
            <Settings size={14} /> Project settings
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`work-proj-page${projectNavId === 'work-items' ? ' work-proj-page--board' : ''}${isOverview ? ' work-proj-page--overview' : ''}${projectNavId === 'cycle' ? ' work-proj-page--cycle' : ''}`}>
      <header className={`work-proj-header${isOverview ? ' work-proj-header--overview' : ''}`}>
        <div className="work-proj-header__main">
          <nav className="work-proj-breadcrumb" aria-label="Breadcrumb">
            <button type="button" className="work-proj-breadcrumb__link" onClick={returnToProjectList}>Projects</button>
            <span className="work-proj-breadcrumb__sep">›</span>
            {!isOverview && (
              <>
                <span className="work-proj-breadcrumb__icon" aria-hidden="true">
                  <ProjectIcon icon={project.icon} size={14} />
                </span>
                <span className="work-proj-breadcrumb__current">{project.name}</span>
                <span className="work-proj-breadcrumb__sep">›</span>
              </>
            )}
            <span className="work-proj-breadcrumb__current">{toolLabel}</span>
          </nav>
          {!isOverview && (
            <>
              <div className="work-proj-header__title-row">
                <span
                  className="work-proj-header__project-icon"
                  style={projectIconSurfaceStyle(project)}
                  aria-hidden="true"
                >
                  <ProjectIcon icon={project.icon} size={18} />
                </span>
                <h1 className="work-proj-header__title">{project.name}</h1>
                <span className="work-proj-header__key">{project.key}</span>
                <span className={`cfg-badge cfg-badge--${statusBadgeClass(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className={`cfg-badge cfg-badge--${healthBadgeClass(project.health)}`}>
                  {healthLabel(project.health)}
                </span>
              </div>
              <div className="work-proj-header__meta">
                {project.workspaceIds.map(wsId => (
                  <span key={wsId} className="work-ws-badge">{workspaceName(wsId, workspaces)}</span>
                ))}
                <span className="work-proj-header__due">Due {formatWorkDate(project.dueDate)}</span>
              </div>
            </>
          )}
        </div>
        <div className="work-proj-header__actions">{renderActions()}</div>
      </header>

      <div className="work-proj-body">{renderContent()}</div>
    </div>
  );
};
