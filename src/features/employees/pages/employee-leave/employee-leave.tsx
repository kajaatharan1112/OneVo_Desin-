import React, { useState, useRef, useEffect } from 'react';
import {
  Sun, Thermometer, Coffee, Calendar, X, Plus,
  CalendarDays, Clock, Info, Users, Settings, Paperclip, UploadCloud
} from 'lucide-react';
import { employeeLeaveBalance } from '../../data/employee-requests.data';
import {
  leaveHistory,
  upcomingLeaves,
  leaveCompanyHolidays,
  leavePolicyNotes,
  type LeaveRequest,
  type LeaveTypeKey
} from '../../data/employee-leave.data';
import { useLeaveRequestStore } from '../../../../store/leaveRequestStore';
import { employeeCalendarData } from '../../data/employee-calendar.data';
import { useInbox, INBOX_CURRENT_USER } from '../../../../core/notifications/inbox-context';
import { LeavePoliciesPage } from '../../../leave/configuration/LeavePoliciesPage';
import { LeaveTypesPage } from '../../../leave/configuration/LeaveTypesPage';
import { LeaveEntitlementsPage } from '../../../leave/configuration/LeaveEntitlementsPage';

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
  attachmentName: string;
}

const DEFAULT_FORM: LeaveFormState = {
  leaveType: 'Annual',
  startDate: '',
  endDate: '',
  reason: '',
  attachmentName: ''
};

export const EmployeeLeave: React.FC = () => {
  const { addInboxItem } = useInbox();
  const [activeView, setActiveView] = useState<'self' | 'team'>('self');
  const [configurationView, setConfigurationView] = useState<'menu' | 'types' | 'policies' | 'entitlements' | null>(null);
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter]           = useState<StatusFilter>('all');
  const [isDragOver, setIsDragOver]   = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      patchForm({ attachmentName: file.name });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsConfigDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [modalOpen, setModalOpen]     = useState(false);
  const allRequests = useLeaveRequestStore(s => s.requests);
  const addRequest = useLeaveRequestStore(s => s.addRequest);
  const approveRequest = useLeaveRequestStore(s => s.approveRequest);
  const rejectRequest = useLeaveRequestStore(s => s.rejectRequest);
  const [form, setForm]               = useState<LeaveFormState>(DEFAULT_FORM);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  const myRequests = allRequests.filter(r => r.employeeName === undefined);
  const teamRequests = allRequests.filter(r => r.employeeName !== undefined);

  const filtered = myRequests.filter(r => filter === 'all' || r.status === filter);

  useEffect(() => {
    if (!modalOpen) {
      setShowSchedulePreview(false);
    }
  }, [modalOpen]);

  // Helper to find conflicting events (meetings, reminders/tasks, shifts) within selected dates
  const conflictingEvents = React.useMemo(() => {
    if (!form.startDate || !form.endDate) return [];
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    return (employeeCalendarData?.events || []).filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) return false;
      
      const isWithinRange = eventDate >= start && eventDate <= end;
      const isConflictType = event.type === 'meeting' || event.type === 'reminder' || event.type === 'shift';
      
      return isWithinRange && isConflictType;
    });
  }, [form.startDate, form.endDate]);

  const hasConflict = conflictingEvents.length > 0;

  const counts: Record<StatusFilter, number> = {
    all:      myRequests.length,
    pending:  myRequests.filter(r => r.status === 'pending').length,
    approved: myRequests.filter(r => r.status === 'approved').length,
    rejected: myRequests.filter(r => r.status === 'rejected').length
  };

  const patchForm = (patch: Partial<LeaveFormState>) =>
    setForm(f => ({ ...f, ...patch }));

  if (configurationView) {
    if (configurationView === 'menu') {
      return (
        <div className="content-card">
          <div className="elp-config-menu">
            <div className="elp-config-menu__header">
              <div>
                <h2>Time Off Configuration</h2>
                <p>Select a section to configure.</p>
              </div>
              <button type="button" className="era-btn era-btn--ghost" onClick={() => setConfigurationView(null)}>Back</button>
            </div>
            <div className="elp-config-menu__card">
              <button type="button" onClick={() => setConfigurationView('types')}>
                <span>Time Off Type</span><small>Manage available time off types</small>
              </button>
              <button type="button" onClick={() => setConfigurationView('policies')}>
                <span>Time Off Policy</span><small>Manage time off rules and policies</small>
              </button>
              <button type="button" onClick={() => setConfigurationView('entitlements')}>
                <span>Entitlement</span><small>Manage employee entitlements</small>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="elp-config-page">
        <button type="button" className="era-btn era-btn--ghost elp-config-page__back" onClick={() => setConfigurationView(null)}>
          Back to Time Off
        </button>
        {configurationView === 'types' && <LeaveTypesPage />}
        {configurationView === 'policies' && <LeavePoliciesPage />}
        {configurationView === 'entitlements' && <LeaveEntitlementsPage />}
      </div>
    );
  }

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
      approver:      'Manager',
      attachmentName: form.attachmentName || undefined
    };
    addRequest(newReq);
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
            <h2 className="elp-page-title">Time Off</h2>
            <span className="elp-header__sub">2026 leave year</span>
          </div>
          <div className="elp-header__actions">
            <div className="elp-view-toggle" role="group" aria-label="Time off view">
              <button type="button" className={`elp-view-toggle__button${activeView === 'self' ? ' elp-view-toggle__button--active' : ''}`} onClick={() => setActiveView('self')}>Self</button>
              <button type="button" className={`elp-view-toggle__button${activeView === 'team' ? ' elp-view-toggle__button--active' : ''}`} onClick={() => setActiveView('team')}>Team</button>
            </div>
            <div className="elp-config-dropdown-container" ref={dropdownRef}>
              <button
                type="button"
                className={`elp-config-button${isConfigDropdownOpen ? ' elp-config-button--active' : ''}`}
                onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
              >
                <Settings size={13} /> Configuration
              </button>
              {isConfigDropdownOpen && (
                <div className="elp-config-dropdown">
                  <button
                    type="button"
                    className="elp-config-dropdown-item"
                    onClick={() => {
                      setConfigurationView('types');
                      setIsConfigDropdownOpen(false);
                    }}
                  >
                    Time off Type
                  </button>
                  <button
                    type="button"
                    className="elp-config-dropdown-item"
                    onClick={() => {
                      setConfigurationView('policies');
                      setIsConfigDropdownOpen(false);
                    }}
                  >
                    Time off Policy
                  </button>
                  <button
                    type="button"
                    className="elp-config-dropdown-item"
                    onClick={() => {
                      setConfigurationView('entitlements');
                      setIsConfigDropdownOpen(false);
                    }}
                  >
                    Entitlement
                  </button>
                </div>
              )}
            </div>
            {activeView === 'self' && (
              <button type="button" className="era-btn era-btn--primary" onClick={() => setModalOpen(true)}>
                <Plus size={13} /> Apply Leave
              </button>
            )}
          </div>
        </div>

        {/* ── Balance strip ── */}
        {activeView === 'self' ? (
          <>
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
                      {req.attachmentName && (
                        <>
                          <span className="elp-dot" />
                          <Paperclip size={11} />
                          <span title={req.attachmentName} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                            {req.attachmentName}
                          </span>
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
          </>
        ) : (
          <div className="elp-team-dashboard">
            <div className="elp-team-summary">
              <div className="era-panel elp-team-summary__item"><span>Away today</span><strong>1</strong></div>
              <div className="era-panel elp-team-summary__item"><span>Upcoming</span><strong>2</strong></div>
              <div className="era-panel elp-team-summary__item">
                <span>Pending requests</span>
                <strong>{teamRequests.filter(r => r.status === 'pending').length}</strong>
              </div>
            </div>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'var(--accent)', color: '#fff',
                          fontSize: '0.65rem', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>{(req.employeeName ?? '??').split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
                        {req.employeeName}
                      </span>
                    </td>
                    <td>{req.leaveType}</td>
                    <td>{req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`}</td>
                    <td>{req.days}d</td>
                    <td>
                      <span className={`era-status-badge era-status-badge--${req.status}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {req.status === 'pending' && (
                        <span style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          <button type="button" className="era-btn era-btn--ghost" onClick={() => approveRequest(req.id)}>
                            Approve
                          </button>
                          <button type="button" className="era-btn era-btn--ghost" onClick={() => rejectRequest(req.id)}>
                            Reject
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <div className="elp-field-row" style={{ alignItems: 'flex-end', position: 'relative', gap: '0.75rem' }}>
                <label className="elp-field" style={{ flex: 1 }}>
                  <span className="elp-field__label">From</span>
                  <input
                    type="date"
                    className="elp-field__input"
                    value={form.startDate}
                    onChange={e => {
                      patchForm({ startDate: e.target.value });
                      setShowSchedulePreview(false);
                    }}
                    required
                  />
                </label>
                <label className="elp-field" style={{ flex: 1 }}>
                  <span className="elp-field__label">To</span>
                  <input
                    type="date"
                    className="elp-field__input"
                    value={form.endDate}
                    onChange={e => {
                      patchForm({ endDate: e.target.value });
                      setShowSchedulePreview(false);
                    }}
                    required
                  />
                </label>
                {hasConflict && (
                  <button
                    type="button"
                    onClick={() => setShowSchedulePreview(!showSchedulePreview)}
                    className={`elp-schedule-alert-btn ${showSchedulePreview ? 'active' : ''}`}
                    title="You have meetings/tasks scheduled during this period. Click to view."
                    style={{
                      height: '42px',
                      width: '42px',
                      borderRadius: '8px',
                      border: '1px solid #fee2e2',
                      background: showSchedulePreview ? '#fee2e2' : '#fef2f2',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={18} />
                  </button>
                )}
              </div>
              {hasConflict && showSchedulePreview && (
                <div 
                  className="elp-schedule-preview" 
                  style={{
                    marginTop: '0.25rem',
                    marginBottom: '0.75rem',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--surface-muted, #f8fafc)',
                    border: '1px solid var(--border, #e2e8f0)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                      Schedule for Selected Dates
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: '#fee2e2', color: '#ef4444', fontWeight: 500 }}>
                      {conflictingEvents.length} {conflictingEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {conflictingEvents.map(event => (
                      <div key={event.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#ffffff',
                        borderLeft: `3px solid ${event.type === 'meeting' ? '#3b82f6' : event.type === 'shift' ? '#10b981' : '#f59e0b'}`,
                        borderRadius: '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1e293b' }}>{event.title}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {event.date} {event.start && `| ${event.start}${event.end ? ` - ${event.end}` : ''}`}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: event.type === 'meeting' ? '#dbeafe' : event.type === 'shift' ? '#d1fae5' : '#fef3c7',
                          color: event.type === 'meeting' ? '#1e40af' : event.type === 'shift' ? '#065f46' : '#92400e',
                        }}>
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <label className="elp-field">
                <span className="elp-field__label">Attachment (optional)</span>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDragOver ? '2px dashed var(--accent)' : '2px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    marginTop: '0.5rem'
                  }}
                  onClick={() => document.getElementById('elp-leave-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="elp-leave-file-input"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        patchForm({ attachmentName: file.name });
                      }
                    }}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <UploadCloud size={24} style={{ color: 'var(--text-m)', opacity: 0.7, marginBottom: '8px', pointerEvents: 'none' }} />
                  {form.attachmentName ? (
                    <div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>
                        {form.attachmentName}
                      </span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>
                        Click or drag new file to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.8125rem', color: 'var(--text-h)', fontWeight: 600, pointerEvents: 'none' }}>
                        Drag & drop file here
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--nexus-text-muted)', pointerEvents: 'none' }}>
                        Supports PDF, PNG, JPG, DOC (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
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
