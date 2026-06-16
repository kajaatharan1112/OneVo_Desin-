import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LeaveScopeMultiSelect } from '../../leave/configuration/LeaveScopeMultiSelect';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useOvertimeRulesStore } from './overtimeRulesStore';
import {
  EMPTY_OVERTIME_RULE_FORM,
  type OvertimeAppliesTo,
  type OvertimeApprover,
  type OvertimeRatePreset,
  type OvertimeRounding,
  type OvertimeRuleFormValues,
  type OvertimeTrigger
} from './overtimeRulesTypes';
import { ruleToFormValues } from './overtimeRulesUtils';

const APPLIES_TO_OPTIONS: { value: OvertimeAppliesTo; label: string }[] = [
  { value: 'full-company', label: 'Full Company' },
  { value: 'departments', label: 'Departments' },
  { value: 'positions', label: 'Positions' },
  { value: 'employees', label: 'Employees' }
];

const TRIGGER_OPTIONS: { value: OvertimeTrigger; label: string }[] = [
  { value: 'after-scheduled-end', label: 'After scheduled end' },
  { value: 'exceeds-scheduled-hours', label: 'Worked time exceeds scheduled hours' },
  { value: 'non-working-day-holiday', label: 'Non-working day or holiday' }
];

const ROUNDING_OPTIONS: { value: OvertimeRounding; label: string }[] = [
  { value: 'exact', label: 'Exact' },
  { value: 'nearest-15', label: 'Nearest 15 minutes' },
  { value: 'nearest-30', label: 'Nearest 30 minutes' }
];

const APPROVER_OPTIONS: { value: OvertimeApprover; label: string }[] = [
  { value: 'reporting-manager', label: 'Reporting Manager' },
  { value: 'department-head', label: 'Department Head' },
  { value: 'specific-position', label: 'Specific Position' },
  { value: 'specific-employee', label: 'Specific Employee' }
];

const RATE_OPTIONS: { value: OvertimeRatePreset; label: string }[] = [
  { value: '1x', label: '1x' },
  { value: '1.5x', label: '1.5x' },
  { value: '2x', label: '2x' },
  { value: 'custom', label: 'Custom' }
];

export const OvertimeRuleModal: React.FC = () => {
  const { form, rules, closeForm, saveRule } = useOvertimeRulesStore();
  const { employees, departments, positions } = useOrganizationStore();

  const existing = form.ruleId ? rules.find(r => r.id === form.ruleId) : null;
  const isEdit = form.mode === 'edit';

  const [values, setValues] = useState<OvertimeRuleFormValues>(EMPTY_OVERTIME_RULE_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setValues(ruleToFormValues(existing));
    } else {
      setValues(EMPTY_OVERTIME_RULE_FORM());
    }
    setError(null);
  }, [isEdit, existing, form.open]);

  if (!form.open) return null;

  const handleSave = () => {
    const result = saveRule(values);
    if (!result.ok) setError(result.error ?? 'Unable to save rule.');
  };

  const set = <K extends keyof OvertimeRuleFormValues>(key: K, val: OvertimeRuleFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeForm}>
      <div
        className="schedules-cfg-modal ot-rules-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit overtime rule' : 'Add overtime rule'}
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>{isEdit ? 'Edit Overtime Rule' : 'Add Overtime Rule'}</h2>
          <button type="button" className="org-slideover__close" onClick={closeForm} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <section className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Basic</label>
            <div className="org-form-field">
              <label>Rule Name</label>
              <input
                value={values.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Standard Overtime"
              />
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
          </section>

          <section className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Applies To</label>
            <div className="leave-cfg-segmented leave-cfg-segmented--wrap">
              {APPLIES_TO_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`leave-cfg-segmented__btn${values.appliesTo === opt.value ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => set('appliesTo', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="ot-rules-hint">
              More specific rules override broader rules. Employee overrides Position, Position overrides
              Department, Department overrides Full Company.
            </p>

            {values.appliesTo === 'departments' && (
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

            {values.appliesTo === 'positions' && (
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

            {values.appliesTo === 'employees' && (
              <LeaveScopeMultiSelect
                label="Employees"
                options={employees
                  .filter(e => e.status === 'active')
                  .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                selectedIds={values.employeeIds}
                onChange={ids => set('employeeIds', ids)}
                placeholder="Search employees…"
              />
            )}
          </section>

          <section className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Overtime Detection</label>
            <div className="org-form-field">
              <label>Track overtime</label>
              <div className="schedules-cfg-radio-group">
                <label className="schedules-cfg-radio">
                  <input
                    type="radio"
                    name="trackOvertime"
                    checked={values.trackOvertime}
                    onChange={() => set('trackOvertime', true)}
                  />
                  Yes
                </label>
                <label className="schedules-cfg-radio">
                  <input
                    type="radio"
                    name="trackOvertime"
                    checked={!values.trackOvertime}
                    onChange={() => set('trackOvertime', false)}
                  />
                  No
                </label>
              </div>
            </div>

            {!values.trackOvertime ? (
              <p className="ot-rules-note">
                Employees covered by this rule will not generate overtime records.
              </p>
            ) : (
              <>
                <p className="ot-rules-warning">
                  Employees without an assigned schedule cannot generate automatic overtime.
                </p>

                <div className="org-form-field">
                  <label>Trigger</label>
                  <select
                    value={values.trigger}
                    onChange={e => set('trigger', e.target.value as OvertimeTrigger)}
                  >
                    <option value="">Select trigger…</option>
                    {TRIGGER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="org-form-field">
                  <label>Minimum overtime minutes</label>
                  <input
                    type="number"
                    min={0}
                    value={values.minimumMinutes}
                    onChange={e => set('minimumMinutes', Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>

                <div className="org-form-field">
                  <label>Rounding</label>
                  <select
                    value={values.rounding}
                    onChange={e => set('rounding', e.target.value as OvertimeRounding)}
                  >
                    {ROUNDING_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </section>

          {values.trackOvertime && (
            <>
              <section className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Approval</label>
                <div className="org-form-field">
                  <label>Requires approval</label>
                  <div className="schedules-cfg-radio-group">
                    <label className="schedules-cfg-radio">
                      <input
                        type="radio"
                        name="requiresApproval"
                        checked={values.requiresApproval}
                        onChange={() => set('requiresApproval', true)}
                      />
                      Yes
                    </label>
                    <label className="schedules-cfg-radio">
                      <input
                        type="radio"
                        name="requiresApproval"
                        checked={!values.requiresApproval}
                        onChange={() => set('requiresApproval', false)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {values.requiresApproval && (
                  <>
                    <div className="org-form-field">
                      <label>Approver</label>
                      <select
                        value={values.approver}
                        onChange={e => set('approver', e.target.value as OvertimeApprover)}
                      >
                        <option value="">Select approver…</option>
                        {APPROVER_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {values.approver === 'specific-position' && (
                      <div className="org-form-field">
                        <label>Position</label>
                        <select
                          value={values.approverPositionId}
                          onChange={e => set('approverPositionId', e.target.value)}
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

                    {values.approver === 'specific-employee' && (
                      <div className="org-form-field">
                        <label>Employee</label>
                        <select
                          value={values.approverEmployeeId}
                          onChange={e => set('approverEmployeeId', e.target.value)}
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
                    )}
                  </>
                )}
              </section>

              <section className="schedules-cfg-form-section">
                <label className="schedules-cfg-form-section__label">Payroll</label>
                <div className="org-form-field">
                  <label>Paid overtime</label>
                  <div className="schedules-cfg-radio-group">
                    <label className="schedules-cfg-radio">
                      <input
                        type="radio"
                        name="paidOvertime"
                        checked={values.paidOvertime}
                        onChange={() => set('paidOvertime', true)}
                      />
                      Yes
                    </label>
                    <label className="schedules-cfg-radio">
                      <input
                        type="radio"
                        name="paidOvertime"
                        checked={!values.paidOvertime}
                        onChange={() => set('paidOvertime', false)}
                      />
                      No
                    </label>
                  </div>
                </div>

                {values.paidOvertime ? (
                  <>
                    <div className="org-form-field">
                      <label>Rate multiplier</label>
                      <select
                        value={values.ratePreset}
                        onChange={e => set('ratePreset', e.target.value as OvertimeRatePreset)}
                      >
                        <option value="">Select rate…</option>
                        {RATE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {values.ratePreset === 'custom' && (
                      <div className="org-form-field">
                        <label>Custom multiplier</label>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          value={values.customRate}
                          onChange={e => set('customRate', e.target.value)}
                          placeholder="e.g. 1.25"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="ot-rules-note">
                    Approved overtime is tracked for attendance records but will not be sent as payable
                    overtime.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeForm}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Rule
          </button>
        </footer>
      </div>
    </div>
  );
};
