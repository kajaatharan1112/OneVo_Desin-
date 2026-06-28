export const BULK_IMPORT_REQUIRED_COLUMNS = [
  'Employee Number',
  'First Name',
  'Last Name',
  'Work Email',
  'Department',
  'Position',
  'Start Date',
  'Employment Type'
] as const;

export type BulkImportField = typeof BULK_IMPORT_REQUIRED_COLUMNS[number];

export interface BulkImportColumnMapping {
  /** sourceHeader -> target field, or '' if unmapped/ignored */
  [sourceHeader: string]: BulkImportField | '';
}

export interface BulkImportRow {
  rowIndex: number;
  raw: Record<string, string>;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  departmentName: string;
  positionName: string;
  startDate: string;
  employmentType: string;
  resolvedDepartmentId: string | null;
  resolvedPositionId: string | null;
  reportingManagerLabel: string | null;
  errors: string[];
  warnings: string[];
  skip: boolean;
}

export interface BulkAccessGroup {
  positionId: string;
  positionName: string;
  rowIndexes: number[];
  suggestedRoleIds: string[];
  confirmedRoleIds: string[];
}

export type ImportRunStatus = 'awaiting-review' | 'imported' | 'invites-sent';

export interface ImportRun {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  importedCount: number;
  warningCount: number;
  failedCount: number;
  skippedCount: number;
  inviteStatus: 'not-sent' | 'sent';
  status: ImportRunStatus;
  createdEmployeeIds: string[];
  failedRows: BulkImportRow[];
  rows?: BulkImportRow[];
}
