export interface ChecklistTaskInstance {
  id: string;
  employeeId: string;
  templateId: string;
  templateType: 'onboarding' | 'offboarding';
  title: string;
  description: string;
  assigneeLabel: string;
  assigneeEmployeeId?: string;
  employeeName?: string;
  employeeNumber?: string;
  dueTime?: string;
  dueDate: string; // ISO date (yyyy-mm-dd)
  required: boolean;
  requiredDocument: string;
  status: 'todo' | 'pending' | 'completed';
  createdAt: string;
}
