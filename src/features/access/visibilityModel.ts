/** Internal visibility scopes — never show raw enum names in user-facing UI. */
export type AccessScope =
  | 'own'
  | 'organization'
  | 'selected_departments'
  | 'selected_positions'
  | 'reporting_structure'
  | 'hr_coverage';

export const VISIBILITY_LABELS: Record<AccessScope, string> = {
  own: 'This employee only',
  organization: 'Entire company',
  selected_departments: 'Selected departments',
  selected_positions: 'Selected positions',
  reporting_structure: 'Team from reporting structure',
  hr_coverage: 'HR coverage area'
};

/** Options shown when configuring position access templates (not manager-tree jargon). */
export const POSITION_VISIBILITY_OPTIONS: { value: AccessScope; label: string }[] = [
  { value: 'organization', label: VISIBILITY_LABELS.organization },
  { value: 'reporting_structure', label: VISIBILITY_LABELS.reporting_structure },
  { value: 'hr_coverage', label: VISIBILITY_LABELS.hr_coverage },
  { value: 'selected_departments', label: VISIBILITY_LABELS.selected_departments },
  { value: 'selected_positions', label: VISIBILITY_LABELS.selected_positions }
];

export function visibilityLabel(scope: AccessScope): string {
  return VISIBILITY_LABELS[scope] ?? scope;
}

/** Map legacy stored values to the current model. */
export function normalizeAccessScope(scope: string): AccessScope {
  switch (scope) {
    case 'direct_reports':
    case 'reporting_tree':
    case 'department':
      return scope === 'department' ? 'selected_departments' : 'reporting_structure';
    case 'own':
    case 'organization':
    case 'selected_departments':
    case 'selected_positions':
    case 'reporting_structure':
    case 'hr_coverage':
      return scope;
    default:
      return 'own';
  }
}
