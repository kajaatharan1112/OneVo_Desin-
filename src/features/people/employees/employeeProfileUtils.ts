import type { Department, Employee, Position, PositionAssignment } from '../../../types/organization';
import {
  getDepartmentName,
  getEmployeeActiveAssignment,
  getReportingManagerForEmployee
} from '../../../utils/organizationUtils';

export function employeeFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

export function employeeInitials(employee: Employee): string {
  const a = employee.firstName.trim()[0] ?? '';
  const b = employee.lastName.trim()[0] ?? '';
  return `${a}${b}`.toUpperCase() || '?';
}

export function formatProfileDate(iso: string): string {
  return new Date(iso.includes('T') ? iso : iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getEmployeeEmploymentContext(
  employeeId: string,
  positions: Position[],
  departments: Department[],
  assignments: PositionAssignment[],
  employees: Employee[]
) {
  const assignment = getEmployeeActiveAssignment(employeeId, assignments);
  const position = assignment
    ? positions.find(p => p.id === assignment.positionId) ?? null
    : null;
  const managerResult = getReportingManagerForEmployee(
    employeeId,
    positions,
    assignments,
    employees
  );
  const managerName = managerResult.manager
    ? employeeFullName(managerResult.manager)
    : managerResult.reason ?? '—';

  return {
    position,
    positionName: position?.name ?? '—',
    departmentName: position ? getDepartmentName(position.departmentId, departments) : '—',
    reportingManager: managerName,
    assignment
  };
}

export function employmentTypeLabel(type: Employee['employmentType']): string {
  switch (type) {
    case 'full-time':
      return 'Full-time';
    case 'part-time':
      return 'Part-time';
    case 'contract':
      return 'Contract';
    default:
      return type;
  }
}

export function employeeStatusLabel(status: Employee['status']): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'onboarding':
      return 'Onboarding';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
}
