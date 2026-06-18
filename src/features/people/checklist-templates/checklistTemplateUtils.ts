import type { ChecklistTemplate, ChecklistTemplateItem } from './checklistTemplateTypes';

export function appliesToSummary(
  template: ChecklistTemplate,
  departments: { id: string; name: string }[],
  positions: { id: string; name: string }[]
): string {
  if (template.appliesTo === 'company') return 'Full Company';
  if (template.appliesTo === 'department') {
    const names = template.departmentIds.map(id => departments.find(d => d.id === id)?.name).filter(Boolean) as string[];
    return names.length ? names.join(', ') : 'Department (none selected)';
  }
  const names = template.positionIds.map(id => positions.find(p => p.id === id)?.name).filter(Boolean) as string[];
  return names.length ? names.join(', ') : 'Position (none selected)';
}

export function formatAssigneeSummary(
  item: ChecklistTemplateItem,
  positions: { id: string; name: string }[] = [],
  employees: { id: string; name: string }[] = []
): string {
  switch (item.assigneeType) {
    case 'Employee': return 'Employee';
    case 'Reporting Manager': return 'Reporting Manager';
    case 'Department Head': return 'Department Head';
    case 'Specific Position':
      return positions.find(p => p.id === item.assigneePositionId)?.name ?? 'Position';
    case 'Specific Employee':
      return employees.find(e => e.id === item.assigneeEmployeeId)?.name ?? 'Employee';
    default: return '—';
  }
}

export function templateAssigneesSummary(
  template: ChecklistTemplate,
  positions: { id: string; name: string }[] = [],
  employees: { id: string; name: string }[] = []
): string {
  const unique = [...new Set(template.items.map(i => formatAssigneeSummary(i, positions, employees)).filter(v => v !== '—'))];
  if (unique.length === 0) return '—';
  if (unique.length <= 2) return unique.join(', ');
  return `${unique.slice(0, 2).join(', ')} +${unique.length - 2}`;
}

export interface ChecklistValidationIssue {
  id: string;
  message: string;
}

export function validateChecklistTemplate(
  template: Partial<ChecklistTemplate> & { items: ChecklistTemplateItem[] },
  forActivate = false
): ChecklistValidationIssue[] {
  const issues: ChecklistValidationIssue[] = [];
  if (!String(template.name ?? '').trim()) {
    issues.push({ id: 'name', message: 'Template name is required.' });
  }
  if (!template.type) {
    issues.push({ id: 'type', message: 'Template type is required.' });
  }
  if (template.appliesTo === 'department' && (!template.departmentIds || template.departmentIds.length === 0)) {
    issues.push({ id: 'applies-to', message: 'Select at least one department.' });
  }
  if (template.appliesTo === 'position' && (!template.positionIds || template.positionIds.length === 0)) {
    issues.push({ id: 'applies-to', message: 'Select at least one position.' });
  }
  if (forActivate && (!template.items || template.items.length === 0)) {
    issues.push({ id: 'items', message: 'At least one checklist item is required before activating.' });
  }
  template.items?.forEach((item, idx) => {
    if (!String(item.title ?? '').trim()) {
      issues.push({ id: `item-title-${idx}`, message: `Item ${idx + 1}: title is required.` });
    }
    if (!item.assigneeType) {
      issues.push({ id: `item-assignee-${idx}`, message: `Item ${idx + 1}: assignee type is required.` });
    }
    if (item.assigneeType === 'Specific Position' && !item.assigneePositionId) {
      issues.push({ id: `item-pos-${idx}`, message: `Item ${idx + 1}: position is required.` });
    }
    if (item.assigneeType === 'Specific Employee' && !item.assigneeEmployeeId) {
      issues.push({ id: `item-emp-${idx}`, message: `Item ${idx + 1}: employee is required.` });
    }
  });
  return issues;
}
