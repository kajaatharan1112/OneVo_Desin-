export type ChecklistTemplateType = 'onboarding' | 'offboarding';
export type ChecklistTemplateStatus = 'draft' | 'active' | 'inactive';

export type ChecklistAssigneeType =
  | 'Employee'
  | 'Reporting Manager'
  | 'Department Head'
  | 'Specific Position'
  | 'Specific Employee'
  | 'Role';

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  description: string;
  assigneeType: ChecklistAssigneeType | '';
  assigneeRole: string;
  assigneePositionId: string;
  assigneeEmployeeId: string;
  dueOffsetDays: number;
  required: boolean;
  sortOrder: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  type: ChecklistTemplateType;
  description: string;
  status: ChecklistTemplateStatus;
  items: ChecklistTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplateFormState {
  open: boolean;
  mode: 'create' | 'edit';
  templateId: string | null;
}
