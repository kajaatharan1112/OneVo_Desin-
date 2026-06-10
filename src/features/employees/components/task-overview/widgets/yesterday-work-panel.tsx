import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import {
  yesterdayAllClear,
  yesterdayStatusDateLabel,
  yesterdayWork
} from '../../../data/employee-task-overview.data';
import type { YesterdayWorkItem } from '../../../data/employee-task-overview.data';

function statusIcon(status: YesterdayWorkItem['status']) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 size={14} />;
    case 'issue':
      return <AlertCircle size={14} />;
    case 'pending':
      return <Clock size={14} />;
    default:
      return <ShieldCheck size={14} />;
  }
}

export const YesterdayWorkPanel: React.FC = () => {
  return (
    <article className="eto-widget eto-status-panel eto-cell--yesterday">
      <header className="eto-widget__head">
        <ShieldCheck size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Yesterday status</h3>
        <span className="eto-widget__tab">{yesterdayStatusDateLabel}</span>
      </header>

      {yesterdayAllClear ? (
        <div className="eto-status-panel__banner">
          <p className="eto-status-panel__banner-title">All clear</p>
          <p className="eto-status-panel__banner-desc">
            {yesterdayWork.length} works completed · PRs approved · no open complaints
          </p>
        </div>
      ) : null}

      <ul className="eto-status-panel__list">
        {yesterdayWork.map((item) => (
          <li key={item.id} className={`eto-status-panel__item eto-status-panel__item--${item.status}`}>
            <span className="eto-status-panel__icon" aria-hidden="true">
              {statusIcon(item.status)}
            </span>
            <div className="eto-status-panel__copy">
              <span className="eto-status-panel__title">{item.title}</span>
              <span className="eto-status-panel__detail">{item.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
