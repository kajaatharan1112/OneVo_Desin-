export type NotificationFilter = 'new' | 'past';

export type NotificationCategory =
  | 'approval'
  | 'meeting'
  | 'task-review'
  | 'todo-request'
  | 'warning';

export type NotificationActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface NotificationAction {
  id: string;
  label: string;
  variant: NotificationActionVariant;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timeLabel: string;
  filter: NotificationFilter;
  actions: NotificationAction[];
  /** When set, notification is shown only to this user in employee view. */
  recipientId?: string;
  workMeta?: WorkInboxMeta;
  accessApprovalMeta?: { requestId: string };
  leaveMeta?: { requestId: string; leaveType?: string };
  attendanceMeta?: { requestId: string; type: 'overtime' | 'correction' };
}

export type WorkInboxKind =
  | 'project_invite'
  | 'workspace_participation'
  | 'project_link'
  | 'visibility_changed'
  | 'request_rejected';

export interface WorkInboxMeta {
  kind: WorkInboxKind;
  projectId?: string;
  relatedLinkId?: string;
  targetProjectId?: string;
  workspaceId?: string;
  pendingWorkspaceLinkId?: string;
  memberId?: string;
  employeeId?: string;
  requesterId?: string;
  accessLevel?: string;
  visibility?: string;
}
