import type { ChecklistTemplate } from './checklistTemplateTypes';

const ts = (d: string) => d;

export const SEED_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'ct-onboarding-standard',
    name: 'Standard Employee Onboarding',
    type: 'onboarding',
    description: 'Default onboarding checklist for new hires.',
    status: 'active',
    appliesTo: 'company',
    departmentIds: [],
    positionIds: [],
    items: [
      { id: 'i1', title: 'Complete employee profile', description: '', assigneeType: 'Employee', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 0, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 0 },
      { id: 'i2', title: 'Upload ID/passport', description: '', assigneeType: 'Employee', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 24, dueOffsetUnit: 'hours', required: true, requiredDocument: 'Government ID', sortOrder: 1 },
      { id: 'i3', title: 'Sign employment documents', description: '', assigneeType: 'Employee', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 1, dueOffsetUnit: 'days', required: true, requiredDocument: 'Signed employment contract', sortOrder: 2 },
      { id: 'i4', title: 'Manager welcome meeting', description: '', assigneeType: 'Reporting Manager', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 2, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 3 },
      { id: 'i5', title: 'Confirm payroll details', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 3, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 4 }
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
    appliesTo: 'company',
    departmentIds: [],
    positionIds: [],
    items: [
      { id: 'i1', title: 'Confirm final working date', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 7, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 0 },
      { id: 'i2', title: 'Handover work', description: '', assigneeType: 'Reporting Manager', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 5, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 1 },
      { id: 'i3', title: 'Collect laptop/equipment', description: '', assigneeType: 'Reporting Manager', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 1, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 2 },
      { id: 'i4', title: 'Final payroll review', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 0, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 3 },
      { id: 'i5', title: 'Exit interview', description: '', assigneeType: 'Department Head', assigneePositionId: '', assigneeEmployeeId: '', dueOffsetValue: 0, dueOffsetUnit: 'days', required: true, requiredDocument: '', sortOrder: 4 }
    ],
    createdAt: ts('2025-10-01T10:00:00Z'),
    updatedAt: ts('2026-03-01T10:00:00Z')
  }
];
