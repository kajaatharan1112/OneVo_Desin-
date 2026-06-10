import React from 'react';
import {
  ClipboardList,
  CalendarOff,
  Receipt,
  UserPlus,
  FolderKanban,
  Laptop
} from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { DecisionPriority } from '../data/ceo-dashboard.data';

const typeIcons: Record<string, React.ReactNode> = {
  'Leave request': <CalendarOff size={13} aria-hidden="true" />,
  'Expense claim': <Receipt size={13} aria-hidden="true" />,
  'Hiring approval': <UserPlus size={13} aria-hidden="true" />,
  'Project approval': <FolderKanban size={13} aria-hidden="true" />,
  'Purchase request': <Laptop size={13} aria-hidden="true" />
};

const priorityBorder: Record<DecisionPriority, string> = {
  Medium: 'cdo-timeline__item--medium',
  High: 'cdo-timeline__item--high',
  Urgent: 'cdo-timeline__item--urgent'
};

export const DecisionsApprovalQueue: React.FC = () => {
  const { approvalQueue } = ceoDashboardData.decisions;

  return (
    <article className="cwo-widget cdo-cell--queue">
      <header className="cwo-widget__head">
        <ClipboardList size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Approval queue</h4>
        <span className="cwo-widget__tab">{approvalQueue.length} items</span>
      </header>
      <ul className="cdo-timeline">
        {approvalQueue.map((item) => (
          <li
            key={item.id}
            className={`cdo-timeline__item ${priorityBorder[item.priority]}`}
          >
            <span className="cdo-timeline__icon">
              {typeIcons[item.type] ?? <ClipboardList size={13} aria-hidden="true" />}
            </span>
            <div className="cdo-timeline__copy">
              <div className="cdo-timeline__top">
                <span className="cdo-timeline__title">{item.title}</span>
                <span className={`cwo-priority cwo-priority--${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
              </div>
              <span className="cdo-timeline__meta">
                {item.type} · {item.department} · {item.ageLabel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
