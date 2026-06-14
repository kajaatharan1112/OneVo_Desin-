import React from 'react';
import './dashboard-tab-placeholder.css';

interface DashboardTabPlaceholderProps {
  title: string;
}

export const DashboardTabPlaceholder: React.FC<DashboardTabPlaceholderProps> = ({ title }) => (
  <div className="dashboard-tab-placeholder" aria-label={`${title} — empty workspace`}>
    <div className="dashboard-tab-placeholder__inner">
      <p className="dashboard-tab-placeholder__title">{title}</p>
      <p className="dashboard-tab-placeholder__hint">New design coming soon.</p>
    </div>
  </div>
);
