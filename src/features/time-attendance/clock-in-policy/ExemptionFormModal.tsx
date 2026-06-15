import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useClockInPolicyStore } from './clockInPolicyStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import { LeaveScopeMultiSelect } from '../../leave/configuration/LeaveScopeMultiSelect';
import {
  EMPTY_EXEMPTION_FORM,
  type ExemptionFormValues,
  type ExemptionScope
} from './clockInPolicyTypes';

export const ExemptionFormModal: React.FC = () => {
  const { exemptionForm, exemptions, closeExemptionForm, saveExemption } =
    useClockInPolicyStore();
  const { employees, departments, positions } = useOrganizationStore();

  const existing = exemptionForm.exemptionId
    ? exemptions.find(e => e.id === exemptionForm.exemptionId)
    : null;
  const isEdit = exemptionForm.mode === 'edit';

  const [values, setValues] = useState<ExemptionFormValues>(EMPTY_EXEMPTION_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setValues({
        name: existing.name,
        scope: existing.scope,
        employeeIds: [...existing.employeeIds],
        departmentIds: [...existing.departmentIds],
        positionIds: [...existing.positionIds],
        clockInRequired: existing.clockInRequired,
        startsMode: existing.startsImmediately ? 'immediately' : 'on-date',
        effectiveFrom: existing.effectiveFrom,
        endsMode: existing.effectiveTo ? 'on-date' : 'no-end',
        effectiveTo: existing.effectiveTo ?? '',
        reason: existing.reason ?? '',
        status: existing.status
      });
    } else {
      setValues(EMPTY_EXEMPTION_FORM());
    }
    setError(null);
  }, [isEdit, existing, exemptionForm]);

  if (!exemptionForm.open) return null;

  const handleSave = () => {
    const result = saveExemption(values);
    if (!result.ok) setError(result.error ?? 'Unable to save exemption.');
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeExemptionForm}>
      <div
        className="schedules-cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit exemption' : 'Add exemption'}
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>{isEdit ? 'Edit Clock-in Exemption' : 'Add Clock-in Exemption'}</h2>
          <button type="button" className="org-slideover__close" onClick={closeExemptionForm} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="org-form-field">
            <label>Exemption Name</label>
            <input
              value={values.name}
              onChange={e => setValues(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Executive exemption"
            />
          </div>

          <div className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Applies To</label>
            <div className="leave-cfg-segmented">
              {(['employee', 'department', 'position'] as ExemptionScope[]).map(scope => (
                <button
                  key={scope}
                  type="button"
                  className={`leave-cfg-segmented__btn${values.scope === scope ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => setValues(prev => ({ ...prev, scope }))}
                >
                  {scope === 'employee' ? 'Employee' : scope === 'department' ? 'Department' : 'Position'}
                </button>
              ))}
            </div>

            {values.scope === 'employee' && (
              <LeaveScopeMultiSelect
                label="Employees"
                options={employees
                  .filter(e => e.status === 'active')
                  .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                selectedIds={values.employeeIds}
                onChange={ids => setValues(prev => ({ ...prev, employeeIds: ids }))}
                placeholder="Search employees…"
              />
            )}

            {values.scope === 'department' && (
              <LeaveScopeMultiSelect
                label="Departments"
                options={departments
                  .filter(d => d.status === 'active')
                  .map(d => ({ id: d.id, name: d.name }))}
                selectedIds={values.departmentIds}
                onChange={ids => setValues(prev => ({ ...prev, departmentIds: ids }))}
                placeholder="Search departments…"
              />
            )}

            {values.scope === 'position' && (
              <LeaveScopeMultiSelect
                label="Positions"
                options={positions
                  .filter(p => p.status === 'active')
                  .map(p => ({ id: p.id, name: p.name }))}
                selectedIds={values.positionIds}
                onChange={ids => setValues(prev => ({ ...prev, positionIds: ids }))}
                placeholder="Search positions…"
              />
            )}
          </div>

          <div className="org-form-field">
            <label>Clock-in Requirement</label>
            <div className="schedules-cfg-radio-group">
              <label className="schedules-cfg-radio">
                <input
                  type="radio"
                  name="clockInRequired"
                  checked={values.clockInRequired === 'exempt'}
                  onChange={() => setValues(prev => ({ ...prev, clockInRequired: 'exempt' }))}
                />
                Not required
              </label>
              <label className="schedules-cfg-radio">
                <input
                  type="radio"
                  name="clockInRequired"
                  checked={values.clockInRequired === 'required'}
                  onChange={() => setValues(prev => ({ ...prev, clockInRequired: 'required' }))}
                />
                Required
              </label>
            </div>
          </div>

          <div className="org-form-field">
            <label>Starts</label>
            <div className="leave-cfg-segmented">
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.startsMode === 'immediately' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setValues(prev => ({ ...prev, startsMode: 'immediately' }))}
              >
                Immediately
              </button>
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.startsMode === 'on-date' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setValues(prev => ({ ...prev, startsMode: 'on-date' }))}
              >
                On date
              </button>
            </div>
            {values.startsMode === 'on-date' && (
              <input
                type="date"
                className="cip-modal-date"
                value={values.effectiveFrom}
                onChange={e => setValues(prev => ({ ...prev, effectiveFrom: e.target.value }))}
              />
            )}
          </div>

          <div className="org-form-field">
            <label>Ends</label>
            <div className="leave-cfg-segmented">
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.endsMode === 'no-end' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setValues(prev => ({ ...prev, endsMode: 'no-end' }))}
              >
                No end date
              </button>
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.endsMode === 'on-date' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setValues(prev => ({ ...prev, endsMode: 'on-date' }))}
              >
                On date
              </button>
            </div>
            {values.endsMode === 'on-date' && (
              <input
                type="date"
                className="cip-modal-date"
                value={values.effectiveTo}
                onChange={e => setValues(prev => ({ ...prev, effectiveTo: e.target.value }))}
              />
            )}
          </div>

          <div className="org-form-field">
            <label>Reason</label>
            <textarea
              value={values.reason}
              onChange={e => setValues(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              placeholder="Optional reason for this exemption"
            />
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeExemptionForm}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Add Exemption'}
          </button>
        </footer>
      </div>
    </div>
  );
};
