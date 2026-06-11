import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Copy, Edit, Pause, Play, Trash2 } from 'lucide-react';
import { useAutomationStore } from '../../store/automationStore';
import { AutomationTemplatePicker } from './AutomationTemplatePicker';

const AREAS = ['Employee Lifecycle', 'Leave', 'Attendance', 'Organization', 'Documents', 'Monitoring'];

function formatRelative(iso: string | null) {
  if (!iso) return 'Never';
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export const AutomationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { automations, createFromTemplate, duplicateAutomation, setAutomationStatus, deleteAutomation } = useAutomationStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  const filtered = useMemo(() => automations.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.summary.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (areaFilter !== 'all' && a.area !== areaFilter) return false;
    return true;
  }), [automations, search, statusFilter, areaFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteAutomation(id);
    }
  };

  const handleToggleStatus = (id: string, status: string) => {
    setAutomationStatus(id, status === 'active' ? 'paused' : 'active');
  };

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Automations</h1>
          <p className="cfg-page__subtitle">When something happens, automatically take action</p>
        </div>
      </div>

      <section className="auto-list-create">
        <AutomationTemplatePicker
          embedded
          onSelect={templateId => {
            const newId = createFromTemplate(templateId);
            navigate(`/automations/${newId}`);
          }}
        />
      </section>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search automations…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="cfg-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
        <select className="cfg-filter-select" value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
          <option value="all">All areas</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Automation</th>
                <th>Trigger</th>
                <th>Area</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Alerts</th>
                <th>Open</th>
                <th>Failures</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="cfg-table__name">{a.name}</div>
                    <div className="cfg-table__meta">{a.summary}</div>
                  </td>
                  <td>{a.trigger || '—'}</td>
                  <td>{a.area}</td>
                  <td><span className={`cfg-badge cfg-badge--${a.status}`}>{a.status}</span></td>
                  <td>{formatRelative(a.lastRunAt)}</td>
                  <td>{a.alertsCreated}</td>
                  <td>{a.openAlerts}</td>
                  <td style={{ color: a.failureCount > 0 ? '#991b1b' : undefined }}>{a.failureCount}</td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      <button type="button" className="cfg-action-btn" onClick={() => navigate(`/automations/${a.id}`)}>
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => {
                          const nid = duplicateAutomation(a.id);
                          if (nid) navigate(`/automations/${nid}`);
                        }}
                      >
                        <Copy size={13} /> Duplicate
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => handleToggleStatus(a.id, a.status)}
                      >
                        {a.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        {a.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--danger"
                        onClick={() => handleDelete(a.id, a.name)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="cfg-empty">
              <p className="cfg-empty__title">No automations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
