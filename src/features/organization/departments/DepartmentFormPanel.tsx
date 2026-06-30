import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  buildDepartmentTree,
  canSetDepartmentParent,
  getValidHeadPositions,
  isDepartmentCodeUnique,
  suggestDepartmentCode
} from '../../../utils/organizationUtils';
import type { EntityStatus } from '../../../types/organization';

interface DepartmentFormPanelProps {
  onClose: () => void;
}

export const DepartmentFormPanel: React.FC<DepartmentFormPanelProps> = ({ onClose }) => {
  const { departmentForm, departments, positions, saveDepartment } = useOrganizationStore();

  const existing = departmentForm.departmentId
    ? departments.find(d => d.id === departmentForm.departmentId)
    : null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [headPositionId, setHeadPositionId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [error, setError] = useState<string | null>(null);

  const isEdit = departmentForm.mode === 'edit';

  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name);
      setCode(existing.code);
      setCodeTouched(true);
      setParentId(existing.parentDepartmentId);
      setHeadPositionId(existing.headPositionId);
      setDescription(existing.description);
      setStatus(existing.status);
    } else {
      setName('');
      setCode('');
      setCodeTouched(false);
      setParentId(departmentForm.parentDepartmentId);
      setHeadPositionId(null);
      setDescription('');
      setStatus('active');
    }
    setError(null);
  }, [departmentForm, existing, isEdit]);

  useEffect(() => {
    if (!codeTouched && name) {
      setCode(suggestDepartmentCode(name));
    }
  }, [name, codeTouched]);

  const tree = useMemo(() => buildDepartmentTree(departments), [departments]);

  const headPositions = useMemo(() => {
    if (!isEdit || !departmentForm.departmentId) return [];
    return getValidHeadPositions(departmentForm.departmentId, positions);
  }, [isEdit, departmentForm.departmentId, positions]);

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
      headPositionId: isEdit ? headPositionId : undefined,
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
              onChange={e => setName(e.target.value)}
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
            <label htmlFor="dept-parent">Parent Department</label>
            <select
              id="dept-parent"
              value={parentId ?? ''}
              onChange={e => setParentId(e.target.value || null)}
            >
              <option value="">None (root department)</option>
              {parentOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {'—'.repeat(opt.depth)}{opt.depth > 0 ? ' ' : ''}{opt.name}
                </option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div className="org-form-field">
              <label htmlFor="dept-head">Head Position</label>
              <select
                id="dept-head"
                value={headPositionId ?? ''}
                onChange={e => setHeadPositionId(e.target.value || null)}
              >
                <option value="">No head position</option>
                {headPositions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
              {headPositions.length === 0 && (
                <p className="org-form-hint">
                  Create a unique position in this department before assigning a department head.
                </p>
              )}
            </div>
          )}

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
