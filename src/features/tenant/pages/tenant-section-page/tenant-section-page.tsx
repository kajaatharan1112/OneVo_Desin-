import React from 'react';

interface TenantSectionPageProps {
  section: string;
  subSection?: string;
  icon?: React.ReactNode;
}

export const TenantSectionPage: React.FC<TenantSectionPageProps> = ({
  section,
  subSection,
  icon
}) => {
  const title = subSection ?? section;

  return (
    <div className="section-page">
      {icon && (
        <span className="section-page__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <h2 className="section-page__title">{title}</h2>
      <p className="section-page__desc">
        {subSection
          ? `${subSection} under ${section} — workspace content will appear here.`
          : `${section} workspace — content will appear here.`}
      </p>
    </div>
  );
};
