export interface ChecklistTaskInstance {
  id: string;
  employeeId: string;
  templateId: string;
  templateType: 'onboarding' | 'offboarding';
  title: string;
  description: string;
  assigneeLabel: string;
  dueDate: string; // ISO date (yyyy-mm-dd)
  required: boolean;
  requiredDocument: string;
  status: 'pending' | 'completed';
  createdAt: string;
}
