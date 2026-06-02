import React from 'react';
import { Inbox } from 'lucide-react';

export const TenantRequests: React.FC = () => {
  return (
    <div className="content-card">
      <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--accent)' }}>
        <Inbox size={40} />
      </span>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '8px' }}>
        Tenant Requests Portal
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
        This is a dedicated workspace panel for the tenant's custom requests management interface.
      </p>
    </div>
  );
};
