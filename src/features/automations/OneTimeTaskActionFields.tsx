import React from 'react';
import type { StepConfig } from './automationTypes';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';
import { PERSON_TARGET_TYPES, ROLE_OPTIONS } from './personTargetUtils';
import { OneTimeTaskDurationControl } from './OneTimeTaskDurationControl';
import {
  TASK_DEFAULT_HOURS,
  TASK_DEFAULT_MINUTES,
  TASK_PRIORITY_OPTIONS,
  isEmployeeContextTrigger
} from './oneTimeTaskUtils';

interface OneTimeTaskActionFieldsProps {
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

export const OneTimeTaskActionFields: React.FC<OneTimeTaskActionFieldsProps> = ({
  config,
  triggerKey,
  positions,
  employees,
  onChange
}) => {
  const assigneeType = String(config.taskAssigneeType ?? '');
  const hours = Number(config.taskDueHours ?? TASK_DEFAULT_HOURS);
  const minutes = Number(config.taskDueMinutes ?? TASK_DEFAULT_MINUTES);

  return (
    <>
      <Field label="Task Title">
        <input
          value={String(config.taskTitle ?? '')}
          onChange={e => onChange({ taskTitle: e.target.value })}
          placeholder="Review access after position change"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={String(config.taskDescription ?? '')}
          onChange={e => onChange({ taskDescription: e.target.value })}
          rows={3}
        />
      </Field>

      <Field label="Assignee Type">
        <select
          value={assigneeType}
          onChange={e => onChange({
            taskAssigneeType: e.target.value,
            taskAssigneeRole: '',
            taskAssigneePositionId: '',
            taskAssigneeEmployeeId: ''
          })}
        >
          <option value="">— Select type —</option>
          {PERSON_TARGET_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      {assigneeType === 'Role' && (
        <Field label="Role">
          <select value={String(config.taskAssigneeRole ?? '')} onChange={e => onChange({ taskAssigneeRole: e.target.value })}>
            <option value="">— Select role —</option>
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      )}

      {assigneeType === 'Specific Position' && (
        <Field label="Position">
          <select value={String(config.taskAssigneePositionId ?? '')} onChange={e => onChange({ taskAssigneePositionId: e.target.value })}>
            <option value="">— Select position —</option>
            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      )}

      {assigneeType === 'Specific Employee' && (
        <Field label="Employee">
          <select value={String(config.taskAssigneeEmployeeId ?? '')} onChange={e => onChange({ taskAssigneeEmployeeId: e.target.value })}>
            <option value="">— Select employee —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Field>
      )}

      <Field label="Reminder / Due time">
        <OneTimeTaskDurationControl
          hours={hours}
          minutes={minutes}
          onChange={(h, m) => onChange({ taskDueHours: h, taskDueMinutes: m })}
        />
      </Field>

      <Field label="Priority">
        <select value={String(config.taskPriority ?? 'medium')} onChange={e => onChange({ taskPriority: e.target.value })}>
          {TASK_PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </Field>

      {isEmployeeContextTrigger(triggerKey) && (
        <p className="auto-condition-note">
          Task will be linked to the employee from the trigger.
        </p>
      )}
    </>
  );
};
