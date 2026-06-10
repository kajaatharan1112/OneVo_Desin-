import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import { WidgetLead } from './widget-lead';

export const PerformanceSpotlightPanel: React.FC = () => {
  const { breakdown, summary } = ceoDashboardData.companyPerformance;

  const { strongest, watch } = useMemo(() => {
    const sorted = [...breakdown].sort((a, b) => b.rate - a.rate);
    return { strongest: sorted[0], watch: sorted[sorted.length - 1] };
  }, [breakdown]);

  const strongDelta = strongest.rate - summary.scorePercent;
  const watchDelta = watch.rate - summary.scorePercent;

  return (
    <article className="cwo-widget cpg-cell--spotlight">
      <header className="cwo-widget__head">
        <Sparkles size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Best &amp; worst</h4>
      </header>
      <WidgetLead
        value="Compared to 86% company avg"
        caption="Green = above avg · Amber = below avg — focus on Watch area"
      />
      <ul className="cpg-spotlight-list">
        <li className="cpg-spotlight-card cpg-spotlight-card--strong">
          <span className="cpg-spotlight-card__tag">Best area</span>
          <span className="cpg-spotlight-card__name">{strongest.label}</span>
          <div className="cpg-spotlight-card__foot">
            <span className="cpg-spotlight-card__value">{strongest.rate}%</span>
            <span className="cpg-spotlight-card__delta">
              {strongDelta >= 0 ? '+' : ''}
              {strongDelta} vs avg
            </span>
          </div>
        </li>
        <li className="cpg-spotlight-card cpg-spotlight-card--watch">
          <span className="cpg-spotlight-card__tag">Needs focus</span>
          <span className="cpg-spotlight-card__name">{watch.label}</span>
          <div className="cpg-spotlight-card__foot">
            <span className="cpg-spotlight-card__value">{watch.rate}%</span>
            <span className="cpg-spotlight-card__delta">
              {watchDelta >= 0 ? '+' : ''}
              {watchDelta} vs avg
            </span>
          </div>
        </li>
      </ul>
    </article>
  );
};
