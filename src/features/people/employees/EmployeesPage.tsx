import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { OrgToast } from '../../organization/components/OrgToast';
import { EmployeeFormPanel } from './EmployeeFormPanel';
import {
  employeeFullName,
  employeeStatusLabel,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    employees,
    positions,
    departments,
    assignments,
    employeeForm,
    openCreateEmployee,
    closeEmployeeForm
  } = useOrganizationStore();

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(e => {
      const name = employeeFullName(e).toLowerCase();
      const ctx = getEmployeeEmploymentContext(
        e.id,
        positions,
        departments,
        assignments,
        employees
      );
      return (
        name.includes(q) ||
        e.email.toLowerCase().includes(q) ||
        ctx.positionName.toLowerCase().includes(q) ||
        ctx.departmentName.toLowerCase().includes(q)
      );
    });
  }, [employees, search, positions, departments, assignments]);

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Employees</h1>
          <p className="cfg-page__subtitle">
            View and manage employee profiles, employment details, and work mode.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreateEmployee}>
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input
            placeholder="Search employees…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(employee => {
                const ctx = getEmployeeEmploymentContext(
                  employee.id,
                  positions,
                  departments,
                  assignments,
                  employees
                );
                return (
                  <tr
                    key={employee.id}
                    className="cfg-table__row--clickable"
                    onClick={() => navigate(`/people/employees/${employee.id}`)}
                  >
                    <td>
                      <div className="cfg-table__name">{employeeFullName(employee)}</div>
                      <div className="cfg-table__meta">{employee.email}</div>
                    </td>
                    <td>{ctx.positionName}</td>
                    <td>{ctx.departmentName}</td>
                    <td>
                      <span className={`cfg-badge cfg-badge--${employee.status === 'active' ? 'active' : 'inactive'}`}>
                        {employeeStatusLabel(employee.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {employeeForm.open && <EmployeeFormPanel onClose={closeEmployeeForm} />}
      <OrgToast />
    </div>
  );
};
