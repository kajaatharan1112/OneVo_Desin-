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

type OnboardingChecklistCategory = 'hr' | 'manager' | 'intern' | 'employee';

const onboardingCategoryForPosition = (positionName = ''): OnboardingChecklistCategory => {
  const normalized = positionName.toLowerCase();
  if (normalized.includes('intern') || normalized.includes('trainee')) return 'intern';
  if (normalized.includes('hr') || normalized.includes('human resources')) return 'hr';
  if (normalized.includes('manager') || normalized.includes('head') || normalized.includes('lead')) return 'manager';
  return 'employee';
};

const templateMatchesOnboardingCategory = (
  template: ChecklistTemplate,
  category: OnboardingChecklistCategory
): boolean => {
  const normalized = template.name.toLowerCase();
  if (category === 'hr') return normalized.includes('hr') || normalized.includes('human resources');
  if (category === 'manager') return normalized.includes('manager');
  if (category === 'intern') return normalized.includes('intern') || normalized.includes('trainee');
  return normalized.includes('employee');
};

const ONBOARDING_POSITION_TYPES: { category: OnboardingChecklistCategory; label: string }[] = [
  { category: 'hr', label: 'HR' },
  { category: 'manager', label: 'Manager' },
  { category: 'employee', label: 'Employee' },
  { category: 'intern', label: 'Intern' }
];

const findPositionForOnboardingCategory = <T extends { name: string; status: string }>(
  category: OnboardingChecklistCategory,
  positions: T[]
): T | null => {
  const active = positions.filter(position => position.status === 'active');
  const matches = (pattern: RegExp) => active.find(position => pattern.test(position.name));

  if (category === 'hr') return matches(/\bhr\b|human resources/i) ?? null;
  if (category === 'intern') return matches(/intern|trainee/i) ?? null;
  if (category === 'manager') return active.find(position => {
    const name = position.name.toLowerCase();
    return /(manager|head|lead)/i.test(position.name) && !name.includes('hr') && !name.includes('human resources');
  }) ?? null;

  return active.find(position => {
    const name = position.name.toLowerCase();
    return !/(ceo|cto|cfo|chief|manager|head|lead|hr|human resources|intern|trainee)/i.test(name);
  }) ?? null;
};

const uniqueTemplates = (templates: ChecklistTemplate[]) => templates.filter((template, index, list) =>
  list.findIndex(item => item.id === template.id) === index
);

function getPositionBasedOnboardingTemplates(
  position: { id: string; name: string; departmentId: string } | null,
  templates: ChecklistTemplate[]
): ChecklistTemplate[] {
  const active = templates.filter(template => template.type === 'onboarding' && template.status === 'active');
  if (!position) return active;

  const exactMatches = active.filter(template =>
    (template.appliesTo === 'position' && template.positionIds.includes(position.id)) ||
    (template.appliesTo === 'department' && template.departmentIds.includes(position.departmentId))
  );
  const category = onboardingCategoryForPosition(position.name);
  const categoryMatches = active.filter(template =>
    template.appliesTo === 'company' && templateMatchesOnboardingCategory(template, category)
  );
  const matchedTemplates = uniqueTemplates([...exactMatches, ...categoryMatches]);
  if (matchedTemplates.length > 0) return matchedTemplates;

  return active.filter(template =>
    template.appliesTo === 'company' && templateMatchesOnboardingCategory(template, 'employee')
  );
}

function findMatchingOnboardingTemplate(
  positionId: string,
  departmentId: string,
  positionName: string,
  templates: ChecklistTemplate[]
): ChecklistTemplate | null {
  return getPositionBasedOnboardingTemplates({ id: positionId, departmentId, name: positionName }, templates)[0] ?? null;
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
  gender: ''
});

interface AddEmployeeWizardProps {
  onClose: () => void;
}

export const AddEmployeeWizard: React.FC<AddEmployeeWizardProps> = ({ onClose }) => {
  const { positions, assignments, employees, completeEmployeeOnboarding } = useOrganizationStore();
  const { addInboxItem } = useInbox();
  const { generateTasksForEmployee } = useChecklistTaskStore();
  const { templates } = useChecklistTemplateStore();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EmployeeOnboardingValues>(EMPTY_VALUES());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string } | null>(null);
  const [checklistTemplateId, setChecklistTemplateId] = useState('ct-onboarding-employee');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [taskDueTime, setTaskDueTime] = useState('17:00');
  const [notificationId] = useState(() => 'onboarding-documents-' + Date.now());


  const onboardingPositionOptions = useMemo(
    () => ONBOARDING_POSITION_TYPES.map(option => ({
      ...option,
      position: findPositionForOnboardingCategory(option.category, positions)
    })),
    [positions]
  );
  const selectedPosition = useMemo(
    () => positions.find(p => p.id === values.positionId) ?? null,
    [positions, values.positionId]
  );

  const positionPreview = useMemo(() => {
    if (!selectedPosition) return null;
        const parentPosition = selectedPosition.reportsToPositionId
      ? positions.find(p => p.id === selectedPosition.reportsToPositionId) ?? null
      : null;
    const rm = getReportingManagerPreviewForPosition(selectedPosition, positions, assignments, employees);
    const rmUnresolved = !rm.label || rm.label === '--';
    const accessRoles = getSuggestedRolesForPosition(selectedPosition.id);
    const matchingTemplate = findMatchingOnboardingTemplate(
      selectedPosition.id,
      selectedPosition.departmentId,
      selectedPosition.name,
      templates
    );
    return {
      positionName: selectedPosition.name,
      reportsToName: parentPosition?.name ?? null,
      reportingManager: rm.label,
      rmUnresolved,
      accessRoles,
      matchingTemplate,
    };
  }, [selectedPosition, positions, assignments, employees, templates]);


  const managerOptions = useMemo(() => {
    if (!selectedPosition) return [];
    const selectedDepartment = selectedPosition.departmentId;
    const parentAssignment = selectedPosition.reportsToPositionId
      ? assignments.find(item => item.positionId === selectedPosition.reportsToPositionId && item.status === 'active')
      : undefined;
    const parentManagerId = parentAssignment?.employeeId;

    return employees.filter(employee => {
      if (employee.id === parentManagerId) return true;
      const assignment = assignments.find(item => item.employeeId === employee.id && item.status === 'active');
      const position = positions.find(item => item.id === assignment?.positionId);
      if (!position) return false;
      const isPeopleOwner = /manager|head|chief|hr|human resources|lead|cto|ceo/i.test(position.name);
      const isRelevantArea = position.departmentId === selectedDepartment || /hr|human resources/i.test(position.name);
      return isPeopleOwner && isRelevantArea;
    });
  }, [employees, assignments, positions, selectedPosition]);

  const checklistOptions = useMemo(
    () => getPositionBasedOnboardingTemplates(selectedPosition, templates),
    [templates, selectedPosition]
  );

  const selectedManager = managerOptions.find(manager => manager.id === reportingManagerId);
  const selectedChecklist = templates.find(template => template.id === checklistTemplateId);


  const handlePositionChange = (positionId: string) => {
    const position = positions.find(item => item.id === positionId) ?? null;
    const preferred = getPositionBasedOnboardingTemplates(position, templates)[0]?.id ?? '';
    const roles = positionId ? getSuggestedRolesForPosition(positionId) : [];
    setValues(current => ({ ...current, positionId, confirmedRoleIds: roles.map(role => role.id) }));
    setChecklistTemplateId(preferred);
    setReportingManagerId('');
  };

  const validateStep1 = (): string | null => {
    if (!values.firstName.trim() || !values.lastName.trim()) return 'First and last name are required.';
    if (!values.email.trim()) return 'Email address is required.';
    if (!values.startDate) return 'Start date is required.';
    if (!values.workEmail?.trim()) return 'Work email is required.';
    if (!reportingManagerId) return 'Reporting Manager is required.';
    if (!checklistTemplateId) return 'Onboarding checklist is required.';
    if (!taskDueDate || !taskDueTime) return 'Task due date and time are required.';
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
      recipientId: reportingManagerId,
      category: 'warning',
      title: 'New employee document collection task',
      message: `${employeeName} (${values.employeeNumber}) requires: ${documents}. Due ${taskDueDate} at ${taskDueTime}. Email notification sent to ${selectedManager?.email ?? 'the reporting manager'}.`,
      timeLabel: 'Just now',
      filter: 'new',
      actions: [{ id: 'view-task', label: 'View task', variant: 'primary' }]
    });
    addInboxItem({
      id: `ceo-onboarding-${notificationId}-${result.employeeId}`,
      recipientId: 'marcus',
      category: 'approval',
      title: 'Employee onboarding started',
      message: `${employeeName} (${values.employeeNumber}) was onboarded as ${selectedPosition?.name ?? 'an employee'}. ${managerName} owns document collection due ${taskDueDate} at ${taskDueTime}.`,
      timeLabel: 'Just now',
      filter: 'new',
      actions: []
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
              <h3>Employee onboarding started</h3>
              <p>
                An invitation has been sent to <strong>{done.email}</strong>. The employee status is
                set to <strong>Onboarding</strong> and document collection tasks have been assigned.
              </p>
              <div className="add-employee-wizard__done-summary">
                <div><span>Checklist</span><strong>{selectedChecklist?.name ?? 'Onboarding checklist'}</strong></div>
                <div><span>Reporting Manager</span><strong>{selectedManager ? `${selectedManager.firstName} ${selectedManager.lastName}` : 'Reporting Manager'}</strong></div>
                <div><span>Due</span><strong>{taskDueDate} at {taskDueTime}</strong></div>
                <div><span>Notifications</span><strong>In-app + email + calendar reminder</strong></div>
              </div>
            </div>
          ) : step === 0 ? (
            <>
              <div className="emp-form-section">
                <h3 className="emp-form-section__title">About Me</h3>
                <p className="emp-form-hint">
                  Chief Executive Officer onboarding fields only. Employee-only profile fields are completed later from the employee profile.
                </p>
                <div className="org-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={values.email}
                    onChange={e => setValues(v => ({ ...v, email: e.target.value }))}
                    required
                  />
                </div>
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
<<<<<<< HEAD
                <div className="org-form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={values.email}
                    onChange={e => setValues(v => ({ ...v, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="org-form-field">
                  <label>Gender</label>
                  <select
                    value={values.gender}
                    onChange={e => setValues(v => ({ ...v, gender: e.target.value as any }))}
                  >
                    <option value="">Select gender…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
                <div className="emp-form-section">
                <h3 className="emp-form-section__title">Contact Details</h3>
                <div className="org-form-field">
                  <label>Work Email</label>
                  <input type="email" value={values.workEmail ?? ''} onChange={e => setValues(v => ({ ...v, workEmail: e.target.value }))} required />
=======
                <div className="org-form-field add-employee-position-field">
                  <label>Position</label>
                  <select value={values.positionId} onChange={event => handlePositionChange(event.target.value)}>
                    <option value="">Select onboarding position type...</option>
                    {onboardingPositionOptions.map(option => (
                      <option
                        key={option.category}
                        value={option.position?.id ?? `missing-${option.category}`}
                        disabled={!option.position}
                      >
                        {option.label}{option.position ? ` - ${option.position.name}` : ' - not configured in Org'}
                      </option>
                    ))}
                  </select>
                  <p className="emp-form-hint">
                    Only onboarding role types are shown here. The selected type is linked to the matching Org position.
                  </p>
>>>>>>> 8dd1fd6 (Updated offboarding changes)
                </div>
                <div className="org-form-field">
                  <label>Employee Number</label>
                  <input
                    value={values.employeeNumber}
                    readOnly
                    aria-readonly="true"
                    title="Automatically generated"
                  />
                </div>
                <div className="org-form-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={values.startDate}
                    onChange={e => setValues(v => ({ ...v, startDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="emp-form-section">
                <h3 className="emp-form-section__title">Contact Details</h3>
                <div className="org-form-field">
                  <label>Work Email</label>
                  <input
                    type="email"
                    value={values.workEmail ?? ''}
                    onChange={e => setValues(v => ({ ...v, workEmail: e.target.value }))}
                    required
                  />
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
                  <label>Task</label>
                  <select value={checklistTemplateId} onChange={event => setChecklistTemplateId(event.target.value)} disabled={!values.positionId}>
                    <option value="">Select onboarding checklist</option>
                    {checklistOptions.map(template => (
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
