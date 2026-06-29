import React, { useState, useEffect } from 'react';
import { Laptop, Building2, X, ClipboardList, Users, Settings } from 'lucide-react';
import {
  attendanceClockStatus,
  attendanceWorkHours,
  attendanceWeeklyPattern,
  attendanceWeeklyPatternTotals
} from '../../data/attendance-tab.mock';
import { useInbox } from '../../../../core/notifications/inbox-context';
import { useEmployeeContext } from '../../context/employee-context';
import { ClockInPolicyPage } from '../../../time-attendance/clock-in-policy/ClockInPolicyPage';
import {
  AttendanceCorrectionReviewPanel,
  type AttendanceCorrectionRequest
} from './attendance-correction-review-panel';

/* ─── Local attendance log mock ─── */


interface AttendanceLogEntry {
  id: string; date: string; day: string; isoDate: string;
  clockIn: string; clockOut: string; hours: string;
  mode: 'Office' | 'Remote'; status: 'on-time' | 'late';
}

const ATTENDANCE_LOG: AttendanceLogEntry[] = [
  { id: 'al-1', date: 'Jun 17', day: 'Tue', isoDate: '2026-06-17', clockIn: '9:15 AM', clockOut: '6:03 PM', hours: '8h 48m', mode: 'Office', status: 'on-time' },
  { id: 'al-2', date: 'Jun 16', day: 'Mon', isoDate: '2026-06-16', clockIn: '9:08 AM', clockOut: '6:00 PM', hours: '8h 52m', mode: 'Remote', status: 'on-time' },
  { id: 'al-3', date: 'Jun 13', day: 'Fri', isoDate: '2026-06-13', clockIn: '9:30 AM', clockOut: '5:45 PM', hours: '8h 15m', mode: 'Office', status: 'late'    },
  { id: 'al-4', date: 'Jun 12', day: 'Thu', isoDate: '2026-06-12', clockIn: '9:00 AM', clockOut: '6:05 PM', hours: '9h 05m', mode: 'Office', status: 'on-time' },
  { id: 'al-5', date: 'Jun 11', day: 'Wed', isoDate: '2026-06-11', clockIn: '9:20 AM', clockOut: '5:50 PM', hours: '8h 30m', mode: 'Remote', status: 'on-time' },
  { id: 'al-6', date: 'Jun 10', day: 'Tue', isoDate: '2026-06-10', clockIn: '9:10 AM', clockOut: '6:00 PM', hours: '8h 50m', mode: 'Office', status: 'on-time' }
];

const SEED_CORRECTIONS: AttendanceCorrectionRequest[] = [
  {
    id: 'cor-1',
    date: '2026-06-05',
    requestedIn: '08:45',
    requestedOut: '18:15',
    reason: 'System outage at clock-in',
    status: 'pending',
    approver: 'HR',
    submittedDate: 'Jun 6',
    employeeId: 'alex',
    employeeName: 'Alexander Pierce',
    employeeInitials: 'AP'
  },
  {
    id: 'cor-2',
    date: '2026-05-28',
    requestedIn: '09:00',
    requestedOut: '18:00',
    reason: 'Forgot to clock out',
    status: 'approved',
    approver: 'HR',
    submittedDate: 'May 29',
    employeeId: 'alex',
    employeeName: 'Alexander Pierce',
    employeeInitials: 'AP'
  },
  {
    id: 'cor-3',
    date: '2026-05-12',
    requestedIn: '08:30',
    requestedOut: '17:45',
    reason: 'Badge reader offline',
    status: 'rejected',
    approver: 'HR',
    submittedDate: 'May 13',
    employeeId: 'alex',
    employeeName: 'Alexander Pierce',
    employeeInitials: 'AP'
  }
];

/* ─── Team mock (manager view) ─── */
interface TeamAttendanceEntry {
  id: string; name: string; initials: string; date: string;
  clockIn: string; clockOut: string; hours: string;
  mode: 'Office' | 'Remote'; status: 'on-time' | 'late';
}

const TEAM_ATTENDANCE: TeamAttendanceEntry[] = [
  { id: 'ta-1', name: 'Alexander Pierce', initials: 'AP', date: 'Jun 17', clockIn: '9:10 AM', clockOut: '6:00 PM', hours: '8h 50m', mode: 'Office', status: 'on-time' },
  { id: 'ta-2', name: 'Jordan Kim',       initials: 'JK', date: 'Jun 17', clockIn: '9:40 AM', clockOut: '5:55 PM', hours: '8h 15m', mode: 'Remote', status: 'late'    },
];

/* ─── Form state ─── */
interface CorrForm { date: string; actualIn: string; actualOut: string; reason: string }

const DEFAULT_CORR: CorrForm = { date: '', actualIn: '', actualOut: '', reason: '' };

const STATUS_LABEL: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

function to24h(time: string): string {
  const [tp, period] = time.split(' ');
  const [h, m] = tp.split(':').map(Number);
  const hours = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ─── Component ─── */

export const EmployeeAttendance: React.FC = () => {
  const { addInboxItem } = useInbox();
  const { selectedEmployee } = useEmployeeContext();

  const [corrections,   setCorrections]   = useState<AttendanceCorrectionRequest[]>(() => {
    const saved = localStorage.getItem('attendance_corrections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_CORRECTIONS;
      }
    }
    return SEED_CORRECTIONS;
  });

  useEffect(() => {
    localStorage.setItem('attendance_corrections', JSON.stringify(corrections));
  }, [corrections]);

  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const selectedReq = corrections.find(r => r.id === selectedReqId);

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    setCorrections(prev => prev.map(req => {
      if (req.id === requestId) {
        if (req.employeeId) {
          addInboxItem({
            id: `corr-action-${action}-${requestId}-${Date.now()}`,
            recipientId: req.employeeId,
            category: 'approval',
            title: `Correction Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your correction request for ${req.date} has been ${action}.`,
            timeLabel: 'Just now',
            filter: 'new',
            actions: [{ id: 'dismiss', label: 'Dismiss', variant: 'secondary' }]
          });
        }
        return { ...req, status: action };
      }
      return req;
    }));
  };

  const [corrModalOpen, setCorrModalOpen] = useState(false);
  const [corrForm,      setCorrForm]      = useState<CorrForm>(DEFAULT_CORR);

  // Toggle & Config state
  const [activeToggle, setActiveToggle] = useState<'self' | 'team'>('self');
  const [showPolicy, setShowPolicy] = useState(false);

  const showToggleAndConfig = selectedEmployee.id !== 'alex';

  const patchCorr = (p: Partial<CorrForm>) => setCorrForm(f => ({ ...f, ...p }));

  // Retrieve active clock-in session details to display formatted live time matching the navbar session duration
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [effectiveClockInTime, setEffectiveClockInTime] = useState<number | null>(null);
  const [liveHoursStr, setLiveHoursStr] = useState('0s');
  const [livePercent, setLivePercent] = useState(0);

  const formatClockInTime = (timestamp: number | null) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  useEffect(() => {
    const storageKeyStatus = `clock_in_status_${selectedEmployee.id}`;
    const storageKeyTime = `clock_in_time_${selectedEmployee.id}`;

    const updateState = () => {
      const active = localStorage.getItem(storageKeyStatus) === 'true';
      const timeVal = localStorage.getItem(storageKeyTime);
      const parsedTime = timeVal ? parseInt(timeVal, 10) : null;
      setIsClockedIn(active);

      if (active && parsedTime) {
        setEffectiveClockInTime(parsedTime);
        const diffMs = Date.now() - parsedTime;
        const elapsedSecs = Math.max(0, Math.floor(diffMs / 1000));
        
        let displayStr: string;
        const hrs = Math.floor(elapsedSecs / 3600);
        const mins = Math.floor((elapsedSecs % 3600) / 60);
        const secs = elapsedSecs % 60;

        if (hrs > 0) {
          displayStr = `${hrs}h ${mins}m`;
        } else if (mins > 0) {
          displayStr = `${mins}m ${secs}s`;
        } else {
          displayStr = `${secs}s`;
        }

        setLiveHoursStr(displayStr);
        const expectedSeconds = 28800; // 8h
        const percent = Math.min(100, Math.round((elapsedSecs / expectedSeconds) * 100));
        setLivePercent(percent);
      } else {
        const lastTimeVal = localStorage.getItem(`last_clock_in_time_${selectedEmployee.id}`);
        const lastElapsedVal = localStorage.getItem(`last_elapsed_secs_${selectedEmployee.id}`);
        
        if (lastTimeVal) {
          setEffectiveClockInTime(parseInt(lastTimeVal, 10));
        } else {
          setEffectiveClockInTime(null);
        }

        if (lastElapsedVal) {
          const lastElapsedSecs = parseInt(lastElapsedVal, 10);
          let displayStr: string;
          const hrs = Math.floor(lastElapsedSecs / 3600);
          const mins = Math.floor((lastElapsedSecs % 3600) / 60);
          const secs = lastElapsedSecs % 60;

          if (hrs > 0) {
            displayStr = `${hrs}h ${mins}m`;
          } else if (mins > 0) {
            displayStr = `${mins}m ${secs}s`;
          } else {
            displayStr = `${secs}s`;
          }

          setLiveHoursStr(displayStr);
          const expectedSeconds = 28800; // 8h
          const percent = Math.min(100, Math.round((lastElapsedSecs / expectedSeconds) * 100));
          setLivePercent(percent);
        } else {
          setLiveHoursStr(attendanceWorkHours.completed);
          setLivePercent(attendanceWorkHours.completedPercent);
        }
      }
    };

    updateState();
    const interval = setInterval(updateState, 1000);

    const handleClockInChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.employeeId === selectedEmployee.id) {
        setIsClockedIn(customEvent.detail.isClockedIn);
      } else {
        updateState();
      }
    };

    window.addEventListener('clock_in_change', handleClockInChange);
    window.addEventListener('storage', updateState);

    return () => {
      clearInterval(interval);
      window.removeEventListener('clock_in_change', handleClockInChange);
      window.removeEventListener('storage', updateState);
    };
  }, [selectedEmployee.id]);





  const openCorrectionForRow = (entry: AttendanceLogEntry) => {
    setCorrForm({ date: entry.isoDate, actualIn: to24h(entry.clockIn), actualOut: to24h(entry.clockOut), reason: '' });
    setCorrModalOpen(true);
  };

  const handleCorrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cor-${Date.now()}`;
    setCorrections(prev => [{
      id, date: corrForm.date, requestedIn: corrForm.actualIn,
      requestedOut: corrForm.actualOut, reason: corrForm.reason,
      status: 'pending', approver: 'HR',
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeInitials: selectedEmployee.avatar
    }, ...prev]);

    addInboxItem({
      id: `corr-submitted-${id}`, recipientId: selectedEmployee.id,
      category: 'approval', title: 'Attendance correction submitted',
      message: `Your correction request for ${corrForm.date} is pending review.`,
      timeLabel: 'Just now', filter: 'new',
      actions: [{ id: 'dismiss', label: 'Dismiss', variant: 'secondary' }]
    });

    const reviewerIds = ['manager', 'marcus'];
    reviewerIds.forEach(revId => {
      if (revId !== selectedEmployee.id) {
        addInboxItem({
          id: `corr-notify-${revId}-${id}`,
          recipientId: revId,
          category: 'approval',
          title: 'Attendance Correction Request',
          message: `${selectedEmployee.name} requested correction for ${corrForm.date}.`,
          timeLabel: 'Just now',
          filter: 'new',
          actions: [{ id: 'view', label: 'View', variant: 'secondary' }]
        });
      }
    });

    setCorrModalOpen(false);
    setCorrForm(DEFAULT_CORR);
  };

  const handleConfigClick = () => {
    setShowPolicy(true);
  };

  if (showPolicy) {
    return <ClockInPolicyPage onBack={() => setShowPolicy(false)} />;
  }

  return (
    <div className="content-card">
      <div className="eap-root">

        {/* ── Header ── */}
        <div className="eap-header">
          <div className="eap-header__title">
            <h2 className="eap-page-title">Time Tracking</h2>
            <span className="eap-header__sub">Jun 2026</span>
          </div>
          <div className="eap-header__actions">
            {showToggleAndConfig && (
              <div className="eap-header-actions-wrapper">
                <div className="eap-segmented-toggle">
                  <button
                    type="button"
                    className={`eap-segmented-btn ${activeToggle === 'self' ? 'eap-segmented-btn--active' : ''}`}
                    onClick={() => setActiveToggle('self')}
                  >
                    Self
                  </button>
                  <button
                    type="button"
                    className={`eap-segmented-btn ${activeToggle === 'team' ? 'eap-segmented-btn--active' : ''}`}
                    onClick={() => setActiveToggle('team')}
                  >
                    Team
                  </button>
                </div>
                <button
                  type="button"
                  className="eap-config-btn"
                  onClick={handleConfigClick}
                  title="Configure Time Tracking Settings"
                >
                  <Settings size={13} />
                  Configuration
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Conditional Rendering: Self vs Team ── */}
        {(!showToggleAndConfig || activeToggle === 'self') ? (
          <>
            {/* ── Today strip ── */}
            <div className="eap-today-strip">
              <div className="eap-today-card era-panel">
                <span className="eap-today-card__label">Status</span>
                <span className={`eap-today-card__value ${isClockedIn ? 'eap-today-card__value--success' : ''}`}>
                  {isClockedIn ? 'Working' : 'Clocked Out'}
                </span>
                <span className="eap-today-card__sub">{isClockedIn ? 'On time today' : 'Offline'}</span>
              </div>
              <div className="eap-today-card era-panel">
                <span className="eap-today-card__label">Clocked In</span>
                <span className="eap-today-card__value">
                  {effectiveClockInTime ? formatClockInTime(effectiveClockInTime) : attendanceClockStatus.clockIn}
                </span>
                <span className="eap-today-card__sub">
                  Target out {attendanceClockStatus.targetCheckout}
                </span>
              </div>
              <div className="eap-today-card era-panel">
                <span className="eap-today-card__label">Mode</span>
                <span className="eap-today-card__value">
                  {attendanceClockStatus.mode === 'Office' ? (
                    <><Building2 size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 3 }} />Office</>
                  ) : (
                    <><Laptop size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 3 }} />Remote</>
                  )}
                </span>
                <span className="eap-today-card__sub">Break taken: {attendanceClockStatus.breakTaken}</span>
              </div>
              <div className="eap-today-card era-panel">
                <span className="eap-today-card__label">Today's Hours</span>
                <span className="eap-today-card__value">{liveHoursStr}</span>
                <div className="eap-progress-wrap">
                  <div className="eap-progress-bar">
                    <div className="eap-progress-bar__fill" style={{ width: `${livePercent}%` }} />
                  </div>
                  <span className="eap-progress-label">{livePercent}% of {attendanceWorkHours.expected}</span>
                </div>
              </div>

            </div>

            {/* ── Main grid: log + weekly ── */}
            <div className="eap-main-grid">
              <div className="eap-panel era-panel">
                <div className="eap-section-head">
                  <span className="eap-section-title">Attendance Log</span>
                  <span className="eap-section-meta">Jun 2026</span>
                </div>
                <table className="eap-log-table">
                  <colgroup>
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '14%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ATTENDANCE_LOG.map(entry => (
                      <tr key={entry.id}>
                        <td className="eap-log-table__date">
                          {entry.date} <span style={{ color: 'var(--nexus-text-muted)', fontWeight: 400 }}>({entry.day})</span>
                        </td>
                        <td>{entry.clockIn}</td>
                        <td>{entry.clockOut}</td>
                        <td className="eap-log-table__hours">{entry.hours}</td>
                        <td>
                          <span className={`eap-mode-chip eap-mode-chip--${entry.mode.toLowerCase()}`}>
                            {entry.mode === 'Office' ? <Building2 size={10} /> : <Laptop size={10} />}
                            {entry.mode}
                          </span>
                        </td>
                        <td>
                          <span className={`eap-punct-chip eap-punct-chip--${entry.status}`}>
                            {entry.status === 'on-time' ? 'On time' : 'Late'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="era-btn era-btn--ghost"
                            style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', gap: '0.25rem' }}
                            onClick={() => openCorrectionForRow(entry)}
                            title="Request Correction"
                          >
                            <ClipboardList size={11} />
                            Correct
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="eap-panel era-panel">
                <div className="eap-section-head">
                  <span className="eap-section-title">This Week</span>
                  <span className="eap-section-meta">{attendanceWeeklyPatternTotals.summary}</span>
                </div>
                <div className="eap-week-list">
                  {attendanceWeeklyPattern.map(w => (
                    <div key={w.day} className="eap-week-row">
                      <span className="eap-week-row__day">{w.day}</span>
                      <div className="eap-week-row__mode">
                        <span className={`eap-mode-chip eap-mode-chip--${w.mode.toLowerCase()}`}>
                          {w.mode === 'Office' ? <Building2 size={10} /> : <Laptop size={10} />}
                          {w.mode}
                        </span>
                      </div>
                      <span className="eap-week-row__hours">{w.loggedHours}</span>
                    </div>
                  ))}
                </div>
                <div className="eap-week-totals">
                  <span className="eap-week-totals__label">Total hours</span>
                  <span className="eap-week-totals__value">{attendanceWeeklyPatternTotals.totalLabel}</span>
                </div>
              </div>
            </div>

            {/* ── Bottom grid: corrections ── */}
            <div className="eap-bottom-grid">
              <div className="eap-panel era-panel">
                <div className="eap-section-head">
                  <span className="eap-section-title">Correction Requests</span>
                </div>
                <div className="eap-req-list">
                  {corrections.length === 0 && <div className="eap-empty">No correction requests.</div>}
                  {corrections.map(req => (
                    <div key={req.id} className="eap-req-row">
                      <div className="eap-req-row__icon"><ClipboardList size={13} /></div>
                      <div className="eap-req-row__main">
                        <div className="eap-req-row__top">
                          <span className="eap-req-row__label">Correction · {req.date}</span>
                          <span className={`era-status-badge era-status-badge--${req.status}`}>{STATUS_LABEL[req.status]}</span>
                        </div>
                        <div className="eap-req-row__meta">
                          {req.requestedIn} → {req.requestedOut}
                          <span className="eap-dot" /> With {req.approver}
                          {req.reason && <><span className="eap-dot" />{req.reason}</>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ── Team attendance view ── */
          <div className="eap-team-container">
            <div className="eap-team-main-content">
              {/* Card 1: Team Attendance */}
              <div className="eap-panel era-panel">
                <div className="eap-section-head">
                  <span className="eap-section-title"><Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />Team Attendance — Today</span>
                  <span className="eap-section-meta">Jun 17</span>
                </div>
                <table className="eap-log-table">
                  <colgroup>
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_ATTENDANCE.map(entry => (
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
                        <td>{entry.clockIn}</td>
                        <td>{entry.clockOut}</td>
                        <td className="eap-log-table__hours">{entry.hours}</td>
                        <td>
                          <span className={`eap-mode-chip eap-mode-chip--${entry.mode.toLowerCase()}`}>
                            {entry.mode === 'Office' ? <Building2 size={10} /> : <Laptop size={10} />}
                            {entry.mode}
                          </span>
                        </td>
                        <td>
                          <span className={`eap-punct-chip eap-punct-chip--${entry.status}`}>
                            {entry.status === 'on-time' ? 'On time' : 'Late'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card 2: Correction Requests (Request correct) */}
              <div className="eap-panel era-panel">
                <div className="eap-section-head">
                  <span className="eap-section-title">Request correct</span>
                </div>
                <div className="eap-req-list">
                  {corrections.length === 0 && <div className="eap-empty">No correction requests.</div>}
                  {corrections.map(req => {
                    const initials = req.employeeInitials || '??';
                    return (
                      <button
                        type="button"
                        key={req.id}
                        className={`eap-req-row clickable ${selectedReqId === req.id ? 'active' : ''}`}
                        onClick={() => setSelectedReqId(req.id)}
                        aria-label={`Review attendance correction request from ${req.employeeName ?? 'employee'} for ${req.date}`}
                      >
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--accent)', color: '#fff',
                            fontSize: '0.65rem', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>{initials}</span>
                          <div className="eap-req-row__main" style={{ flex: 1, minWidth: 0 }}>
                            <div className="eap-req-row__top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <span className="eap-req-row__label" style={{ fontWeight: 600, fontSize: '0.78rem' }}>{req.employeeName || 'Employee'}</span>
                              <span className={`era-status-badge era-status-badge--${req.status}`}>{STATUS_LABEL[req.status]}</span>
                            </div>
                            <div className="eap-req-row__meta" style={{ fontSize: '0.7rem', color: 'var(--nexus-text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span>Date: {req.date}</span>
                              <span className="eap-dot"></span>
                              <span>{req.requestedIn} → {req.requestedOut}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}


      </div>

      {/* ── Correction modal ── */}
      {selectedReq && (
        <AttendanceCorrectionReviewPanel
          requests={corrections}
          focusedRequestId={selectedReqId}
          onClose={() => setSelectedReqId(null)}
          onAction={handleRequestAction}
        />
      )}

      {corrModalOpen && (
        <div className="eap-modal-overlay" onClick={() => setCorrModalOpen(false)}>
          <div className="eap-modal" onClick={e => e.stopPropagation()}>
            <div className="eap-modal__head">
              <span className="eap-modal__title">Request Attendance Correction</span>
              <button type="button" className="eap-modal__close" onClick={() => setCorrModalOpen(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <form className="eap-modal__form" onSubmit={handleCorrSubmit}>
              <label className="eap-field">
                <span className="eap-field__label">Date to Correct</span>
                <input type="date" className="eap-field__input" value={corrForm.date} onChange={e => patchCorr({ date: e.target.value })} required />
              </label>
              <div className="eap-field-row">
                <label className="eap-field">
                  <span className="eap-field__label">Actual Clock In</span>
                  <input type="time" className="eap-field__input" value={corrForm.actualIn} onChange={e => patchCorr({ actualIn: e.target.value })} required />
                </label>
                <label className="eap-field">
                  <span className="eap-field__label">Actual Clock Out</span>
                  <input type="time" className="eap-field__input" value={corrForm.actualOut} onChange={e => patchCorr({ actualOut: e.target.value })} required />
                </label>
              </div>
              <label className="eap-field">
                <span className="eap-field__label">Reason for Correction</span>
                <textarea className="eap-field__input eap-field__textarea" value={corrForm.reason} onChange={e => patchCorr({ reason: e.target.value })} placeholder="Describe what happened (e.g., system outage, forgot to clock in)…" rows={3} required />
              </label>
              <div className="eap-modal__actions">
                <button type="button" className="era-btn era-btn--ghost" onClick={() => setCorrModalOpen(false)}>Cancel</button>
                <button type="submit" className="era-btn era-btn--primary">Submit Correction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
