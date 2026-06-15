import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, RotateCcw, Clock, XCircle } from 'lucide-react';
import type { TaskApprovalStats } from '../../../data/performance-dashboard.data';

interface ApprovalPiePanelProps {
  stats: TaskApprovalStats;
}

const SEGMENTS = [
  { key: 'approvedFirst',         label: 'First approval', color: '#2563eb', icon: CheckCircle2 },
  { key: 'approvedAfterRevision', label: 'After revision', color: '#93c5fd', icon: RotateCcw    },
  { key: 'pending',               label: 'Pending',        color: '#cbd5e1', icon: Clock        },
  { key: 'rejected',              label: 'Rejected',       color: '#e2e8f0', icon: XCircle      }
] as const;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}
const PieTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: item } = payload[0];
  return (
    <div className="apr-tooltip">
      <span className="apr-tooltip__dot" style={{ background: item.color }} />
      <span>{name}</span>
      <strong>{value} tasks</strong>
    </div>
  );
};

export const ApprovalPiePanel: React.FC<ApprovalPiePanelProps> = ({ stats }) => {
  const data = SEGMENTS.map(s => ({
    name:  s.label,
    value: stats[s.key],
    color: s.color
  })).filter(d => d.value > 0);

  const approvedTotal = stats.approvedFirst + stats.approvedAfterRevision;

  return (
    <div className="perf-panel apr-panel" role="region" aria-label="Task approval rate chart">

      {/* ── Left sidebar: info + legend + stats ── */}
      <div className="apr-side">
        <div className="apr-side__head">
          <span className="apr-side__title">Task Approval Rate</span>
          <span className="apr-side__badge">{stats.periodLabel}</span>
        </div>

        {/* Key stats stacked */}
        <div className="apr-side__stats">
          <div className="apr-side__stat">
            <span className="apr-side__stat-num" style={{ color: '#2563eb' }}>{stats.firstApprovalRate}%</span>
            <span className="apr-side__stat-lbl">First-pass rate</span>
          </div>
          <div className="apr-side__stat-divider" />
          <div className="apr-side__stat">
            <span className="apr-side__stat-num">{approvedTotal}</span>
            <span className="apr-side__stat-lbl">Approved</span>
          </div>
          <div className="apr-side__stat-divider" />
          <div className="apr-side__stat">
            <span className="apr-side__stat-num">{stats.totalTasks}</span>
            <span className="apr-side__stat-lbl">Total tasks</span>
          </div>
        </div>

        {/* Compact legend */}
        <div className="apr-side__legend">
          {SEGMENTS.map(s => {
            const val = stats[s.key];
            if (!val) return null;
            const Icon = s.icon;
            const pct  = Math.round((val / stats.totalTasks) * 100);
            return (
              <div key={s.key} className="apr-side__legend-item">
                <span className="apr-side__legend-dot" style={{ background: s.color }} />
                <Icon size={9} color={s.color} aria-hidden="true" />
                <span className="apr-side__legend-lbl">{s.label}</span>
                <span className="apr-side__legend-val">{val}</span>
                <span className="apr-side__legend-pct" style={{ color: s.color }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Pie chart (80%) ── */}
      <div className="apr-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: -10, right: -10, bottom: -10, left: -10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="84%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="apr-chart-center" aria-hidden="true">
          <span className="apr-chart-center__pct">{stats.firstApprovalRate}%</span>
          <span className="apr-chart-center__lbl">First-pass</span>
          <span className="apr-chart-center__sub">approval rate</span>
        </div>
      </div>

    </div>
  );
};
