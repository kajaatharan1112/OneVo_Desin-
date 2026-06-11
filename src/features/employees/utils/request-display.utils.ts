import type { EmployeeRequest, RequestRowAction } from '../types/employee-requests.types';

export function formatRequestRowMeta(request: EmployeeRequest): string {
  const parts: string[] = [request.with];

  if (request.expected) {
    parts.push(request.expected);
  }

  if (request.nextAction && !request.rowAction) {
    const normalize = (value: string) => value.trim().toLowerCase();
    const isDuplicate =
      normalize(request.nextAction) === normalize(request.expected ?? '') ||
      parts.some((part) => normalize(part) === normalize(request.nextAction));

    if (!isDuplicate) {
      parts.push(request.nextAction);
    }
  }

  return parts.join(' · ');
}

export function getRowActionLabel(action: RequestRowAction): string {
  if (action === 'upload-receipt') {
    return 'Upload Receipt';
  }

  return 'View Reason';
}
