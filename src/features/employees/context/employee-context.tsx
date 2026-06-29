import React, { createContext, useContext, useMemo } from 'react';
import { DEFAULT_EMPLOYEE_ID, employees, getEmployeeById } from '../data/employees.data';
import { useOrganizationStore } from '../../../store/organizationStore';
import type { EmployeeId, EmployeeOnboardingProfile, EmployeeProfile } from '../types/employee.types';

interface EmployeeContextValue {
  selectedEmployeeId: EmployeeId;
  selectedEmployee: EmployeeProfile;
  employees: EmployeeProfile[];
  setSelectedEmployeeId: (id: EmployeeId) => void;
 kaviz/offboarding
  updateOnboardingProfile: (id: EmployeeId, profile: EmployeeOnboardingProfile) => void;
 main
}

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

interface EmployeeProviderProps {
  selectedEmployeeId: EmployeeId;
  onSelectEmployee: (id: EmployeeId) => void;
  children: React.ReactNode;
}

kaviz/offboarding
const initials = (firstName: string, lastName: string) => `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ selectedEmployeeId, onSelectEmployee, children }) => {
  const [employeeRecords, setEmployeeRecords] = useState(employees);
  const orgEmployees = useOrganizationStore(state => state.employees);
  const positions = useOrganizationStore(state => state.positions);
  const assignments = useOrganizationStore(state => state.assignments);

  const organizationProfiles = useMemo<EmployeeProfile[]>(() => orgEmployees.map(employee => {
    const assignment = assignments.find(item => item.employeeId === employee.id && item.status === 'active');
    const position = positions.find(item => item.id === assignment?.positionId);
    const role = position?.name ?? 'Employee';
    const employmentType = employee.employmentType === 'part-time' ? 'part-time' : 'full-time';
    const workMode = employee.workMode === 'remote' || employee.workMode === 'hybrid' ? employee.workMode : 'onsite';
    const existing = employeeRecords.find(item => item.id === employee.id);
    if (existing) return existing;
    return {
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`.trim(),
      role,
      avatar: initials(employee.firstName, employee.lastName),
      avatarUrl: `https://i.pravatar.cc/150?u=${employee.id}`,
      timezone: 'Asia/Colombo',
      onboardingProfile: {
        emailAddress: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: role,
        employeeNumber: employee.employeeNumber ?? employee.id.toUpperCase(),
        startDate: employee.startDate,
        employmentType,
        workEmail: employee.workEmail ?? employee.email,
        mobileNumber: employee.phone ?? '',
        emergencyContactName: '',
        relationship: 'Spouse',
        emergencyContactNumber: '',
        workMode,
        dateOfBirth: '',
        gender: 'Prefer not to say',
        maritalStatus: 'Single',
        currentAddress: '',
        permanentAddress: '',
        timeZone: 'Asia/Colombo',
        documents: []
      }
    };
  }), [orgEmployees, assignments, positions, employeeRecords]);

  const allProfiles = useMemo(() => {
    const organizationIds = new Set(organizationProfiles.map(profile => profile.id));
    return [...employeeRecords.filter(profile => !organizationIds.has(profile.id)), ...organizationProfiles];
  }, [employeeRecords, organizationProfiles]);

  const updateOnboardingProfile = useCallback((id: EmployeeId, profile: EmployeeOnboardingProfile) => {
    setEmployeeRecords(current => {
      const existing = current.find(employee => employee.id === id);
      if (existing) return current.map(employee => employee.id === id
        ? { ...employee, name: `${profile.firstName} ${profile.lastName}`.trim(), role: profile.position, timezone: profile.timeZone, onboardingProfile: profile }
        : employee);
      return [...current, {
        id,
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        role: profile.position,
        avatar: initials(profile.firstName, profile.lastName),
        avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
        timezone: profile.timeZone,
        onboardingProfile: profile
      }];
    });
  }, []);

  const value = useMemo(() => ({
    selectedEmployeeId,
    selectedEmployee: allProfiles.find(employee => employee.id === selectedEmployeeId) ?? getEmployeeById(selectedEmployeeId),
    employees: allProfiles,
    setSelectedEmployeeId: onSelectEmployee,
    updateOnboardingProfile
  }), [selectedEmployeeId, onSelectEmployee, allProfiles, updateOnboardingProfile]);

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
main

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export function useEmployeeContext(): EmployeeContextValue {
  const context = useContext(EmployeeContext);
kaviz/offboarding
  if (!context) return {
    selectedEmployeeId: DEFAULT_EMPLOYEE_ID,
    selectedEmployee: getEmployeeById(DEFAULT_EMPLOYEE_ID),
    employees,
    setSelectedEmployeeId: () => undefined,
    updateOnboardingProfile: () => undefined
  };


  if (!context) {
    return {
      selectedEmployeeId: DEFAULT_EMPLOYEE_ID,
      selectedEmployee: getEmployeeById(DEFAULT_EMPLOYEE_ID),
      employees,
      setSelectedEmployeeId: () => undefined
    };
  }

main
  return context;
}