import type { AccessAuditEntry } from './accessTypes';
import type { AuditLogEntry } from '../admin/adminMockData';

export function accessAuditToLogEntry(entry: AccessAuditEntry): AuditLogEntry {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    actorName: entry.actorName,
    actorId: entry.actorEmployeeId,
    action: `position.${entry.actionType}`,
    resourceType: 'PositionAccess',
    resourceName: entry.employeeName,
    resourceId: entry.employeeId,
    module: 'People',
    ipAddress: '—',
    status: entry.status,
    beforeValues: {
      position: entry.oldPositionName,
      roleScope: entry.oldRoleScope
    },
    afterValues: {
      position: entry.newPositionName,
      roleScope: entry.newRoleScope,
      effectiveDate: entry.effectiveDate
    },
    correlationId: entry.id
  };
}
