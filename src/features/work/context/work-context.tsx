import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useInbox } from '../../../core/notifications/inbox-context';
import {
  ALL_WORKSPACES_ID,
  CURRENT_USER_ID,
  DEFAULT_PROJECT_LABELS,
  DEFAULT_WORK_ITEM_STATES,
  deriveProjectKey,
  MOCK_CYCLES,
  MOCK_DOCUMENTS,
  MOCK_MILESTONES,
  MOCK_PROJECTS,
  MOCK_RELATED_PROJECTS,
  MOCK_TASKS,
  MOCK_WORKSPACES,
  countOpenTasks,
  nextTaskKey,
  projectAdminIds,
  resolveProjectByKey,
  workspaceOwnerId,
  type PlannerMilestone,
  type ProjectAccessLevel,
  type ProjectCycle,
  type ProjectMember,
  type ProjectVisibility,
  type RelatedProjectLink,
  type RelatedProjectRelationship,
  type ParticipatingWorkspaceAccess,
  type TaskPriority,
  type TaskStatus,
  type WorkDocument,
  type WorkProject,
  type WorkTask,
  type WorkWorkspace,
} from '../workMockData';
import {
  buildProjectInviteNotification,
  buildProjectLinkNotification,
  buildWorkspaceParticipationNotification,
  workspaceLabelForRequest,
} from '../workInboxHelpers';
import { notifyVisibilityChange, useWorkInboxHandler } from '../useWorkInboxHandler';
import { resolveProjectIconType } from '../components/project/projectMedia';
import type { ProjectNavId } from '../projectNav';
import type { ProjectSettingsSectionId } from '../projectSettingsNav';

export type { ProjectNavId };
export type { ProjectSettingsSectionId };

type WorkModal = 'create-workspace' | 'manage-workspaces' | 'create-project' | null;

interface CreateProjectInput {
  name: string;
  key: string;
  description: string;
  workspaceIds: string[];
  primaryWorkspaceId: string;
  visibility: ProjectVisibility;
  leadId: string;
  icon: string;
  iconType?: 'emoji' | 'icon';
  iconColor: string | null;
  coverColor: string;
  coverImage: string | null;
  invites: { employeeId: string; accessLevel: ProjectAccessLevel; workspaceSourceId: string | null }[];
}

interface AddTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate?: string | null;
  linkedWorkspaceId?: string | null;
  labels?: string[];
}

interface WorkContextValue {
  workspaceFilterId: string;
  setWorkspaceFilterId: (id: string) => void;
  workspaces: WorkWorkspace[];
  addWorkspace: (workspace: WorkWorkspace) => void;
  projects: WorkProject[];
  tasks: WorkTask[];
  cycles: ProjectCycle[];
  milestones: PlannerMilestone[];
  documents: WorkDocument[];
  relatedProjects: RelatedProjectLink[];
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  projectNavId: ProjectNavId;
  analyticsOpen: boolean;
  setProjectNavId: (id: ProjectNavId) => void;
  openProject: (id: string, nav?: ProjectNavId) => void;
  closeProject: () => void;
  returnToProjectList: () => void;
  createProject: (input: CreateProjectInput) => string;
  updateProject: (id: string, patch: Partial<WorkProject>) => void;
  addTask: (input: AddTaskInput) => void;
  updateTask: (id: string, patch: Partial<WorkTask>) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openAnalytics: () => void;
  closeAnalytics: () => void;
  addCycle: (cycle: ProjectCycle) => void;
  addMilestone: (milestone: PlannerMilestone) => void;
  updateDocument: (id: string, patch: Partial<WorkDocument>) => void;
  addProjectMember: (projectId: string, employeeId: string, accessLevel: ProjectAccessLevel, workspaceSourceId: string | null) => void;
  removeProjectMember: (projectId: string, memberId: string) => void;
  updateProjectMemberAccess: (projectId: string, memberId: string, accessLevel: ProjectAccessLevel) => void;
  linkWorkspace: (
    projectId: string,
    workspaceId: string,
    options?: { role?: string; access?: ParticipatingWorkspaceAccess; status?: 'active' | 'pending' },
  ) => void;
  updateParticipatingWorkspace: (
    projectId: string,
    workspaceId: string,
    patch: { role?: string; access?: ParticipatingWorkspaceAccess },
  ) => void;
  unlinkWorkspace: (projectId: string, workspaceId: string) => void;
  requestWorkspaceLink: (
    projectId: string,
    workspaceId: string,
    reason: string,
    options?: { role?: string; access?: ParticipatingWorkspaceAccess },
  ) => void;
  requestWorkspaceParticipation: (projectId: string | null, reason: string, contextHint?: string) => void;
  addRelatedProject: (projectId: string, relatedProjectId: string, relationship: RelatedProjectRelationship) => void;
  requestRelatedProjectLink: (projectId: string, relationship: RelatedProjectRelationship, reason: string, manualLabel?: string, manualKey?: string) => void;
  removeRelatedProject: (linkId: string) => void;
  activeModal: WorkModal;
  openModal: (modal: WorkModal) => void;
  closeModal: () => void;
  workspaceFilterLabel: string;
  getProject: (id: string) => WorkProject | undefined;
  addWorkItemSignal: number;
  requestAddWorkItem: () => void;
  addCycleSignal: number;
  requestAddCycle: () => void;
  projectSettingsOpen: boolean;
  settingsSectionId: ProjectSettingsSectionId;
  openProjectSettings: (section?: ProjectSettingsSectionId) => void;
  closeProjectSettings: () => void;
  setSettingsSectionId: (section: ProjectSettingsSectionId) => void;
  switchSettingsProject: (projectId: string) => void;
}

const WorkContext = createContext<WorkContextValue | null>(null);

export const WorkProvider: React.FC<{
  children: React.ReactNode;
  onNavigateToList?: (id: string) => void;
}> = ({ children, onNavigateToList }) => {
  const { addInboxItem, addInboxItems, registerActionHandler } = useInbox();
  const [workspaceFilterId, setWorkspaceFilterId] = useState(ALL_WORKSPACES_ID);
  const [workspaces, setWorkspaces] = useState<WorkWorkspace[]>(MOCK_WORKSPACES);
  const [projects, setProjects] = useState<WorkProject[]>(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<WorkTask[]>(MOCK_TASKS);
  const [cycles, setCycles] = useState<ProjectCycle[]>(MOCK_CYCLES);
  const [milestones, setMilestones] = useState<PlannerMilestone[]>(MOCK_MILESTONES);
  const [documents, setDocuments] = useState<WorkDocument[]>(MOCK_DOCUMENTS);
  const [relatedProjects, setRelatedProjects] = useState<RelatedProjectLink[]>(MOCK_RELATED_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [projectNavId, setProjectNavId] = useState<ProjectNavId>('work-items');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<WorkModal>(null);
  const [addWorkItemSignal, setAddWorkItemSignal] = useState(0);
  const [addCycleSignal, setAddCycleSignal] = useState(0);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [settingsSectionId, setSettingsSectionId] = useState<ProjectSettingsSectionId>('general');
  const [settingsReturnNavId, setSettingsReturnNavId] = useState<ProjectNavId>('work-items');

  useWorkInboxHandler(registerActionHandler, {
    projects,
    relatedProjects,
    setProjects,
    setRelatedProjects,
  });

  const addWorkspace = useCallback((workspace: WorkWorkspace) => {
    setWorkspaces(prev => [...prev, workspace]);
    setWorkspaceFilterId(workspace.id);
  }, []);

  const workspaceFilterLabel = useMemo(() => {
    if (workspaceFilterId === ALL_WORKSPACES_ID) return 'All Workspaces';
    return workspaces.find(w => w.id === workspaceFilterId)?.name ?? 'All Workspaces';
  }, [workspaceFilterId, workspaces]);

  const getProject = useCallback((id: string) => projects.find(p => p.id === id), [projects]);

  const openProject = useCallback((id: string, nav: ProjectNavId = 'work-items') => {
    setSelectedProjectId(id);
    setProjectNavId(nav);
    setProjectSettingsOpen(false);
  }, []);

  const closeProject = useCallback(() => {
    setSelectedProjectId(null);
    setProjectNavId('work-items');
    setProjectSettingsOpen(false);
  }, []);

  const returnToProjectList = useCallback(() => {
    setSelectedProjectId(null);
    setProjectNavId('work-items');
    setProjectSettingsOpen(false);
    onNavigateToList?.('projects');
  }, [onNavigateToList]);

  const openProjectSettings = useCallback((section: ProjectSettingsSectionId = 'general') => {
    setSettingsReturnNavId(projectNavId);
    setSettingsSectionId(section);
    setProjectSettingsOpen(true);
  }, [projectNavId]);

  const closeProjectSettings = useCallback(() => {
    setProjectSettingsOpen(false);
    setProjectNavId(settingsReturnNavId);
  }, [settingsReturnNavId]);

  const switchSettingsProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  const requestAddWorkItem = useCallback(() => {
    setProjectNavId('work-items');
    setAddWorkItemSignal(n => n + 1);
  }, []);

  const requestAddCycle = useCallback(() => {
    setProjectNavId('cycle');
    setAddCycleSignal(n => n + 1);
  }, []);

  const createProject = useCallback((input: CreateProjectInput): string => {
    const id = `proj-${Date.now()}`;
    const existingKeys = projects.map(p => p.key);
    const key = (input.key.trim() || deriveProjectKey(input.name, existingKeys)).toUpperCase();
    const primaryWs = input.primaryWorkspaceId;
    const creatorMember: ProjectMember = {
      id: `pm-${Date.now()}`,
      employeeId: CURRENT_USER_ID,
      accessLevel: 'admin',
      status: 'active',
      workspaceSourceId: primaryWs,
    };
    const invitedMembers = input.invites
      .filter(inv => inv.employeeId !== CURRENT_USER_ID)
      .map((inv, i) => ({
        id: `pm-${Date.now()}-inv-${i}`,
        employeeId: inv.employeeId,
        accessLevel: inv.accessLevel,
        status: 'invited' as const,
        workspaceSourceId: inv.workspaceSourceId,
      }));
    const newProject: WorkProject = {
      id,
      key,
      name: input.name,
      description: input.description,
      status: 'active',
      health: 'on_track',
      workspaceIds: input.workspaceIds,
      linkedWorkspaces: [{
        workspaceId: primaryWs,
        status: 'active' as const,
        role: 'Main team',
        access: input.visibility === 'public_workspace' ? 'workspace_visible' : 'private',
      }],
      members: [creatorMember, ...invitedMembers],
      openTasks: 0,
      dueDate: null,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      defaultPriority: 'Medium',
      timezone: 'UTC',
      icon: input.icon,
      iconType: input.iconType ?? resolveProjectIconType(input.icon),
      iconColor: input.iconColor,
      coverColor: input.coverColor,
      coverImage: input.coverImage,
      leadId: input.leadId,
      labels: DEFAULT_PROJECT_LABELS.slice(0, 6),
      workItemStates: DEFAULT_WORK_ITEM_STATES,
      approvalRequired: false,
      defaultApproverId: null,
      visibility: input.visibility,
      primaryWorkspaceId: primaryWs,
    };
    setProjects(prev => [...prev, newProject]);
    if (input.visibility === 'private' && invitedMembers.length > 0) {
      addInboxItems(
        invitedMembers.map(m =>
          buildProjectInviteNotification({
            id: `inbox-invite-${m.id}`,
            recipientId: m.employeeId,
            projectId: id,
            projectName: input.name,
            memberId: m.id,
            accessLevel: m.accessLevel,
          }),
        ),
      );
    }
    return id;
  }, [projects, addInboxItems]);

  const updateProject = useCallback((id: string, patch: Partial<WorkProject>) => {
    const existing = projects.find(p => p.id === id);
    if (existing && patch.visibility && patch.visibility !== existing.visibility) {
      notifyVisibilityChange(existing, patch.visibility, addInboxItems);
    }
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }, [projects, addInboxItems]);

  const addTask = useCallback((input: AddTaskInput) => {
    const project = projects.find(p => p.id === input.projectId);
    if (!project) return;
    const projectTasks = tasks.filter(t => t.projectId === input.projectId);
    const key = nextTaskKey(project.key, projectTasks);
    const task: WorkTask = {
      id: `task-${Date.now()}`,
      key,
      title: input.title,
      description: input.description ?? '',
      projectId: input.projectId,
      projectName: project.name,
      projectKey: project.key,
      workspaceIds: project.workspaceIds,
      linkedWorkspaceId: input.linkedWorkspaceId ?? null,
      assigneeId: input.assigneeId,
      status: input.status,
      dueDate: input.dueDate ?? null,
      priority: input.priority,
      labels: input.labels ?? [],
    };
    setTasks(prev => {
      const next = [...prev, task];
      setProjects(ps => ps.map(p => {
        if (p.id !== input.projectId) return p;
        const open = countOpenTasks(next.filter(t => t.projectId === p.id));
        return { ...p, openTasks: open };
      }));
      return next;
    });
  }, [projects, tasks]);

  const updateTask = useCallback((id: string, patch: Partial<WorkTask>) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t));
      const projectId = prev.find(t => t.id === id)?.projectId;
      if (projectId) {
        setProjects(ps => ps.map(p => {
          if (p.id !== projectId) return p;
          return { ...p, openTasks: countOpenTasks(next.filter(t => t.projectId === p.id)) };
        }));
      }
      return next;
    });
  }, []);

  const addProjectMember = useCallback((projectId: string, employeeId: string, accessLevel: ProjectAccessLevel, workspaceSourceId: string | null) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.members.some(m => m.employeeId === employeeId)) return;
    const memberId = `pm-${Date.now()}`;
    const status = project.visibility === 'private' ? 'invited' as const : 'active' as const;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        members: [...p.members, {
          id: memberId,
          employeeId,
          accessLevel,
          status,
          workspaceSourceId,
        }],
      };
    }));
    if (project.visibility === 'private' && employeeId !== CURRENT_USER_ID) {
      addInboxItem(buildProjectInviteNotification({
        id: `inbox-invite-${memberId}`,
        recipientId: employeeId,
        projectId,
        projectName: project.name,
        memberId,
        accessLevel,
      }));
    }
  }, [projects, addInboxItem]);

  const removeProjectMember = useCallback((projectId: string, memberId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, members: p.members.filter(m => m.id !== memberId) };
    }));
  }, []);

  const updateProjectMemberAccess = useCallback((projectId: string, memberId: string, accessLevel: ProjectAccessLevel) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        members: p.members.map(m => (m.id === memberId ? { ...m, accessLevel } : m)),
      };
    }));
  }, []);

  const linkWorkspace = useCallback((
    projectId: string,
    workspaceId: string,
    options?: { role?: string; access?: ParticipatingWorkspaceAccess; status?: 'active' | 'pending' },
  ) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      if (p.workspaceIds.includes(workspaceId)) return p;
      const status = options?.status ?? 'active';
      return {
        ...p,
        workspaceIds: status === 'active' ? [...p.workspaceIds, workspaceId] : p.workspaceIds,
        linkedWorkspaces: [...p.linkedWorkspaces, {
          workspaceId,
          status,
          role: options?.role ?? 'Supporting team',
          access: options?.access ?? 'private',
        }],
      };
    }));
  }, []);

  const updateParticipatingWorkspace = useCallback((
    projectId: string,
    workspaceId: string,
    patch: { role?: string; access?: ParticipatingWorkspaceAccess },
  ) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        linkedWorkspaces: p.linkedWorkspaces.map(lw =>
          lw.workspaceId === workspaceId ? { ...lw, ...patch } : lw,
        ),
      };
    }));
  }, []);

  const unlinkWorkspace = useCallback((projectId: string, workspaceId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        workspaceIds: p.workspaceIds.filter(id => id !== workspaceId),
        linkedWorkspaces: p.linkedWorkspaces.filter(lw => lw.workspaceId !== workspaceId),
      };
    }));
  }, []);

  const requestWorkspaceLink = useCallback((
    projectId: string,
    workspaceId: string,
    reason: string,
    options?: { role?: string; access?: ParticipatingWorkspaceAccess },
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.linkedWorkspaces.some(lw => lw.workspaceId === workspaceId)) return;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        linkedWorkspaces: [...p.linkedWorkspaces, {
          workspaceId,
          status: 'pending',
          role: options?.role ?? 'Supporting team',
          access: options?.access ?? 'private',
        }],
      };
    }));
    const approverId = workspaceOwnerId(workspaceId);
    if (approverId && approverId !== CURRENT_USER_ID) {
      addInboxItem(buildWorkspaceParticipationNotification({
        id: `inbox-ws-${Date.now()}`,
        recipientId: approverId,
        projectId,
        projectName: project.name,
        workspaceLabel: workspaceLabelForRequest(workspaceId),
        requesterId: CURRENT_USER_ID,
        pendingWorkspaceLinkId: workspaceId,
        workspaceId,
      }));
    }
    void reason;
  }, [projects, addInboxItem]);

  const requestWorkspaceParticipation = useCallback((projectId: string | null, reason: string, contextHint?: string) => {
    if (!projectId) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const pendingId = `ws-req-${Date.now()}`;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        linkedWorkspaces: [
          ...p.linkedWorkspaces,
          {
            workspaceId: pendingId,
            status: 'pending' as const,
            role: contextHint?.trim() ? `Request: ${contextHint.trim()}` : `Request: ${reason.slice(0, 40)}`,
          },
        ],
      };
    }));
    const approverId = 'user-4';
    addInboxItem(buildWorkspaceParticipationNotification({
      id: `inbox-ws-part-${Date.now()}`,
      recipientId: approverId,
      projectId,
      projectName: project.name,
      workspaceLabel: workspaceLabelForRequest(undefined, contextHint),
      requesterId: CURRENT_USER_ID,
      pendingWorkspaceLinkId: pendingId,
    }));
  }, [projects, addInboxItem]);

  const openTaskDetail = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const closeTaskDetail = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const openAnalytics = useCallback(() => {
    setAnalyticsOpen(true);
  }, []);

  const closeAnalytics = useCallback(() => {
    setAnalyticsOpen(false);
  }, []);

  const addCycle = useCallback((cycle: ProjectCycle) => {
    setCycles(prev =>
      prev
        .map(c => (c.projectId === cycle.projectId && c.status === 'active' ? { ...c, status: 'completed' as const } : c))
        .concat(cycle)
    );
  }, []);

  const addMilestone = useCallback((milestone: PlannerMilestone) => {
    setMilestones(prev => [...prev, milestone]);
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<WorkDocument>) => {
    setDocuments(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const addRelatedProject = useCallback((projectId: string, relatedProjectId: string, relationship: RelatedProjectRelationship) => {
    const link: RelatedProjectLink = {
      id: `rp-${Date.now()}`,
      projectId,
      relatedProjectId,
      relationship,
      status: 'active',
    };
    setRelatedProjects(prev => [...prev, link]);
  }, []);

  const requestRelatedProjectLink = useCallback((
    projectId: string,
    relationship: RelatedProjectRelationship,
    reason: string,
    manualLabel?: string,
    manualKey?: string,
  ) => {
    const source = projects.find(p => p.id === projectId);
    if (!source) return;
    const linkId = `rp-${Date.now()}`;
    const target = manualKey?.trim() ? resolveProjectByKey(manualKey, projects) : undefined;
    const targetProjectId = target?.id;
    const link: RelatedProjectLink = {
      id: linkId,
      projectId,
      relatedProjectId: targetProjectId ?? null,
      relationship,
      status: 'pending',
      manualLabel: manualLabel?.trim() || 'Requested project',
      manualKey: manualKey?.trim(),
    };
    setRelatedProjects(prev => [...prev, link]);

    const approverId = target
      ? (projectAdminIds(target)[0] ?? target.leadId)
      : 'user-3';
    if (approverId && approverId !== CURRENT_USER_ID) {
      addInboxItem(buildProjectLinkNotification({
        id: `inbox-pl-${linkId}`,
        recipientId: approverId,
        sourceProjectId: projectId,
        sourceProjectName: source.name,
        targetProjectId: targetProjectId ?? 'unknown',
        targetProjectName: target?.name ?? (manualLabel?.trim() || 'requested project'),
        relatedLinkId: linkId,
        requesterId: CURRENT_USER_ID,
        relationship,
      }));
    }
    void reason;
  }, [projects, addInboxItem]);

  const removeRelatedProject = useCallback((linkId: string) => {
    setRelatedProjects(prev => prev.filter(l => l.id !== linkId));
  }, []);

  const value = useMemo<WorkContextValue>(() => ({
    workspaceFilterId,
    setWorkspaceFilterId,
    workspaces,
    addWorkspace,
    projects,
    tasks,
    cycles,
    milestones,
    documents,
    relatedProjects,
    selectedProjectId,
    selectedTaskId,
    projectNavId,
    analyticsOpen,
    setProjectNavId,
    openProject,
    closeProject,
    returnToProjectList,
    createProject,
    updateProject,
    addTask,
    updateTask,
    openTaskDetail,
    closeTaskDetail,
    openAnalytics,
    closeAnalytics,
    addCycle,
    addMilestone,
    updateDocument,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberAccess,
    linkWorkspace,
    updateParticipatingWorkspace,
    unlinkWorkspace,
    requestWorkspaceLink,
    requestWorkspaceParticipation,
    addRelatedProject,
    requestRelatedProjectLink,
    removeRelatedProject,
    activeModal,
    openModal: setActiveModal,
    closeModal: () => setActiveModal(null),
    workspaceFilterLabel,
    getProject,
    addWorkItemSignal,
    requestAddWorkItem,
    addCycleSignal,
    requestAddCycle,
    projectSettingsOpen,
    settingsSectionId,
    openProjectSettings,
    closeProjectSettings,
    setSettingsSectionId,
    switchSettingsProject,
  }), [
    workspaceFilterId, workspaces, addWorkspace, projects, tasks, cycles, milestones, documents, relatedProjects,
    selectedProjectId, selectedTaskId, projectNavId, analyticsOpen, openProject, closeProject, returnToProjectList,
    createProject, updateProject, addTask, updateTask, openTaskDetail, closeTaskDetail,
    openAnalytics, closeAnalytics, addCycle, addMilestone, updateDocument,
    addProjectMember, removeProjectMember, updateProjectMemberAccess,
    linkWorkspace, updateParticipatingWorkspace, unlinkWorkspace, requestWorkspaceLink, requestWorkspaceParticipation,
    addRelatedProject, requestRelatedProjectLink, removeRelatedProject,
    activeModal, workspaceFilterLabel, getProject, addWorkItemSignal, requestAddWorkItem,
    addCycleSignal, requestAddCycle,
    projectSettingsOpen, settingsSectionId, openProjectSettings, closeProjectSettings, setSettingsSectionId, switchSettingsProject,
  ]);

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
};

export function useWork(): WorkContextValue {
  const ctx = useContext(WorkContext);
  if (!ctx) throw new Error('useWork must be used within WorkProvider');
  return ctx;
}

export type { WorkModal, WorkProject };
export type { WorkspaceRole } from '../workMockData';
