import { create } from 'zustand';
import type {
  AssignmentFormState,
  Department,
  DepartmentFormState,
  Employee,
  EmployeeFormState,
  EmployeeFormValues,
  Position,
  PositionAssignment,
  PositionFormState
} from '../types/organization';
import {
  canAssignEmployeeToPosition,
  canChangePositionToPooled,
  canMovePosition,
  canSetDepartmentParent,
  createId,
  getValidHeadPositions,
  isDepartmentCodeUnique,
  isPositionCodeUnique,
  suggestDepartmentCode
} from '../utils/organizationUtils';

const SEED_DEPARTMENTS: Department[] = [
  {
    id: 'dept-exec',
    name: 'Executive',
    code: 'EXEC',
    parentDepartmentId: null,
    headPositionId: 'pos-ceo',
    description: 'Executive leadership',
    status: 'active'
  },
  {
    id: 'dept-eng',
    name: 'Engineering',
    code: 'ENG',
    parentDepartmentId: 'dept-exec',
    headPositionId: 'pos-eng-mgr',
    description: 'Product engineering',
    status: 'active'
  },
  {
    id: 'dept-backend',
    name: 'Backend',
    code: 'BE',
    parentDepartmentId: 'dept-eng',
    headPositionId: 'pos-be-lead',
    description: 'Backend engineering',
    status: 'active'
  },
  {
    id: 'dept-frontend',
    name: 'Frontend',
    code: 'FE',
    parentDepartmentId: 'dept-eng',
    headPositionId: 'pos-fe-lead',
    description: 'Frontend engineering',
    status: 'active'
  },
  {
    id: 'dept-qa',
    name: 'QA',
    code: 'QA',
    parentDepartmentId: 'dept-eng',
    headPositionId: 'pos-qa-lead',
    description: 'Quality assurance',
    status: 'active'
  },
  {
    id: 'dept-finance',
    name: 'Finance',
    code: 'FIN',
    parentDepartmentId: 'dept-exec',
    headPositionId: 'pos-fin-mgr',
    description: 'Finance and accounting',
    status: 'active'
  },
  {
    id: 'dept-hr',
    name: 'Human Resources',
    code: 'HR',
    parentDepartmentId: 'dept-exec',
    headPositionId: 'pos-hr-mgr',
    description: 'People operations',
    status: 'active'
  },
  {
    id: 'dept-ops',
    name: 'Operations',
    code: 'OPS',
    parentDepartmentId: 'dept-exec',
    headPositionId: null,
    description: 'Business operations',
    status: 'active'
  }
];

const SEED_POSITIONS: Position[] = [
  {
    id: 'pos-ceo',
    name: 'CEO',
    code: 'CEO',
    departmentId: 'dept-exec',
    reportsToPositionId: null,
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-cto',
    name: 'CTO',
    code: 'CTO',
    departmentId: 'dept-exec',
    reportsToPositionId: 'pos-ceo',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-cfo',
    name: 'CFO',
    code: 'CFO',
    departmentId: 'dept-exec',
    reportsToPositionId: 'pos-ceo',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-hr-mgr',
    name: 'HR Manager',
    code: 'HR-MGR',
    departmentId: 'dept-hr',
    reportsToPositionId: 'pos-ceo',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-eng-mgr',
    name: 'Engineering Manager',
    code: 'ENG-MGR',
    departmentId: 'dept-eng',
    reportsToPositionId: 'pos-cto',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-be-lead',
    name: 'Backend Lead',
    code: 'BE-LEAD',
    departmentId: 'dept-backend',
    reportsToPositionId: 'pos-eng-mgr',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-fe-lead',
    name: 'Frontend Lead',
    code: 'FE-LEAD',
    departmentId: 'dept-frontend',
    reportsToPositionId: 'pos-eng-mgr',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-qa-lead',
    name: 'QA Lead',
    code: 'QA-LEAD',
    departmentId: 'dept-qa',
    reportsToPositionId: 'pos-eng-mgr',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-swe',
    name: 'Software Engineer',
    code: 'SWE',
    departmentId: 'dept-backend',
    reportsToPositionId: 'pos-be-lead',
    type: 'pooled',
    capacity: 10,
    status: 'active'
  },
  {
    id: 'pos-fe-eng',
    name: 'Frontend Engineer',
    code: 'FE-ENG',
    departmentId: 'dept-frontend',
    reportsToPositionId: 'pos-fe-lead',
    type: 'pooled',
    capacity: 8,
    status: 'active'
  },
  {
    id: 'pos-qa-eng',
    name: 'QA Engineer',
    code: 'QA-ENG',
    departmentId: 'dept-qa',
    reportsToPositionId: 'pos-qa-lead',
    type: 'pooled',
    capacity: 5,
    status: 'active'
  },
  {
    id: 'pos-fin-mgr',
    name: 'Finance Manager',
    code: 'FIN-MGR',
    departmentId: 'dept-finance',
    reportsToPositionId: 'pos-cfo',
    type: 'unique',
    capacity: 1,
    status: 'active'
  },
  {
    id: 'pos-acct',
    name: 'Accountant',
    code: 'ACCT',
    departmentId: 'dept-finance',
    reportsToPositionId: 'pos-fin-mgr',
    type: 'pooled',
    capacity: 4,
    status: 'active'
  }
];

const SEED_EMPLOYEES: Employee[] = [
  { id: 'emp-1', firstName: 'Ahmad', lastName: 'Razif', email: 'ahmad.razif@onevo.com', phone: '+94 77 123 4567', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'onsite' },
  { id: 'emp-2', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@onevo.com', phone: '+94 77 234 5678', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'onsite' },
  { id: 'emp-3', firstName: 'Lee', lastName: 'Wei Ming', email: 'lee.weiming@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-03-01', workMode: 'onsite' },
  { id: 'emp-4', firstName: 'Zara', lastName: 'Hassan', email: 'zara.hassan@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'onsite' },
  { id: 'emp-5', firstName: 'Maria', lastName: 'Gomez', email: 'maria.gomez@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'onsite' },
  { id: 'emp-6', firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'hybrid' },
  { id: 'emp-7', firstName: 'Jordan', lastName: 'Chen', email: 'jordan.chen@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'hybrid' },
  { id: 'emp-8', firstName: 'Sam', lastName: 'Patel', email: 'sam.patel@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-06-01', workMode: 'remote' },
  { id: 'emp-9', firstName: 'Taylor', lastName: 'Brooks', email: 'taylor.brooks@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-06-01', workMode: 'remote' },
  { id: 'emp-10', firstName: 'Morgan', lastName: 'Lee', email: 'morgan.lee@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-01-01', workMode: 'onsite' },
  { id: 'emp-11', firstName: 'Casey', lastName: 'Nguyen', email: 'casey.nguyen@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-08-01', workMode: 'field' },
  { id: 'emp-12', firstName: 'Riley', lastName: 'Foster', email: 'riley.foster@onevo.com', status: 'active', employmentType: 'full-time', startDate: '2024-07-01', workMode: 'remote' }
];

const SEED_ASSIGNMENTS: PositionAssignment[] = [
  { id: 'asgn-1', employeeId: 'emp-1', positionId: 'pos-ceo', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-2', employeeId: 'emp-2', positionId: 'pos-cto', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-4', employeeId: 'emp-4', positionId: 'pos-hr-mgr', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-5', employeeId: 'emp-5', positionId: 'pos-eng-mgr', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-6', employeeId: 'emp-6', positionId: 'pos-be-lead', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-7', employeeId: 'emp-7', positionId: 'pos-fe-lead', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-8', employeeId: 'emp-8', positionId: 'pos-swe', effectiveFrom: '2024-06-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-9', employeeId: 'emp-9', positionId: 'pos-swe', effectiveFrom: '2024-06-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-10', employeeId: 'emp-10', positionId: 'pos-fin-mgr', effectiveFrom: '2024-01-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-11', employeeId: 'emp-12', positionId: 'pos-fe-eng', effectiveFrom: '2024-07-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-13', employeeId: 'emp-11', positionId: 'pos-qa-eng', effectiveFrom: '2024-08-01', effectiveTo: null, status: 'active' },
  { id: 'asgn-14', employeeId: 'emp-3', positionId: 'pos-acct', effectiveFrom: '2024-03-01', effectiveTo: null, status: 'active' }
];

interface OrganizationState {
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  assignments: PositionAssignment[];

  departmentForm: DepartmentFormState;
  positionForm: PositionFormState;
  assignmentForm: AssignmentFormState;
  employeeForm: EmployeeFormState;

  collapsedDeptIds: Set<string>;
  collapsedPositionIds: Set<string>;
  dragError: string | null;
  toast: string | null;

  openCreateDepartment: (parentId?: string | null) => void;
  openEditDepartment: (departmentId: string) => void;
  closeDepartmentForm: () => void;
  saveDepartment: (data: {
    id?: string;
    name: string;
    code: string;
    parentDepartmentId: string | null;
    headPositionId?: string | null;
    description: string;
    status: Department['status'];
  }) => { ok: boolean; error?: string };

  openCreateRootPosition: () => void;
  openCreateChildPosition: (parentId: string) => void;
  openEditPosition: (positionId: string) => void;
  closePositionForm: () => void;
  savePosition: (data: {
    id?: string;
    name: string;
    code: string;
    departmentId: string;
    reportsToPositionId: string | null;
    type: Position['type'];
    capacity: number;
    status: Position['status'];
  }) => { ok: boolean; error?: string };

  reparentPosition: (positionId: string, newReportsToPositionId: string) => boolean;
  toggleDeptCollapse: (id: string) => void;
  togglePositionCollapse: (id: string) => void;
  clearDragError: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;

  openAssignEmployee: (positionId: string) => void;
  closeAssignEmployee: () => void;
  assignEmployee: (
    employeeId: string,
    positionId: string,
    options?: { effectiveFrom?: string; notes?: string }
  ) => { ok: boolean; error?: string };

  openCreateEmployee: () => void;
  openEditEmployee: (employeeId: string) => void;
  closeEmployeeForm: () => void;
  saveEmployee: (values: EmployeeFormValues) => { ok: boolean; error?: string };
  updateEmployeeEmployment: (
    employeeId: string,
    values: Pick<
      EmployeeFormValues,
      'employmentType' | 'startDate' | 'workMode' | 'status' | 'positionId'
    >
  ) => { ok: boolean; error?: string };
  updateEmployeePersonal: (
    employeeId: string,
    values: Pick<EmployeeFormValues, 'firstName' | 'lastName' | 'email' | 'phone'>
  ) => { ok: boolean; error?: string };
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  departments: SEED_DEPARTMENTS,
  positions: SEED_POSITIONS,
  employees: SEED_EMPLOYEES,
  assignments: SEED_ASSIGNMENTS,

  departmentForm: { open: false, mode: 'create', departmentId: null, parentDepartmentId: null },
  positionForm: { open: false, mode: 'create', positionId: null, reportsToPositionId: null, departmentId: null },
  assignmentForm: { open: false, positionId: null },
  employeeForm: { open: false, mode: 'create', employeeId: null },

  collapsedDeptIds: new Set(),
  collapsedPositionIds: new Set(),
  dragError: null,
  toast: null,

  openCreateDepartment: parentId => {
    set({
      departmentForm: {
        open: true,
        mode: 'create',
        departmentId: null,
        parentDepartmentId: parentId ?? null
      }
    });
  },

  openEditDepartment: departmentId => {
    set({
      departmentForm: {
        open: true,
        mode: 'edit',
        departmentId,
        parentDepartmentId: null
      }
    });
  },

  closeDepartmentForm: () => {
    set({
      departmentForm: { open: false, mode: 'create', departmentId: null, parentDepartmentId: null }
    });
  },

  saveDepartment: data => {
    const { departments } = get();

    if (!data.name.trim()) {
      return { ok: false, error: 'Department name is required.' };
    }
    if (!data.code.trim()) {
      return { ok: false, error: 'Department code is required.' };
    }
    if (!isDepartmentCodeUnique(data.code, departments, data.id)) {
      return { ok: false, error: 'Department code must be unique.' };
    }

    const parentCheck = canSetDepartmentParent(data.id ?? null, data.parentDepartmentId, departments);
    if (!parentCheck.ok) {
      return { ok: false, error: parentCheck.error };
    }

    if (data.id) {
      const headPositionId = data.headPositionId ?? null;
      if (headPositionId) {
        const headPos = get().positions.find(p => p.id === headPositionId);
        if (!headPos || headPos.departmentId !== data.id) {
          return { ok: false, error: 'Head position must belong to this department.' };
        }
        if (headPos.type !== 'unique') {
          return { ok: false, error: 'Pooled positions cannot be department heads.' };
        }
      }

      set({
        departments: departments.map(d =>
          d.id === data.id
            ? {
                ...d,
                name: data.name.trim(),
                code: data.code.trim().toUpperCase(),
                parentDepartmentId: data.parentDepartmentId,
                headPositionId: headPositionId,
                description: data.description,
                status: data.status
              }
            : d
        )
      });
    } else {
      const newDept: Department = {
        id: createId('dept'),
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        parentDepartmentId: data.parentDepartmentId,
        headPositionId: null,
        description: data.description,
        status: data.status
      };
      set({ departments: [...departments, newDept] });
    }

    get().closeDepartmentForm();
    return { ok: true };
  },

  openCreateRootPosition: () => {
    set({
      positionForm: {
        open: true,
        mode: 'create',
        positionId: null,
        reportsToPositionId: null,
        departmentId: null
      }
    });
  },

  openCreateChildPosition: parentId => {
    const parent = get().positions.find(p => p.id === parentId);
    set({
      positionForm: {
        open: true,
        mode: 'create',
        positionId: null,
        reportsToPositionId: parentId,
        departmentId: parent?.departmentId ?? null
      },
      collapsedPositionIds: (() => {
        const next = new Set(get().collapsedPositionIds);
        next.delete(parentId);
        return next;
      })()
    });
  },

  openEditPosition: positionId => {
    set({
      positionForm: {
        open: true,
        mode: 'edit',
        positionId,
        reportsToPositionId: null,
        departmentId: null
      }
    });
  },

  closePositionForm: () => {
    set({
      positionForm: {
        open: false,
        mode: 'create',
        positionId: null,
        reportsToPositionId: null,
        departmentId: null
      }
    });
  },

  savePosition: data => {
    const { positions, departments } = get();

    if (!data.name.trim()) return { ok: false, error: 'Position name is required.' };
    if (!data.code.trim()) return { ok: false, error: 'Position code is required.' };
    if (!isPositionCodeUnique(data.code, positions, data.id)) {
      return { ok: false, error: 'Position code must be unique.' };
    }
    if (!data.departmentId) return { ok: false, error: 'Department is required.' };

    const dept = departments.find(d => d.id === data.departmentId);
    if (!dept || dept.status === 'inactive') {
      return { ok: false, error: 'Cannot assign to an inactive department.' };
    }

    if (data.reportsToPositionId) {
      const reportsTo = positions.find(p => p.id === data.reportsToPositionId);
      if (!reportsTo || reportsTo.type !== 'unique') {
        return { ok: false, error: 'Reports-to position must be unique.' };
      }
      if (reportsTo.status === 'inactive') {
        return { ok: false, error: 'Cannot report to an inactive position.' };
      }
      if (data.id && wouldCreateCycle(data.id, data.reportsToPositionId, positions)) {
        return { ok: false, error: 'Cannot create a circular reporting chain.' };
      }
    }

    const capacity = data.type === 'unique' ? 1 : Math.max(1, data.capacity);

    if (data.id && data.type === 'pooled') {
      const pooledCheck = canChangePositionToPooled(data.id, positions);
      if (!pooledCheck.ok) return { ok: false, error: pooledCheck.error };
    }

    if (data.id) {
      set({
        positions: positions.map(p =>
          p.id === data.id
            ? {
                ...p,
                name: data.name.trim(),
                code: data.code.trim().toUpperCase(),
                departmentId: data.departmentId,
                reportsToPositionId: data.reportsToPositionId,
                type: data.type,
                capacity,
                status: data.status
              }
            : p
        )
      });
    } else {
      const newPos: Position = {
        id: createId('pos'),
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        departmentId: data.departmentId,
        reportsToPositionId: data.reportsToPositionId,
        type: data.type,
        capacity,
        status: data.status
      };
      set({ positions: [...positions, newPos] });
    }

    get().closePositionForm();
    return { ok: true };
  },

  reparentPosition: (positionId, newReportsToPositionId) => {
    const check = canMovePosition(positionId, newReportsToPositionId, get().positions);
    if (!check.ok) {
      set({ dragError: check.error ?? 'Invalid move.' });
      return false;
    }

    set({
      positions: get().positions.map(p =>
        p.id === positionId ? { ...p, reportsToPositionId: newReportsToPositionId } : p
      ),
      dragError: null
    });
    return true;
  },

  toggleDeptCollapse: id => {
    set({
      collapsedDeptIds: (() => {
        const next = new Set(get().collapsedDeptIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      })()
    });
  },

  togglePositionCollapse: id => {
    set({
      collapsedPositionIds: (() => {
        const next = new Set(get().collapsedPositionIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      })()
    });
  },

  clearDragError: () => set({ dragError: null }),
  showToast: message => set({ toast: message }),
  clearToast: () => set({ toast: null }),

  openAssignEmployee: positionId => set({ assignmentForm: { open: true, positionId } }),
  closeAssignEmployee: () => set({ assignmentForm: { open: false, positionId: null } }),

  assignEmployee: (employeeId, positionId, options) => {
    const { positions, assignments } = get();
    const check = canAssignEmployeeToPosition(employeeId, positionId, positions, assignments);
    if (!check.ok) return { ok: false, error: check.error };

    const effectiveFrom = options?.effectiveFrom ?? new Date().toISOString().slice(0, 10);
    const notes = options?.notes?.trim() || undefined;

    const updatedAssignments = assignments.map(a => {
      if (
        a.employeeId === employeeId &&
        a.status === 'active' &&
        a.effectiveTo === null &&
        a.positionId !== positionId
      ) {
        return { ...a, effectiveTo: effectiveFrom, status: 'ended' as const };
      }
      return a;
    });

    const newAssignment: PositionAssignment = {
      id: createId('asgn'),
      employeeId,
      positionId,
      effectiveFrom,
      effectiveTo: null,
      status: 'active',
      notes
    };

    set({ assignments: [...updatedAssignments, newAssignment] });
    get().closeAssignEmployee();
    get().showToast('Employee assigned successfully.');
    return { ok: true };
  },

  openCreateEmployee: () =>
    set({ employeeForm: { open: true, mode: 'create', employeeId: null } }),

  openEditEmployee: employeeId =>
    set({ employeeForm: { open: true, mode: 'edit', employeeId } }),

  closeEmployeeForm: () =>
    set({ employeeForm: { open: false, mode: 'create', employeeId: null } }),

  updateEmployeePersonal: (employeeId, values) => {
    if (!values.firstName.trim() || !values.lastName.trim()) {
      return { ok: false, error: 'First and last name are required.' };
    }
    if (!values.email.trim()) return { ok: false, error: 'Email is required.' };

    set({
      employees: get().employees.map(e =>
        e.id === employeeId
          ? {
              ...e,
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
              email: values.email.trim(),
              phone: values.phone.trim() || undefined
            }
          : e
      )
    });
    get().showToast('Profile updated.');
    return { ok: true };
  },

  updateEmployeeEmployment: (employeeId, values) => {
    if (values.status === 'active' && !values.workMode) {
      return { ok: false, error: 'Work Mode is required for active employees.' };
    }
    if (!values.startDate) return { ok: false, error: 'Start date is required.' };

    set({
      employees: get().employees.map(e =>
        e.id === employeeId
          ? {
              ...e,
              employmentType: values.employmentType,
              startDate: values.startDate,
              workMode: values.workMode || null,
              status: values.status
            }
          : e
      )
    });

    if (values.positionId) {
      const { positions, assignments } = get();
      const check = canAssignEmployeeToPosition(
        employeeId,
        values.positionId,
        positions,
        assignments
      );
      if (!check.ok) return { ok: false, error: check.error };

      const active = assignments.find(
        a =>
          a.employeeId === employeeId &&
          a.status === 'active' &&
          a.effectiveTo === null
      );

      if (!active || active.positionId !== values.positionId) {
        const effectiveFrom = values.startDate;
        const updatedAssignments = assignments.map(a => {
          if (
            a.employeeId === employeeId &&
            a.status === 'active' &&
            a.effectiveTo === null &&
            a.positionId !== values.positionId
          ) {
            return { ...a, effectiveTo: effectiveFrom, status: 'ended' as const };
          }
          return a;
        });

        const newAssignment: PositionAssignment = {
          id: createId('asgn'),
          employeeId,
          positionId: values.positionId,
          effectiveFrom,
          effectiveTo: null,
          status: 'active'
        };

        set({ assignments: [...updatedAssignments, newAssignment] });
      }
    }

    get().showToast('Employment details saved.');
    return { ok: true };
  },

  saveEmployee: values => {
    const { employees, employeeForm } = get();

    if (!values.firstName.trim() || !values.lastName.trim()) {
      return { ok: false, error: 'First and last name are required.' };
    }
    if (!values.email.trim()) {
      return { ok: false, error: 'Email is required.' };
    }
    if (!values.startDate) {
      return { ok: false, error: 'Start date is required.' };
    }
    if (values.status === 'active' && !values.workMode) {
      return { ok: false, error: 'Work Mode is required for active employees.' };
    }

    const existing = employeeForm.employeeId
      ? employees.find(e => e.id === employeeForm.employeeId)
      : undefined;

    const employeePayload: Employee = {
      id: existing?.id ?? createId('emp'),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      status: values.status,
      employmentType: values.employmentType,
      startDate: values.startDate,
      workMode: values.workMode || null
    };

    set({
      employees: existing
        ? employees.map(e => (e.id === existing.id ? employeePayload : e))
        : [...employees, employeePayload]
    });

    if (values.positionId) {
      const { positions, assignments } = get();
      const check = canAssignEmployeeToPosition(
        employeePayload.id,
        values.positionId,
        positions,
        assignments
      );
      if (!check.ok) {
        return { ok: false, error: check.error };
      }

      const active = assignments.find(
        a =>
          a.employeeId === employeePayload.id &&
          a.status === 'active' &&
          a.effectiveTo === null
      );

      if (!active || active.positionId !== values.positionId) {
        const effectiveFrom = values.startDate;
        const updatedAssignments = assignments.map(a => {
          if (
            a.employeeId === employeePayload.id &&
            a.status === 'active' &&
            a.effectiveTo === null &&
            a.positionId !== values.positionId
          ) {
            return { ...a, effectiveTo: effectiveFrom, status: 'ended' as const };
          }
          return a;
        });

        const newAssignment: PositionAssignment = {
          id: createId('asgn'),
          employeeId: employeePayload.id,
          positionId: values.positionId,
          effectiveFrom,
          effectiveTo: null,
          status: 'active'
        };

        set({ assignments: [...updatedAssignments, newAssignment] });
      }
    }

    get().closeEmployeeForm();
    get().showToast(existing ? 'Employee updated.' : 'Employee added.');
    return { ok: true };
  }
}));

function wouldCreateCycle(
  positionId: string,
  newReportsToPositionId: string,
  positions: Position[]
): boolean {
  let current: string | null = newReportsToPositionId;
  const visited = new Set<string>();
  while (current) {
    if (current === positionId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    current = positions.find(p => p.id === current)?.reportsToPositionId ?? null;
  }
  return false;
}

export { suggestDepartmentCode, getValidHeadPositions };
