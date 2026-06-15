/* ─── Performance Dashboard — Data & Types ─── */

export type PerfPeriodMode = 'month' | 'year';

/* ══ Component 7 — Task Approval Rate ══════════ */
export interface TaskApprovalStats {
  totalTasks: number;
  approvedFirst: number;       // first-time approvals (no revision)
  approvedAfterRevision: number;
  pending: number;
  rejected: number;
  firstApprovalRate: number;   // approvedFirst / totalTasks * 100
  periodLabel: string;
}

export const monthApprovalStats: TaskApprovalStats = {
  totalTasks: 32,
  approvedFirst: 24,
  approvedAfterRevision: 4,
  pending: 3,
  rejected: 1,
  firstApprovalRate: 75,
  periodLabel: 'This month'
};

export const yearApprovalStats: TaskApprovalStats = {
  totalTasks: 387,
  approvedFirst: 301,
  approvedAfterRevision: 52,
  pending: 21,
  rejected: 13,
  firstApprovalRate: 78,
  periodLabel: 'This year'
};

/* ══ Component 9 — Availability ════════════════ */
export type AvailabilityLevel = 'high' | 'medium' | 'low' | 'weekend';

export interface AvailabilityRecord {
  id: string;
  label: string;        // "Jun 1", "Jan"
  shortLabel: string;   // "1", "Jan"
  availabilityPct: number;
  availableHours: number;
  targetHours: number;
  leaveHours: number;
  excessBreakHours: number;
  meetingHours: number;
  level: AvailabilityLevel;
  isWeekend?: boolean;
}

function availLevel(pct: number): AvailabilityLevel {
  if (pct >= 85) return 'high';
  if (pct >= 70) return 'medium';
  return 'low';
}

/* 30-day daily data for June 2026
   Mon Jun 1 = day index 0 (Mon)
   Weekends: Jun 7-8, 14-15, 21-22, 28-29 */
const JUNE_DAYS: Array<{
  day: number; isWeekend: boolean;
  avail: number; leave: number; brk: number; mtg: number;
}> = [
  { day: 1,  isWeekend: false, avail: 91, leave: 0, brk: 0.5, mtg: 1.5 },
  { day: 2,  isWeekend: false, avail: 88, leave: 0, brk: 0.8, mtg: 2   },
  { day: 3,  isWeekend: false, avail: 85, leave: 0, brk: 1,   mtg: 2   },
  { day: 4,  isWeekend: false, avail: 92, leave: 0, brk: 0.4, mtg: 1   },
  { day: 5,  isWeekend: false, avail: 87, leave: 0, brk: 0.9, mtg: 2   },
  { day: 6,  isWeekend: false, avail: 90, leave: 0, brk: 0.6, mtg: 1.5 },
  { day: 7,  isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 8,  isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 9,  isWeekend: false, avail: 88, leave: 0, brk: 0.7, mtg: 2   },
  { day: 10, isWeekend: false, avail: 72, leave: 0, brk: 2,   mtg: 3   },
  { day: 11, isWeekend: false, avail: 65, leave: 8, brk: 0.5, mtg: 1   },
  { day: 12, isWeekend: false, avail: 60, leave: 8, brk: 0.5, mtg: 0.5 },
  { day: 13, isWeekend: false, avail: 83, leave: 0, brk: 1,   mtg: 2   },
  { day: 14, isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 15, isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 16, isWeekend: false, avail: 93, leave: 0, brk: 0.3, mtg: 1   },
  { day: 17, isWeekend: false, avail: 90, leave: 0, brk: 0.5, mtg: 1.5 },
  { day: 18, isWeekend: false, avail: 86, leave: 0, brk: 0.8, mtg: 2   },
  { day: 19, isWeekend: false, avail: 95, leave: 0, brk: 0.2, mtg: 1   },
  { day: 20, isWeekend: false, avail: 89, leave: 0, brk: 0.6, mtg: 2   },
  { day: 21, isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 22, isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 23, isWeekend: false, avail: 85, leave: 0, brk: 0.9, mtg: 2   },
  { day: 24, isWeekend: false, avail: 78, leave: 2, brk: 1.2, mtg: 2   },
  { day: 25, isWeekend: false, avail: 88, leave: 0, brk: 0.7, mtg: 1.5 },
  { day: 26, isWeekend: false, avail: 91, leave: 0, brk: 0.5, mtg: 1   },
  { day: 27, isWeekend: false, avail: 84, leave: 0, brk: 1,   mtg: 2   },
  { day: 28, isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 29, isWeekend: true,  avail: 0,  leave: 0, brk: 0,   mtg: 0   },
  { day: 30, isWeekend: false, avail: 87, leave: 0, brk: 0.8, mtg: 2   },
];

export const monthAvailability: AvailabilityRecord[] = JUNE_DAYS.map(d => ({
  id: `jun-${d.day}`,
  label: `Jun ${d.day}`,
  shortLabel: `${d.day}`,
  availabilityPct: d.avail,
  availableHours: d.isWeekend ? 0 : Math.round((d.avail / 100) * 8 * 10) / 10,
  targetHours: d.isWeekend ? 0 : 8,
  leaveHours: d.leave,
  excessBreakHours: d.brk,
  meetingHours: d.mtg,
  level: d.isWeekend ? 'weekend' : availLevel(d.avail),
  isWeekend: d.isWeekend
}));

export const yearAvailability: AvailabilityRecord[] = [
  { id: 'jan', label: 'January', shortLabel: 'Jan', availabilityPct: 84, availableHours: 142, targetHours: 168, leaveHours: 16, excessBreakHours: 5, meetingHours: 5, level: availLevel(84) },
  { id: 'feb', label: 'February', shortLabel: 'Feb', availabilityPct: 91, availableHours: 140, targetHours: 154, leaveHours: 0, excessBreakHours: 4, meetingHours: 10, level: availLevel(91) },
  { id: 'mar', label: 'March', shortLabel: 'Mar', availabilityPct: 87, availableHours: 146, targetHours: 168, leaveHours: 8, excessBreakHours: 6, meetingHours: 8, level: availLevel(87) },
  { id: 'apr', label: 'April', shortLabel: 'Apr', availabilityPct: 76, availableHours: 122, targetHours: 160, leaveHours: 24, excessBreakHours: 5, meetingHours: 9, level: availLevel(76) },
  { id: 'may', label: 'May', shortLabel: 'May', availabilityPct: 89, availableHours: 149, targetHours: 168, leaveHours: 0, excessBreakHours: 7, meetingHours: 12, level: availLevel(89) },
  { id: 'jun', label: 'June', shortLabel: 'Jun', availabilityPct: 84, availableHours: 134, targetHours: 160, leaveHours: 10, excessBreakHours: 8, meetingHours: 8, level: availLevel(84) },
  { id: 'jul', label: 'July', shortLabel: 'Jul', availabilityPct: 90, availableHours: 151, targetHours: 168, leaveHours: 0, excessBreakHours: 6, meetingHours: 11, level: availLevel(90) },
  { id: 'aug', label: 'August', shortLabel: 'Aug', availabilityPct: 67, availableHours: 107, targetHours: 160, leaveHours: 32, excessBreakHours: 9, meetingHours: 12, level: availLevel(67) },
  { id: 'sep', label: 'September', shortLabel: 'Sep', availabilityPct: 85, availableHours: 136, targetHours: 160, leaveHours: 8, excessBreakHours: 7, meetingHours: 9, level: availLevel(85) },
  { id: 'oct', label: 'October', shortLabel: 'Oct', availabilityPct: 88, availableHours: 148, targetHours: 168, leaveHours: 0, excessBreakHours: 8, meetingHours: 12, level: availLevel(88) },
  { id: 'nov', label: 'November', shortLabel: 'Nov', availabilityPct: 82, availableHours: 131, targetHours: 160, leaveHours: 16, excessBreakHours: 5, meetingHours: 8, level: availLevel(82) },
  { id: 'dec', label: 'December', shortLabel: 'Dec', availabilityPct: 77, availableHours: 124, targetHours: 160, leaveHours: 16, excessBreakHours: 9, meetingHours: 11, level: availLevel(77) }
];

/* ══ Component 10 — Sprint Deadline Management ═ */
export type SprintStatus =
  | 'before-deadline'   // completed early
  | 'on-deadline'       // completed exactly on time
  | 'after-deadline'    // completed late
  | 'incomplete'        // not finished
  | 'active';           // currently running

export interface SprintRecord {
  id: string;
  label: string;        // "W1", "W2" / "Jan" for year
  fullLabel: string;    // "Sprint W1 · Jun 2–6"
  status: SprintStatus;
  plannedTasks: number;
  completedTasks: number;
  deadline: string;
  completedDate?: string;
  daysEarlyLate?: number; // +2 = 2 days early, -1 = 1 day late
}

export const monthSprints: SprintRecord[] = [
  {
    id: 'sp-w1', label: 'W1', fullLabel: 'Sprint W1 · Jun 2–6',
    status: 'before-deadline', plannedTasks: 12, completedTasks: 12,
    deadline: 'Jun 6', completedDate: 'Jun 5', daysEarlyLate: 1
  },
  {
    id: 'sp-w2', label: 'W2', fullLabel: 'Sprint W2 · Jun 9–13',
    status: 'after-deadline', plannedTasks: 12, completedTasks: 10,
    deadline: 'Jun 13', completedDate: 'Jun 16', daysEarlyLate: -3
  },
  {
    id: 'sp-w3', label: 'W3', fullLabel: 'Sprint W3 · Jun 16–20',
    status: 'before-deadline', plannedTasks: 11, completedTasks: 11,
    deadline: 'Jun 20', completedDate: 'Jun 19', daysEarlyLate: 1
  },
  {
    id: 'sp-w4', label: 'W4', fullLabel: 'Sprint W4 · Jun 23–27',
    status: 'active', plannedTasks: 12, completedTasks: 7,
    deadline: 'Jun 27'
  }
];

// 52 weeks for the year view — compact grid display
function buildYearSprints(): SprintRecord[] {
  const statuses: SprintStatus[] = [
    'before-deadline', 'before-deadline', 'on-deadline', 'after-deadline',
    'before-deadline', 'incomplete', 'before-deadline', 'before-deadline',
    'on-deadline', 'after-deadline', 'before-deadline', 'before-deadline',
    'before-deadline', 'on-deadline', 'before-deadline', 'after-deadline',
    'before-deadline', 'before-deadline', 'incomplete', 'before-deadline',
    'before-deadline', 'after-deadline', 'before-deadline', 'before-deadline',
    'on-deadline', 'before-deadline', 'before-deadline', 'after-deadline',
    'before-deadline', 'incomplete', 'before-deadline', 'before-deadline',
    'before-deadline', 'on-deadline', 'after-deadline', 'before-deadline',
    'before-deadline', 'before-deadline', 'on-deadline', 'before-deadline',
    'before-deadline', 'after-deadline', 'before-deadline', 'before-deadline',
    'before-deadline', 'on-deadline', 'after-deadline', 'incomplete',
    'before-deadline', 'before-deadline', 'after-deadline', 'active'
  ];
  return statuses.map((status, i) => ({
    id: `sp-y-${i + 1}`,
    label: `W${i + 1}`,
    fullLabel: `Sprint W${i + 1}`,
    status,
    plannedTasks: 10 + Math.floor(Math.random() * 4),
    completedTasks: status === 'incomplete' ? Math.floor((10 + i % 4) * 0.6)
      : status === 'active' ? Math.floor((10 + i % 4) * 0.6)
      : (10 + i % 4),
    deadline: 'see full view'
  }));
}
export const yearSprints: SprintRecord[] = buildYearSprints();

/* ══ Component 11 — Achievements ═══════════════ */
export type AchievementCategory = 'goal' | 'milestone' | 'award';

export interface AchievementRecord {
  id: string;
  title: string;
  project: string;
  teamLead: string;
  achievedDate: string;
  category: AchievementCategory;
  description: string;
  impact?: string;
}

export const achievementRecords: AchievementRecord[] = [
  {
    id: 'ach-1',
    title: 'Q1 Delivery Goal',
    project: 'OneVo Platform v2',
    teamLead: 'Ravi Kumar',
    achievedDate: 'Mar 28, 2026',
    category: 'goal',
    description: 'Delivered all planned Q1 features on time with 0 critical bugs in the first week of release. Collaborated across 3 teams.',
    impact: 'Enabled on-time customer launch for 4 enterprise clients'
  },
  {
    id: 'ach-2',
    title: 'Zero-Bug Sprint Award',
    project: 'Employee Portal',
    teamLead: 'Priya S.',
    achievedDate: 'Feb 14, 2026',
    category: 'award',
    description: 'Awarded for completing a full 2-week sprint with zero bugs reported in QA and zero regressions in production.',
    impact: 'Sprint became the team benchmark for code quality'
  },
  {
    id: 'ach-3',
    title: 'API Performance Milestone',
    project: 'Core Services',
    teamLead: 'Ravi Kumar',
    achievedDate: 'Jan 10, 2026',
    category: 'milestone',
    description: 'Reduced average API response time from 320ms to 48ms by rewriting the data-fetching layer with caching and batching.',
    impact: '85% latency reduction across 12 endpoints'
  },
  {
    id: 'ach-4',
    title: 'Customer Satisfaction Goal',
    project: 'Support Tools',
    teamLead: 'Arun M.',
    achievedDate: 'Dec 5, 2025',
    category: 'goal',
    description: 'Contributed to the internal tools revamp that raised customer CSAT score from 3.8 to 4.6 out of 5.',
    impact: '0.8 point CSAT improvement directly linked to tool changes'
  },
  {
    id: 'ach-5',
    title: 'On-Time Delivery Streak',
    project: 'Multiple Projects',
    teamLead: 'Priya S.',
    achievedDate: 'Nov 20, 2025',
    category: 'milestone',
    description: 'Maintained 10 consecutive sprints with all deliverables completed before or on the deadline.',
    impact: '10-sprint on-time streak — longest on the team'
  },
  {
    id: 'ach-6',
    title: 'Best Team Player — Q3 2025',
    project: 'Cross-functional',
    teamLead: 'Arun M.',
    achievedDate: 'Sep 30, 2025',
    category: 'award',
    description: 'Recognized by peers and manager for exceptional collaboration, code reviews, and knowledge sharing during Q3.',
    impact: 'Voted by 12 team members across 2 departments'
  }
];
