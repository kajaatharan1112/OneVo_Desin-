import type { HRCoverageRule } from './hrCoverageTypes';

export const SEED_HR_COVERAGE: HRCoverageRule[] = [
  {
    id: 'hr-cov-1',
    ownerType: 'employee',
    ownerEmployeeId: 'emp-4',
    ownerPositionId: null,
    ownerLabel: 'Zara Hassan',
    coverageType: 'selected_departments',
    departmentIds: ['dept-eng', 'dept-backend', 'dept-frontend'],
    positionIds: [],
    accessAllowed: [
      'view_profiles',
      'manage_onboarding',
      'manage_offboarding',
      'view_leave',
      'view_attendance'
    ],
    status: 'active'
  },
  {
    id: 'hr-cov-2',
    ownerType: 'position',
    ownerEmployeeId: null,
    ownerPositionId: 'pos-hr-mgr',
    ownerLabel: 'HR Manager position',
    coverageType: 'entire_company',
    departmentIds: [],
    positionIds: [],
    accessAllowed: ['view_profiles', 'manage_onboarding', 'manage_offboarding'],
    status: 'active'
  }
];
