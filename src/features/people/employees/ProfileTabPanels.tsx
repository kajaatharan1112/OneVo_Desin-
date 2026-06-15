import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { Employee, EmploymentType, WorkMode } from '../../../types/organization';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useClockInPolicyStore } from '../../time-attendance/clock-in-policy/clockInPolicyStore';
import { SEED_WORK_SCHEDULES } from '../../time-attendance/configuration/schedulesConfigMockData';
import { useEmployeeProfileStore } from './employeeProfileStore';
import { resolveClockInRequirement } from './employeeClockInUtils';
import {
  employeeFullName,
  employeeStatusLabel,
  formatProfileDate,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';
import { WORK_MODE_OPTIONS } from './workModeUtils';
import { getEmployeeActiveAssignment } from '../../../utils/organizationUtils';
import { defaultActivityForEmployee } from './employeeProfileMockData';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="emp-mgmt-field">
    <span className="emp-mgmt-field__label">{label}</span>
    <div className="emp-mgmt-field__value">{children}</div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  children,
  action
}) => (
  <section className="emp-mgmt-section">
    <div className="emp-mgmt-section__head">
      <h2 className="emp-mgmt-section__title">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export const PersonalInfoSection: React.FC<{ employee: Employee }> = ({ employee }) => (
  <Section title="Personal Information">
    <div className="emp-mgmt-fields">
      <Field label="Full Name">{employeeFullName(employee)}</Field>
      <Field label="Email">{employee.email}</Field>
      <Field label="Phone">{employee.phone ?? '—'}</Field>
      <Field label="Status">
        <span className={`cfg-badge cfg-badge--${employee.status === 'active' ? 'active' : 'inactive'}`}>
          {employeeStatusLabel(employee.status)}
        </span>
      </Field>
    </div>
  </Section>
);

export const EmploymentDetailsSection: React.FC<{ employee: Employee }> = ({ employee }) => {
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
    <Section title="Employment / Job Details">
      {error && <p className="schedules-cfg-form-error">{error}</p>}
      <div className="emp-mgmt-form-grid">
        <div className="org-form-field">
          <label>Position</label>
          <select
            value={values.positionId}
            onChange={e => setValues(v => ({ ...v, positionId: e.target.value }))}
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
          <label>Department</label>
          <input readOnly className="settings-readonly" value={employment.departmentName} tabIndex={-1} />
        </div>
        <div className="org-form-field">
          <label>Reporting Manager</label>
          <input readOnly className="settings-readonly" value={employment.reportingManager} tabIndex={-1} />
        </div>
        <div className="org-form-field">
          <label>Employment Type</label>
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
          <label>Start Date</label>
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
        <div className="org-form-field emp-mgmt-form-grid__full">
          <label>Work Mode</label>
          <select
            value={values.workMode}
            onChange={e => setValues(v => ({ ...v, workMode: e.target.value as WorkMode | '' }))}
          >
            <option value="">Select work mode…</option>
            {WORK_MODE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="emp-form-hint">
            Used by Clock-in Policy to determine allowed clock-in methods.
          </p>
        </div>
      </div>
      <div className="emp-mgmt-section__footer">
        <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </Section>
  );
};

export const DocumentsSection: React.FC<{ employee: Employee }> = ({ employee }) => {
  const profile = useEmployeeProfileStore();
  const docs = profile.getDocuments(employee.id);

  const handleUpload = () => {
    const name = window.prompt('Document name');
    if (!name?.trim()) return;
    const type = window.prompt('Document type', 'General') ?? 'General';
    profile.uploadDocument(employee.id, name.trim(), type);
  };

  return (
    <Section
      title="Documents"
      action={
        <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={handleUpload}>
          <Upload size={13} /> Upload Document
        </button>
      }
    >
      <div className="cfg-table-wrap">
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr><td colSpan={4} className="emp-mgmt-empty">No documents yet.</td></tr>
            ) : (
              docs.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{doc.type}</td>
                  <td><span className="cfg-badge cfg-badge--active">{doc.status}</span></td>
                  <td>{formatProfileDate(doc.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
};

export const ActivitySection: React.FC<{ employee: Employee }> = ({ employee }) => {
  const activity = useEmployeeProfileStore(s => s.activity);
  const entries = useMemo(() => {
    const filtered = activity.filter(a => a.employeeId === employee.id);
    if (filtered.length > 0) return [...filtered].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return defaultActivityForEmployee(employee.id, employee.startDate);
  }, [activity, employee.id, employee.startDate]);

  return (
    <Section title="Activity">
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
    </Section>
  );
};

interface PolicySidebarProps {
  employee: Employee;
  onTransfer: () => void;
  onOffboarding: () => void;
  onManageClockInPolicy?: () => void;
}

export const PolicyAccessSidebar: React.FC<PolicySidebarProps> = ({
  employee,
  onTransfer,
  onOffboarding,
  onManageClockInPolicy
}) => {
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
    <aside className="emp-mgmt-aside">
      <div className="emp-mgmt-aside-block">
        <h2 className="emp-mgmt-aside__title">Policy & Access Overrides</h2>

        <div className="emp-mgmt-override-row">
          <div className="emp-mgmt-override-row__body">
            <div className="emp-mgmt-override-row__label">Role override</div>
            <div className="emp-mgmt-override-row__state">
              <span className={`emp-mgmt-state-badge${roleOverrides.length ? ' emp-mgmt-state-badge--active' : ''}`}>
                {roleOverrides.length ? 'Override active' : 'Default'}
              </span>
            </div>
            <div className="emp-mgmt-override-row__value">
              {roleOverrides.length
                ? roleOverrides.map(o => o.roleName).join(', ')
                : 'Position-derived access'}
            </div>
            {roleOverrides.map(o => (
              <div key={o.id} className="emp-mgmt-override-item">
                <span>{o.roleName} · {o.scope.replace('-', ' ')}</span>
                <button type="button" className="cip-icon-btn cip-icon-btn--danger" onClick={() => profile.removeRoleOverride(o.id)} aria-label="Remove">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={() => profile.openModal('role-override')}>
            Add Role Override
          </button>
        </div>

        <div className="emp-mgmt-override-row">
          <div className="emp-mgmt-override-row__body">
            <div className="emp-mgmt-override-row__label">Leave policy override</div>
            <div className="emp-mgmt-override-row__state">
              <span className={`emp-mgmt-state-badge${leaveOverrides.length ? ' emp-mgmt-state-badge--active' : ''}`}>
                {leaveOverrides.length ? 'Override active' : 'Default'}
              </span>
            </div>
            <div className="emp-mgmt-override-row__value">
              {leaveOverrides.length
                ? leaveOverrides.map(o => o.policyName).join(', ')
                : defaultPolicy?.name ?? 'Company leave policy'}
            </div>
            {leaveOverrides.map(o => (
              <div key={o.id} className="emp-mgmt-override-item">
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
        </div>

        <div className="emp-mgmt-override-row">
          <div className="emp-mgmt-override-row__body">
            <div className="emp-mgmt-override-row__label">Schedule / shift override</div>
            <div className="emp-mgmt-override-row__state">
              <span className={`emp-mgmt-state-badge${scheduleOverrides.length ? ' emp-mgmt-state-badge--active' : ''}`}>
                {scheduleOverrides.length ? 'Override active' : 'Default'}
              </span>
            </div>
            <div className="emp-mgmt-override-row__value">
              {scheduleOverrides.length
                ? scheduleOverrides.map(o => o.scheduleTitle).join(', ')
                : defaultSchedule?.title ?? 'Company work schedule'}
            </div>
            {scheduleOverrides.map(o => (
              <div key={o.id} className="emp-mgmt-override-item">
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
        </div>
      </div>

      <div className="emp-mgmt-aside-block">
        <h2 className="emp-mgmt-aside__title">Clock-in Requirement</h2>
        <div className="emp-mgmt-aside-kv">
          <div className="emp-mgmt-aside-kv__row">
            <span className="emp-mgmt-aside-kv__label">Required</span>
            <span className="emp-mgmt-aside-kv__value">{clockIn.required ? 'Yes' : 'No'}</span>
          </div>
          <div className="emp-mgmt-aside-kv__row">
            <span className="emp-mgmt-aside-kv__label">Source</span>
            <span className="emp-mgmt-aside-kv__value">{clockIn.sourceLabel}</span>
          </div>
        </div>
        <button type="button" className="emp-profile-link-btn" onClick={onManageClockInPolicy}>
          Manage in Clock-in Policy →
        </button>
      </div>

      <div className="emp-mgmt-aside-block">
        <h2 className="emp-mgmt-aside__title">Employee Actions</h2>
        <div className="emp-mgmt-aside-actions">
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={onTransfer}>
            Transfer Employee
          </button>
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={onOffboarding}>
            Start Offboarding
          </button>
        </div>
      </div>
    </aside>
  );
};
