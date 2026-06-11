import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Check,
  FileText,
  Sparkles,
  Share2,
  ClipboardList,
  Target,
  Trophy,
  Minus
} from 'lucide-react';
import { useTheme } from '../../../../core/theme/theme-context';

export const MonthlyReviewDetail: React.FC = () => {
  const { theme } = useTheme();
  // Local Alerts State
  const [alerts, setAlerts] = useState([
    {
      id: 'ma-1',
      message: 'Product Delivery has 1 goal pending due to mobile release delay',
      department: 'Product Delivery',
      impact: 'High',
      status: 'Pending',
      severity: 'critical' as const
    },
    {
      id: 'ma-2',
      message: 'Sales Growth has 1 goal pending due to slower enterprise conversion',
      department: 'Sales',
      impact: 'High',
      status: 'Pending',
      severity: 'critical' as const
    },
    {
      id: 'ma-3',
      message: 'Operations has 1 goal pending due to workflow delay',
      department: 'Operations',
      impact: 'Medium',
      status: 'Pending',
      severity: 'warning' as const
    },
    {
      id: 'ma-4',
      message: 'Customer Support backlog may affect satisfaction target',
      department: 'Support',
      impact: 'High',
      status: 'At Risk',
      severity: 'critical' as const
    }
  ]);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleActionClick = (actionName: string) => {
    setFeedbackMsg(`Action "${actionName}" executed successfully!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const categories = [
    { name: 'Product Delivery', completed: 4, total: 5, color: 'var(--accent)', attention: false },
    { name: 'Sales Growth', completed: 3, total: 4, color: 'var(--nexus-warning)', attention: true },
    { name: 'Customer Support', completed: 2, total: 3, color: 'var(--nexus-warning)', attention: true },
    { name: 'HR & Attendance', completed: 2, total: 2, color: 'var(--accent)', attention: false },
    { name: 'Operations', completed: 1, total: 2, color: 'var(--nexus-warning)', attention: true }
  ];

  const summaryStats = [
    { label: 'Goals achieved', value: '12', icon: <Check size={12} />, accent: 'var(--success)' },
    { label: 'Goals pending', value: '4', icon: <Minus size={12} />, accent: 'var(--nexus-warning)' },
    { label: 'High impact completed', value: '7', icon: <Trophy size={12} />, accent: 'var(--accent)' },
    { label: 'At-risk goals', value: '3', icon: <AlertTriangle size={12} />, accent: 'var(--nexus-danger)' },
    { label: 'Average performance', value: '84%', icon: <TrendingUp size={12} />, accent: 'var(--accent)' },
  ];

  return (
    <div className="tto-detail-page" aria-label="Monthly Review Detailed Page">
      {/* Header Panel */}
      <header className="tto-detail-header">
        <div className="tto-detail-header__title-group">
          <h1 className="tto-detail-header__title">Monthly Review</h1>
          <span className="tto-detail-header__tag" style={{ color: 'var(--success)', borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.08)' }}>
            CEO Strategic Dashboard
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="tto-widget__tab" style={{ backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', color: 'var(--nexus-warning)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))', fontWeight: 600 }}>
            ⚠️ On track with attention needed
          </span>
        </div>
      </header>

      {/* Success Feedback Toast */}
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

      {/* Top Summary Metric Cards */}
      <div className="tto-detail-summary-bar">
        {/* Metric 1: Goals Achieved */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--nexus-success)' }}>
                <Trophy size={12} />
              </div>
              <span className="tto-donut-card__title">Goals Achieved</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--nexus-success)' }}>Target: 16</span>
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
                  strokeDashoffset={188.5 - (75 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">12</span>
                <span className="tto-donut-card__center-label">of 16</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            12 monthly goals met
          </div>
        </div>

        {/* Metric 2: Remaining Goals */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' }}>
                <Target size={12} />
              </div>
              <span className="tto-donut-card__title">Remaining Goals</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)' }}>Pending</span>
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
                  stroke="var(--accent)"
                  strokeWidth="7.5"
                  fill="transparent"
                  strokeDasharray={188.5}
                  strokeDashoffset={188.5 - (25 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">4</span>
                <span className="tto-donut-card__center-label">of 16</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            4 goals remaining to target
          </div>
        </div>

        {/* Metric 3: Completion Rate */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--nexus-success)' }}>
                <TrendingUp size={12} />
              </div>
              <span className="tto-donut-card__title">Completion Rate</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--nexus-success)' }}>Target: 100%</span>
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
                  strokeDashoffset={188.5 - (75 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">75%</span>
                <span className="tto-donut-card__center-label">Rate</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            75% completion progress
          </div>
        </div>

        {/* Metric 4: Performance Status */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--nexus-warning)' }}>
                <AlertTriangle size={12} />
              </div>
              <span className="tto-donut-card__title">Performance Status</span>
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
                  strokeDashoffset={188.5 - (84 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value" style={{ color: 'var(--nexus-warning)' }}>On Track</span>
                <span className="tto-donut-card__center-label">Status</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            Attention needed in Sales & Ops
          </div>
        </div>
      </div>

      {/* Main Grid: Left + Right Columns */}
      <div className="tto-detail-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1.4 }}>
          {/* Top Row: Side-by-Side Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 'var(--shell-gap)', minHeight: 0, flex: 1.1 }}>
            {/* Panel 1: Monthly Goals Progress */}
            <section className="tto-detail-panel" style={{ minHeight: 0 }} aria-label="Monthly Goals Progress">
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title" style={{ fontSize: '0.8rem' }}>
                  <Target size={14} style={{ color: 'var(--accent)' }} />
                  <span>Goals Progress</span>
                </h2>
              </header>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'space-around', flex: 1 }}>
                {categories.map((cat, idx) => {
                  const percentage = Math.round((cat.completed / cat.total) * 100);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-h)' }}>{cat.name}</span>
                        <span style={{ color: cat.attention ? 'var(--nexus-warning)' : 'var(--text-h)' }}>
                          {cat.completed}/{cat.total}
                        </span>
                      </div>
                      <div className="tto-goals__bar-track" style={{ height: '6px' }}>
                        <div
                          className="tto-goals__bar-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat.color,
                            boxShadow: `0 0 5px color-mix(in srgb, ${cat.color} 50%, transparent)`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Panel 2: Monthly Performance Summary */}
            <section className="tto-detail-panel" style={{ minHeight: 0 }} aria-label="Monthly Performance Summary">
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title" style={{ fontSize: '0.8rem' }}>
                  <Trophy size={14} />
                  <span>Performance Summary</span>
                </h2>
              </header>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minHeight: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3px' }}>
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
                <div className="tto-detail-recommendation-box" style={{ fontSize: '0.58rem', padding: '4px 6px', borderLeftColor: 'var(--accent)', flexShrink: 0, lineHeight: 1.35 }}>
                  The company has completed 12 of 16 monthly goals. Delivery and HR goals are strong, while Sales, Operations, and Support need focused follow-up before month end.
                </div>
              </div>
            </section>
          </div>

          {/* Panel 3: Goal Breakdown Table */}
          <section className="tto-detail-panel" style={{ flex: 0.9, minHeight: 0 }} aria-label="Goal Breakdown">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <ClipboardList size={16} />
                <span>Goal Breakdown</span>
              </h2>
              <span className="tto-detail-panel__badge">Month View</span>
            </header>

            <div className="tto-detail-table-container">
              <table className="tto-detail-table" style={{ fontSize: '0.7rem' }}>
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Mobile app release</td>
                    <td>Engineering</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-warning)', backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))' }}>
                        Pending
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Enterprise sales conversion</td>
                    <td>Sales</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>At risk</span></td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Support SLA improvement</td>
                    <td>Support</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-danger)', backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>At risk</span></td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Medium</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Workflow automation rollout</td>
                    <td>Operations</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--nexus-warning)', backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))' }}>
                        Pending
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Medium</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Attendance compliance</td>
                    <td>HR</td>
                    <td>
                      <span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px', color: 'var(--success)', backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.35)' }}>
                        Completed
                      </span>
                    </td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Medium</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>{/* END LEFT COLUMN */}

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1 }}>
          {/* Panel 4: CEO Monthly Alerts */}
          <section className="tto-detail-panel" style={{ flex: 1, minHeight: 0 }} aria-label="CEO Monthly Alerts">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <AlertTriangle size={16} style={{ color: 'var(--nexus-warning)' }} />
                <span>CEO Monthly Alerts</span>
              </h2>
              <span className="tto-detail-panel__badge" style={{ backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 15%, transparent)', color: 'var(--nexus-danger)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>
                {alerts.length} Pending
              </span>
            </header>

            <div className="tto-detail-alerts">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`tto-detail-alert-card tto-detail-alert-card--${alert.severity}`}
                >
                  <div className="tto-detail-alert-card__top">
                    <span className="tto-detail-alert-card__message" style={{ fontSize: '0.72rem' }}>{alert.message}</span>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="tto-detail-alert-card__resolve-btn"
                      style={{ padding: '3px 8px', fontSize: '0.62rem' }}
                      aria-label="Assign alert"
                    >
                      <span>Assign</span>
                    </button>
                  </div>
                  <div className="tto-detail-alert-card__tags">
                    <span className="tto-detail-alert-card__tag tto-detail-alert-card__tag--dept">
                      {alert.department}
                    </span>
                    <span className={`tto-detail-alert-card__tag tto-detail-alert-card__tag--${alert.severity}`}>
                      {alert.impact} Impact
                    </span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: '4px', border: '1px solid', color: 'var(--nexus-text-muted)', backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))}

              {alerts.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--nexus-text-muted)', gap: '8px' }}>
                  <Sparkles size={24} style={{ color: 'var(--nexus-success)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>All monthly alerts reviewed!</span>
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
                Review the 4 remaining monthly goals today, assign owners for Sales and Operations blockers, and schedule a Support SLA follow-up before month-end review.
              </div>
            </div>

            <div className="tto-detail-action-buttons">
              <button
                onClick={() => handleActionClick('Assign follow-up')}
                className="tto-detail-btn tto-detail-btn--primary"
              >
                <Users size={12} />
                <span>Assign follow-up</span>
              </button>
              <button
                onClick={() => handleActionClick('Export monthly report')}
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
