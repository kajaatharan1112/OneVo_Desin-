import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  buildDepartmentTree,
  canSetDepartmentParent,
  isDepartmentCodeUnique,
  suggestDepartmentCode
} from '../../../utils/organizationUtils';
import type { EntityStatus } from '../../../types/organization';

interface DepartmentFormPanelProps {
  onClose: () => void;
}

export const DepartmentFormPanel: React.FC<DepartmentFormPanelProps> = ({ onClose }) => {
  const { departmentForm, departments, saveDepartment } = useOrganizationStore();

  const existing = departmentForm.departmentId
    ? departments.find(d => d.id === departmentForm.departmentId)
    : null;
  const initialName = existing?.name ?? '';
  const initialCode = existing?.code ?? '';
  const initialParentId = existing?.parentDepartmentId ?? departmentForm.parentDepartmentId;
  const initialDescription = existing?.description ?? '';
  const initialStatus = existing?.status ?? 'active';

  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [codeTouched, setCodeTouched] = useState(Boolean(existing));
  const [parentId, setParentId] = useState<string | null>(initialParentId);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<EntityStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);

  const isEdit = departmentForm.mode === 'edit';
  const isFirstDepartment = !isEdit && departments.length === 0;

  const tree = useMemo(() => buildDepartmentTree(departments), [departments]);
  const parentOptions = useMemo(() => {
    const excludeId = departmentForm.departmentId;
    const flat: { id: string; name: string; depth: number }[] = [];

    const walk = (nodes: ReturnType<typeof buildDepartmentTree>, depth: number) => {
      for (const node of nodes) {
        if (node.id !== excludeId) {
          flat.push({ id: node.id, name: node.name, depth });
          walk(node.children, depth + 1);
        }
      }
    };
    walk(tree, 0);
    return flat;
  }, [tree, departmentForm.departmentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Department name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Department code is required.');
      return;
    }
    if (!isDepartmentCodeUnique(code, departments, departmentForm.departmentId ?? undefined)) {
      setError('Department code must be unique.');
      return;
    }
    if (!isFirstDepartment && !isEdit && !parentId) {
      setError('Head Department is required after the first department.');
      return;
    }

    const parentCheck = canSetDepartmentParent(
      departmentForm.departmentId,
      parentId,
      departments
    );
    if (!parentCheck.ok) {
      setError(parentCheck.error ?? 'Invalid parent department.');
      return;
    }

    const result = saveDepartment({
      id: departmentForm.departmentId ?? undefined,
      name,
      code,
      parentDepartmentId: parentId,
      description,
      status
    });

    if (!result.ok) {
      setError(result.error ?? 'Failed to save department.');
    }
  };

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover" role="dialog" aria-label={isEdit ? 'Edit department' : 'Add department'}>
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit Department' : 'Add Department'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body" onSubmit={handleSubmit}>
          {error && (
            <div className="org-form-error" role="alert">{error}</div>
          )}

          <div className="org-form-field">
            <label htmlFor="dept-name">Department Name *</label>
            <input
              id="dept-name"
              type="text"
              value={name}
              onChange={e => {
                const nextName = e.target.value;
                setName(nextName);
                if (!codeTouched) {
                  setCode(suggestDepartmentCode(nextName));
                }
              }}
              placeholder="e.g. Engineering"
              required
            />
          </div>

          <div className="org-form-field">
            <label htmlFor="dept-code">Department Code *</label>
            <input
              id="dept-code"
              type="text"
              value={code}
              onChange={e => {
                setCodeTouched(true);
                setCode(e.target.value.toUpperCase());
              }}
              placeholder="e.g. ENG"
              required
            />
          </div>

          <div className="org-form-field">
            <label htmlFor="dept-parent">Head Department{!isFirstDepartment && !isEdit ? ' *' : ''}</label>
            <select
              id="dept-parent"
              value={parentId ?? ''}
              onChange={e => setParentId(e.target.value || null)}
              disabled={isFirstDepartment}
              required={!isFirstDepartment && !isEdit}
            >
              <option value="">{isFirstDepartment ? 'First / top-level department' : 'Select head department'}</option>
              {parentOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {'—'.repeat(opt.depth)}{opt.depth > 0 ? ' ' : ''}{opt.name}
                </option>
              ))}
            </select>
            {isFirstDepartment && <p className="org-form-hint">This is the first department, so it has no head department.</p>}
          </div>

          <div className="org-form-field">
            <label htmlFor="dept-desc">Description</label>
            <textarea
              id="dept-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div className="org-form-field">
            <label htmlFor="dept-status">Status</label>
            <select
              id="dept-status"
              value={status}
              onChange={e => setStatus(e.target.value as EntityStatus)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="org-btn org-btn--primary">
              {isEdit ? 'Save Changes' : 'Create Department'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
};
