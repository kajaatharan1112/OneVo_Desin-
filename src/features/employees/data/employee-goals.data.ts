export interface GoalPlanItem {
  id: string;
  title: string;
  progress: number;
  dueLabel: string;
  status: 'on-track' | 'at-risk' | 'completed';
}

export interface GoalItem {
  id: string;
  label: string;
  planId: string;
  progress: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  dateLabel: string;
  impact: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  dateLabel: string;
  outcome: 'approved' | 'pending' | 'deferred';
  note: string;
}

export const employeeGoalsSummary = {
  activePlans: 4,
  activeGoals: 6,
  achievementsCount: 3,
  decisionsCount: 2
};

export const goalPlans: GoalPlanItem[] = [
  {
    id: 'pl1',
    title: 'Q4 delivery roadmap',
    progress: 72,
    dueLabel: 'Due 28 Nov',
    status: 'on-track'
  },
  {
    id: 'pl2',
    title: 'Skills uplift — React & system design',
    progress: 45,
    dueLabel: 'Due 15 Dec',
    status: 'at-risk'
  },
  {
    id: 'pl3',
    title: 'Client onboarding excellence',
    progress: 88,
    dueLabel: 'Due 10 Nov',
    status: 'on-track'
  },
  {
    id: 'pl4',
    title: 'Team mentorship program',
    progress: 100,
    dueLabel: 'Completed',
    status: 'completed'
  }
];

export const goals: GoalItem[] = [
  { id: 'g1', label: 'Ship workspace v2 beta', planId: 'pl1', progress: 80 },
  { id: 'g2', label: 'Close 3 high-priority bugs', planId: 'pl1', progress: 65 },
  { id: 'g3', label: 'Complete advanced TypeScript course', planId: 'pl2', progress: 40 },
  { id: 'g4', label: 'Publish internal design doc', planId: 'pl2', progress: 50 },
  { id: 'g5', label: 'Run 2 client demo sessions', planId: 'pl3', progress: 90 },
  { id: 'g6', label: 'Mentor 2 junior developers', planId: 'pl4', progress: 100 }
];

export const achievements: AchievementItem[] = [
  {
    id: 'a1',
    title: 'Sprint MVP shipped on time',
    dateLabel: '8 Nov 2025',
    impact: 'Team velocity +18%'
  },
  {
    id: 'a2',
    title: 'Zero P1 incidents — 30 days',
    dateLabel: '1 Nov 2025',
    impact: 'Stability award'
  },
  {
    id: 'a3',
    title: 'Peer review champion',
    dateLabel: '25 Oct 2025',
    impact: '12 PRs reviewed'
  }
];

export const decisions: DecisionItem[] = [
  {
    id: 'd1',
    title: 'Adopt shared chart theme tokens',
    dateLabel: '6 Nov 2025',
    outcome: 'approved',
    note: 'Design + engineering aligned'
  },
  {
    id: 'd2',
    title: 'Defer mobile goals view to Q1',
    dateLabel: '3 Nov 2025',
    outcome: 'deferred',
    note: 'Focus desktop workspace first'
  }
];
