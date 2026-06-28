import React, { useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { useChecklistTemplateStore } from '../../../store/checklistTemplateStore';
import { useInbox } from '../../../core/notifications/inbox-context';
import { getReportingManagerPreviewForPosition } from '../../../utils/organizationUtils';
import { getSuggestedRolesForPosition } from './positionAccessUtils';
import type { ChecklistTemplate } from '../checklist-templates/checklistTemplateTypes';
import type { EmployeeOnboardingValues, EmploymentType } from '../../../types/organization';

const STEPS = ['Employee Details', 'Review & Create'] as const;
const HAS_MULTIPLE_ENTITIES = false;

function findMatchingOnboardingTemplate(
  positionId: string,
  departmentId: string,
  templates: ChecklistTemplate[]
): ChecklistTemplate | null {
  const active = templates.filter(t => t.type === 'onboarding' && t.status === 'active');
  return (
    active.find(t => t.appliesTo === 'position' && t.positionIds.includes(positionId)) ??
    active.find(t => t.appliesTo === 'department' && t.departmentIds.includes(departmentId)) ??
    active.find(t => t.appliesTo === 'company') ??
    null
  );
}

const nextEmployeeNumber = () => `EMP-${String(Date.now()).slice(-6)}`;

const EMPTY_VALUES = (): EmployeeOnboardingValues => ({
  firstName: '',
  lastName: '',
  email: '',
  workEmail: '',
  phone: '',
  employeeNumber: nextEmployeeNumber(),
  legalEntity: '',
  employmentType: 'full-time',
  startDate: new Date().toISOString().slice(0, 10),
  workMode: 'onsite',
  positionId: '',
  confirmedRoleIds: [],
});

interface AddEmployeeWizardProps {
  onClose: () => void;
}

export const AddEmployeeWizard: React.FC<AddEmployeeWizardProps> = ({ onClose }) => {
  const { positions, departments, assignments, employees, completeEmployeeOnboarding } = useOrganizationStore();
  const { addInboxItem } = useInbox();
  const { generateTasksForEmployee } = useChecklistTaskStore();
  const { templates } = useChecklistTemplateStore();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EmployeeOnboardingValues>(EMPTY_VALUES());
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string } | null>(null);
  const [checklistTemplateId, setChecklistTemplateId] = useState('ct-onboarding-employee');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [taskDueTime, setTaskDueTime] = useState('17:00');
  const [notificationId] = useState(() => 'onboarding-documents-' + Date.now());

  const activeDepartments = useMemo(
    () => departments.filter(d => d.status === 'active'),
    [departments]
  );

  const departmentPositions = useMemo(
    () => positions.filter(p => p.status === 'active' && p.departmentId === selectedDepartmentId),
    [positions, selectedDepartmentId]
  );

  const selectedPosition = useMemo(
    () => positions.find(p => p.id === values.positionId) ?? null,
    [positions, values.positionId]
  );

  const positionPreview = useMemo(() => {
    if (!selectedPosition) return null;
    const dept = departments.find(d => d.id === selectedPosition.departmentId);
    const parentPosition = selectedPosition.reportsToPositionId
      ? positions.find(p => p.id === selectedPosition.reportsToPositionId) ?? null
      : null;
    const rm = getReportingManagerPreviewForPosition(selectedPosition, positions, assignments, employees);
    const rmUnresolved = !rm.label || rm.label === '--';
    const accessRoles = getSuggestedRolesForPosition(selectedPosition.id);
    const matchingTemplate = findMatchingOnboardingTemplate(
      selectedPosition.id,
      selectedPosition.departmentId,
      templates
    );
    return {
      positionName: selectedPosition.name,
      departmentName: dept?.name ?? '--',
      reportsToName: parentPosition?.name ?? null,
      reportingManager: rm.label,
      rmUnresolved,
      accessRoles,
      matchingTemplate,
    };
  }, [selectedPosition, departments, positions, assignments, employees, templates]);


  const managerOptions = useMemo(() => {
    const selectedDepartment = selectedPosition?.departmentId;
    return employees.filter(employee => {
      const assignment = assignments.find(item => item.employeeId === employee.id && item.status === 'active');
      const position = positions.find(item => item.id === assignment?.positionId);
      if (!position) return false;
      return /manager|head|chief|hr/i.test(position.name) &&
        (position.departmentId === selectedDepartment || /hr|human resources/i.test(position.name));
    });
  }, [employees, assignments, positions, selectedPosition]);

  const selectedManager = managerOptions.find(manager => manager.id === reportingManagerId);
  const selectedChecklist = templates.find(template => template.id === checklistTemplateId);


  const handlePositionChange = (positionId: string) => {
    const position = positions.find(item => item.id === positionId);
    const name = position?.name.toLowerCase() || '';
    const preferred = name.includes('intern') ? 'ct-onboarding-intern'
      : name.includes('manager') || name.includes('head') ? 'ct-onboarding-manager'
      : name.includes('hr') ? 'ct-onboarding-hr'
      : 'ct-onboarding-employee';
    const roles = positionId ? getSuggestedRolesForPosition(positionId) : [];
    setValues(current => ({ ...current, positionId, confirmedRoleIds: roles.map(role => role.id) }));
    setChecklistTemplateId(preferred);
    setReportingManagerId('');
  };
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setValues(v => ({ ...v, positionId: '', confirmedRoleIds: [] }));
  };

  const validateStep1 = (): string | null => {
    if (!values.firstName.trim() || !values.lastName.trim()) return 'First and last name are required.';
    if (!values.email.trim()) return 'Email address is required.';
    if (!values.startDate) return 'Start date is required.';
    if (!values.workEmail?.trim()) return 'Work email is required.';
    if (!reportingManagerId) return 'Reporting Manager is required.';
    if (!checklistTemplateId) return 'Onboarding checklist is required.';
    if (!taskDueDate || !taskDueTime) return 'Task due date and time are required.';
    if (!selectedDepartmentId) return 'Department is required.';
    if (!values.positionId) return 'Position is required.';
    return null;
  };

  const goNext = () => {
    const issue = validateStep1();
    if (issue) { setError(issue); return; }
    setError(null);
    setStep(1);
  };

  const goBack = () => {
    setError(null);
    setStep(0);
  };

  const handleSubmit = () => {
    const result = completeEmployeeOnboarding(values);
    if (!result.ok || !result.employeeId) {
      setError(result.error ?? 'Unable to create employee.');
      return;
    }
    const employeeName = `${values.firstName} ${values.lastName}`.trim();
    const managerName = selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : 'Reporting Manager';
    generateTasksForEmployee(result.employeeId, 'onboarding', values.startDate, checklistTemplateId, {
      managerId: reportingManagerId, managerName, dueDate: taskDueDate, dueTime: taskDueTime,
      employeeName, employeeNumber: values.employeeNumber
    });
    const documents = selectedChecklist?.items.map(item => item.requiredDocument || item.title).join(', ') || 'Onboarding documents';
    addInboxItem({
      id: `${notificationId}-${result.employeeId}`,
      recipientId: 'manager', category: 'warning', title: 'New employee document collection task',
      message: `${employeeName} (${values.employeeNumber}) - ${documents}. Due ${taskDueDate} at ${taskDueTime}. An email notification was also sent.`,
      timeLabel: 'Just now', filter: 'new', actions: []
    });
    setDone({ email: values.email });
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="org-slideover org-slideover--wide" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>New Employee Onboarding</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="add-employee-wizard__steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`add-employee-wizard__step${i === step ? ' add-employee-wizard__step--active' : ''}${i < step ? ' add-employee-wizard__step--done' : ''}`}
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
              <p>
                An invitation has been sent to <strong>{done.email}</strong>. The employee status is
                set to <strong>Onboarding</strong> and checklist tasks have been generated.
              </p>
            </div>
          ) : step === 0 ? (
            <>
              {/* Section: Identity */}
              <div className="emp-form-section">
                <h3 className="emp-form-section__title">About Me</h3>
                <div className="org-form-field">
                  <label>First Name</label>
                  <input
                    value={values.firstName}
                    onChange={e => setValues(v => ({ ...v, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="org-form-field">
                  <label>Last Name</label>
                  <input
                    value={values.lastName}
                    onChange={e => setValues(v => ({ ...v, lastName: e.target.value }))}
                    required
                  />
                </div>
                <div className="org-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={values.email}
                    onChange={e => setValues(v => ({ ...v, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
                <div className="emp-form-section">
                <h3 className="emp-form-section__title">Contact Details</h3>
                <div className="org-form-field">
                  <label>Work Email</label>
                  <input type="email" value={values.workEmail ?? ''} onChange={e => setValues(v => ({ ...v, workEmail: e.target.value }))} required />
                </div>
                <div className="org-form-field">
                  <label>Employee Number</label>
                  <input
                    value={values.employeeNumber} readOnly aria-readonly="true" title="Automatically generated" />
                </div>
                {HAS_MULTIPLE_ENTITIES && (
                  <div className="org-form-field">
                    <label>Legal Entity</label>
                    <input
                      value={values.legalEntity}
                      onChange={e => setValues(v => ({ ...v, legalEntity: e.target.value }))}
                    />
                  </div>
                )}
                <div className="org-form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={values.startDate}
                    onChange={e => setValues(v => ({ ...v, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="org-form-field">
                  <label>Employment Type</label>
                  <select
                    value={values.employmentType}
                    onChange={e => setValues(v => ({ ...v, employmentType: e.target.value as EmploymentType }))}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>
              </div>
              {/* Section: Position Assignment */}
              <div className="emp-form-section">
                <h3 className="emp-form-section__title">Onboarding Task Assignment</h3>
                <p className="emp-form-hint">
                  Position controls reporting line, default access, and onboarding defaults.
                </p>
                <div className="org-form-field">
                  <label>Department</label>
                  <select value={selectedDepartmentId} onChange={e => handleDepartmentChange(e.target.value)}>
                    <option value="">Select department...</option>
                    {activeDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="org-form-field">
                  <label>Position</label>
                  <select
                    value={values.positionId}
                    onChange={e => handlePositionChange(e.target.value)}
                    disabled={!selectedDepartmentId}
                  >
                    <option value="">
                      {selectedDepartmentId ? 'Select position...' : 'Select a department first'}
                    </option>
                    {departmentPositions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="org-form-field">
                  <label>Task</label>
                  <select value={checklistTemplateId} onChange={event => setChecklistTemplateId(event.target.value)} disabled={!values.positionId}>
                    <option value="">Select onboarding checklist</option>
                    {templates.filter(template => template.type === 'onboarding' && template.status === 'active').map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
                <div className="org-form-field">
                  <label>Reporting Manager Name</label>
                  <select value={reportingManagerId} onChange={event => setReportingManagerId(event.target.value)} disabled={!values.positionId}>
                    <option value="">Select HR / Manager</option>
                    {managerOptions.map(manager => <option key={manager.id} value={manager.id}>{manager.firstName} {manager.lastName}</option>)}
                  </select>
                </div>
                <div className="add-emp-due-grid">
                  <div className="org-form-field"><label>Due Date</label><input type="date" value={taskDueDate} onChange={event => setTaskDueDate(event.target.value)} /></div>
                  <div className="org-form-field"><label>Due Time</label><input type="time" value={taskDueTime} onChange={event => setTaskDueTime(event.target.value)} /></div>
                </div>
                {/* Position preview */}
                {positionPreview && (
                  <div className="add-emp-position-preview">
                    <div className="add-emp-position-preview__header">
                      <strong>{positionPreview.positionName}</strong>
                      <span className="add-emp-position-preview__dept">{positionPreview.departmentName}</span>
                    </div>
                    <div className="add-emp-position-preview__rows">
                      <div className="add-emp-position-preview__row">
                        <span className="add-emp-position-preview__label">Reports to position</span>
                        <span>{positionPreview.reportsToName ?? 'No parent position'}</span>
                      </div>
                      <div className="add-emp-position-preview__row">
                        <span className="add-emp-position-preview__label">Reporting Manager</span>
                        {positionPreview.rmUnresolved ? (
                          <span className="add-emp-position-preview__warning">
                            <AlertTriangle size={12} />
                            Reporting manager is unresolved because the parent position is vacant.
                          </span>
                        ) : (
                          <span>{positionPreview.reportingManager}</span>
                        )}
                      </div>
                      <div className="add-emp-position-preview__row">
                        <span className="add-emp-position-preview__label">Onboarding checklist</span>
                        {positionPreview.matchingTemplate ? (
                          <span>
                            {positionPreview.matchingTemplate.name}
                            <span className="add-emp-position-preview__muted">
                              {' '} - {positionPreview.matchingTemplate.items.length} tasks
                            </span>
                          </span>
                        ) : (
                          <span className="add-emp-position-preview__muted">No matching template</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* STEP 2: Review & Create */}

              {/* Employee summary */}
              <div className="emp-form-section">
                <h3 className="emp-form-section__title">Employee</h3>
                <div className="emp-record-grid">
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Name</span>
                    <div className="emp-record-field__value">{values.firstName} {values.lastName}</div>
                  </div>
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Work Email</span>
                    <div className="emp-record-field__value">{values.workEmail}</div>
                  </div>
                  {values.employeeNumber && (
                    <div className="emp-record-field">
                      <span className="emp-record-field__label">Employee Number</span>
                      <div className="emp-record-field__value">{values.employeeNumber}</div>
                    </div>
                  )}
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Start Date</span>
                    <div className="emp-record-field__value">{values.startDate}</div>
                  </div>
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Employment Type</span>
                    <div className="emp-record-field__value">{values.employmentType}</div>
                  </div>
                  {HAS_MULTIPLE_ENTITIES && values.legalEntity && (
                    <div className="emp-record-field">
                      <span className="emp-record-field__label">Legal Entity</span>
                      <div className="emp-record-field__value">{values.legalEntity}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Position summary */}
              <div className="emp-form-section">
                <h3 className="emp-form-section__title">Position</h3>
                <div className="emp-record-grid">
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Department</span>
                    <div className="emp-record-field__value">{positionPreview?.departmentName ?? '--'}</div>
                  </div>
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Position</span>
                    <div className="emp-record-field__value">{positionPreview?.positionName ?? '--'}</div>
                  </div>
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Reports to position</span>
                    <div className="emp-record-field__value">
                      {positionPreview?.reportsToName ?? 'No parent position'}
                    </div>
                  </div>
                  <div className="emp-record-field">
                    <span className="emp-record-field__label">Reporting Manager</span>
                    <div className="emp-record-field__value">
                      {positionPreview?.rmUnresolved ? (
                        <span className="add-emp-position-preview__warning">
                          <AlertTriangle size={12} /> Unresolved
                        </span>
                      ) : (
                        positionPreview?.reportingManager ?? '--'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding task summary */}
              <div className="emp-form-section">
                <h3 className="emp-form-section__title">Document Collection Task</h3>
                <div className="emp-record-grid">
                  <div className="emp-record-field"><span className="emp-record-field__label">Checklist</span><div className="emp-record-field__value">{selectedChecklist?.name ?? '--'}</div></div>
                  <div className="emp-record-field"><span className="emp-record-field__label">Reporting Manager</span><div className="emp-record-field__value">{selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : '--'}</div></div>
                  <div className="emp-record-field"><span className="emp-record-field__label">Due Date</span><div className="emp-record-field__value">{taskDueDate}</div></div>
                  <div className="emp-record-field"><span className="emp-record-field__label">Due Time</span><div className="emp-record-field__value">{taskDueTime}</div></div>
                </div>
                <div className="onboarding-review-documents">
                  <span>Documents sent in the notification</span>
                  <ul>{selectedChecklist?.items.map(item => <li key={item.id}>{item.requiredDocument || item.title}</li>)}</ul>
                </div>
                <p className="emp-form-hint">The Reporting Manager receives an in-app notification, email notification, and calendar reminder.</p>
              </div>            </>
          )}
        </div>

        <footer className="org-slideover__footer">
          {done ? (
            <button type="button" className="org-btn org-btn--primary" onClick={onClose}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
                Cancel
              </button>
              {step > 0 && (
                <button type="button" className="org-btn org-btn--secondary" onClick={goBack}>
                  Back
                </button>
              )}
              {step === 0 && (
                <button type="button" className="org-btn org-btn--primary" onClick={goNext}>
                  Next
                </button>
              )}
              {step === 1 && (
                <button type="button" className="org-btn org-btn--primary" onClick={handleSubmit}>
                  Create Employee and Send Invite
                </button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
