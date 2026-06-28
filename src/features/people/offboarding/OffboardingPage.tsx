import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Users } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { useChecklistTemplateStore } from '../../../store/checklistTemplateStore';
import { ConfigShellHeader } from '../../../shared/components/config-shell-header/ConfigShellHeader';
import { employeeFullName, employmentTypeLabel, getEmployeeEmploymentContext } from '../employees/employeeProfileUtils';
import { OrgToast } from '../../organization/components/OrgToast';

export const OffboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { employees, positions, departments, assignments } = useOrganizationStore();
  const tasks = useChecklistTaskStore(state => state.tasks);
  const templates = useChecklistTemplateStore(state => state.templates);
  const [search, setSearch] = useState('');

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees
      .filter(e => e.status === 'offboarding')
      .filter(e => {
        if (!q) return true;
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
        title="Offboarding"
        icon={<Users size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search offboarding employees...',
          label: 'Search offboarding employees'
        }}
      />

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Checklist</th>
                <th>Due Time</th>
                <th>Assignee</th>
                <th>Employment Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="cfg-table__empty">
                    No offboarding employees found.
                  </td>
                </tr>
              ) : filteredEmployees.map(employee => {
                const ctx = getEmployeeEmploymentContext(
                  employee.id, positions, departments, assignments, employees
                );
                const offboardingTasks = tasks.filter(task => task.employeeId === employee.id && task.templateType === 'offboarding');
                const firstTask = offboardingTasks[0];
                const checklistName = templates.find(template => template.id === firstTask?.templateId)?.name ?? 'Not assigned';

                return (
                  <tr key={employee.id}>
                    <td>
                      <div className="cfg-table__name">{employeeFullName(employee)}</div>
                      <div className="cfg-table__meta">{employee.email}</div>
                    </td>
                    <td>{ctx.positionName}</td>
                    <td>{ctx.departmentName}</td>
                    <td>{checklistName}</td>
                    <td>{firstTask ? `${firstTask.dueDate}${firstTask.dueTime ? ` at ${firstTask.dueTime}` : ''}` : '--'}</td>
                    <td>{firstTask?.assigneeLabel || '--'}</td>
                    <td>{employmentTypeLabel(employee.employmentType)}</td>
                    <td>
                      <span className={`cfg-badge ${statusBadgeClass(employee.status)}`}>
                        {employee.status === 'offboarding' ? 'Offboarding' : employee.status}
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

      <OrgToast />
    </div>
  );
};
