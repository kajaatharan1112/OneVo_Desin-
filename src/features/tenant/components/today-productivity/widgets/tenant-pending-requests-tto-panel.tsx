import React from 'react';
import { ClipboardList } from 'lucide-react';
import { executiveDashboard } from '../../../data/executive-dashboard.data';
import { pendingApprovalsToday } from '../../../data/tenant-today-productivity.data';

export const TenantPendingRequestsTtoPanel: React.FC = () => (
  <article className="tto-widget tto-pending tto-cell--pending" aria-label="Pending requests">
    <header className="tto-widget__head">
      <ClipboardList size={16} aria-hidden="true" />
      <h3 className="tto-widget__title">{executiveDashboard.pendingRequests.title}</h3>
      <span className="tto-widget__tab">Need approval today</span>
    </header>

    <ul className="tto-pending__list">
      {pendingApprovalsToday.map((item) => (
        <li
          key={item.id}
          className={`tto-pending__item tto-pending__item--card${item.pendingEmphasis ? ' tto-pending__item--high' : ''}`}
        >
          <span className="tto-status-icon" aria-hidden="true">
            <ClipboardList size={14} />
          </span>

          <div className="tto-pending__info">
            <div className="tto-pending__row">
              <span className="tto-pending__title">{item.request}</span>
              <span className="tto-pending__badge">
                {item.pendingDays} {item.pendingDays === 1 ? 'day' : 'days'} pending
              </span>
            </div>

            <span className="tto-pending__meta">{item.category}</span>

            <div className="tto-pending__details">
              <span>{item.requestedAt}</span>
            </div>

            <div className="tto-pending__actions">
              <button type="button" className="tto-pending__btn tto-pending__btn--approve">
                Approve
              </button>
              <button type="button" className="tto-pending__btn tto-pending__btn--reject">
                Reject
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </article>
);
