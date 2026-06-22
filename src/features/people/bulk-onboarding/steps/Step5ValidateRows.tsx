import React from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { summarizeRows } from '../bulkOnboardingUtils';

export const Step5ValidateRows: React.FC = () => {
  const { rows, toggleRowSkip, nextStep, prevStep } = useBulkOnboardingStore();
  const summary = summarizeRows(rows);

  return (
    <div className="bulk-onboard-step">
      <h3>Validate Rows</h3>

      <div className="bulk-onboard-summary-grid">
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.valid}</div>
          <div className="bulk-onboard-summary-card__label">Valid</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.warning}</div>
          <div className="bulk-onboard-summary-card__label">Warnings</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.failed}</div>
          <div className="bulk-onboard-summary-card__label">Failed</div>
        </div>
        <div className="bulk-onboard-summary-card">
          <div className="bulk-onboard-summary-card__value">{summary.skipped}</div>
          <div className="bulk-onboard-summary-card__label">Skipped</div>
        </div>
      </div>

      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>Employee</th>
              <th>Errors</th>
              <th>Warnings</th>
              <th>Skip</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.rowIndex} className={row.skip ? 'cfg-table__row--inactive' : ''}>
                <td>{row.rowIndex + 1}</td>
                <td>{row.firstName} {row.lastName}<div className="cfg-table__meta">{row.workEmail}</div></td>
                <td>{row.errors.length > 0 ? row.errors.join('; ') : '—'}</td>
                <td>{row.warnings.length > 0 ? row.warnings.join('; ') : '—'}</td>
                <td>
                  {row.errors.length > 0 && (
                    <label className="cip-toggle-row">
                      <input type="checkbox" checked={row.skip} onChange={() => toggleRowSkip(row.rowIndex)} />
                      Skip
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
