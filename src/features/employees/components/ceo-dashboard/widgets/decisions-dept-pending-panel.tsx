import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Building2 } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const DecisionsDeptPendingPanel: React.FC = () => {
  const { departmentPending, summary } = ceoDashboardData.decisions;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(100);
  const chartHeight = Math.max(height, 88);

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'bar',
        height: chartHeight
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '52%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          distributed: true
        }
      },
      colors: chartTokens.palette.slice(0, departmentPending.length),
      grid: {
        borderColor: chartTokens.gridColor,
        strokeDashArray: 3,
        padding: { top: 8, right: 4, left: 0, bottom: 0 },
        xaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: departmentPending.map((dept) =>
          dept.department.slice(0, 3).toUpperCase()
        ),
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px',
            fontFamily: 'inherit',
            fontWeight: 600
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        tickAmount: 3,
        labels: {
          style: {
            colors: chartTokens.textColor,
            fontSize: '8px',
            fontFamily: 'inherit'
          }
        }
      },
      legend: { show: false },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}`,
        offsetY: -12,
        style: {
          fontSize: '9px',
          fontWeight: 700,
          colors: [chartTokens.textColor]
        }
      },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val} pending` }
      }
    }),
    [baseChartOptions, chartHeight, chartTokens, departmentPending]
  );

  return (
    <article className="cwo-widget cdo-cell--dept">
      <header className="cwo-widget__head">
        <Building2 size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Dept pending</h4>
        <span className="cwo-widget__tab">{summary.pendingApprovals} total</span>
      </header>
      <div ref={containerRef} className="cwo-trend__chart">
        <Chart
          type="bar"
          height={chartHeight}
          width="100%"
          options={options}
          series={[{ name: 'Pending', data: departmentPending.map((dept) => dept.count) }]}
        />
      </div>
    </article>
  );
};
