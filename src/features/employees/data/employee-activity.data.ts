import type { EmployeeActivityData } from '../types/employee-activity.types';

export const employeeActivityData: EmployeeActivityData = {
  employee: {
    name: 'Dabi',
    role: 'Software Developer',
    department: 'Product Engineering',
    date: 'Wednesday, 12 Nov 2025'
  },
  clockStatus: {
    clockIn: '9:15 AM',
    punctuality: 'on-time',
    currentStatus: 'Working',
    mode: 'Office',
    workedSoFar: '4h 30m',
    targetCheckout: '6:00 PM'
  },
  workHours: {
    expected: '8h',
    completed: '4h 30m',
    remaining: '3h 30m',
    breakDuration: '1h',
    completedPercent: 56,
    segments: {
      workedHours: 4.5,
      breakHours: 1,
      remainingHours: 3.5,
      expectedHours: 8
    }
  },
  attendanceInsight: {
    onTimeDays: 5,
    workDaysThisWeek: 5,
    todayMode: 'Office',
    pendingCorrections: 1,
    weeklyAvgHours: '7h 45m'
  },
  focusBreak: {
    focusHours: 2.75,
    meetingHours: 1.25,
    breakHours: 1
  },
  timeline: [
    {
      id: 'tl-1',
      time: '9:15 AM',
      title: 'Checked in',
      detail: 'Office check-in recorded',
      status: 'Completed'
    },
    {
      id: 'tl-2',
      time: '9:30 AM',
      title: 'Started assigned work',
      detail: 'Employee Profile UI',
      status: 'Completed'
    },
    {
      id: 'tl-3',
      time: '10:30 AM',
      title: 'Team Sync',
      detail: 'Daily team alignment',
      status: 'Completed'
    },
    {
      id: 'tl-4',
      time: '1:00 PM',
      title: 'Lunch break',
      detail: 'Break started',
      status: 'Completed'
    },
    {
      id: 'tl-5',
      time: '3:30 PM',
      title: 'Submitted correction',
      detail: 'Attendance correction · HR review pending',
      status: 'Pending'
    },
    {
      id: 'tl-6',
      time: '5:45 PM',
      title: 'Checkout reminder',
      detail: 'Reminder before target checkout',
      status: 'Upcoming'
    }
  ],
  weeklyPattern: [
    { day: 'Mon', status: 'Office' },
    { day: 'Tue', status: 'Remote' },
    { day: 'Wed', status: 'Office' },
    { day: 'Thu', status: 'Office' },
    { day: 'Fri', status: 'Remote' },
    { day: 'Sat', status: 'Off' },
    { day: 'Sun', status: 'Leave' }
  ],
  alerts: [
    {
      id: 'al-1',
      title: 'Attendance correction pending HR review',
      type: 'warning'
    },
    {
      id: 'al-2',
      title: 'Checkout reminder scheduled for 5:45 PM',
      type: 'info'
    },
    {
      id: 'al-3',
      title: 'No late check-ins this week',
      type: 'success'
    }
  ],
  quickActions: [
    'View attendance sheet',
    'Apply leave',
    'Submit correction',
    'Download timesheet'
  ]
};
