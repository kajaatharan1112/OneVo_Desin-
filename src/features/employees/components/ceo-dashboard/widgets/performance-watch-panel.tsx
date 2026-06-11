import React from 'react';
import { AlertTriangle, BellRing, CircleAlert } from 'lucide-react';

type WatchSeverity = 'critical' | 'warning';

interface WatchItem {
  id: string;
  title: string;
  metric?: string;
  reason: string;
  severity: WatchSeverity;
}

const WATCH_ITEMS: WatchItem[] = [
  {
    id: 'w1',
    title: 'Analytics Dashboard',
    metric: '76%',
    reason: 'Design approval pending',
    severity: 'warning'
  },
  {
    id: 'w2',
    title: 'Mobile App Release',
    metric: '48%',
    reason: 'Blocked delivery item',
    severity: 'critical'
  },
  {
    id: 'w3',
    title: 'Attendance Today',
    metric: '76%',
    reason: 'Below company target',
    severity: 'warning'
  },
  {
    id: 'w4',
    title: 'Support Response',
    reason: 'Needs attention',
    severity: 'warning'
  }
];

function WatchIcon({ severity }: { severity: WatchSeverity }) {
  if (severity === 'critical') {
    return <CircleAlert size={13} aria-hidden="true" />;
  }
  return <AlertTriangle size={13} aria-hidden="true" />;
}

export const PerformanceWatchPanel: React.FC = () => (
  <article className="cpg-card cpg-card--watch cpg-cell--watch">
    <header className="cpg-card__head">
      <div className="cpg-card__title-block">
        <span className="cpg-card__icon cpg-watch__head-icon" aria-hidden="true">
          <BellRing size={16} />
        </span>
        <div>
          <h3 className="cpg-card__title">Watch List</h3>
          <p className="cpg-card__subtitle">Items needing review</p>
        </div>
      </div>
      <span className="cpg-badge cpg-badge--neutral">{WATCH_ITEMS.length} items</span>
    </header>

    <ul className="cpg-watch__list" aria-label="Watch list items">
      {WATCH_ITEMS.map((item) => (
        <li key={item.id} className={`cpg-watch__row cpg-watch__row--${item.severity}`}>
          <span className="cpg-watch__row-icon" aria-hidden="true">
            <WatchIcon severity={item.severity} />
          </span>
          <div className="cpg-watch__row-copy">
            <div className="cpg-watch__row-top">
              <p className="cpg-watch__row-title">{item.title}</p>
              {item.metric ? <span className="cpg-watch__row-metric">{item.metric}</span> : null}
            </div>
            <p className="cpg-watch__row-reason">{item.reason}</p>
          </div>
          <span className={`cpg-watch__row-tag cpg-watch__row-tag--${item.severity}`}>
            {item.severity === 'critical' ? 'Critical' : 'Warn'}
          </span>
        </li>
      ))}
    </ul>
  </article>
);
