import { useOrganizationStore } from '../../../store/organizationStore';
import { getEmployeeActiveAssignment } from '../../../utils/organizationUtils';
import type { HRCoverageRule, HRCoverageAccessKey } from './hrCoverageTypes';
import { HR_COVERAGE_ACCESS_OPTIONS } from './hrCoverageTypes';

export function formatCoverageScope(rule: HRCoverageRule): string {
  const { departments, positions } = useOrganizationStore.getState();
  if (rule.coverageType === 'entire_company') return 'Entire company';
  if (rule.coverageType === 'selected_departments') {
    const names = rule.departmentIds
      .map(id => departments.find(d => d.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(', ') : 'Selected departments';
  }
  const names = rule.positionIds
    .map(id => positions.find(p => p.id === id)?.name)
    .filter(Boolean);
  return names.length ? names.join(', ') : 'Selected positions';
}

export function formatAccessAllowed(keys: HRCoverageAccessKey[]): string {
  return keys
    .map(k => HR_COVERAGE_ACCESS_OPTIONS.find(o => o.key === k)?.label ?? k)
    .join(', ');
}

export function countEmployeesCovered(rule: HRCoverageRule): number {
  const { employees, assignments, positions } = useOrganizationStore.getState();
  const activeEmployees = employees.filter(e => e.status === 'active');
  if (rule.coverageType === 'entire_company') return activeEmployees.length;

  return activeEmployees.filter(emp => {
    const asgn = getEmployeeActiveAssignment(emp.id, assignments);
    if (!asgn) return false;
    const pos = positions.find(p => p.id === asgn.positionId);
    if (!pos) return false;
    if (rule.coverageType === 'selected_departments') {
      return rule.departmentIds.includes(pos.departmentId);
    }
    return rule.positionIds.includes(pos.id);
  }).length;
}

export function employeeMatchesHRCoverage(
  employeeId: string,
  rules: HRCoverageRule[]
): boolean {
  const active = rules.filter(r => r.status === 'active');
  if (active.length === 0) return false;

  const { assignments, positions } = useOrganizationStore.getState();
  const asgn = getEmployeeActiveAssignment(employeeId, assignments);
  if (!asgn) return false;
  const pos = positions.find(p => p.id === asgn.positionId);
  if (!pos) return false;

  return active.some(rule => {
    if (rule.coverageType === 'entire_company') return true;
    if (rule.coverageType === 'selected_departments') {
      return rule.departmentIds.includes(pos.departmentId);
    }
    return rule.positionIds.includes(pos.id);
  });
}
