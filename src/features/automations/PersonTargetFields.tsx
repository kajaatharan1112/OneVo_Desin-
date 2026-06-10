import React from 'react';
import type { StepConfig } from './automationTypes';
import {
  PERSON_TARGET_TYPES,
  ROLE_OPTIONS,
  type TargetFieldPrefix
} from './personTargetUtils';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';

interface PersonTargetFieldsProps {
  label: string;
  prefix: TargetFieldPrefix;
  config: StepConfig;
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

export const PersonTargetFields: React.FC<PersonTargetFieldsProps> = ({
  label,
  prefix,
  config,
  positions,
  employees,
  onChange
}) => {
  const typeKey = prefix === 'approver' ? 'approverType' : prefix === 'recipient' ? 'recipientType' : prefix === 'assignTo' ? 'assignToType' : 'escalationTargetType';
  const roleKey = prefix === 'approver' ? 'approverRole' : prefix === 'recipient' ? 'recipientRole' : prefix === 'assignTo' ? 'assignToRole' : 'escalationRole';
  const posKey = prefix === 'approver' ? 'approverPositionId' : prefix === 'recipient' ? 'recipientPositionId' : prefix === 'assignTo' ? 'assignToPositionId' : 'escalationPositionId';
  const empKey = prefix === 'approver' ? 'approverEmployeeId' : prefix === 'recipient' ? 'recipientEmployeeId' : prefix === 'assignTo' ? 'assignToEmployeeId' : 'escalationEmployeeId';

  const targetType = config[typeKey] as string | undefined;

  const handleTypeChange = (value: string) => {
    onChange({
      [typeKey]: value,
      [roleKey]: '',
      [posKey]: '',
      [empKey]: ''
    });
  };

  return (
    <>
      <Field label={label}>
        <select value={String(config[typeKey] ?? '')} onChange={e => handleTypeChange(e.target.value)}>
          <option value="">— Select type —</option>
          {PERSON_TARGET_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      {targetType === 'Role' && (
        <Field label="Role">
          <select value={String(config[roleKey] ?? '')} onChange={e => onChange({ [roleKey]: e.target.value })}>
            <option value="">— Select role —</option>
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      )}
      {targetType === 'Specific Position' && (
        <Field label="Position">
          <select value={String(config[posKey] ?? '')} onChange={e => onChange({ [posKey]: e.target.value })}>
            <option value="">— Select position —</option>
            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      )}
      {targetType === 'Specific Employee' && (
        <Field label="Employee">
          <select value={String(config[empKey] ?? '')} onChange={e => onChange({ [empKey]: e.target.value })}>
            <option value="">— Select employee —</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </Field>
      )}
    </>
  );
};
