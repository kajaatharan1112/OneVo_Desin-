import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  ALL_WORKSPACES_ID,
  CURRENT_USER_ID,
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_WORKSPACES,
  countOpenTasks,
  nextTaskKey,
  type ProjectAccessLevel,
  type ProjectMember,
  type TaskPriority,
  type TaskStatus,
  type WorkProject,
  type WorkTask,
  type WorkWorkspace,
} from '../workMockData';
import type { ProjectNavId } from '../projectNav';

export type { ProjectNavId };

type WorkModal = 'create-workspace' | 'manage-workspaces' | 'create-project' | null;

interface CreateProjectInput {
  name: string;
  key: string;
  description: string;
  startDate: string;
  endDate: string;
  workspaceIds: string[];
  memberIds: string[];
  defaultPriority: TaskPriority;
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
  selectedProjectId: string | null;
  projectNavId: ProjectNavId;
  setProjectNavId: (id: ProjectNavId) => void;
  openProject: (id: string, nav?: ProjectNavId) => void;
  closeProject: () => void;
  returnToProjectList: () => void;
  createProject: (input: CreateProjectInput) => string;
  updateProject: (id: string, patch: Partial<WorkProject>) => void;
  addTask: (input: AddTaskInput) => void;
  updateTask: (id: string, patch: Partial<WorkTask>) => void;
  addProjectMember: (projectId: string, employeeId: string, accessLevel: ProjectAccessLevel, workspaceSourceId: string | null) => void;
  removeProjectMember: (projectId: string, memberId: string) => void;
  updateProjectMemberAccess: (projectId: string, memberId: string, accessLevel: ProjectAccessLevel) => void;
  linkWorkspace: (projectId: string, workspaceId: string, role?: string) => void;
  unlinkWorkspace: (projectId: string, workspaceId: string) => void;
  requestWorkspaceLink: (projectId: string, workspaceId: string, reason: string) => void;
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
  openProjectSettings: () => void;
  closeProjectSettings: () => void;
}

const WorkContext = createContext<WorkContextValue | null>(null);

export const WorkProvider: React.FC<{
  children: React.ReactNode;
  onNavigateToList?: (id: string) => void;
}> = ({ children, onNavigateToList }) => {
  const [workspaceFilterId, setWorkspaceFilterId] = useState(ALL_WORKSPACES_ID);
  const [workspaces, setWorkspaces] = useState<WorkWorkspace[]>(MOCK_WORKSPACES);
  const [projects, setProjects] = useState<WorkProject[]>(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<WorkTask[]>(MOCK_TASKS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectNavId, setProjectNavId] = useState<ProjectNavId>('work-items');
  const [activeModal, setActiveModal] = useState<WorkModal>(null);
  const [addWorkItemSignal, setAddWorkItemSignal] = useState(0);
  const [addCycleSignal, setAddCycleSignal] = useState(0);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);

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

  const openProjectSettings = useCallback(() => {
    setProjectSettingsOpen(true);
  }, []);

  const closeProjectSettings = useCallback(() => {
    setProjectSettingsOpen(false);
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
    const member: ProjectMember = {
      id: `pm-${Date.now()}`,
      employeeId: CURRENT_USER_ID,
      accessLevel: 'admin',
      status: 'active',
      workspaceSourceId: input.workspaceIds[0] ?? null,
    };
    const newProject: WorkProject = {
      id,
      key: input.key.toUpperCase(),
      name: input.name,
      description: input.description,
      status: 'active',
      health: 'on_track',
      workspaceIds: input.workspaceIds,
      linkedWorkspaces: input.workspaceIds.map(wsId => ({
        workspaceId: wsId,
        status: 'active' as const,
        role: 'Linked',
      })),
      members: [
        member,
        ...input.memberIds
          .filter(mid => mid !== CURRENT_USER_ID)
          .map((employeeId, i) => ({
            id: `pm-${Date.now()}-${i}`,
            employeeId,
            accessLevel: 'member' as ProjectAccessLevel,
            status: 'active' as const,
            workspaceSourceId: input.workspaceIds[0] ?? null,
          })),
      ],
      openTasks: 0,
      dueDate: input.endDate || null,
      startDate: input.startDate || new Date().toISOString().slice(0, 10),
      endDate: input.endDate || null,
      defaultPriority: input.defaultPriority,
      timezone: 'UTC',
      icon: 'folder',
      coverColor: '#6366f1',
    };
    setProjects(prev => [...prev, newProject]);
    return id;
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<WorkProject>) => {
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

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
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      if (p.members.some(m => m.employeeId === employeeId)) return p;
      return {
        ...p,
        members: [...p.members, {
          id: `pm-${Date.now()}`,
          employeeId,
          accessLevel,
          status: 'active',
          workspaceSourceId,
        }],
      };
    }));
  }, []);

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

  const linkWorkspace = useCallback((projectId: string, workspaceId: string, role = 'Linked') => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      if (p.workspaceIds.includes(workspaceId)) return p;
      return {
        ...p,
        workspaceIds: [...p.workspaceIds, workspaceId],
        linkedWorkspaces: [...p.linkedWorkspaces, { workspaceId, status: 'active', role }],
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

  const requestWorkspaceLink = useCallback((projectId: string, workspaceId: string, _reason: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      if (p.linkedWorkspaces.some(lw => lw.workspaceId === workspaceId)) return p;
      return {
        ...p,
        linkedWorkspaces: [...p.linkedWorkspaces, { workspaceId, status: 'pending', role: 'Pending approval' }],
      };
    }));
  }, []);

  const value = useMemo<WorkContextValue>(() => ({
    workspaceFilterId,
    setWorkspaceFilterId,
    workspaces,
    addWorkspace,
    projects,
    tasks,
    selectedProjectId,
    projectNavId,
    setProjectNavId,
    openProject,
    closeProject,
    returnToProjectList,
    createProject,
    updateProject,
    addTask,
    updateTask,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberAccess,
    linkWorkspace,
    unlinkWorkspace,
    requestWorkspaceLink,
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
    openProjectSettings,
    closeProjectSettings,
  }), [
    workspaceFilterId, workspaces, addWorkspace, projects, tasks,
    selectedProjectId, projectNavId, openProject, closeProject, returnToProjectList,
    createProject, updateProject, addTask, updateTask,
    addProjectMember, removeProjectMember, updateProjectMemberAccess,
    linkWorkspace, unlinkWorkspace, requestWorkspaceLink,
    activeModal, workspaceFilterLabel, getProject, addWorkItemSignal, requestAddWorkItem,
    addCycleSignal, requestAddCycle,
    projectSettingsOpen, openProjectSettings, closeProjectSettings,
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
