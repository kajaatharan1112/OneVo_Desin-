/** Internal access areas - never show raw enum names in user-facing UI. */
export type EmployeeAccessArea =
  | 'none'
  | 'selected_departments'
  | 'selected_positions'
  | 'organization';

/** @deprecated Use EmployeeAccessArea for position access templates. */
export type AccessScope =
  | EmployeeAccessArea
  | 'own'
  | 'reporting_structure'
  | 'hr_coverage'
  | 'direct_reports'
  | 'reporting_tree'
  | 'department'
  | 'department_tree';

export const EMPLOYEE_ACCESS_AREA_LABELS: Record<EmployeeAccessArea, string> = {
  none: 'No employee access',
  selected_departments: 'Selected departments',
  selected_positions: 'Selected positions',
  organization: 'Entire company'
};

/** @deprecated Use EMPLOYEE_ACCESS_AREA_LABELS for new position access UI. */
export const VISIBILITY_LABELS: Record<AccessScope, string> = {
  own: 'This employee only',
  none: EMPLOYEE_ACCESS_AREA_LABELS.none,
  organization: EMPLOYEE_ACCESS_AREA_LABELS.organization,
  selected_departments: EMPLOYEE_ACCESS_AREA_LABELS.selected_departments,
  selected_positions: EMPLOYEE_ACCESS_AREA_LABELS.selected_positions,
  reporting_structure: EMPLOYEE_ACCESS_AREA_LABELS.none,
  hr_coverage: EMPLOYEE_ACCESS_AREA_LABELS.none,
  direct_reports: EMPLOYEE_ACCESS_AREA_LABELS.none,
  reporting_tree: EMPLOYEE_ACCESS_AREA_LABELS.none,
  department: EMPLOYEE_ACCESS_AREA_LABELS.selected_departments,
  department_tree: EMPLOYEE_ACCESS_AREA_LABELS.selected_departments
};

export const POSITION_ACCESS_AREA_OPTIONS: { value: EmployeeAccessArea; label: string }[] = [
  { value: 'none', label: EMPLOYEE_ACCESS_AREA_LABELS.none },
  { value: 'selected_departments', label: EMPLOYEE_ACCESS_AREA_LABELS.selected_departments },
  { value: 'selected_positions', label: EMPLOYEE_ACCESS_AREA_LABELS.selected_positions },
  { value: 'organization', label: EMPLOYEE_ACCESS_AREA_LABELS.organization }
];

/** @deprecated Use POSITION_ACCESS_AREA_OPTIONS. */
export const POSITION_VISIBILITY_OPTIONS = POSITION_ACCESS_AREA_OPTIONS;

export function accessAreaLabel(area: EmployeeAccessArea): string {
  return EMPLOYEE_ACCESS_AREA_LABELS[area] ?? area;
}

/** @deprecated Use accessAreaLabel. */
export function visibilityLabel(scope: AccessScope | EmployeeAccessArea): string {
  if (scope === 'own') return 'This employee only';
  return accessAreaLabel(normalizeEmployeeAccessArea(scope));
}

/** Map legacy stored values to the current model without exposing old labels. */
export function normalizeEmployeeAccessArea(area: string | undefined | null): EmployeeAccessArea {
  switch (area) {
    case 'organization':
      return 'organization';
    case 'selected_departments':
    case 'department':
    case 'department_tree':
      return 'selected_departments';
    case 'selected_positions':
      return 'selected_positions';
    case 'none':
    case 'own':
    case 'direct_reports':
    case 'reporting_tree':
    case 'reporting_structure':
    case 'hr_coverage':
    default:
      return 'none';
  }
}

/** @deprecated Use normalizeEmployeeAccessArea. */
export function normalizeAccessScope(scope: string): AccessScope {
  if (scope === 'own') return 'own';
  return normalizeEmployeeAccessArea(scope);
}
