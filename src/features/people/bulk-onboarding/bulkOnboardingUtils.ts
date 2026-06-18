import type { Department, Employee, Position } from '../../../types/organization';
import {
  getPositionOccupancy,
  getReportingManagerPreviewForPosition,
  getActiveAssignmentsForPosition
} from '../../../utils/organizationUtils';
import type { PositionAssignment } from '../../../types/organization';
import type { BulkImportColumnMapping, BulkImportField, BulkImportRow } from './bulkOnboardingTypes';
import { BULK_IMPORT_REQUIRED_COLUMNS } from './bulkOnboardingTypes';

/** Minimal CSV parser: handles quoted fields containing commas, and CRLF/LF line endings. No XLSX support. */
export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.length > 0);
  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { cur += ch; }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { cells.push(cur); cur = ''; }
        else cur += ch;
      }
    }
    cells.push(cur);
    return cells.map(c => c.trim());
  };
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

const NORMALIZED_FIELD_LOOKUP: Record<string, BulkImportField> = {
  'employee number': 'Employee Number',
  'employee no': 'Employee Number',
  'emp number': 'Employee Number',
  'first name': 'First Name',
  'last name': 'Last Name',
  'work email': 'Work Email',
  'email': 'Work Email',
  'department': 'Department',
  'position': 'Position',
  'start date': 'Start Date',
  'employment type': 'Employment Type'
};

/** Auto-maps source headers to known target fields by normalized name match. */
export function autoMapColumns(headers: string[]): BulkImportColumnMapping {
  const mapping: BulkImportColumnMapping = {};
  for (const header of headers) {
    const key = header.trim().toLowerCase();
    mapping[header] = NORMALIZED_FIELD_LOOKUP[key] ?? '';
  }
  return mapping;
}

export function getUnmappedRequiredFields(mapping: BulkImportColumnMapping): BulkImportField[] {
  const mapped = new Set(Object.values(mapping));
  return BULK_IMPORT_REQUIRED_COLUMNS.filter(f => !mapped.has(f));
}

/** Builds typed rows from raw CSV rows + header/mapping. */
export function buildImportRows(
  headers: string[],
  rows: string[][],
  mapping: BulkImportColumnMapping
): BulkImportRow[] {
  const fieldIndex: Partial<Record<BulkImportField, number>> = {};
  headers.forEach((h, i) => {
    const field = mapping[h];
    if (field) fieldIndex[field] = i;
  });

  return rows.map((cells, idx) => {
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => { raw[h] = cells[i] ?? ''; });
    const get = (field: BulkImportField) => {
      const i = fieldIndex[field];
      return i === undefined ? '' : (cells[i] ?? '').trim();
    };
    return {
      rowIndex: idx,
      raw,
      employeeNumber: get('Employee Number'),
      firstName: get('First Name'),
      lastName: get('Last Name'),
      workEmail: get('Work Email'),
      departmentName: get('Department'),
      positionName: get('Position'),
      startDate: get('Start Date'),
      employmentType: get('Employment Type'),
      resolvedDepartmentId: null,
      resolvedPositionId: null,
      reportingManagerLabel: null,
      errors: [],
      warnings: [],
      skip: false
    };
  });
}

/**
 * Resolves department/position names to ids, applies hard-error and warning checks.
 * Returns a new array (does not mutate input rows).
 */
export function validateImportRows(
  rows: BulkImportRow[],
  departments: Department[],
  positions: Position[],
  assignments: PositionAssignment[],
  existingEmployees: Employee[]
): BulkImportRow[] {
  const seenEmails = new Map<string, number>();
  const seenEmpNumbers = new Map<string, number>();
  const existingEmails = new Set(existingEmployees.map(e => e.email.toLowerCase()));

  // Track additional capacity consumed by this batch per position.
  const batchPositionCounts = new Map<string, number>();

  return rows.map(row => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!row.employeeNumber) errors.push('Missing employee number.');
    if (!row.firstName) errors.push('Missing first name.');
    if (!row.lastName) errors.push('Missing last name.');
    if (!row.workEmail) errors.push('Missing work email.');
    if (!row.startDate) errors.push('Missing start date.');
    if (!row.employmentType) errors.push('Missing employment type.');

    const emailKey = row.workEmail.toLowerCase();
    if (emailKey) {
      if (existingEmails.has(emailKey)) errors.push('Duplicate work email (already exists).');
      else if (seenEmails.has(emailKey)) errors.push('Duplicate work email (duplicate in file).');
      seenEmails.set(emailKey, (seenEmails.get(emailKey) ?? 0) + 1);
    }

    const empKey = row.employeeNumber.toLowerCase();
    if (empKey) {
      if (seenEmpNumbers.has(empKey)) errors.push('Duplicate employee number (duplicate in file).');
      seenEmpNumbers.set(empKey, (seenEmpNumbers.get(empKey) ?? 0) + 1);
    }

    const department = departments.find(d => d.name.toLowerCase() === row.departmentName.toLowerCase());
    const resolvedDepartmentId = department?.id ?? null;
    if (row.departmentName && !department) errors.push('Unknown department.');

    const position = positions.find(p => p.name.toLowerCase() === row.positionName.toLowerCase());
    const resolvedPositionId = position?.id ?? null;
    if (row.positionName && !position) errors.push('Unknown position.');

    let reportingManagerLabel: string | null = null;

    if (position) {
      if (department && position.departmentId !== department.id) {
        errors.push('Position does not belong to department.');
      }

      const { count, capacity } = getPositionOccupancy(position.id, position, assignments);
      const consumedByBatch = batchPositionCounts.get(position.id) ?? 0;
      const projected = count + consumedByBatch + 1;
      if (projected > capacity) {
        errors.push('Position capacity exceeded.');
      } else {
        batchPositionCounts.set(position.id, consumedByBatch + 1);
        if (projected / capacity >= 0.8) {
          warnings.push('Position near capacity.');
        }
      }

      if (!position.reportsToPositionId) {
        warnings.push('Root position / no reporting manager.');
      } else {
        const preview = getReportingManagerPreviewForPosition(position, positions, assignments, existingEmployees);
        reportingManagerLabel = preview.label;
        if (preview.warning || preview.label === 'Not resolved') {
          warnings.push('Reporting manager unresolved.');
        }
      }

      if (department) {
        const headAssignments = getActiveAssignmentsForPosition(department.headPositionId ?? '', assignments);
        if (department.headPositionId && headAssignments.length === 0) {
          warnings.push('Parent position vacant.');
        }
      }
    }

    return {
      ...row,
      resolvedDepartmentId,
      resolvedPositionId,
      reportingManagerLabel,
      errors,
      warnings
    };
  });
}

export function summarizeRows(rows: BulkImportRow[]): { valid: number; warning: number; failed: number; skipped: number } {
  let valid = 0, warning = 0, failed = 0, skipped = 0;
  for (const row of rows) {
    if (row.skip) { skipped++; continue; }
    if (row.errors.length > 0) failed++;
    else if (row.warnings.length > 0) warning++;
    else valid++;
  }
  return { valid, warning, failed, skipped };
}

export function downloadErrorReportCsv(fileName: string, rows: BulkImportRow[]): void {
  const failed = rows.filter(r => r.errors.length > 0);
  const header = ['Row', 'Employee Number', 'First Name', 'Last Name', 'Work Email', 'Errors'];
  const lines = [header.join(',')];
  for (const row of failed) {
    lines.push([
      String(row.rowIndex + 1),
      row.employeeNumber,
      row.firstName,
      row.lastName,
      row.workEmail,
      `"${row.errors.join('; ')}"`
    ].join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/\.[^.]+$/, '')}-errors.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
