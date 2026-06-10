import React from 'react';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';
import type { EmployeeId } from '../../../features/employees/types/employee.types';

interface EmployeeSwitcherProps {
  collapsed?: boolean;
}

export const EmployeeSwitcher: React.FC<EmployeeSwitcherProps> = ({ collapsed = false }) => {
  const { employees, selectedEmployeeId, setSelectedEmployeeId } = useEmployeeContext();

  const handleSelect = (id: EmployeeId) => {
    if (id !== selectedEmployeeId) {
      setSelectedEmployeeId(id);
    }
  };

  return (
    <div
      className={`employee-switcher${collapsed ? ' employee-switcher--collapsed' : ''}`}
      role="group"
      aria-label="Switch employee profile"
    >
      {!collapsed && <span className="employee-switcher__label">Switch profile</span>}

      <div className="employee-switcher__options">
        {employees.map((employee) => {
          const isActive = employee.id === selectedEmployeeId;

          return (
            <button
              key={employee.id}
              type="button"
              className={`employee-switcher__option${isActive ? ' employee-switcher__option--active' : ''}`}
              onClick={() => handleSelect(employee.id)}
              aria-pressed={isActive}
              title={`${employee.name} — ${employee.role}`}
            >
              <img
                src={employee.avatarUrl}
                alt=""
                aria-hidden="true"
                className="employee-switcher__avatar"
              />
              {!collapsed && (
                <span className="employee-switcher__option-text">
                  <span className="employee-switcher__name">{employee.name}</span>
                  <span className="employee-switcher__role">{employee.role}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
