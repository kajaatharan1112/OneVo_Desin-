import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_EMPLOYEE_ID, employees, getEmployeeById } from '../data/employees.data';
import type { EmployeeId, EmployeeProfile } from '../types/employee.types';

interface EmployeeContextValue {
  selectedEmployeeId: EmployeeId;
  selectedEmployee: EmployeeProfile;
  employees: EmployeeProfile[];
  setSelectedEmployeeId: (id: EmployeeId) => void;
}

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

interface EmployeeProviderProps {
  selectedEmployeeId: EmployeeId;
  onSelectEmployee: (id: EmployeeId) => void;
  children: React.ReactNode;
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({
  selectedEmployeeId,
  onSelectEmployee,
  children
}) => {
  const value = useMemo(
    () => ({
      selectedEmployeeId,
      selectedEmployee: getEmployeeById(selectedEmployeeId),
      employees,
      setSelectedEmployeeId: onSelectEmployee
    }),
    [selectedEmployeeId, onSelectEmployee]
  );

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export function useEmployeeContext(): EmployeeContextValue {
  const context = useContext(EmployeeContext);

  if (!context) {
    return {
      selectedEmployeeId: DEFAULT_EMPLOYEE_ID,
      selectedEmployee: getEmployeeById(DEFAULT_EMPLOYEE_ID),
      employees,
      setSelectedEmployeeId: () => undefined
    };
  }

  return context;
}
