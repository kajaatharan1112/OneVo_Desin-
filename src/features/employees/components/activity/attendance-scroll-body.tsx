import React from 'react';

interface AttendanceScrollBodyProps {
  isLoading: boolean;
  isEmpty: boolean;
  emptyLabel: string;
  loadingLabel?: string;
  children: React.ReactNode;
}

export const AttendanceScrollBody: React.FC<AttendanceScrollBodyProps> = ({
  isLoading,
  isEmpty,
  emptyLabel,
  loadingLabel = 'Loading items…',
  children
}) => {
  if (isLoading) {
    return (
      <div className="attendance-list-state attendance-list-state--loading" role="status" aria-live="polite">
        <div className="attendance-list-state__skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="attendance-list-state__message">{loadingLabel}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="attendance-list-state attendance-list-state--empty" role="status">
        <p className="attendance-list-state__message">{emptyLabel}</p>
      </div>
    );
  }

  return <>{children}</>;
};
