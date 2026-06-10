import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  canAssignEmployeeToPosition,
  getPositionOccupancy,
  getReportingManagerForEmployee
} from '../../../utils/organizationUtils';

interface AssignmentFormPanelProps {
  onClose: () => void;
}

export const AssignmentFormPanel: React.FC<AssignmentFormPanelProps> = ({ onClose }) => {
  const {
    assignmentForm,
    positions,
    employees,
    assignments,
    assignEmployee
  } = useOrganizationStore();

  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const position = assignmentForm.positionId
    ? positions.find(p => p.id === assignmentForm.positionId)
    : null;

  const availableEmployees = useMemo(() => {
    if (!position) return [];
    return employees.filter(e => {
      if (e.status === 'inactive') return false;
      const check = canAssignEmployeeToPosition(e.id, position.id, positions, assignments);
      return check.ok;
    });
  }, [position, employees, positions, assignments]);

  const preview = useMemo(() => {
    if (!employeeId || !position) return null;
    return getReportingManagerForEmployee(employeeId, positions, assignments, employees);
  }, [employeeId, position, positions, assignments, employees]);

  const occupancy = position
    ? getPositionOccupancy(position.id, position, assignments)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position || !employeeId) {
      setError('Please select an employee.');
      return;
    }

    const result = assignEmployee(employeeId, position.id);
    if (!result.ok) {
      setError(result.error ?? 'Failed to assign employee.');
    }
  };

  if (!position) return null;

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover org-slideover--narrow" role="dialog" aria-label="Assign employee">
        <header className="org-slideover__header">
          <h2>Assign Employee</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body" onSubmit={handleSubmit}>
          {error && <div className="org-form-error" role="alert">{error}</div>}

          <div className="org-form-field">
            <label>Position</label>
            <span className="org-form-readonly">{position.name} ({position.code})</span>
          </div>

          <div className="org-form-field">
            <label>Occupancy</label>
            <span className="org-form-readonly">
              {occupancy?.count}/{occupancy?.capacity}
              {occupancy?.isFull ? ' (full)' : ''}
            </span>
          </div>

          <div className="org-form-field">
            <label htmlFor="assign-employee">Employee *</label>
            <select
              id="assign-employee"
              value={employeeId}
              onChange={e => {
                setEmployeeId(e.target.value);
                setError(null);
              }}
              required
            >
              <option value="">Select employee</option>
              {availableEmployees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.status})
                </option>
              ))}
            </select>
            {availableEmployees.length === 0 && (
              <p className="org-form-hint">No eligible employees available for this position.</p>
            )}
          </div>

          {employeeId && preview && (
            <div className="org-form-preview">
              <span className="org-form-preview__label">Reporting manager preview</span>
              <span className="org-form-preview__value">
                {preview.unresolved
                  ? preview.reason ?? 'Reporting manager unresolved'
                  : preview.manager
                    ? `${preview.manager.firstName} ${preview.manager.lastName}`
                    : 'No reporting manager (root position)'}
              </span>
            </div>
          )}

          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="org-btn org-btn--primary"
              disabled={!employeeId || occupancy?.isFull}
            >
              Assign
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
};
