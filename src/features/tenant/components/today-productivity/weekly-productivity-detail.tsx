import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Users, 
  Check, 
  FileText, 
  Sparkles, 
  Share2, 
  ClipboardList,
  Calendar,
  Zap
} from 'lucide-react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '../../../../core/theme/theme-context';
import { getChartTheme } from '../../../../core/theme/chart-theme-config';
import { createBaseChartOptions } from '../../../employees/components/task-overview/chart-theme';

export const WeeklyProductivityDetail: React.FC = () => {
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );

  // Alerts State
  const [alerts, setAlerts] = useState([
    {
      id: 'wa-1',
      message: 'Marketing productivity below weekly target by 14%',
      department: 'Marketing',
      impact: 'High',
      status: 'Needs Attention',
      severity: 'critical' as const
    },
    {
      id: 'wa-2',
      message: 'Operations workflow delay increasing idle time',
      department: 'Operations',
      impact: 'Medium',
      status: 'Warning',
      severity: 'warning' as const
    },
    {
      id: 'wa-3',
      message: 'Support backlog affecting cross-team productivity',
      department: 'Support',
      impact: 'High',
      status: 'Blocked',
      severity: 'critical' as const
    },
    {
      id: 'wa-4',
      message: 'Meeting overload reducing focus hours',
      department: 'Company-wide',
      impact: 'Medium',
      status: 'Warning',
      severity: 'warning' as const
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

  // Weekly Department Productivity Bar Chart
  const deptChartOptions: ApexOptions = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: 120,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '52%',
          borderRadius: 4,
          distributed: true,
          dataLabels: { position: 'end' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        style: {
          fontSize: '9px',
          colors: [isDark ? '#fff' : '#0f172a'],
          fontWeight: 700
        },
        offsetX: 30
      },
      colors: [
        chartTokens.primary, // Engineering (86%)
        chartTokens.primary, // Sales (82%)
        '#f59e0b',           // Marketing (71%) - Warning
        '#f59e0b',           // Operations (78%) - Warning
        chartTokens.primary  // HR (80%)
      ],
      xaxis: {
        categories: ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR'],
        max: 100,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '9px',
            fontWeight: 600
          }
        }
      },
      grid: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: { right: 35 }
      },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val}% Productivity` }
      }
    };
  }, [baseChartOptions, chartTokens, theme]);

  const deptChartSeries = [{
    name: 'Productivity Rate',
    data: [86, 82, 71, 78, 80] // Engineering, Sales, Marketing, Operations, HR
  }];

  // Weekly Timeline Area Chart
  const timelineChartOptions: ApexOptions = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'area',
        height: 120,
        toolbar: { show: false }
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: [chartTokens.primary]
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: isDark ? 0.3 : 0.2,
          opacityTo: 0.01,
          stops: [0, 95]
        }
      },
      colors: [chartTokens.primary],
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu (Proj)', 'Fri (Proj)'],
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 60,
        max: 90,
        tickAmount: 3,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px'
          },
          formatter: (val: number) => `${val}%`
        }
      },
      grid: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val}%` }
      }
    };
  }, [baseChartOptions, chartTokens, theme]);

  const timelineChartSeries = [{
    name: 'Productivity Rate',
    data: [76, 78, 79, 82, 85] // Mon, Tue, Wed, Thu (Proj), Fri (Proj)
  }];

  return (
    <div className="tto-detail-page" aria-label="Weekly Productivity Detailed Page">
      {/* Header Bar */}
      <header className="tto-detail-header">
        <div className="tto-detail-header__title-group">
          <h1 className="tto-detail-header__title">Weekly Productivity</h1>
          <span className="tto-detail-header__tag" style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
            CEO Decision Portal
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="tto-widget__tab" style={{ backgroundColor: 'color-mix(in srgb, var(--nexus-warning) 12%, transparent)', color: 'var(--nexus-warning)', borderColor: 'color-mix(in srgb, var(--nexus-warning) 30%, var(--border))', fontWeight: 600 }}>
            2 days remaining
          </span>
        </div>
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

      {/* Top Summary Metric Cards */}
      <div className="tto-detail-summary-bar">
        {/* Metric 1: Weekly Productivity */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' }}>
                <TrendingUp size={12} />
              </div>
              <span className="tto-donut-card__title">Weekly Productivity</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)' }}>Target: 85%</span>
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
                  strokeDashoffset={188.5 - (79 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">79%</span>
                <span className="tto-donut-card__center-label">Rate</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            Gap to target: 6% below target
          </div>
        </div>

        {/* Metric 2: Productive Hours */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' }}>
                <Clock size={12} />
              </div>
              <span className="tto-donut-card__title">Productive Hours</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)' }}>Target: 40h</span>
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
                  strokeDashoffset={188.5 - (79.5 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">31.8h</span>
                <span className="tto-donut-card__center-label">of 40h</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            31.8h completed per employee
          </div>
        </div>

        {/* Metric 3: Idle Hours */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--nexus-warning)' }}>
                <Clock size={12} />
              </div>
              <span className="tto-donut-card__title">Idle Hours</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: 'var(--nexus-warning)' }}>Limit: 10h</span>
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
                  strokeDashoffset={188.5 - (74 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value" style={{ color: 'var(--nexus-warning)' }}>7.4h</span>
                <span className="tto-donut-card__center-label">of 10h</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            7.4h idle per employee
          </div>
        </div>

        {/* Metric 4: Time Remaining */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' }}>
                <Calendar size={12} />
              </div>
              <span className="tto-donut-card__title">Time Remaining</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)' }}>Active</span>
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
                  strokeDashoffset={188.5 - (60 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">2 days</span>
                <span className="tto-donut-card__center-label">Left</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            2 days remaining this week
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="tto-detail-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1.4 }}>
          {/* Top Row: Side-by-Side Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--shell-gap)', minHeight: 0, flex: 1.1 }}>
            {/* Panel 1: Department Productivity */}
            <section className="tto-detail-panel" style={{ minHeight: 0 }} aria-label="Weekly Department Productivity">
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title" style={{ fontSize: '0.8rem' }}>
                  <TrendingUp size={14} />
                  <span>Weekly Org Rate</span>
                </h2>
              </header>
              <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
                <div style={{ width: '100%', minHeight: 0 }}>
                  <Chart type="bar" height="100%" options={deptChartOptions} series={deptChartSeries} />
                </div>
              </div>
            </section>

            {/* Panel 2: Weekly Timeline */}
            <section className="tto-detail-panel" style={{ minHeight: 0 }} aria-label="Weekly Timeline">
              <header className="tto-detail-panel__head">
                <h2 className="tto-detail-panel__title" style={{ fontSize: '0.8rem' }}>
                  <Calendar size={14} />
                  <span>Timeline</span>
                </h2>
              </header>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Chart type="area" height="100%" options={timelineChartOptions} series={timelineChartSeries} />
                </div>
                <div 
                  style={{
                    fontSize: '0.58rem',
                    lineHeight: '1.35',
                    padding: '3px 6px',
                    background: 'color-mix(in srgb, var(--nexus-warning) 8%, var(--surface-panel))',
                    border: '1px solid color-mix(in srgb, var(--nexus-warning) 25%, var(--border))',
                    borderRadius: '4px',
                    color: 'var(--text-h)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  <Zap size={10} style={{ color: 'var(--nexus-warning)', flexShrink: 0 }} />
                  <span>Blockers must be resolved to meet target.</span>
                </div>
              </div>
            </section>
          </div>

          {/* Panel 3: Root Cause Breakdown Table */}
          <section className="tto-detail-panel" style={{ flex: 0.9, minHeight: 0 }} aria-label="Root Cause Breakdown">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <ClipboardList size={16} />
                <span>Root Cause Breakdown</span>
              </h2>
              <span className="tto-detail-panel__badge">Weekly View</span>
            </header>
            <div className="tto-detail-table-container">
              <table className="tto-detail-table" style={{ fontSize: '0.7rem' }}>
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th>Affected Employees</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Meeting overload</td>
                    <td>48</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Medium</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Late task handoffs</td>
                    <td>31</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Support backlog</td>
                    <td>22</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Tool/login blockers</td>
                    <td>14</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>Medium</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Campaign standby time</td>
                    <td>17</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>High</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1 }}>
          {/* Panel 4: Weekly CEO Alerts */}
          <section className="tto-detail-panel" style={{ flex: 1, minHeight: 0 }} aria-label="Weekly CEO Alerts">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <AlertTriangle size={16} style={{ color: 'var(--nexus-warning)' }} />
                <span>Weekly CEO Alerts</span>
              </h2>
              <span className="tto-detail-panel__badge" style={{ backgroundColor: 'color-mix(in srgb, var(--nexus-danger) 15%, transparent)', color: 'var(--nexus-danger)', borderColor: 'color-mix(in srgb, var(--nexus-danger) 30%, var(--border))' }}>
                {alerts.length} Warnings
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
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>All weekly alerts resolved!</span>
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
                To reach the 85% weekly target, reduce non-critical meetings, assign senior support to clear backlog, and move 2 high-performing engineers to unblock delayed delivery before Friday.
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
                onClick={() => handleActionClick('Export weekly report')}
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
        </div>
      </div>
    </div>
  );
};
