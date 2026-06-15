import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import type { EmployeeFormValues, EmploymentType, WorkMode } from '../../../types/organization';
import { getEmployeeEmploymentContext } from './employeeProfileUtils';
import { WORK_MODE_OPTIONS } from './workModeUtils';
import { getEmployeeActiveAssignment, getReportingManagerPreviewForPosition } from '../../../utils/organizationUtils';

const EMPTY_FORM = (): EmployeeFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'active',
  employmentType: 'full-time',
  startDate: new Date().toISOString().slice(0, 10),
  workMode: 'onsite',
  positionId: ''
});

interface EmployeeFormPanelProps {
  onClose: () => void;
}

export const EmployeeFormPanel: React.FC<EmployeeFormPanelProps> = ({ onClose }) => {
  const {
    employeeForm,
    employees,
    positions,
    departments,
    assignments,
    saveEmployee
  } = useOrganizationStore();

  const existing = employeeForm.employeeId
    ? employees.find(e => e.id === employeeForm.employeeId)
    : null;
  const isEdit = employeeForm.mode === 'edit';

  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      const activeAssignment = getEmployeeActiveAssignment(existing.id, assignments);
      setValues({
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        phone: existing.phone ?? '',
        status: existing.status,
        employmentType: existing.employmentType,
        startDate: existing.startDate,
        workMode: existing.workMode ?? '',
        positionId: activeAssignment?.positionId ?? ''
      });
    } else {
      setValues(EMPTY_FORM());
    }
    setError(null);
  }, [isEdit, existing, employeeForm, assignments]);

  const employment = useMemo(() => {
    if (existing) {
      return getEmployeeEmploymentContext(
        existing.id,
        positions,
        departments,
        assignments,
        employees
      );
    }
    return null;
  }, [existing, positions, departments, assignments, employees]);

  const selectedPositionPreview = useMemo(() => {
    if (!values.positionId) return null;
    const position = positions.find(p => p.id === values.positionId);
    if (!position) return null;
    const dept = departments.find(d => d.id === position.departmentId);
    const rm = getReportingManagerPreviewForPosition(position, positions, assignments, employees);
    return {
      departmentName: dept?.name ?? '—',
      reportingManager: rm.label
    };
  }, [values.positionId, positions, departments, assignments, employees]);

  if (!employeeForm.open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = saveEmployee(values);
    if (!result.ok) setError(result.error ?? 'Unable to save employee.');
  };

  const activePositions = positions.filter(p => p.status === 'active');

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <form
        className="org-slideover org-slideover--narrow"
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="emp-form-section">
            <h3 className="emp-form-section__title">Personal Information</h3>
            <div className="org-form-field">
              <label>First Name</label>
              <input
                value={values.firstName}
                onChange={e => setValues(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="org-form-field">
              <label>Last Name</label>
              <input
                value={values.lastName}
                onChange={e => setValues(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
            <div className="org-form-field">
              <label>Email</label>
              <input
                type="email"
                value={values.email}
                onChange={e => setValues(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="org-form-field">
              <label>Phone</label>
              <input
                value={values.phone}
                onChange={e => setValues(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="emp-form-section">
            <h3 className="emp-form-section__title">Employment / Job Details</h3>
            <div className="org-form-field">
              <label>Department</label>
              <input
                readOnly
                value={
                  selectedPositionPreview?.departmentName ??
                  employment?.departmentName ??
                  '—'
                }
                className="settings-readonly"
                tabIndex={-1}
              />
            </div>
            <div className="org-form-field">
              <label>Position</label>
              <select
                value={values.positionId}
                onChange={e => setValues(prev => ({ ...prev, positionId: e.target.value }))}
              >
                <option value="">Select position…</option>
                {activePositions.map(p => {
                  const dept = departments.find(d => d.id === p.departmentId);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name}{dept ? ` · ${dept.name}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="org-form-field">
              <label>Reporting Manager</label>
              <input
                readOnly
                value={
                  selectedPositionPreview?.reportingManager ??
                  employment?.reportingManager ??
                  '—'
                }
                className="settings-readonly"
                tabIndex={-1}
              />
            </div>
            <div className="org-form-field">
              <label>Employment Type</label>
              <select
                value={values.employmentType}
                onChange={e =>
                  setValues(prev => ({ ...prev, employmentType: e.target.value as EmploymentType }))
                }
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="org-form-field">
              <label>Start Date</label>
              <input
                type="date"
                value={values.startDate}
                onChange={e => setValues(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="org-form-field">
              <label>Status</label>
              <select
                value={values.status}
                onChange={e =>
                  setValues(prev => ({
                    ...prev,
                    status: e.target.value as EmployeeFormValues['status']
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="org-form-field">
              <label>Work Mode</label>
              <select
                value={values.workMode}
                onChange={e =>
                  setValues(prev => ({ ...prev, workMode: e.target.value as WorkMode | '' }))
                }
              >
                <option value="">Select work mode…</option>
                {WORK_MODE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="emp-form-hint">
                Used by Clock-in Policy to determine allowed clock-in methods.
              </p>
            </div>
          </div>
        </div>

        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="org-btn org-btn--primary">
            {isEdit ? 'Save Changes' : 'Add Employee'}
          </button>
        </footer>
      </form>
    </div>
  );
};
