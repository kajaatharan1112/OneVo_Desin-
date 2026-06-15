import React from 'react';
import { useWork } from '../../context/work-context';
import { projectSettingsSectionLabel, normalizeSettingsSection } from '../../projectSettingsNav';
import type { WorkProject } from '../../workMockData';
import { ProjectSettings } from './ProjectSettings';

interface Props {
  project: WorkProject;
}

export const ProjectSettingsPage: React.FC<Props> = ({ project }) => {
  const { settingsSectionId } = useWork();
  const section = normalizeSettingsSection(settingsSectionId);
  const sectionLabel = projectSettingsSectionLabel(section);
  const showSubtitle = section === 'worklogs';

  return (
    <div className="work-settings-content">
      <header className="work-settings-content__header">
        <h1>{sectionLabel}</h1>
        {showSubtitle && (
          <p className="work-settings-content__subtitle">
            Download worklogs AKA timesheets for anyone in this project.
          </p>
        )}
      </header>
      <div className="work-settings-content__body">
        <ProjectSettings project={project} section={section} />
      </div>
    </div>
  );
};
