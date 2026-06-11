import type {
  DecisionLogEntry,
  EmployeeRequest,
  LeaveBalance,
  NeedsActionItem,
  RequestCategoryCount,
  RequestStats
} from '../types/employee-requests.types';

/** Dabi · Software Developer · 12 Nov 2025 */
export const employeeNeedsAction: NeedsActionItem = {
  requestTitle: 'Travel Reimbursement',
  message: 'Upload receipt before Finance can approve it.',
  primaryCta: 'Upload Receipt',
  secondaryCta: 'View Request'
};

export const employeeRequestStats: RequestStats = {
  total: 24,
  pending: 7,
  approved: 12,
  rejected: 4,
  needsAction: 1
};

export const employeeActiveRequests: EmployeeRequest[] = [
  {
    id: 'req-2',
    title: 'Travel Reimbursement',
    type: 'expense',
    typeLabel: 'Expense',
    status: 'needs-action',
    with: 'Finance',
    expected: 'Receipt required',
    nextAction: 'Upload receipt',
    rowAction: 'upload-receipt'
  },
  {
    id: 'req-1',
    title: 'Annual Leave — 2 days',
    type: 'leave',
    typeLabel: 'Leave',
    status: 'pending',
    with: 'Manager',
    expected: 'Today',
    nextAction: 'Waiting for review'
  },
  {
    id: 'req-5',
    title: 'Attendance Correction',
    type: 'attendance',
    typeLabel: 'Attendance',
    status: 'pending',
    with: 'HR',
    expected: 'Tomorrow',
    nextAction: 'Waiting for review'
  },
  {
    id: 'req-3',
    title: 'WFH Friday',
    type: 'wfh',
    typeLabel: 'WFH',
    status: 'approved',
    with: 'HR',
    expected: 'No action',
    nextAction: 'Ready'
  },
  {
    id: 'req-4',
    title: 'Laptop Replacement',
    type: 'asset',
    typeLabel: 'Asset',
    status: 'rejected',
    with: 'IT',
    expected: 'Reason added',
    nextAction: 'Review rejection',
    rowAction: 'view-reason'
  }
];

export const employeeRequestCategories: RequestCategoryCount[] = [
  { typeLabel: 'Leave', count: 8 },
  { typeLabel: 'Expense', count: 5 },
  { typeLabel: 'WFH', count: 4 },
  { typeLabel: 'Asset', count: 3 },
  { typeLabel: 'Attendance', count: 4 }
];

export const employeeDecisionLog: DecisionLogEntry[] = [
  {
    id: 'log-1',
    title: 'Reimbursement approved',
    date: '5 Nov 2025',
    detail: 'Payment queued by Finance',
    status: 'approved'
  },
  {
    id: 'log-2',
    title: 'Asset request forwarded to IT',
    date: '4 Nov 2025',
    detail: 'IT checking stock availability',
    status: 'forwarded'
  },
  {
    id: 'log-3',
    title: 'Duplicate leave request rejected',
    date: '2 Nov 2025',
    detail: 'Original request is still active',
    status: 'rejected'
  }
];

export const employeePendingApprovalTimeline = [
  {
    id: 'pat-1',
    title: 'Annual Leave',
    submitted: '10 Nov',
    currentStep: 'Manager review',
    expectedDecision: 'Today'
  },
  {
    id: 'pat-2',
    title: 'Attendance Correction',
    submitted: '11 Nov',
    currentStep: 'HR review',
    expectedDecision: 'Tomorrow'
  },
  {
    id: 'pat-3',
    title: 'Travel Reimbursement',
    submitted: '9 Nov',
    currentStep: 'Waiting for receipt upload',
    expectedDecision: 'After receipt upload'
  }
];


export const employeeQuickRequestTypes = [
  { id: 'qr-1', label: 'Apply Leave', type: 'leave' as const },
  { id: 'qr-2', label: 'Request WFH', type: 'wfh' as const },
  { id: 'qr-3', label: 'Claim Expense', type: 'expense' as const },
  { id: 'qr-4', label: 'Request Asset', type: 'asset' as const },
  { id: 'qr-5', label: 'Attendance Correction', type: 'attendance' as const }
];

/** Annual 12 left · Sick 9 · Casual 3 = 24 total remaining */
export const employeeLeaveBalance: LeaveBalance = {
  totalRemaining: 24,
  items: [
    { id: 'annual', label: 'Annual', used: 6, total: 18 },
    { id: 'sick', label: 'Sick', used: 1, total: 10 },
    { id: 'casual', label: 'Casual', used: 2, total: 5 }
  ]
};

export const employeeRequestPolicyNotes = [
  { id: 'pol-1', text: 'Leave request: submit at least 2 days before.' },
  { id: 'pol-2', text: 'Expense claim: receipt is required.' },
  { id: 'pol-3', text: 'WFH request: manager approval required.' },
  { id: 'pol-4', text: 'Asset request: IT stock check is required.' },
  { id: 'pol-5', text: 'Attendance correction: submit before payroll cut-off.' }
];
