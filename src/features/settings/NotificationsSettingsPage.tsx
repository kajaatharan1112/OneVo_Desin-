import React, { useMemo, useState } from 'react';
import { Eye, RotateCcw, Search } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import { NotificationPreviewDrawer } from './components/NotificationPreviewDrawer';
import { TENANT_MONITORING_CAPABILITY } from './settingsConfig';
import {
  buildInitialDeliveries,
  buildNotificationCatalog,
  cloneDelivery,
  NOTIFICATION_CATEGORIES,
  serializeDeliveries,
  type DeliveryMethodFilter,
  type NotificationDelivery,
  type NotificationTypeDef,
} from './notificationDefaultsData';

type DeliveryChannel = keyof NotificationDelivery;

const EMAIL_VERIFIED = true;

function deliveryMatchesFilter(d: NotificationDelivery, method: DeliveryMethodFilter | 'all'): boolean {
  if (method === 'all') return true;
  if (method === 'in-app') return d.inApp;
  if (method === 'email') return d.email;
  return d.inbox;
}

export const NotificationsSettingsPage: React.FC = () => {
  const catalog = useMemo(
    () => buildNotificationCatalog(TENANT_MONITORING_CAPABILITY),
    []
  );
  const baseline = useMemo(() => buildInitialDeliveries(catalog), [catalog]);
  const baselineSerialized = useMemo(() => serializeDeliveries(catalog, baseline), [catalog, baseline]);

  const [deliveries, setDeliveries] = useState<Record<string, NotificationDelivery>>(() => baseline);
  const [savedSnapshot, setSavedSnapshot] = useState(baselineSerialized);
  const [senderName, setSenderName] = useState('Acme HR');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState<DeliveryMethodFilter | 'all'>('all');
  const [actionableOnly, setActionableOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const dirty = serializeDeliveries(catalog, deliveries) !== savedSnapshot;

  const visibleCategories = useMemo(
    () => NOTIFICATION_CATEGORIES.filter(
      c => c !== 'Exceptions / Monitoring' || TENANT_MONITORING_CAPABILITY
    ),
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return catalog.filter(n => {
      const d = deliveries[n.id] ?? n.defaults;
      if (q && !`${n.name} ${n.description} ${n.category}`.toLowerCase().includes(q)) return false;
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (actionableOnly && !n.actionable) return false;
      if (!deliveryMatchesFilter(d, methodFilter)) return false;
      return true;
    });
  }, [catalog, deliveries, search, categoryFilter, methodFilter, actionableOnly]);

  const previewNotification = previewId ? catalog.find(n => n.id === previewId) : null;

  const patchDelivery = (id: string, channel: DeliveryChannel, value: boolean) => {
    setDeliveries(prev => {
      const def = catalog.find(n => n.id === id);
      if (!def) return prev;
      return { ...prev, [id]: { ...(prev[id] ?? def.defaults), [channel]: value } };
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(n => n.id)));
    }
  };

  const applyToSelected = (patch: Partial<NotificationDelivery>) => {
    if (selectedIds.size === 0) return;
    setDeliveries(prev => {
      const next = { ...prev };
      for (const id of selectedIds) {
        const def = catalog.find(n => n.id === id);
        if (!def) continue;
        next[id] = { ...(next[id] ?? def.defaults), ...patch };
      }
      return next;
    });
  };

  const resetSelected = () => {
    if (selectedIds.size === 0) return;
    setDeliveries(prev => {
      const next = { ...prev };
      for (const id of selectedIds) {
        const def = catalog.find(n => n.id === id);
        if (def) next[id] = cloneDelivery(def.defaults);
      }
      return next;
    });
  };

  const resetAll = () => {
    if (!window.confirm('Reset all notification delivery defaults to OneVo defaults?')) return;
    setDeliveries(buildInitialDeliveries(catalog));
    setSelectedIds(new Set());
  };

  const handleSave = () => {
    setSavedSnapshot(serializeDeliveries(catalog, deliveries));
  };

  const renderToggle = (
    n: NotificationTypeDef,
    channel: DeliveryChannel,
    disabled: boolean,
    title?: string
  ) => {
    const d = deliveries[n.id] ?? n.defaults;
    return (
      <input
        type="checkbox"
        checked={d[channel]}
        disabled={disabled}
        title={title}
        aria-label={`${n.name} — ${channel}`}
        onChange={e => patchDelivery(n.id, channel, e.target.checked)}
      />
    );
  };

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="Notifications"
        description="Manage tenant notification defaults for in-app, email, and actionable Inbox delivery."
        actions={
          <>
            {dirty && (
              <span className="notif-unsaved-badge">Unsaved changes</span>
            )}
            <button
              type="button"
              className="org-btn org-btn--primary"
              disabled={!dirty}
              onClick={handleSave}
            >
              Save Changes
            </button>
          </>
        }
      />

      <div className="settings-body">
        <section className="settings-card settings-card--compact">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Delivery Status</h2>
          </header>
          <div className="settings-card__body">
            <div className="notif-status-row">
              <div className="notif-status-chip">
                <span className="notif-status-chip__label">In-app</span>
                <span className="cfg-badge cfg-badge--active">Active</span>
              </div>
              <div className="notif-status-chip">
                <span className="notif-status-chip__label">Email</span>
                <span className={`cfg-badge cfg-badge--${EMAIL_VERIFIED ? 'success' : 'failed'}`}>
                  {EMAIL_VERIFIED ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <div className="notif-status-chip">
                <span className="notif-status-chip__label">Inbox</span>
                <span className="cfg-badge cfg-badge--active">Active</span>
              </div>
            </div>
            <div className="notif-sender-row">
              <div className="org-form-field org-form-field--compact">
                <label htmlFor="sender-name">Sender name</label>
                <input
                  id="sender-name"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                />
              </div>
              <div className="notif-sender-meta">
                <span><strong>Sender:</strong> notifications@acme.com</span>
                <span className="cfg-badge cfg-badge--success">Domain verified</span>
                <span className="cfg-badge cfg-badge--active">Delivery healthy</span>
              </div>
            </div>
            {!EMAIL_VERIFIED && (
              <p className="admin-hint admin-hint--warning">
                Email is not verified. Email delivery toggles are disabled until domain verification completes.
              </p>
            )}
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Notification Defaults</h2>
          </header>

          <div className="cfg-page__toolbar notif-toolbar">
            <div className="cfg-search">
              <Search size={14} />
              <input
                placeholder="Search notifications…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="cfg-filter-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {visibleCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="cfg-filter-select"
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value as DeliveryMethodFilter | 'all')}
            >
              <option value="all">All delivery methods</option>
              <option value="in-app">In-app enabled</option>
              <option value="email">Email enabled</option>
              <option value="inbox">Inbox enabled</option>
            </select>
            <label className="notif-filter-check">
              <input type="checkbox" checked={actionableOnly} onChange={e => setActionableOnly(e.target.checked)} />
              Actionable only
            </label>
          </div>

          <div className="notif-bulk-bar">
            <span className="cfg-table__meta">{selectedIds.size} selected</span>
            <button
              type="button"
              className="cfg-action-btn"
              disabled={selectedIds.size === 0 || !EMAIL_VERIFIED}
              onClick={() => applyToSelected({ email: true })}
            >
              Enable email for selected
            </button>
            <button
              type="button"
              className="cfg-action-btn"
              disabled={selectedIds.size === 0 || !EMAIL_VERIFIED}
              onClick={() => applyToSelected({ email: false })}
            >
              Disable email for selected
            </button>
            <button
              type="button"
              className="cfg-action-btn"
              disabled={selectedIds.size === 0}
              onClick={resetSelected}
            >
              <RotateCcw size={13} /> Reset selected to defaults
            </button>
            <button type="button" className="cfg-action-btn" onClick={resetAll}>
              <RotateCcw size={13} /> Reset all to OneVo defaults
            </button>
          </div>

          <div className="cfg-table-wrap notif-matrix-wrap">
            <table className="cfg-table notif-matrix">
              <thead>
                <tr>
                  <th className="notif-matrix__check">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all visible notifications"
                    />
                  </th>
                  <th>Category</th>
                  <th>Notification</th>
                  <th>Description</th>
                  <th className="notif-matrix__channel">In-app</th>
                  <th className="notif-matrix__channel">Email</th>
                  <th className="notif-matrix__channel">Inbox</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => {
                  const emailDisabled = !EMAIL_VERIFIED;
                  return (
                    <tr key={n.id}>
                      <td className="notif-matrix__check">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(n.id)}
                          onChange={() => toggleSelect(n.id)}
                          aria-label={`Select ${n.name}`}
                        />
                      </td>
                      <td><span className="cfg-table__meta">{n.category}</span></td>
                      <td className="cfg-table__name">{n.name}</td>
                      <td><span className="cfg-table__meta">{n.description}</span></td>
                      <td className="notif-matrix__channel">{renderToggle(n, 'inApp', false)}</td>
                      <td className="notif-matrix__channel">
                        {renderToggle(
                          n,
                          'email',
                          emailDisabled,
                          emailDisabled ? 'Email unavailable until domain is verified' : undefined
                        )}
                      </td>
                      <td className="notif-matrix__channel">
                        {renderToggle(
                          n,
                          'inbox',
                          !n.actionable,
                          !n.actionable ? 'Inbox is for actionable notifications only' : undefined
                        )}
                      </td>
                      <td>
                        <button type="button" className="cfg-action-btn" onClick={() => setPreviewId(n.id)}>
                          <Eye size={13} /> Preview
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="cfg-empty">
                <p className="cfg-empty__title">No notifications match your filters</p>
              </div>
            )}
          </div>

          <div className="notif-legend">
            <p className="admin-hint">
              <strong>In-app</strong> — FYI notifications in the bell.{' '}
              <strong>Inbox</strong> — actionable items needing approval, acknowledgement, or review.{' '}
              <strong>Email</strong> — external delivery through your verified sender.
            </p>
          </div>
        </section>
      </div>

      {previewNotification && (
        <NotificationPreviewDrawer
          notification={previewNotification}
          delivery={deliveries[previewNotification.id] ?? previewNotification.defaults}
          emailAvailable={EMAIL_VERIFIED}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
};
