import React from 'react';
import { BarChart3, Filter, Plus, Search, Settings, SlidersHorizontal } from 'lucide-react';
import { useWork } from '../context/work-context';
import { projectNavLabel } from '../projectNav';
import {
  formatWorkDate,
  healthBadgeClass,
  statusBadgeClass,
  workspaceName,
} from '../workMockData';
import { ProjectOverview } from '../components/project/ProjectOverview';
import { ProjectIcon } from '../components/project/projectIcon';
import { ProjectWorkItems } from '../components/project/ProjectWorkItems';
import { ProjectCycle } from '../components/project/ProjectCycle';
import { ProjectPlanner } from '../components/project/ProjectPlanner';
import { ProjectSettingsDrawer } from '../components/project/ProjectSettingsDrawer';

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
    closeProjectSettings,
  } = useWork();
  const project = selectedProjectId ? getProject(selectedProjectId) : undefined;
  if (!project) return null;

  const toolLabel = projectNavLabel(projectNavId);

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
            <button type="button" className="cfg-action-btn"><BarChart3 size={14} /> Analytics</button>
            <button type="button" className="cfg-action-btn" onClick={openProjectSettings}>
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
          </>
        );
      case 'planner':
        return (
          <button type="button" className="org-btn org-btn--primary org-btn--sm"><Plus size={14} /> Add milestone</button>
        );
      case 'overview':
        return (
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={openProjectSettings}>
            <Settings size={14} /> Project settings
          </button>
        );
      default:
        return null;
    }
  };

  const isOverview = projectNavId === 'overview';
  const isCycle = projectNavId === 'cycle';
  const isDocStyleHeader = isOverview || isCycle;

  return (
    <div className={`work-proj-page${projectNavId === 'work-items' ? ' work-proj-page--board' : ''}${isOverview ? ' work-proj-page--overview' : ''}${isCycle ? ' work-proj-page--cycle' : ''}`}>
      <header className={`work-proj-header${isDocStyleHeader ? ' work-proj-header--overview' : ''}`}>
        <div className="work-proj-header__main">
          <nav className="work-proj-breadcrumb" aria-label="Breadcrumb">
            {!isDocStyleHeader && (
              <>
                <button type="button" className="work-proj-breadcrumb__link" onClick={returnToProjectList}>Projects</button>
                <span className="work-proj-breadcrumb__sep">›</span>
              </>
            )}
            {isDocStyleHeader && (
              <span className="work-proj-breadcrumb__icon" aria-hidden="true">
                <ProjectIcon icon={project.icon} size={14} />
              </span>
            )}
            <span className="work-proj-breadcrumb__current">{project.name}</span>
            <span className="work-proj-breadcrumb__sep">›</span>
            <span className="work-proj-breadcrumb__current">{toolLabel}</span>
          </nav>
          {!isDocStyleHeader && (
            <>
              <div className="work-proj-header__title-row">
                <h1 className="work-proj-header__title">{project.name}</h1>
                <span className="work-proj-header__key">{project.key}</span>
                <span className={`cfg-badge cfg-badge--${statusBadgeClass(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className={`cfg-badge cfg-badge--${healthBadgeClass(project.health)}`}>
                  {project.health.replace('_', ' ')}
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

      <ProjectSettingsDrawer
        open={projectSettingsOpen}
        onClose={closeProjectSettings}
        project={project}
      />
    </div>
  );
};
