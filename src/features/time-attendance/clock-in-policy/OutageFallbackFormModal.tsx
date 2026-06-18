import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useClockInPolicyStore } from './clockInPolicyStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import { LeaveScopeMultiSelect } from '../../leave/configuration/LeaveScopeMultiSelect';
import {
  EMPTY_OUTAGE_FORM,
  type OutageFormValues,
  type OutageScope
} from './clockInPolicyTypes';

export const OutageFallbackFormModal: React.FC = () => {
  const { outageForm, closeOutageForm, addOutageFallback } = useClockInPolicyStore();
  const { employees, departments, positions } = useOrganizationStore();
  const [values, setValues] = useState<OutageFormValues>(EMPTY_OUTAGE_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (outageForm.open) {
      setValues(EMPTY_OUTAGE_FORM());
      setError(null);
    }
  }, [outageForm.open]);

  if (!outageForm.open) return null;

  const handleSave = () => {
    const result = addOutageFallback(values);
    if (!result.ok) setError(result.error ?? 'Unable to enable fallback.');
  };

  const setScope = (scope: OutageScope) => {
    setValues(prev => ({
      ...prev,
      scope,
      employeeIds: scope === 'employee' ? prev.employeeIds : [],
      departmentIds: scope === 'department' ? prev.departmentIds : [],
      positionIds: scope === 'position' ? prev.positionIds : []
    }));
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeOutageForm}>
      <div
        className="schedules-cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add outage fallback"
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>Add outage fallback</h2>
          <button type="button" className="org-slideover__close" onClick={closeOutageForm} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Applies To</label>
            <div className="leave-cfg-segmented leave-cfg-segmented--wrap">
              {([
                ['company', 'Entire company'],
                ['department', 'Departments'],
                ['position', 'Positions'],
                ['employee', 'Employees']
              ] as Array<[OutageScope, string]>).map(([scope, label]) => (
                <button
                  key={scope}
                  type="button"
                  className={`leave-cfg-segmented__btn${values.scope === scope ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => setScope(scope)}
                >
                  {label}
                </button>
              ))}
            </div>

            {values.scope === 'department' && (
              <LeaveScopeMultiSelect
                label="Departments"
                options={departments
                  .filter(d => d.status === 'active')
                  .map(d => ({ id: d.id, name: d.name }))}
                selectedIds={values.departmentIds}
                onChange={ids => setValues(prev => ({ ...prev, departmentIds: ids }))}
                placeholder="Search departments..."
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
                placeholder="Search positions..."
              />
            )}

            {values.scope === 'employee' && (
              <LeaveScopeMultiSelect
                label="Employees"
                options={employees
                  .filter(e => e.status === 'active')
                  .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
                selectedIds={values.employeeIds}
                onChange={ids => setValues(prev => ({ ...prev, employeeIds: ids }))}
                placeholder="Search employees..."
              />
            )}
          </div>

          <div className="org-form-field">
            <label>Outage Reason</label>
            <input
              value={values.reason}
              onChange={e => setValues(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Biometric terminal maintenance"
            />
          </div>

          <div className="org-form-field">
            <label>Start Date &amp; Time</label>
            <div className="cip-date-time-row">
              <input
                type="date"
                value={values.startDate}
                onChange={e => setValues(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <input
                type="time"
                value={values.startTime}
                onChange={e => setValues(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="org-form-field">
            <label>End Date &amp; Time</label>
            <div className="cip-date-time-row">
              <input
                type="date"
                value={values.endDate}
                onChange={e => setValues(prev => ({ ...prev, endDate: e.target.value }))}
              />
              <input
                type="time"
                value={values.endTime}
                onChange={e => setValues(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="org-form-field">
            <label>Status</label>
            <select
              value={values.status}
              onChange={e =>
                setValues(prev => ({ ...prev, status: e.target.value as 'scheduled' | 'active' }))
              }
            >
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeOutageForm}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Enable Fallback
          </button>
        </footer>
      </div>
    </div>
  );
};
