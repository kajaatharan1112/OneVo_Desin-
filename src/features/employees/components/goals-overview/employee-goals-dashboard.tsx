import React from 'react';
import { AchievementsPanel } from './widgets/achievements-panel';
import { DecisionsPanel } from './widgets/decisions-panel';
import { PlansGoalsPanel } from './widgets/plans-goals-panel';

export const EmployeeGoalsDashboard: React.FC = () => {
  return (
    <div className="employee-goals-overview" aria-label="Goals overview">
      <PlansGoalsPanel />
      <AchievementsPanel />
      <DecisionsPanel />
    </div>
  );
};
