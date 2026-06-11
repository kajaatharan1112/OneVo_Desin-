import React from 'react';
import { PieChart } from 'lucide-react';
import type { RequestCategoryCount } from '../../types/employee-requests.types';

interface RequestCategoryBreakdownProps {
  categories: RequestCategoryCount[];
  maxCount: number;
  className?: string;
}

export const RequestCategoryBreakdown: React.FC<RequestCategoryBreakdownProps> = ({
  categories,
  maxCount,
  className = ''
}) => {
  return (
    <section
      className={`era-panel era-category-breakdown-card ${className}`.trim()}
      aria-label="Request category breakdown"
    >
      <header className="era-section__head era-section__head--muted">
        <PieChart size={13} aria-hidden="true" />
        <h3 className="era-section__title">Category Breakdown</h3>
      </header>
      <ul className="era-category-breakdown__list">
        {categories.map((category) => {
          const widthPercent = Math.round((category.count / maxCount) * 100);

          return (
            <li key={category.typeLabel} className="era-category-breakdown__item">
              <span className="era-category-breakdown__label">{category.typeLabel}</span>
              <div className="era-category-bar__track" role="presentation" aria-hidden="true">
                <span
                  className="era-category-bar__fill"
                  style={{ '--era-bar-width': `${widthPercent}%` } as React.CSSProperties}
                />
              </div>
              <span className="era-category-breakdown__count">{category.count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
