import React, { useMemo, useState } from 'react';
import { Search, Download, Eye, X } from 'lucide-react';
import {
  MOCK_AUDIT_LOG,
  formatDateTime,
  type AuditLogEntry,
} from './adminMockData';

const ACTION_OPTIONS = [
  'user.invited',
  'user.login.disabled',
  'role.permissions.updated',
  'role.assigned',
  'role.created',
  'user.permissions.overridden',
  'auth.login.failed',
];

export const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actorFilter, setActorFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [detailEntry, setDetailEntry] = useState<AuditLogEntry | null>(null);

  const actors = useMemo(() => {
    const names = new Set(MOCK_AUDIT_LOG.map(e => e.actorName).filter(Boolean));
    return Array.from(names).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_AUDIT_LOG.filter(e => {
      if (q) {
        const haystack = `${e.actorName} ${e.action} ${e.resourceName} ${e.resourceType}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (dateFrom && e.timestamp.slice(0, 10) < dateFrom) return false;
      if (dateTo && e.timestamp.slice(0, 10) > dateTo) return false;
      if (actorFilter !== 'all' && e.actorName !== actorFilter) return false;
      if (actionFilter !== 'all' && e.action !== actionFilter) return false;
      return true;
    });
  }, [search, dateFrom, dateTo, actorFilter, actionFilter]);

  const exportCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Resource', 'IP Address', 'Status'];
    const rows = filtered.map(e => [
      formatDateTime(e.timestamp),
      e.actorName,
      e.action,
      `${e.resourceType}: ${e.resourceName}`,
      e.ipAddress,
      e.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Audit Log</h1>
          <p className="cfg-page__subtitle">
            Review tenant activity, security changes, and configuration history.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--secondary" onClick={exportCsv}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search audit log…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="cfg-search" style={{ gap: 6 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--nexus-text-secondary)' }}>Date range</label>
          <input
            type="date"
            className="cfg-filter-select"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            title="From date"
          />
          <span style={{ color: 'var(--nexus-text-secondary)' }}>–</span>
          <input
            type="date"
            className="cfg-filter-select"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            title="To date"
          />
        </div>
        <select className="cfg-filter-select" value={actorFilter} onChange={e => setActorFilter(e.target.value)}>
          <option value="all">All actors</option>
          {actors.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select className="cfg-filter-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="all">All events</option>
          {ACTION_OPTIONS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Event</th>
                <th>Target</th>
                <th>Source</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>{formatDateTime(e.timestamp)}</td>
                  <td>{e.actorName || 'System'}</td>
                  <td><code style={{ fontSize: '0.72rem' }}>{e.action}</code></td>
                  <td>
                    <div className="cfg-table__name">{e.resourceName}</div>
                    <div className="cfg-table__meta">{e.resourceType}</div>
                  </td>
                  <td>{e.ipAddress}</td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${e.status === 'success' ? 'success' : 'failed'}`}>
                      {e.status}
                    </span>
                    <button type="button" className="cfg-action-btn" onClick={() => setDetailEntry(e)}>
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="cfg-empty">
              <p className="cfg-empty__title">No audit entries match your filters</p>
            </div>
          )}
        </div>
      </div>

      {detailEntry && (
        <div className="org-slideover-backdrop" onClick={() => setDetailEntry(null)}>
          <div
            className="org-slideover org-slideover--wide"
            role="dialog"
            aria-modal="true"
            aria-label="Audit detail"
            onClick={ev => ev.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>Audit Detail</h2>
              <button type="button" className="org-slideover__close" onClick={() => setDetailEntry(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="admin-detail-grid">
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Actor</span>
                  <span className="admin-detail-row__value">{detailEntry.actorName || 'System'}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Action</span>
                  <span className="admin-detail-row__value admin-detail-row__value--mono">{detailEntry.action}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Resource</span>
                  <span className="admin-detail-row__value">
                    {detailEntry.resourceType}: {detailEntry.resourceName} ({detailEntry.resourceId})
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Timestamp</span>
                  <span className="admin-detail-row__value">{formatDateTime(detailEntry.timestamp)}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">IP Address</span>
                  <span className="admin-detail-row__value">{detailEntry.ipAddress}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Correlation ID</span>
                  <span className="admin-detail-row__value admin-detail-row__value--mono">{detailEntry.correlationId}</span>
                </div>
              </div>

              <div className="admin-section">
                <h3>Before Values</h3>
                {detailEntry.beforeValues ? (
                  <pre className="admin-json-block">{JSON.stringify(detailEntry.beforeValues, null, 2)}</pre>
                ) : (
                  <p className="cfg-table__meta">—</p>
                )}
              </div>

              <div className="admin-section">
                <h3>After Values</h3>
                {detailEntry.afterValues ? (
                  <pre className="admin-json-block">{JSON.stringify(detailEntry.afterValues, null, 2)}</pre>
                ) : (
                  <p className="cfg-table__meta">—</p>
                )}
              </div>
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setDetailEntry(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
