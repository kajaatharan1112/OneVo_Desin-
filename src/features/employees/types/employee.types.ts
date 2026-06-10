export type EmployeeId = 'alex' | 'marcus';

export interface EmployeeProfile {
  id: EmployeeId;
  name: string;
  role: string;
  avatar: string;
  avatarUrl: string;
}
