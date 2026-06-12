import React from 'react';

interface TenantSectionPageProps {
  section: string;
  subSection?: string;
}

export const TenantSectionPage: React.FC<TenantSectionPageProps> = ({
  section,
  subSection,
}) => {
  const title = subSection ?? section;

  return (
    <div className="cfg-page section-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">{title}</h1>
          <p className="cfg-page__subtitle">
            {subSection
              ? `${subSection} under ${section} — workspace content will appear here.`
              : `${section} workspace — content will appear here.`}
          </p>
        </div>
      </div>
    </div>
  );
};
