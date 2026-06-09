export type CeoStatus = 'green' | 'amber' | 'red';

export interface CeoKpiTile {
  id: string;
  label: string;
  value: string;
}

export type DecisionPriority = 'Medium' | 'High' | 'Urgent';

export interface CeoDecisionSummary {
  pendingApprovals: number;
  waitingOver48Hours: number;
  urgentDecisions: number;
  budgetImpactDecisions: number;
}

export interface CeoDecisionCategory {
  id: string;
  label: string;
  count: number;
}

export interface CeoDecisionQueueItem {
  id: string;
  title: string;
  type: string;
  department: string;
  ageLabel: string;
  priority: DecisionPriority;
}

export interface CeoDecisionAgingBucket {
  label: string;
  count: number;
}

export interface CeoDecisionDeptPending {
  id: string;
  department: string;
  count: number;
}

export interface CeoDecisionHighImpact {
  id: string;
  title: string;
  risk: string;
}

export type ProjectStatus = 'On Track' | 'Delayed' | 'Blocked' | 'At Risk';

export interface CeoProjectSummary {
  activeProjects: number;
  onTrack: number;
  delayed: number;
  blocked: number;
  atRisk: number;
  averageProgress: number;
  onTimeRate: number;
  onTimeDeltaLabel: string;
}

export interface CeoProjectDeliveryTrendPoint {
  month: string;
  rate: number;
}

export interface CeoProjectStatusCount {
  id: string;
  label: string;
  count: number;
}

export interface CeoProjectProgressItem {
  id: string;
  name: string;
  progress: number;
  status: ProjectStatus;
}

export interface CeoProjectIssueItem {
  id: string;
  name: string;
  status: ProjectStatus;
  reason: string;
  delayLabel: string;
}

export interface CeoProjectRiskItem {
  id: string;
  label: string;
  count: number;
}

export interface CeoProjectMilestone {
  id: string;
  title: string;
  dateLabel: string;
  status: ProjectStatus;
}

export interface CeoProjectCeoAction {
  id: string;
  label: string;
}

export interface CeoProjectSection {
  headline: string;
  delta: string;
  status: CeoStatus;
  summary: CeoProjectSummary;
  statusBreakdown: CeoProjectStatusCount[];
  progressOverview: CeoProjectProgressItem[];
  deliveryTrend: CeoProjectDeliveryTrendPoint[];
  delayedBlocked: CeoProjectIssueItem[];
  riskBreakdown: CeoProjectRiskItem[];
  milestones: CeoProjectMilestone[];
  ceoActions: CeoProjectCeoAction[];
}

export interface WorkforceAvailabilitySummary {
  attendanceRate: number;
  activeToday: number;
  totalEmployees: number;
  notAvailableToday: number;
}

export interface WorkforceLocationItem {
  id: string;
  label: string;
  count: number;
  percent: number;
}

export interface WorkforceDepartmentAttendance {
  id: string;
  department: string;
  rate: number;
  present: number;
  onLeave: number;
}

export interface WorkforceLeaveType {
  id: string;
  label: string;
  count: number;
  percent: number;
}

export interface WorkforceEmployeeOnLeave {
  id: string;
  name: string;
  department: string;
  leaveType: string;
}

export interface WorkforceWeeklyTrendDay {
  day: string;
  rate: number;
}

export interface CeoWorkforceSection {
  overviewTitle: string;
  overviewDesc: string;
  availability: WorkforceAvailabilitySummary;
  workLocations: WorkforceLocationItem[];
  departmentAttendance: WorkforceDepartmentAttendance[];
  leaveBreakdown: WorkforceLeaveType[];
  employeesOnLeave: WorkforceEmployeeOnLeave[];
  weeklyAttendanceTrend: WorkforceWeeklyTrendDay[];
}

export interface CeoDecisionsSection {
  headline: string;
  delta: string;
  status: CeoStatus;
  summary: CeoDecisionSummary;
  categoryBreakdown: CeoDecisionCategory[];
  approvalQueue: CeoDecisionQueueItem[];
  agingBuckets: CeoDecisionAgingBucket[];
  departmentPending: CeoDecisionDeptPending[];
  highImpact: CeoDecisionHighImpact[];
}

export type ProductivityHighlightTone = 'positive' | 'negative' | 'warning' | 'neutral';

export interface CeoProductivitySummary {
  scorePercent: number;
  weekDeltaLabel: string;
  completedToday: number;
  overdueTasks: number;
  blockedTasks: number;
}

export interface CeoDeptProductivity {
  id: string;
  department: string;
  rate: number;
}

export interface CeoDailyProductivityTrend {
  day: string;
  rate: number;
}

export interface CeoTimeDistribution {
  focusHours: number;
  workHours: number;
  meetingHours: number;
  idleHours: number;
}

export interface CeoBlockedWorkItem {
  id: string;
  reason: string;
  count: number;
}

export interface CeoPerformanceHighlight {
  id: string;
  label: string;
  tone: ProductivityHighlightTone;
}

export interface CeoProductivitySection {
  headline: string;
  delta: string;
  status: CeoStatus;
  summary: CeoProductivitySummary;
  departmentProductivity: CeoDeptProductivity[];
  weeklyTrend: CeoDailyProductivityTrend[];
  timeDistribution: CeoTimeDistribution;
  blockedWork: CeoBlockedWorkItem[];
  performanceHighlights: CeoPerformanceHighlight[];
}

export interface CeoCompanyPerformanceSummary {
  scorePercent: number;
  monthDeltaLabel: string;
  healthLabel: string;
}

export interface CeoCompanyPerformanceBreakdownItem {
  id: string;
  label: string;
  rate: number;
}

export interface CeoCompanyPerformanceTrendPoint {
  month: string;
  rate: number;
}

export interface CeoCompanyPerformanceDepartment {
  id: string;
  department: string;
  rate: number;
}

export interface CeoCompanyPerformanceSection {
  headline: string;
  delta: string;
  status: CeoStatus;
  summary: CeoCompanyPerformanceSummary;
  breakdown: CeoCompanyPerformanceBreakdownItem[];
  monthlyTrend: CeoCompanyPerformanceTrendPoint[];
  departmentPerformance: CeoCompanyPerformanceDepartment[];
}

export interface CeoDashboardData {
  workforce: CeoWorkforceSection;
  decisions: CeoDecisionsSection;
  companyPerformance: CeoCompanyPerformanceSection;
  projects: CeoProjectSection;
  productivity: CeoProductivitySection;
}

export const ceoDashboardData: CeoDashboardData = {
  workforce: {
    overviewTitle: 'Attendance & Workforce Overview',
    overviewDesc:
      'Real-time overview of employee availability, attendance, leave and work location.',
    availability: {
      attendanceRate: 76,
      activeToday: 1248,
      totalEmployees: 1642,
      notAvailableToday: 240
    },
    workLocations: [
      { id: 'onsite', label: 'On-site', count: 561, percent: 45 },
      { id: 'hybrid', label: 'Hybrid', count: 374, percent: 30 },
      { id: 'remote', label: 'Remote', count: 313, percent: 25 }
    ],
    departmentAttendance: [
      { id: 'eng', department: 'Engineering', rate: 82, present: 342, onLeave: 42 },
      { id: 'prod', department: 'Product', rate: 78, present: 186, onLeave: 21 },
      { id: 'sup', department: 'Support', rate: 74, present: 224, onLeave: 35 },
      { id: 'sales', department: 'Sales', rate: 80, present: 198, onLeave: 28 },
      { id: 'hr', department: 'HR', rate: 88, present: 96, onLeave: 12 }
    ],
    leaveBreakdown: [
      { id: 'annual', label: 'Annual Leave', count: 82, percent: 44 },
      { id: 'medical', label: 'Medical Leave', count: 46, percent: 25 },
      { id: 'casual', label: 'Casual Leave', count: 38, percent: 20 },
      { id: 'half', label: 'Half Day', count: 20, percent: 11 }
    ],
    employeesOnLeave: [
      { id: 'e1', name: 'Maya Fernando', department: 'Engineering', leaveType: 'Annual Leave' },
      { id: 'e2', name: 'Arun Kumar', department: 'Sales', leaveType: 'Medical Leave' },
      { id: 'e3', name: 'Nisha Perera', department: 'HR', leaveType: 'Casual Leave' },
      { id: 'e4', name: 'Ravi Teja', department: 'Support', leaveType: 'Half Day' }
    ],
    weeklyAttendanceTrend: [
      { day: 'Mon', rate: 78 },
      { day: 'Tue', rate: 80 },
      { day: 'Wed', rate: 76 },
      { day: 'Thu', rate: 79 },
      { day: 'Fri', rate: 82 },
      { day: 'Sat', rate: 45 },
      { day: 'Sun', rate: 20 }
    ]
  },
  decisions: {
    headline: '32 pending executive approvals',
    delta: '7 waiting over 48 hours',
    status: 'amber',
    summary: {
      pendingApprovals: 32,
      waitingOver48Hours: 7,
      urgentDecisions: 3,
      budgetImpactDecisions: 2
    },
    categoryBreakdown: [
      { id: 'leave', label: 'Leave requests', count: 12 },
      { id: 'expense', label: 'Expense claims', count: 8 },
      { id: 'hiring', label: 'Hiring approvals', count: 5 },
      { id: 'project', label: 'Project approvals', count: 7 }
    ],
    approvalQueue: [
      {
        id: 'q1',
        title: 'Maya Fernando',
        type: 'Leave request',
        department: 'HR',
        ageLabel: '1 day',
        priority: 'Medium'
      },
      {
        id: 'q2',
        title: 'Arun Kumar',
        type: 'Expense claim',
        department: 'Sales',
        ageLabel: '2 days',
        priority: 'High'
      },
      {
        id: 'q3',
        title: 'New QA Engineer',
        type: 'Hiring approval',
        department: 'Engineering',
        ageLabel: '2 days',
        priority: 'High'
      },
      {
        id: 'q4',
        title: 'Payroll Phase 2',
        type: 'Project approval',
        department: 'Product',
        ageLabel: '3 days',
        priority: 'Urgent'
      },
      {
        id: 'q5',
        title: 'Laptop purchase',
        type: 'Purchase request',
        department: 'IT',
        ageLabel: '1 day',
        priority: 'Medium'
      }
    ],
    agingBuckets: [
      { label: '0–24 hours', count: 18 },
      { label: '24–48 hours', count: 7 },
      { label: 'More than 48 hours', count: 7 }
    ],
    departmentPending: [
      { id: 'eng', department: 'Engineering', count: 10 },
      { id: 'hr', department: 'HR', count: 7 },
      { id: 'fin', department: 'Finance', count: 6 },
      { id: 'sales', department: 'Sales', count: 5 },
      { id: 'ops', department: 'Operations', count: 4 }
    ],
    highImpact: [
      {
        id: 'h1',
        title: 'Payroll Phase 2 budget approval',
        risk: 'Project delay risk'
      },
      {
        id: 'h2',
        title: 'Senior Backend Developer hiring',
        risk: 'Resource shortage'
      },
      {
        id: 'h3',
        title: 'Server cost increase approval',
        risk: 'Infrastructure scaling'
      }
    ]
  },
  companyPerformance: {
    headline: '86% overall company performance',
    delta: '+4% vs last month',
    status: 'green',
    summary: {
      scorePercent: 86,
      monthDeltaLabel: '+4% vs last month',
      healthLabel: 'Good'
    },
    breakdown: [
      { id: 'revenue', label: 'Revenue Performance', rate: 88 },
      { id: 'delivery', label: 'Project Delivery', rate: 82 },
      { id: 'productivity', label: 'Team Productivity', rate: 81 },
      { id: 'csat', label: 'Customer Satisfaction', rate: 91 },
      { id: 'ops', label: 'Operational Efficiency', rate: 84 }
    ],
    monthlyTrend: [
      { month: 'Jul', rate: 78 },
      { month: 'Aug', rate: 80 },
      { month: 'Sep', rate: 82 },
      { month: 'Oct', rate: 84 },
      { month: 'Nov', rate: 86 }
    ],
    departmentPerformance: [
      { id: 'eng', department: 'Engineering', rate: 89 },
      { id: 'sales', department: 'Sales', rate: 88 },
      { id: 'hr', department: 'HR', rate: 90 },
      { id: 'prod', department: 'Product', rate: 85 },
      { id: 'sup', department: 'Support', rate: 79 }
    ]
  },
  projects: {
    headline: '14 active strategic projects',
    delta: '3 delayed · 2 blocked',
    status: 'amber',
    summary: {
      activeProjects: 14,
      onTrack: 8,
      delayed: 3,
      blocked: 2,
      atRisk: 1,
      averageProgress: 72,
      onTimeRate: 82,
      onTimeDeltaLabel: '+3% vs last month'
    },
    statusBreakdown: [
      { id: 'track', label: 'On track', count: 8 },
      { id: 'delayed', label: 'Delayed', count: 3 },
      { id: 'blocked', label: 'Blocked', count: 2 },
      { id: 'risk', label: 'At risk', count: 1 }
    ],
    progressOverview: [
      { id: 'p1', name: 'ONEVO HRMS Core', progress: 91, status: 'On Track' },
      { id: 'p2', name: 'Tenant Billing Upgrade', progress: 84, status: 'On Track' },
      { id: 'p3', name: 'Analytics Dashboard', progress: 76, status: 'At Risk' },
      { id: 'p4', name: 'HRMS Payroll Module', progress: 64, status: 'Delayed' },
      { id: 'p5', name: 'Mobile App Release', progress: 48, status: 'Blocked' }
    ],
    deliveryTrend: [
      { month: 'Jul', rate: 70 },
      { month: 'Aug', rate: 72 },
      { month: 'Sep', rate: 75 },
      { month: 'Oct', rate: 78 },
      { month: 'Nov', rate: 82 }
    ],
    delayedBlocked: [
      {
        id: 'i1',
        name: 'HRMS Payroll Module',
        status: 'Delayed',
        reason: 'Salary rule final approval pending',
        delayLabel: '5 days delay'
      },
      {
        id: 'i2',
        name: 'Mobile App Release',
        status: 'Blocked',
        reason: 'API dependency not ready',
        delayLabel: 'Blocked for 2 days'
      },
      {
        id: 'i3',
        name: 'Analytics Dashboard',
        status: 'At Risk',
        reason: 'Design approval pending',
        delayLabel: 'Client demo may delay'
      }
    ],
    riskBreakdown: [
      { id: 'dep', label: 'Dependency risk', count: 5 },
      { id: 'time', label: 'Timeline risk', count: 4 },
      { id: 'res', label: 'Resource risk', count: 3 },
      { id: 'budget', label: 'Budget risk', count: 2 },
      { id: 'scope', label: 'Scope risk', count: 1 }
    ],
    milestones: [
      { id: 'm1', title: 'Payroll UAT Testing', dateLabel: '12 Nov', status: 'Delayed' },
      { id: 'm2', title: 'Mobile API Integration', dateLabel: '14 Nov', status: 'Blocked' },
      { id: 'm3', title: 'Billing Module Release', dateLabel: '18 Nov', status: 'On Track' },
      { id: 'm4', title: 'Dashboard Client Demo', dateLabel: '20 Nov', status: 'At Risk' }
    ],
    ceoActions: [
      { id: 'a1', label: 'Approve payroll rule finalization' },
      { id: 'a2', label: 'Resolve mobile API priority' },
      { id: 'a3', label: 'Confirm dashboard demo scope' }
    ]
  },
  productivity: {
    headline: '82% company productivity score',
    delta: '+6% compared to last week',
    status: 'green',
    summary: {
      scorePercent: 82,
      weekDeltaLabel: '+6% vs last week',
      completedToday: 428,
      overdueTasks: 24,
      blockedTasks: 18
    },
    departmentProductivity: [
      { id: 'eng', department: 'Engineering', rate: 86 },
      { id: 'prod', department: 'Product', rate: 81 },
      { id: 'sup', department: 'Support', rate: 74 },
      { id: 'sales', department: 'Sales', rate: 79 },
      { id: 'hr', department: 'HR', rate: 83 }
    ],
    weeklyTrend: [
      { day: 'Mon', rate: 76 },
      { day: 'Tue', rate: 78 },
      { day: 'Wed', rate: 80 },
      { day: 'Thu', rate: 81 },
      { day: 'Fri', rate: 82 },
      { day: 'Sat', rate: 58 },
      { day: 'Sun', rate: 42 }
    ],
    timeDistribution: {
      focusHours: 6.4,
      workHours: 8.1,
      meetingHours: 1.5,
      idleHours: 1.2
    },
    blockedWork: [
      { id: 'b1', reason: 'API integration issue', count: 8 },
      { id: 'b2', reason: 'Design approval pending', count: 5 },
      { id: 'b3', reason: 'Client feedback waiting', count: 3 },
      { id: 'b4', reason: 'Resource shortage', count: 2 }
    ],
    performanceHighlights: [
      { id: 'h1', label: 'Engineering completed 126 tasks this week', tone: 'positive' },
      { id: 'h2', label: 'Product team improved by 8%', tone: 'positive' },
      { id: 'h3', label: 'Support has 12 overdue tasks', tone: 'warning' },
      { id: 'h4', label: 'Sales productivity dropped by 4%', tone: 'negative' }
    ]
  }
};
