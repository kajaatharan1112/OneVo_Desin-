import React from 'react';
import { Building2 } from 'lucide-react';
import './tenant-all-companies-empty.css';

export const TenantAllCompaniesEmptyPage: React.FC = () => {
  return (
    <div className="tenant-all-companies-empty">
      <div className="empty-state-content">
        <Building2 size={64} className="empty-icon" />
        <h2>All Companies Overview</h2>
        <p>Select OneVo HRMS, Selfwora, Athvo, or Bubble from the brand menu to view that company&apos;s dashboard.</p>
      </div>
    </div>
  );
};
