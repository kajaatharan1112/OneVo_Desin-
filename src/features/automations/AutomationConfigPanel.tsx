import React, { useMemo } from 'react';
import type { Automation, AutomationStep } from './automationTypes';
import {
  ALERT_TARGET_TYPES,
  NOTIFICATION_TARGET_TYPES,
  getAllowedConditionFieldKeys,
  getActiveChecklistTemplatesForAction,
  getFilteredActionGroups,
  isChecklistTemplateAction,
  isTriggerSelected,
  triggerLabelForKey
} from './automationContextRules';
import { TRIGGER_ICONS, triggerHelperText } from './triggerPickerConfig';
import { OneTimeTaskActionFields } from './OneTimeTaskActionFields';
import { getDefaultOneTimeTaskConfig, isOneTimeTaskAction } from './oneTimeTaskUtils';
import {
  buildAutomationSummary,
  stepToSentence
} from './automationUtils';
import { ConditionConfigPanel } from './ConditionConfigPanel';
import { AutomationValidationPanel } from './AutomationValidationPanel';
import type { ValidationIssue } from './automationUtils';
import { useOrganizationStore } from '../../store/organizationStore';
import { filterPositionOptions } from './alertAssignmentUtils';
import { AlertTargetFields } from './AlertTargetFields';
import { PersonTargetFields } from './PersonTargetFields';
import { ApprovalStepFields } from './ApprovalStepFields';
import { isAlertImmediatelyAfterApproval, ALERT_AFTER_APPROVAL_WARNING } from './approvalStepUtils';

const AREAS = ['Employee Lifecycle', 'Leave', 'Attendance', 'Organization', 'Documents', 'Monitoring'];

interface AutomationConfigPanelProps {
  automation: Automation;
  selectedStep: AutomationStep | null;
  validationIssues: ValidationIssue[];
  onAutomationChange: (updates: Partial<Automation>) => void;
  onStepConfigChange: (stepId: string, config: AutomationStep['config']) => void;
  onChangeTrigger: () => void;
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
  onChangeTrigger,
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

  const filteredActions = useMemo(
    () => getFilteredActionGroups(triggerKey),
    [triggerKey]
  );

  const allowedConditionFields = useMemo(
    () => getAllowedConditionFieldKeys(triggerKey),
    [triggerKey]
  );

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
        <div className="auto-trigger-settings">
          <Field label="When this happens">
            {isTriggerSelected(triggerKey) ? (
              <div className="auto-trigger-settings__selected">
                {(() => {
                  const Icon = TRIGGER_ICONS[triggerKey as keyof typeof TRIGGER_ICONS];
                  const label = triggerLabelForKey(triggerKey);
                  return (
                    <>
                      <div className="auto-trigger-settings__summary">
                        {Icon && (
                          <span className="auto-trigger-settings__icon">
                            <Icon size={16} />
                          </span>
                        )}
                        <span className="auto-trigger-settings__label">{label}</span>
                      </div>
                      <p className="auto-trigger-settings__helper">{triggerHelperText(triggerKey)}</p>
                      <p className="auto-trigger-settings__guided">
                        This automation is guided by {label}.
                      </p>
                      <button
                        type="button"
                        className="org-btn org-btn--secondary org-btn--sm"
                        onClick={onChangeTrigger}
                      >
                        Change Trigger
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <>
                <p className="auto-condition-note">
                  Choose an event to begin building this automation.
                </p>
                <button
                  type="button"
                  className="org-btn org-btn--secondary org-btn--sm"
                  onClick={onChangeTrigger}
                >
                  Change Trigger
                </button>
              </>
            )}
          </Field>
        </div>
      )}

      {selectedStep.type === 'condition' && (
        <ConditionConfigPanel
          step={selectedStep}
          triggerKey={triggerKey}
          allowedFieldKeys={allowedConditionFields}
          onConfigChange={config => onStepConfigChange(selectedStep.id, config)}
          onToggleElseBranch={enabled => onToggleElseBranch(selectedStep.id, enabled)}
        />
      )}

      {selectedStep.type === 'action' && (
        <>
          <Field label="Action">
            <select
              value={String(selectedStep.config.actionKey ?? '')}
              onChange={e => {
                const actionKey = e.target.value;
                const next: typeof selectedStep.config = {
                  ...selectedStep.config,
                  actionKey,
                  checklistTemplateId: isChecklistTemplateAction(actionKey) ? selectedStep.config.checklistTemplateId : ''
                };
                if (isOneTimeTaskAction(actionKey)) {
                  Object.assign(next, getDefaultOneTimeTaskConfig(), {
                    taskTitle: selectedStep.config.taskTitle ?? '',
                    taskDescription: selectedStep.config.taskDescription ?? '',
                    taskAssigneeType: selectedStep.config.taskAssigneeType ?? '',
                    taskAssigneeRole: selectedStep.config.taskAssigneeRole ?? '',
                    taskAssigneePositionId: selectedStep.config.taskAssigneePositionId ?? '',
                    taskAssigneeEmployeeId: selectedStep.config.taskAssigneeEmployeeId ?? '',
                    taskDueHours: selectedStep.config.taskDueHours ?? getDefaultOneTimeTaskConfig().taskDueHours,
                    taskDueMinutes: selectedStep.config.taskDueMinutes ?? getDefaultOneTimeTaskConfig().taskDueMinutes,
                    taskPriority: selectedStep.config.taskPriority ?? 'medium'
                  });
                } else {
                  Object.assign(next, {
                    taskTitle: '',
                    taskDescription: '',
                    taskAssigneeType: '',
                    taskAssigneeRole: '',
                    taskAssigneePositionId: '',
                    taskAssigneeEmployeeId: '',
                    taskDueHours: undefined,
                    taskDueMinutes: undefined,
                    taskPriority: '',
                    taskRelatedEmployeeFromTrigger: undefined
                  });
                }
                onStepConfigChange(selectedStep.id, next);
              }}
            >
              <option value="">— Choose action —</option>
              {Object.entries(filteredActions).map(([group, actions]) => (
                <optgroup key={group} label={group}>
                  {actions.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
          {isChecklistTemplateAction(String(selectedStep.config.actionKey ?? '')) && (
            <Field label="Checklist template">
              <select
                value={String(selectedStep.config.checklistTemplateId ?? '')}
                onChange={e => update('checklistTemplateId', e.target.value)}
              >
                <option value="">— Choose template —</option>
                {getActiveChecklistTemplatesForAction(String(selectedStep.config.actionKey ?? '')).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          )}
          {isOneTimeTaskAction(String(selectedStep.config.actionKey ?? '')) && (
            <OneTimeTaskActionFields
              config={selectedStep.config}
              triggerKey={triggerKey}
              positions={orgContext.positions}
              employees={orgContext.employees}
              onChange={updates => onStepConfigChange(selectedStep.id, { ...selectedStep.config, ...updates })}
            />
          )}
        </>
      )}

      {selectedStep.type === 'approval' && (
        <ApprovalStepFields
          config={selectedStep.config}
          triggerKey={triggerKey}
          positions={orgContext.positions}
          employees={orgContext.employees}
          onChange={updates => onStepConfigChange(selectedStep.id, { ...selectedStep.config, ...updates })}
        />
      )}

      {selectedStep.type === 'notification' && (
        <>
          <PersonTargetFields
            label="Recipient Type"
            prefix="recipient"
            config={selectedStep.config}
            positions={orgContext.positions}
            employees={orgContext.employees}
            allowedTypes={NOTIFICATION_TARGET_TYPES}
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
          {isAlertImmediatelyAfterApproval(automation.steps, selectedStep.id) && (
            <p className="auto-condition-note auto-condition-note--warning">{ALERT_AFTER_APPROVAL_WARNING}</p>
          )}
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
            allowedTypes={ALERT_TARGET_TYPES}
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
              allowedTypes={ALERT_TARGET_TYPES}
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
