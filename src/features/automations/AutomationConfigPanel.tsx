import React, { useMemo } from 'react';
import type { Automation, AutomationStep } from './automationTypes';
import {
  ACTION_GROUPS,
  TRIGGER_GROUPS,
  stepToSentence,
  buildAutomationSummary
} from './automationUtils';
import { ConditionConfigPanel } from './ConditionConfigPanel';
import { AutomationValidationPanel } from './AutomationValidationPanel';
import type { ValidationIssue } from './automationUtils';
import { useOrganizationStore } from '../../store/organizationStore';
import { filterPositionOptions } from './alertAssignmentUtils';
import { AlertTargetFields } from './AlertTargetFields';
import { PersonTargetFields } from './PersonTargetFields';

const AREAS = ['Employee Lifecycle', 'Leave', 'Attendance', 'Organization', 'Documents', 'Monitoring'];

interface AutomationConfigPanelProps {
  automation: Automation;
  selectedStep: AutomationStep | null;
  validationIssues: ValidationIssue[];
  onAutomationChange: (updates: Partial<Automation>) => void;
  onStepConfigChange: (stepId: string, config: AutomationStep['config']) => void;
  onToggleElseBranch: (conditionStepId: string, enabled: boolean) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="builder-config__section">
      <label>{label}</label>
      {children}
    </div>
  );
}

export const AutomationConfigPanel: React.FC<AutomationConfigPanelProps> = ({
  automation,
  selectedStep,
  validationIssues,
  onAutomationChange,
  onStepConfigChange,
  onToggleElseBranch
}) => {
  const { positions: orgPositions, employees: orgEmployees, departments: orgDepartments } = useOrganizationStore();

  const triggerKey = useMemo(
    () => automation.steps.find(s => s.type === 'trigger')?.config.triggerKey ?? '',
    [automation.steps]
  );

  const orgContext = useMemo(() => ({
    positions: filterPositionOptions(orgPositions.map(p => ({ id: p.id, name: p.name }))),
    employees: orgEmployees.map(e => ({
      id: e.id,
      name: `${e.firstName} ${e.lastName}`
    })),
    departments: orgDepartments.map(d => ({ id: d.id, name: d.name })),
    triggerKey
  }), [orgPositions, orgEmployees, orgDepartments, triggerKey]);

  if (!selectedStep) {
    return (
      <aside className="builder-config auto-config-panel">
        <h3 className="builder-config__title">Automation Settings</h3>
        <Field label="Name">
          <input value={automation.name} onChange={e => onAutomationChange({ name: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea value={automation.description} onChange={e => onAutomationChange({ description: e.target.value })} />
        </Field>
        <Field label="Area">
          <select value={automation.area} onChange={e => onAutomationChange({ area: e.target.value as Automation['area'] })}>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <span className={`cfg-badge cfg-badge--${automation.status}`}>{automation.status}</span>
        </Field>
        <Field label="Summary Preview">
          <p className="auto-preview-text">{buildAutomationSummary(automation)}</p>
        </Field>
        <AutomationValidationPanel issues={validationIssues} />
      </aside>
    );
  }

  const update = (key: string, value: unknown) => {
    onStepConfigChange(selectedStep.id, { ...selectedStep.config, [key]: value });
  };

  return (
    <aside className="builder-config auto-config-panel">
      <h3 className="builder-config__title">
        {selectedStep.type === 'condition' ? 'IF CONDITION' : 'Step Settings'}
      </h3>
      {selectedStep.type !== 'condition' && (
        <div className="auto-preview-box">
          <span className="auto-preview-box__label">Preview</span>
          <p>{stepToSentence(selectedStep, orgContext)}</p>
        </div>
      )}

      {selectedStep.type === 'trigger' && (
        <Field label="When this happens">
          <select value={String(selectedStep.config.triggerKey ?? '')} onChange={e => update('triggerKey', e.target.value)}>
            <option value="">— Choose trigger —</option>
            {Object.entries(TRIGGER_GROUPS).map(([group, data]) => (
              <optgroup key={group} label={data.label}>
                {data.triggers.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
      )}

      {selectedStep.type === 'condition' && (
        <ConditionConfigPanel
          step={selectedStep}
          triggerKey={triggerKey}
          onConfigChange={config => onStepConfigChange(selectedStep.id, config)}
          onToggleElseBranch={enabled => onToggleElseBranch(selectedStep.id, enabled)}
        />
      )}

      {selectedStep.type === 'action' && (
        <Field label="Action">
          <select value={String(selectedStep.config.actionKey ?? '')} onChange={e => update('actionKey', e.target.value)}>
            <option value="">— Choose action —</option>
            {Object.entries(ACTION_GROUPS).map(([group, actions]) => (
              <optgroup key={group} label={group}>
                {actions.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
      )}

      {selectedStep.type === 'approval' && (
        <>
          <PersonTargetFields
            label="Approver Type"
            prefix="approver"
            config={selectedStep.config}
            positions={orgContext.positions}
            employees={orgContext.employees}
            onChange={updates => onStepConfigChange(selectedStep.id, { ...selectedStep.config, ...updates })}
          />
          <Field label="Timeout">
            <select value={String(selectedStep.config.approvalTimeout ?? '48 hours')} onChange={e => update('approvalTimeout', e.target.value)}>
              <option>No timeout</option>
              <option>24 hours</option>
              <option>48 hours</option>
              <option>3 days</option>
              <option>Custom</option>
            </select>
          </Field>
          <Field label="If approved">
            <select value={String(selectedStep.config.onApproved ?? 'Continue')} onChange={e => update('onApproved', e.target.value)}>
              <option>Continue</option>
            </select>
          </Field>
          <Field label="If rejected">
            <select value={String(selectedStep.config.onRejected ?? 'Stop automation')} onChange={e => update('onRejected', e.target.value)}>
              <option>Stop automation</option>
              <option>Notify requester</option>
              <option>Create alert</option>
            </select>
          </Field>
        </>
      )}

      {selectedStep.type === 'notification' && (
        <>
          <PersonTargetFields
            label="Recipient Type"
            prefix="recipient"
            config={selectedStep.config}
            positions={orgContext.positions}
            employees={orgContext.employees}
            onChange={updates => onStepConfigChange(selectedStep.id, { ...selectedStep.config, ...updates })}
          />
          <Field label="Channel">
            <select value={String(selectedStep.config.channel ?? '')} onChange={e => update('channel', e.target.value)}>
              <option>In-app</option>
              <option>Email</option>
              <option>Teams / Slack</option>
            </select>
          </Field>
          <Field label="Subject">
            <input value={String(selectedStep.config.subject ?? '')} onChange={e => update('subject', e.target.value)} />
          </Field>
          <Field label="Body">
            <textarea value={String(selectedStep.config.body ?? '')} onChange={e => update('body', e.target.value)} />
          </Field>
        </>
      )}

      {selectedStep.type === 'alert' && (
        <>
          <Field label="Alert Title">
            <input value={String(selectedStep.config.alertTitle ?? '')} onChange={e => update('alertTitle', e.target.value)} />
          </Field>
          <Field label="Severity">
            <select value={String(selectedStep.config.severity ?? '')} onChange={e => update('severity', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <AlertTargetFields
            label="Assign To Type"
            typeKey="assignToType"
            roleKey="assignToRole"
            positionKey="assignToPositionId"
            employeeKey="assignToEmployeeId"
            config={selectedStep.config}
            positions={orgContext.positions}
            employees={orgContext.employees}
            onChange={updates => onStepConfigChange(selectedStep.id, { ...selectedStep.config, ...updates })}
          />
          <Field label="SLA">
            <select value={String(selectedStep.config.sla ?? '')} onChange={e => update('sla', e.target.value)}>
              <option>4 hours</option>
              <option>24 hours</option>
              <option>48 hours</option>
              <option>Custom</option>
            </select>
          </Field>
          <Field label="Escalate if unresolved">
            <select
              value={selectedStep.config.escalate ? 'yes' : 'no'}
              onChange={e => {
                const enabled = e.target.value === 'yes';
                onStepConfigChange(selectedStep.id, {
                  ...selectedStep.config,
                  escalate: enabled,
                  ...(enabled ? {} : {
                    escalationTargetType: '',
                    escalationRole: '',
                    escalationPositionId: '',
                    escalationEmployeeId: ''
                  })
                });
              }}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          {selectedStep.config.escalate && (
            <AlertTargetFields
              label="Escalation Target Type"
              typeKey="escalationTargetType"
              roleKey="escalationRole"
              positionKey="escalationPositionId"
              employeeKey="escalationEmployeeId"
              config={selectedStep.config}
              positions={orgContext.positions}
              employees={orgContext.employees}
              onChange={updates => onStepConfigChange(selectedStep.id, { ...selectedStep.config, ...updates })}
            />
          )}
        </>
      )}

      {selectedStep.type === 'delay' && (
        <>
          <Field label="Wait">
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ flex: 1 }} value={String(selectedStep.config.delayAmount ?? '1')} onChange={e => update('delayAmount', e.target.value)} />
              <select style={{ flex: 1 }} value={String(selectedStep.config.delayUnit ?? 'hours')} onChange={e => update('delayUnit', e.target.value)}>
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </div>
          </Field>
          <Field label="Or wait until">
            <select onChange={e => { if (e.target.value) update('delayUnit', e.target.value); }}>
              <option value="">— Optional —</option>
              <option value="employee_start_date">Employee start date</option>
              <option value="document_expiry_date">Document expiry date</option>
              <option value="business_hours">Business hours</option>
            </select>
          </Field>
        </>
      )}
    </aside>
  );
};
