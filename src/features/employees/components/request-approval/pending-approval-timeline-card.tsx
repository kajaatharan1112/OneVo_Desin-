import React from 'react';
import { Clock } from 'lucide-react';
import type { PendingApprovalTimelineItem } from '../../types/employee-requests.types';

interface PendingApprovalTimelineCardProps {
  items: PendingApprovalTimelineItem[];
  className?: string;
}

export const PendingApprovalTimelineCard: React.FC<PendingApprovalTimelineCardProps> = ({
  items,
  className = ''
}) => {
  return (
    <section
      className={`era-panel era-pending-timeline ${className}`.trim()}
      aria-label="Pending approval timeline"
    >
      <header className="era-section__head">
        <Clock size={14} aria-hidden="true" />
        <h3 className="era-section__title">Pending Approval Timeline</h3>
      </header>
      <div className="era-pending-timeline__scroll">
        <ol className="era-pending-timeline__list">
          {items.map((item, index) => (
            <li key={item.id} className="era-pending-timeline__item">
              <div className="era-pending-timeline__rail" aria-hidden="true">
                <span className="era-pending-timeline__dot" />
                {index < items.length - 1 ? <span className="era-pending-timeline__line" /> : null}
              </div>
              <div className="era-pending-timeline__body">
                <span className="era-pending-timeline__title">{item.title}</span>
                <span className="era-pending-timeline__owner">{item.currentStep}</span>
                <span className="era-pending-timeline__expected">Expected: {item.expectedDecision}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
