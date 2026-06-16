import { create } from 'zustand';
import type { BulkImportColumnMapping, BulkImportRow, BulkAccessGroup, ImportRun } from '../features/people/bulk-onboarding/bulkOnboardingTypes';

export type BulkOnboardingStep =
  | 'upload'
  | 'map-columns'
  | 'resolve-organization'
  | 'review-access'
  | 'validate-rows'
  | 'confirm-import'
  | 'send-invitations';

const STEP_ORDER: BulkOnboardingStep[] = [
  'upload',
  'map-columns',
  'resolve-organization',
  'review-access',
  'validate-rows',
  'confirm-import',
  'send-invitations'
];

export const runId = () => `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface BulkOnboardingState {
  step: BulkOnboardingStep;
  fileName: string;
  headers: string[];
  rawRows: string[][];
  mapping: BulkImportColumnMapping;
  rows: BulkImportRow[];
  accessGroups: BulkAccessGroup[];
  importRuns: ImportRun[];
  activeRunId: string | null;

  reset: () => void;
  goToStep: (step: BulkOnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setUploadedFile: (fileName: string, headers: string[], rawRows: string[][], mapping: BulkImportColumnMapping) => void;
  setMapping: (mapping: BulkImportColumnMapping) => void;
  setRows: (rows: BulkImportRow[]) => void;
  setAccessGroups: (groups: BulkAccessGroup[]) => void;
  toggleRowSkip: (rowIndex: number) => void;
  recordImportRun: (run: ImportRun) => void;
  updateImportRun: (id: string, updates: Partial<ImportRun>) => void;
}

const INITIAL: Pick<BulkOnboardingState, 'step' | 'fileName' | 'headers' | 'rawRows' | 'mapping' | 'rows' | 'accessGroups' | 'activeRunId'> = {
  step: 'upload',
  fileName: '',
  headers: [],
  rawRows: [],
  mapping: {},
  rows: [],
  accessGroups: [],
  activeRunId: null
};

export const useBulkOnboardingStore = create<BulkOnboardingState>((set, get) => ({
  ...INITIAL,
  importRuns: [],

  reset: () => set({ ...INITIAL }),

  goToStep: step => set({ step }),

  nextStep: () => {
    const idx = STEP_ORDER.indexOf(get().step);
    set({ step: STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)] });
  },

  prevStep: () => {
    const idx = STEP_ORDER.indexOf(get().step);
    set({ step: STEP_ORDER[Math.max(idx - 1, 0)] });
  },

  setUploadedFile: (fileName, headers, rawRows, mapping) => set({ fileName, headers, rawRows, mapping }),
  setMapping: mapping => set({ mapping }),
  setRows: rows => set({ rows }),
  setAccessGroups: accessGroups => set({ accessGroups }),

  toggleRowSkip: rowIndex => set({
    rows: get().rows.map(r => r.rowIndex === rowIndex ? { ...r, skip: !r.skip } : r)
  }),

  recordImportRun: run => set({ importRuns: [run, ...get().importRuns], activeRunId: run.id }),

  updateImportRun: (id, updates) => set({
    importRuns: get().importRuns.map(r => r.id === id ? { ...r, ...updates } : r)
  })
}));
