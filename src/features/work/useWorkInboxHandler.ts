import { useCallback, useEffect, useRef } from 'react';
import type { InboxActionHandler } from '../../core/notifications/inbox-context';
import type { AppNotification } from '../../shared/types/notification.types';
import {
  buildRejectionNotification,
  buildVisibilityChangeNotification,
} from './workInboxHelpers';
import {
  CURRENT_USER_ID,
  visibilityLabel,
  type ProjectMember,
  type ProjectVisibility,
  type RelatedProjectLink,
  type WorkProject,
} from './workMockData';

interface WorkInboxState {
  projects: WorkProject[];
  relatedProjects: RelatedProjectLink[];
  setProjects: React.Dispatch<React.SetStateAction<WorkProject[]>>;
  setRelatedProjects: React.Dispatch<React.SetStateAction<RelatedProjectLink[]>>;
}

export function useWorkInboxHandler(
  registerActionHandler: (handler: InboxActionHandler | null) => void,
  state: WorkInboxState,
): void {
  const stateRef = useRef(state);
  stateRef.current = state;

  const handler = useCallback<InboxActionHandler>((notification, actionId) => {
    const meta = notification.workMeta;
    if (!meta) return { handled: false };

    const { projects, setProjects, setRelatedProjects } = stateRef.current;
    const followUp: AppNotification[] = [];

    switch (meta.kind) {
      case 'project_invite': {
        if (!meta.projectId || !meta.memberId) return { handled: false };
        if (actionId === 'accept') {
          setProjects(prev => prev.map(p => {
            if (p.id !== meta.projectId) return p;
            return {
              ...p,
              members: p.members.map(m =>
                m.id === meta.memberId ? { ...m, status: 'active' as const } : m,
              ),
            };
          }));
          return { handled: true };
        }
        if (actionId === 'decline') {
          setProjects(prev => prev.map(p => {
            if (p.id !== meta.projectId) return p;
            return { ...p, members: p.members.filter(m => m.id !== meta.memberId) };
          }));
          return { handled: true };
        }
        return { handled: false };
      }

      case 'workspace_participation': {
        if (!meta.projectId || !meta.pendingWorkspaceLinkId) return { handled: false };
        const project = projects.find(p => p.id === meta.projectId);
        if (!project) return { handled: false };

        if (actionId === 'approve' || actionId === 'limit_access') {
          const wsId = meta.workspaceId;
          const limited = actionId === 'limit_access';
          setProjects(prev => prev.map(p => {
            if (p.id !== meta.projectId) return p;
            const updatedLinks = p.linkedWorkspaces.map(lw => {
              if (lw.workspaceId !== meta.pendingWorkspaceLinkId) return lw;
              if (wsId && !wsId.startsWith('ws-req-')) {
                return {
                  workspaceId: wsId,
                  status: 'active' as const,
                  role: limited ? 'Limited context link' : 'Linked',
                };
              }
              return {
                ...lw,
                status: 'active' as const,
                role: limited ? 'Limited context link' : lw.role,
              };
            });
            const workspaceIds = wsId && !wsId.startsWith('ws-req-') && !p.workspaceIds.includes(wsId)
              ? [...p.workspaceIds, wsId]
              : p.workspaceIds;
            return { ...p, linkedWorkspaces: updatedLinks, workspaceIds };
          }));
          if (meta.requesterId) {
            followUp.push(buildRejectionNotification({
              id: `inbox-ws-approved-${Date.now()}`,
              recipientId: meta.requesterId,
              title: 'Workspace participation approved',
              message: `Your workspace participation request for ${project.name} was approved${limited ? ' with limited access' : ''}.`,
            }));
          }
          return { handled: true, followUp };
        }

        if (actionId === 'reject') {
          setProjects(prev => prev.map(p => {
            if (p.id !== meta.projectId) return p;
            return {
              ...p,
              linkedWorkspaces: p.linkedWorkspaces.map(lw =>
                lw.workspaceId === meta.pendingWorkspaceLinkId
                  ? { ...lw, status: 'rejected' as const }
                  : lw,
              ),
            };
          }));
          if (meta.requesterId) {
            followUp.push(buildRejectionNotification({
              id: `inbox-ws-rejected-${Date.now()}`,
              recipientId: meta.requesterId,
              title: 'Workspace participation rejected',
              message: `Your workspace participation request for ${project.name} was rejected.`,
            }));
          }
          return { handled: true, followUp };
        }
        return { handled: false };
      }

      case 'project_link': {
        if (!meta.projectId || !meta.relatedLinkId) return { handled: false };
        const source = projects.find(p => p.id === meta.projectId);
        const targetId = meta.targetProjectId;
        const target = targetId ? projects.find(p => p.id === targetId) : undefined;

        if (actionId === 'approve') {
          setRelatedProjects(prev => prev.map(l => {
            if (l.id !== meta.relatedLinkId) return l;
            return {
              ...l,
              status: 'active',
              relatedProjectId: targetId ?? l.relatedProjectId,
            };
          }));
          if (meta.requesterId) {
            followUp.push(buildRejectionNotification({
              id: `inbox-pl-approved-${Date.now()}`,
              recipientId: meta.requesterId,
              title: 'Project link approved',
              message: `Your request to link ${source?.name ?? 'a project'} with ${target?.name ?? 'the target project'} was approved.`,
            }));
          }
          return { handled: true, followUp };
        }

        if (actionId === 'reject') {
          setRelatedProjects(prev => prev.map(l =>
            l.id === meta.relatedLinkId ? { ...l, status: 'rejected' } : l,
          ));
          if (meta.requesterId) {
            followUp.push(buildRejectionNotification({
              id: `inbox-pl-rejected-${Date.now()}`,
              recipientId: meta.requesterId,
              title: 'Project link rejected',
              message: `Your request to link ${source?.name ?? 'a project'} with ${target?.name ?? 'the target project'} was rejected.`,
            }));
          }
          return { handled: true, followUp };
        }
        return { handled: false };
      }

      default:
        return { handled: false };
    }
  }, []);

  useEffect(() => {
    registerActionHandler(handler);
    return () => registerActionHandler(null);
  }, [handler, registerActionHandler]);
}

export function notifyVisibilityChange(
  project: WorkProject,
  nextVisibility: ProjectVisibility,
  addInboxItems: (items: AppNotification[]) => void,
): void {
  const label = visibilityLabel(nextVisibility);
  const items = project.members
    .filter((m: ProjectMember) => m.status === 'active' && m.employeeId !== CURRENT_USER_ID)
    .map(m => buildVisibilityChangeNotification({
      id: `inbox-vis-${project.id}-${m.employeeId}-${Date.now()}`,
      recipientId: m.employeeId,
      projectId: project.id,
      projectName: project.name,
      visibility: label,
    }));
  addInboxItems(items);
}
