import React from 'react';

interface SettingsPageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  title,
  description,
  actions,
}) => (
  <div className="cfg-page__header">
    <div>
      <h1 className="cfg-page__title">{title}</h1>
      <p className="cfg-page__subtitle">{description}</p>
    </div>
    {actions ? <div className="cfg-page__actions">{actions}</div> : null}
  </div>
);
