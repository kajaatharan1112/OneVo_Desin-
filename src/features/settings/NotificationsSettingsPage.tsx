import React, { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import {
  buildInitialDeliveries,
  NOTIFICATION_CATALOG,
  NOTIFICATION_CATEGORIES,
  serializeDeliveries,
  type NotificationDelivery,
} from './notificationDefaultsData';

type DeliveryChannel = keyof NotificationDelivery;

export const NotificationsSettingsPage: React.FC = () => {
  const baseline = useMemo(() => buildInitialDeliveries(NOTIFICATION_CATALOG), []);
  const baselineSerialized = useMemo(() => serializeDeliveries(NOTIFICATION_CATALOG, baseline), [baseline]);

  const [deliveries, setDeliveries] = useState<Record<string, NotificationDelivery>>(() => baseline);
  const [savedSnapshot, setSavedSnapshot] = useState(baselineSerialized);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const dirty = serializeDeliveries(NOTIFICATION_CATALOG, deliveries) !== savedSnapshot;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return NOTIFICATION_CATALOG.filter(n => {
      if (q && !`${n.name} ${n.description} ${n.category}`.toLowerCase().includes(q)) return false;
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      return true;
    });
  }, [search, categoryFilter]);


  const patchDelivery = (id: string, channel: DeliveryChannel, value: boolean) => {
    setDeliveries(prev => {
      const def = NOTIFICATION_CATALOG.find(n => n.id === id);
      if (!def) return prev;
      return { ...prev, [id]: { ...(prev[id] ?? def.defaults), [channel]: value } };
    });
  };

  const handleSave = () => {
    setSavedSnapshot(serializeDeliveries(NOTIFICATION_CATALOG, deliveries));
  };

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="Notifications"
        description="Choose which events send in-app and email notifications."
        icon={<Bell size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search notifications...',
          label: 'Search notifications'
        }}
        actions={
          <button
            type="button"
            className="org-btn org-btn--primary"
            disabled={!dirty}
            onClick={handleSave}
          >
            Save Changes
          </button>
        }
      />

      <div className="settings-body">
        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Notification Defaults</h2>
          </header>

          <div className="cfg-page__toolbar notif-toolbar">
            <select
              className="cfg-filter-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {NOTIFICATION_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="cfg-table-wrap notif-matrix-wrap">
            <table className="cfg-table notif-matrix">
              <thead>
                <tr>
                  <th>Notification</th>
                  <th>Category</th>
                  <th className="notif-matrix__channel">In-app</th>
                  <th className="notif-matrix__channel">Email</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(n => {
                  const d = deliveries[n.id] ?? n.defaults;
                  return (
                    <tr key={n.id}>
                      <td>
                        <div className="cfg-table__name">{n.name}</div>
                        <div className="cfg-table__meta">{n.description}</div>
                      </td>
                      <td><span className="cfg-table__meta">{n.category}</span></td>
                      <td className="notif-matrix__channel">
                        <input
                          type="checkbox"
                          checked={d.inApp}
                          aria-label={`${n.name} — in-app`}
                          onChange={e => patchDelivery(n.id, 'inApp', e.target.checked)}
                        />
                      </td>
                      <td className="notif-matrix__channel">
                        <input
                          type="checkbox"
                          checked={d.email}
                          aria-label={`${n.name} — email`}
                          onChange={e => patchDelivery(n.id, 'email', e.target.checked)}
                        />
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
        </section>
      </div>

    </div>
  );
};
