import React, { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../../../employees/components/task-overview/chart-theme';
import type { WorkforceMetrics } from '../../../data/tenant-today-productivity.data';
import { useWorkforceChartSize } from '../use-workforce-chart-size';

interface WorkforceCombinedChartProps {
  metrics: WorkforceMetrics;
  title: string;
  Icon: LucideIcon;
}

export const WorkforceCombinedChart: React.FC<WorkforceCombinedChartProps> = ({ metrics, title, Icon }) => {
  const { total, attendedToday, onlineNow } = metrics;
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, size: chartSize } = useWorkforceChartSize();

  const attendedOffline = Math.max(0, attendedToday - onlineNow);
  const absentToday = metrics.absent ?? Math.max(0, total - attendedToday);

  const series = useMemo(
    () => [onlineNow, attendedOffline, absentToday],
    [onlineNow, attendedOffline, absentToday]
  );

  const sliceGapColor = theme === 'dark' ? '#1e293b' : '#dcdfe3';

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'donut',
        height: chartSize,
        width: chartSize,
        offsetX: 0,
        offsetY: 0
      },
      series,
      labels: ['Online', 'Attended', 'Absent'],
      colors: [chartTokens.primary, chartTokens.lightBlue, '#ef4444'],
      stroke: {
        width: 2,
        colors: [sliceGapColor, sliceGapColor, sliceGapColor],
        lineCap: 'round'
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          borderRadius: 6,
          customScale: 0.95,
          donut: {
            size: '65%',
            labels: { show: false }
          }
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        ...baseChartOptions.tooltip,
        y: { formatter: (val: number) => `${val} employees` }
      }
    }),
    [baseChartOptions, chartSize, chartTokens, series, sliceGapColor]
  );

  const statusItems = [
    {
      key: 'online',
      label: 'Online now',
      value: onlineNow,
      color: chartTokens.primary,
      dotClass: 'tto-workforce__status-dot--online'
    },
    {
      key: 'attended',
      label: 'Attended',
      value: attendedToday,
      color: chartTokens.lightBlue,
      dotClass: 'tto-workforce__status-dot--attended'
    },
    {
      key: 'absent',
      label: 'Absent',
      value: absentToday,
      color: '#ef4444',
      dotClass: 'tto-workforce__status-dot--absent'
    }
  ];

  return (
    <div className="tto-workforce__layout">
      {/* LEFT — chart */}
      <div ref={containerRef} className="tto-workforce__chart-col">
        <div
          className="tto-workforce__pie"
          style={{ width: chartSize, height: chartSize }}
        >
          <Chart type="donut" height={chartSize} width={chartSize} options={options} series={series} />
          <div className="tto-workforce__center">
            <span className="tto-workforce__center-value">{total}</span>
            <span className="tto-workforce__center-label">Total</span>
          </div>
        </div>
      </div>

      {/* RIGHT — header + status badges */}
      <div className="tto-workforce__info">
        <div className="tto-workforce__head">
          <Icon size={14} className="tto-workforce__head-icon" aria-hidden="true" />
          <h3 className="tto-workforce__title">{title}</h3>
        </div>

        <ul className="tto-workforce__status-list" aria-label="Workforce status breakdown">
          {statusItems.map((item) => (
            <li key={item.key} className="tto-workforce__status-item">
              <span
                className="tto-workforce__status-dot"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="tto-workforce__status-label">{item.label}</span>
              <span className="tto-workforce__status-value">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
