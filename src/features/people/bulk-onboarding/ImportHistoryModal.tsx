import React from 'react';
import { X } from 'lucide-react';
import { useBulkOnboardingStore } from '../../../store/bulkOnboardingStore';
import { downloadErrorReportCsv } from './bulkOnboardingUtils';

interface ImportHistoryModalProps {
  onClose: () => void;
  onReopenForInvites: (runId: string) => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ onClose, onReopenForInvites }) => {
  const { importRuns } = useBulkOnboardingStore();

  return (
    <div className="checklist-template-modal-overlay" onClick={onClose}>
      <div className="checklist-template-modal bulk-onboard-modal" role="dialog" aria-modal="true" aria-label="Import History" onClick={e => e.stopPropagation()}>
        <header className="checklist-template-modal__header">
          <h2>Import History</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="checklist-template-modal__body">
          {importRuns.length === 0 ? (
            <p className="cfg-empty__title">No bulk onboarding imports yet.</p>
          ) : (
            <div className="cfg-table-wrap">
              <table className="cfg-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Uploaded By</th>
                    <th>Uploaded On</th>
                    <th>Total Rows</th>
                    <th>Imported</th>
                    <th>Warnings</th>
                    <th>Failed</th>
                    <th>Invite Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {importRuns.map(run => (
                    <tr key={run.id}>
                      <td>{run.fileName}</td>
                      <td>{run.uploadedBy}</td>
                      <td>{new Date(run.uploadedAt).toLocaleString()}</td>
                      <td>{run.totalRows}</td>
                      <td>{run.importedCount}</td>
                      <td>{run.warningCount}</td>
                      <td>{run.failedCount}</td>
                      <td><span className={`cfg-badge cfg-badge--${run.inviteStatus === 'sent' ? 'active' : 'inactive'}`}>{run.inviteStatus === 'sent' ? 'Sent' : 'Not sent'}</span></td>
                      <td><span className="cfg-badge cfg-badge--active">{run.status}</span></td>
                      <td>
                        <div className="cfg-row-actions cfg-row-actions--labeled">
                          {run.status !== 'invites-sent' && run.importedCount > 0 && (
                            <button type="button" className="cfg-action-btn" onClick={() => onReopenForInvites(run.id)}>
                              Send Invitations
                            </button>
                          )}
                          {run.failedCount > 0 && (
                            <button type="button" className="cfg-action-btn" onClick={() => downloadErrorReportCsv(run.fileName, run.failedRows)}>
                              Download Error Report
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
