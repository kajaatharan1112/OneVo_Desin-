export type ChecklistTemplateType = 'onboarding' | 'offboarding';
export type ChecklistTemplateStatus = 'draft' | 'active' | 'inactive';

export type ChecklistAssigneeType =
  | 'Employee'
  | 'Reporting Manager'
  | 'Department Head'
  | 'Specific Position'
  | 'Specific Employee';

export type ChecklistAppliesTo = 'company' | 'department' | 'position';
export type DueOffsetUnit = 'hours' | 'days';

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  description: string;
  assigneeType: ChecklistAssigneeType | '';
  assigneePositionId: string;
  assigneeEmployeeId: string;
  dueOffsetValue: number;
  dueOffsetUnit: DueOffsetUnit;
  required: boolean;
  requiredDocument: string;
  sortOrder: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: ChecklistTemplateType;
  description: string;
  status: ChecklistTemplateStatus;
  appliesTo: ChecklistAppliesTo;
  departmentIds: string[];
  positionIds: string[];
  items: ChecklistTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplateFormState {
  open: boolean;
  mode: 'create' | 'edit';
  templateId: string | null;
}
