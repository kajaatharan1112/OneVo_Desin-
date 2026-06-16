import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LeaveScopeMultiSelect } from '../../leave/configuration/LeaveScopeMultiSelect';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useHRCoverageStore } from './hrCoverageStore';
import {
  EMPTY_HR_COVERAGE_FORM,
  HR_COVERAGE_ACCESS_OPTIONS,
  type CoverageOwnerType,
  type CoverageType,
  type HRCoverageFormValues
} from './hrCoverageTypes';

export const HRCoverageModal: React.FC = () => {
  const { form, rules, closeForm, saveRule } = useHRCoverageStore();
  const { employees, departments, positions } = useOrganizationStore();

  const existing = form.ruleId ? rules.find(r => r.id === form.ruleId) : null;
  const isEdit = form.mode === 'edit';

  const [values, setValues] = useState<HRCoverageFormValues>(EMPTY_HR_COVERAGE_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setValues({
        ownerType: existing.ownerType,
        ownerEmployeeId: existing.ownerEmployeeId ?? '',
        ownerPositionId: existing.ownerPositionId ?? '',
        coverageType: existing.coverageType,
        departmentIds: [...existing.departmentIds],
        positionIds: [...existing.positionIds],
        accessAllowed: [...existing.accessAllowed],
        status: existing.status
      });
    } else {
      setValues(EMPTY_HR_COVERAGE_FORM());
    }
    setError(null);
  }, [isEdit, existing, form.open]);

  if (!form.open) return null;

  const set = <K extends keyof HRCoverageFormValues>(key: K, val: HRCoverageFormValues[K]) => {
    setValues(v => ({ ...v, [key]: val }));
  };

  const toggleAccess = (key: (typeof HR_COVERAGE_ACCESS_OPTIONS)[number]['key']) => {
    setValues(v => ({
      ...v,
      accessAllowed: v.accessAllowed.includes(key)
        ? v.accessAllowed.filter(k => k !== key)
        : [...v.accessAllowed, key]
    }));
  };

  const handleSave = () => {
    const result = saveRule(values);
    if (!result.ok) setError(result.error ?? 'Unable to save coverage.');
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeForm}>
      <div
        className="schedules-cfg-modal hr-coverage-modal"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>{isEdit ? 'Edit HR Coverage' : 'Add Coverage'}</h2>
          <button type="button" className="org-slideover__close" onClick={closeForm} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Coverage owner type</label>
            <div className="leave-cfg-segmented">
              {(['employee', 'position'] as CoverageOwnerType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  className={`leave-cfg-segmented__btn${values.ownerType === t ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => set('ownerType', t)}
                >
                  {t === 'employee' ? 'Employee' : 'Position'}
                </button>
              ))}
            </div>
          </div>

          {values.ownerType === 'employee' ? (
            <div className="org-form-field">
              <label>Coverage owner</label>
              <select
                value={values.ownerEmployeeId}
                onChange={e => set('ownerEmployeeId', e.target.value)}
              >
                <option value="">Select employee…</option>
                {employees
                  .filter(e => e.status === 'active')
                  .map(e => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="org-form-field">
              <label>Coverage owner</label>
              <select
                value={values.ownerPositionId}
                onChange={e => set('ownerPositionId', e.target.value)}
              >
                <option value="">Select position…</option>
                {positions
                  .filter(p => p.status === 'active')
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Coverage type</label>
            <div className="leave-cfg-segmented leave-cfg-segmented--wrap">
              {(
                [
                  { value: 'entire_company', label: 'Entire company' },
                  { value: 'selected_departments', label: 'Selected departments' },
                  { value: 'selected_positions', label: 'Selected positions' }
                ] as { value: CoverageType; label: string }[]
              ).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`leave-cfg-segmented__btn${values.coverageType === opt.value ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => set('coverageType', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {values.coverageType === 'selected_departments' && (
            <LeaveScopeMultiSelect
              label="Departments"
              options={departments
                .filter(d => d.status === 'active')
                .map(d => ({ id: d.id, name: d.name }))}
              selectedIds={values.departmentIds}
              onChange={ids => set('departmentIds', ids)}
              placeholder="Search departments…"
            />
          )}

          {values.coverageType === 'selected_positions' && (
            <LeaveScopeMultiSelect
              label="Positions"
              options={positions
                .filter(p => p.status === 'active')
                .map(p => ({ id: p.id, name: p.name }))}
              selectedIds={values.positionIds}
              onChange={ids => set('positionIds', ids)}
              placeholder="Search positions…"
            />
          )}

          <div className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Access allowed</label>
            <div className="hr-coverage-access-list">
              {HR_COVERAGE_ACCESS_OPTIONS.map(opt => (
                <label key={opt.key} className="schedules-cfg-radio">
                  <input
                    type="checkbox"
                    checked={values.accessAllowed.includes(opt.key)}
                    onChange={() => toggleAccess(opt.key)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="org-form-field">
            <label>Status</label>
            <div className="leave-cfg-segmented">
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.status === 'active' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => set('status', 'active')}
              >
                Active
              </button>
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.status === 'inactive' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => set('status', 'inactive')}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeForm}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Coverage
          </button>
        </footer>
      </div>
    </div>
  );
};
