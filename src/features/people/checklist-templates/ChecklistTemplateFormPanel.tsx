import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useChecklistTemplateStore, createEmptyChecklistItem } from '../../../store/checklistTemplateStore';
import type { ChecklistAppliesTo, ChecklistTemplateItem, ChecklistTemplateStatus, ChecklistTemplateType } from './checklistTemplateTypes';
import { ChecklistTemplateItemsEditor } from './ChecklistTemplateItemsEditor';
import { validateChecklistTemplate } from './checklistTemplateUtils';
import { useOrganizationStore } from '../../../store/organizationStore';

interface ChecklistTemplateFormPanelProps {
  onClose: () => void;
}

export const ChecklistTemplateFormPanel: React.FC<ChecklistTemplateFormPanelProps> = ({ onClose }) => {
  const { form, templates, saveTemplate } = useChecklistTemplateStore();
  const existing = form.templateId ? templates.find(t => t.id === form.templateId) : null;
  const isEdit = form.mode === 'edit';
  const { departments, positions } = useOrganizationStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<ChecklistTemplateType | ''>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ChecklistTemplateStatus>('draft');
  const [items, setItems] = useState<ChecklistTemplateItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [appliesTo, setAppliesTo] = useState<ChecklistAppliesTo>('company');
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [positionIds, setPositionIds] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name);
      setType(existing.type);
      setDescription(existing.description);
      setStatus(existing.status);
      setItems(existing.items.map((item, i) => ({ ...item, sortOrder: i })));
      setAppliesTo(existing.appliesTo);
      setDepartmentIds(existing.departmentIds);
      setPositionIds(existing.positionIds);
    } else {
      setName('');
      setType('');
      setDescription('');
      setStatus('draft');
      setItems([createEmptyChecklistItem(0)]);
      setAppliesTo('company');
      setDepartmentIds([]);
      setPositionIds([]);
    }
    setError(null);
  }, [form, existing, isEdit]);

  const validationIssues = useMemo(
    () => validateChecklistTemplate({ name, type: type || undefined, description, status, items, appliesTo, departmentIds, positionIds }, status === 'active'),
    [name, type, description, status, items, appliesTo, departmentIds, positionIds]
  );

  const handleSave = () => {
    if (!type) {
      setError('Choose a template type before saving.');
      return;
    }
    if (validationIssues.length > 0) {
      setError(validationIssues[0].message);
      return;
    }
    const id = saveTemplate({
      id: existing?.id,
      name: name.trim(),
      type,
      description,
      status,
      items,
      appliesTo,
      departmentIds,
      positionIds
    });
    if (!id) {
      setError('Could not save template. Check required fields.');
      return;
    }
    onClose();
  };

  return (
    <div className="checklist-template-modal-overlay" onClick={onClose} aria-hidden={false}>
      <div
        className="checklist-template-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Template' : 'Add Template'}
        onClick={e => e.stopPropagation()}
      >
        <header className="checklist-template-modal__header">
          <h2>{isEdit ? 'Edit Template' : 'Add Template'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="checklist-template-modal__body">
          <div className="org-form-field">
            <label>Template Type</label>
            <select value={type} onChange={e => setType(e.target.value as ChecklistTemplateType)} disabled={isEdit}>
              <option value="">— Choose type —</option>
              <option value="onboarding">Onboarding</option>
              <option value="offboarding">Offboarding</option>
            </select>
          </div>

          <div className="org-form-field">
            <label>Template Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="org-form-field">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="org-form-field">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value as ChecklistTemplateStatus)}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="org-form-field">
            <label>Applies To</label>
            <select value={appliesTo} onChange={e => {
              const v = e.target.value as ChecklistAppliesTo;
              setAppliesTo(v);
              if (v !== 'department') setDepartmentIds([]);
              if (v !== 'position') setPositionIds([]);
            }}>
              <option value="company">Full Company</option>
              <option value="department">Department</option>
              <option value="position">Position</option>
            </select>
          </div>

          {appliesTo === 'department' && (
            <div className="org-form-field">
              <label>Departments</label>
              <select
                multiple
                value={departmentIds}
                onChange={e => setDepartmentIds(Array.from(e.target.selectedOptions, o => o.value))}
                className="checklist-multi-select"
              >
                {departments.filter(d => d.status === 'active').map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {appliesTo === 'position' && (
            <div className="org-form-field">
              <label>Positions</label>
              <select
                multiple
                value={positionIds}
                onChange={e => setPositionIds(Array.from(e.target.selectedOptions, o => o.value))}
                className="checklist-multi-select"
              >
                {positions.filter(p => p.status === 'active').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {type && (
            <ChecklistTemplateItemsEditor type={type} items={items} onChange={setItems} />
          )}

          {error && <p className="auto-condition-error">{error}</p>}
          {validationIssues.length > 0 && !error && (
            <p className="auto-condition-note">{validationIssues[0].message}</p>
          )}
        </div>

        <footer className="checklist-template-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>Save Template</button>
        </footer>
      </div>
    </div>
  );
};
