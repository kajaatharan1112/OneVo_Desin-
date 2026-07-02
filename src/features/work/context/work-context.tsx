import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
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
  MOCK_BUDGET_EXPENSES,
  MOCK_RISKS,
  MOCK_GOALS,
  countOpenTasks,
  nextTaskKey,
  projectAdminIds,
  resolveProjectByKey,
  workspaceOwnerId,
  type PlannerMilestone,
  type MilestoneStatus,
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
  type ProjectBudgetExpense,
  type ProjectRisk,
  type ProjectGoal,
  type WorkTaskChecklistGroup,
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
  startDate?: string;
  dueDate?: string | null;
  template?: string;
  allocatedHours?: number;
  budgetLimit?: number;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string[];
}

interface AddTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  linkedWorkspaceId?: string | null;
  labels?: string[];
  customFieldValues?: Record<string, string | number>;
  allocatedHours?: number;
  checklist?: WorkTaskChecklistGroup[];
  parentTaskId?: string | null;
  blocks?: string[];
  blockedBy?: string[];
  relatesTo?: string[];
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
  budgetExpenses: ProjectBudgetExpense[];
  risks: ProjectRisk[];
  goals: ProjectGoal[];
  addGoal: (goal: ProjectGoal) => void;
  updateGoal: (id: string, patch: Partial<ProjectGoal>) => void;
  deleteGoal: (id: string) => void;
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
  restoreProject: (id: string) => void;
  duplicateProject: (projectId: string, cloneTasks: boolean) => string;
  addTask: (input: AddTaskInput) => WorkTask | undefined;
  updateTask: (id: string, patch: Partial<WorkTask>) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openAnalytics: () => void;
  closeAnalytics: () => void;
  addCycle: (cycle: ProjectCycle) => void;
  addMilestone: (milestone: PlannerMilestone) => void;
  updateMilestone: (id: string, patch: Partial<PlannerMilestone>) => void;
  deleteMilestone: (id: string) => void;
  updateDocument: (id: string, patch: Partial<WorkDocument>) => void;
  addDocument: (doc: WorkDocument) => void;
  deleteDocument: (id: string) => void;
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
  addBudgetExpense: (expense: Omit<ProjectBudgetExpense, 'id'>) => void;
  deleteBudgetExpense: (id: string) => void;
  addRisk: (risk: Omit<ProjectRisk, 'id'>) => void;
  updateRisk: (id: string, patch: Partial<ProjectRisk>) => void;
  deleteRisk: (id: string) => void;
  activeModal: WorkModal;
  openModal: (modal: WorkModal) => void;
  closeModal: () => void;
  workspaceFilterLabel: string;
  getProject: (id: string) => WorkProject | undefined;
  addWorkItemSignal: number;
  requestAddWorkItem: () => void;
  addCycleSignal: number;
  requestAddCycle: () => void;
  addMilestoneSignal: number;
  requestAddMilestone: () => void;
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
  const [budgetExpenses, setBudgetExpenses] = useState<ProjectBudgetExpense[]>(MOCK_BUDGET_EXPENSES);
  const [risks, setRisks] = useState<ProjectRisk[]>(MOCK_RISKS);
  const [goals, setGoals] = useState<ProjectGoal[]>(MOCK_GOALS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [projectNavId, setProjectNavId] = useState<ProjectNavId>('work-items');
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<WorkModal>(null);
  const [addWorkItemSignal, setAddWorkItemSignal] = useState(0);
  const [addCycleSignal, setAddCycleSignal] = useState(0);
  const [addMilestoneSignal, setAddMilestoneSignal] = useState(0);
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

  const requestAddMilestone = useCallback(() => {
    setProjectNavId('milestones');
    setAddMilestoneSignal(n => n + 1);
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

    // Template presets
    const defaultTasks: WorkTask[] = [];
    const defaultMilestones: PlannerMilestone[] = [];
    let defaultDesc = input.description;
    let budgetLimit = 100000;
    let priority: 'Low' | 'Medium' | 'High' = 'Medium';
    if (input.template && input.template !== 'none') {
      if (input.template === 'software') {
        defaultDesc = input.description || "Software development project template for designing, building, and deploying new features.";
        budgetLimit = 150000;
        priority = 'High';
        defaultTasks.push(
          { id: `task-${Date.now()}-1`, key: `${key}-1`, title: 'Setup repository and dev environment', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'Medium', labels: ['infra'] },
          { id: `task-${Date.now()}-2`, key: `${key}-2`, title: 'Design system integration and components mapping', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'High', labels: ['design'] },
          { id: `task-${Date.now()}-3`, key: `${key}-3`, title: 'Core API schema & server routes implementation', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'High', labels: ['backend'] },
          { id: `task-${Date.now()}-4`, key: `${key}-4`, title: 'CI/CD pipeline and automated test suite setup', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'backlog', dueDate: null, priority: 'Medium', labels: ['infra'] }
        );
        defaultMilestones.push(
          { id: `ms-${Date.now()}-1`, name: 'v1.0-alpha release', description: 'Core features implemented and running in staging', projectId: id, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), status: 'upcoming', ownerId: CURRENT_USER_ID, linkedWorkItemIds: [`task-${Date.now()}-1`, `task-${Date.now()}-2`, `task-${Date.now()}-3`] },
          { id: `ms-${Date.now()}-2`, name: 'Production launch', description: 'Stable v1.0 deployment to production environment', projectId: id, dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), status: 'upcoming', ownerId: CURRENT_USER_ID, linkedWorkItemIds: [`task-${Date.now()}-4`] }
        );
      } else if (input.template === 'marketing') {
        defaultDesc = input.description || "Marketing campaign template for product launches, brand awareness campaigns, and events.";
        budgetLimit = 50000;
        priority = 'Medium';
        defaultTasks.push(
          { id: `task-${Date.now()}-1`, key: `${key}-1`, title: 'Define campaign goals & target audience personas', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'High', labels: ['planning'] },
          { id: `task-${Date.now()}-2`, key: `${key}-2`, title: 'Produce visual brand assets & promotional copy', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'Medium', labels: ['design'] },
          { id: `task-${Date.now()}-3`, key: `${key}-3`, title: 'Configure email newsletter and drip campaigns', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'backlog', dueDate: null, priority: 'Medium', labels: ['docs'] }
        );
        defaultMilestones.push(
          { id: `ms-${Date.now()}-1`, name: 'Assets finalized', description: 'All copywriting and design assets approved', projectId: id, dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), status: 'upcoming', ownerId: CURRENT_USER_ID, linkedWorkItemIds: [`task-${Date.now()}-1`, `task-${Date.now()}-2`] },
          { id: `ms-${Date.now()}-2`, name: 'Campaign Launch', description: 'Press release and ads go live', projectId: id, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), status: 'upcoming', ownerId: CURRENT_USER_ID, linkedWorkItemIds: [`task-${Date.now()}-3`] }
        );
      } else if (input.template === 'kanban') {
        defaultDesc = input.description || "Simple Kanban board template for operations, support tasks, and quick cycles.";
        budgetLimit = 20000;
        priority = 'Low';
        defaultTasks.push(
          { id: `task-${Date.now()}-1`, key: `${key}-1`, title: 'Configure Kanban columns WIP limits', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'Low', labels: ['settings'] },
          { id: `task-${Date.now()}-2`, key: `${key}-2`, title: 'Setup incoming issue integrations', description: '', projectId: id, projectName: input.name, projectKey: key, workspaceIds: [primaryWs], linkedWorkspaceId: primaryWs, assigneeId: CURRENT_USER_ID, status: 'todo', dueDate: null, priority: 'Medium', labels: ['settings'] }
        );
      }
    }

    const newProject: WorkProject = {
      id,
      key,
      name: input.name,
      description: defaultDesc,
      status: 'active',
      health: 'on_track',
      priority,
      workspaceIds: input.workspaceIds,
      linkedWorkspaces: [{
        workspaceId: primaryWs,
        status: 'active' as const,
        role: 'Main team',
        access: input.visibility === 'public_workspace' ? 'workspace_visible' : 'private',
      }],
      members: [creatorMember, ...invitedMembers],
      openTasks: defaultTasks.length,
      dueDate: input.dueDate ?? null,
      startDate: input.startDate ?? new Date().toISOString().slice(0, 10),
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
      budgetLimit: input.budgetLimit ?? budgetLimit,
      spentBudget: 0,
      customFieldDefinitions: [
        { id: 'cf-stage', name: 'Stage', type: 'select', options: ['Planning', 'In Dev', 'Testing', 'Completed'] }
      ],
      allocatedHours: input.allocatedHours,
      riskLevel: input.riskLevel ?? 'Medium',
      tags: input.tags ?? [],
    };

    setProjects(prev => [...prev, newProject]);
    if (defaultTasks.length > 0) {
      setTasks(prev => [...prev, ...defaultTasks]);
    }
    if (defaultMilestones.length > 0) {
      setMilestones(prev => [...prev, ...defaultMilestones]);
    }

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

  const restoreProject = useCallback((id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
  }, []);

  const duplicateProject = useCallback((projectId: string, cloneTasks: boolean): string => {
    const src = projects.find(p => p.id === projectId);
    if (!src) return '';
    const id = `proj-${Date.now()}`;
    const existingKeys = projects.map(p => p.key);
    const key = deriveProjectKey(`${src.name} Copy`, existingKeys).toUpperCase();
    const duplicated: WorkProject = {
      ...src,
      id,
      key,
      name: `${src.name} (Copy)`,
      status: 'active',
      health: 'on_track',
      openTasks: 0,
      startDate: new Date().toISOString().slice(0, 10),
      members: src.members.map((m, idx) => ({
        ...m,
        id: `pm-${Date.now()}-${idx}`,
        status: 'active',
      })),
      spentBudget: 0,
    };
    setProjects(prev => [...prev, duplicated]);
    if (cloneTasks) {
      const srcTasks = tasks.filter(t => t.projectId === projectId);
      const duplicatedTasks = srcTasks.map((t, idx) => {
        const newTaskKey = `${key}-${idx + 1}`;
        return {
          ...t,
          id: `task-${Date.now()}-${idx}`,
          key: newTaskKey,
          projectId: id,
          projectName: duplicated.name,
          projectKey: key,
          status: 'todo' as TaskStatus,
        };
      });
      setTasks(prev => {
        const next = [...prev, ...duplicatedTasks];
        setProjects(ps => ps.map(p => {
          if (p.id !== id) return p;
          return { ...p, openTasks: duplicatedTasks.length };
        }));
        return next;
      });
    }
    const srcMilestones = milestones.filter(m => m.projectId === projectId);
    if (srcMilestones.length > 0) {
      const duplicatedMilestones = srcMilestones.map((m, idx) => ({
        ...m,
        id: `ms-${Date.now()}-${idx}`,
        projectId: id,
        linkedWorkItemIds: [],
      }));
      setMilestones(prev => [...prev, ...duplicatedMilestones]);
    }
    return id;
  }, [projects, tasks, milestones]);

  const addTask = useCallback((input: AddTaskInput) => {
    const project = projects.find(p => p.id === input.projectId);
    if (!project) return undefined;
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
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      priority: input.priority,
      labels: input.labels ?? [],
      customFieldValues: input.customFieldValues ?? {},
      totalWorkedHours: 0,
      timeSessions: [],
      checklist: input.checklist ?? [],
      estimate: input.allocatedHours,
      parentTaskId: input.parentTaskId ?? null,
      blocks: input.blocks ?? [],
      blockedBy: input.blockedBy ?? [],
      relatesTo: input.relatesTo ?? [],
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
    return task;
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

  const updateMilestone = useCallback((id: string, patch: Partial<PlannerMilestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<WorkDocument>) => {
    setDocuments(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const addDocument = useCallback((doc: WorkDocument) => {
    setDocuments(prev => [...prev, doc]);
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
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

  const addBudgetExpense = useCallback((expense: Omit<ProjectBudgetExpense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    const newExpense = { ...expense, id };
    setBudgetExpenses(prev => {
      const next = [...prev, newExpense];
      const totalSpent = next
        .filter(e => e.projectId === expense.projectId)
        .reduce((sum, e) => sum + e.cost, 0);
      setProjects(ps => ps.map(p => p.id === expense.projectId ? { ...p, spentBudget: totalSpent } : p));
      return next;
    });
  }, []);

  const deleteBudgetExpense = useCallback((id: string) => {
    setBudgetExpenses(prev => {
      const target = prev.find(e => e.id === id);
      const next = prev.filter(e => e.id !== id);
      if (target) {
        const totalSpent = next
          .filter(e => e.projectId === target.projectId)
          .reduce((sum, e) => sum + e.cost, 0);
        setProjects(ps => ps.map(p => p.id === target.projectId ? { ...p, spentBudget: totalSpent } : p));
      }
      return next;
    });
  }, []);

  const addRisk = useCallback((risk: Omit<ProjectRisk, 'id'>) => {
    const id = `risk-${Date.now()}`;
    const newRisk = { ...risk, id };
    setRisks(prev => [...prev, newRisk]);
  }, []);

  const updateRisk = useCallback((id: string, patch: Partial<ProjectRisk>) => {
    setRisks(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const deleteRisk = useCallback((id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
  }, []);

  const addGoal = useCallback((goal: ProjectGoal) => {
    setGoals(prev => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<ProjectGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // Automatically calculate milestone achievements based on linked task completion
  useEffect(() => {
    setMilestones(prevMilestones => {
      let changed = false;
      const nextMilestones = prevMilestones.map(ms => {
        if (ms.linkedWorkItemIds && ms.linkedWorkItemIds.length > 0) {
          const msTasks = tasks.filter(t => ms.linkedWorkItemIds.includes(t.id));
          if (msTasks.length > 0) {
            const allCompleted = msTasks.every(t => t.status === 'done');
            const expectedStatus: MilestoneStatus = allCompleted ? 'Achieved' : (ms.status === 'Achieved' ? 'reached' : ms.status);
            if (ms.status !== expectedStatus) {
              changed = true;
              return { ...ms, status: expectedStatus };
            }
          }
        }
        return ms;
      });
      return changed ? nextMilestones : prevMilestones;
    });
  }, [tasks]);

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
    budgetExpenses,
    risks,
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
    restoreProject,
    duplicateProject,
    addTask,
    updateTask,
    openTaskDetail,
    closeTaskDetail,
    openAnalytics,
    closeAnalytics,
    addCycle,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    updateDocument,
    addDocument,
    deleteDocument,
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
    addBudgetExpense,
    deleteBudgetExpense,
    addRisk,
    updateRisk,
    deleteRisk,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    activeModal,
    openModal: setActiveModal,
    closeModal: () => setActiveModal(null),
    workspaceFilterLabel,
    getProject,
    addWorkItemSignal,
    requestAddWorkItem,
    addCycleSignal,
    requestAddCycle,
    addMilestoneSignal,
    requestAddMilestone,
    projectSettingsOpen,
    settingsSectionId,
    openProjectSettings,
    closeProjectSettings,
    setSettingsSectionId,
    switchSettingsProject,
  }), [
    workspaceFilterId, workspaces, addWorkspace, projects, tasks, cycles, milestones, documents, relatedProjects,
    budgetExpenses, risks, goals,
    selectedProjectId, selectedTaskId, projectNavId, analyticsOpen, openProject, closeProject, returnToProjectList,
    createProject, updateProject, restoreProject, duplicateProject, addTask, updateTask, openTaskDetail, closeTaskDetail,
    openAnalytics, closeAnalytics, addCycle, addMilestone, updateMilestone, deleteMilestone, updateDocument, addDocument, deleteDocument,
    addProjectMember, removeProjectMember, updateProjectMemberAccess,
    linkWorkspace, updateParticipatingWorkspace, unlinkWorkspace, requestWorkspaceLink, requestWorkspaceParticipation,
    addRelatedProject, requestRelatedProjectLink, removeRelatedProject,
    addBudgetExpense, deleteBudgetExpense, addRisk, updateRisk, deleteRisk,
    addGoal, updateGoal, deleteGoal,
    activeModal, workspaceFilterLabel, getProject, addWorkItemSignal, requestAddWorkItem,
    addCycleSignal, requestAddCycle, addMilestoneSignal, requestAddMilestone,
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
