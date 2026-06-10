import type { ChecklistTemplate } from './checklistTemplateTypes';

const ts = (d: string) => d;

export const SEED_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'ct-onboarding-standard',
    name: 'Standard Employee Onboarding',
    type: 'onboarding',
    description: 'Default onboarding checklist for new hires.',
    status: 'active',
    items: [
      { id: 'i1', title: 'Complete employee profile', description: '', assigneeType: 'Employee', assigneeRole: '', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 0, required: true, sortOrder: 0 },
      { id: 'i2', title: 'Upload ID/passport', description: '', assigneeType: 'Employee', assigneeRole: '', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 1, required: true, sortOrder: 1 },
      { id: 'i3', title: 'Sign employment documents', description: '', assigneeType: 'Employee', assigneeRole: '', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 1, required: true, sortOrder: 2 },
      { id: 'i4', title: 'Manager welcome meeting', description: '', assigneeType: 'Reporting Manager', assigneeRole: '', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 2, required: true, sortOrder: 3 },
      { id: 'i5', title: 'Confirm payroll details', description: '', assigneeType: 'Role', assigneeRole: 'HR Admin', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 3, required: true, sortOrder: 4 }
    ],
    createdAt: ts('2025-10-01T10:00:00Z'),
    updatedAt: ts('2026-03-01T10:00:00Z')
  },
  {
    id: 'ct-offboarding-standard',
    name: 'Standard Employee Offboarding',
    type: 'offboarding',
    description: 'Default offboarding checklist for departing employees.',
    status: 'active',
    items: [
      { id: 'i1', title: 'Confirm final working date', description: '', assigneeType: 'Role', assigneeRole: 'HR Admin', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: -7, required: true, sortOrder: 0 },
      { id: 'i2', title: 'Handover work', description: '', assigneeType: 'Reporting Manager', assigneeRole: '', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: -5, required: true, sortOrder: 1 },
      { id: 'i3', title: 'Collect laptop/equipment', description: '', assigneeType: 'Role', assigneeRole: 'IT Admin', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: -1, required: true, sortOrder: 2 },
      { id: 'i4', title: 'Final payroll review', description: '', assigneeType: 'Role', assigneeRole: 'Finance Admin', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 0, required: true, sortOrder: 3 },
      { id: 'i5', title: 'Exit interview', description: '', assigneeType: 'Role', assigneeRole: 'HR Admin', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetDays: 0, required: true, sortOrder: 4 }
    ],
    createdAt: ts('2025-10-01T10:00:00Z'),
    updatedAt: ts('2026-03-01T10:00:00Z')
  }
];
