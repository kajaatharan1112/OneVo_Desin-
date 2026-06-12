import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  getAssignableEmployeesForPosition,
  getDepartmentName,
  getEmployeeActiveAssignment,
  getEmployeeCurrentPositionName,
  getPositionAssignBlockReason,
  getReportingManagerPreviewForPosition
} from '../../../utils/organizationUtils';

interface AssignmentFormPanelProps {
  onClose: () => void;
}

export const AssignmentFormPanel: React.FC<AssignmentFormPanelProps> = ({ onClose }) => {
  const {
    assignmentForm,
    positions,
    departments,
    employees,
    assignments,
    assignEmployee
  } = useOrganizationStore();

  const [employeeId, setEmployeeId] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const position = assignmentForm.positionId
    ? positions.find(p => p.id === assignmentForm.positionId)
    : null;

  const reportsToPosition = position?.reportsToPositionId
    ? positions.find(p => p.id === position.reportsToPositionId)
    : null;

  const assignBlockReason = position
    ? getPositionAssignBlockReason(position, assignments)
    : null;

  const selectableEmployees = useMemo(() => {
    if (!position) return [];
    return getAssignableEmployeesForPosition(position.id, employees, assignments);
  }, [position, employees, assignments]);

  const rmPreview = useMemo(() => {
    if (!position) return null;
    return getReportingManagerPreviewForPosition(position, positions, assignments, employees);
  }, [position, positions, assignments, employees]);

  const existingAssignment = useMemo(() => {
    if (!employeeId) return null;
    const active = getEmployeeActiveAssignment(employeeId, assignments);
    if (!active || !position || active.positionId === position.id) return null;
    const currentPosition = positions.find(p => p.id === active.positionId);
    if (!currentPosition || currentPosition.status !== 'active') return null;
    return currentPosition;
  }, [employeeId, assignments, position, positions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position || !employeeId) {
      setError('Please select an employee.');
      return;
    }

    if (assignBlockReason) {
      setError(assignBlockReason);
      return;
    }

    if (existingAssignment) {
      const employee = employees.find(emp => emp.id === employeeId);
      const name = employee ? `${employee.firstName} ${employee.lastName}` : 'This employee';
      const confirmed = window.confirm(
        `${name} is currently assigned to ${existingAssignment.name}. Assigning to ${position.name} will move them to this position. Continue?`
      );
      if (!confirmed) return;
    }

    const result = assignEmployee(employeeId, position.id, { effectiveFrom, notes });
    if (!result.ok) {
      setError(result.error ?? 'Failed to assign employee.');
    }
  };

  if (!position) return null;

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose} aria-hidden />
      <aside className="org-slideover" role="dialog" aria-label="Assign employee to position">
        <header className="org-slideover__header">
          <h2>Assign Employee to Position</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="org-slideover__body" onSubmit={handleSubmit}>
          {error && <div className="org-form-error" role="alert">{error}</div>}

          {assignBlockReason && (
            <div className="org-form-error" role="status">{assignBlockReason}</div>
          )}

          <div className="org-form-field">
            <label>Position</label>
            <span className="org-form-readonly">{position.name}</span>
          </div>

          <div className="org-form-field">
            <label>Department</label>
            <span className="org-form-readonly">
              {getDepartmentName(position.departmentId, departments)}
            </span>
          </div>

          <div className="org-form-field">
            <label>Reports To Position</label>
            <span className="org-form-readonly">{reportsToPosition?.name ?? '—'}</span>
          </div>

          <div className="org-form-preview">
            <span className="org-form-preview__label">Reporting Manager Preview</span>
            <span className="org-form-preview__value">{rmPreview?.label ?? 'Not resolved'}</span>
            {rmPreview?.warning && (
              <p className="org-form-hint org-form-hint--warning">{rmPreview.warning}</p>
            )}
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
              disabled={Boolean(assignBlockReason)}
            >
              <option value="">Select employee</option>
              {selectableEmployees.map(e => {
                const currentPosition = getEmployeeCurrentPositionName(e.id, positions, assignments);
                return (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                    {currentPosition ? ` — currently ${currentPosition}` : ''}
                  </option>
                );
              })}
            </select>
            {selectableEmployees.length === 0 && !assignBlockReason && (
              <p className="org-form-hint">No active employees available for this position.</p>
            )}
          </div>

          {existingAssignment && (
            <div className="org-form-preview org-form-preview--warning" role="status">
              <span className="org-form-preview__label">Current assignment</span>
              <span className="org-form-preview__value">
                This employee is assigned to {existingAssignment.name}. Continuing will move them
                to {position.name}.
              </span>
            </div>
          )}

          <div className="org-form-field">
            <label htmlFor="assign-effective-from">Effective Date *</label>
            <input
              id="assign-effective-from"
              type="date"
              value={effectiveFrom}
              onChange={e => setEffectiveFrom(e.target.value)}
              required
              disabled={Boolean(assignBlockReason)}
            />
          </div>

          <div className="org-form-field">
            <label htmlFor="assign-notes">Assignment Notes</label>
            <textarea
              id="assign-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this assignment"
              disabled={Boolean(assignBlockReason)}
            />
          </div>

          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="org-btn org-btn--primary"
              disabled={!employeeId || Boolean(assignBlockReason)}
            >
              Assign Employee
            </button>
          </footer>
        </form>
      </aside>
    </>
  );
};
