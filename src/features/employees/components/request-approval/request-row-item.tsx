import React from 'react';
import { CalendarDays, ClipboardList, FileText, Home, Laptop } from 'lucide-react';
import { formatRequestRowMeta, getRowActionLabel } from '../../utils/request-display.utils';
import type { EmployeeRequest, RequestType } from '../../types/employee-requests.types';
import { RequestStatusBadge } from './request-status-badge';

function RequestTypeIcon({ type }: { type: RequestType }) {
  const props = { size: 13, strokeWidth: 2, 'aria-hidden': true as const };

  switch (type) {
    case 'leave':
      return <CalendarDays {...props} />;
    case 'wfh':
      return <Home {...props} />;
    case 'asset':
      return <Laptop {...props} />;
    case 'attendance':
      return <ClipboardList {...props} />;
    default:
      return <FileText {...props} />;
  }
}

interface RequestRowItemProps {
  request: EmployeeRequest;
  isUrgentHighlight?: boolean;
}

export const RequestRowItem: React.FC<RequestRowItemProps> = ({
  request,
  isUrgentHighlight = false
}) => {
  const rowClassName = [
    'era-request-row',
    `era-request-row--${request.status}`,
    isUrgentHighlight ? 'era-request-row--urgent' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={rowClassName}>
      <span className="era-request-row__icon" aria-hidden="true">
        <RequestTypeIcon type={request.type} />
      </span>
      <div className="era-request-row__content">
        <div className="era-request-row__headline">
          <span className="era-request-row__type">{request.typeLabel}</span>
          <span className="era-request-row__title">{request.title}</span>
        </div>
        <span className="era-request-row__meta">{formatRequestRowMeta(request)}</span>
      </div>
      <div className="era-request-row__aside">
        <RequestStatusBadge status={request.status} />
        {request.rowAction ? (
          <button type="button" className="era-btn era-btn--primary era-btn--compact">
            {getRowActionLabel(request.rowAction)}
          </button>
        ) : null}
      </div>
    </li>
  );
};
