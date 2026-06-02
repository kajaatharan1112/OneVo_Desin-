import React, { useState } from 'react';
import './tenant-setup-wizard.css';
import { TenantSetupWizard as WizardModal } from '../../components/tenant-setup-wizard';

export const TenantSetupWizard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="tenant-setup-wizard">
      <div className="page-header">
        <h1>Set up Wizards</h1>
        <p className="text-secondary">Complete your tenant configuration here.</p>
      </div>
      <div className="page-content">
        <div className="empty-state-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Setup Wizard Component Built</h2>
          <p style={{ marginBottom: '20px' }}>Click the button below to test the 3-step setup wizard popup.</p>
          <button 
            className="btn-primary" 
            style={{ padding: '10px 24px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => setIsOpen(true)}
          >
            Launch Wizard
          </button>
        </div>
      </div>

      {isOpen && (
        <WizardModal 
          onFinish={() => setIsOpen(false)} 
          onCancel={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
};
