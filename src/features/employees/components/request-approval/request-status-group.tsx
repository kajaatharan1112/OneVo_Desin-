import React from 'react';
import { RequestRowItem } from './request-row-item';
import type { RequestStatusGroup } from '../../types/employee-requests.types';

interface RequestStatusGroupProps {
  group: RequestStatusGroup;
}

export const RequestStatusGroupSection: React.FC<RequestStatusGroupProps> = ({ group }) => {
  const urgentRequestId = group.id === 'needs-action' ? group.requests[0]?.id : undefined;

  return (
    <section className={`era-status-group era-status-group--${group.id}`} aria-label={group.title}>
      <header className="era-status-group__head">
        <h4 className="era-status-group__title">{group.title}</h4>
        <span className="era-status-group__count">{group.requests.length}</span>
      </header>
      <ul className="era-status-group__list">
        {group.requests.map((request) => (
          <RequestRowItem
            key={request.id}
            request={request}
            isUrgentHighlight={request.id === urgentRequestId}
          />
        ))}
      </ul>
    </section>
  );
};
