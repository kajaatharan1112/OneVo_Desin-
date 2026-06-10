import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  getValidReportingTargets,
  isPositionCodeUnique,
  suggestDepartmentCode
} from '../../../utils/organizationUtils';
import type { EntityStatus, PositionType } from '../../../types/organization';

interface PositionFormPanelProps {
  onClose: () => void;
}

export const PositionFormPanel: React.FC<PositionFormPanelProps> = ({ onClose }) => {
  const { positionForm, positions, departments, savePosition } = useOrganizationStore();

  const existing = positionForm.positionId
    ? positions.find(p => p.id === positionForm.positionId)
    : null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [reportsToId, setReportsToId] = useState<string | null>(null);
  const [type, setType] = useState<PositionType>('unique');
  const [capacity, setCapacity] = useState(1);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [error, setError] = useState<string | null>(null);

  const isEdit = positionForm.mode === 'edit';

  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name);
      setCode(existing.code);
      setCodeTouched(true);
      setDepartmentId(existing.departmentId);
      setReportsToId(existing.reportsToPositionId);
      setType(existing.type);
      setCapacity(existing.capacity);
      setStatus(existing.status);
    } else {
      setName('');
      setCode('');
      setCodeTouched(false);
      setDepartmentId(positionForm.departmentId ?? '');
      setReportsToId(positionForm.reportsToPositionId);
      setType('unique');
      setCapacity(1);
      setStatus('active');
    }
    setError(null);
  }, [positionForm, existing, isEdit]);

  useEffect(() => {
    if (!codeTouched && name) {
      setCode(suggestDepartmentCode(name));
    }
  }, [name, codeTouched]);

  useEffect(() => {
    if (type === 'unique') setCapacity(1);
  }, [type]);

  const activeDepartments = useMemo(
    () => departments.filter(d => d.status === 'active'),
    [departments]
  );

  const reportingTargets = useMemo(
    () => getValidReportingTargets(positionForm.positionId, positions),
    [positionForm.positionId, positions]
  );

  const parentPosition = reportsToId ? positions.find(p => p.id === reportsToId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = savePosition({
      id: positionForm.positionId ?? undefined,
      name,
      code,
      departmentId,
      reportsToPositionId: reportsToId,
      type,
      capacity,
      status
    });

    if (!result.ok) {
      setError(result.error ?? 'Failed to save position.');
    }
  };

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover" role="dialog" aria-label={isEdit ? 'Edit position' : 'Add position'}>
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit Position' : 'Add Position'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body" onSubmit={handleSubmit}>
          {error && <div className="org-form-error" role="alert">{error}</div>}

          <div className="org-form-field">
            <label htmlFor="pos-name">Position Name *</label>
            <input
              id="pos-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-code">Position Code *</label>
            <input
              id="pos-code"
              type="text"
              value={code}
              onChange={e => {
                setCodeTouched(true);
                setCode(e.target.value.toUpperCase());
              }}
              required
            />
            {!isPositionCodeUnique(code, positions, positionForm.positionId ?? undefined) && code && (
              <p className="org-form-hint org-form-hint--error">Code must be unique.</p>
            )}
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-dept">Department *</label>
            <select
              id="pos-dept"
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              required
            >
              <option value="">Select department</option>
              {activeDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-reports">Reports To</label>
            <select
              id="pos-reports"
              value={reportsToId ?? ''}
              onChange={e => setReportsToId(e.target.value || null)}
            >
              <option value="">None (root position)</option>
              {reportingTargets.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
            {parentPosition && (
              <p className="org-form-hint">
                Will report to {parentPosition.name} in {activeDepartments.find(d => d.id === parentPosition.departmentId)?.name}
              </p>
            )}
          </div>

          <div className="org-form-field">
            <label htmlFor="pos-type">Type</label>
            <select
              id="pos-type"
              value={type}
              onChange={e => setType(e.target.value as PositionType)}
            >
              <option value="unique">Unique (capacity 1)</option>
              <option value="pooled">Pooled</option>
            </select>
          </div>

          {type === 'pooled' && (
            <div className="org-form-field">
              <label htmlFor="pos-capacity">Capacity</label>
              <input
                id="pos-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={e => setCapacity(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}

          <div className="org-form-field">
            <label htmlFor="pos-status">Status</label>
            <select
              id="pos-status"
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
              {isEdit ? 'Save Changes' : 'Create Position'}
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
};
