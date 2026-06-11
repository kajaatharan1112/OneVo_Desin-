import React from 'react';
import { LayoutList } from 'lucide-react';
import { RequestStatusGroupSection } from './request-status-group';
import type { RequestStatusGroup } from '../../types/employee-requests.types';

interface RequestStatusBoardProps {
  groups: RequestStatusGroup[];
  shownCount: number;
  archivedCount: number;
  totalCount: number;
  className?: string;
}

export const RequestStatusBoard: React.FC<RequestStatusBoardProps> = ({
  groups,
  shownCount,
  archivedCount,
  totalCount,
  className = ''
}) => {
  return (
    <section
      className={`era-panel era-status-board ${className}`.trim()}
      aria-label="Request status board"
    >
      <header className="era-status-board__head">
        <div className="era-status-board__title-wrap">
          <LayoutList size={15} aria-hidden="true" />
          <div>
            <h3 className="era-status-board__title">Request Status Board</h3>
            <p className="era-status-board__subtext">
              {shownCount} active · {archivedCount} archived
            </p>
          </div>
        </div>
      </header>

      <div className="era-status-board__scroll" tabIndex={0} aria-label="Active request groups">
        <div className="era-status-board__lanes">
          {groups.map((group) => (
            <RequestStatusGroupSection key={group.id} group={group} />
          ))}
        </div>
      </div>

      <footer className="era-status-board__footer">
        <button type="button" className="era-btn era-btn--ghost era-btn--compact">
          View all {totalCount} requests
        </button>
      </footer>
    </section>
  );
};
