import React, { useState } from 'react';
import {
  Sun, Thermometer, Coffee, Calendar, X, Plus,
  CalendarDays, Clock, Info, Users
} from 'lucide-react';
import { employeeLeaveBalance } from '../../data/employee-requests.data';
import {
  leaveRequests as SEED_REQUESTS,
  leaveHistory,
  upcomingLeaves,
  leaveCompanyHolidays,
  leavePolicyNotes,
  type LeaveRequest,
  type LeaveTypeKey
} from '../../data/employee-leave.data';
import { useInbox, INBOX_CURRENT_USER } from '../../../../core/notifications/inbox-context';
import { useEmployeeContext } from '../../context/employee-context';

/* ─── Team leave mock (manager view) ─── */
interface TeamLeaveEntry {
  id: string; name: string; initials: string;
  leaveType: string; startDate: string; endDate: string;
  days: number; status: 'pending' | 'approved' | 'rejected';
}
const TEAM_LEAVE: TeamLeaveEntry[] = [
  { id: 'tl-1', name: 'Alexander Pierce', initials: 'AP', leaveType: 'Annual', startDate: 'Jun 20', endDate: 'Jun 23', days: 4, status: 'approved' },
  { id: 'tl-2', name: 'Jordan Kim',       initials: 'JK', leaveType: 'Sick',   startDate: 'Jun 18', endDate: 'Jun 18', days: 1, status: 'pending'  },
];

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const LEAVE_ICONS: Record<string, React.ReactNode> = {
  Annual:  <Sun size={13} />,
  Sick:    <Thermometer size={13} />,
  Casual:  <Coffee size={13} />,
  Other:   <Calendar size={13} />
};

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
};

interface LeaveFormState {
  leaveType: LeaveTypeKey;
  startDate: string;
  endDate: string;
  reason: string;
}

const DEFAULT_FORM: LeaveFormState = {
  leaveType: 'Annual',
  startDate: '',
  endDate: '',
  reason: ''
};

export const EmployeeLeave: React.FC = () => {
  const { addInboxItem } = useInbox();
  const { selectedEmployee } = useEmployeeContext();
  const isManager = selectedEmployee.id === 'manager';
  const [filter, setFilter]           = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen]     = useState(false);
  const [requests, setRequests]       = useState<LeaveRequest[]>(SEED_REQUESTS);
  const [form, setForm]               = useState<LeaveFormState>(DEFAULT_FORM);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const counts: Record<StatusFilter, number> = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const patchForm = (patch: Partial<LeaveFormState>) =>
    setForm(f => ({ ...f, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `lr-${Date.now()}`;
    const newReq: LeaveRequest = {
      id,
      leaveType:     form.leaveType,
      startDate:     form.startDate,
      endDate:       form.endDate,
      days:          1,
      status:        'pending',
      submittedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      reason:        form.reason,
      approver:      'Manager'
    };
    setRequests(prev => [newReq, ...prev]);
    addInboxItem({
      id:          `leave-${id}`,
      recipientId: INBOX_CURRENT_USER,
      category:    'approval',
      title:       'Leave request submitted',
      message:     `Your ${form.leaveType} leave request is pending manager review.`,
      timeLabel:   'Just now',
      filter:      'new',
      actions:     [{ id: 'view', label: 'View Request', variant: 'secondary' }],
      leaveMeta:   { requestId: id, leaveType: form.leaveType }
    });
    setModalOpen(false);
    setForm(DEFAULT_FORM);
  };

  return (
    <div className="content-card">
      <div className="elp-root">

        {/* ── Header ── */}
        <div className="elp-header">
          <div className="elp-header__title">
            <h2 className="elp-page-title">My Leave</h2>
            <span className="elp-header__sub">2026 leave year</span>
          </div>
          <button
            type="button"
            className="era-btn era-btn--primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={13} />
            Apply Leave
          </button>
        </div>

        {/* ── Balance strip ── */}
        <div className="elp-balance-strip">
          {employeeLeaveBalance.items.map(item => {
            const remaining = item.total - item.used;
            const usedPct   = Math.round((item.used / item.total) * 100);
            return (
              <div key={item.id} className="elp-balance-card era-panel">
                <div className="elp-balance-card__icon">
                  {LEAVE_ICONS[item.label] ?? <Calendar size={13} />}
                </div>
                <div className="elp-balance-card__info">
                  <span className="elp-balance-card__label">{item.label}</span>
                  <span className="elp-balance-card__remaining">{remaining} left</span>
                </div>
                <div className="elp-balance-card__bar-wrap">
                  <div className="elp-balance-bar">
                    <div className="elp-balance-bar__fill" style={{ width: `${usedPct}%` }} />
                  </div>
                  <span className="elp-balance-card__used">{item.used} used of {item.total}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main grid ── */}
        <div className="elp-main-grid">

          {/* Requests panel */}
          <div className="elp-requests-panel era-panel">
            <div className="elp-section-head">
              <span className="elp-section-title">Leave Requests</span>
              <div className="elp-filter-tabs">
                {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`elp-filter-tab${filter === s ? ' elp-filter-tab--active' : ''}`}
                    onClick={() => setFilter(s)}
                  >
                    {s === 'all' ? 'All' : STATUS_LABEL[s]}
                    <span className="elp-filter-tab__count">{counts[s]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="elp-requests-list">
              {filtered.length === 0 && (
                <div className="elp-empty">No {filter === 'all' ? '' : filter + ' '}requests.</div>
              )}
              {filtered.map(req => (
                <div key={req.id} className="elp-request-row">
                  <div className="elp-request-row__icon">
                    {LEAVE_ICONS[req.leaveType] ?? <Calendar size={13} />}
                  </div>
                  <div className="elp-request-row__main">
                    <div className="elp-request-row__top">
                      <span className="elp-request-row__type">{req.leaveType} Leave</span>
                      <span className={`era-status-badge era-status-badge--${req.status}`}>
                        {STATUS_LABEL[req.status]}
                      </span>
                    </div>
                    <div className="elp-request-row__meta">
                      <CalendarDays size={11} />
                      {req.startDate === req.endDate
                        ? req.startDate
                        : `${req.startDate} – ${req.endDate}`}
                      <span className="elp-request-row__days">· {req.days}d</span>
                      {req.approver && req.status === 'pending' && (
                        <>
                          <span className="elp-dot" />
                          <Clock size={11} />
                          With {req.approver}
                        </>
                      )}
                      {req.status === 'rejected' && req.rejectionNote && (
                        <>
                          <span className="elp-dot" />
                          <Info size={11} />
                          {req.rejectionNote}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="elp-side-panel">

            {/* Upcoming */}
            <div className="era-panel elp-side-section">
              <div className="elp-section-head">
                <span className="elp-section-title">Upcoming</span>
              </div>
              {upcomingLeaves.length === 0 ? (
                <div className="elp-empty">No upcoming leaves.</div>
              ) : (
                <div className="elp-upcoming-list">
                  {upcomingLeaves.map(ul => (
                    <div key={ul.id} className="elp-upcoming-item">
                      <div className="elp-upcoming-item__icon">
                        {LEAVE_ICONS[ul.leaveType] ?? <Calendar size={13} />}
                      </div>
                      <div className="elp-upcoming-item__info">
                        <span className="elp-upcoming-item__type">{ul.leaveType} Leave</span>
                        <span className="elp-upcoming-item__dates">
                          {ul.startDate} – {ul.endDate} · {ul.days}d
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company holidays */}
            <div className="era-panel elp-side-section">
              <div className="elp-section-head">
                <span className="elp-section-title">Company Holidays</span>
              </div>
              <div className="elp-holiday-list">
                {leaveCompanyHolidays.map(h => (
                  <div key={h.id} className="elp-holiday-item">
                    <span className="elp-holiday-item__label">{h.label}</span>
                    <span className="elp-holiday-item__date">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy reminders */}
            <div className="era-panel elp-side-section">
              <div className="elp-section-head">
                <span className="elp-section-title">Policy Reminders</span>
              </div>
              <ul className="elp-policy-list">
                {leavePolicyNotes.map(note => (
                  <li key={note.id} className="elp-policy-item">
                    <Info size={11} />
                    {note.text}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Leave history ── */}
        <div className="elp-history-panel era-panel">
          <div className="elp-section-head">
            <span className="elp-section-title">Leave History</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>2026</span>
          </div>
          <table className="elp-history-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Approver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.leaveType}</td>
                  <td>{entry.startDate} – {entry.endDate}</td>
                  <td>{entry.days}d</td>
                  <td>{entry.approver}</td>
                  <td>
                    <span className={`era-status-badge era-status-badge--${entry.status}`}>
                      {STATUS_LABEL[entry.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Team leave (manager only) ── */}
        {isManager && (
          <div className="elp-history-panel era-panel">
            <div className="elp-section-head">
              <span className="elp-section-title">
                <Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                Team Leave
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>Direct reports</span>
            </div>
            <table className="elp-history-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {TEAM_LEAVE.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'var(--accent)', color: '#fff',
                          fontSize: '0.65rem', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>{entry.initials}</span>
                        {entry.name}
                      </span>
                    </td>
                    <td>{entry.leaveType}</td>
                    <td>{entry.startDate === entry.endDate ? entry.startDate : `${entry.startDate} – ${entry.endDate}`}</td>
                    <td>{entry.days}d</td>
                    <td>
                      <span className={`era-status-badge era-status-badge--${entry.status}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── Apply Leave modal ── */}
      {modalOpen && (
        <div className="elp-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="elp-modal" onClick={e => e.stopPropagation()}>
            <div className="elp-modal__head">
              <span className="elp-modal__title">Apply for Leave</span>
              <button
                type="button"
                className="elp-modal__close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
            <form className="elp-modal__form" onSubmit={handleSubmit}>
              <label className="elp-field">
                <span className="elp-field__label">Leave Type</span>
                <select
                  className="elp-field__input"
                  value={form.leaveType}
                  onChange={e => patchForm({ leaveType: e.target.value as LeaveTypeKey })}
                >
                  <option value="Annual">Annual</option>
                  <option value="Sick">Sick</option>
                  <option value="Casual">Casual</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <div className="elp-field-row">
                <label className="elp-field">
                  <span className="elp-field__label">From</span>
                  <input
                    type="date"
                    className="elp-field__input"
                    value={form.startDate}
                    onChange={e => patchForm({ startDate: e.target.value })}
                    required
                  />
                </label>
                <label className="elp-field">
                  <span className="elp-field__label">To</span>
                  <input
                    type="date"
                    className="elp-field__input"
                    value={form.endDate}
                    onChange={e => patchForm({ endDate: e.target.value })}
                    required
                  />
                </label>
              </div>
              <label className="elp-field">
                <span className="elp-field__label">Reason (optional)</span>
                <textarea
                  className="elp-field__input elp-field__textarea"
                  value={form.reason}
                  onChange={e => patchForm({ reason: e.target.value })}
                  placeholder="Brief reason for this leave request…"
                  rows={3}
                />
              </label>
              <div className="elp-modal__actions">
                <button
                  type="button"
                  className="era-btn era-btn--ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="era-btn era-btn--primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
