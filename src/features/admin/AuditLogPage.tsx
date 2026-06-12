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

const MODULE_OPTIONS = ['Users', 'Roles', 'Security', 'Employees', 'Leave'];
const RESOURCE_TYPES = ['User', 'Role', 'UserRole', 'Session'];

export const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actorFilter, setActorFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [detailEntry, setDetailEntry] = useState<AuditLogEntry | null>(null);

  const actors = useMemo(() => {
    const names = new Set(MOCK_AUDIT_LOG.map(e => e.actorName).filter(Boolean));
    return Array.from(names).sort();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const summary = useMemo(() => {
    const todayEntries = MOCK_AUDIT_LOG.filter(e => e.timestamp.startsWith(today));
    return {
      changesToday: todayEntries.length,
      accessChanges: MOCK_AUDIT_LOG.filter(e =>
        e.action.includes('permission') || e.action.includes('role') || e.action.includes('login')
      ).length,
      securityEvents: MOCK_AUDIT_LOG.filter(e =>
        e.module === 'Security' || e.action.includes('auth.')
      ).length,
      failedActions: MOCK_AUDIT_LOG.filter(e => e.status === 'failed').length,
    };
  }, [today]);

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
      if (resourceFilter !== 'all' && e.resourceType !== resourceFilter) return false;
      if (moduleFilter !== 'all' && e.module !== moduleFilter) return false;
      return true;
    });
  }, [search, dateFrom, dateTo, actorFilter, actionFilter, resourceFilter, moduleFilter]);

  const exportCsv = () => {
    const headers = ['Time', 'Actor', 'Action', 'Resource', 'Module', 'IP Address', 'Status'];
    const rows = filtered.map(e => [
      formatDateTime(e.timestamp),
      e.actorName,
      e.action,
      `${e.resourceType}: ${e.resourceName}`,
      e.module,
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
            Read-only compliance history of important system and admin actions.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--secondary" onClick={exportCsv}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Changes Today</span>
          <strong>{summary.changesToday}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Access Changes</span>
          <strong>{summary.accessChanges}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Security Events</span>
          <strong>{summary.securityEvents}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Failed Actions</span>
          <strong>{summary.failedActions}</strong>
        </div>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search audit log…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input
          type="date"
          className="cfg-filter-select"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="cfg-filter-select"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          title="To date"
        />
        <select className="cfg-filter-select" value={actorFilter} onChange={e => setActorFilter(e.target.value)}>
          <option value="all">All actors</option>
          {actors.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select className="cfg-filter-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="all">All actions</option>
          {ACTION_OPTIONS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select className="cfg-filter-select" value={resourceFilter} onChange={e => setResourceFilter(e.target.value)}>
          <option value="all">All resource types</option>
          {RESOURCE_TYPES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select className="cfg-filter-select" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
          <option value="all">All modules</option>
          {MODULE_OPTIONS.map(m => (
            <option key={m} value={m}>{m}</option>
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
                <th>Action</th>
                <th>Resource</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Status</th>
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
                  <td>{e.module}</td>
                  <td>{e.ipAddress}</td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${e.status === 'success' ? 'success' : 'failed'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>
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
                  <span className="admin-detail-row__label">Resource Type</span>
                  <span className="admin-detail-row__value">{detailEntry.resourceType}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Resource</span>
                  <span className="admin-detail-row__value">
                    {detailEntry.resourceName} ({detailEntry.resourceId})
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
