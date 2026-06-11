import React from 'react';
import type { RequestStatus } from '../../types/employee-requests.types';

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  'needs-action': 'Needs Action',
  approved: 'Approved',
  rejected: 'Rejected',
  forwarded: 'Forwarded'
};

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
  return (
    <span className={`era-status-badge era-status-badge--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
};
