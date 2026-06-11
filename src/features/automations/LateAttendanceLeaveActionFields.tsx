import React, { useMemo } from 'react';
import { useLeaveConfigStore } from '../../store/leaveConfigStore';
import type { AutomationStep } from './automationTypes';
import { DEFAULT_LATE_ATTENDANCE_SETUP, isLateAttendanceLeaveAction } from './lateAttendanceLeaveTemplate';

interface LateAttendanceLeaveActionFieldsProps {
  config: AutomationStep['config'];
  onChange: (updates: Partial<AutomationStep['config']>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="builder-config__section">
      <label>{label}</label>
      {children}
    </div>
  );
}

export const LateAttendanceLeaveActionFields: React.FC<LateAttendanceLeaveActionFieldsProps> = ({
  config,
  onChange
}) => {
  const actionKey = String(config.actionKey ?? '');
  const leaveTypes = useLeaveConfigStore(s => s.leaveTypes);
  const leaveTypeOptions = useMemo(
    () => leaveTypes.filter(t => t.status === 'active'),
    [leaveTypes]
  );

  if (!isLateAttendanceLeaveAction(actionKey) || actionKey === 'create_attendance_alert') return null;

  const approvalMode = String(config.approvalMode ?? 'auto_apply');

  const handleLeaveType = (leaveTypeId: string) => {
    const match = leaveTypeOptions.find(t => t.id === leaveTypeId);
    onChange({
      leaveTypeId,
      leaveTypeName: match?.name ?? ''
    });
  };

  return (
    <>
      <Field label="Leave Type">
        <select
          value={String(config.leaveTypeId ?? DEFAULT_LATE_ATTENDANCE_SETUP.leaveTypeId)}
          onChange={e => handleLeaveType(e.target.value)}
        >
          {leaveTypeOptions.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </Field>
      {actionKey !== 'deduct_late_time_from_leave_balance' && (
        <Field label="Deduction Amount">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              min={0}
              step={actionKey === 'convert_attendance_to_half_day_leave' ? 0.5 : 1}
              value={Number(config.deductionAmount ?? (actionKey === 'convert_attendance_to_half_day_leave' ? 0.5 : 1))}
              onChange={e => onChange({ deductionAmount: Number(e.target.value) })}
            />
            <span>day</span>
          </div>
        </Field>
      )}
      {actionKey === 'deduct_late_time_from_leave_balance' && (
        <Field label="Deduction Source">
          <input value="Late minutes" readOnly />
        </Field>
      )}
      <Field label="Workday Hours">
        <input
          type="number"
          min={1}
          value={Number(config.workdayHours ?? DEFAULT_LATE_ATTENDANCE_SETUP.workdayHours)}
          onChange={e => onChange({ workdayHours: Number(e.target.value) })}
        />
      </Field>
      {actionKey === 'deduct_late_time_from_leave_balance' && (
        <Field label="Rounding">
          <select
            value={String(config.rounding ?? DEFAULT_LATE_ATTENDANCE_SETUP.rounding)}
            onChange={e => onChange({ rounding: e.target.value })}
          >
            <option value="exact">Exact</option>
            <option value="nearest_15">Nearest 15 minutes</option>
            <option value="nearest_30">Nearest 30 minutes</option>
          </select>
        </Field>
      )}
      <Field label="Approval Mode">
        <select
          value={approvalMode}
          onChange={e => onChange({ approvalMode: e.target.value })}
        >
          <option value="auto_apply">Auto apply</option>
          <option value="require_approval">Require approval</option>
        </select>
      </Field>
    </>
  );
};
