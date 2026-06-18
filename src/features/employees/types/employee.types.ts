export type EmployeeId = 'alex' | 'marcus' | 'manager';

export interface EmployeeProfile {
  id: EmployeeId;
  name: string;
  role: string;
  avatar: string;
  avatarUrl: string;
}
