import React from 'react';
import { useBulkOnboardingStore } from '../../../../store/bulkOnboardingStore';
import { getUnmappedRequiredFields } from '../bulkOnboardingUtils';
import { BULK_IMPORT_REQUIRED_COLUMNS, type BulkImportField } from '../bulkOnboardingTypes';

export const Step2MapColumns: React.FC = () => {
  const { headers, rawRows, mapping, setMapping, nextStep, prevStep } = useBulkOnboardingStore();

  const unmapped = getUnmappedRequiredFields(mapping);

  const sample = (headerIndex: number) => rawRows[0]?.[headerIndex] ?? '';

  return (
    <div className="bulk-onboard-step">
      <h3>Map Columns</h3>
      <p className="emp-form-hint">Known headers are mapped automatically. Map the remaining required fields before continuing.</p>

      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Source column</th>
              <th>Sample value</th>
              <th>Mapped field</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header, i) => (
              <tr key={header}>
                <td>{header}</td>
                <td>{sample(i)}</td>
                <td>
                  <select
                    value={mapping[header] ?? ''}
                    onChange={e => setMapping({ ...mapping, [header]: e.target.value as BulkImportField | '' })}
                  >
                    <option value="">— Ignore —</option>
                    {BULK_IMPORT_REQUIRED_COLUMNS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unmapped.length > 0 && (
        <p className="schedules-cfg-form-error">
          Map these required fields before continuing: {unmapped.join(', ')}
        </p>
      )}

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep}>Back</button>
        <button type="button" className="org-btn org-btn--primary" disabled={unmapped.length > 0} onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};
