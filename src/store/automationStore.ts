import { create } from 'zustand';

import type {

  Automation,

  AutomationAlert,

  AutomationStatus,

  AutomationStep,

  StepType,

  TemplateId

} from '../features/automations/automationTypes';

import { SEED_ALERTS, SEED_AUTOMATIONS, getTemplateById } from '../features/automations/automationMockData';

import { buildAutomationSummary, defaultConfigForType, triggerLabel } from '../features/automations/automationUtils';
import { createEmptyConditionClause, getConditionClauses } from '../features/automations/conditionFields';
import { buildLateAttendanceLeaveSteps } from '../features/automations/lateAttendanceLeaveTemplate';



const now = () => new Date().toISOString();

const createId = () => `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const stepId = () => `step-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;



function countOpenAlerts(alerts: AutomationAlert[], automationId: string) {

  return alerts.filter(a => a.automationId === automationId && (a.status === 'open' || a.status === 'escalated')).length;

}



interface AutomationStore {

  automations: Automation[];

  alerts: AutomationAlert[];

  selectedStepId: string | null;

  newDraftAutomationId: string | null;



  setSelectedStepId: (id: string | null) => void;

  getAutomation: (id: string) => Automation | undefined;

  getAlertsForAutomation: (automationId: string) => AutomationAlert[];



  createBlank: () => string;

  createBlankWithTrigger: (triggerKey: string) => string;

  createFromTemplate: (templateId: Exclude<TemplateId, 'blank'>) => string;

  ensureNewDraft: () => string;

  clearNewDraft: () => void;

  updateAutomation: (id: string, updates: Partial<Automation>) => void;

  duplicateAutomation: (id: string) => string;

  deleteAutomation: (id: string) => void;

  setAutomationStatus: (id: string, status: AutomationStatus) => void;



  addStepAfter: (automationId: string, afterStepId: string | null, type: StepType, sectionId?: string) => string;

  addConditionRow: (automationId: string, conditionStepId: string) => string;

  enableBranch: (automationId: string, conditionStepId: string) => void;

  disableBranch: (automationId: string, conditionStepId: string) => void;

  updateStep: (automationId: string, stepId: string, updates: Partial<AutomationStep>) => void;

  deleteStep: (automationId: string, stepId: string) => void;



  acknowledgeAlert: (id: string) => void;

  resolveAlert: (id: string) => void;

  escalateAlert: (id: string) => void;

}



function assignStepIds(steps: Omit<AutomationStep, 'id'>[]): AutomationStep[] {

  return steps.map((s, i) => ({ ...s, id: stepId(), sortOrder: i }));

}



function resolveConditionParentForNestedAdd(
  steps: AutomationStep[],
  afterStepId: string | null,
  sectionId: string
): string | null {
  const yesMatch = sectionId.match(/^branch-(.+)-yes$/);
  if (yesMatch) return yesMatch[1];

  if (sectionId === 'main' && afterStepId) {
    const afterStep = steps.find(s => s.id === afterStepId);
    if (afterStep?.type === 'condition') return afterStepId;
  }

  return null;
}

function syncAlertCounts(automation: Automation, alerts: AutomationAlert[]): Automation {

  const created = alerts.filter(a => a.automationId === automation.id).length;

  const open = countOpenAlerts(alerts, automation.id);

  return { ...automation, alertsCreated: created, openAlerts: open };

}



export const useAutomationStore = create<AutomationStore>((set, get) => ({

  automations: SEED_AUTOMATIONS.map(a => syncAlertCounts(a, SEED_ALERTS)),

  alerts: SEED_ALERTS,

  selectedStepId: null,

  newDraftAutomationId: null,



  setSelectedStepId: (id) => set({ selectedStepId: id }),



  getAutomation: (id) => get().automations.find(a => a.id === id),



  getAlertsForAutomation: (automationId) => get().alerts.filter(a => a.automationId === automationId),



  createBlank: () => {

    const id = createId();

    const steps = assignStepIds([{ type: 'trigger', config: { triggerKey: '' }, sectionId: 'main', sortOrder: 0 }]);

    const automation: Automation = {

      id,

      templateId: 'blank',

      name: 'Untitled Automation',

      description: '',

      summary: '',

      area: 'Employee Lifecycle',

      trigger: '',

      status: 'draft',

      steps,

      lastRunAt: null,

      runCount: 0,

      failureCount: 0,

      alertsCreated: 0,

      openAlerts: 0,

      createdAt: now(),

      updatedAt: now()

    };

    set(s => ({

      automations: [...s.automations, automation],

      selectedStepId: steps[0]?.id ?? null,

      newDraftAutomationId: id

    }));

    return id;

  },



  createBlankWithTrigger: (triggerKey) => {

    const id = createId();

    const steps = assignStepIds([{ type: 'trigger', config: { triggerKey }, sectionId: 'main', sortOrder: 0 }]);

    const automation: Automation = {

      id,

      templateId: 'blank',

      name: 'Untitled Automation',

      description: '',

      summary: '',

      area: 'Employee Lifecycle',

      trigger: triggerLabel(triggerKey),

      status: 'draft',

      steps,

      lastRunAt: null,

      runCount: 0,

      failureCount: 0,

      alertsCreated: 0,

      openAlerts: 0,

      createdAt: now(),

      updatedAt: now()

    };

    set(s => ({

      automations: [...s.automations, automation],

      selectedStepId: steps[0]?.id ?? null,

      newDraftAutomationId: null

    }));

    return id;

  },



  createFromTemplate: (templateId) => {

    const template = getTemplateById(templateId);

    if (!template) return '';

    const id = createId();

    const steps =
      templateId === 'late_attendance_leave_rule'
        ? buildLateAttendanceLeaveSteps()
        : assignStepIds(template.steps);

    const trigger = steps.find(s => s.type === 'trigger');

    const automation: Automation = {

      id,

      templateId: template.id,

      name: template.name,

      description: template.description,

      summary: template.summary,

      area: template.area,

      trigger: trigger ? triggerLabel(trigger.config.triggerKey ?? '') : '',

      status: 'draft',

      steps,

      lastRunAt: null,

      runCount: 0,

      failureCount: 0,

      alertsCreated: 0,

      openAlerts: 0,

      createdAt: now(),

      updatedAt: now()

    };

    set(s => ({ automations: [...s.automations, automation], selectedStepId: steps[0]?.id ?? null }));

    return id;

  },



  ensureNewDraft: () => {

    const existing = get().newDraftAutomationId;

    if (existing && get().getAutomation(existing)) return existing;

    return get().createBlank();

  },



  clearNewDraft: () => set({ newDraftAutomationId: null }),



  updateAutomation: (id, updates) => {

    set(s => ({

      automations: s.automations.map(a => {

        if (a.id !== id) return a;

        const merged = { ...a, ...updates, updatedAt: now() };

        return { ...merged, summary: buildAutomationSummary(merged) };

      })

    }));

  },

  duplicateAutomation: (id) => {

    const source = get().automations.find(a => a.id === id);

    if (!source) return '';

    const newId = createId();

    const copy: Automation = {

      ...source,

      id: newId,

      templateId: source.templateId,

      name: `${source.name} (Copy)`,

      status: 'draft',

      steps: source.steps.map(s => ({ ...s, id: stepId() })),

      lastRunAt: null,

      runCount: 0,

      failureCount: 0,

      alertsCreated: 0,

      openAlerts: 0,

      createdAt: now(),

      updatedAt: now()

    };

    set(s => ({ automations: [...s.automations, copy] }));

    return newId;

  },



  deleteAutomation: (id) => {

    set(s => ({

      automations: s.automations.filter(a => a.id !== id),

      alerts: s.alerts.filter(a => a.automationId !== id),

      newDraftAutomationId: s.newDraftAutomationId === id ? null : s.newDraftAutomationId

    }));

  },



  setAutomationStatus: (id, status) => get().updateAutomation(id, { status }),



  addConditionRow: (automationId, conditionStepId) => {
    set(s => ({
      automations: s.automations.map(a => {
        if (a.id !== automationId) return a;
        const steps = a.steps.map(st => {
          if (st.id !== conditionStepId || st.type !== 'condition') return st;
          const clauses = getConditionClauses(st.config);
          return {
            ...st,
            config: {
              ...st.config,
              conditions: [...clauses, createEmptyConditionClause()],
              field: '',
              operator: '',
              value: ''
            }
          };
        });
        const merged = { ...a, steps, updatedAt: now() };
        return { ...merged, summary: buildAutomationSummary(merged) };
      }),
      selectedStepId: conditionStepId
    }));
    return conditionStepId;
  },

  addStepAfter: (automationId, afterStepId, type, sectionId = 'main') => {
    const automation = get().automations.find(a => a.id === automationId);
    if (type === 'condition' && automation) {
      const parentId = resolveConditionParentForNestedAdd(automation.steps, afterStepId, sectionId);
      if (parentId) {
        return get().addConditionRow(automationId, parentId);
      }
    }

    const newStepId = stepId();

    set(s => ({

      automations: s.automations.map(a => {

        if (a.id !== automationId) return a;

        const sectionSteps = a.steps.filter(st => st.sectionId === sectionId).sort((x, y) => x.sortOrder - y.sortOrder);

        let insertAt = sectionSteps.length;

        if (afterStepId) {

          const idx = sectionSteps.findIndex(st => st.id === afterStepId);

          if (idx >= 0) insertAt = idx + 1;

        }

        const newStep: AutomationStep = {

          id: newStepId,

          type,

          config: defaultConfigForType(type),

          sectionId,

          sortOrder: insertAt

        };

        const updated = [...a.steps];

        sectionSteps.forEach((st, i) => {

          const global = updated.findIndex(u => u.id === st.id);

          if (global >= 0) updated[global] = { ...updated[global], sortOrder: i >= insertAt ? i + 1 : i };

        });

        updated.push(newStep);

        const merged = { ...a, steps: updated, updatedAt: now() };

        return { ...merged, summary: buildAutomationSummary(merged) };

      }),

      selectedStepId: newStepId

    }));

    return newStepId;

  },



  enableBranch: (automationId, conditionStepId) => {

    set(s => ({

      automations: s.automations.map(a => {

        if (a.id !== automationId) return a;

        const steps = a.steps.map(st =>

          st.id === conditionStepId ? { ...st, config: { ...st.config, hasBranch: true } } : st

        );

        return { ...a, steps, updatedAt: now() };

      })

    }));

  },



  disableBranch: (automationId, conditionStepId) => {

    set(s => ({

      automations: s.automations.map(a => {

        if (a.id !== automationId) return a;

        const steps = a.steps

          .filter(st => !st.sectionId.startsWith(`branch-${conditionStepId}-`))

          .map(st =>

            st.id === conditionStepId ? { ...st, config: { ...st.config, hasBranch: false } } : st

          );

        return { ...a, steps, updatedAt: now() };

      })

    }));

  },



  updateStep: (automationId, stepId, updates) => {

    set(s => ({

      automations: s.automations.map(a => {

        if (a.id !== automationId) return a;

        const steps = a.steps.map(st => (st.id === stepId ? { ...st, ...updates, config: { ...st.config, ...updates.config } } : st));

        const trigger = steps.find(st => st.type === 'trigger');

        const merged = {

          ...a,

          steps,

          trigger: trigger ? triggerLabel(trigger.config.triggerKey ?? '') : a.trigger,

          updatedAt: now()

        };

        return { ...merged, summary: buildAutomationSummary(merged) };

      })

    }));

  },



  deleteStep: (automationId, stepId) => {

    set(s => ({

      automations: s.automations.map(a => {

        if (a.id !== automationId) return a;

        const steps = a.steps.filter(st => st.id !== stepId && !st.sectionId.includes(stepId));

        const merged = { ...a, steps, updatedAt: now() };

        return { ...merged, summary: buildAutomationSummary(merged) };

      }),

      selectedStepId: s.selectedStepId === stepId ? null : s.selectedStepId

    }));

  },



  acknowledgeAlert: (id) => {

    set(s => {

      const alerts = s.alerts.map(a => (a.id === id ? { ...a, status: 'acknowledged' as const } : a));

      return {

        alerts,

        automations: s.automations.map(a => syncAlertCounts(a, alerts))

      };

    });

  },



  resolveAlert: (id) => {

    set(s => {

      const alerts = s.alerts.map(a => (a.id === id ? { ...a, status: 'resolved' as const } : a));

      return {

        alerts,

        automations: s.automations.map(a => syncAlertCounts(a, alerts))

      };

    });

  },



  escalateAlert: (id) => {

    set(s => {

      const alerts = s.alerts.map(a => (a.id === id ? { ...a, status: 'escalated' as const } : a));

      return {

        alerts,

        automations: s.automations.map(a => syncAlertCounts(a, alerts))

      };

    });

  }

}));

