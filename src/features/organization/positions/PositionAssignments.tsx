import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import {
  getDepartmentName,
  getEmployeeById,
  getReportingManagerForEmployee
} from '../../../utils/organizationUtils';
import { AssignmentFormPanel } from './AssignmentFormPanel';

export const PositionAssignments: React.FC = () => {
  const {
    assignments,
    employees,
    positions,
    departments,
    assignmentForm,
    openAssignEmployee,
    closeAssignEmployee
  } = useOrganizationStore();

  const [positionFilter, setPositionFilter] = useState('');

  const activeAssignments = useMemo(
    () =>
      assignments
        .filter(a => a.status === 'active' && a.effectiveTo === null)
        .filter(a => !positionFilter || a.positionId === positionFilter),
    [assignments, positionFilter]
  );

  return (
    <div className="position-assignments">
      <div className="position-assignments__header">
        <p className="position-assignments__intro">
          Reporting managers are resolved from position hierarchy — never stored on the employee record.
        </p>
        <div className="position-assignments__controls">
          <select
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
            className="position-list__filter"
          >
            <option value="">All positions</option>
            {positions.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="org-btn org-btn--secondary"
            onClick={() => {
              const first = positions.find(p => p.status === 'active');
              if (first) openAssignEmployee(first.id);
            }}
          >
            <Plus size={15} />
            Assign Employee
          </button>
        </div>
      </div>

      <div className="position-assignments__table-wrap">
        <table className="position-assignments__table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
              <th>Effective from</th>
              <th>Reporting manager</th>
            </tr>
          </thead>
          <tbody>
            {activeAssignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="position-assignments__empty">
                  No active assignments. Assign an employee to a position to get started.
                </td>
              </tr>
            ) : (
              activeAssignments.map(assignment => {
                const employee = getEmployeeById(employees, assignment.employeeId);
                const position = positions.find(p => p.id === assignment.positionId);
                const rm = employee
                  ? getReportingManagerForEmployee(
                      employee.id,
                      positions,
                      assignments,
                      employees
                    )
                  : null;

                return (
                  <tr key={assignment.id}>
                    <td>
                      {employee
                        ? `${employee.firstName} ${employee.lastName}`
                        : assignment.employeeId}
                    </td>
                    <td>{employee?.email ?? '—'}</td>
                    <td>{position?.name ?? '—'}</td>
                    <td>
                      {position
                        ? getDepartmentName(position.departmentId, departments)
                        : '—'}
                    </td>
                    <td>{assignment.effectiveFrom}</td>
                    <td
                      className={
                        rm?.unresolved
                          ? 'position-assignments__unresolved'
                          : 'position-assignments__resolved'
                      }
                    >
                      {rm?.unresolved
                        ? rm.reason ?? 'Reporting manager unresolved'
                        : rm?.manager
                          ? `${rm.manager.firstName} ${rm.manager.lastName}`
                          : 'No reporting manager'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {assignmentForm.open && (
        <AssignmentFormPanel onClose={closeAssignEmployee} />
      )}
    </div>
  );
};
