import React from 'react';
import { ConfigShellHeader } from '../../../shared/components/config-shell-header/ConfigShellHeader';

interface SettingsPageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
  };
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  title,
  description,
  actions,
  icon,
  search
}) => {
  if (icon) {
    return (
      <ConfigShellHeader
        title={title}
        icon={icon}
        search={search}
        actions={actions}
      />
    );
  }

  return (
    <div className="cfg-page__header">
      <div>
        <h1 className="cfg-page__title">{title}</h1>
        <p className="cfg-page__subtitle">{description}</p>
      </div>
      {actions ? <div className="cfg-page__actions">{actions}</div> : null}
    </div>
  );
};
