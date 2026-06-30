import { create } from 'zustand';
import { useChecklistTemplateStore } from './checklistTemplateStore';
import { useOrganizationStore } from './organizationStore';
import { getEmployeeEmploymentContext } from '../features/people/employees/employeeProfileUtils';
import { getDepartmentHeadEmployee, getReportingManagerForEmployee, getEmployeeById } from '../utils/organizationUtils';
import { employeeFullName } from '../features/people/employees/employeeProfileUtils';
import type { ChecklistTemplate, ChecklistTemplateItem } from '../features/people/checklist-templates/checklistTemplateTypes';
import type { ChecklistTaskInstance } from '../features/people/checklist-tasks/checklistTaskTypes';

const taskId = () => `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface ChecklistTaskState {
  tasks: ChecklistTaskInstance[];
  getTasksForEmployee: (employeeId: string) => ChecklistTaskInstance[];
  generateTasksForEmployee: (
    employeeId: string,
    templateType: 'onboarding' | 'offboarding',
    baseDateISO: string
  ) => void;
  toggleTaskStatus: (id: string) => void;
}

function addOffsetDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function offsetInDays(item: ChecklistTemplateItem): number {
  return item.dueOffsetUnit === 'hours' ? item.dueOffsetValue / 24 : item.dueOffsetValue;
}

/** Finds the best-matching active template for an employee: position scope > department scope > company scope. */
export function findMatchingTemplate(
  employeeId: string,
  templateType: 'onboarding' | 'offboarding'
): ChecklistTemplate | undefined {
  const templates = useChecklistTemplateStore.getState().templates
    .filter(t => t.type === templateType && t.status === 'active');
  const org = useOrganizationStore.getState();
  const ctx = getEmployeeEmploymentContext(employeeId, org.positions, org.departments, org.assignments, org.employees);

  const byPosition = ctx.position
    ? templates.find(t => t.appliesTo === 'position' && t.positionIds.includes(ctx.position!.id))
    : undefined;
  if (byPosition) return byPosition;

  const byDepartment = ctx.position
    ? templates.find(t => t.appliesTo === 'department' && t.departmentIds.includes(ctx.position!.departmentId))
    : undefined;
  if (byDepartment) return byDepartment;

  return templates.find(t => t.appliesTo === 'company');
}

function resolveAssigneeLabel(item: ChecklistTemplateItem, employeeId: string): string {
  const org = useOrganizationStore.getState();
  const { positions, departments, assignments, employees } = org;
  const ctx = getEmployeeEmploymentContext(employeeId, positions, departments, assignments, employees);

  switch (item.assigneeType) {
    case 'Employee':
      return 'Employee';
    case 'Reporting Manager': {
      const result = getReportingManagerForEmployee(employeeId, positions, assignments, employees);
      return result.manager ? employeeFullName(result.manager) : 'Reporting Manager (unresolved)';
    }
    case 'Department Head': {
      if (!ctx.position) return 'Department Head (unresolved)';
      const { headEmployee } = getDepartmentHeadEmployee(ctx.position.departmentId, departments, positions, assignments, employees);
      return headEmployee ? employeeFullName(headEmployee) : 'Department Head (unresolved)';
    }
    case 'Specific Position': {
      const pos = positions.find(p => p.id === item.assigneePositionId);
      return pos ? pos.name : 'Specific Position';
    }
    case 'Specific Employee': {
      const emp = getEmployeeById(employees, item.assigneeEmployeeId);
      return emp ? employeeFullName(emp) : 'Specific Employee';
    }
    default:
      return '—';
  }
}

export const useChecklistTaskStore = create<ChecklistTaskState>((set, get) => ({
  tasks: [],

  getTasksForEmployee: employeeId => get().tasks.filter(t => t.employeeId === employeeId),

  generateTasksForEmployee: (employeeId, templateType, baseDateISO) => {
    const template = findMatchingTemplate(employeeId, templateType);
    if (!template) return;

    const sign = templateType === 'offboarding' ? -1 : 1;
    const newTasks: ChecklistTaskInstance[] = template.items.map(item => ({
      id: taskId(),
      employeeId,
      templateId: template.id,
      templateType,
      title: item.title,
      description: item.description,
      assigneeLabel: resolveAssigneeLabel(item, employeeId),
      dueDate: addOffsetDays(baseDateISO, sign * offsetInDays(item)),
      required: item.required,
      requiredDocument: item.requiredDocument,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    set({ tasks: [...get().tasks, ...newTasks] });
  },

  toggleTaskStatus: id => {
    set({
      tasks: get().tasks.map(t =>
        t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
      )
    });
  }
}));
