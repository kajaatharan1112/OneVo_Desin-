import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { DEFAULT_EMPLOYEE_ID, employees, getEmployeeById } from '../data/employees.data';
import type { EmployeeId, EmployeeProfile } from '../types/employee.types';

interface EmployeeContextValue {
  selectedEmployeeId: EmployeeId;
  selectedEmployee: EmployeeProfile;
  employees: EmployeeProfile[];
  setSelectedEmployeeId: (id: EmployeeId) => void;
  updateOnboardingProfile: (id: EmployeeId, profile: EmployeeProfile['onboardingProfile']) => void;
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
  const [employeeRecords, setEmployeeRecords] = useState(employees);
  const updateOnboardingProfile = useCallback((id: EmployeeId, profile: EmployeeProfile['onboardingProfile']) => {
    setEmployeeRecords(current => current.map(employee => employee.id === id
      ? { ...employee, timezone: profile.timeZone, onboardingProfile: profile }
      : employee));
  }, []);
  const value = useMemo(
    () => ({
      selectedEmployeeId,
      selectedEmployee: employeeRecords.find(employee => employee.id === selectedEmployeeId) ?? getEmployeeById(selectedEmployeeId),
      employees: employeeRecords,
      setSelectedEmployeeId: onSelectEmployee,
      updateOnboardingProfile
    }),
    [selectedEmployeeId, onSelectEmployee, employeeRecords, updateOnboardingProfile]
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
      setSelectedEmployeeId: () => undefined,
      updateOnboardingProfile: () => undefined
    };
  }

  return context;
}
