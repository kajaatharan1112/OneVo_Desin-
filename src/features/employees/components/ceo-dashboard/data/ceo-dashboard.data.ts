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

export type WorkforceHealthStatus = 'healthy' | 'warning' | 'critical';
export type WorkforceRiskLevel = 'healthy' | 'warning' | 'critical';
export type WorkforceActionSeverity = 'critical' | 'warning';

export interface WorkforceAttendanceHealth {
  rate: number;
  target: number;
  status: WorkforceHealthStatus;
  statusLabel: string;
  subtitle: string;
  present: number;
  unavailable: number;
  onLeave: number;
  lateCheckIns: number;
  insight: string;
}

export interface WorkforceWorkModeSegment {
  id: string;
  label: string;
  percent: number;
}

export interface WorkforceWorkModeSplit {
  segments: WorkforceWorkModeSegment[];
  insights: string[];
}

export interface WorkforceSeriousAction {
  id: string;
  severity: WorkforceActionSeverity;
  title: string;
  impactCount: number;
  actionLabel: string;
}

export interface WorkforceDepartmentRisk {
  id: string;
  department: string;
  presentRate: number;
  onLeave: number;
  risk: WorkforceRiskLevel;
}

export interface WorkforceLeaveImpactItem {
  id: string;
  label: string;
  count: number;
}

export interface WorkforceLeaveImpact {
  items: WorkforceLeaveImpactItem[];
  insight: string;
}

export interface WorkforceKeyLeaveCase {
  id: string;
  name: string;
  department: string;
  leaveType: string;
  duration: string;
}

export interface WorkforceWeeklyTrendSummary {
  target: number;
  weekdayAvg: number;
  peakDay: string;
  peakRate: number;
  gapFromTarget: number;
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
  attendanceHealth: WorkforceAttendanceHealth;
  workModeSplit: WorkforceWorkModeSplit;
  seriousActions: WorkforceSeriousAction[];
  departmentRisk: WorkforceDepartmentRisk[];
  leaveImpact: WorkforceLeaveImpact;
  keyLeaveCases: WorkforceKeyLeaveCase[];
  weeklyTrendSummary: WorkforceWeeklyTrendSummary;
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

export type ProductivityBreakdownTone = 'positive' | 'negative';

export interface CeoProductivityBreakdownItem {
  id: string;
  label: string;
  rate: number;
  tone: ProductivityBreakdownTone;
}

export interface CeoProductivityDeliveryHealth {
  activeProjects: number;
  onTrack: number;
  delayed: number;
  blocked: number;
  atRisk: number;
  onTimeRate: number;
}

export interface CeoProductivityProjectContribution {
  id: string;
  name: string;
  productivePercent: number;
  status: ProjectStatus;
  reason: string;
}

export type ProductivityActionSeverity = 'critical' | 'warning';

export interface CeoProductivityActionItem {
  id: string;
  label: string;
  severity: ProductivityActionSeverity;
  actionLabel: string;
}

export interface CeoProductivityWeeklySummary {
  weekdayAvg: number;
  peakDay: string;
  peakRate: number;
  weekDeltaLabel: string;
}

export interface CeoProductivitySection {
  headline: string;
  delta: string;
  status: CeoStatus;
  summary: CeoProductivitySummary;
  scoreNote: string;
  deliveryHealth: CeoProductivityDeliveryHealth;
  breakdown: CeoProductivityBreakdownItem[];
  projectContributions: CeoProductivityProjectContribution[];
  actionItems: CeoProductivityActionItem[];
  departmentProductivity: CeoDeptProductivity[];
  weeklyTrend: CeoDailyProductivityTrend[];
  weeklyTrendSummary: CeoProductivityWeeklySummary;
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

export type CeoPerfKpiTone = 'good' | 'warn' | 'neutral';

export interface CeoPerfKpiItem {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: CeoPerfKpiTone;
}

export interface CeoPerfProductItem {
  id: string;
  name: string;
  score: number;
  status: string;
  note: string;
}

export interface CeoPerfEmployeeItem {
  id: string;
  label: string;
  score: number;
  meta: string;
}

export interface CeoCompanyPerformanceSection {
  headline: string;
  delta: string;
  status: CeoStatus;
  summary: CeoCompanyPerformanceSummary;
  productKpis: CeoPerfKpiItem[];
  employeeKpis: CeoPerfKpiItem[];
  productHighlights: CeoPerfProductItem[];
  employeeHighlights: CeoPerfEmployeeItem[];
  breakdown: CeoCompanyPerformanceBreakdownItem[];
  monthlyTrend: CeoCompanyPerformanceTrendPoint[];
  departmentPerformance: CeoCompanyPerformanceDepartment[];
}

export type CeoActionItemType = 'approval' | 'decision' | 'escalation' | 'alert' | 'reminder';
export type CeoMyPrioritiesTone = 'blue' | 'purple' | 'orange' | 'danger' | 'amber' | 'gray';

export interface CeoActionQueueItem {
  id: string;
  title: string;
  description: string;
  type: CeoActionItemType;
  typeLabel: string;
  dueBadge: string;
  actionLabel: string;
  tone: CeoMyPrioritiesTone;
}

export interface CeoMyPrioritiesSection {
  subtitle: string;
  actionQueue: {
    footerLink: string;
    items: CeoActionQueueItem[];
  };
}

export type CeoDayBlockKind = 'meeting' | 'focus' | 'free' | 'admin';

export interface CeoDayBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  kind: CeoDayBlockKind;
  meetingType?: MeetingType;
}

export type MeetingType =
  | 'board'
  | 'internal'
  | 'leadership'
  | 'client'
  | 'one-on-one'
  | 'escalation';
export type MeetingPlatform = 'in-person' | 'zoom' | 'teams';
export type MeetingStatus = 'upcoming' | 'in-progress' | 'done';

export interface CeoMeetingItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
  type: MeetingType;
  platform: MeetingPlatform;
  attendees: number;
  priority: 'normal' | 'high' | 'critical';
  status: MeetingStatus;
  description: string;
  listBadge?: string;
}

export interface CeoScheduleTimeBreakdown {
  label: string;
  hours: number;
  colorVar: string;
}

export interface CeoCalendarWeekDay {
  id: string;
  label: string;
  date: number;
  meetings: number;
  isToday: boolean;
}

export interface CeoScheduleSection {
  dateLabel: string;
  totalMeetings: number;
  meetingHours: number;
  focusHours: number;
  freeHours: number;
  adminHours: number;
  nextMeeting: string;
  calendarWeek: CeoCalendarWeekDay[];
  dayBlocks: CeoDayBlock[];
  meetings: CeoMeetingItem[];
  timeBreakdown: CeoScheduleTimeBreakdown[];
}

export interface CeoDashboardData {
  workforce: CeoWorkforceSection;
  decisions: CeoDecisionsSection;
  myPriorities: CeoMyPrioritiesSection;
  companyPerformance: CeoCompanyPerformanceSection;
  projects: CeoProjectSection;
  productivity: CeoProductivitySection;
  schedule: CeoScheduleSection;
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
      { id: 'e4', name: 'Ravi Teja', department: 'Support', leaveType: 'Half Day' },
      { id: 'e5', name: 'Priya Sharma', department: 'Product', leaveType: 'Annual Leave' },
      { id: 'e6', name: 'James Wong', department: 'Engineering', leaveType: 'Medical Leave' },
      { id: 'e7', name: 'Sara Ahmed', department: 'Sales', leaveType: 'Casual Leave' },
      { id: 'e8', name: 'David Chen', department: 'Support', leaveType: 'Annual Leave' }
    ],
    weeklyAttendanceTrend: [
      { day: 'Mon', rate: 78 },
      { day: 'Tue', rate: 80 },
      { day: 'Wed', rate: 76 },
      { day: 'Thu', rate: 79 },
      { day: 'Fri', rate: 82 },
      { day: 'Sat', rate: 45 },
      { day: 'Sun', rate: 20 }
    ],
    attendanceHealth: {
      rate: 80,
      target: 85,
      status: 'healthy',
      statusLabel: 'Healthy',
      subtitle: "Today's workforce status",
      present: 1248,
      unavailable: 240,
      onLeave: 186,
      lateCheckIns: 42,
      insight:
        'Attendance is 9% below target. Check departments with high leave and low presence.'
    },
    workModeSplit: {
      segments: [
        { id: 'onsite', label: 'On-site', percent: 33 },
        { id: 'remote', label: 'Remote', percent: 33 },
        { id: 'hybrid', label: 'Hybrid', percent: 34 }
      ],
      insights: [
        'Work mode split is balanced across on-site, remote, and hybrid',
        'Remote and hybrid coverage is stable today',
        'On-site presence aligns with weekly average'
      ]
    },
    seriousActions: [
      {
        id: 'sa1',
        severity: 'critical',
        title: 'Engineering attendance below target',
        impactCount: 42,
        actionLabel: 'Review'
      },
      {
        id: 'sa2',
        severity: 'warning',
        title: '186 employees on leave today',
        impactCount: 186,
        actionLabel: 'Review'
      },
      {
        id: 'sa3',
        severity: 'warning',
        title: 'Support team has high absence',
        impactCount: 38,
        actionLabel: 'Review'
      },
      {
        id: 'sa4',
        severity: 'critical',
        title: '42 employees unavailable without clear reason',
        impactCount: 42,
        actionLabel: 'Review'
      }
    ],
    departmentRisk: [
      { id: 'eng', department: 'Engineering', presentRate: 82, onLeave: 42, risk: 'warning' },
      { id: 'prod', department: 'Product', presentRate: 78, onLeave: 21, risk: 'warning' },
      { id: 'sup', department: 'Support', presentRate: 68, onLeave: 38, risk: 'critical' },
      { id: 'sales', department: 'Sales', presentRate: 86, onLeave: 14, risk: 'healthy' }
    ],
    leaveImpact: {
      items: [
        { id: 'annual', label: 'Annual Leave', count: 82 },
        { id: 'medical', label: 'Medical Leave', count: 46 },
        { id: 'casual', label: 'Casual Leave', count: 34 },
        { id: 'emergency', label: 'Emergency Leave', count: 24 }
      ],
      insight: 'Medical and emergency leave need HR follow-up if trend continues.'
    },
    keyLeaveCases: [
      {
        id: 'kl1',
        name: 'Maya Fernando',
        department: 'Engineering',
        leaveType: 'Annual Leave',
        duration: '5 days'
      },
      {
        id: 'kl2',
        name: 'James Wong',
        department: 'Engineering',
        leaveType: 'Medical Leave',
        duration: '3 days'
      },
      {
        id: 'kl3',
        name: 'Ravi Teja',
        department: 'Support',
        leaveType: 'Emergency Leave',
        duration: '2 days'
      },
      {
        id: 'kl4',
        name: 'Priya Sharma',
        department: 'Product',
        leaveType: 'Annual Leave',
        duration: '4 days'
      },
      {
        id: 'kl5',
        name: 'Arun Kumar',
        department: 'Sales',
        leaveType: 'Medical Leave',
        duration: '1 day'
      }
    ],
    weeklyTrendSummary: {
      target: 85,
      weekdayAvg: 79,
      peakDay: 'Fri',
      peakRate: 82,
      gapFromTarget: -6
    }
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
  myPriorities: {
    subtitle: 'Items that need your attention today',
    actionQueue: {
      footerLink: 'View all priority items',
      items: [
        {
          id: 'aq1',
          title: 'Payroll salary rule approval',
          description: 'Payroll release waiting',
          type: 'approval',
          typeLabel: 'Approval',
          dueBadge: 'Due today',
          actionLabel: 'Review',
          tone: 'blue'
        },
        {
          id: 'aq2',
          title: 'Budget increase request',
          description: 'Waiting for management approval',
          type: 'approval',
          typeLabel: 'Approval',
          dueBadge: 'Due 2:00 PM',
          actionLabel: 'Review',
          tone: 'blue'
        },
        {
          id: 'aq2b',
          title: 'Senior Backend hiring',
          description: 'Engineering headcount expansion pending sign-off',
          type: 'approval',
          typeLabel: 'Approval',
          dueBadge: 'Due tomorrow',
          actionLabel: 'Approve',
          tone: 'blue'
        },
        {
          id: 'aq2c',
          title: 'Vendor contract renewal',
          description: 'Cloud infrastructure renewal needs CEO approval',
          type: 'approval',
          typeLabel: 'Approval',
          dueBadge: 'Due Friday',
          actionLabel: 'Review',
          tone: 'blue'
        },
        {
          id: 'aq3',
          title: 'Mobile release go/no-go',
          description: 'Release date depends on this decision',
          type: 'decision',
          typeLabel: 'Decision',
          dueBadge: 'Blocking',
          actionLabel: 'Decide',
          tone: 'orange'
        },
        {
          id: 'aq3b',
          title: 'Analytics design approval',
          description: 'Frontend team waiting for design sign-off',
          type: 'decision',
          typeLabel: 'Decision',
          dueBadge: 'Team waiting',
          actionLabel: 'Review',
          tone: 'orange'
        },
        {
          id: 'aq3c',
          title: 'Q3 marketing spend',
          description: 'Campaign budget allocation needs final call',
          type: 'decision',
          typeLabel: 'Decision',
          dueBadge: 'Due 4:00 PM',
          actionLabel: 'Decide',
          tone: 'orange'
        },
        {
          id: 'aq4',
          title: 'Blocked project',
          description: 'Mobile App Release · API delay',
          type: 'escalation',
          typeLabel: 'Escalation',
          dueBadge: 'High',
          actionLabel: 'Open',
          tone: 'danger'
        },
        {
          id: 'aq5',
          title: 'Support SLA issue',
          description: 'Response time below target',
          type: 'escalation',
          typeLabel: 'Escalation',
          dueBadge: 'Critical',
          actionLabel: 'Review',
          tone: 'danger'
        },
        {
          id: 'aq5b',
          title: 'Payroll module delay',
          description: 'Salary rule approval blocking finance release',
          type: 'escalation',
          typeLabel: 'Escalation',
          dueBadge: 'High',
          actionLabel: 'Open',
          tone: 'danger'
        },
        {
          id: 'aq5c',
          title: 'Engineering attrition spike',
          description: '3 senior resignations this week need review',
          type: 'escalation',
          typeLabel: 'Escalation',
          dueBadge: 'Urgent',
          actionLabel: 'Review',
          tone: 'danger'
        },
        {
          id: 'aq6',
          title: 'Delivery delay risk',
          description: 'Client demo preparation is behind schedule',
          type: 'alert',
          typeLabel: 'Alert',
          dueBadge: 'Today',
          actionLabel: 'View',
          tone: 'amber'
        },
        {
          id: 'aq6b',
          title: 'Attendance below target',
          description: 'Company-wide attendance at 76% vs 85% goal',
          type: 'alert',
          typeLabel: 'Alert',
          dueBadge: 'This week',
          actionLabel: 'View',
          tone: 'amber'
        },
        {
          id: 'aq6c',
          title: 'Invoice payment overdue',
          description: '2 enterprise clients past payment deadline',
          type: 'alert',
          typeLabel: 'Alert',
          dueBadge: '3 days',
          actionLabel: 'Review',
          tone: 'amber'
        }
      ]
    }
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
    productKpis: [
      { id: 'pk1', label: 'On-time delivery', value: '82%', delta: '+3% vs last month', tone: 'good' },
      { id: 'pk2', label: 'Active products', value: '14', tone: 'neutral' },
      { id: 'pk3', label: 'Customer satisfaction', value: '91%', delta: '+2% vs last month', tone: 'good' },
      { id: 'pk4', label: 'At-risk products', value: '3', delta: 'Needs review', tone: 'warn' }
    ],
    employeeKpis: [
      { id: 'ek1', label: 'Team productivity', value: '81%', delta: '+6% vs last week', tone: 'good' },
      { id: 'ek2', label: 'Attendance today', value: '76%', delta: 'Below 85% goal', tone: 'warn' },
      { id: 'ek3', label: 'Active employees', value: '1,248', tone: 'neutral' },
      { id: 'ek4', label: 'Retention rate', value: '94%', delta: '+1% vs last quarter', tone: 'good' }
    ],
    productHighlights: [
      {
        id: 'ph1',
        name: 'ONEVO HRMS Core',
        score: 91,
        status: 'On Track',
        note: 'Release pipeline stable'
      },
      {
        id: 'ph2',
        name: 'Tenant Billing Upgrade',
        score: 84,
        status: 'On Track',
        note: 'UAT in progress'
      },
      {
        id: 'ph3',
        name: 'Analytics Dashboard',
        score: 76,
        status: 'At Risk',
        note: 'Design approval pending'
      },
      {
        id: 'ph4',
        name: 'Mobile App Release',
        score: 48,
        status: 'Blocked',
        note: 'API dependency delay'
      }
    ],
    employeeHighlights: [
      { id: 'eh1', label: 'Engineering output', score: 89, meta: 'Highest dept productivity' },
      { id: 'eh2', label: 'HR performance', score: 90, meta: 'Strong process compliance' },
      { id: 'eh3', label: 'Sales productivity', score: 88, meta: 'Above quarterly target' },
      { id: 'eh4', label: 'Support attendance', score: 74, meta: 'Below company average' }
    ],
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
    scoreNote:
      'Based on task completion, delivery health, attendance, focus time and blockers.',
    deliveryHealth: {
      activeProjects: 14,
      onTrack: 8,
      delayed: 3,
      blocked: 2,
      atRisk: 1,
      onTimeRate: 82
    },
    breakdown: [
      { id: 'tasks', label: 'Task completion rate', rate: 82, tone: 'positive' },
      { id: 'delivery', label: 'Project delivery health', rate: 78, tone: 'positive' },
      { id: 'attendance', label: 'Attendance contribution', rate: 76, tone: 'positive' },
      { id: 'focus', label: 'Focus time health', rate: 80, tone: 'positive' },
      { id: 'blocked', label: 'Blocked work impact', rate: 5, tone: 'negative' },
      { id: 'overdue', label: 'Overdue work impact', rate: 8, tone: 'negative' }
    ],
    projectContributions: [
      {
        id: 'pc1',
        name: 'ONEVO HRMS Core',
        productivePercent: 91,
        status: 'On Track',
        reason: 'Sprint tasks completed on time'
      },
      {
        id: 'pc2',
        name: 'Tenant Billing Upgrade',
        productivePercent: 84,
        status: 'On Track',
        reason: 'Delivery stable'
      },
      {
        id: 'pc3',
        name: 'Analytics Dashboard',
        productivePercent: 76,
        status: 'At Risk',
        reason: 'Design approval pending'
      },
      {
        id: 'pc4',
        name: 'HRMS Payroll Module',
        productivePercent: 64,
        status: 'Delayed',
        reason: 'Salary rule approval pending'
      },
      {
        id: 'pc5',
        name: 'Mobile App Release',
        productivePercent: 58,
        status: 'Blocked',
        reason: 'API dependency not ready'
      }
    ],
    actionItems: [
      {
        id: 'pa1',
        label: 'Payroll salary rule approval pending',
        severity: 'critical',
        actionLabel: 'Review'
      },
      {
        id: 'pa2',
        label: 'Mobile API dependency needs decision',
        severity: 'critical',
        actionLabel: 'Decide'
      },
      {
        id: 'pa3',
        label: 'Analytics design approval pending',
        severity: 'warning',
        actionLabel: 'Review'
      }
    ],
    departmentProductivity: [
      { id: 'eng', department: 'Engineering', rate: 86 },
      { id: 'prod', department: 'Product', rate: 81 },
      { id: 'sup', department: 'Support', rate: 74 },
      { id: 'sales', department: 'Sales', rate: 79 },
      { id: 'hr', department: 'HR', rate: 83 }
    ],
    weeklyTrend: [
      { day: 'Mon', rate: 78 },
      { day: 'Tue', rate: 78 },
      { day: 'Wed', rate: 80 },
      { day: 'Thu', rate: 81 },
      { day: 'Fri', rate: 82 },
      { day: 'Sat', rate: 58 },
      { day: 'Sun', rate: 42 }
    ],
    weeklyTrendSummary: {
      weekdayAvg: 80,
      peakDay: 'Fri',
      peakRate: 82,
      weekDeltaLabel: '+6% vs last week'
    },
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
  },
  schedule: {
    dateLabel: 'Tuesday, 10 Jun 2026',
    totalMeetings: 7,
    meetingHours: 5.25,
    focusHours: 3.5,
    freeHours: 1.5,
    adminHours: 0.5,
    nextMeeting: 'Board Meeting Prep at 9:00 AM',
    calendarWeek: [
      { id: 'cw1', label: 'Mon', date: 8, meetings: 3, isToday: false },
      { id: 'cw2', label: 'Tue', date: 10, meetings: 7, isToday: true },
      { id: 'cw3', label: 'Wed', date: 11, meetings: 4, isToday: false },
      { id: 'cw4', label: 'Thu', date: 12, meetings: 6, isToday: false },
      { id: 'cw5', label: 'Fri', date: 13, meetings: 5, isToday: false },
      { id: 'cw6', label: 'Sat', date: 14, meetings: 1, isToday: false },
      { id: 'cw7', label: 'Sun', date: 15, meetings: 0, isToday: false }
    ],
    dayBlocks: [
      {
        id: 'db0',
        title: 'Executive Morning Brief',
        startTime: '08:30',
        endTime: '09:00',
        kind: 'meeting',
        meetingType: 'internal'
      },
      {
        id: 'db1',
        title: 'Board Meeting Prep',
        startTime: '09:00',
        endTime: '10:00',
        kind: 'meeting',
        meetingType: 'leadership'
      },
      {
        id: 'db2',
        title: 'Leadership Review',
        startTime: '10:00',
        endTime: '11:00',
        kind: 'meeting',
        meetingType: 'internal'
      },
      {
        id: 'db3',
        title: 'Focus: Strategy review',
        startTime: '11:00',
        endTime: '12:30',
        kind: 'focus'
      },
      {
        id: 'db4',
        title: 'Investor Lunch',
        startTime: '12:30',
        endTime: '14:00',
        kind: 'meeting',
        meetingType: 'client'
      },
      {
        id: 'db5',
        title: 'Admin: Email & approvals',
        startTime: '14:00',
        endTime: '15:00',
        kind: 'admin'
      },
      {
        id: 'db6',
        title: 'Client Demo',
        startTime: '15:00',
        endTime: '16:00',
        kind: 'meeting',
        meetingType: 'client'
      },
      {
        id: 'db7',
        title: 'Delivery Escalation',
        startTime: '16:00',
        endTime: '16:45',
        kind: 'meeting',
        meetingType: 'escalation'
      },
      {
        id: 'db7b',
        title: '1:1 with CTO',
        startTime: '16:45',
        endTime: '17:30',
        kind: 'meeting',
        meetingType: 'one-on-one'
      },
      {
        id: 'db8',
        title: 'Free buffer',
        startTime: '17:30',
        endTime: '19:00',
        kind: 'free'
      }
    ],
    meetings: [
      {
        id: 'ms0',
        title: 'Executive Morning Brief',
        startTime: '08:30',
        endTime: '09:00',
        durationLabel: '30 min',
        type: 'internal',
        platform: 'in-person',
        attendees: 4,
        priority: 'normal',
        status: 'upcoming',
        description: 'Daily executive sync — priorities and blockers',
        listBadge: 'Internal'
      },
      {
        id: 'ms1',
        title: 'Board Meeting Prep',
        startTime: '09:00',
        endTime: '10:00',
        durationLabel: '1 hr',
        type: 'leadership',
        platform: 'in-person',
        attendees: 5,
        priority: 'high',
        status: 'upcoming',
        description: 'Q4 board presentation review with executive committee'
      },
      {
        id: 'ms2',
        title: 'Leadership Review',
        startTime: '10:00',
        endTime: '11:00',
        durationLabel: '1 hr',
        type: 'internal',
        platform: 'zoom',
        attendees: 8,
        priority: 'normal',
        status: 'upcoming',
        description: 'Department heads quarterly priorities sync',
        listBadge: 'Internal'
      },
      {
        id: 'ms3',
        title: 'Investor Lunch',
        startTime: '12:30',
        endTime: '14:00',
        durationLabel: '1.5 hrs',
        type: 'client',
        platform: 'in-person',
        attendees: 3,
        priority: 'high',
        status: 'upcoming',
        description: 'Strategic investor relations meeting'
      },
      {
        id: 'ms4',
        title: 'Client Demo',
        startTime: '15:00',
        endTime: '16:00',
        durationLabel: '1 hr',
        type: 'client',
        platform: 'zoom',
        attendees: 6,
        priority: 'critical',
        status: 'upcoming',
        description: 'Analytics Dashboard project demo for external client'
      },
      {
        id: 'ms5',
        title: 'Delivery Escalation',
        startTime: '16:00',
        endTime: '16:45',
        durationLabel: '45 min',
        type: 'escalation',
        platform: 'teams',
        attendees: 4,
        priority: 'critical',
        status: 'upcoming',
        description: 'Mobile App Release blocked — API dependency resolution'
      },
      {
        id: 'ms6',
        title: '1:1 with CTO',
        startTime: '16:45',
        endTime: '17:30',
        durationLabel: '45 min',
        type: 'one-on-one',
        platform: 'in-person',
        attendees: 2,
        priority: 'high',
        status: 'upcoming',
        description: 'Engineering roadmap and hiring pipeline review',
        listBadge: '1:1'
      }
    ],
    timeBreakdown: [
      { label: 'Meetings', hours: 4.5, colorVar: 'var(--accent)' },
      { label: 'Focus', hours: 3.5, colorVar: 'var(--nexus-success)' },
      { label: 'Free', hours: 1.5, colorVar: 'var(--nexus-text-secondary)' },
      { label: 'Admin', hours: 0.5, colorVar: 'var(--nexus-warning)' }
    ]
  }
};
