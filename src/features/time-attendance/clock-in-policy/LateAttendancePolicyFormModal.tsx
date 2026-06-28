import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useClockInPolicyStore } from './clockInPolicyStore';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';

export const LateAttendancePolicyFormModal: React.FC = () => {
  const {
    lateAttendanceForm,
    lateAttendancePolicy,
    closeLateAttendanceForm,
    saveLateAttendancePolicy
  } = useClockInPolicyStore();

  const leaveTypes = useLeaveConfigStore(s => s.leaveTypes);
  const activeLeaveTypes = leaveTypes.filter(t => t.status === 'active');

  const [gracePeriod, setGracePeriod] = useState<number>(lateAttendancePolicy.gracePeriod);
  const [gracePeriodUnit, setGracePeriodUnit] = useState<'minutes' | 'hours'>(
    lateAttendancePolicy.gracePeriodUnit
  );
  const [deductFromLeaveTypeId, setDeductFromLeaveTypeId] = useState<string>(
    lateAttendancePolicy.deductFromLeaveTypeId
  );
  const [deductionCalculationMethod, setDeductionCalculationMethod] = useState<
    'actual_minutes' | 'double_minutes' | 'triple_minutes'
  >(lateAttendancePolicy.deductionCalculationMethod);

  if (!lateAttendanceForm.open) return null;

  const handleSave = () => {
    saveLateAttendancePolicy({
      gracePeriod,
      gracePeriodUnit,
      deductFromLeaveTypeId,
      deductionCalculationMethod
    });
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeLateAttendanceForm}>
      <div
        className="schedules-cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Late Attendance Policy"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <header className="schedules-cfg-modal__header">
          <h2>Edit Late Attendance Policy</h2>
          <button
            type="button"
            className="org-slideover__close"
            onClick={closeLateAttendanceForm}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          <div className="org-form-field">
            <label>GRACE PERIOD</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
              <input
                type="number"
                min={0}
                value={gracePeriod}
                onChange={e => setGracePeriod(Number(e.target.value))}
              />
              <select
                value={gracePeriodUnit}
                onChange={e => setGracePeriodUnit(e.target.value as 'minutes' | 'hours')}
                style={{ width: '120px' }}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>

          <div className="org-form-field">
            <label>DEDUCT FROM LEAVE TYPE</label>
            <select
              value={deductFromLeaveTypeId}
              onChange={e => setDeductFromLeaveTypeId(e.target.value)}
            >
              {activeLeaveTypes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
              {activeLeaveTypes.length === 0 && (
                <option value="">No active leave types found</option>
              )}
            </select>
          </div>

          <div className="org-form-field">
            <label>DEDUCTION CALCULATION METHOD</label>
            <select
              value={deductionCalculationMethod}
              onChange={e =>
                setDeductionCalculationMethod(
                  e.target.value as 'actual_minutes' | 'double_minutes' | 'triple_minutes'
                )
              }
            >
              <option value="actual_minutes">Actual Minutes</option>
              <option value="double_minutes">Double Late Minutes</option>
              <option value="triple_minutes">Triple Late Minutes</option>
            </select>
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button
            type="button"
            className="org-btn org-btn--secondary"
            onClick={closeLateAttendanceForm}
          >
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};
