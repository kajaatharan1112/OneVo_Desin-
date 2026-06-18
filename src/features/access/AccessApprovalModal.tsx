import React, { useMemo, useState } from 'react';
import { useAccessStore } from './accessStore';
import { formatAccessDiff, formatGrantSummary } from './accessUtils';
import { useActorAccess } from './useActorAccess';
import { useEmployeeProfileStore } from '../people/employees/employeeProfileStore';

interface AccessApprovalModalProps {
  requestId: string | null;
  onClose: () => void;
}

export const AccessApprovalModal: React.FC<AccessApprovalModalProps> = ({ requestId, onClose }) => {
  const { approvalRequests, approveAccessRequest, rejectAccessRequest } = useAccessStore();
  const { actorOrgEmployeeId, canManageAccess } = useActorAccess();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const request = useMemo(
    () => approvalRequests.find(r => r.id === requestId) ?? null,
    [approvalRequests, requestId]
  );

  const diff = useMemo(
    () =>
      request
        ? formatAccessDiff(request.previousGrants, request.generatedGrants)
        : { added: [], removed: [] },
    [request]
  );

  if (!requestId || !request) return null;

  const handleApprove = () => {
    const result = approveAccessRequest(requestId, actorOrgEmployeeId, comment.trim() || undefined);
    if (!result.ok) setError(result.error ?? 'Unable to approve.');
    else {
      const dept = request.targetDepartmentName ? ` · ${request.targetDepartmentName}` : '';
      useEmployeeProfileStore.getState().recordPositionChangeActivity(
        request.employeeId,
        request.actionType,
        `${request.actionType === 'promotion' ? 'Promotion' : 'Transfer'} completed`,
        `Moved to ${request.targetPositionName}${dept}`
      );
      onClose();
    }
  };

  const handleReject = () => {
    const result = rejectAccessRequest(requestId, actorOrgEmployeeId, comment.trim() || undefined);
    if (!result.ok) setError(result.error ?? 'Unable to reject.');
    else onClose();
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={onClose}>
      <div
        className="schedules-cfg-modal access-approval-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Position access approval"
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>Position Access Approval</h2>
        </header>
        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}
          <dl className="access-approval-detail">
            <div><dt>Requested by</dt><dd>{request.requestedByName}</dd></div>
            <div><dt>Employee</dt><dd>{request.employeeName}</dd></div>
            <div><dt>Action type</dt><dd className="access-approval-detail__cap">{request.actionType}</dd></div>
            <div><dt>Current position</dt><dd>{request.currentPositionName}</dd></div>
            <div><dt>Target position</dt><dd>{request.targetPositionName}</dd></div>
            <div><dt>Current department</dt><dd>{request.currentDepartmentName}</dd></div>
            <div><dt>Target department</dt><dd>{request.targetDepartmentName}</dd></div>
            <div><dt>New reporting manager</dt><dd>{request.newReportingManager}</dd></div>
            <div><dt>Effective date</dt><dd>{request.effectiveDate}</dd></div>
            <div><dt>Source</dt><dd>Position access template</dd></div>
          </dl>

          {canManageAccess && (
            <div className="access-approval-diff">
              <h3>Access changes to apply</h3>
              {diff.added.length > 0 && (
                <div className="access-approval-diff__section">
                  <strong>Added</strong>
                  <ul>
                    {diff.added.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                    {request.generatedGrants.map((g, i) => (
                      <li key={`g-${i}`}>{formatGrantSummary(g)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diff.removed.length > 0 && (
                <div className="access-approval-diff__section">
                  <strong>Removed</strong>
                  <ul>
                    {diff.removed.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diff.added.length === 0 && diff.removed.length === 0 && request.generatedGrants.length === 0 && (
                <p className="access-section__empty">No elevated access changes.</p>
              )}
            </div>
          )}

          <div className="org-form-field">
            <label>Comment (optional)</label>
            <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)} />
          </div>
        </div>
        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--danger" onClick={handleReject}>
            Reject
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleApprove}>
            Approve
          </button>
        </footer>
      </div>
    </div>
  );
};
