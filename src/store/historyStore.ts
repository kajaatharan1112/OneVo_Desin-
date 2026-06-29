import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type HistoryCategory = 'People' | 'Organization' | 'Access' | 'Leave' | 'Attendance' | 'Work' | 'Calendar' | 'Billing' | 'Settings';

export interface HistoryEntry {
  id: string;
  createdAt: string;
  actor: string;
  title: string;
  description: string;
  category: HistoryCategory;
  target?: string;
  outcome: 'success' | 'failed';
}

type HistoryInput = Omit<HistoryEntry, 'id' | 'createdAt' | 'actor' | 'outcome'> & {
  actor?: string;
  outcome?: HistoryEntry['outcome'];
};

const seed: HistoryEntry[] = [
  { id: 'history-1', createdAt: '2026-06-27T09:30:00Z', actor: 'Priya Sharma', title: 'User invited', description: 'An invitation was sent to Jordan Wright.', category: 'People', target: 'Jordan Wright', outcome: 'success' },
  { id: 'history-2', createdAt: '2026-06-27T08:45:00Z', actor: 'James Chen', title: 'Leave request approved', description: 'Annual leave for Sam Patel was approved.', category: 'Leave', target: 'Sam Patel', outcome: 'success' },
  { id: 'history-3', createdAt: '2026-06-26T15:10:00Z', actor: 'Priya Sharma', title: 'Workspace created', description: 'The Product Delivery workspace was created.', category: 'Work', target: 'Product Delivery', outcome: 'success' },
  { id: 'history-4', createdAt: '2026-06-26T11:20:00Z', actor: 'Priya Sharma', title: 'Role permissions updated', description: 'Permissions for People Administrator were updated.', category: 'Access', target: 'People Administrator', outcome: 'success' },
  { id: 'history-5', createdAt: '2026-06-25T10:05:00Z', actor: 'Maria Gomez', title: 'Position created', description: 'Senior Software Engineer was added under Engineering Manager.', category: 'Organization', target: 'Senior Software Engineer', outcome: 'success' }
];

interface HistoryState {
  entries: HistoryEntry[];
  record: (entry: HistoryInput) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    set => ({
      entries: seed,
      record: entry => set(state => ({
        entries: [{
          ...entry,
          id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          actor: entry.actor ?? 'Marcus Chen',
          outcome: entry.outcome ?? 'success'
        }, ...state.entries].slice(0, 1000)
      })),
      clear: () => set({ entries: [] })
    }),
    { name: 'onevo-history-store', version: 1 }
  )
);

export const recordHistory = (entry: HistoryInput) => useHistoryStore.getState().record(entry);
