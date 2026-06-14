import React, { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '../../../../../core/theme/theme-context';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import type { WorkDashboardSprintDay } from '../../../data/work-dashboard.data';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface SprintPlanPanelProps {
  days: WorkDashboardSprintDay[];
}

export const SprintPlanPanel: React.FC<SprintPlanPanelProps> = ({ days }) => {
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(150);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);

  const totalFinished = days.reduce((s, d) => s + d.finished, 0);
  const totalPlanned  = days.reduce((s, d) => s + d.planned, 0);
  const totalPending  = totalPlanned - totalFinished;
  const completePct   = totalPlanned > 0 ? Math.round((totalFinished / totalPlanned) * 100) : 0;

  useEffect(() => {
    const node = chartWrapRef.current;
    if (!node) return undefined;
    const measure = () => {
      const h = node.getBoundingClientRect().height;
      if (h > 40) setChartHeight(Math.floor(h));
    };
    const raf = requestAnimationFrame(() => {
      measure();
      const obs = new ResizeObserver(measure);
      obs.observe(node);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const finishedColor = isDark ? '#5b8df6' : '#2563eb';
  const pendingColor  = isDark ? 'rgba(255,255,255,0.10)' : '#eaecf0';
  const textColor     = chartTokens.textColor;

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: chartHeight,
        stacked: true,
        toolbar: { show: false },
        animations: { enabled: false },
        background: 'transparent'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last'
        }
      },
      colors: [finishedColor, pendingColor],
      dataLabels: { enabled: false },
      grid: {
        show: true,
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f2f4f7',
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 4, left: -12, bottom: 0 }
      },
      xaxis: {
        categories: days.map((d) => d.day),
        labels: {
          style: {
            colors: Array(days.length).fill(textColor),
            fontSize: '12px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 500
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        show: false
      },
      legend: { show: false },
      tooltip: {
        theme: chartTokens.tooltipTheme,
        shared: true,
        intersect: false,
        y: { formatter: (v: number) => `${v} tasks` }
      },
      states: {
        hover: { filter: { type: 'lighten', value: 0.04 } },
        active: { filter: { type: 'none' } }
      }
    }),
    [baseChartOptions, chartHeight, chartTokens, days, finishedColor, isDark, pendingColor, textColor]
  );

  const series = useMemo(
    () => [
      { name: 'Finished',  data: days.map((d) => d.finished) },
      { name: 'Remaining', data: days.map((d) => d.planned - d.finished) }
    ],
    [days]
  );

  const badge = (
    <span className="wd-sprint-badge">{completePct}% sprint</span>
  );

  return (
    <WorkDashboardPanel
      title="Weekly timeline"
      className="work-dashboard__sprint-plan"
      headerRight={badge}
    >
      {/* Overall sprint completion progress bar */}
      <div className="wd-sprint-progress" aria-label={`${completePct}% sprint complete`}>
        <div
          className="wd-sprint-progress__fill"
          style={{ width: `${completePct}%` }}
          role="progressbar"
          aria-valuenow={completePct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* KPI stat cards */}
      <div className="wd-sprint-kpis">
        <div className="wd-sprint-kpi">
          <span className="wd-sprint-kpi__value">{totalFinished}</span>
          <span className="wd-sprint-kpi__label">Finished</span>
        </div>
        <div className="wd-sprint-kpi">
          <span className="wd-sprint-kpi__value">{totalPending}</span>
          <span className="wd-sprint-kpi__label">Pending</span>
        </div>
        <div className="wd-sprint-kpi">
          <span className="wd-sprint-kpi__value">{completePct}%</span>
          <span className="wd-sprint-kpi__label">Complete</span>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="work-dashboard-sprint-chart" ref={chartWrapRef}>
        <Chart
          key={chartHeight}
          options={options}
          series={series}
          type="bar"
          height={chartHeight}
          width="100%"
        />
      </div>

      {/* Legend */}
      <div className="wd-sprint-legend">
        <span className="wd-sprint-legend__item wd-sprint-legend__item--finished">
          <span className="wd-sprint-legend__dot" />
          Finished
        </span>
        <span className="wd-sprint-legend__item wd-sprint-legend__item--remaining">
          <span className="wd-sprint-legend__dot" />
          Remaining
        </span>
      </div>
    </WorkDashboardPanel>
  );
};
