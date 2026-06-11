import React from 'react';

interface WorkScrollBodyProps {
  isLoading: boolean;
  isEmpty: boolean;
  emptyLabel: string;
  loadingLabel?: string;
  children: React.ReactNode;
}

export const WorkScrollBody: React.FC<WorkScrollBodyProps> = ({
  isLoading,
  isEmpty,
  emptyLabel,
  loadingLabel = 'Loading items…',
  children
}) => {
  if (isLoading) {
    return (
      <div className="work-list-state work-list-state--loading" role="status" aria-live="polite">
        <div className="work-list-state__skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="work-list-state__message">{loadingLabel}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="work-list-state work-list-state--empty" role="status">
        <p className="work-list-state__message">{emptyLabel}</p>
      </div>
    );
  }

  return <>{children}</>;
};
