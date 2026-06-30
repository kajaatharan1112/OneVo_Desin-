import React, { useState } from 'react';
import { Clock, Timer, Laptop, Building2, X, Activity, ClipboardList, Users } from 'lucide-react';
import {
  attendanceClockStatus,
  attendanceWorkHours,
  attendanceWeeklyPattern,
  attendanceWeeklyPatternTotals
} from '../../data/attendance-tab.mock';
import { useInbox, INBOX_CURRENT_USER } from '../../../../core/notifications/inbox-context';
import { useEmployeeContext } from '../../context/employee-context';

/* ─── Local attendance log mock ─── */

interface AttendanceLogEntry {
  id: string; date: string; day: string; isoDate: string;
  clockIn: string; clockOut: string; hours: string;
  mode: 'Office' | 'Remote'; status: 'on-time' | 'late';
  timeOff?: string;
}

const ATTENDANCE_LOG: AttendanceLogEntry[] = [
  { id: 'al-1', date: 'Jun 17', day: 'Tue', isoDate: '2026-06-17', clockIn: '9:15 AM', clockOut: '6:03 PM', hours: '8h 48m', mode: 'Office', status: 'on-time', timeOff: '—' },
  { id: 'al-2', date: 'Jun 16', day: 'Mon', isoDate: '2026-06-16', clockIn: '9:08 AM', clockOut: '6:00 PM', hours: '8h 52m', mode: 'Remote', status: 'on-time', timeOff: '—' },
  { id: 'al-leave', date: 'Jun 15', day: 'Sun', isoDate: '2026-06-15', clockIn: '—', clockOut: '—', hours: '0h', mode: 'Remote', status: 'on-time', timeOff: 'Annual Leave' },
  { id: 'al-3', date: 'Jun 13', day: 'Fri', isoDate: '2026-06-13', clockIn: '9:30 AM', clockOut: '5:45 PM', hours: '8h 15m', mode: 'Office', status: 'late',    timeOff: '—' },
  { id: 'al-4', date: 'Jun 12', day: 'Thu', isoDate: '2026-06-12', clockIn: '9:00 AM', clockOut: '6:05 PM', hours: '9h 05m', mode: 'Office', status: 'on-time', timeOff: '—' },
  { id: 'al-5', date: 'Jun 11', day: 'Wed', isoDate: '2026-06-11', clockIn: '9:20 AM', clockOut: '5:50 PM', hours: '8h 30m', mode: 'Remote', status: 'on-time', timeOff: '—' },
  { id: 'al-6', date: 'Jun 10', day: 'Tue', isoDate: '2026-06-10', clockIn: '9:10 AM', clockOut: '6:00 PM', hours: '8h 50m', mode: 'Office', status: 'on-time', timeOff: '—' }
];

interface OvertimeRequest {
  id: string; date: string; extraHours: string; reason: string;
  status: 'pending' | 'approved' | 'rejected'; submittedDate: string;
}

const SEED_OT: OvertimeRequest[] = [
  { id: 'ot-1', date: 'Jun 13', extraHours: '2h', reason: 'Sprint deadline', status: 'pending', submittedDate: 'Jun 14' }
];

interface CorrectionRequest {
  id: string; date: string; requestedIn: string; requestedOut: string;
  reason: string; status: 'pending' | 'approved' | 'rejected'; approver: string; submittedDate: string;
}

const SEED_CORRECTIONS: CorrectionRequest[] = [
  { id: 'cor-1', date: 'Jun 5', requestedIn: '8:45 AM', requestedOut: '6:15 PM', reason: 'System outage at clock-in', status: 'pending', approver: 'HR', submittedDate: 'Jun 6' }
];

const EMPLOYEE_LEAVES: Record<string, { balance: string; nextLeave: string }> = {
  alex: { balance: '24 Days Left', nextLeave: 'Jun 20 - 23 (Annual)' },
  manager: { balance: '18 Days Left', nextLeave: 'Jul 2 - 3 (Casual)' },
  marcus: { balance: '32 Days Left', nextLeave: 'Aug 12 - 15 (Annual)' },
};

/* ─── Team mock (manager view) ─── */
interface TeamAttendanceEntry {
  id: string; name: string; initials: string; date: string;
  clockIn: string; clockOut: string; hours: string;
  mode: 'Office' | 'Remote'; status: 'on-time' | 'late';
  timeOff?: string;
}

const TEAM_ATTENDANCE: TeamAttendanceEntry[] = [
  { id: 'ta-1', name: 'Alexander Pierce', initials: 'AP', date: 'Jun 17', clockIn: '9:10 AM', clockOut: '6:00 PM', hours: '8h 50m', mode: 'Office', status: 'on-time', timeOff: 'Jun 20 - 23 (Annual)' },
  { id: 'ta-2', name: 'Jordan Kim',       initials: 'JK', date: 'Jun 17', clockIn: '9:40 AM', clockOut: '5:55 PM', hours: '8h 15m', mode: 'Remote', status: 'late',    timeOff: 'Jun 18 (Sick)' },
];

/* ─── Form state ─── */
interface OTForm   { date: string; startTime: string; endTime: string; reason: string }
interface CorrForm { date: string; actualIn: string; actualOut: string; reason: string }

const DEFAULT_OT:   OTForm   = { date: '', startTime: '', endTime: '', reason: '' };
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
  const isManager = selectedEmployee.id === 'manager';

  const [otRequests,    setOtRequests]    = useState<OvertimeRequest[]>(SEED_OT);
  const [corrections,   setCorrections]   = useState<CorrectionRequest[]>(SEED_CORRECTIONS);
  const [otModalOpen,   setOtModalOpen]   = useState(false);
  const [corrModalOpen, setCorrModalOpen] = useState(false);
  const [otForm,        setOtForm]        = useState<OTForm>(DEFAULT_OT);
  const [corrForm,      setCorrForm]      = useState<CorrForm>(DEFAULT_CORR);

  const patchOT   = (p: Partial<OTForm>)   => setOtForm(f   => ({ ...f, ...p }));
  const patchCorr = (p: Partial<CorrForm>) => setCorrForm(f => ({ ...f, ...p }));

  const openCorrectionForRow = (entry: AttendanceLogEntry) => {
    setCorrForm({ date: entry.isoDate, actualIn: to24h(entry.clockIn), actualOut: to24h(entry.clockOut), reason: '' });
    setCorrModalOpen(true);
  };

  const handleOTSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ot-${Date.now()}`;
    setOtRequests(prev => [{
      id, date: otForm.date, extraHours: '–', reason: otForm.reason,
      status: 'pending',
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }, ...prev]);
    addInboxItem({
      id: `ot-submitted-${id}`, recipientId: INBOX_CURRENT_USER,
      category: 'approval', title: 'Overtime request submitted',
      message: `Your overtime request for ${otForm.date} is pending review.`,
      timeLabel: 'Just now', filter: 'new',
      actions: [{ id: 'view', label: 'View', variant: 'secondary' }],
      attendanceMeta: { requestId: id, type: 'overtime' }
    });
    setOtModalOpen(false);
    setOtForm(DEFAULT_OT);
  };

  const handleCorrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cor-${Date.now()}`;
    setCorrections(prev => [{
      id, date: corrForm.date, requestedIn: corrForm.actualIn,
      requestedOut: corrForm.actualOut, reason: corrForm.reason,
      status: 'pending', approver: 'HR',
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }, ...prev]);
    addInboxItem({
      id: `corr-submitted-${id}`, recipientId: INBOX_CURRENT_USER,
      category: 'approval', title: 'Attendance correction submitted',
      message: `Your correction request for ${corrForm.date} is pending HR review.`,
      timeLabel: 'Just now', filter: 'new',
      actions: [{ id: 'view', label: 'View', variant: 'secondary' }],
      attendanceMeta: { requestId: id, type: 'correction' }
    });
    setCorrModalOpen(false);
    setCorrForm(DEFAULT_CORR);
  };

  return (
    <div className="content-card">
      <div className="eap-root">

        {/* ── Header ── */}
        <div className="eap-header">
          <div className="eap-header__title">
            <h2 className="eap-page-title">Time &amp; Attendance</h2>
            <span className="eap-header__sub">Jun 2026</span>
          </div>
          <div className="eap-header__actions">
            <button type="button" className="era-btn era-btn--ghost" onClick={() => setOtModalOpen(true)}>
              <Activity size={13} />
              Request Overtime
            </button>
          </div>
        </div>

        {/* ── Today strip ── */}
        <div className="eap-today-strip">
          <div className="eap-today-card era-panel">
            <span className="eap-today-card__label">Status</span>
            <span className="eap-today-card__value eap-today-card__value--success">{attendanceClockStatus.currentStatus}</span>
            <span className="eap-today-card__sub">{attendanceClockStatus.punctuality === 'on-time' ? 'On time today' : 'Running late'}</span>
          </div>
          <div className="eap-today-card era-panel">
            <span className="eap-today-card__label">Clocked In</span>
            <span className="eap-today-card__value">{attendanceClockStatus.clockIn}</span>
            <span className="eap-today-card__sub">Target out {attendanceClockStatus.targetCheckout}</span>
          </div>
          <div className="eap-today-card era-panel">
            <span className="eap-today-card__label">Mode</span>
            <span className="eap-today-card__value">
              {attendanceClockStatus.mode === 'Office'
                ? <><Building2 size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 3 }} />Office</>
                : <><Laptop    size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 3 }} />Remote</>}
            </span>
            <span className="eap-today-card__sub">Break taken: {attendanceClockStatus.breakTaken}</span>
          </div>
          <div className="eap-today-card era-panel">
            <span className="eap-today-card__label">Today's Hours</span>
            <span className="eap-today-card__value">{attendanceWorkHours.completed}</span>
            <div className="eap-progress-wrap">
              <div className="eap-progress-bar">
                <div className="eap-progress-bar__fill" style={{ width: `${attendanceWorkHours.completedPercent}%` }} />
              </div>
              <span className="eap-progress-label">{attendanceWorkHours.completedPercent}% of {attendanceWorkHours.expected}</span>
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
                <table className="eap-log-table">
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '12%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Time Off</th>
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
                        <td style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)' }}>
                          {entry.timeOff || '—'}
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

        {/* ── Bottom grid: OT + corrections ── */}
        <div className="eap-bottom-grid">
          <div className="eap-panel era-panel">
            <div className="eap-section-head">
              <span className="eap-section-title">Overtime Requests</span>
              <button
                type="button"
                className="era-btn era-btn--ghost"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setOtModalOpen(true)}
              >
                <Activity size={11} /> New
              </button>
            </div>
            <div className="eap-req-list">
              {otRequests.length === 0 && <div className="eap-empty">No overtime requests.</div>}
              {otRequests.map(req => (
                <div key={req.id} className="eap-req-row">
                  <div className="eap-req-row__icon"><Timer size={13} /></div>
                  <div className="eap-req-row__main">
                    <div className="eap-req-row__top">
                      <span className="eap-req-row__label">Overtime · {req.date}</span>
                      <span className={`era-status-badge era-status-badge--${req.status}`}>{STATUS_LABEL[req.status]}</span>
                    </div>
                    <div className="eap-req-row__meta">
                      <Clock size={11} /> Submitted {req.submittedDate}
                      {req.reason && <><span className="eap-dot" />{req.reason}</>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

              </div>

              <div className="eap-panel era-panel">
                <div className="eap-section-head">
                  <span className="eap-section-title">Time Off & Leaves</span>
                  <span className="eap-section-meta">Balance</span>
                </div>
                <table className="eap-log-table">
                  <colgroup>
                    <col style={{ width: '35%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '35%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Used / Total</th>
                      <th>Next Scheduled</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Annual Leave</td>
                      <td>
                        {selectedEmployee.id === 'alex' ? '6 / 24 Days' : selectedEmployee.id === 'manager' ? '8 / 18 Days' : '4 / 32 Days'}
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)' }}>
                        {EMPLOYEE_LEAVES[selectedEmployee.id]?.nextLeave || '—'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Sick Leave</td>
                      <td>1 / 10 Days</td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)' }}>—</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Casual Leave</td>
                      <td>2 / 5 Days</td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)' }}>—</td>
                    </tr>
                  </tbody>
                </table>
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
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Hours</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Time Off</th>
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
                        <td style={{ fontSize: '0.72rem', color: 'var(--nexus-text-muted)' }}>
                          {entry.timeOff || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


        {/* ── Team attendance (manager only) ── */}
        {isManager && (
          <div className="eap-panel era-panel">
            <div className="eap-section-head">
              <span className="eap-section-title"><Users size={13} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} />Team Attendance — Today</span>
              <span className="eap-section-meta">Jun 17</span>
            </div>
            <table className="eap-log-table">
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
        )}

      </div>

      {/* ── Overtime modal ── */}
      {otModalOpen && (
        <div className="eap-modal-overlay" onClick={() => setOtModalOpen(false)}>
          <div className="eap-modal" onClick={e => e.stopPropagation()}>
            <div className="eap-modal__head">
              <span className="eap-modal__title">Request Overtime</span>
              <button type="button" className="eap-modal__close" onClick={() => setOtModalOpen(false)} aria-label="Close"><X size={15} /></button>
            </div>
            <form className="eap-modal__form" onSubmit={handleOTSubmit}>
              <label className="eap-field">
                <span className="eap-field__label">Date</span>
                <input type="date" className="eap-field__input" value={otForm.date} onChange={e => patchOT({ date: e.target.value })} required />
              </label>
              <div className="eap-field-row">
                <label className="eap-field">
                  <span className="eap-field__label">Start Time</span>
                  <input type="time" className="eap-field__input" value={otForm.startTime} onChange={e => patchOT({ startTime: e.target.value })} required />
                </label>
                <label className="eap-field">
                  <span className="eap-field__label">End Time</span>
                  <input type="time" className="eap-field__input" value={otForm.endTime} onChange={e => patchOT({ endTime: e.target.value })} required />
                </label>
              </div>
              <label className="eap-field">
                <span className="eap-field__label">Reason</span>
                <textarea className="eap-field__input eap-field__textarea" value={otForm.reason} onChange={e => patchOT({ reason: e.target.value })} placeholder="Why is overtime required?" rows={3} required />
              </label>
              <div className="eap-modal__actions">
                <button type="button" className="era-btn era-btn--ghost" onClick={() => setOtModalOpen(false)}>Cancel</button>
                <button type="submit" className="era-btn era-btn--primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Correction modal ── */}
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
