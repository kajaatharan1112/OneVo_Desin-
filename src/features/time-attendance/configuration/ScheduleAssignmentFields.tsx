import React from 'react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { LeaveScopeMultiSelect } from '../../leave/configuration/LeaveScopeMultiSelect';
import type { AssignmentTarget } from './schedulesConfigTypes';

interface ScheduleAssignmentFieldsProps {
  assignmentTarget: AssignmentTarget;
  departmentIds: string[];
  employeeIds: string[];
  onTargetChange: (target: AssignmentTarget) => void;
  onDepartmentIdsChange: (ids: string[]) => void;
  onEmployeeIdsChange: (ids: string[]) => void;
}

export const ScheduleAssignmentFields: React.FC<ScheduleAssignmentFieldsProps> = ({
  assignmentTarget,
  departmentIds,
  employeeIds,
  onTargetChange,
  onDepartmentIdsChange,
  onEmployeeIdsChange
}) => {
  const { departments, employees } = useOrganizationStore();

  return (
    <div className="schedules-cfg-form-section">
      <label className="schedules-cfg-form-section__label">Assign schedule to</label>
      <div className="leave-cfg-segmented">
        {(['company', 'department', 'employee'] as AssignmentTarget[]).map(target => (
          <button
            key={target}
            type="button"
            className={`leave-cfg-segmented__btn${assignmentTarget === target ? ' leave-cfg-segmented__btn--active' : ''}`}
            onClick={() => onTargetChange(target)}
          >
            {target === 'company' ? 'Company' : target === 'department' ? 'Department' : 'Employee'}
          </button>
        ))}
      </div>

      {assignmentTarget === 'department' && (
        <LeaveScopeMultiSelect
          label="Departments"
          options={departments
            .filter(d => d.status === 'active')
            .map(d => ({ id: d.id, name: d.name }))}
          selectedIds={departmentIds}
          onChange={onDepartmentIdsChange}
          placeholder="Search departments…"
        />
      )}

      {assignmentTarget === 'employee' && (
        <LeaveScopeMultiSelect
          label="Employees"
          options={employees
            .filter(e => e.status === 'active')
            .map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))}
          selectedIds={employeeIds}
          onChange={onEmployeeIdsChange}
          placeholder="Search employees…"
        />
      )}
    </div>
  );
};
