import React from 'react';
import { Trophy } from 'lucide-react';
import { achievements } from '../../../data/employee-goals.data';

export const AchievementsPanel: React.FC = () => {
  return (
    <article className="ego-widget ego-achievements">
      <header className="ego-widget__head">
        <Trophy size={16} aria-hidden="true" />
        <h3 className="ego-widget__title">Achievements</h3>
        <span className="ego-widget__tab">{achievements.length} recent</span>
      </header>

      <ul className="ego-achievements__list">
        {achievements.map((item) => (
          <li key={item.id} className="ego-achievements__item">
            <span className="ego-achievements__title">{item.title}</span>
            <span className="ego-achievements__meta">{item.dateLabel}</span>
            <span className="ego-achievements__impact">{item.impact}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
