import { create } from 'zustand';
import type { OvertimeRule, OvertimeRuleFormState, OvertimeRuleFormValues } from './overtimeRulesTypes';
import { SEED_OVERTIME_RULES } from './overtimeRulesMockData';
import { formValuesToRule, validateOvertimeRuleForm } from './overtimeRulesUtils';

const createId = () => `ot-rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const closedForm = (): OvertimeRuleFormState => ({
  open: false,
  mode: 'create',
  ruleId: null
});

interface OvertimeRulesStore {
  rules: OvertimeRule[];
  form: OvertimeRuleFormState;
  toast: string | null;
  openCreateRule: () => void;
  openEditRule: (id: string) => void;
  closeForm: () => void;
  saveRule: (values: OvertimeRuleFormValues) => { ok: boolean; error?: string };
  deleteRule: (id: string) => void;
  clearToast: () => void;
}

export const useOvertimeRulesStore = create<OvertimeRulesStore>((set, get) => ({
  rules: SEED_OVERTIME_RULES,
  form: closedForm(),
  toast: null,

  openCreateRule: () => set({ form: { open: true, mode: 'create', ruleId: null } }),

  openEditRule: id => set({ form: { open: true, mode: 'edit', ruleId: id } }),

  closeForm: () => set({ form: closedForm() }),

  saveRule: values => {
    const error = validateOvertimeRuleForm(values);
    if (error) return { ok: false, error };

    const { form, rules } = get();
    const payload = formValuesToRule(values, form.ruleId ?? undefined);

    if (form.mode === 'edit' && form.ruleId) {
      set({
        rules: rules.map(r => (r.id === form.ruleId ? { ...payload, id: form.ruleId } : r)),
        form: closedForm(),
        toast: 'Overtime rule updated.'
      });
    } else {
      const next: OvertimeRule = { ...payload, id: createId() };
      set({
        rules: [...rules, next],
        form: closedForm(),
        toast: 'Overtime rule created.'
      });
    }

    return { ok: true };
  },

  deleteRule: id => {
    const rule = get().rules.find(r => r.id === id);
    set({
      rules: get().rules.filter(r => r.id !== id),
      toast: rule ? `"${rule.name}" deleted.` : 'Rule deleted.'
    });
  },

  clearToast: () => set({ toast: null })
}));
