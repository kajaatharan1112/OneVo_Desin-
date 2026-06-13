import React from 'react';
import { X } from 'lucide-react';
import type { NotificationDelivery, NotificationTypeDef } from '../notificationDefaultsData';

interface NotificationPreviewDrawerProps {
  notification: NotificationTypeDef;
  delivery: NotificationDelivery;
  emailAvailable: boolean;
  onClose: () => void;
}

export const NotificationPreviewDrawer: React.FC<NotificationPreviewDrawerProps> = ({
  notification,
  delivery,
  emailAvailable,
  onClose,
}) => {
  const channels = [
    delivery.inApp && 'In-app',
    delivery.email && emailAvailable && 'Email',
    delivery.inbox && 'Inbox',
  ].filter(Boolean);

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow"
        role="dialog"
        aria-modal="true"
        aria-label="Notification preview"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>{notification.name}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="org-slideover__body">
          <div className="admin-detail-grid">
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Event key</span>
              <span className="admin-detail-row__value admin-detail-row__value--mono">{notification.eventKey}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Category</span>
              <span className="admin-detail-row__value">{notification.category}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-row__label">Recipients</span>
              <span className="admin-detail-row__value">{notification.preview.recipients}</span>
            </div>
          </div>

          <div className="admin-section">
            <h3>In-app preview</h3>
            <div className="notif-preview-card">
              <div className="notif-preview-card__title">{notification.name}</div>
              <div className="notif-preview-card__body">{notification.preview.inApp}</div>
            </div>
          </div>

          {delivery.email && emailAvailable && (
            <div className="admin-section">
              <h3>Email preview</h3>
              <div className="notif-preview-card notif-preview-card--email">
                <div className="notif-preview-card__subject">{notification.preview.emailSubject}</div>
                <div className="notif-preview-card__body">{notification.preview.emailBody}</div>
              </div>
            </div>
          )}

          <div className="admin-section">
            <h3>Delivery rules</h3>
            <p className="admin-hint">{notification.preview.rules}</p>
            <div className="admin-review-list">
              {channels.length > 0 ? (
                channels.map((ch, i) => (
                  <span key={`${ch}-${i}`} className="admin-review-chip">{ch}</span>
                ))
              ) : (
                <span className="cfg-table__meta">No delivery channels enabled</span>
              )}
            </div>
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
