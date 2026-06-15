import type {
  EmployeeActivityEntry,
  EmployeeDocument,
  LeavePolicyOverride,
  RoleOverride,
  ScheduleOverride
} from './employeeProfileTypes';

export const SEED_EMPLOYEE_DOCUMENTS: EmployeeDocument[] = [
  {
    id: 'doc-1',
    employeeId: 'emp-1',
    name: 'Employment Contract',
    type: 'Contract',
    status: 'uploaded',
    date: '2024-01-01'
  },
  {
    id: 'doc-2',
    employeeId: 'emp-1',
    name: 'Offer Letter',
    type: 'Offer',
    status: 'generated',
    date: '2023-12-15'
  },
  {
    id: 'doc-3',
    employeeId: 'emp-8',
    name: 'Remote Work Agreement',
    type: 'Policy Acknowledgment',
    status: 'uploaded',
    date: '2024-06-01'
  }
];

export const SEED_EMPLOYEE_ACTIVITY: EmployeeActivityEntry[] = [
  {
    id: 'act-1',
    employeeId: 'emp-1',
    type: 'created',
    label: 'Employee created',
    occurredAt: '2024-01-01T09:00:00Z'
  },
  {
    id: 'act-2',
    employeeId: 'emp-1',
    type: 'position-changed',
    label: 'Position changed',
    detail: 'Assigned to CEO',
    occurredAt: '2024-01-01T09:05:00Z'
  },
  {
    id: 'act-3',
    employeeId: 'emp-8',
    type: 'created',
    label: 'Employee created',
    occurredAt: '2024-06-01T09:00:00Z'
  },
  {
    id: 'act-4',
    employeeId: 'emp-8',
    type: 'position-changed',
    label: 'Position changed',
    detail: 'Assigned to Software Engineer',
    occurredAt: '2024-06-01T09:05:00Z'
  }
];

export const SEED_ROLE_OVERRIDES: RoleOverride[] = [];
export const SEED_LEAVE_OVERRIDES: LeavePolicyOverride[] = [];
export const SEED_SCHEDULE_OVERRIDES: ScheduleOverride[] = [];

export function defaultActivityForEmployee(employeeId: string, createdAt: string): EmployeeActivityEntry[] {
  return [
    {
      id: `act-created-${employeeId}`,
      employeeId,
      type: 'created',
      label: 'Employee created',
      occurredAt: `${createdAt}T09:00:00Z`
    }
  ];
}
