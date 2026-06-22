import type { AppNotification } from '../../shared/types/notification.types';
import type { PositionAccessApprovalRequest } from './accessTypes';
import type { EmployeeId } from '../employees/types/employee.types';
import { orgEmployeeIdForProfile } from './employeeProfileMap';
import { useAccessStore } from './accessStore';
import { canManageAccess, getEffectivePermissionCodes } from './accessUtils';

export function accessApprovalToNotification(
  request: PositionAccessApprovalRequest
): AppNotification {
  const actionLabel = request.actionType === 'promotion' ? 'promotion' : 'transfer';
  return {
    id: `access-notif-${request.id}`,
    category: 'approval',
    title: 'Position access approval requested',
    message: `${request.requestedByName} requested a ${actionLabel} for ${request.employeeName} to ${request.targetPositionName}. Review position and access changes.`,
    timeLabel: 'Just now',
    filter: 'new',
    actions: [{ id: 'review-access', label: 'Review', variant: 'primary' }],
    accessApprovalMeta: { requestId: request.id }
  };
}

function actorCanApprove(profileId: EmployeeId): boolean {
  const orgEmpId = orgEmployeeIdForProfile(profileId);
  const grants = useAccessStore
    .getState()
    .grants.filter(g => g.employeeId === orgEmpId && g.status === 'active');
  return canManageAccess(getEffectivePermissionCodes(grants));
}

export function getAccessApprovalNotifications(
  pendingRequests: PositionAccessApprovalRequest[],
  profileId: EmployeeId,
  requesterNotices: AppNotification[] = []
): AppNotification[] {
  const forRequester = requesterNotices.filter(
    n => !n.recipientId || n.recipientId === profileId
  );

  if (!actorCanApprove(profileId)) return forRequester;

  const approverNotices = pendingRequests
    .filter(r => r.status === 'pending')
    .map(accessApprovalToNotification);

  return [...approverNotices, ...forRequester];
}
