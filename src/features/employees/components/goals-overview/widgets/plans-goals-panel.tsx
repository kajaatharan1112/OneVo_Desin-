import React from 'react';
import { Flag, Target } from 'lucide-react';
import { goalPlans, goals } from '../../../data/employee-goals.data';

export const PlansGoalsPanel: React.FC = () => {
  return (
    <article className="ego-widget ego-plans">
      <header className="ego-widget__head">
        <Flag size={16} aria-hidden="true" />
        <h3 className="ego-widget__title">Plans & goals</h3>
        <span className="ego-widget__tab">
          {goalPlans.length} plans · {goals.length} goals
        </span>
      </header>

      <ul className="ego-plans__list">
        {goalPlans.map((plan) => {
          const planGoals = goals.filter((g) => g.planId === plan.id);

          return (
            <li key={plan.id} className={`ego-plans__item ego-plans__item--${plan.status}`}>
              <div className="ego-plans__row">
                <span className="ego-plans__name">{plan.title}</span>
                <span className="ego-plans__due">{plan.dueLabel}</span>
              </div>
              <div className="ego-plans__bar" aria-hidden="true">
                <span className="ego-plans__bar-fill" style={{ width: `${plan.progress}%` }} />
              </div>
              <ul className="ego-plans__goals">
                {planGoals.map((goal) => (
                  <li key={goal.id} className="ego-plans__goal">
                    <Target size={12} aria-hidden="true" />
                    <span>{goal.label}</span>
                    <span className="ego-plans__goal-pct">{goal.progress}%</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </article>
  );
};
