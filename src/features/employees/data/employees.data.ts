import type { EmployeeId, EmployeeProfile } from '../types/employee.types';

const makeOnboardingProfile = (
  overrides: Partial<EmployeeProfile['onboardingProfile']>
): EmployeeProfile['onboardingProfile'] => ({
  emailAddress: '', firstName: '', lastName: '', position: '', employeeNumber: '', startDate: '',
  employmentType: 'full-time', workEmail: '', mobileNumber: '', emergencyContactName: '',
  relationship: 'Spouse', emergencyContactNumber: '', workMode: 'hybrid', dateOfBirth: '',
  gender: 'Prefer not to say', maritalStatus: 'Single', currentAddress: '', permanentAddress: '',
  timeZone: 'Asia/Colombo', documents: [], ...overrides
});

export const DEFAULT_EMPLOYEE_ID: EmployeeId = 'alex';

export const employees: EmployeeProfile[] = [
  {
    id: 'marcus', name: 'Marcus Chen', role: 'Chief Executive Officer', avatar: 'MC',
    avatarUrl: 'https://i.pravatar.cc/150?u=marcus', timezone: 'Asia/Colombo',
    onboardingProfile: makeOnboardingProfile({ emailAddress: 'marcus.chen@onevo.com', firstName: 'Marcus', lastName: 'Chen', position: 'Chief Executive Officer', employeeNumber: 'ONE-001', startDate: '2021-01-04', workEmail: 'marcus.chen@onevo.com' })
  },
  {
    id: 'manager', name: 'Dana Brooks', role: 'Manager', avatar: 'DB',
    avatarUrl: 'https://i.pravatar.cc/150?u=dana', timezone: 'America/New_York',
    onboardingProfile: makeOnboardingProfile({ emailAddress: 'dana.brooks@onevo.com', firstName: 'Dana', lastName: 'Brooks', position: 'Manager', employeeNumber: 'ONE-014', startDate: '2022-08-15', workEmail: 'dana.brooks@onevo.com', timeZone: 'America/New_York' })
  },
  {
    id: 'alex', name: 'Alexander Pierce', role: 'Back end developer', avatar: 'AP',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex', timezone: 'Europe/London',
    onboardingProfile: makeOnboardingProfile({ emailAddress: 'alexander.pierce@onevo.com', firstName: 'Alexander', lastName: 'Pierce', position: 'Back end developer', employeeNumber: 'ONE-028', startDate: '2024-02-12', workEmail: 'alexander.pierce@onevo.com', mobileNumber: '+44 7700 900123', timeZone: 'Europe/London' })
  }
];

export function getEmployeeById(id: EmployeeId): EmployeeProfile {
  return employees.find((employee) => employee.id === id) ?? employees[0];
}
