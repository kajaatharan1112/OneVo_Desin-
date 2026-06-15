import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { OrgToast } from '../../organization/components/OrgToast';
import { useEmployeeProfileStore } from './employeeProfileStore';
import { EmployeeProfileModals } from './EmployeeProfileModals';
import {
  ActivitySection,
  DocumentsSection,
  EmploymentDetailsSection,
  PersonalInfoSection,
  PolicyAccessSidebar
} from './ProfileTabPanels';
import {
  employeeFullName,
  employeeStatusLabel,
  employmentTypeLabel,
  formatProfileDate,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';
import { workModeBadgeClass, workModeLabel } from './workModeUtils';

const ProfileToast: React.FC = () => {
  const { toast, clearToast } = useEmployeeProfileStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);
  if (!toast) return null;
  return (
    <div className="schedules-cfg-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">×</button>
    </div>
  );
};

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employees, positions, departments, assignments } = useOrganizationStore();
  const { openModal } = useEmployeeProfileStore();

  const employee = employees.find(e => e.id === employeeId);

  const employment = useMemo(() => {
    if (!employee) return null;
    return getEmployeeEmploymentContext(
      employee.id,
      positions,
      departments,
      assignments,
      employees
    );
  }, [employee, positions, departments, assignments, employees]);

  if (!employee) {
    return (
      <div className="cfg-page emp-mgmt-page">
        <button
          type="button"
          className="emp-mgmt-back"
          onClick={() => navigate('/people/employees')}
          aria-label="Back to Employees"
        >
          <ArrowLeft size={16} />
        </button>
        <p className="emp-mgmt-empty">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="cfg-page emp-mgmt-page">
      <div className="emp-mgmt-topbar">
        <button
          type="button"
          className="emp-mgmt-back"
          onClick={() => navigate('/people/employees')}
          aria-label="Back to Employees"
        >
          <ArrowLeft size={16} />
          <span className="emp-mgmt-back__label">Back to Employees</span>
        </button>
        <div className="emp-mgmt-header">
          <div className="emp-mgmt-header__main">
            <h1 className="emp-mgmt-header__name">{employeeFullName(employee)}</h1>
            <p className="emp-mgmt-header__email">{employee.email}</p>
            <div className="emp-mgmt-header__meta">
              <span className={`cfg-badge cfg-badge--${employee.status === 'active' ? 'active' : 'inactive'}`}>
                {employeeStatusLabel(employee.status)}
              </span>
              <span>{employment?.positionName}</span>
              <span className="emp-mgmt-header__sep">·</span>
              <span>{employment?.departmentName}</span>
              {employee.workMode && (
                <>
                  <span className="emp-mgmt-header__sep">·</span>
                  <span className={`emp-work-mode-badge ${workModeBadgeClass(employee.workMode)}`}>
                    {workModeLabel(employee.workMode)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="emp-mgmt-header__actions">
            <button type="button" className="org-btn org-btn--secondary" onClick={() => openModal('edit-profile')}>
              Edit Profile
            </button>
            <button type="button" className="org-btn org-btn--secondary" onClick={() => openModal('transfer')}>
              Transfer
            </button>
            <button type="button" className="org-btn org-btn--secondary" onClick={() => openModal('offboarding')}>
              Start Offboarding
            </button>
          </div>
        </div>
      </div>

      <div className="emp-mgmt-summary">
        <div className="emp-mgmt-summary__item">
          <span className="emp-mgmt-summary__label">Position</span>
          <span className="emp-mgmt-summary__value">{employment?.positionName ?? '—'}</span>
        </div>
        <div className="emp-mgmt-summary__item">
          <span className="emp-mgmt-summary__label">Department</span>
          <span className="emp-mgmt-summary__value">{employment?.departmentName ?? '—'}</span>
        </div>
        <div className="emp-mgmt-summary__item">
          <span className="emp-mgmt-summary__label">Reporting Manager</span>
          <span className="emp-mgmt-summary__value">{employment?.reportingManager ?? '—'}</span>
        </div>
        <div className="emp-mgmt-summary__item">
          <span className="emp-mgmt-summary__label">Employment Type</span>
          <span className="emp-mgmt-summary__value">{employmentTypeLabel(employee.employmentType)}</span>
        </div>
        <div className="emp-mgmt-summary__item">
          <span className="emp-mgmt-summary__label">Start Date</span>
          <span className="emp-mgmt-summary__value">{formatProfileDate(employee.startDate)}</span>
        </div>
        <div className="emp-mgmt-summary__item">
          <span className="emp-mgmt-summary__label">Work Mode</span>
          <span className="emp-mgmt-summary__value">
            {employee.workMode ? (
              <span className={`emp-work-mode-badge ${workModeBadgeClass(employee.workMode)}`}>
                {workModeLabel(employee.workMode)}
              </span>
            ) : '—'}
          </span>
        </div>
      </div>

      <div className="emp-mgmt-layout">
        <div className="emp-mgmt-main">
          <PersonalInfoSection employee={employee} />
          <EmploymentDetailsSection employee={employee} />
          <DocumentsSection employee={employee} />
          <ActivitySection employee={employee} />
        </div>
        <PolicyAccessSidebar
          employee={employee}
          onTransfer={() => openModal('transfer')}
          onOffboarding={() => openModal('offboarding')}
          onManageClockInPolicy={() => navigate('/')}
        />
      </div>

      <EmployeeProfileModals employee={employee} />
      <OrgToast />
      <ProfileToast />
    </div>
  );
};
