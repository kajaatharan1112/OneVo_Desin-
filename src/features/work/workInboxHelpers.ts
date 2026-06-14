import type { AppNotification } from '../../shared/types/notification.types';
import type { ProjectAccessLevel, RelatedProjectRelationship } from './workMockData';
import {
  CURRENT_USER_ID,
  employeeName,
  relationshipLabel,
  workspaceName,
} from './workMockData';

export function accessLevelLabel(level: ProjectAccessLevel): string {
  const map: Record<ProjectAccessLevel, string> = {
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };
  return map[level];
}

export function buildProjectInviteNotification(input: {
  id: string;
  recipientId: string;
  projectId: string;
  projectName: string;
  memberId: string;
  accessLevel: ProjectAccessLevel;
  inviterId?: string;
}): AppNotification {
  return {
    id: input.id,
    recipientId: input.recipientId,
    category: 'todo-request',
    title: 'Project invitation',
    message: `You were invited to join ${input.projectName} as ${accessLevelLabel(input.accessLevel)}.`,
    timeLabel: 'Just now',
    filter: 'new',
    actions: [
      { id: 'accept', label: 'Accept', variant: 'primary' },
      { id: 'decline', label: 'Decline', variant: 'danger' },
    ],
    workMeta: {
      kind: 'project_invite',
      projectId: input.projectId,
      memberId: input.memberId,
      employeeId: input.recipientId,
      accessLevel: input.accessLevel,
      requesterId: input.inviterId ?? CURRENT_USER_ID,
    },
  };
}

export function buildWorkspaceParticipationNotification(input: {
  id: string;
  recipientId: string;
  projectId: string;
  projectName: string;
  workspaceLabel: string;
  requesterId: string;
  pendingWorkspaceLinkId: string;
  workspaceId?: string;
}): AppNotification {
  return {
    id: input.id,
    recipientId: input.recipientId,
    category: 'approval',
    title: 'Workspace participation request',
    message: `${employeeName(input.requesterId)} wants to link ${input.workspaceLabel} to ${input.projectName}.`,
    timeLabel: 'Just now',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary' },
      { id: 'reject', label: 'Reject', variant: 'danger' },
      { id: 'limit_access', label: 'Limit access', variant: 'secondary' },
    ],
    workMeta: {
      kind: 'workspace_participation',
      projectId: input.projectId,
      workspaceId: input.workspaceId,
      pendingWorkspaceLinkId: input.pendingWorkspaceLinkId,
      requesterId: input.requesterId,
    },
  };
}

export function buildProjectLinkNotification(input: {
  id: string;
  recipientId: string;
  sourceProjectId: string;
  sourceProjectName: string;
  targetProjectId: string;
  targetProjectName: string;
  relatedLinkId: string;
  requesterId: string;
  relationship: RelatedProjectRelationship;
}): AppNotification {
  return {
    id: input.id,
    recipientId: input.recipientId,
    category: 'approval',
    title: 'Project link request',
    message: `${employeeName(input.requesterId)} wants to link ${input.sourceProjectName} with ${input.targetProjectName}.`,
    timeLabel: 'Just now',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary' },
      { id: 'reject', label: 'Reject', variant: 'danger' },
    ],
    workMeta: {
      kind: 'project_link',
      projectId: input.sourceProjectId,
      targetProjectId: input.targetProjectId,
      relatedLinkId: input.relatedLinkId,
      requesterId: input.requesterId,
      accessLevel: relationshipLabel(input.relationship),
    },
  };
}

export function buildRejectionNotification(input: {
  id: string;
  recipientId: string;
  title: string;
  message: string;
}): AppNotification {
  return {
    id: input.id,
    recipientId: input.recipientId,
    category: 'warning',
    title: input.title,
    message: input.message,
    timeLabel: 'Just now',
    filter: 'new',
    actions: [],
    workMeta: { kind: 'request_rejected' },
  };
}

export function buildVisibilityChangeNotification(input: {
  id: string;
  recipientId: string;
  projectId: string;
  projectName: string;
  visibility: string;
}): AppNotification {
  return {
    id: input.id,
    recipientId: input.recipientId,
    category: 'task-review',
    title: 'Project access updated',
    message: `Access to ${input.projectName} changed to ${input.visibility}.`,
    timeLabel: 'Just now',
    filter: 'new',
    actions: [],
    workMeta: {
      kind: 'visibility_changed',
      projectId: input.projectId,
      visibility: input.visibility,
    },
  };
}

export function workspaceLabelForRequest(
  workspaceId: string | undefined,
  contextHint?: string,
): string {
  if (workspaceId && !workspaceId.startsWith('ws-req-')) {
    return workspaceName(workspaceId);
  }
  if (contextHint?.trim()) {
    return contextHint.trim();
  }
  return 'restricted workspace context';
}
