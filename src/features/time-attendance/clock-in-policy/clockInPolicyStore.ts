import { create } from 'zustand';
import type {
  BiometricOutageFallback,
  ClockInExemption,
  ClockInPolicyState,
  ClockInRequirement,
  ExemptionFormState,
  ExemptionFormValues,
  ManualCorrectionPolicy,
  MethodState,
  OutageFallbackDraft,
  OutageFormValues,
  PhotoRequired,
  WorkTypeRule
} from './clockInPolicyTypes';
import {
  DEFAULT_MANUAL_CORRECTION,
  DEFAULT_OUTAGE_DRAFT,
  SEED_EXEMPTIONS,
  SEED_OUTAGE_FALLBACKS,
  SEED_WORK_TYPE_RULES
} from './clockInPolicyMockData';
import {
  buildAppliesToLabel,
  computeOutageTimes,
  resolveExemptionDates,
  validateExemptionForm,
  validateOutageForm
} from './clockInPolicyUtils';

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const closedExemptionForm = (): ExemptionFormState => ({
  open: false,
  mode: 'create',
  exemptionId: null
});

interface ClockInPolicyStore extends ClockInPolicyState {
  setDefaultRequirement: (value: ClockInRequirement) => void;
  updateWorkTypeRule: (id: string, patch: Partial<WorkTypeRule>) => void;
  setOutageFallbackEnabled: (enabled: boolean) => void;
  setOutageDraft: (patch: Partial<OutageFallbackDraft>) => void;
  openOutageForm: () => void;
  closeOutageForm: () => void;
  addOutageFallback: (values: OutageFormValues) => { ok: boolean; error?: string };
  resolveOutageFallback: (id: string) => void;
  setManualCorrection: (patch: Partial<ManualCorrectionPolicy>) => void;
  openCreateExemption: () => void;
  openEditExemption: (id: string) => void;
  closeExemptionForm: () => void;
  saveExemption: (values: ExemptionFormValues) => { ok: boolean; error?: string };
  deleteExemption: (id: string) => void;
  savePolicy: () => void;
  clearToast: () => void;
}

export const useClockInPolicyStore = create<ClockInPolicyStore>((set, get) => ({
  defaultRequirement: 'required',
  workTypeRules: SEED_WORK_TYPE_RULES,
  exemptions: SEED_EXEMPTIONS,
  outageFallbackEnabled: true,
  outageDraft: DEFAULT_OUTAGE_DRAFT(),
  outageFallbacks: SEED_OUTAGE_FALLBACKS,
  outageForm: { open: false },
  manualCorrection: DEFAULT_MANUAL_CORRECTION,
  exemptionForm: closedExemptionForm(),
  toast: null,

  setDefaultRequirement: value => set({ defaultRequirement: value }),

  updateWorkTypeRule: (id, patch) => {
    set({
      workTypeRules: get().workTypeRules.map(rule =>
        rule.id === id ? { ...rule, ...patch } : rule
      )
    });
  },

  setOutageFallbackEnabled: enabled => set({ outageFallbackEnabled: enabled }),

  setOutageDraft: patch => set({ outageDraft: { ...get().outageDraft, ...patch } }),

  openOutageForm: () => set({ outageForm: { open: true } }),

  closeOutageForm: () => set({ outageForm: { open: false } }),

  addOutageFallback: values => {
    const error = validateOutageForm(values);
    if (error) return { ok: false, error };

    const times = computeOutageTimes(values);
    if (!times) return { ok: false, error: 'Unable to compute outage window.' };

    const next: BiometricOutageFallback = {
      id: createId('out'),
      location: values.location.trim(),
      reason: values.reason.trim(),
      startsAt: times.startsAt,
      endsAt: times.endsAt,
      status: values.status,
      enabledBy: 'Manesh'
    };

    set({
      outageFallbacks: [...get().outageFallbacks, next],
      outageForm: { open: false },
      toast: 'Outage fallback enabled.'
    });
    return { ok: true };
  },

  resolveOutageFallback: id => {
    set({
      outageFallbacks: get().outageFallbacks.map(o =>
        o.id === id ? { ...o, status: 'inactive' as const } : o
      ),
      toast: 'Outage fallback resolved.'
    });
  },

  setManualCorrection: patch =>
    set({ manualCorrection: { ...get().manualCorrection, ...patch } }),

  openCreateExemption: () =>
    set({ exemptionForm: { open: true, mode: 'create', exemptionId: null } }),

  openEditExemption: id =>
    set({ exemptionForm: { open: true, mode: 'edit', exemptionId: id } }),

  closeExemptionForm: () => set({ exemptionForm: closedExemptionForm() }),

  saveExemption: values => {
    const error = validateExemptionForm(values);
    if (error) return { ok: false, error };

    const { exemptionForm, exemptions } = get();
    const existing = exemptionForm.exemptionId
      ? exemptions.find(e => e.id === exemptionForm.exemptionId)
      : undefined;

    const dates = resolveExemptionDates(values);
    const appliesToLabel = buildAppliesToLabel(
      values.scope,
      values.employeeIds,
      values.departmentIds,
      values.positionIds
    );

    const next: ClockInExemption = {
      id: existing?.id ?? createId('ex'),
      name: values.name.trim(),
      appliesToLabel,
      scope: values.scope,
      employeeIds: values.scope === 'employee' ? [...values.employeeIds] : [],
      departmentIds: values.scope === 'department' ? [...values.departmentIds] : [],
      positionIds: values.scope === 'position' ? [...values.positionIds] : [],
      clockInRequired: values.clockInRequired,
      effectiveFrom: dates.effectiveFrom,
      effectiveTo: dates.effectiveTo,
      startsImmediately: dates.startsImmediately,
      reason: values.reason.trim() || undefined,
      status: values.status
    };

    set({
      exemptions: existing
        ? exemptions.map(e => (e.id === existing.id ? next : e))
        : [...exemptions, next],
      exemptionForm: closedExemptionForm(),
      toast: existing ? 'Exemption updated.' : 'Exemption added.'
    });
    return { ok: true };
  },

  deleteExemption: id =>
    set({
      exemptions: get().exemptions.filter(e => e.id !== id),
      toast: 'Exemption removed.'
    }),

  savePolicy: () => set({ toast: 'Clock-in policy saved.' }),

  clearToast: () => set({ toast: null })
}));

export type { MethodState, PhotoRequired };
