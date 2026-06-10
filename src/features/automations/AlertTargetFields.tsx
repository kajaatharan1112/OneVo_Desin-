import React from 'react';
import type { StepConfig } from './automationTypes';
import {
  ROLE_OPTIONS,
  TARGET_TYPE_OPTIONS,
  type TargetType
} from './alertAssignmentUtils';
import type { EmployeeOption, PositionOption } from './alertAssignmentUtils';

interface AlertTargetFieldsProps {
  label: string;
  typeKey: keyof StepConfig;
  roleKey: keyof StepConfig;
  positionKey: keyof StepConfig;
  employeeKey: keyof StepConfig;
  config: StepConfig;
  positions: PositionOption[];
  employees: EmployeeOption[];
  allowedTypes?: TargetType[];
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

export const AlertTargetFields: React.FC<AlertTargetFieldsProps> = ({
  label,
  typeKey,
  roleKey,
  positionKey,
  employeeKey,
  config,
  positions,
  employees,
  allowedTypes = TARGET_TYPE_OPTIONS,
  onChange
}) => {
  const targetType = config[typeKey] as TargetType | undefined;

  const handleTypeChange = (value: string) => {
    onChange({
      [typeKey]: value,
      [roleKey]: '',
      [positionKey]: '',
      [employeeKey]: ''
    });
  };

  return (
    <>
      <Field label={label}>
        <select value={String(config[typeKey] ?? '')} onChange={e => handleTypeChange(e.target.value)}>
          <option value="">— Select type —</option>
          {allowedTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      {targetType === 'Role' && (
        <Field label="Role">
          <select value={String(config[roleKey] ?? '')} onChange={e => onChange({ [roleKey]: e.target.value })}>
            <option value="">— Select role —</option>
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>
      )}

      {targetType === 'Specific Position' && (
        <Field label="Position">
          <select value={String(config[positionKey] ?? '')} onChange={e => onChange({ [positionKey]: e.target.value })}>
            <option value="">— Select position —</option>
            {positions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
      )}

      {targetType === 'Specific Employee' && (
        <Field label="Employee">
          <select value={String(config[employeeKey] ?? '')} onChange={e => onChange({ [employeeKey]: e.target.value })}>
            <option value="">— Select employee —</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </Field>
      )}
    </>
  );
};
