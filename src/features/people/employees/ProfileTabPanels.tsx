import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Edit, Eye, FileText, Trash2, Upload, X } from 'lucide-react';
import type { Employee, EmploymentType, WorkMode } from '../../../types/organization';
import type { EmployeeDocument } from './employeeProfileTypes';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useClockInPolicyStore } from '../../time-attendance/clock-in-policy/clockInPolicyStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { SEED_WORK_SCHEDULES } from '../../time-attendance/configuration/schedulesConfigMockData';
import { useEmployeeProfileStore } from './employeeProfileStore';
import { resolveClockInRequirement } from './employeeClockInUtils';
import {
  employeeStatusLabel,
  employmentTypeLabel,
  formatProfileDate,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';
import { workModeBadgeClass, workModeLabel } from './workModeUtils';
import { WORK_MODE_OPTIONS } from './workModeUtils';
import { getEmployeeActiveAssignment } from '../../../utils/organizationUtils';
import { defaultActivityForEmployee } from './employeeProfileMockData';

const Dash: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span className="emp-record-value">{children ?? '--'}</span>
);

const RecordCard: React.FC<{
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}> = ({ title, onEdit, children }) => (
  <section className="emp-record-card">
    <div className="emp-record-card__head">
      <h2 className="emp-record-card__title">{title}</h2>
      {onEdit && (
        <button type="button" className="emp-record-edit-btn" onClick={onEdit}>
          <Edit size={13} /> Edit
        </button>
      )}
    </div>
    {children}
  </section>
);

const FieldGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="emp-record-grid">{children}</div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="emp-record-field">
    <span className="emp-record-field__label">{label}</span>
    <div className="emp-record-field__value">{children}</div>
  </div>
);

export const AboutTab: React.FC<{
  employee: Employee;
  onEditProfile: () => void;
  onEditEmployment: () => void;
}> = ({ employee, onEditProfile, onEditEmployment }) => {
  const { positions, departments, assignments, employees } = useOrganizationStore();
  const { getTasksForEmployee, setTaskStatus } = useChecklistTaskStore();
  const employment = useMemo(
    () => getEmployeeEmploymentContext(employee.id, positions, departments, assignments, employees),
    [employee.id, positions, departments, assignments, employees]
  );
  const tasks = getTasksForEmployee(employee.id);

  return (
    <div className="emp-record-tab">
      <RecordCard title="About employee" onEdit={onEditProfile}>
        <FieldGrid>
          <Field label="First name"><Dash>{employee.firstName}</Dash></Field>
          <Field label="Last name"><Dash>{employee.lastName}</Dash></Field>
          <Field label="Email address"><Dash>{employee.email}</Dash></Field>
          <Field label="Phone number"><Dash>{employee.phone}</Dash></Field>
          <Field label="Employee ID"><Dash>{employee.id}</Dash></Field>
          <Field label="Status">
            <span className={`cfg-badge cfg-badge--${employee.status === 'active' ? 'active' : 'inactive'}`}>
              {employeeStatusLabel(employee.status)}
            </span>
          </Field>
          <Field label="Work mode">
            {employee.workMode ? (
              <span className={`emp-work-mode-badge ${workModeBadgeClass(employee.workMode)}`}>
                {workModeLabel(employee.workMode)}
              </span>
            ) : <Dash />}
          </Field>
        </FieldGrid>
      </RecordCard>

      <RecordCard title="Employment status" onEdit={onEditEmployment}>
        <FieldGrid>
          <Field label="Position"><Dash>{employment.positionName}</Dash></Field>
          <Field label="Department"><Dash>{employment.departmentName}</Dash></Field>
          <Field label="Reporting manager"><Dash>{employment.reportingManager}</Dash></Field>
          <Field label="Employment type"><Dash>{employmentTypeLabel(employee.employmentType)}</Dash></Field>
          <Field label="Start date"><Dash>{formatProfileDate(employee.startDate)}</Dash></Field>
        </FieldGrid>
      </RecordCard>

      <RecordCard title="Contact / Bank details">
        <FieldGrid>
          <Field label="Bank account number"><Dash /></Field>
          <Field label="Bank account country"><Dash /></Field>
          <Field label="Note"><Dash /></Field>
        </FieldGrid>
      </RecordCard>

      {tasks.length > 0 && (
        <RecordCard title={tasks[0].templateType === 'onboarding' ? 'Onboarding Checklist' : 'Offboarding Checklist'}>
          <ul className="emp-checklist-list">
            {tasks.map(task => (
              <li key={task.id} className="emp-checklist-item">
                <div className="cip-toggle-row">
                  <span className={task.status === 'completed' ? 'emp-checklist-item__title--done' : ''}>{task.title}</span>
                  <select
                    className={`emp-checklist-status emp-checklist-status--${task.status}`}
                    value={task.status}
                    aria-label={`Status for ${task.title}`}
                    onChange={event => setTaskStatus(task.id, event.target.value as typeof task.status)}
                  >
                    <option value="todo">Todo</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <span className="emp-checklist-item__meta">
                  {task.assigneeLabel} - Due {formatProfileDate(task.dueDate)}
                  {task.requiredDocument && ` - Requires: ${task.requiredDocument}`}
                </span>
              </li>
            ))}
          </ul>
        </RecordCard>
      )}
    </div>
  );
};

export const EmploymentTab: React.FC<{
  employee: Employee;
  onPromote: () => void;
  onTransfer: () => void;
  onOffboarding: () => void;
}> = ({ employee, onPromote, onTransfer, onOffboarding }) => {
  const { positions, departments, assignments, employees, updateEmployeeEmployment } =
    useOrganizationStore();
  const employment = useMemo(
    () => getEmployeeEmploymentContext(employee.id, positions, departments, assignments, employees),
    [employee.id, positions, departments, assignments, employees]
  );

  const [values, setValues] = useState({
    positionId: getEmployeeActiveAssignment(employee.id, assignments)?.positionId ?? '',
    employmentType: employee.employmentType,
    startDate: employee.startDate,
    status: employee.status,
    workMode: employee.workMode ?? ('' as WorkMode | '')
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues({
      positionId: getEmployeeActiveAssignment(employee.id, assignments)?.positionId ?? '',
      employmentType: employee.employmentType,
      startDate: employee.startDate,
      status: employee.status,
      workMode: employee.workMode ?? ''
    });
  }, [employee, assignments]);

  const handleSave = () => {
    const result = updateEmployeeEmployment(employee.id, values);
    if (!result.ok) setError(result.error ?? 'Unable to save.');
    else setError(null);
  };

  const activePositions = positions.filter(p => p.status === 'active');

  return (
    <div className="emp-record-tab">
      <RecordCard title="Employment / Job Details">
        {error && <p className="schedules-cfg-form-error">{error}</p>}
        <div className="emp-record-form-grid">
          <div className="org-form-field">
            <label>Position</label>
            <select
              value={values.positionId}
              onChange={e => setValues(v => ({ ...v, positionId: e.target.value }))}
            >
              <option value="">Select position...</option>
              {activePositions.map(p => {
                const dept = departments.find(d => d.id === p.departmentId);
                return (
                  <option key={p.id} value={p.id}>
{p.name}{dept ? ` - ${dept.name}` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="org-form-field">
            <label>Department</label>
            <input readOnly className="settings-readonly" value={employment.departmentName} tabIndex={-1} />
          </div>
          <div className="org-form-field">
            <label>Reporting manager</label>
            <input readOnly className="settings-readonly" value={employment.reportingManager} tabIndex={-1} />
          </div>
          <div className="org-form-field">
            <label>Employment type</label>
            <select
              value={values.employmentType}
              onChange={e =>
                setValues(v => ({ ...v, employmentType: e.target.value as EmploymentType }))
              }
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div className="org-form-field">
            <label>Start date</label>
            <input
              type="date"
              value={values.startDate}
              onChange={e => setValues(v => ({ ...v, startDate: e.target.value }))}
            />
          </div>
          <div className="org-form-field">
            <label>Status</label>
            <select
              value={values.status}
              onChange={e =>
                setValues(v => ({ ...v, status: e.target.value as Employee['status'] }))
              }
            >
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="org-form-field emp-record-form-grid__full">
            <label>Work mode</label>
            <select
              value={values.workMode}
              onChange={e => setValues(v => ({ ...v, workMode: e.target.value as WorkMode | '' }))}
            >
              <option value="">Select work mode...</option>
              {WORK_MODE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="emp-form-hint">
              Used by Clock-in Policy to determine allowed clock-in methods.
            </p>
          </div>
        </div>
        <div className="emp-record-actions">
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Changes
          </button>
          <button type="button" className="org-btn org-btn--secondary" onClick={onPromote}>
            Promote Employee
          </button>
          <button type="button" className="org-btn org-btn--secondary" onClick={onTransfer}>
            Transfer Employee
          </button>
          <button type="button" className="org-btn org-btn--secondary" onClick={onOffboarding}>
            Start Offboarding
          </button>
        </div>
      </RecordCard>
    </div>
  );
};

export const OverridesTab: React.FC<{
  employee: Employee;
  onManageClockInPolicy?: () => void;
}> = ({ employee, onManageClockInPolicy }) => {
  const profile = useEmployeeProfileStore();
  const { policies } = useLeaveConfigStore();
  const { defaultRequirement, exemptions } = useClockInPolicyStore();
  const { positions, assignments } = useOrganizationStore();
  const defaultSchedule = SEED_WORK_SCHEDULES.find(s => s.isDefault);
  const defaultPolicy = policies.find(p => p.appliesTo === 'company') ?? policies[0];

  const roleOverrides = profile.getRoleOverrides(employee.id);
  const leaveOverrides = profile.getLeaveOverrides(employee.id);
  const scheduleOverrides = profile.getScheduleOverrides(employee.id);

  const clockIn = resolveClockInRequirement(
    employee,
    positions,
    assignments,
    exemptions,
    defaultRequirement
  );

  return (
    <div className="emp-record-tab">
      <section className="emp-record-override-card">
        <div className="emp-record-override-card__main">
          <h3 className="emp-record-override-card__title">Role override</h3>
          <p className="emp-record-override-card__value">
            {roleOverrides.length
              ? roleOverrides.map(o => o.roleName).join(', ')
              : 'Position-derived access'}
          </p>
          <p className="emp-record-override-card__source">
            {roleOverrides.length ? 'Override active' : 'Default'}
          </p>
          {roleOverrides.map(o => (
            <div key={o.id} className="emp-record-override-item">
              <span>{o.roleName}</span>
              <button type="button" className="cip-icon-btn cip-icon-btn--danger" onClick={() => profile.removeRoleOverride(o.id)} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => profile.openModal('role-override')}>
          Add Role Override
        </button>
      </section>

      <section className="emp-record-override-card">
        <div className="emp-record-override-card__main">
          <h3 className="emp-record-override-card__title">Leave policy override</h3>
          <p className="emp-record-override-card__value">
            {leaveOverrides.length
              ? leaveOverrides.map(o => o.policyName).join(', ')
              : defaultPolicy?.name ?? 'Company leave policy'}
          </p>
          <p className="emp-record-override-card__source">
            {leaveOverrides.length ? 'Override active' : 'Default'}
          </p>
          {leaveOverrides.map(o => (
            <div key={o.id} className="emp-record-override-item">
              <span>{o.policyName}</span>
              <button type="button" className="cip-icon-btn cip-icon-btn--danger" onClick={() => profile.removeLeaveOverride(o.id)} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => profile.openModal('leave-override')}>
          Add Leave Policy Override
        </button>
      </section>

      <section className="emp-record-override-card">
        <div className="emp-record-override-card__main">
          <h3 className="emp-record-override-card__title">Schedule / shift override</h3>
          <p className="emp-record-override-card__value">
            {scheduleOverrides.length
              ? scheduleOverrides.map(o => o.scheduleTitle).join(', ')
              : defaultSchedule?.title ?? 'Company work schedule'}
          </p>
          <p className="emp-record-override-card__source">
            {scheduleOverrides.length ? 'Override active' : 'Default'}
          </p>
          {scheduleOverrides.map(o => (
            <div key={o.id} className="emp-record-override-item">
              <span>{o.scheduleTitle}</span>
              <button type="button" className="cip-icon-btn cip-icon-btn--danger" onClick={() => profile.removeScheduleOverride(o.id)} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => profile.openModal('schedule-override')}>
          Add Schedule Override
        </button>
      </section>

      <section className="emp-record-override-card">
        <div className="emp-record-override-card__main">
          <h3 className="emp-record-override-card__title">Clock-in requirement</h3>
          <p className="emp-record-override-card__value">
            {clockIn.required ? 'Clock-in required' : 'Clock-in not required'}
          </p>
          <p className="emp-record-override-card__source">{clockIn.sourceLabel}</p>
        </div>
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={onManageClockInPolicy}>
          Manage in Clock-in Policy
        </button>
      </section>
    </div>
  );
};

export const DocumentsTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  const profile = useEmployeeProfileStore();
  const docs = profile.getDocuments(employee.id);

  const [previewDocument, setPreviewDocument] = useState<EmployeeDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const type = file.type.includes('pdf') ? 'PDF' : file.type.startsWith('image/') ? 'Image' : 'General';
    profile.uploadDocument(employee.id, file.name, type, URL.createObjectURL(file), file.type);
    event.target.value = '';
  };

  return (
    <>
    <div className="emp-record-tab">
      <div className="emp-record-tab__toolbar">
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => fileInputRef.current?.click()}>
          <Upload size={13} /> Upload Document
        </button>
        <input ref={fileInputRef} hidden type="file" accept=".pdf,image/*,.doc,.docx" onChange={handleUpload} />
      </div>
      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr><td colSpan={5} className="emp-record-empty">No documents yet.</td></tr>
            ) : (
              docs.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{doc.type}</td>
                  <td><span className="cfg-badge cfg-badge--active">{doc.status}</span></td>
                  <td>{formatProfileDate(doc.date)}</td>
                  <td><button type="button" className="emp-document-view-btn" onClick={() => setPreviewDocument(doc)}><Eye size={14} /> View</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
      {previewDocument && (
        <div className="emp-document-preview-overlay" onMouseDown={() => setPreviewDocument(null)}>
          <section className="emp-document-preview" role="dialog" aria-modal="true" aria-labelledby="document-preview-title" onMouseDown={event => event.stopPropagation()}>
            <header><div><span>Document Preview</span><h2 id="document-preview-title">{previewDocument.name}</h2></div><button type="button" className="cfg-action-btn" aria-label="Close preview" onClick={() => setPreviewDocument(null)}><X size={17} /></button></header>
            <div className="emp-document-preview__body">
              {previewDocument.url && previewDocument.mimeType?.startsWith('image/') ? <img src={previewDocument.url} alt={previewDocument.name} /> : previewDocument.url ? <iframe src={previewDocument.url} title={previewDocument.name} /> : (
                <div className="emp-document-preview__paper"><FileText size={42} /><h3>{previewDocument.name}</h3><p>This is a generated HRMS document preview.</p><dl><div><dt>Employee</dt><dd>{employee.firstName} {employee.lastName}</dd></div><div><dt>Document type</dt><dd>{previewDocument.type}</dd></div><div><dt>Status</dt><dd>{previewDocument.status}</dd></div><div><dt>Date</dt><dd>{formatProfileDate(previewDocument.date)}</dd></div></dl></div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};
export const ActivityTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  const activity = useEmployeeProfileStore(s => s.activity);
  const entries = useMemo(() => {
    const filtered = activity.filter(a => a.employeeId === employee.id);
    if (filtered.length > 0) return [...filtered].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return defaultActivityForEmployee(employee.id, employee.startDate);
  }, [activity, employee.id, employee.startDate]);

  return (
    <div className="emp-record-tab">
      <ul className="emp-activity-timeline">
        {entries.map(entry => (
          <li key={entry.id} className="emp-activity-item">
            <div className="emp-activity-item__dot" aria-hidden />
            <div>
              <div className="emp-activity-item__label">{entry.label}</div>
              {entry.detail && <div className="emp-activity-item__detail">{entry.detail}</div>}
              <div className="emp-activity-item__time">{formatProfileDate(entry.occurredAt.slice(0, 10))}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
