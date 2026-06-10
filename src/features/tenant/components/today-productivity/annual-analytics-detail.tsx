import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Sparkles,
  Target,
  BarChart2,
  ShieldCheck,
  TrendingUp,
  Users,
  Minus,
  FileText,
  Share2,
  ClipboardList
} from 'lucide-react';
import { useTheme } from '../../../../core/theme/theme-context';

// ── Types ──────────────────────────────────────────────────────────────────────
type Severity = 'critical' | 'warning' | 'info';

interface Alert {
  id: string;
  message: string;
  department: string;
  impact: string;
  reviewType: string;
  status: string;
  severity: Severity;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function barColor(pct: number): string {
  if (pct >= 78) return 'var(--accent)';
  if (pct >= 65) return 'var(--nexus-warning)';
  return 'var(--nexus-danger)';
}

// ── Component ──────────────────────────────────────────────────────────────────
export const AnnualAnalyticsDetail: React.FC = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'aa-1', message: '14 system review items require executive attention', department: 'Executive', impact: 'Critical', reviewType: 'System Review', status: 'Attention Required', severity: 'critical' },
    { id: 'aa-2', message: 'Operations efficiency is below annual target', department: 'Operations', impact: 'High', reviewType: 'Performance', status: 'Below Target', severity: 'critical' },
    { id: 'aa-3', message: 'Product delivery has delayed roadmap milestones', department: 'Engineering', impact: 'High', reviewType: 'Delivery', status: 'Warning', severity: 'warning' },
    { id: 'aa-4', message: 'Revenue growth needs stronger Q4 conversion', department: 'Sales', impact: 'High', reviewType: 'Revenue', status: 'Warning', severity: 'warning' },
    { id: 'aa-5', message: 'Customer satisfaction depends on Support SLA improvement', department: 'Support', impact: 'Medium', reviewType: 'SLA', status: 'Warning', severity: 'info' },
  ]);

  const handleDismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleActionClick = (actionName: string) => {
    setFeedbackMsg(`Action "${actionName}" executed successfully!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const annualGoals = [
    { name: 'Revenue Growth', pct: 72 },
    { name: 'Product Delivery', pct: 64 },
    { name: 'Customer Satisfaction', pct: 70 },
    { name: 'Employee Productivity', pct: 81 },
    { name: 'Compliance & HR', pct: 88 },
    { name: 'Operations Efficiency', pct: 59 },
  ];

  const summaryStats = [
    { label: 'Total annual goals', value: '50', icon: <Target size={12} />, accent: 'var(--accent)' },
    { label: 'Goals completed', value: '34', icon: <Check size={12} />, accent: 'var(--success)' },
    { label: 'Goals at risk', value: '8', icon: <AlertTriangle size={12} />, accent: 'var(--nexus-danger)' },
    { label: 'System review items', value: '14', icon: <ShieldCheck size={12} />, accent: 'var(--nexus-warning)' },
    { label: 'Avg yearly productivity', value: '82%', icon: <TrendingUp size={12} />, accent: 'var(--accent)' },
    { label: 'Employee retention', value: '91%', icon: <Users size={12} />, accent: 'var(--accent)' },
    { label: 'Customer satisfaction', value: '87%', icon: <BarChart2 size={12} />, accent: 'var(--accent)' },
  ];

  return (
    <div className="tto-detail-page" aria-label="Annual Analytics and Goals Page">
      {/* ── Header ── */}
      <header className="tto-detail-header">
        <div className="tto-detail-header__title-group">
          <h1 className="tto-detail-header__title">Annual Analytics and Goals</h1>
          <span className="tto-detail-header__tag" style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.35)', backgroundColor: 'rgba(245,158,11,0.08)' }}>
            CEO Annual Review
          </span>
        </div>
        <span className="tto-widget__tab" style={{ backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', color: 'var(--nexus-danger)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))', fontWeight: 600 }}>
          ⚠️ Needs executive review
        </span>
      </header>

      {/* Action Toast Feedback */}
      {feedbackMsg && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--accent)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.8rem',
            fontWeight: 600,
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {feedbackMsg}
        </div>
      )}

      {/* ── Top Summary Bar ── */}
      <div className="tto-detail-summary-bar" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {/* Metric 1: Review Items */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--nexus-warning)' }}>
                <ShieldCheck size={12} />
              </div>
              <span className="tto-donut-card__title">Review Items</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--nexus-warning)' }}>System</span>
          </div>
          <div className="tto-donut-card__chart-wrapper">
            <div className="tto-donut-card__chart">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="var(--nexus-warning)"
                  strokeWidth="7.5"
                  fill="transparent"
                  strokeDasharray={188.5}
                  strokeDashoffset={188.5 - (28 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">14</span>
                <span className="tto-donut-card__center-label">Items</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            Require system review
          </div>
        </div>

        {/* Metric 2: Goal Completion */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--nexus-warning)' }}>
                <TrendingUp size={12} />
              </div>
              <span className="tto-donut-card__title">Goal Completion</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--nexus-warning)' }}>Target: 85%</span>
          </div>
          <div className="tto-donut-card__chart-wrapper">
            <div className="tto-donut-card__chart">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="var(--nexus-warning)"
                  strokeWidth="7.5"
                  fill="transparent"
                  strokeDasharray={188.5}
                  strokeDashoffset={188.5 - (68 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">68%</span>
                <span className="tto-donut-card__center-label">Rate</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            Gap to target: 17%
          </div>
        </div>

        {/* Metric 3: Goals Completed */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--nexus-success)' }}>
                <Check size={12} />
              </div>
              <span className="tto-donut-card__title">Goals Completed</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--nexus-success)' }}>Target: 50</span>
          </div>
          <div className="tto-donut-card__chart-wrapper">
            <div className="tto-donut-card__chart">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="var(--nexus-success)"
                  strokeWidth="7.5"
                  fill="transparent"
                  strokeDasharray={188.5}
                  strokeDashoffset={188.5 - (68 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">34</span>
                <span className="tto-donut-card__center-label">of 50</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            34 annual goals completed
          </div>
        </div>

        {/* Metric 4: Goals At Risk */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--nexus-danger)' }}>
                <AlertTriangle size={12} />
              </div>
              <span className="tto-donut-card__title">Goals At Risk</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--nexus-danger)' }}>High Risk</span>
          </div>
          <div className="tto-donut-card__chart-wrapper">
            <div className="tto-donut-card__chart">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="var(--nexus-danger)"
                  strokeWidth="7.5"
                  fill="transparent"
                  strokeDasharray={188.5}
                  strokeDashoffset={188.5 - (16 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">8</span>
                <span className="tto-donut-card__center-label">Risk</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            Immediate action required
          </div>
        </div>

        {/* Metric 5: Current Status */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--nexus-warning)' }}>
                <Minus size={12} />
              </div>
              <span className="tto-donut-card__title">Current Status</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--nexus-warning)' }}>Warning</span>
          </div>
          <div className="tto-donut-card__chart-wrapper">
            <div className="tto-donut-card__chart">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth="7.5"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="var(--nexus-warning)"
                  strokeWidth="7.5"
                  fill="transparent"
                  strokeDasharray={188.5}
                  strokeDashoffset={188.5 - (68 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value" style={{ color: 'var(--nexus-warning)' }}>Review</span>
                <span className="tto-donut-card__center-label">Status</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            Executive action needed
          </div>
        </div>
      </div>

      {/* ── Main 2-Col Grid ── */}
      <div className="tto-detail-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1.4 }}>
          {/* Top Row: Side-by-Side Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.05fr', gap: 'var(--shell-gap)', minHeight: 0, flex: 1.15 }}>
            {/* Panel 1: Annual Goal Progress */}
            <section className="tto-detail-panel" style={{ minHeight: 0 }} aria-label="Annual Goal Progress">
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title" style={{ fontSize: '0.8rem' }}><BarChart2 size={14} /><span>Goal Progress</span></h2>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-around' }}>
                {annualGoals.map((g, i) => {
                  const color = barColor(g.pct);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-h)' }}>{g.name}</span>
                        <span style={{ color }}>{g.pct}%</span>
                      </div>
                      <div className="tto-goals__bar-track" style={{ height: '6px' }}>
                        <div className="tto-goals__bar-fill" style={{ width: `${g.pct}%`, backgroundColor: color, boxShadow: `0 0 5px color-mix(in srgb, ${color} 45%, transparent)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Panel 2: Annual Analytics Summary */}
            <section className="tto-detail-panel" style={{ minHeight: 0 }} aria-label="Annual Analytics Summary">
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title" style={{ fontSize: '0.8rem' }}><TrendingUp size={14} /><span>Analytics Summary</span></h2>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minHeight: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2px' }}>
                  {summaryStats.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', padding: '2px 6px', background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      <span style={{ color: 'var(--nexus-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ color: s.accent }}>{s.icon}</span>
                        {s.label}
                      </span>
                      <span style={{ fontWeight: 700, color: s.accent, flexShrink: 0 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <div className="tto-detail-recommendation-box" style={{ fontSize: '0.58rem', padding: '4px 6px', borderLeftColor: 'var(--accent)', flexShrink: 0, marginTop: '2px', lineHeight: 1.35 }}>
                  The company is progressing well in HR compliance, retention, and productivity, but Product Delivery, Operations Efficiency, and Revenue Growth require executive review to stay aligned with annual targets.
                </div>
              </div>
            </section>
          </div>

          {/* Panel 3: System Review Breakdown */}
          <section className="tto-detail-panel" style={{ flex: 0.85, minHeight: 0 }} aria-label="System Review Breakdown">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <ClipboardList size={16} />
                <span>System Review Breakdown</span>
              </h2>
              <span className="tto-detail-panel__badge">Year View</span>
            </header>
            <div className="tto-detail-table-container">
              <table className="tto-detail-table" style={{ fontSize: '0.7rem' }}>
                <thead>
                  <tr>
                    <th>Review Item</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>HRMS automation audit</td>
                    <td>Operations</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-warning)', backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))' }}>
                        Pending
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Payroll compliance review</td>
                    <td>Finance</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-warning)', backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))' }}>
                        Pending
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Productivity tracking accuracy</td>
                    <td>HR</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-warning)', backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))' }}>
                        Review needed
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Medium</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Support SLA analytics</td>
                    <td>Support</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>At risk</span></td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Annual goal alignment</td>
                    <td>Executive team</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-warning)', backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))' }}>
                        Review needed
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>High</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>{/* END LEFT COLUMN */}

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1 }}>
          {/* Panel 4: Annual CEO Alerts */}
          <section className="tto-detail-panel" style={{ flex: 1, minHeight: 0 }} aria-label="Annual CEO Alerts">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <AlertTriangle size={16} style={{ color: 'var(--nexus-warning)' }} />
                <span>Annual CEO Alerts</span>
              </h2>
              <span className="tto-detail-panel__badge" style={{ backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 15%, transparent)', color: 'var(--nexus-danger)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>
                {alerts.length} Active
              </span>
            </header>
            <div className="tto-detail-alerts">
              {alerts.map(alert => (
                <div key={alert.id} className={`tto-detail-alert-card tto-detail-alert-card--${alert.severity === 'info' ? 'warning' : alert.severity}`}>
                  <div className="tto-detail-alert-card__top">
                    <span className="tto-detail-alert-card__message" style={{ fontSize: '0.72rem' }}>{alert.message}</span>
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="tto-detail-alert-card__resolve-btn"
                      style={{ padding: '3px 8px', fontSize: '0.62rem' }}
                      aria-label="Review alert"
                    >
                      <span>Review</span>
                    </button>
                  </div>
                  <div className="tto-detail-alert-card__tags">
                    <span className="tto-detail-alert-card__tag tto-detail-alert-card__tag--dept">{alert.department}</span>
                    <span className={`tto-detail-alert-card__tag tto-detail-alert-card__tag--${alert.severity === 'info' ? 'warning' : alert.severity}`}>
                      {alert.impact} Impact
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', border: '1px solid', color: 'var(--nexus-text-muted)', backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      {alert.status}
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', border: '1px solid', color: 'var(--accent)', backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)', borderColor: 'var(--accent-border)' }}>
                      {alert.reviewType}
                    </span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--nexus-text-muted)', gap: '8px' }}>
                  <Sparkles size={24} style={{ color: 'var(--nexus-success)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>All annual alerts reviewed!</span>
                </div>
              )}
            </div>
          </section>

          {/* Panel 5: Recommended CEO Action */}
          <section className="tto-detail-panel tto-detail-action-panel" style={{ flexShrink: 0 }} aria-label="Recommended CEO Action">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title">
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                  <span>Recommended CEO Action</span>
                </h2>
                <span className="tto-detail-panel__badge" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
                  AI Powered
                </span>
              </header>

              <div className="tto-detail-recommendation-box" style={{ fontSize: '0.72rem', padding: '8px 12px' }}>
                Complete the 14 system review items this month, assign executive owners for Product Delivery and Operations Efficiency, and schedule an annual goal alignment review with department heads.
              </div>
            </div>

            <div className="tto-detail-action-buttons">
              <button
                onClick={() => handleActionClick('Assign executive owner')}
                className="tto-detail-btn tto-detail-btn--primary"
              >
                <Users size={12} />
                <span>Assign executive owner</span>
              </button>
              <button
                onClick={() => handleActionClick('Export annual report')}
                className="tto-detail-btn tto-detail-btn--secondary"
              >
                <FileText size={12} />
                <span>Export report</span>
              </button>
              <button
                onClick={() => handleActionClick('Open full analytics')}
                className="tto-detail-btn tto-detail-btn--secondary"
              >
                <Share2 size={12} />
                <span>Open full analytics</span>
              </button>
            </div>
          </section>
        </div>{/* END RIGHT COLUMN */}
      </div>{/* END MAIN GRID */}
    </div>
  );
};
