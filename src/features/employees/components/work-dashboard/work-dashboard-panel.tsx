import React from 'react';

interface WorkDashboardPanelProps {
  title: string;
  className?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  ariaLabel?: string;
}

export const WorkDashboardPanel: React.FC<WorkDashboardPanelProps> = ({
  title,
  className = '',
  children,
  headerRight,
  ariaLabel
}) => (
  <section
    className={`work-dashboard-panel ${className}`.trim()}
    aria-label={ariaLabel ?? title}
  >
    <header className="work-dashboard-panel__head">
      <h3 className="work-dashboard-panel__title">{title}</h3>
      {headerRight ? (
        <div className="work-dashboard-panel__header-right">{headerRight}</div>
      ) : null}
    </header>
    <div className="work-dashboard-panel__body">{children}</div>
  </section>
);
