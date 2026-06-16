import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { OrgToast } from '../../organization/components/OrgToast';
import { useEmployeeProfileStore } from './employeeProfileStore';
import type { ProfileTab } from './employeeProfileTypes';
import { EmployeeProfileModals } from './EmployeeProfileModals';
import {
  AboutTab,
  ActivityTab,
  DocumentsTab,
  EmploymentTab,
  OverridesTab
} from './ProfileTabPanels';
import {
  employeeFullName,
  employeeInitials,
  employeeStatusLabel,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';
import { workModeBadgeClass, workModeLabel } from './workModeUtils';

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'employment', label: 'Employment' },
  { id: 'overrides', label: 'Overrides' },
  { id: 'documents', label: 'Documents' },
  { id: 'activity', label: 'Activity' }
];

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
  const { activeTab, setActiveTab, openModal } = useEmployeeProfileStore();
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    setActiveTab('about');
  }, [employeeId, setActiveTab]);

  const handleCopyEmail = async () => {
    if (!employee?.email) return;
    try {
      await navigator.clipboard.writeText(employee.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (!employee) {
    return (
      <div className="cfg-page emp-record-page">
        <button type="button" className="emp-record-back" onClick={() => navigate('/people/employees')}>
          <ArrowLeft size={14} /> Back to Employees
        </button>
        <p className="emp-record-empty">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="cfg-page emp-record-page">
      <div className="emp-record-hero">
        <div className="emp-record-hero__banner" aria-hidden />
        <div className="emp-record-hero__body">
          <button type="button" className="emp-record-back" onClick={() => navigate('/people/employees')}>
            <ArrowLeft size={14} /> Back to Employees
          </button>

          <div className="emp-record-hero__row">
            <div className="emp-record-hero__identity">
              <div className="emp-record-avatar" aria-hidden>{employeeInitials(employee)}</div>
              <div>
                <h1 className="emp-record-hero__name">{employeeFullName(employee)}</h1>
                <div className="emp-record-hero__email-row">
                  <span className="emp-record-hero__email">{employee.email}</span>
                  <button
                    type="button"
                    className="emp-record-copy-btn"
                    onClick={handleCopyEmail}
                    aria-label="Copy email"
                    title={copied ? 'Copied' : 'Copy email'}
                  >
                    <Copy size={13} />
                  </button>
                </div>
                <div className="emp-record-hero__meta">
                  <span className={`cfg-badge cfg-badge--${employee.status === 'active' ? 'active' : 'inactive'}`}>
                    {employeeStatusLabel(employee.status)}
                  </span>
                  <span>{employment?.positionName}</span>
                  <span className="emp-record-hero__sep">·</span>
                  <span>{employment?.departmentName}</span>
                  {employee.workMode && (
                    <>
                      <span className="emp-record-hero__sep">·</span>
                      <span className={`emp-work-mode-badge ${workModeBadgeClass(employee.workMode)}`}>
                        {workModeLabel(employee.workMode)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="emp-record-hero__actions">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => openModal('edit-profile')}>
                Edit Profile
              </button>
              <button type="button" className="org-btn org-btn--secondary" onClick={() => openModal('promotion')}>
                Promote
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
      </div>

      <div className="emp-record-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`emp-record-tabs__btn${activeTab === tab.id ? ' emp-record-tabs__btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="emp-record-content">
        {activeTab === 'about' && (
          <AboutTab
            employee={employee}
            onEditProfile={() => openModal('edit-profile')}
            onEditEmployment={() => setActiveTab('employment')}
          />
        )}
        {activeTab === 'employment' && (
          <EmploymentTab
            employee={employee}
            onPromote={() => openModal('promotion')}
            onTransfer={() => openModal('transfer')}
            onOffboarding={() => openModal('offboarding')}
          />
        )}
        {activeTab === 'overrides' && (
          <OverridesTab employee={employee} onManageClockInPolicy={() => navigate('/')} />
        )}
        {activeTab === 'documents' && <DocumentsTab employee={employee} />}
        {activeTab === 'activity' && <ActivityTab employee={employee} />}
      </div>

      <EmployeeProfileModals employee={employee} />
      <OrgToast />
      <ProfileToast />
    </div>
  );
};
