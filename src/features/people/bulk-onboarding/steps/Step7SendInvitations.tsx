import React from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { employeeFullName } from '../../employees/employeeProfileUtils';

interface Step7Props {
  onDone: () => void;
}

export const Step7SendInvitations: React.FC<Step7Props> = ({ onDone }) => {
  const { importRuns, activeRunId, updateImportRun } = useBulkOnboardingStore();
  const { employees } = useOrganizationStore();

  const run = importRuns.find(r => r.id === activeRunId);
  if (!run) return null;

  const sample = employees.filter(e => run.createdEmployeeIds.includes(e.id)).slice(0, 5);

  const handleSendInvites = () => {
    updateImportRun(run.id, { inviteStatus: 'sent', status: 'invites-sent' });
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Send Invitations</h3>

      <div className="bulk-onboard-summary-grid">
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{run.importedCount}</div>
          <div className="bulk-onboard-summary-card__label">Imported</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{run.skippedCount}</div>
          <div className="bulk-onboard-summary-card__label">Skipped</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{run.failedCount}</div>
          <div className="bulk-onboard-summary-card__label">Failed</div>
        </div>
      </div>

      <h4>Spot-check sample</h4>
      <ul>
        {sample.map(e => <li key={e.id}>{employeeFullName(e)} · {e.email}</li>)}
      </ul>

      {run.inviteStatus === 'sent' ? (
        <p className="emp-form-hint">Invitations sent to {run.importedCount} employee(s).</p>
      ) : (
        <p className="emp-form-hint">Send invite emails to the {run.importedCount} successfully imported employee(s).</p>
      )}

      <div className="bulk-onboard-step__footer">
        {run.inviteStatus === 'sent' ? (
          <button type="button" className="org-btn org-btn--primary" onClick={onDone}>Done</button>
        ) : (
          <>
            <button type="button" className="org-btn org-btn--secondary" onClick={onDone}>Close</button>
            <button type="button" className="org-btn org-btn--primary" onClick={handleSendInvites}>Send Invitations</button>
          </>
        )}
      </div>
    </div>
  );
};
