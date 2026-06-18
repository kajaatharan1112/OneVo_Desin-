import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ChecklistAssigneeType, ChecklistTemplateItem, ChecklistTemplateType } from './checklistTemplateTypes';
import { useOrganizationStore } from '../../../store/organizationStore';
import { filterPositionOptions } from '../../automations/alertAssignmentUtils';
import { createEmptyChecklistItem } from '../../../store/checklistTemplateStore';

const ASSIGNEE_TYPES: ChecklistAssigneeType[] = [
  'Employee',
  'Reporting Manager',
  'Department Head',
  'Specific Position',
  'Specific Employee'
];

interface ChecklistTemplateItemsEditorProps {
  type: ChecklistTemplateType;
  items: ChecklistTemplateItem[];
  onChange: (items: ChecklistTemplateItem[]) => void;
}

export const ChecklistTemplateItemsEditor: React.FC<ChecklistTemplateItemsEditorProps> = ({
  type,
  items,
  onChange
}) => {
  const { positions, employees } = useOrganizationStore();
  const positionOptions = filterPositionOptions(positions.map(p => ({ id: p.id, name: p.name })));
  const employeeOptions = employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }));

  const updateItem = (index: number, updates: Partial<ChecklistTemplateItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })));
  };

  const addItem = () => {
    onChange([...items, createEmptyChecklistItem(items.length)]);
  };

  const dueHint = type === 'onboarding'
    ? 'Time relative to employee start date'
    : 'Time before the last working day';

  return (
    <div className="checklist-items-editor">
      <div className="checklist-items-editor__header">
        <label>Checklist Items</label>
        <button type="button" className="org-btn org-btn--ghost org-btn--sm" onClick={addItem}>
          <Plus size={14} /> Add Item
        </button>
      </div>

      {items.length === 0 && (
        <p className="auto-condition-note">Add at least one checklist item.</p>
      )}

      {items.map((item, index) => (
        <div key={item.id} className="checklist-item-card">
          <div className="checklist-item-card__header">
            <span className="checklist-item-card__index">Item {index + 1}</span>
            <button type="button" className="cfg-icon-btn" onClick={() => removeItem(index)} title="Remove item">
              <Trash2 size={12} />
            </button>
          </div>

          <div className="org-form-field">
            <label>Item title</label>
            <input value={item.title} onChange={e => updateItem(index, { title: e.target.value })} />
          </div>

          <div className="org-form-field">
            <label>Description</label>
            <textarea value={item.description} onChange={e => updateItem(index, { description: e.target.value })} rows={2} />
          </div>

          <div className="org-form-field">
            <label>Assignee Type</label>
            <select
              value={item.assigneeType}
              onChange={e => updateItem(index, {
                assigneeType: e.target.value as ChecklistAssigneeType,
                assigneePositionId: '',
                assigneeEmployeeId: ''
              })}
            >
              <option value="">— Select type —</option>
              {ASSIGNEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {item.assigneeType === 'Specific Position' && (
            <div className="org-form-field">
              <label>Position</label>
              <select value={item.assigneePositionId} onChange={e => updateItem(index, { assigneePositionId: e.target.value })}>
                <option value="">— Select position —</option>
                {positionOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {item.assigneeType === 'Specific Employee' && (
            <div className="org-form-field">
              <label>Employee</label>
              <select value={item.assigneeEmployeeId} onChange={e => updateItem(index, { assigneeEmployeeId: e.target.value })}>
                <option value="">— Select employee —</option>
                {employeeOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}

          <div className="org-form-field">
            <label>Due after</label>
            <div className="checklist-item-card__inline">
              <input
                type="number"
                min={0}
                value={item.dueOffsetValue}
                onChange={e => updateItem(index, { dueOffsetValue: Math.max(0, Number(e.target.value)) })}
              />
              <select
                value={item.dueOffsetUnit}
                onChange={e => updateItem(index, { dueOffsetUnit: e.target.value as ChecklistTemplateItem['dueOffsetUnit'] })}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <p className="auto-condition-note">{dueHint}</p>
          </div>

          <div className="org-form-field">
            <label>Required document (optional)</label>
            <input
              value={item.requiredDocument}
              onChange={e => updateItem(index, { requiredDocument: e.target.value })}
              placeholder="e.g. Signed contract"
            />
          </div>

          <label className="auto-toggle-row">
            <input
              type="checkbox"
              checked={item.required}
              onChange={e => updateItem(index, { required: e.target.checked })}
            />
            <span>Required</span>
          </label>
        </div>
      ))}
    </div>
  );
};
