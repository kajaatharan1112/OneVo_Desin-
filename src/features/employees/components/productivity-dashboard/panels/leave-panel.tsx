import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, CheckCircle2, Clock4, XCircle, Plus, CalendarDays, User2 } from 'lucide-react';
import { useTheme } from '../../../../../core/theme/theme-context';
import type { LeaveRecord, LeaveSummary } from '../../../data/productivity-dashboard.data';

interface LeavePanelProps {
  summary: LeaveSummary;
  records: LeaveRecord[];
}

/* Blue/gray only — no green/amber/red */
const STATUS_COLOR: Record<LeaveRecord['status'], string> = {
  approved:  '#2563eb',
  pending:   '#64748b',
  rejected:  '#94a3b8',
  cancelled: '#cbd5e1'
};

const STATUS_ICON: Record<LeaveRecord['status'], React.ReactNode> = {
  approved:  <CheckCircle2 size={12} />,
  pending:   <Clock4 size={12} />,
  rejected:  <XCircle size={12} />,
  cancelled: <XCircle size={12} />
};

const PieTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  const s = payload[0];
  return (
    <div className="pd-leave-pie-tooltip">
      <span className="pd-leave-pie-tooltip__dot" style={{ background: s.payload.color }} />
      <span>{s.name} <strong>{s.value}d</strong></span>
    </div>
  );
};

const takenDays = (records: LeaveRecord[]) =>
  records.filter(r => !r.isFuture && r.status === 'approved').reduce((s, r) => s + r.days, 0);

export const LeavePanel: React.FC<LeavePanelProps> = ({ summary, records }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [view, setView] = useState<'past' | 'upcoming'>('past');

  const toggle = (id: string) => setExpandedId(p => p === id ? null : id);

  const pastLeaves     = records.filter(r => !r.isFuture);
  const upcomingLeaves = records.filter(r =>  r.isFuture);
  const displayed      = view === 'past' ? pastLeaves : upcomingLeaves;
  const taken          = takenDays(records);

  const pieData = [
    { name: 'Used',      value: summary.used,      color: isDark ? '#5b8df6' : '#2563eb' },
    { name: 'Pending',   value: summary.pending,   color: isDark ? '#94a3b8' : '#64748b' },
    { name: 'Remaining', value: summary.remaining, color: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0' }
  ];

  return (
    <div className="pd-panel pd-panel--leave" role="region" aria-label="Leave details">

      {/* ═══ LEFT HALF — pie, zero padding, edge-to-edge ═══ */}
      <div className="pd-leave-pie-half">
        <div
          className="pd-leave-pie-wrap"
          role="img"
          aria-label={`${summary.used} of ${summary.totalEntitlement} leave days used`}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius="52%"
                outerRadius="74%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                stroke="none"
                strokeWidth={0}
                cornerRadius={5}
                isAnimationActive={false}
              >
                {pieData.map(seg => <Cell key={seg.name} fill={seg.color} />)}
              </Pie>
              <Tooltip content={<PieTooltip />} wrapperStyle={{ zIndex: 10 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pd-leave-pie__center" aria-hidden="true">
            <span className="pd-leave-pie__num">{summary.used}</span>
            <span className="pd-leave-pie__lbl">of {summary.totalEntitlement}</span>
            <span className="pd-leave-pie__sub">days used</span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT HALF — list, its own padding ═══ */}
      <div className="pd-leave-list-half">

        {/* Header */}
        <div className="pd-leave-list-head">
          <span className="pd-leave-list-title">Leave</span>
          <button type="button" className="pd-btn pd-btn--primary pd-btn--xs" aria-label="Apply for leave">
            <Plus size={11} aria-hidden="true" />
            Apply leave
          </button>
        </div>

        {/* Summary meta */}
        <div className="pd-leave-list-meta">
          <CalendarDays size={11} aria-hidden="true" />
          <span>
            <strong>{pastLeaves.length} leaves</strong> · <strong>{taken}d</strong> of {summary.totalEntitlement}d used
          </span>
        </div>

        {/* Toggle */}
        <div className="pd-leave-toggle" role="tablist" aria-label="Leave period filter">
          <button
            type="button" role="tab"
            aria-selected={view === 'past'}
            className={`pd-leave-toggle__btn${view === 'past' ? ' pd-leave-toggle__btn--active' : ''}`}
            onClick={() => setView('past')}
          >
            Past ({pastLeaves.length})
          </button>
          <button
            type="button" role="tab"
            aria-selected={view === 'upcoming'}
            className={`pd-leave-toggle__btn${view === 'upcoming' ? ' pd-leave-toggle__btn--active' : ''}`}
            onClick={() => setView('upcoming')}
          >
            Upcoming
            {upcomingLeaves.length > 0 && (
              <span className="pd-leave-toggle__count">{upcomingLeaves.length}</span>
            )}
          </button>
        </div>

        {/* List */}
        <ul className="pd-list pd-leave-list" aria-label={`${view} leaves`}>
          {displayed.length === 0 && (
            <li className="pd-leave-empty">No {view} leaves</li>
          )}
          {displayed.map(rec => {
            const isOpen = expandedId === rec.id;
            return (
              <li key={rec.id} className={`pd-leave-item${isOpen ? ' pd-leave-item--open' : ''}`}>
                <button
                  type="button"
                  className="pd-leave-row"
                  aria-expanded={isOpen}
                  aria-controls={`leave-detail-${rec.id}`}
                  onClick={() => toggle(rec.id)}
                >
                  <span className="pd-leave-type-dot" style={{ background: STATUS_COLOR[rec.status] }} aria-hidden="true" />
                  <span className="pd-leave-info">
                    <span className="pd-leave-type">
                      {rec.type}
                      <span className="pd-leave-days-badge">{rec.days}d</span>
                    </span>
                    <span className="pd-leave-dates">
                      {rec.startDate}{rec.days > 1 ? ` – ${rec.endDate}` : ''}
                      {rec.approvedBy && (
                        <span className="pd-leave-approver">
                          <CheckCircle2 size={9} aria-hidden="true" />
                          {rec.approvedBy}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="pd-leave-status" style={{ color: STATUS_COLOR[rec.status] }}>
                    {STATUS_ICON[rec.status]}
                  </span>
                  <span className="pd-leave-chevron" aria-hidden="true">
                    {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`leave-detail-${rec.id}`}
                    className="pd-leave-detail pd-leave-detail--expanded"
                    role="region"
                    aria-label={`Leave details for ${rec.startDate}`}
                  >
                    <div className="pd-leave-detail-meta">
                      <div className="pd-leave-detail-meta-item">
                        <CalendarDays size={11} />
                        <span className="pd-leave-detail-meta-label">Duration</span>
                        <strong>{rec.days} day{rec.days > 1 ? 's' : ''}</strong>
                      </div>
                      <div className="pd-leave-detail-meta-item" style={{ color: STATUS_COLOR[rec.status] }}>
                        {STATUS_ICON[rec.status]}
                        <span className="pd-leave-detail-meta-label">Status</span>
                        <strong>{rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}</strong>
                      </div>
                    </div>

                    <div className="pd-leave-detail-reason">
                      <span className="pd-leave-detail-reason-label">Reason</span>
                      <p>{rec.reason}</p>
                    </div>

                    {rec.approvedBy && (
                      <div className="pd-leave-approved-by">
                        <User2 size={11} />
                        Approved by <strong>{rec.approvedBy}</strong>
                      </div>
                    )}

                    {rec.isFuture && rec.status !== 'cancelled' && (
                      <button type="button" className="pd-btn pd-btn--danger pd-btn--sm"
                        aria-label={`Cancel leave on ${rec.startDate}`}>
                        Cancel leave
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
};
