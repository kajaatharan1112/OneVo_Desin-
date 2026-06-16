import { create } from 'zustand';
import { useOrganizationStore } from '../../../store/organizationStore';
import { SEED_HR_COVERAGE } from './hrCoverageMockData';
import type {
  HRCoverageFormState,
  HRCoverageFormValues,
  HRCoverageRule
} from './hrCoverageTypes';

const createId = () => `hr-cov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const closedForm = (): HRCoverageFormState => ({
  open: false,
  mode: 'create',
  ruleId: null
});

function ownerLabel(values: HRCoverageFormValues): string {
  const { employees, positions } = useOrganizationStore.getState();
  if (values.ownerType === 'employee') {
    const emp = employees.find(e => e.id === values.ownerEmployeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
  }
  const pos = positions.find(p => p.id === values.ownerPositionId);
  return pos ? `${pos.name} position` : 'Position';
}

function validate(values: HRCoverageFormValues): string | null {
  if (values.ownerType === 'employee' && !values.ownerEmployeeId) {
    return 'Select an HR person.';
  }
  if (values.ownerType === 'position' && !values.ownerPositionId) {
    return 'Select an HR position.';
  }
  if (values.coverageType === 'selected_departments' && values.departmentIds.length === 0) {
    return 'Select at least one department.';
  }
  if (values.coverageType === 'selected_positions' && values.positionIds.length === 0) {
    return 'Select at least one position.';
  }
  if (values.accessAllowed.length === 0) {
    return 'Select at least one access permission.';
  }
  return null;
}

interface HRCoverageStore {
  rules: HRCoverageRule[];
  form: HRCoverageFormState;
  toast: string | null;
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeForm: () => void;
  saveRule: (values: HRCoverageFormValues) => { ok: boolean; error?: string };
  deleteRule: (id: string) => void;
  clearToast: () => void;
}

export const useHRCoverageStore = create<HRCoverageStore>((set, get) => ({
  rules: SEED_HR_COVERAGE,
  form: closedForm(),
  toast: null,

  openCreate: () => set({ form: { open: true, mode: 'create', ruleId: null } }),

  openEdit: id => set({ form: { open: true, mode: 'edit', ruleId: id } }),

  closeForm: () => set({ form: closedForm() }),

  saveRule: values => {
    const error = validate(values);
    if (error) return { ok: false, error };

    const { form, rules } = get();
    const payload: Omit<HRCoverageRule, 'id'> = {
      ownerType: values.ownerType,
      ownerEmployeeId: values.ownerType === 'employee' ? values.ownerEmployeeId : null,
      ownerPositionId: values.ownerType === 'position' ? values.ownerPositionId : null,
      ownerLabel: ownerLabel(values),
      coverageType: values.coverageType,
      departmentIds: [...values.departmentIds],
      positionIds: [...values.positionIds],
      accessAllowed: [...values.accessAllowed],
      status: values.status
    };

    if (form.mode === 'edit' && form.ruleId) {
      set({
        rules: rules.map(r => (r.id === form.ruleId ? { ...payload, id: form.ruleId } : r)),
        form: closedForm(),
        toast: 'HR coverage updated.'
      });
    } else {
      set({
        rules: [...rules, { ...payload, id: createId() }],
        form: closedForm(),
        toast: 'HR coverage added.'
      });
    }
    return { ok: true };
  },

  deleteRule: id => {
    const rule = get().rules.find(r => r.id === id);
    set({
      rules: get().rules.filter(r => r.id !== id),
      toast: rule ? `"${rule.ownerLabel}" coverage removed.` : 'Coverage removed.'
    });
  },

  clearToast: () => set({ toast: null })
}));
