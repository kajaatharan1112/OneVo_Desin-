import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  CURRENT_USER_ID,
  type WorkProject,
} from '../../workMockData';
import {
  PROJECT_SETTINGS_NAV,
  projectSettingsSectionLabel,
  type ProjectSettingsSectionId,
} from '../../projectSettingsNav';
import { ProjectIcon } from './projectIcon';
import { ProjectSettings } from './ProjectSettings';

function projectRoleLabel(project: WorkProject, userId = CURRENT_USER_ID): string {
  const member = project.members.find(m => m.employeeId === userId && m.status === 'active');
  if (!member) return 'Member';
  if (member.accessLevel === 'admin') return 'Admin';
  if (member.accessLevel === 'viewer') return 'Viewer';
  return 'Member';
}

interface Props {
  project: WorkProject;
}

export const ProjectSettingsPage: React.FC<Props> = ({ project }) => {
  const { settingsSectionId, setSettingsSectionId, closeProjectSettings } = useWork();
  const role = projectRoleLabel(project);

  return (
    <div className="work-settings-page">
      <aside className="work-settings-page__sidebar">
        <button
          type="button"
          className="work-settings-page__back"
          onClick={closeProjectSettings}
        >
          <ArrowLeft size={14} /> Back to project
        </button>

        <div className="work-settings-page__project">
          <span className="work-settings-page__project-icon" aria-hidden="true">
            <ProjectIcon icon={project.icon} size={18} />
          </span>
          <div className="work-settings-page__project-info">
            <span className="work-settings-page__project-name">{project.name}</span>
            <span className="work-settings-page__project-role">{role}</span>
          </div>
        </div>

        <nav className="work-settings-page__nav" aria-label="Project settings">
          {PROJECT_SETTINGS_NAV.map(group => (
            <div key={group.title} className="work-settings-page__nav-group">
              <span className="work-settings-page__nav-title">{group.title}</span>
              <ul className="work-settings-page__nav-list">
                {group.items.map(item => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`work-settings-page__nav-item${settingsSectionId === item.id ? ' work-settings-page__nav-item--active' : ''}`}
                      onClick={() => setSettingsSectionId(item.id as ProjectSettingsSectionId)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main className="work-settings-page__main">
        <header className="work-settings-page__header">
          <h1>{projectSettingsSectionLabel(settingsSectionId)}</h1>
        </header>
        <div className="work-settings-page__content">
          <ProjectSettings project={project} section={settingsSectionId} />
        </div>
      </main>
    </div>
  );
};
