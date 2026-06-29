import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { leaveRequests as SEED_OWN_REQUESTS, type LeaveRequest } from '../features/employees/data/employee-leave.data';
import { useCalendarStore } from './calendarStore';
import { recordHistory } from './historyStore';

const SEED_TEAM_REQUESTS: LeaveRequest[] = [
  {
    id: 'tl-1',
    leaveType: 'Annual',
    startDate: '2026-06-20',
    endDate: '2026-06-23',
    days: 4,
    status: 'approved',
    submittedDate: '2026-06-10',
    employeeName: 'Alexander Pierce'
  },
  {
    id: 'tl-2',
    leaveType: 'Sick',
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    days: 1,
    status: 'pending',
    submittedDate: '2026-06-15',
    employeeName: 'Jordan Kim'
  }
];

function toIsoDate(input: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function enumerateDates(start: string, end: string): string[] {
  const startIso = toIsoDate(start);
  const endIso = toIsoDate(end);
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const cursor = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  const dates: string[] = [];
  while (cursor <= endDate) {
    dates.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

interface LeaveRequestState {
  requests: LeaveRequest[];
  addRequest: (request: LeaveRequest) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, rejectionNote?: string) => void;
}

export const useLeaveRequestStore = create<LeaveRequestState>()(
  persist(
    (set, get) => ({
      requests: [...SEED_OWN_REQUESTS, ...SEED_TEAM_REQUESTS],

      addRequest: request => set(state => ({ requests: [request, ...state.requests] })),

      approveRequest: id => {
        const request = get().requests.find(r => r.id === id);
        if (!request) return;
        set(state => ({
          requests: state.requests.map(r => (r.id === id ? { ...r, status: 'approved' as const } : r))
        }));
        const dates = enumerateDates(request.startDate, request.endDate);
        useCalendarStore.getState().addEvents(dates.map((date, i) => ({
          id: `leave-${request.id}-${i}`,
          title: `${request.leaveType} Leave`,
          date,
          type: 'leave' as const,
          status: 'confirmed' as const,
          source: 'leave' as const,
          scope: 'team' as const,
          ownerName: request.employeeName,
          allDay: true
        })));
        recordHistory({
          category: 'Leave',
          title: 'Leave request approved',
          description: `${request.leaveType} leave for ${request.employeeName ?? 'you'} was approved.`,
          target: request.employeeName ?? 'My leave'
        });
      },

      rejectRequest: (id, rejectionNote) => {
        set(state => ({
          requests: state.requests.map(r => (r.id === id ? { ...r, status: 'rejected' as const, rejectionNote } : r))
        }));
        const request = get().requests.find(r => r.id === id);
        recordHistory({
          category: 'Leave',
          title: 'Leave request rejected',
          description: `${request?.leaveType ?? 'Leave'} request for ${request?.employeeName ?? 'you'} was rejected.`,
          target: request?.employeeName ?? 'My leave'
        });
      }
    }),
    { name: 'onevo-leave-request-store', version: 1 }
  )
);
