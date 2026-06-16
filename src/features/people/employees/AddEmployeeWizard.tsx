import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { getReportingManagerPreviewForPosition } from '../../../utils/organizationUtils';
import { getSuggestedRolesForPosition } from './positionAccessUtils';
import { MOCK_ROLES } from '../../admin/adminMockData';
import type { EmployeeOnboardingValues, EmploymentType, WorkMode } from '../../../types/organization';
import { WORK_MODE_OPTIONS } from './workModeUtils';

const STEPS = [
  'Identity Basics',
  'Employment Details',
  'Position Assignment',
  'Access Confirmation',
  'Send Invite'
] as const;

interface AddEmployeeWizardProps {
  onClose: () => void;
}

const EMPTY_VALUES = (): EmployeeOnboardingValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employmentType: 'full-time',
  startDate: new Date().toISOString().slice(0, 10),
  workMode: 'onsite',
  positionId: '',
  confirmedRoleIds: []
});

export const AddEmployeeWizard: React.FC<AddEmployeeWizardProps> = ({ onClose }) => {
  const { positions, departments, assignments, employees, completeEmployeeOnboarding } = useOrganizationStore();
  const { generateTasksForEmployee } = useChecklistTaskStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<EmployeeOnboardingValues>(EMPTY_VALUES());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string } | null>(null);

  const activePositions = positions.filter(p => p.status === 'active');

  const positionPreview = useMemo(() => {
    const position = positions.find(p => p.id === values.positionId);
    if (!position) return null;
    const dept = departments.find(d => d.id === position.departmentId);
    const rm = getReportingManagerPreviewForPosition(position, positions, assignments, employees);
    return { departmentName: dept?.name ?? '—', reportingManager: rm.label, positionId: position.id };
  }, [values.positionId, positions, departments, assignments, employees]);

  const suggestedRoles = useMemo(
    () => (values.positionId ? getSuggestedRolesForPosition(values.positionId) : []),
    [values.positionId]
  );

  // Keep confirmedRoleIds defaulted to the suggested set whenever the position changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setValues(v => ({ ...v, confirmedRoleIds: suggestedRoles.map(r => r.id) }));
  }, [values.positionId]);

  const validateStep = (): string | null => {
    switch (stepIndex) {
      case 0:
        if (!values.firstName.trim() || !values.lastName.trim()) return 'First and last name are required.';
        if (!values.email.trim()) return 'Email is required.';
        return null;
      case 1:
        if (!values.startDate) return 'Start date is required.';
        if (!values.workMode) return 'Work mode is required.';
        return null;
      case 2:
        if (!values.positionId) return 'Position is required.';
        return null;
      default:
        return null;
    }
  };

  const goNext = () => {
    const issue = validateStep();
    if (issue) { setError(issue); return; }
    setError(null);
    setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex(i => Math.max(i - 1, 0));
  };

  const handleSubmit = () => {
    const result = completeEmployeeOnboarding(values);
    if (!result.ok || !result.employeeId) {
      setError(result.error ?? 'Unable to create employee.');
      return;
    }
    generateTasksForEmployee(result.employeeId, 'onboarding', values.startDate);
    setDone({ email: values.email });
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="org-slideover org-slideover--wide" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Add Employee</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="add-employee-wizard__steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`add-employee-wizard__step${i === stepIndex ? ' add-employee-wizard__step--active' : ''}${i < stepIndex ? ' add-employee-wizard__step--done' : ''}`}
            >
              <span className="add-employee-wizard__step-index">{i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="org-slideover__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          {done ? (
            <div className="add-employee-wizard__done">
              <h3>Employee created</h3>
              <p>An invite email has been sent to <strong>{done.email}</strong>. The employee status is set to <strong>Onboarding</strong> and onboarding checklist tasks have been generated.</p>
            </div>
          ) : (
            <>
              {stepIndex === 0 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Identity Basics</h3>
                  <div className="org-form-field">
                    <label>First Name</label>
                    <input value={values.firstName} onChange={e => setValues(v => ({ ...v, firstName: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Last Name</label>
                    <input value={values.lastName} onChange={e => setValues(v => ({ ...v, lastName: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Email</label>
                    <input type="email" value={values.email} onChange={e => setValues(v => ({ ...v, email: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Phone</label>
                    <input value={values.phone} onChange={e => setValues(v => ({ ...v, phone: e.target.value }))} placeholder="Optional" />
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Employment Details</h3>
                  <div className="org-form-field">
                    <label>Employment Type</label>
                    <select value={values.employmentType} onChange={e => setValues(v => ({ ...v, employmentType: e.target.value as EmploymentType }))}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="org-form-field">
                    <label>Start Date</label>
                    <input type="date" value={values.startDate} onChange={e => setValues(v => ({ ...v, startDate: e.target.value }))} required />
                  </div>
                  <div className="org-form-field">
                    <label>Work Mode</label>
                    <select value={values.workMode} onChange={e => setValues(v => ({ ...v, workMode: e.target.value as WorkMode | '' }))}>
                      <option value="">Select work mode…</option>
                      {WORK_MODE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Position Assignment</h3>
                  <div className="org-form-field">
                    <label>Position</label>
                    <select value={values.positionId} onChange={e => setValues(v => ({ ...v, positionId: e.target.value }))}>
                      <option value="">Select position…</option>
                      {activePositions.map(p => {
                        const dept = departments.find(d => d.id === p.departmentId);
                        return <option key={p.id} value={p.id}>{p.name}{dept ? ` · ${dept.name}` : ''}</option>;
                      })}
                    </select>
                  </div>
                  <div className="org-form-field">
                    <label>Department</label>
                    <input readOnly className="settings-readonly" value={positionPreview?.departmentName ?? '—'} tabIndex={-1} />
                  </div>
                  <div className="org-form-field">
                    <label>Reporting Manager</label>
                    <input readOnly className="settings-readonly" value={positionPreview?.reportingManager ?? '—'} tabIndex={-1} />
                  </div>
                </div>
              )}

              {stepIndex === 3 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Access Confirmation</h3>
                  <p className="emp-form-hint">
                    These roles are suggested based on the selected position. Confirm or adjust before the invite is sent.
                  </p>
                  {MOCK_ROLES.filter(r => r.active).map(role => (
                    <label key={role.id} className="cip-toggle-row">
                      <input
                        type="checkbox"
                        checked={values.confirmedRoleIds.includes(role.id)}
                        onChange={e => setValues(v => ({
                          ...v,
                          confirmedRoleIds: e.target.checked
                            ? [...v.confirmedRoleIds, role.id]
                            : v.confirmedRoleIds.filter(id => id !== role.id)
                        }))}
                      />
                      {role.name}
                      {suggestedRoles.some(r => r.id === role.id) && <span className="cfg-badge cfg-badge--active">Suggested</span>}
                    </label>
                  ))}
                </div>
              )}

              {stepIndex === 4 && (
                <div className="emp-form-section">
                  <h3 className="emp-form-section__title">Send Invite</h3>
                  <div className="emp-record-grid">
                    <div className="emp-record-field"><span className="emp-record-field__label">Name</span><div className="emp-record-field__value">{values.firstName} {values.lastName}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Email</span><div className="emp-record-field__value">{values.email}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Position</span><div className="emp-record-field__value">{positions.find(p => p.id === values.positionId)?.name ?? '—'}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Department</span><div className="emp-record-field__value">{positionPreview?.departmentName ?? '—'}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Reporting Manager</span><div className="emp-record-field__value">{positionPreview?.reportingManager ?? '—'}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Start Date</span><div className="emp-record-field__value">{values.startDate}</div></div>
                    <div className="emp-record-field"><span className="emp-record-field__label">Confirmed Access</span><div className="emp-record-field__value">{values.confirmedRoleIds.map(id => MOCK_ROLES.find(r => r.id === id)?.name).filter(Boolean).join(', ') || '—'}</div></div>
                  </div>
                  <p className="emp-form-hint">
                    Submitting will create the employee with status <strong>Onboarding</strong> and send an invite email to {values.email || 'the address above'}.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="org-slideover__footer">
          {done ? (
            <button type="button" className="org-btn org-btn--primary" onClick={onClose}>Done</button>
          ) : (
            <>
              <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
              {stepIndex > 0 && <button type="button" className="org-btn org-btn--secondary" onClick={goBack}>Back</button>}
              {stepIndex < STEPS.length - 1 && <button type="button" className="org-btn org-btn--primary" onClick={goNext}>Next</button>}
              {stepIndex === STEPS.length - 1 && <button type="button" className="org-btn org-btn--primary" onClick={handleSubmit}>Send Invite</button>}
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
