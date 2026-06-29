export type EmployeeId = string;

export interface EmployeeProfile {
  id: EmployeeId;
  name: string;
  role: string;
  avatar: string;
  avatarUrl: string;
  country: string;
  timezone: string;
}
