import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ValidationIssue } from './automationUtils';

interface AutomationValidationPanelProps {
  issues: ValidationIssue[];
}

export const AutomationValidationPanel: React.FC<AutomationValidationPanelProps> = ({ issues }) => {
  const isValid = issues.length === 0;
  return (
    <div className={`validation-panel ${isValid ? 'validation-panel--ok' : 'validation-panel--error'}`}>
      <div className="builder-config__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {isValid ? <CheckCircle2 size={14} color="#166534" /> : <AlertCircle size={14} color="#991b1b" />}
        {isValid ? 'Ready to activate' : `${issues.length} issue${issues.length > 1 ? 's' : ''} to fix`}
      </div>
      {isValid ? (
        <p style={{ fontSize: '0.72rem', margin: 0, color: '#166534' }}>This automation is complete and can be activated.</p>
      ) : (
        issues.map(i => (
          <div key={i.id} className="validation-item validation-item--error">
            <AlertCircle size={12} /> {i.message}
          </div>
        ))
      )}
    </div>
  );
};
