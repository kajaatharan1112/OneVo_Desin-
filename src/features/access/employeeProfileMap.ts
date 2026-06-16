import type { EmployeeId } from '../employees/types/employee.types';

/** Maps Employee View profile IDs to organization employee records. */
export const PROFILE_TO_ORG_EMPLOYEE: Record<EmployeeId, string> = {
  marcus: 'emp-1',
  manager: 'emp-13',
  alex: 'emp-8'
};

export function orgEmployeeIdForProfile(profileId: EmployeeId): string {
  return PROFILE_TO_ORG_EMPLOYEE[profileId];
}

export function profileIdForOrgEmployee(orgEmployeeId: string): EmployeeId | null {
  const entry = Object.entries(PROFILE_TO_ORG_EMPLOYEE).find(([, id]) => id === orgEmployeeId);
  return entry ? (entry[0] as EmployeeId) : null;
}
