export type CoverageOwnerType = 'employee' | 'position';
export type CoverageType = 'entire_company' | 'selected_departments' | 'selected_positions';
export type HRCoverageStatus = 'active' | 'inactive';

export type HRCoverageAccessKey =
  | 'view_profiles'
  | 'manage_onboarding'
  | 'manage_offboarding'
  | 'view_leave'
  | 'view_attendance'
  | 'manage_documents';

export const HR_COVERAGE_ACCESS_OPTIONS: { key: HRCoverageAccessKey; label: string }[] = [
  { key: 'view_profiles', label: 'View employee profiles' },
  { key: 'manage_onboarding', label: 'Manage onboarding' },
  { key: 'manage_offboarding', label: 'Manage offboarding' },
  { key: 'view_leave', label: 'View leave records' },
  { key: 'view_attendance', label: 'View attendance records' },
  { key: 'manage_documents', label: 'Manage employee documents' }
];

export interface HRCoverageRule {
  id: string;
  ownerType: CoverageOwnerType;
  ownerEmployeeId: string | null;
  ownerPositionId: string | null;
  ownerLabel: string;
  coverageType: CoverageType;
  departmentIds: string[];
  positionIds: string[];
  accessAllowed: HRCoverageAccessKey[];
  status: HRCoverageStatus;
}

export interface HRCoverageFormState {
  open: boolean;
  mode: 'create' | 'edit';
  ruleId: string | null;
}

export interface HRCoverageFormValues {
  ownerType: CoverageOwnerType;
  ownerEmployeeId: string;
  ownerPositionId: string;
  coverageType: CoverageType;
  departmentIds: string[];
  positionIds: string[];
  accessAllowed: HRCoverageAccessKey[];
  status: HRCoverageStatus;
}

export const EMPTY_HR_COVERAGE_FORM = (): HRCoverageFormValues => ({
  ownerType: 'employee',
  ownerEmployeeId: '',
  ownerPositionId: '',
  coverageType: 'selected_departments',
  departmentIds: [],
  positionIds: [],
  accessAllowed: ['view_profiles', 'manage_onboarding', 'manage_offboarding'],
  status: 'active'
});
