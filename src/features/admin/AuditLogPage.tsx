import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, History } from 'lucide-react';
import { ConfigShellHeader } from '../../shared/components/config-shell-header/ConfigShellHeader';
import { downloadCsv, downloadSimplePdf } from '../../shared/utils/exportUtils';
import { useHistoryStore, type HistoryCategory } from '../../store/historyStore';

const categories: Array<'All' | HistoryCategory> = [
  'All',
  'People',
  'Organization',
  'Access',
  'Leave',
  'Attendance',
  'Work',
  'Calendar',
  'Billing',
  'Settings',
];

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const isToday = (value: string) => {
  const current = new Date();
  const date = new Date(value);
  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth() &&
    current.getDate() === date.getDate()
  );
};

export const AuditLogPage: React.FC = () => {
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const entries = useHistoryStore(state => state.entries);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | HistoryCategory>('All');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [exportMenuOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter(entry => {
      if (category !== 'All' && entry.category !== category) return false;
      if (!query) return true;
      return `${entry.actor} ${entry.title} ${entry.description} ${entry.target ?? ''} ${entry.category}`
        .toLowerCase()
        .includes(query);
    });
  }, [entries, search, category]);

  const summary = useMemo(
    () => ({
      total: entries.length,
      today: entries.filter(entry => isToday(entry.createdAt)).length,
      access: entries.filter(entry => entry.category === 'Access').length,
      organization: entries.filter(entry => entry.category === 'Organization').length,
    }),
    [entries],
  );

  const exportHistory = (format: 'csv' | 'pdf') => {
    setExportMenuOpen(false);
    const rows = [
      ['Time', 'Person', 'Activity', 'Details', 'Area'],
      ...filtered.map(entry => [
        formatTime(entry.createdAt),
        entry.actor,
        entry.title,
        entry.description,
        entry.category,
      ]),
    ];

    if (format === 'csv') {
      downloadCsv('onevo-history.csv', rows);
      return;
    }

    downloadSimplePdf(
      'onevo-history.pdf',
      ['ONEVO HISTORY', '', ...filtered.map(entry => `${formatTime(entry.createdAt)} | ${entry.actor} | ${entry.title} | ${entry.category}`)],
    );
  };

  return (
    <div className="cfg-page history-page">
      <ConfigShellHeader
        title="History"
        icon={<History size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search people, activity, details or area...',
          label: 'Search history',
        }}
        actions={
          <div className="dept-table__actions admin-export-wrap" ref={exportMenuRef}>
            <button
              type="button"
              className="org-btn org-btn--secondary"
              onClick={() => setExportMenuOpen(value => !value)}
            >
              <Download size={14} /> Export
            </button>
            {exportMenuOpen && (
              <div className="dept-table__menu admin-export-menu">
                <button type="button" onClick={() => exportHistory('csv')}>
                  Export CSV
                </button>
                <button type="button" onClick={() => exportHistory('pdf')}>
                  Export PDF
                </button>
              </div>
            )}
          </div>
        }
      />

      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Total Activity</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Today</span>
          <strong>{summary.today}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Access Updates</span>
          <strong>{summary.access}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Organization Updates</span>
          <strong>{summary.organization}</strong>
        </div>
      </div>

      <div className="cfg-page__toolbar history-page__toolbar">
        <select
          className="cfg-filter-select"
          value={category}
          onChange={event => setCategory(event.target.value as 'All' | HistoryCategory)}
          aria-label="Filter history by area"
        >
          {categories.map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap admin-table-wrap">
          <table className="cfg-table history-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Person</th>
                <th>Activity</th>
                <th>Details</th>
                <th>Area</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td className="history-table__when">
                    <div className="cfg-table__name">{formatTime(entry.createdAt)}</div>
                  </td>
                  <td className="history-table__who">
                    <div className="cfg-table__name">{entry.actor}</div>
                  </td>
                  <td className="history-table__activity">
                    <strong>{entry.title}</strong>
                  </td>
                  <td>
                    <span className="cfg-table__meta">{entry.description}</span>
                  </td>
                  <td>
                    <span className="cfg-badge cfg-badge--open">{entry.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="cfg-empty">
              <p className="cfg-empty__title">No history matches your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
