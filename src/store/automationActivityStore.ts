import { create } from 'zustand';
import type { Automation, AutomationStep } from '../features/automations/automationTypes';
import type { EmployeeOption, PositionOption } from '../features/automations/alertAssignmentUtils';
import {
  computeDueAt,
  formatDurationLabel,
  formatTaskAssigneePhrase,
  isOneTimeTaskAction,
  validateOneTimeTaskConfig
} from '../features/automations/oneTimeTaskUtils';

export type AutomationActivityTaskStatus = 'open' | 'completed';

export interface AutomationActivityTask {
  id: string;
  automationId: string;
  automationName: string;
  stepId: string;
  title: string;
  description: string;
  assigneeLabel: string;
  priority: 'low' | 'medium' | 'high';
  dueAt: string;
  dueLabel: string;
  relatedEmployee: string;
  status: AutomationActivityTaskStatus;
  createdAt: string;
}

const createId = () => `aat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

const SEED_TASKS: AutomationActivityTask[] = [
  {
    id: 'aat-seed-1',
    automationId: 'auto-4',
    automationName: 'Position Change Check',
    stepId: 'seed',
    title: 'Review access after position change',
    description: 'Verify system access matches the new position assignment.',
    assigneeLabel: 'HR Admin role',
    priority: 'high',
    dueAt: new Date(Date.now() + 3.5 * 3600000).toISOString(),
    dueLabel: '3 hours 30 minutes',
    relatedEmployee: 'Employee from trigger',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'aat-seed-2',
    automationId: 'auto-3',
    automationName: 'Late Attendance Alert',
    stepId: 'seed',
    title: 'Check attendance correction',
    description: '',
    assigneeLabel: 'Department Head',
    priority: 'medium',
    dueAt: new Date(Date.now() + 45 * 60000).toISOString(),
    dueLabel: '45 minutes',
    relatedEmployee: 'Employee from trigger',
    status: 'open',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

interface AutomationActivityStore {
  tasks: AutomationActivityTask[];
  addTaskFromStep: (
    automation: Automation,
    step: AutomationStep,
    org: { positions: PositionOption[]; employees: EmployeeOption[] }
  ) => AutomationActivityTask | null;
  simulateAutomationRun: (
    automation: Automation,
    org: { positions: PositionOption[]; employees: EmployeeOption[] }
  ) => AutomationActivityTask[];
  completeTask: (id: string) => void;
}

export const useAutomationActivityStore = create<AutomationActivityStore>((set, get) => ({
  tasks: SEED_TASKS,

  addTaskFromStep: (automation, step, org) => {
    if (step.type !== 'action' || !isOneTimeTaskAction(step.config.actionKey)) return null;
    if (validateOneTimeTaskConfig(step.id, step.config).length > 0) return null;

    const hours = Number(step.config.taskDueHours ?? 0);
    const minutes = Number(step.config.taskDueMinutes ?? 0);
    const task: AutomationActivityTask = {
      id: createId(),
      automationId: automation.id,
      automationName: automation.name,
      stepId: step.id,
      title: String(step.config.taskTitle ?? '').trim(),
      description: String(step.config.taskDescription ?? ''),
      assigneeLabel: formatTaskAssigneePhrase(step.config, org.positions, org.employees),
      priority: (step.config.taskPriority as AutomationActivityTask['priority']) ?? 'medium',
      dueAt: computeDueAt(hours, minutes),
      dueLabel: formatDurationLabel(hours, minutes),
      relatedEmployee: 'Employee from trigger',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    set(s => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  simulateAutomationRun: (automation, org) => {
    const created: AutomationActivityTask[] = [];
    for (const step of automation.steps) {
      const task = get().addTaskFromStep(automation, step, org);
      if (task) created.push(task);
    }
    return created;
  },

  completeTask: (id) => {
    set(s => ({
      tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'completed' as const } : t)
    }));
  }
}));
