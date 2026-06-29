import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Users } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
 kaviz/offboarding

import { useBulkOnboardingStore } from '../../../store/bulkOnboardingStore';
 main
import { ConfigShellHeader } from '../../../shared/components/config-shell-header/ConfigShellHeader';
import { OrgToast } from '../../organization/components/OrgToast';
import { EmployeeFormPanel } from './EmployeeFormPanel';
import { AddEmployeeWizard } from './AddEmployeeWizard';
import {
  employeeFullName,
  employeeStatusLabel,
  employmentTypeLabel,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';

interface EmployeesPageProps {
  canAddEmployee?: boolean;
  canBulkOnboard?: boolean;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ canAddEmployee }) => {
  const navigate = useNavigate();
  const {
    employees,
    positions,
    departments,
    assignments,
    employeeForm,
    closeEmployeeForm
  } = useOrganizationStore();

  const [search, setSearch] = useState('');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(e => {
      const name = employeeFullName(e).toLowerCase();
      const ctx = getEmployeeEmploymentContext(e.id, positions, departments, assignments, employees);
      return (
        name.includes(q) ||
        e.email.toLowerCase().includes(q) ||
        ctx.positionName.toLowerCase().includes(q) ||
        ctx.departmentName.toLowerCase().includes(q)
      );
    });
  }, [employees, search, positions, departments, assignments]);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'cfg-badge--active';
      case 'onboarding': return 'cfg-badge--warning';
      case 'offboarding': return 'cfg-badge--warning';
      default: return 'cfg-badge--inactive';
    }
  };

  return (
    <div className="cfg-page">
      <ConfigShellHeader
        title="Employees"
        icon={<Users size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search employees...',
          label: 'Search employees'
        }}
        actions={canAddEmployee ? (
          <button type="button" className="org-btn org-btn--primary" onClick={() => setAddEmployeeOpen(true)}>
            <Plus size={14} /> New Employee
          </button>
        ) : null}
      />

   <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>   
 kaviz/offboarding

                <th>Department</th>
                <th>Reporting Manager</th>
 main
                <th>Employment Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(employee => {
                const ctx = getEmployeeEmploymentContext(
                  employee.id, positions, departments, assignments, employees
                );
                return (
                  <tr key={employee.id}>
                    <td>
                      <div className="cfg-table__name">{employeeFullName(employee)}</div>
                      <div className="cfg-table__meta">{employee.email}</div>
                    </td>
                    <td>{ctx.positionName}</td>
 kaviz/offboarding
                    <td>{ctx.departmentName}</td>
                    <td>{ctx.reportingManager}</td>
 main
                    <td>{employmentTypeLabel(employee.employmentType)}</td>
                    <td>
                      <span className={`cfg-badge ${statusBadgeClass(employee.status)}`}>
                        {employeeStatusLabel(employee.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="org-btn org-btn--ghost org-btn--xs"
                        onClick={() => navigate(`/people/employees/${employee.id}`)}
                        title="View employee"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {employeeForm.open && employeeForm.mode === 'edit' && <EmployeeFormPanel onClose={closeEmployeeForm} />}
      {addEmployeeOpen && <AddEmployeeWizard onClose={() => setAddEmployeeOpen(false)} />}
      <OrgToast />
    </div>
  );
};
