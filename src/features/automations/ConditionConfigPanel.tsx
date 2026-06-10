import React, { useMemo } from 'react';
import type { AutomationStep, StepConfig } from './automationTypes';
import { useOrganizationStore } from '../../store/organizationStore';
import { filterPositionOptions } from './alertAssignmentUtils';
import {
  conditionStepPreview,
  getConditionFieldDef,
  getConditionFieldsForTrigger,
  getOperatorsForField,
  isOperatorValidForField,
  operatorNeedsValue,
  OPERATOR_LABELS,
  type ConditionOperator
} from './conditionFields';

interface ConditionConfigPanelProps {
  step: AutomationStep;
  triggerKey: string;
  onConfigChange: (config: StepConfig) => void;
  onToggleElseBranch: (enabled: boolean) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="builder-config__section">
      <label>{label}</label>
      {children}
    </div>
  );
}

export const ConditionConfigPanel: React.FC<ConditionConfigPanelProps> = ({
  step,
  triggerKey,
  onConfigChange,
  onToggleElseBranch
}) => {
  const { positions, employees, departments } = useOrganizationStore();
  const config = step.config;

  const orgContext = useMemo(() => ({
    positions: filterPositionOptions(positions.map(p => ({ id: p.id, name: p.name }))),
    employees: employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })),
    departments: departments.map(d => ({ id: d.id, name: d.name }))
  }), [positions, employees, departments]);

  const fields = getConditionFieldsForTrigger(triggerKey);
  const fieldDef = getConditionFieldDef(triggerKey, String(config.field ?? ''));
  const operators = fieldDef ? getOperatorsForField(fieldDef) : [];
  const currentOperator = config.operator as ConditionOperator | undefined;
  const showValue = fieldDef && currentOperator && operatorNeedsValue(currentOperator, fieldDef);

  const update = (updates: Partial<StepConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const handleFieldChange = (fieldKey: string) => {
    const nextField = getConditionFieldDef(triggerKey, fieldKey);
    const nextOps = nextField ? getOperatorsForField(nextField) : [];
    update({
      field: fieldKey,
      operator: nextOps[0] ?? '',
      value: ''
    });
  };

  const handleOperatorChange = (operator: string) => {
    update({ operator, value: '' });
  };

  return (
    <>
      <p className="auto-condition-helper">Continue only when this condition is true.</p>

      <div className="auto-preview-box">
        <span className="auto-preview-box__label">Preview</span>
        <p>{conditionStepPreview(config, triggerKey, orgContext)}</p>
      </div>

      <Field label="Field">
        <select value={String(config.field ?? '')} onChange={e => handleFieldChange(e.target.value)}>
          <option value="">— Select field —</option>
          {fields.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Operator">
        <select
          value={String(config.operator ?? '')}
          onChange={e => handleOperatorChange(e.target.value)}
          disabled={!fieldDef}
        >
          <option value="">— Select operator —</option>
          {operators.map(op => (
            <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
          ))}
        </select>
      </Field>

      {showValue && fieldDef && (
        <Field label="Value">
          {fieldDef.type === 'position' && (
            <select value={String(config.value ?? '')} onChange={e => update({ value: e.target.value })}>
              <option value="">— Select position —</option>
              {orgContext.positions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {fieldDef.type === 'department' && (
            <select value={String(config.value ?? '')} onChange={e => update({ value: e.target.value })}>
              <option value="">— Select department —</option>
              {orgContext.departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          {fieldDef.type === 'person' && currentOperator && ['is', 'is_not'].includes(currentOperator) && (
            <select value={String(config.value ?? '')} onChange={e => update({ value: e.target.value })}>
              <option value="">— Select employee —</option>
              {orgContext.employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          )}
          {fieldDef.type === 'enum' && (
            <select value={String(config.value ?? '')} onChange={e => update({ value: e.target.value })}>
              <option value="">— Select value —</option>
              {fieldDef.valueOptions?.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
          {fieldDef.type === 'number' && (
            <input
              type="number"
              min={0}
              value={String(config.value ?? '')}
              onChange={e => update({ value: e.target.value })}
            />
          )}
        </Field>
      )}

      {fieldDef && currentOperator && !isOperatorValidForField(currentOperator, fieldDef) && (
        <p className="auto-condition-error">This operator is not valid for the selected field.</p>
      )}

      <Field label="ELSE branch">
        <label className="auto-toggle-row">
          <input
            type="checkbox"
            checked={Boolean(config.hasBranch)}
            onChange={e => onToggleElseBranch(e.target.checked)}
          />
          <span>Add ELSE branch</span>
        </label>
        <p className="auto-condition-note">
          {config.hasBranch
            ? 'If false, follow the NO path. If true, follow the YES path.'
            : 'If false, this automation path stops here.'}
        </p>
      </Field>
    </>
  );
};
