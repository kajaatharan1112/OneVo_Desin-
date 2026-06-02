import React from 'react';
import { ClipboardCheck, FileText } from 'lucide-react';
import { pendingApprovalsToday } from '../../../data/tenant-today-productivity.data';

export const PendingRequestsPanel: React.FC = () => {
  return (
    <article className="tto-widget tto-pending tto-cell--pending">
      <header className="tto-widget__head">
        <ClipboardCheck size={16} aria-hidden="true" />
        <h3 className="tto-widget__title">Pending requests</h3>
        <span className="tto-widget__tab">Need approval today</span>
      </header>
      <ul className="tto-pending__list">
        {pendingApprovalsToday.map((item) => (
          <li key={item.id} className={`tto-pending__item tto-pending__item--${item.priority}`}>
            <span className="tto-status-icon" aria-hidden="true">
              <FileText size={14} />
            </span>
            {/* LEFT: title + meta + details */}
            <div className="tto-pending__info">
              <span className="tto-pending__title">{item.title}</span>
              <span className="tto-pending__meta">{item.module} · {item.requestedBy}</span>
              <div className="tto-pending__details">
                <span className="tto-pending__time">{item.requestedAt}</span>
                <span className="tto-pending__dot">·</span>
                <span className="tto-pending__duration">{item.pendingDays} {item.pendingDays === 1 ? 'day' : 'days'} pending</span>
              </div>
            </div>
            {/* RIGHT: action buttons */}
            <div className="tto-pending__right">
              <div className="tto-pending__actions">
                <button
                  type="button"
                  className="tto-pending__btn tto-pending__btn--approve"
                  title="Approve"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="tto-pending__btn tto-pending__btn--reject"
                  title="Reject"
                >
                  Reject
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
