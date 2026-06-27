export type EmployeeId = 'alex' | 'marcus' | 'manager';

export type EmployeeProfileEmploymentType = 'full-time' | 'part-time';
export type EmployeeProfileWorkMode = 'remote' | 'onsite' | 'hybrid';

export interface EmployeeProfileDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface EmployeeOnboardingProfile {
  emailAddress: string;
  firstName: string;
  lastName: string;
  position: string;
  employeeNumber: string;
  startDate: string;
  employmentType: EmployeeProfileEmploymentType;
  workEmail: string;
  mobileNumber: string;
  emergencyContactName: string;
  relationship: string;
  emergencyContactNumber: string;
  workMode: EmployeeProfileWorkMode;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  currentAddress: string;
  permanentAddress: string;
  timeZone: string;
  documents: EmployeeProfileDocument[];
}

export interface EmployeeProfile {
  id: EmployeeId;
  name: string;
  role: string;
  avatar: string;
  avatarUrl: string;
}
