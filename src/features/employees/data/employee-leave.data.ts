export type LeaveTypeKey = 'Annual' | 'Sick' | 'Casual' | 'Other';
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  leaveType: LeaveTypeKey;
  startDate: string;
  endDate: string;
  days: number;
  hours?: number;
  status: LeaveRequestStatus;
  submittedDate: string;
  reason?: string;
  approver?: string;
  rejectionNote?: string;
  attachmentName?: string;
  employeeName?: string;
}

export interface LeaveHistoryEntry {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  hours?: number;
  status: 'approved' | 'rejected';
  approver: string;
}

export interface UpcomingLeave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  hours?: number;
}

export interface LeaveCompanyHoliday {
  id: string;
  label: string;
  date: string;
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    leaveType: 'Annual',
    startDate: 'Jun 15, 2026',
    endDate: 'Jun 17, 2026',
    days: 3,
    status: 'pending',
    submittedDate: 'Jun 10, 2026',
    reason: 'Family vacation',
    approver: 'Manager'
  },
  {
    id: 'lr-2',
    leaveType: 'Sick',
    startDate: 'Jun 3, 2026',
    endDate: 'Jun 3, 2026',
    days: 1,
    status: 'approved',
    submittedDate: 'Jun 3, 2026',
    reason: 'Medical appointment',
    approver: 'HR'
  },
  {
    id: 'lr-3',
    leaveType: 'Casual',
    startDate: 'May 20, 2026',
    endDate: 'May 21, 2026',
    days: 2,
    status: 'rejected',
    submittedDate: 'May 15, 2026',
    reason: 'Personal errands',
    approver: 'Manager',
    rejectionNote: 'Casual balance exceeded'
  },
  {
    id: 'lr-4',
    leaveType: 'Annual',
    startDate: 'May 5, 2026',
    endDate: 'May 9, 2026',
    days: 5,
    status: 'approved',
    submittedDate: 'Apr 28, 2026',
    reason: 'Travel',
    approver: 'Manager'
  }
];

export const leaveHistory: LeaveHistoryEntry[] = [
  { id: 'lh-1', leaveType: 'Annual', startDate: 'Apr 1', endDate: 'Apr 3', days: 3, status: 'approved', approver: 'Manager' },
  { id: 'lh-2', leaveType: 'Sick',   startDate: 'Mar 12', endDate: 'Mar 12', days: 1, status: 'approved', approver: 'HR'      },
  { id: 'lh-3', leaveType: 'Annual', startDate: 'Feb 20', endDate: 'Feb 21', days: 2, status: 'approved', approver: 'Manager' },
  { id: 'lh-4', leaveType: 'Casual', startDate: 'Jan 15', endDate: 'Jan 15', days: 1, status: 'rejected', approver: 'Manager' }
];

export const upcomingLeaves: UpcomingLeave[] = [
  { id: 'ul-1', leaveType: 'Annual', startDate: 'Jun 15', endDate: 'Jun 17', days: 3 }
];

export const leaveCompanyHolidays: LeaveCompanyHoliday[] = [
  { id: 'hol-1', label: 'Midsummer Day', date: 'Jun 24' },
  { id: 'hol-2', label: 'National Day',  date: 'Jul 4'  }
];

export const leavePolicyNotes = [
  { id: 'lpn-1', text: 'Submit annual leave at least 2 working days in advance.' },
  { id: 'lpn-2', text: 'Sick leave: attach medical certificate for 3+ consecutive days.' },
  { id: 'lpn-3', text: 'Casual leave is limited to 5 days per calendar year.' },
  { id: 'lpn-4', text: 'Leave balance resets on January 1 each year.' }
];
