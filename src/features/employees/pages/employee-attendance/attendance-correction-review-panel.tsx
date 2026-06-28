import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export interface CorrectionApprovalStep {
  id: string;
  role: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'waiting';
  decidedAt?: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  date: string;
  requestedIn: string;
  requestedOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver: string;
  submittedDate: string;
  employeeId?: string;
  employeeName?: string;
  employeeInitials?: string;
  approvalSteps?: CorrectionApprovalStep[];
}

interface Props {
  requests: AttendanceCorrectionRequest[];
  focusedRequestId: string | null;
  onClose: () => void;
  onAction: (requestId: string, action: 'approved' | 'rejected') => void;
}

type PanelTab = 'pending' | 'history';

function resolveApprovalSteps(request: AttendanceCorrectionRequest): CorrectionApprovalStep[] {
  if (request.approvalSteps?.length) return request.approvalSteps;

  return [
    {
      id: `${request.id}-manager`,
      role: 'Manager',
      approverName: 'Manager',
      status: request.status === 'pending' ? 'pending' : request.status,
      decidedAt: request.status !== 'pending' ? request.submittedDate : undefined,
    },
    {
      id: `${request.id}-hr`,
      role: 'HR',
      approverName: request.approver,
      status: request.status === 'pending' ? 'waiting' : request.status,
      decidedAt: request.status !== 'pending' ? request.submittedDate : undefined,
    },
  ];
}

function canManagerAct(steps: CorrectionApprovalStep[]): boolean {
  const current = steps.find(step => step.status === 'pending');
  return current?.role === 'Manager';
}

interface RequestCardProps {
  request: AttendanceCorrectionRequest;
  mode: PanelTab;
  isFocused: boolean;
  onAction?: (requestId: string, action: 'approved' | 'rejected') => void;
}

const CorrectionRequestCard: React.FC<RequestCardProps> = ({
  request,
  mode,
  isFocused,
  onAction,
}) => {
  const steps = resolveApprovalSteps(request);
  const showActions = mode === 'pending' && request.status === 'pending' && canManagerAct(steps) && onAction;

  return (
    <article
      className={`attendance-correction-card${isFocused ? ' attendance-correction-card--focused' : ''}`}
      id={`correction-request-${request.id}`}
    >
      <div className="attendance-correction-card__header">
        <span className="attendance-correction-card__avatar" aria-hidden="true">
          {request.employeeInitials ?? '??'}
        </span>
        <div className="attendance-correction-card__employee">
          <h3>{request.employeeName ?? 'Employee'}</h3>
          <p>Submitted: {request.submittedDate}</p>
        </div>
      </div>

      <div className="attendance-correction-card__summary">
        <p>
          <span>Date to correct:</span>
          <strong>{request.date}</strong>
        </p>
        <p>
          <span>Requested shift:</span>
          <strong>{request.requestedIn}</strong>
          <span className="attendance-correction-card__arrow" aria-hidden="true">→</span>
          <strong>{request.requestedOut}</strong>
        </p>
        <p className="attendance-correction-card__reason">
          <strong>Reason:</strong>
          <span>&quot;{request.reason}&quot;</span>
        </p>
      </div>

      {showActions && (
        <div className="attendance-correction-card__actions">
          <button
            type="button"
            className="era-btn era-btn--primary"
            onClick={() => onAction(request.id, 'approved')}
          >
            Approve
          </button>
          <button
            type="button"
            className="era-btn era-btn--ghost"
            onClick={() => onAction(request.id, 'rejected')}
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
};

export const AttendanceCorrectionReviewPanel: React.FC<Props> = ({
  requests,
  focusedRequestId,
  onClose,
  onAction,
}) => {
  const focusedRequest = requests.find(item => item.id === focusedRequestId);
  const [activeTab, setActiveTab] = useState<PanelTab>(
    focusedRequest?.status === 'pending' ? 'pending' : 'history'
  );
  const [search, setSearch] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  const pendingRequests = useMemo(
    () => requests.filter(item => item.status === 'pending'),
    [requests]
  );

  const historyRequests = useMemo(
    () => requests.filter(item => item.status !== 'pending'),
    [requests]
  );

  const filteredItems = useMemo(() => {
    const source = activeTab === 'pending' ? pendingRequests : historyRequests;
    const q = search.trim().toLowerCase();
    if (!q) return source;

    return source.filter(item =>
      item.date.includes(q)
      || item.reason.toLowerCase().includes(q)
      || item.employeeName?.toLowerCase().includes(q)
      || resolveApprovalSteps(item).some(step =>
        step.approverName.toLowerCase().includes(q)
        || step.role.toLowerCase().includes(q)
      )
    );
  }, [activeTab, historyRequests, pendingRequests, search]);

  useEffect(() => {
    if (!focusedRequestId || !bodyRef.current) return;

    const target = bodyRef.current.querySelector(`#correction-request-${focusedRequestId}`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedRequestId, activeTab]);

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <aside
        className="org-slideover attendance-correction-slideover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-correction-title"
        onClick={event => event.stopPropagation()}
      >
        <header className="org-slideover__header attendance-correction-slideover__header">
          <div className="attendance-correction-slideover__heading">
            <h2 id="attendance-correction-title">Attendance Correction Request</h2>
            <div className="attendance-correction-slideover__tabs" role="tablist" aria-label="Correction views">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'pending'}
                className={`attendance-correction-slideover__tab${activeTab === 'pending' ? ' attendance-correction-slideover__tab--active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending Approval
                {pendingRequests.length > 0 && (
                  <span className="attendance-correction-slideover__tab-count">{pendingRequests.length}</span>
                )}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'history'}
                className={`attendance-correction-slideover__tab${activeTab === 'history' ? ' attendance-correction-slideover__tab--active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>
          </div>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close correction request">
            <X size={18} />
          </button>
        </header>

        <div className="attendance-correction-slideover__toolbar">
          <div className="cfg-search attendance-correction-slideover__search">
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={activeTab === 'pending' ? 'Search pending requests…' : 'Search history…'}
              aria-label="Search correction requests"
            />
          </div>
        </div>

        <div
          ref={bodyRef}
          className="org-slideover__body attendance-correction-slideover__body"
          role="tabpanel"
        >
          {filteredItems.length === 0 ? (
            <p className="attendance-correction-history__empty">
              {activeTab === 'pending'
                ? 'No pending correction requests.'
                : 'No completed correction requests found.'}
            </p>
          ) : (
            <div className="attendance-correction-slideover__list">
              {filteredItems.map(item => (
                <CorrectionRequestCard
                  key={item.id}
                  request={item}
                  mode={activeTab}
                  isFocused={item.id === focusedRequestId}
                  onAction={activeTab === 'pending' ? onAction : undefined}
                />
              ))}
            </div>
          )}
        </div>

      </aside>
    </div>
  );
};
