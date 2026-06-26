import React, { useState } from 'react';
import { useBulkOnboardingStore, runId } from '../../../../store/bulkOnboardingStore';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { useChecklistTaskStore } from '../../../../store/checklistTaskStore';
import { summarizeRows } from '../bulkOnboardingUtils';
import type { ImportRun } from '../bulkOnboardingTypes';

const CURRENT_USER_NAME = 'You';

export const Step6ConfirmImport: React.FC = () => {
  const { rows, accessGroups, fileName, recordImportRun, nextStep, prevStep } = useBulkOnboardingStore();
  const { completeEmployeeOnboarding } = useOrganizationStore();
  const { generateTasksForEmployee } = useChecklistTaskStore();
  const [importing, setImporting] = useState(false);

  const summary = summarizeRows(rows);
  const importable = rows.filter(r => !r.skip && r.errors.length === 0);

  const handleImport = () => {
    setImporting(true);
    const createdEmployeeIds: string[] = [];
    const failedRows: typeof rows = [];

    for (const row of importable) {
      const group = accessGroups.find(g => g.rowIndexes.includes(row.rowIndex));
      const normalizedType = row.employmentType.toLowerCase().replace(/\s+/g, '-');
      const employmentType = (['full-time', 'part-time', 'contract'].includes(normalizedType)
        ? normalizedType
        : 'full-time') as 'full-time' | 'part-time' | 'contract';

      const result = completeEmployeeOnboarding({
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.workEmail,
        phone: '',
        employeeNumber: '',
        legalEntity: '',
        employmentType,
        startDate: row.startDate,
        workMode: 'onsite',
        positionId: row.resolvedPositionId ?? '',
        confirmedRoleIds: group?.confirmedRoleIds ?? []
      });

      if (result.ok && result.employeeId) {
        createdEmployeeIds.push(result.employeeId);
        generateTasksForEmployee(result.employeeId, 'onboarding', row.startDate);
      } else {
        failedRows.push({ ...row, errors: [...row.errors, result.error ?? 'Import failed.'] });
      }
    }

    const run: ImportRun = {
      id: runId(),
      fileName,
      uploadedBy: CURRENT_USER_NAME,
      uploadedAt: new Date().toISOString(),
      totalRows: rows.length,
      importedCount: createdEmployeeIds.length,
      warningCount: summary.warning,
      failedCount: summary.failed + failedRows.length,
      skippedCount: summary.skipped,
      inviteStatus: 'not-sent',
      status: 'imported',
      createdEmployeeIds,
      failedRows
    };
    recordImportRun(run);
    setImporting(false);
    nextStep();
  };

  return (
    <div className="bulk-onboard-step">
      <h3>Confirm Import</h3>
      <p className="emp-form-hint">
        {importable.length} of {rows.length} row(s) will be imported (valid + warning rows not marked Skip).
        Imported employees will be created with status <strong>Onboarding</strong>, position assignments will be created,
        onboarding checklist tasks will be generated, and the confirmed access from Step 4 will be applied.
        Invitations are <strong>not</strong> sent yet.
      </p>

      <div className="bulk-onboard-step__footer">
        <button type="button" className="org-btn org-btn--secondary" onClick={prevStep} disabled={importing}>Back</button>
        <button type="button" className="org-btn org-btn--primary" onClick={handleImport} disabled={importing || importable.length === 0}>
          {importing ? 'Importing…' : 'Import employees'}
        </button>
      </div>
    </div>
  );
};
