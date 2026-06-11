import React from 'react';
import { Layers } from 'lucide-react';
import { ActivityRingChart } from '../../task-overview/widgets/activity-ring-chart';
import { ceoDashboardData } from '../data/ceo-dashboard.data';

export const PerformanceDriversPanel: React.FC = () => {
  const { breakdown, productKpis, employeeKpis } = ceoDashboardData.companyPerformance;
  const deliveryRate = breakdown.find((item) => item.id === 'delivery')?.rate ?? 82;
  const productivityRate = breakdown.find((item) => item.id === 'productivity')?.rate ?? 81;
  const csatKpi = productKpis.find((kpi) => kpi.id === 'pk3');
  const attendanceKpi = employeeKpis.find((kpi) => kpi.id === 'ek2');

  return (
    <article className="eto-widget cpg-cell--drivers cpg-drivers-panel">
      <header className="eto-widget__head">
        <Layers size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Drivers</h3>
        <span className="eto-widget__meta">Product &amp; employee</span>
      </header>

      <div className="cpg-drivers-split">
        <section className="cpg-drivers-split__col" aria-label="Product delivery">
          <span className="cpg-drivers-split__label">Product</span>
          <div className="cpg-drivers-split__ring">
            <ActivityRingChart
              variant="attendance"
              percent={deliveryRate}
              centerValue={`${deliveryRate}%`}
              centerLabel="delivery"
              caption={csatKpi ? `${csatKpi.value} CSAT` : 'On-time delivery'}
            />
          </div>
        </section>

        <section className="cpg-drivers-split__col" aria-label="Employee productivity">
          <span className="cpg-drivers-split__label">Employee</span>
          <div className="cpg-drivers-split__ring">
            <ActivityRingChart
              variant="attendance"
              percent={productivityRate}
              centerValue={`${productivityRate}%`}
              centerLabel="productivity"
              caption={
                attendanceKpi ? `${attendanceKpi.value} attendance` : 'Team output'
              }
            />
          </div>
        </section>
      </div>
    </article>
  );
};
