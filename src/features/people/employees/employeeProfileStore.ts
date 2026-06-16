import { create } from 'zustand';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { MOCK_ROLES } from '../../admin/adminMockData';
import { SEED_CHECKLIST_TEMPLATES } from '../checklist-templates/checklistTemplateMockData';
import { SEED_WORK_SCHEDULES } from '../../time-attendance/configuration/schedulesConfigMockData';
import type {
  EmployeeActivityEntry,
  EmployeeDocument,
  LeaveOverrideFormValues,
  LeavePolicyOverride,
  OffboardingFormValues,
  ProfileModal,
  ProfileTab,
  RoleOverride,
  RoleOverrideFormValues,
  ScheduleOverride,
  ScheduleOverrideFormValues,
  PromotionFormValues,
  TransferFormValues
} from './employeeProfileTypes';
import {
  defaultActivityForEmployee,
  SEED_EMPLOYEE_ACTIVITY,
  SEED_EMPLOYEE_DOCUMENTS,
  SEED_LEAVE_OVERRIDES,
  SEED_ROLE_OVERRIDES,
  SEED_SCHEDULE_OVERRIDES
} from './employeeProfileMockData';
import { getReportingManagerPreviewForPosition, applyEmployeePositionAssignment } from '../../../utils/organizationUtils';
import { canAssignEmployeeToPosition, createId } from '../../../utils/organizationUtils';
import { useAccessStore } from '../../access/accessStore';

const createActivityId = () => `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface EmployeeProfileStore {
  activeTab: ProfileTab;
  activeModal: ProfileModal;
  roleOverrides: RoleOverride[];
  leaveOverrides: LeavePolicyOverride[];
  scheduleOverrides: ScheduleOverride[];
  documents: EmployeeDocument[];
  activity: EmployeeActivityEntry[];
  toast: string | null;

  setActiveTab: (tab: ProfileTab) => void;
  openModal: (modal: ProfileModal) => void;
  closeModal: () => void;
  clearToast: () => void;

  getRoleOverrides: (employeeId: string) => RoleOverride[];
  getLeaveOverrides: (employeeId: string) => LeavePolicyOverride[];
  getScheduleOverrides: (employeeId: string) => ScheduleOverride[];
  getDocuments: (employeeId: string) => EmployeeDocument[];
  getActivity: (employeeId: string) => EmployeeActivityEntry[];

  promoteEmployee: (
    employeeId: string,
    values: PromotionFormValues,
    actorOrgEmployeeId: string
  ) => { ok: boolean; error?: string };
  transferEmployee: (
    employeeId: string,
    values: TransferFormValues,
    actorOrgEmployeeId: string
  ) => { ok: boolean; error?: string };
  startOffboarding: (
    employeeId: string,
    values: OffboardingFormValues
  ) => { ok: boolean; error?: string };
  addRoleOverride: (
    employeeId: string,
    values: RoleOverrideFormValues
  ) => { ok: boolean; error?: string };
  removeRoleOverride: (id: string) => void;
  addLeaveOverride: (
    employeeId: string,
    values: LeaveOverrideFormValues
  ) => { ok: boolean; error?: string };
  removeLeaveOverride: (id: string) => void;
  addScheduleOverride: (
    employeeId: string,
    values: ScheduleOverrideFormValues
  ) => { ok: boolean; error?: string };
  removeScheduleOverride: (id: string) => void;
  uploadDocument: (employeeId: string, name: string, type: string) => void;
  recordPositionChangeActivity: (
    employeeId: string,
    actionType: 'promotion' | 'transfer',
    label: string,
    detail: string
  ) => void;
}

function appendActivity(entry: Omit<EmployeeActivityEntry, 'id'>) {
  return {
    id: createActivityId(),
    ...entry
  };
}

export const useEmployeeProfileStore = create<EmployeeProfileStore>((set, get) => ({
  activeTab: 'about',
  activeModal: null,
  roleOverrides: SEED_ROLE_OVERRIDES,
  leaveOverrides: SEED_LEAVE_OVERRIDES,
  scheduleOverrides: SEED_SCHEDULE_OVERRIDES,
  documents: SEED_EMPLOYEE_DOCUMENTS,
  activity: SEED_EMPLOYEE_ACTIVITY,
  toast: null,

  setActiveTab: tab => set({ activeTab: tab }),
  openModal: modal => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  clearToast: () => set({ toast: null }),

  getRoleOverrides: employeeId =>
    get().roleOverrides.filter(o => o.employeeId === employeeId),
  getLeaveOverrides: employeeId =>
    get().leaveOverrides.filter(o => o.employeeId === employeeId),
  getScheduleOverrides: employeeId =>
    get().scheduleOverrides.filter(o => o.employeeId === employeeId),
  getDocuments: employeeId => get().documents.filter(d => d.employeeId === employeeId),
  getActivity: employeeId => {
    const entries = get().activity.filter(a => a.employeeId === employeeId);
    if (entries.length > 0) return [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const emp = useOrganizationStore.getState().employees.find(e => e.id === employeeId);
    if (!emp) return [];
    return defaultActivityForEmployee(employeeId, emp.startDate);
  },

  promoteEmployee: (employeeId, values, actorOrgEmployeeId) => {
    if (!values.positionId) return { ok: false, error: 'New position is required.' };
    if (!values.effectiveDate) return { ok: false, error: 'Effective date is required.' };

    const org = useOrganizationStore.getState();
    const { positions, assignments } = org;
    const check = canAssignEmployeeToPosition(
      employeeId,
      values.positionId,
      positions,
      assignments
    );
    if (!check.ok) return { ok: false, error: check.error };

    const position = positions.find(p => p.id === values.positionId)!;

    const accessResult = useAccessStore.getState().applyPositionChangeAccess({
      actorOrgEmployeeId,
      targetEmployeeId: employeeId,
      actionType: 'promotion',
      targetPositionId: values.positionId,
      effectiveDate: values.effectiveDate,
      grants: values.accessGrants
    });
    if (!accessResult.ok) return accessResult;

    if (!accessResult.requiresApproval) {
      const assignmentResult = applyEmployeePositionAssignment(
        employeeId,
        values.positionId,
        values.effectiveDate,
        positions,
        assignments,
        values.reason.trim() || undefined
      );
      if (!assignmentResult.ok || !assignmentResult.assignments) {
        return { ok: false, error: assignmentResult.error ?? 'Unable to update position assignment.' };
      }
      useOrganizationStore.setState({ assignments: assignmentResult.assignments });
    }

    const toastMsg = accessResult.requiresApproval
      ? 'Promotion submitted. Access changes require approval.'
      : 'Promotion completed successfully.';

    set({
      activity: [
        appendActivity({
          employeeId,
          type: 'promotion',
          label: accessResult.requiresApproval ? 'Promotion submitted' : 'Promotion completed',
          detail: `Promoted to ${position.name}`,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ],
      activeModal: null,
      toast: toastMsg
    });
    return { ok: true };
  },

  transferEmployee: (employeeId, values, actorOrgEmployeeId) => {
    if (!values.positionId) return { ok: false, error: 'New position is required.' };
    if (!values.effectiveDate) return { ok: false, error: 'Effective date is required.' };
    if (!values.reason.trim()) return { ok: false, error: 'Reason is required.' };

    const org = useOrganizationStore.getState();
    const { positions, assignments, departments } = org;
    const check = canAssignEmployeeToPosition(
      employeeId,
      values.positionId,
      positions,
      assignments
    );
    if (!check.ok) return { ok: false, error: check.error };

    const position = positions.find(p => p.id === values.positionId)!;
    const dept = departments.find(d => d.id === position.departmentId);

    const accessResult = useAccessStore.getState().applyPositionChangeAccess({
      actorOrgEmployeeId,
      targetEmployeeId: employeeId,
      actionType: 'transfer',
      targetPositionId: values.positionId,
      effectiveDate: values.effectiveDate,
      grants: values.accessGrants
    });
    if (!accessResult.ok) return accessResult;

    if (!accessResult.requiresApproval) {
      const assignmentResult = applyEmployeePositionAssignment(
        employeeId,
        values.positionId,
        values.effectiveDate,
        positions,
        assignments,
        values.reason.trim()
      );
      if (!assignmentResult.ok || !assignmentResult.assignments) {
        return { ok: false, error: assignmentResult.error ?? 'Unable to update position assignment.' };
      }
      useOrganizationStore.setState({ assignments: assignmentResult.assignments });
    }

    const toastMsg = accessResult.requiresApproval
      ? 'Transfer submitted. Access changes require approval.'
      : 'Employee transferred successfully.';

    set({
      activity: [
        appendActivity({
          employeeId,
          type: 'transfer',
          label: accessResult.requiresApproval ? 'Transfer submitted' : 'Transfer completed',
          detail: `Moved to ${position.name}${dept ? ` · ${dept.name}` : ''}`,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ],
      activeModal: null,
      toast: toastMsg
    });
    return { ok: true };
  },

  startOffboarding: (employeeId, values) => {
    if (!values.lastWorkingDay) return { ok: false, error: 'Last working day is required.' };
    if (!values.templateId) return { ok: false, error: 'Offboarding template is required.' };

    const template = SEED_CHECKLIST_TEMPLATES.find(t => t.id === values.templateId);
    set({
      activity: [
        appendActivity({
          employeeId,
          type: 'offboarding-started',
          label: 'Offboarding started',
          detail: template
            ? `${template.name} · Last day ${values.lastWorkingDay}`
            : `Last day ${values.lastWorkingDay}`,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ],
      activeModal: null,
      toast: 'Offboarding started.'
    });
    return { ok: true };
  },

  addRoleOverride: (employeeId, values) => {
    if (!values.roleId) return { ok: false, error: 'Role is required.' };
    if (!values.effectiveFrom) return { ok: false, error: 'Effective from is required.' };
    const role = MOCK_ROLES.find(r => r.id === values.roleId);
    if (!role) return { ok: false, error: 'Role not found.' };

    const next: RoleOverride = {
      id: createId('ro'),
      employeeId,
      roleId: role.id,
      roleName: role.name,
      scope: values.scope,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.noEndDate ? null : values.effectiveTo || null,
      reason: values.reason.trim() || undefined
    };

    set({
      roleOverrides: [...get().roleOverrides, next],
      activity: [
        appendActivity({
          employeeId,
          type: 'role-override-added',
          label: 'Role override added',
          detail: role.name,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ],
      activeModal: null,
      toast: 'Role override added.'
    });
    return { ok: true };
  },

  removeRoleOverride: id => {
    set({ roleOverrides: get().roleOverrides.filter(o => o.id !== id), toast: 'Role override removed.' });
  },

  addLeaveOverride: (employeeId, values) => {
    if (!values.policyId) return { ok: false, error: 'Leave policy is required.' };
    if (!values.effectiveFrom) return { ok: false, error: 'Effective from is required.' };
    const policy = useLeaveConfigStore.getState().policies.find(p => p.id === values.policyId);
    if (!policy) return { ok: false, error: 'Leave policy not found.' };

    const next: LeavePolicyOverride = {
      id: createId('lo'),
      employeeId,
      policyId: policy.id,
      policyName: policy.name,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.noEndDate ? null : values.effectiveTo || null,
      reason: values.reason.trim() || undefined
    };

    set({
      leaveOverrides: [...get().leaveOverrides, next],
      activity: [
        appendActivity({
          employeeId,
          type: 'leave-override-added',
          label: 'Leave policy override added',
          detail: policy.name,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ],
      activeModal: null,
      toast: 'Leave policy override added.'
    });
    return { ok: true };
  },

  removeLeaveOverride: id => {
    set({ leaveOverrides: get().leaveOverrides.filter(o => o.id !== id), toast: 'Leave policy override removed.' });
  },

  addScheduleOverride: (employeeId, values) => {
    if (!values.scheduleId) return { ok: false, error: 'Work schedule is required.' };
    if (!values.effectiveFrom) return { ok: false, error: 'Effective from is required.' };
    const schedule = SEED_WORK_SCHEDULES.find(s => s.id === values.scheduleId);
    if (!schedule) return { ok: false, error: 'Work schedule not found.' };

    const next: ScheduleOverride = {
      id: createId('so'),
      employeeId,
      scheduleId: schedule.id,
      scheduleTitle: schedule.title,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.noEndDate ? null : values.effectiveTo || null,
      reason: values.reason.trim() || undefined
    };

    set({
      scheduleOverrides: [...get().scheduleOverrides, next],
      activity: [
        appendActivity({
          employeeId,
          type: 'schedule-override-added',
          label: 'Schedule override added',
          detail: schedule.title,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ],
      activeModal: null,
      toast: 'Schedule override added.'
    });
    return { ok: true };
  },

  removeScheduleOverride: id => {
    set({ scheduleOverrides: get().scheduleOverrides.filter(o => o.id !== id), toast: 'Schedule override removed.' });
  },

  uploadDocument: (employeeId, name, type) => {
    set({
      documents: [
        {
          id: createId('doc'),
          employeeId,
          name,
          type,
          status: 'uploaded',
          date: new Date().toISOString().slice(0, 10)
        },
        ...get().documents
      ],
      toast: 'Document uploaded.'
    });
  },

  recordPositionChangeActivity: (employeeId, actionType, label, detail) => {
    set({
      activity: [
        appendActivity({
          employeeId,
          type: actionType,
          label,
          detail,
          occurredAt: new Date().toISOString()
        }),
        ...get().activity
      ]
    });
  }
}));

export function previewPositionContext(positionId: string): {
  reportingManager: string;
  departmentName: string;
} {
  const { positions, assignments, employees, departments } = useOrganizationStore.getState();
  const position = positions.find(p => p.id === positionId);
  if (!position) return { reportingManager: '—', departmentName: '—' };
  const dept = departments.find(d => d.id === position.departmentId);
  return {
    reportingManager: getReportingManagerPreviewForPosition(
      position,
      positions,
      assignments,
      employees
    ).label,
    departmentName: dept?.name ?? '—'
  };
}

export function previewTransferManager(positionId: string): string {
  return previewPositionContext(positionId).reportingManager;
}
