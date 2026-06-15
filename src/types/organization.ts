export type EntityStatus = 'active' | 'inactive';
export type PositionType = 'unique' | 'pooled';
export type EmployeeStatus = 'active' | 'onboarding' | 'inactive';
export type EmploymentType = 'full-time' | 'part-time' | 'contract';
export type WorkMode = 'onsite' | 'remote' | 'hybrid' | 'field';
export type AssignmentStatus = 'active' | 'ended';

export interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  headPositionId: string | null;
  description: string;
  status: EntityStatus;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  reportsToPositionId: string | null;
  type: PositionType;
  capacity: number;
  status: EntityStatus;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  startDate: string;
  /** Primary work location mode — used by Clock-in Policy for allowed methods. */
  workMode: WorkMode | null;
}

export interface PositionAssignment {
  id: string;
  employeeId: string;
  positionId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: AssignmentStatus;
  notes?: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}

export interface PositionTreeNode extends Position {
  children: PositionTreeNode[];
}

export interface ReportingManagerResult {
  manager: Employee | null;
  unresolved: boolean;
  reason?: string;
}

export type PositionTab = 'org-chart' | 'list';

export type DepartmentFormMode = 'create' | 'edit';

export interface DepartmentFormState {
  open: boolean;
  mode: DepartmentFormMode;
  departmentId: string | null;
  parentDepartmentId: string | null;
}

export interface PositionFormState {
  open: boolean;
  mode: 'create' | 'edit';
  positionId: string | null;
  reportsToPositionId: string | null;
  departmentId: string | null;
}

export interface AssignmentFormState {
  open: boolean;
  positionId: string | null;
}

export type EmployeeFormMode = 'create' | 'edit';

export interface EmployeeFormState {
  open: boolean;
  mode: EmployeeFormMode;
  employeeId: string | null;
}

export interface EmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  startDate: string;
  workMode: WorkMode | '';
  positionId: string;
}
