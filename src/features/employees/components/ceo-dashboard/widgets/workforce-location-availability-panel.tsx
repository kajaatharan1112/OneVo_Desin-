import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Users } from 'lucide-react';
import { getChartTheme } from '../../../../../core/theme/chart-theme-config';
import { useTheme } from '../../../../../core/theme/theme-context';
import { createBaseChartOptions } from '../../task-overview/chart-theme';
import { usePanelChartHeight } from '../../task-overview/use-panel-chart-height';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import { WidgetLead } from './widget-lead';

export const WorkforceLocationAvailabilityPanel: React.FC = () => {
  const { workLocations, availability } = ceoDashboardData.workforce;
  const locationTotal = workLocations.reduce((sum, item) => sum + item.count, 0);
  const onSite = workLocations.find((item) => item.id === 'onsite') ?? workLocations[0];
  const { theme } = useTheme();
  const chartTokens = useMemo(() => getChartTheme(theme), [theme]);
  const baseChartOptions = useMemo(() => createBaseChartOptions(chartTokens), [chartTokens]);
  const { containerRef, height } = usePanelChartHeight(80);
  const chartSize = Math.min(Math.max(height, 72), 96);

  const locationOptions: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'donut', height: chartSize, width: chartSize },
      labels: workLocations.map((item) => item.label),
      colors: [chartTokens.primary, chartTokens.palette[2], chartTokens.lightBlue],
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: { size: '68%', labels: { show: false } }
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: { ...baseChartOptions.tooltip, y: { formatter: (val: number) => `${val} employees` } }
    }),
    [baseChartOptions, chartSize, chartTokens, workLocations]
  );

  const availabilityOptions: ApexOptions = useMemo(
    () => ({
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'donut', height: chartSize, width: chartSize },
      labels: ['Active', 'Unavailable'],
      colors: [chartTokens.primary, chartTokens.palette[3]],
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: { size: '68%', labels: { show: false } }
        }
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: { ...baseChartOptions.tooltip, y: { formatter: (val: number) => `${val} employees` } }
    }),
    [baseChartOptions, chartSize, chartTokens]
  );

  return (
    <article className="cwo-widget cwo-widget--locavail cwo-cell--location">
      <header className="cwo-widget__head">
        <Users size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Who is working today</h4>
      </header>
      <WidgetLead
        value={`${availability.activeToday.toLocaleString()} active of ${availability.totalEmployees.toLocaleString()}`}
        caption={`${availability.attendanceRate}% attendance · ${onSite.percent}% on-site · ${availability.notAvailableToday} unavailable`}
      />

      <div ref={containerRef} className="cwo-locavail-pies">
        <div className="cwo-locavail-pie">
          <span className="cwo-locavail-pie__label">Work location</span>
          <div className="cwo-pie-wrap cwo-pie-wrap--locavail">
            <Chart
              type="donut"
              height={chartSize}
              width={chartSize}
              options={locationOptions}
              series={workLocations.map((item) => item.count)}
            />
            <div className="cwo-pie-wrap__center" aria-hidden="true">
              <span className="cwo-pie-wrap__value">{locationTotal.toLocaleString()}</span>
              <span className="cwo-pie-wrap__label">Total</span>
            </div>
          </div>
        </div>

        <div className="cwo-locavail-pie">
          <span className="cwo-locavail-pie__label">Availability</span>
          <div className="cwo-pie-wrap cwo-pie-wrap--locavail">
            <Chart
              type="donut"
              height={chartSize}
              width={chartSize}
              options={availabilityOptions}
              series={[availability.activeToday, availability.notAvailableToday]}
            />
            <div className="cwo-pie-wrap__center" aria-hidden="true">
              <span className="cwo-pie-wrap__value">{availability.attendanceRate}%</span>
              <span className="cwo-pie-wrap__label">Attendance</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
