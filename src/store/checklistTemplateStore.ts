import { create } from 'zustand';
import type {
  ChecklistTemplate,
  ChecklistTemplateFormState,
  ChecklistTemplateItem,
  ChecklistTemplateStatus,
  ChecklistTemplateType
} from '../features/people/checklist-templates/checklistTemplateTypes';
import { SEED_CHECKLIST_TEMPLATES } from '../features/people/checklist-templates/checklistTemplateMockData';
import { validateChecklistTemplate } from '../features/people/checklist-templates/checklistTemplateUtils';

const now = () => new Date().toISOString();
const createId = () => `ct-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
const itemId = () => `cti-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

interface ChecklistTemplateStore {
  templates: ChecklistTemplate[];
  form: ChecklistTemplateFormState;

  openCreateForm: () => void;
  openEditForm: (id: string) => void;
  closeForm: () => void;
  saveTemplate: (data: Omit<ChecklistTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string | null;
  duplicateTemplate: (id: string) => string;
  setTemplateStatus: (id: string, status: ChecklistTemplateStatus) => void;
  deleteTemplate: (id: string) => void;
  getActiveTemplatesByType: (type: ChecklistTemplateType) => ChecklistTemplate[];
  getTemplateById: (id: string) => ChecklistTemplate | undefined;
}

export const useChecklistTemplateStore = create<ChecklistTemplateStore>((set, get) => ({
  templates: SEED_CHECKLIST_TEMPLATES,
  form: { open: false, mode: 'create', templateId: null },

  openCreateForm: () => set({ form: { open: true, mode: 'create', templateId: null } }),

  openEditForm: (id) => set({ form: { open: true, mode: 'edit', templateId: id } }),

  closeForm: () => set({ form: { open: false, mode: 'create', templateId: null } }),

  saveTemplate: (data) => {
    const forActivate = data.status === 'active';
    const issues = validateChecklistTemplate({ ...data, items: data.items }, forActivate);
    if (issues.length > 0) return null;

    const existingId = data.id;
    if (existingId) {
      set(s => ({
        templates: s.templates.map(t =>
          t.id === existingId
            ? { ...t, ...data, id: existingId, updatedAt: now() }
            : t
        )
      }));
      return existingId;
    }

    const id = createId();
    const template: ChecklistTemplate = {
      id,
      name: data.name,
      type: data.type,
      description: data.description,
      status: data.status,
      items: data.items.map((item, i) => ({ ...item, id: item.id || itemId(), sortOrder: i })),
      createdAt: now(),
      updatedAt: now()
    };
    set(s => ({ templates: [...s.templates, template] }));
    return id;
  },

  duplicateTemplate: (id) => {
    const source = get().templates.find(t => t.id === id);
    if (!source) return '';
    const newId = createId();
    const copy: ChecklistTemplate = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'draft',
      items: source.items.map((item, i) => ({ ...item, id: itemId(), sortOrder: i })),
      createdAt: now(),
      updatedAt: now()
    };
    set(s => ({ templates: [...s.templates, copy] }));
    return newId;
  },

  setTemplateStatus: (id, status) => {
    const template = get().templates.find(t => t.id === id);
    if (!template) return;
    if (status === 'active') {
      const issues = validateChecklistTemplate(template, true);
      if (issues.length > 0) return;
    }
    set(s => ({
      templates: s.templates.map(t => t.id === id ? { ...t, status, updatedAt: now() } : t)
    }));
  },

  deleteTemplate: (id) => {
    set(s => ({ templates: s.templates.filter(t => t.id !== id) }));
  },

  getActiveTemplatesByType: (type) => get().templates.filter(t => t.type === type && t.status === 'active'),

  getTemplateById: (id) => get().templates.find(t => t.id === id)
}));

export function createEmptyChecklistItem(sortOrder: number): ChecklistTemplateItem {
  return {
    id: itemId(),
    title: '',
    description: '',
    assigneeType: '',
    assigneeRole: '',
    assigneePositionId: '',
    assigneeEmployeeId: '',
    dueOffsetDays: 0,
    required: true,
    sortOrder
  };
}
