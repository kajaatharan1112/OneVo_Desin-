import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText, 
  Sparkles, 
  Share2, 
  ClipboardList 
} from 'lucide-react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '../../../../core/theme/theme-context';
import { getChartTheme } from '../../../../core/theme/chart-theme-config';
import { createBaseChartOptions } from '../../../employees/components/task-overview/chart-theme';

export const TodayProductivityDetail: React.FC = () => {
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );

  // Alerts State
  const [alerts, setAlerts] = useState([
    {
      id: 'ta-1',
      message: 'Marketing campaign team at 74%, 6 members below target',
      department: 'Marketing',
      impact: 'High',
      status: 'Needs Attention',
      severity: 'warning' as const
    },
    {
      id: 'ta-2',
      message: 'Support backlog causing 18% idle time',
      department: 'Support',
      impact: 'High',
      status: 'Warning',
      severity: 'warning' as const
    },
    {
      id: 'ta-3',
      message: 'Mobile release blocked by login issue',
      department: 'Engineering',
      impact: 'Critical',
      status: 'Blocked',
      severity: 'critical' as const
    },
    {
      id: 'ta-4',
      message: 'Late logins affecting focus time',
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

  // Department Productivity Bar Chart options (horizontal)
  const chartOptions: ApexOptions = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: 140,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '50%',
          borderRadius: 4,
          distributed: true,
          dataLabels: { position: 'end' }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}%`,
        style: {
          fontSize: '10px',
          colors: [isDark ? '#fff' : '#0f172a'],
          fontWeight: 700
        },
        offsetX: 30
      },
      colors: [
        chartTokens.primary, // Engineering (94%)
        chartTokens.primary, // Sales (91%)
        '#f59e0b',           // Marketing (74%)
        chartTokens.primary, // Operations (88%)
        chartTokens.primary  // HR (90%)
      ],
      xaxis: {
        categories: ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR'],
        max: 100,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '9px'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '10px',
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

  const chartSeries = [{
    name: 'Productivity',
    data: [94, 91, 74, 88, 90] // Engineering, Sales, Marketing, Operations, HR
  }];

  return (
    <div className="tto-detail-page" aria-label="Today Productivity Detailed Page">
      {/* Header Bar */}
      <header className="tto-detail-header">
        <div className="tto-detail-header__title-group">
          <h1 className="tto-detail-header__title">Today Productivity</h1>
          <span className="tto-detail-header__tag" style={{ color: 'var(--accent)', borderColor: 'var(--accent-border)' }}>
            CEO Decision Portal
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
        {/* Metric 1: Overall Productivity */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' }}>
                <TrendingUp size={12} />
              </div>
              <span className="tto-donut-card__title">Overall Productivity</span>
            </div>
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)' }}>Live</span>
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
                  strokeDashoffset={188.5 - (89 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">89%</span>
                <span className="tto-donut-card__center-label">Rate</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            ↑ 11% higher than yesterday
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
            <span className="tto-donut-card__badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent)' }}>Target</span>
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
                  strokeDashoffset={188.5 - (80 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">6.4h</span>
                <span className="tto-donut-card__center-label">of 8h</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            6.4h completed per employee
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
                  strokeDashoffset={188.5 - (80 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value" style={{ color: 'var(--nexus-warning)' }}>1.6h</span>
                <span className="tto-donut-card__center-label">of 2h</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            1.6h idle per employee
          </div>
        </div>

        {/* Metric 4: Active Employees */}
        <div className="tto-donut-card">
          <div className="tto-donut-card__header">
            <div className="tto-donut-card__title-group">
              <div className="tto-donut-card__icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' }}>
                <Users size={12} />
              </div>
              <span className="tto-donut-card__title">Active Employees</span>
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
                  strokeDashoffset={188.5 - (87.4 / 100) * 188.5}
                  strokeLinecap="round"
                />
              </svg>
              <div className="tto-donut-card__center-text">
                <span className="tto-donut-card__center-value">353</span>
                <span className="tto-donut-card__center-label">of 404</span>
              </div>
            </div>
          </div>
          <div className="tto-donut-card__footer">
            87.4% active workforce today
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="tto-detail-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1.4 }}>
          {/* Panel 1: Department Productivity */}
          <section className="tto-detail-panel" style={{ flex: 1, minHeight: 0 }} aria-label="Department Productivity">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <TrendingUp size={16} />
                <span>Department Productivity</span>
              </h2>
              <span className="tto-detail-panel__badge">Live Rates</span>
            </header>
            <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', minHeight: 0 }}>
              <div style={{ width: '100%', minHeight: 0 }}>
                <Chart type="bar" height="100%" options={chartOptions} series={chartSeries} />
              </div>
            </div>
          </section>

          {/* Panel 2: Root Cause Breakdown */}
          <section className="tto-detail-panel" style={{ flex: 1, minHeight: 0 }} aria-label="Root Cause Breakdown">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <ClipboardList size={16} />
                <span>Root Cause Breakdown</span>
              </h2>
              <span className="tto-detail-panel__badge">Today View</span>
            </header>
            <div className="tto-detail-table-container">
              <table className="tto-detail-table">
                <thead>
                  <tr>
                    <th>Reason</th>
                    <th>Count</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Late logins</td>
                    <td>23</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high">High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Meeting overload</td>
                    <td>41</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium">Medium</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Support backlog</td>
                    <td>18</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--high">High</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Tool access blockers</td>
                    <td>9</td>
                    <td><span className="tto-detail-impact-badge tto-detail-impact-badge--medium">Medium</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--shell-gap)', minHeight: 0, overflow: 'hidden', flex: 1 }}>
          {/* Panel 3: CEO Today Alerts */}
          <section className="tto-detail-panel" style={{ flex: 1, minHeight: 0 }} aria-label="CEO Today Alerts">
            <header className="tto-detail-panel__head">
              <h2 className="tto-detail-panel__title">
                <AlertTriangle size={16} style={{ color: 'var(--nexus-warning)' }} />
                <span>CEO Today Alerts</span>
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
                      aria-label="Action alert"
                    >
                      <span>{alert.id === 'ta-1' || alert.id === 'ta-4' ? 'Assign' : 'Resolve'}</span>
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
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>All alerts resolved!</span>
                </div>
              )}
            </div>
          </section>

          {/* Panel 4: Recommended CEO Action */}
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
                Reallocate 2 senior engineers to unblock the mobile release, reduce Marketing standby overlap by 30 minutes today, and review Support backlog before 4 PM.
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
                onClick={() => handleActionClick('Export report')}
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
