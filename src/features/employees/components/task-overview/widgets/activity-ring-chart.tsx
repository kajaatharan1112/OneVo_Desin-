import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../chart-theme';
import { usePanelChartHeight } from '../use-panel-chart-height';

interface ActivityRingChartProps {
  percent: number;
  centerLabel: string;
  centerValue: string;
  caption: string;
  /** Matches Attendance Pulse gauge — blue→green gradient, dark center text. */
  variant?: 'default' | 'attendance';
}

/** Apple Fitness–style activity ring (radialBar + round stroke caps). */
export const ActivityRingChart: React.FC<ActivityRingChartProps> = ({
  percent,
  centerLabel,
  centerValue,
  caption,
  variant = 'default'
}) => {
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(
    () => createBaseChartOptions(chartTokens),
    [chartTokens]
  );
  const { containerRef, height } = usePanelChartHeight(148);
  const chartSize = Math.max(148, height);
  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));

  const isAttendance = variant === 'attendance';

  const options: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: {
        ...baseChartOptions.chart,
        type: 'radialBar',
        height: chartSize,
        width: chartSize
      },
      series: [clampedPercent],
      labels: [centerLabel],
      colors: [chartTokens.primary],
      stroke: {
        lineCap: 'round'
      },
      fill: isAttendance
        ? {
            type: 'gradient',
            gradient: {
              type: 'horizontal',
              shadeIntensity: 0.35,
              gradientToColors: [chartTokens.palette[2] ?? '#10b981'],
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          }
        : {
            type: 'solid',
            opacity: chartTokens.primaryOpacity
          },
      plotOptions: {
        radialBar: {
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 0,
            size: isAttendance ? '54%' : '58%',
            background: 'transparent'
          },
          track: {
            show: true,
            background: chartTokens.ringTrack,
            strokeWidth: '100%',
            margin: 0
          },
          dataLabels: {
            show: true,
            name: {
              show: true,
              fontSize: '10px',
              fontWeight: 500,
              color: chartTokens.textColor,
              offsetY: 22,
              formatter: () => centerLabel
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: isAttendance ? 800 : 700,
              color: isAttendance ? chartTokens.headingColor : chartTokens.primary,
              offsetY: -10,
              formatter: () => centerValue
            }
          }
        }
      }
    }),
    [baseChartOptions, centerLabel, centerValue, chartSize, chartTokens, clampedPercent, isAttendance]
  );

  return (
    <>
      <div ref={containerRef} className="eto-pie__chart-body">
        <Chart
          type="radialBar"
          height={chartSize}
          width={chartSize}
          options={options}
          series={[clampedPercent]}
        />
      </div>
      <p className="eto-pie__caption">{caption}</p>
    </>
  );
};
