import React from 'react';
import { X } from 'lucide-react';
import { ProjectSettings } from './ProjectSettings';
import type { WorkProject } from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

export const ProjectSettingsDrawer: React.FC<Props> = ({ open, onClose, project }) => {
  if (!open) return null;

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--wide work-settings-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Project settings"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>Project settings</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="org-slideover__body work-settings-drawer__body">
          <ProjectSettings project={project} embedded />
        </div>
      </div>
    </div>
  );
};
