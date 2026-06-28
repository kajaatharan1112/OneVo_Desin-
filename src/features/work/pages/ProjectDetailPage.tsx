import React from 'react';
import { BarChart3, Filter, Plus, Search, Settings, SlidersHorizontal } from 'lucide-react';
import { useWork } from '../context/work-context';
import { PROJECT_NAV_TOOLS, projectNavLabel } from '../projectNav';
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
import { ProjectMembersSettings } from '../components/project/ProjectMembersSettings';
import { ProjectMilestonesPage } from '../components/project/ProjectMilestonesPage';
import { ProjectFilesPage } from '../components/project/ProjectFilesPage';
import { ProjectProgressPage } from '../components/project/ProjectProgressPage';
import { ProjectActivityLogPage } from '../components/project/ProjectActivityLogPage';
import { ProjectReportsPage } from '../components/project/ProjectReportsPage';
import { ProjectStatusPage } from '../components/project/ProjectStatusPage';
import { ProjectCompletionPage } from '../components/project/ProjectCompletionPage';
import { ProjectBudgetPage } from '../components/project/ProjectBudgetPage';
import { ProjectRisksPage } from '../components/project/ProjectRisksPage';
import { ProjectGoalsPage } from '../components/project/ProjectGoalsPage';

export const ProjectDetailPage: React.FC = () => {
  const {
    selectedProjectId,
    projectNavId,
    setProjectNavId,
    getProject,
    workspaces,
    requestAddWorkItem,
    requestAddCycle,
    requestAddMilestone,
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
      case 'members': return <ProjectMembersSettings project={project} />;
      case 'milestones': return <ProjectMilestonesPage project={project} />;
      case 'files': return <ProjectFilesPage project={project} />;
      case 'budget': return <ProjectBudgetPage project={project} />;
      case 'risks': return <ProjectRisksPage project={project} />;
      case 'progress': return <ProjectProgressPage project={project} />;
      case 'activity': return <ProjectActivityLogPage project={project} />;
      case 'reports': return <ProjectReportsPage project={project} />;
      case 'status': return <ProjectStatusPage project={project} />;
      case 'completion': return <ProjectCompletionPage project={project} />;
      case 'goal': return <ProjectGoalsPage project={project} />;
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
      case 'milestones':
        return (
          <>
            <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={requestAddMilestone}>
              <Plus size={14} /> Add milestone
            </button>
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
        return (
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => openProjectSettings()}>
            <Settings size={14} /> Project settings
          </button>
        );
    }
  };

  return (
    <div className={`work-proj-page${projectNavId === 'work-items' ? ' work-proj-page--board' : ''}${isOverview ? ' work-proj-page--overview' : ''}${projectNavId === 'cycle' ? ' work-proj-page--cycle' : ''}`}>
      <header className={`work-proj-header${isOverview ? ' work-proj-header--overview' : ''}`}>
        <div className="work-proj-header__main">
          <nav className="work-proj-breadcrumb" aria-label="Breadcrumb">
            <button type="button" className="work-proj-breadcrumb__link" onClick={returnToProjectList}>Projects</button>
            <span className="work-proj-breadcrumb__sep">›</span>
            <span className="work-proj-breadcrumb__icon" aria-hidden="true">
              <ProjectIcon icon={project.icon} size={14} />
            </span>
            <span className="work-proj-breadcrumb__current">{project.name}</span>
            <span className="work-proj-breadcrumb__sep">›</span>
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

      {/* Main horizontal navigation menu tabs for all projects */}
      <div className="work-proj-tabs" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', padding: '0 20px', overflowX: 'auto', background: 'var(--surface-panel)', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        {PROJECT_NAV_TOOLS.map(tool => {
          const isActive = projectNavId === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              className={`work-proj-tab-btn${isActive ? ' active' : ''}`}
              onClick={() => setProjectNavId(tool.id)}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-m)';
              }}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-m)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tool.label}
            </button>
          );
        })}
      </div>

      <div className="work-proj-body">{renderContent()}</div>
    </div>
  );
};
