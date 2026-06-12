import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AutomationStep, ConditionClause, StepConfig } from './automationTypes';
import { useOrganizationStore } from '../../store/organizationStore';
import { filterPositionOptions } from './alertAssignmentUtils';
import {
  conditionStepPreview,
  createEmptyConditionClause,
  getConditionClauses,
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
  allowedFieldKeys: string[];
  canUseElseIf?: boolean;
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
  allowedFieldKeys,
  canUseElseIf = false,
  onConfigChange,
  onToggleElseBranch
}) => {
  const { positions, employees, departments } = useOrganizationStore();
  const config = step.config;
  const clauses = getConditionClauses(config);

  const orgContext = useMemo(() => ({
    positions: filterPositionOptions(positions.map(p => ({ id: p.id, name: p.name }))),
    employees: employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` })),
    departments: departments.map(d => ({ id: d.id, name: d.name }))
  }), [positions, employees, departments]);

  const fields = getConditionFieldsForTrigger(triggerKey, allowedFieldKeys);

  const updateClauses = (next: ConditionClause[]) => {
    onConfigChange({
      ...config,
      conditions: next,
      field: '',
      operator: '',
      value: ''
    });
  };

  const updateClause = (clauseId: string, updates: Partial<ConditionClause>) => {
    updateClauses(clauses.map(c => c.id === clauseId ? { ...c, ...updates } : c));
  };

  const handleFieldChange = (clauseId: string, fieldKey: string) => {
    const nextField = getConditionFieldDef(triggerKey, fieldKey, allowedFieldKeys);
    const nextOps = nextField ? getOperatorsForField(nextField) : [];
    updateClause(clauseId, { field: fieldKey, operator: nextOps[0] ?? '', value: '' });
  };

  const handleOperatorChange = (clauseId: string, operator: string) => {
    updateClause(clauseId, { operator, value: '' });
  };

  const addClause = () => {
    updateClauses([...clauses, createEmptyConditionClause()]);
  };

  const removeClause = (clauseId: string) => {
    if (clauses.length <= 1) return;
    updateClauses(clauses.filter(c => c.id !== clauseId));
  };

  return (
    <>
      <p className="auto-condition-helper">Continue only when all of these conditions are true.</p>
      {triggerKey === 'leave_request_submitted' && (
        <p className="auto-condition-note">
          Route leave by Leave Days or Leave Type. Reporting Manager missing is for exception handling — pair it with an Alert step, not the default approval flow.
        </p>
      )}

      <div className="auto-preview-box">
        <span className="auto-preview-box__label">Preview</span>
        <p>{conditionStepPreview(config, triggerKey, orgContext, allowedFieldKeys)}</p>
      </div>

      <div className="auto-condition-rows">
        {clauses.map((clause, index) => {
          const fieldDef = getConditionFieldDef(triggerKey, clause.field, allowedFieldKeys);
          const operators = fieldDef ? getOperatorsForField(fieldDef) : [];
          const currentOperator = clause.operator as ConditionOperator | undefined;
          const showValue = fieldDef && currentOperator && operatorNeedsValue(currentOperator, fieldDef);

          return (
            <div key={clause.id} className="auto-condition-row">
              {index > 0 && <span className="auto-condition-row__and">AND</span>}
              <div className="auto-condition-row__fields">
                <select
                  value={clause.field}
                  onChange={e => handleFieldChange(clause.id, e.target.value)}
                  aria-label={`Condition ${index + 1} field`}
                >
                  <option value="">— Field —</option>
                  {fields.map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={clause.operator}
                  onChange={e => handleOperatorChange(clause.id, e.target.value)}
                  disabled={!fieldDef}
                  aria-label={`Condition ${index + 1} operator`}
                >
                  <option value="">— Operator —</option>
                  {operators.map(op => (
                    <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
                  ))}
                </select>

                {showValue && fieldDef && (
                  <>
                    {fieldDef.type === 'position' && (
                      <select
                        value={clause.value}
                        onChange={e => updateClause(clause.id, { value: e.target.value })}
                        aria-label={`Condition ${index + 1} value`}
                      >
                        <option value="">— Select position —</option>
                        {orgContext.positions.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                    {fieldDef.type === 'department' && (
                      <select
                        value={clause.value}
                        onChange={e => updateClause(clause.id, { value: e.target.value })}
                        aria-label={`Condition ${index + 1} value`}
                      >
                        <option value="">— Select department —</option>
                        {orgContext.departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                    {fieldDef.type === 'person' && currentOperator && ['is', 'is_not'].includes(currentOperator) && (
                      <select
                        value={clause.value}
                        onChange={e => updateClause(clause.id, { value: e.target.value })}
                        aria-label={`Condition ${index + 1} value`}
                      >
                        <option value="">— Select employee —</option>
                        {orgContext.employees.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    )}
                    {fieldDef.type === 'enum' && (
                      <select
                        value={clause.value}
                        onChange={e => updateClause(clause.id, { value: e.target.value })}
                        aria-label={`Condition ${index + 1} value`}
                      >
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
                        value={clause.value}
                        onChange={e => updateClause(clause.id, { value: e.target.value })}
                        aria-label={`Condition ${index + 1} value`}
                      />
                    )}
                  </>
                )}

                {clauses.length > 1 && (
                  <button
                    type="button"
                    className="cfg-icon-btn auto-condition-row__remove"
                    onClick={() => removeClause(clause.id)}
                    title="Remove condition"
                    aria-label={`Remove condition ${index + 1}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {fieldDef && currentOperator && !isOperatorValidForField(currentOperator, fieldDef) && (
                <p className="auto-condition-error">This operator is not valid for the selected field.</p>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className="org-btn org-btn--ghost org-btn--sm auto-condition-add" onClick={addClause}>
        <Plus size={14} /> Add condition
      </button>

      {canUseElseIf && (
        <Field label="Condition type">
          <label className="auto-toggle-row">
            <input
              type="checkbox"
              checked={Boolean(config.elseIf)}
              onChange={e => onConfigChange({ ...config, elseIf: e.target.checked })}
            />
            <span>Else if (previous condition was false)</span>
          </label>
          <p className="auto-condition-note">
            Use else if for chained rules. Only the first matching condition runs.
          </p>
        </Field>
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
