import React from 'react';
import type { StepConfig } from './automationTypes';
import { PersonTargetFields } from './PersonTargetFields';
import { AlertTargetFields } from './AlertTargetFields';
import { OneTimeTaskDurationControl } from './OneTimeTaskDurationControl';
import {
  ALERT_TARGET_TYPES,
  APPROVER_TARGET_TYPES,
  NOTIFICATION_TARGET_TYPES
} from './automationContextRules';
import {
  ON_REJECTED_OPTIONS,
  ON_TIMEOUT_OPTIONS,
  getApprovalTimeoutDuration,
  isApprovalTimeoutEnabled,
  normalizeRejectedOption
} from './approvalStepUtils';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';

interface ApprovalStepFieldsProps {
  config: StepConfig;
  triggerKey: string;
  positions: PositionOption[];
  employees: EmployeeOption[];
  onChange: (updates: Partial<StepConfig>) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="builder-config__section">
      <label>{label}</label>
      {children}
    </div>
  );
}

export const ApprovalStepFields: React.FC<ApprovalStepFieldsProps> = ({
  config,
  triggerKey,
  positions,
  employees,
  onChange
}) => {
  const timeoutEnabled = isApprovalTimeoutEnabled(config);
  const { hours, minutes } = getApprovalTimeoutDuration(config);
  const onTimeout = String(config.onTimeout ?? 'Do nothing');
  const onRejected = normalizeRejectedOption(config.onRejected);

  return (
    <>
      {triggerKey === 'leave_request_submitted' && (
        <p className="auto-condition-note">
          Choose who approves leave requests. Most teams start with Reporting Manager. Use IF conditions only when routing rules differ by leave days or type.
        </p>
      )}
      {triggerKey === 'attendance_correction_submitted' && (
        <p className="auto-condition-note">
          This Approval step creates the attendance correction approval request. Notify the employee after a decision. Use timeout behavior for escalation instead of adding an alert step immediately after approval.
        </p>
      )}

      <PersonTargetFields
        label="Approver Type"
        prefix="approver"
        config={config}
        positions={positions}
        employees={employees}
        allowedTypes={APPROVER_TARGET_TYPES}
        onChange={onChange}
      />

      <Field label="Timeout">
        <select
          value={timeoutEnabled ? 'custom' : 'none'}
          onChange={e => {
            const enabled = e.target.value === 'custom';
            onChange({
              approvalTimeoutEnabled: enabled,
              approvalTimeout: enabled ? 'Custom' : 'No timeout',
              ...(enabled && config.approvalTimeoutHours == null
                ? { approvalTimeoutHours: 24, approvalTimeoutMinutes: 0 }
                : {})
            });
          }}
        >
          <option value="none">No timeout</option>
          <option value="custom">Custom duration</option>
        </select>
      </Field>

      {timeoutEnabled && (
        <>
          <Field label="Duration">
            <OneTimeTaskDurationControl
              hours={hours}
              minutes={minutes}
              onChange={(h, m) => onChange({
                approvalTimeoutHours: h,
                approvalTimeoutMinutes: m,
                approvalTimeoutEnabled: true,
                approvalTimeout: 'Custom'
              })}
            />
          </Field>
          <Field label="If timeout">
            <select
              value={onTimeout}
              onChange={e => onChange({ onTimeout: e.target.value })}
            >
              {ON_TIMEOUT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
          {onTimeout === 'Create alert' && (
            <>
              <Field label="Alert severity">
                <select
                  value={String(config.timeoutAlertSeverity ?? 'medium')}
                  onChange={e => onChange({ timeoutAlertSeverity: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </Field>
              <AlertTargetFields
                label="Assign alert to"
                typeKey="timeoutAlertAssignToType"
                roleKey="timeoutAlertAssignToRole"
                positionKey="timeoutAlertAssignToPositionId"
                employeeKey="timeoutAlertAssignToEmployeeId"
                config={config}
                positions={positions}
                employees={employees}
                allowedTypes={ALERT_TARGET_TYPES}
                onChange={onChange}
              />
            </>
          )}
          {onTimeout === 'Notify role/person' && (
            <PersonTargetFields
              label="Notify"
              prefix="recipient"
              config={{
                ...config,
                recipientType: config.timeoutNotifyType,
                recipientRole: config.timeoutNotifyRole,
                recipientPositionId: config.timeoutNotifyPositionId,
                recipientEmployeeId: config.timeoutNotifyEmployeeId
              }}
              positions={positions}
              employees={employees}
              allowedTypes={NOTIFICATION_TARGET_TYPES.filter(t => t !== 'Employee')}
              onChange={updates => onChange({
                timeoutNotifyType: updates.recipientType ?? updates.approverType,
                timeoutNotifyRole: updates.recipientRole ?? updates.approverRole,
                timeoutNotifyPositionId: updates.recipientPositionId ?? updates.approverPositionId,
                timeoutNotifyEmployeeId: updates.recipientEmployeeId ?? updates.approverEmployeeId
              })}
            />
          )}
          {onTimeout === 'Escalate to another approver' && (
            <PersonTargetFields
              label="Escalate approver"
              prefix="approver"
              config={{
                ...config,
                approverType: config.timeoutEscalationApproverType,
                approverRole: config.timeoutEscalationApproverRole,
                approverPositionId: config.timeoutEscalationApproverPositionId,
                approverEmployeeId: config.timeoutEscalationApproverEmployeeId
              }}
              positions={positions}
              employees={employees}
              allowedTypes={APPROVER_TARGET_TYPES}
              onChange={updates => onChange({
                timeoutEscalationApproverType: updates.approverType,
                timeoutEscalationApproverRole: updates.approverRole,
                timeoutEscalationApproverPositionId: updates.approverPositionId,
                timeoutEscalationApproverEmployeeId: updates.approverEmployeeId
              })}
            />
          )}
        </>
      )}

      <Field label="If approved">
        <select
          value={String(config.onApproved ?? 'Continue')}
          onChange={e => onChange({ onApproved: e.target.value })}
        >
          <option>Continue</option>
        </select>
      </Field>

      <Field label="If rejected">
        <select
          value={onRejected}
          onChange={e => onChange({ onRejected: e.target.value })}
        >
          {ON_REJECTED_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </Field>

      {onRejected === 'Create alert' && (
        <>
          <Field label="Rejected alert severity">
            <select
              value={String(config.rejectedAlertSeverity ?? 'medium')}
              onChange={e => onChange({ rejectedAlertSeverity: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <AlertTargetFields
            label="Assign alert to"
            typeKey="rejectedAlertAssignToType"
            roleKey="rejectedAlertAssignToRole"
            positionKey="rejectedAlertAssignToPositionId"
            employeeKey="rejectedAlertAssignToEmployeeId"
            config={config}
            positions={positions}
            employees={employees}
            allowedTypes={ALERT_TARGET_TYPES}
            onChange={onChange}
          />
        </>
      )}
    </>
  );
};
