import type { EmployeeId, EmployeeProfile } from '../types/employee.types';

export const DEFAULT_EMPLOYEE_ID: EmployeeId = 'alex';

export const employees: EmployeeProfile[] = [
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Chief Executive Officer',
    avatar: 'MC',
    avatarUrl: 'https://i.pravatar.cc/150?u=marcus',
    country: 'USA',
    timezone: 'America/New_York'
  },
  {
    id: 'manager',
    name: 'Dana Brooks',
    role: 'Manager',
    avatar: 'DB',
    avatarUrl: 'https://i.pravatar.cc/150?u=dana',
    country: 'UK',
    timezone: 'Europe/London'
  },
  {
    id: 'alex',
    name: 'Alexander Pierce',
    role: 'Back end developer',
    avatar: 'AP',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
    country: 'Sri Lanka',
    timezone: 'Asia/Colombo'
  }
];

export function getEmployeeById(id: EmployeeId): EmployeeProfile {
  return employees.find((employee) => employee.id === id) ?? employees[0];
}
