import React, { useState, useRef, useEffect } from 'react';
import {
  Sun, Thermometer, Coffee, Calendar, X, Plus,
  CalendarDays, Clock, Info, Users, Settings, Paperclip, UploadCloud, ClipboardList
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
import { employeeCalendarData } from '../../data/employee-calendar.data';
import { useInbox, INBOX_CURRENT_USER } from '../../../../core/notifications/inbox-context';
import { useEmployeeContext } from '../../context/employee-context';
import { LeavePoliciesPage } from '../../../leave/configuration/LeavePoliciesPage';
import { LeaveTypesPage } from '../../../leave/configuration/LeaveTypesPage';
import { LeaveEntitlementsPage } from '../../../leave/configuration/LeaveEntitlementsPage';

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
  unit: 'days' | 'hours';
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  reason: string;
  attachmentName: string;
}

const DEFAULT_FORM: LeaveFormState = {
  leaveType: 'Annual',
  unit: 'days',
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '17:00',
  hours: 8,
  reason: '',
  attachmentName: ''
};

export const EmployeeLeave: React.FC = () => {
  const { addInboxItem } = useInbox();
  const { selectedEmployee } = useEmployeeContext();
  const showToggleAndConfig = selectedEmployee.id !== 'alex';
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
  const [requests, setRequests]       = useState<LeaveRequest[]>(SEED_REQUESTS);
  const [teamLeaves, setTeamLeaves]   = useState<TeamLeaveEntry[]>(TEAM_LEAVE);
  const [selectedTeamLeaveId, setSelectedTeamLeaveId] = useState<string | null>(null);
  const [form, setForm]               = useState<LeaveFormState>(DEFAULT_FORM);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  const handleApproveTeamLeave = (id: string) => {
    setTeamLeaves(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' } : item))
    );
    const item = teamLeaves.find(t => t.id === id);
    if (item) {
      addInboxItem({
        id: `leave-approved-${id}-${Date.now()}`,
        recipientId: 'alex',
        category: 'approval',
        title: 'Leave Request Approved',
        message: `Your ${item.leaveType} leave request has been approved.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: [{ id: 'dismiss', label: 'Dismiss', variant: 'secondary' }]
      });
    }
  };

  const handleRejectTeamLeave = (id: string) => {
    setTeamLeaves(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
    const item = teamLeaves.find(t => t.id === id);
    if (item) {
      addInboxItem({
        id: `leave-rejected-${id}-${Date.now()}`,
        recipientId: 'alex',
        category: 'approval',
        title: 'Leave Request Rejected',
        message: `Your ${item.leaveType} leave request has been rejected.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: [{ id: 'dismiss', label: 'Dismiss', variant: 'secondary' }]
      });
    }
  };

  useEffect(() => {
    if (form.unit === 'hours' && form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(':').map(Number);
      const [eh, em] = form.endTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(eh)) {
        const startMin = sh * 60 + (sm || 0);
        const endMin = eh * 60 + (em || 0);
        let diffHours = (endMin - startMin) / 60;
        if (diffHours < 0) diffHours = 0;
        diffHours = Math.round(diffHours * 10) / 10;
        setForm(f => ({ ...f, hours: diffHours }));
      }
    }
  }, [form.startTime, form.endTime, form.unit]);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const selectedTeamLeave = teamLeaves.find(t => t.id === selectedTeamLeaveId);

  useEffect(() => {
    if (!modalOpen) {
      setShowSchedulePreview(false);
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!showToggleAndConfig) {
      setActiveView('self');
      setConfigurationView(null);
    }
  }, [showToggleAndConfig]);

  // Helper to find conflicting events (meetings, reminders/tasks, shifts) within selected dates
  const conflictingEvents = React.useMemo(() => {
    if (!form.startDate) return [];
    const start = new Date(form.startDate);
    const end = form.unit === 'days' && form.endDate ? new Date(form.endDate) : start;
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    return (employeeCalendarData?.events || []).filter(event => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) return false;
      
      const isWithinRange = eventDate >= start && eventDate <= end;
      const isConflictType = event.type === 'meeting' || event.type === 'reminder' || event.type === 'shift';
      
      return isWithinRange && isConflictType;
    });
  }, [form.startDate, form.endDate, form.unit]);

  const hasConflict = conflictingEvents.length > 0;

  const counts: Record<StatusFilter, number> = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
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

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    let calculatedDays = 1;
    let finalStartDate = formatDate(form.startDate);
    let finalEndDate = form.unit === 'days' ? formatDate(form.endDate) : finalStartDate;

    if (form.unit === 'days') {
      if (form.startDate && form.endDate) {
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        calculatedDays = isNaN(diffDays) ? 1 : diffDays;
      }
    } else {
      calculatedDays = form.hours / 8;
    }

    const newReq: LeaveRequest = {
      id,
      leaveType:     form.leaveType,
      startDate:     finalStartDate,
      endDate:       finalEndDate,
      days:          calculatedDays,
      hours:         form.unit === 'hours' ? form.hours : undefined,
      status:        'pending',
      submittedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      reason:        form.reason,
      approver:      'Manager',
      attachmentName: form.attachmentName || undefined
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
            <h2 className="elp-page-title">Time Off</h2>
            <span className="elp-header__sub">2026 leave year</span>
          </div>
          <div className="elp-header__actions">
            {showToggleAndConfig && (
              <>
                <div className="elp-view-toggle">
                  <button
                    type="button"
                    className={`elp-view-toggle__button ${activeView === 'self' ? 'elp-view-toggle__button--active' : ''}`}
                    onClick={() => {
                      setActiveView('self');
                      setConfigurationView(null);
                    }}
                  >
                    Self
                  </button>
                  <button
                    type="button"
                    className={`elp-view-toggle__button ${activeView === 'team' ? 'elp-view-toggle__button--active' : ''}`}
                    onClick={() => {
                      setActiveView('team');
                      setConfigurationView(null);
                    }}
                  >
                    Team
                  </button>
                </div>
                
                <div className="elp-config-dropdown-container" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`elp-config-button ${isConfigDropdownOpen ? 'elp-config-button--active' : ''}`}
                    onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
                  >
                    <Settings size={13} />
                    Configuration
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
                        Time Off Type
                      </button>
                      <button
                        type="button"
                        className="elp-config-dropdown-item"
                        onClick={() => {
                          setConfigurationView('policies');
                          setIsConfigDropdownOpen(false);
                        }}
                      >
                        Time Off Policy
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
              </>
            )}

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
                      <span className="elp-request-row__days">· {req.hours ? `${req.hours}h` : `${req.days}d`}</span>
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
                  <td>{entry.hours ? `${entry.hours}h` : `${entry.days}d`}</td>
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
                <strong>{teamLeaves.filter(item => item.status === 'pending').length}</strong>
              </div>
            </div>

            {/* Card 1: Team Time Off */}
            <div className="elp-history-panel era-panel">
              <div className="elp-section-head">
                <span className="elp-section-title">
                  <Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                  Team Time Off
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>Approved and historical team leaves</span>
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
                  {teamLeaves.filter(t => t.status !== 'pending').length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'var(--nexus-text-muted)', fontSize: '0.78rem' }}>
                        No approved or historical leaves.
                      </td>
                    </tr>
                  ) : (
                    teamLeaves.filter(t => t.status !== 'pending').map(entry => (
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
                        <td>{(entry as any).hours ? `${(entry as any).hours}h` : `${entry.days}d`}</td>
                        <td>
                          <span className={`era-status-badge era-status-badge--${entry.status}`}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Card 2: Leave Requests */}
            <div className="elp-history-panel era-panel" style={{ marginTop: '1.125rem' }}>
              <div className="elp-section-head">
                <span className="elp-section-title">
                  <ClipboardList size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />
                  Leave Requests
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-text-muted)' }}>Click request to review on the right side</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {teamLeaves.filter(t => t.status === 'pending').length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--nexus-text-muted)', fontSize: '0.78rem' }}>
                    No pending leave requests.
                  </div>
                ) : (
                  teamLeaves.filter(t => t.status === 'pending').map(req => (
                    <button
                      type="button"
                      key={req.id}
                      onClick={() => setSelectedTeamLeaveId(req.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '1rem',
                        textAlign: 'left',
                        border: selectedTeamLeaveId === req.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                        borderRadius: '12px',
                        background: selectedTeamLeaveId === req.id ? 'var(--surface-muted)' : 'var(--surface-panel)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-h)' }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'var(--accent)', color: '#fff',
                            fontSize: '0.65rem', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>{req.initials}</span>
                          {req.name}
                        </span>
                        <span className="era-status-badge era-status-badge--pending">Pending</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--nexus-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{req.leaveType} Leave · {req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`}</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-h)' }}>{req.days}d</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ── Slideover Details Drawer ── */}
        {selectedTeamLeave && (
          <div className="org-slideover-backdrop" onClick={() => setSelectedTeamLeaveId(null)}>
            <aside
              className="org-slideover"
              role="dialog"
              aria-modal="true"
              onClick={event => event.stopPropagation()}
              style={{ width: '400px', display: 'flex', flexDirection: 'column' }}
            >
              <header className="org-slideover__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-h)' }}>Leave Request Details</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--nexus-text-muted)' }}>Review employee request</p>
                </div>
                <button
                  type="button"
                  className="org-slideover__close"
                  onClick={() => setSelectedTeamLeaveId(null)}
                  aria-label="Close details"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--nexus-text-muted)', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </header>
              
              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--accent)', color: '#fff',
                    fontSize: '0.9rem', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {selectedTeamLeave.initials}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-h)' }}>{selectedTeamLeave.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--nexus-text-muted)' }}>Direct Report</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--surface-muted)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--nexus-text-muted)' }}>Leave Type:</span>
                    <strong style={{ color: 'var(--text-h)' }}>{selectedTeamLeave.leaveType} Leave</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--nexus-text-muted)' }}>Duration:</span>
                    <strong style={{ color: 'var(--text-h)' }}>
                      {selectedTeamLeave.startDate === selectedTeamLeave.endDate
                        ? selectedTeamLeave.startDate
                        : `${selectedTeamLeave.startDate} – ${selectedTeamLeave.endDate}`}
                    </strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--nexus-text-muted)' }}>Total:</span>
                    <strong style={{ color: 'var(--text-h)' }}>
                      {(selectedTeamLeave as any).hours ? `${(selectedTeamLeave as any).hours}h` : `${selectedTeamLeave.days}d`}
                    </strong>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--nexus-text-muted)' }}>Status:</span>
                    <span className="era-status-badge era-status-badge--pending" style={{ textTransform: 'capitalize' }}>
                      {selectedTeamLeave.status}
                    </span>
                  </p>
                </div>
              </div>

              {selectedTeamLeave.status === 'pending' && (
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="era-btn era-btn--primary"
                    style={{ flex: 1, height: '38px' }}
                    onClick={() => {
                      handleApproveTeamLeave(selectedTeamLeave.id);
                      setSelectedTeamLeaveId(null);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="era-btn era-btn--ghost"
                    style={{ flex: 1, height: '38px', border: '1px solid var(--border)' }}
                    onClick={() => {
                      handleRejectTeamLeave(selectedTeamLeave.id);
                      setSelectedTeamLeaveId(null);
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </aside>
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
              <div className="elp-field">
                <span className="elp-field__label">Leave Mode</span>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.375rem', alignItems: 'center' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-h)' }}>
                    <input
                      type="radio"
                      name="leaveUnit"
                      checked={form.unit === 'days'}
                      onChange={() => patchForm({ unit: 'days' })}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                    />
                    Days
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-h)' }}>
                    <input
                      type="radio"
                      name="leaveUnit"
                      checked={form.unit === 'hours'}
                      onChange={() => patchForm({ unit: 'hours' })}
                      style={{ cursor: 'pointer', accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                    />
                    Hours
                  </label>
                </div>
              </div>
              {form.unit === 'days' ? (
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
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div className="elp-field-row" style={{ alignItems: 'flex-end', position: 'relative', gap: '0.75rem', gridTemplateColumns: hasConflict ? '1fr auto' : '1fr' }}>
                    <label className="elp-field" style={{ flex: 1 }}>
                      <span className="elp-field__label">Date</span>
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
                  <div className="elp-field-row" style={{ gap: '0.75rem' }}>
                    <label className="elp-field" style={{ flex: 1 }}>
                      <span className="elp-field__label">Start Time</span>
                      <input
                        type="time"
                        className="elp-field__input"
                        value={form.startTime}
                        onChange={e => patchForm({ startTime: e.target.value })}
                        required
                      />
                    </label>
                    <label className="elp-field" style={{ flex: 1 }}>
                      <span className="elp-field__label">End Time</span>
                      <input
                        type="time"
                        className="elp-field__input"
                        value={form.endTime}
                        onChange={e => patchForm({ endTime: e.target.value })}
                        required
                      />
                    </label>
                  </div>
                  <label className="elp-field">
                    <span className="elp-field__label">Total Hours</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="elp-field__input"
                      value={form.hours}
                      onChange={e => patchForm({ hours: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </label>
                </div>
              )}
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
