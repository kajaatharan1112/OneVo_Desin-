import React, { useEffect } from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { buildImportRows, validateImportRows } from '../bulkOnboardingUtils';

export const Step3ResolveOrganization: React.FC = () => {
  const { headers, rawRows, mapping, rows, setRows, nextStep, prevStep } = useBulkOnboardingStore();
  const { departments, positions, assignments, employees } = useOrganizationStore();

  useEffect(() => {
    const built = buildImportRows(headers, rawRows, mapping);
    const validated = validateImportRows(built, departments, positions, assignments, employees);
    setRows(validated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unresolved = rows.filter(r => r.errors.some(e => e === 'Unknown department.' || e === 'Unknown position.'));

  return (
    <div className="bulk-onboard-step">
      <h3>Resolve Organization</h3>
      <p className="emp-form-hint">Department and Position values from the file are matched against existing records. Unresolved rows show errors below.</p>

      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Row</th>
              <th>Employee</th>
              <th>Department (file)</th>
              <th>Position (file)</th>
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.rowIndex}>
                <td>{row.rowIndex + 1}</td>
                <td>{row.firstName} {row.lastName}</td>
                <td>{row.departmentName || '—'}</td>
                <td>{row.positionName || '—'}</td>
                <td>
                  {row.errors.includes('Unknown department.') && <span className="cfg-badge cfg-badge--inactive">Unknown department</span>}
                  {row.errors.includes('Unknown position.') && <span className="cfg-badge cfg-badge--inactive">Unknown position</span>}
                  {!row.errors.includes('Unknown department.') && !row.errors.includes('Unknown position.') && <span className="cfg-badge cfg-badge--active">Resolved</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unresolved.length > 0 && (
        <p className="schedules-cfg-form-error">
          {unresolved.length} row(s) have an unresolved department or position. Continuing will flag these as failed in Step 5 — you can skip them there or fix and re-upload the file.
        </p>
      )}

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
