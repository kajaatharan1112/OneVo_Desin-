import React, { useMemo, useState } from 'react';
import { Download, History, Search } from 'lucide-react';
import { useHistoryStore, type HistoryCategory } from '../../store/historyStore';

const categories: Array<'All' | HistoryCategory> = ['All', 'People', 'Organization', 'Access', 'Leave', 'Attendance', 'Work', 'Calendar', 'Billing', 'Settings'];

const formatTime = (value: string) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}).format(new Date(value));

export const AuditLogPage: React.FC = () => {
  const entries = useHistoryStore(state => state.entries);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | HistoryCategory>('All');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter(entry => {
      if (category !== 'All' && entry.category !== category) return false;
      if (!query) return true;
      return `${entry.actor} ${entry.title} ${entry.description} ${entry.target ?? ''} ${entry.category}`.toLowerCase().includes(query);
    });
  }, [entries, search, category]);

  const exportCsv = () => {
    const rows = [['Time', 'Person', 'Activity', 'Details', 'Area', 'Result'], ...filtered.map(entry => [
      formatTime(entry.createdAt), entry.actor, entry.title, entry.description, entry.category, entry.outcome === 'success' ? 'Completed' : 'Failed'
    ])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'onevo-history.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cfg-page history-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title"><History size={19} /> History</h1>
          <p className="cfg-page__subtitle">A clear record of important activity across your company.</p>
        </div>
        <button type="button" className="org-btn org-btn--secondary" onClick={exportCsv}><Download size={14} /> Export</button>
      </div>

      <div className="cfg-page__toolbar history-toolbar">
        <div className="cfg-search"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search people, activity or details…" /></div>
        <select className="cfg-filter-select" value={category} onChange={event => setCategory(event.target.value as 'All' | HistoryCategory)} aria-label="Filter history by area">
          {categories.map(value => <option key={value}>{value}</option>)}
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table history-table">
            <thead><tr><th>When</th><th>Person</th><th>Activity</th><th>Details</th><th>Area</th><th>Result</th></tr></thead>
            <tbody>{filtered.map(entry => (
              <tr key={entry.id}>
                <td className="cfg-table__meta">{formatTime(entry.createdAt)}</td>
                <td><div className="cfg-table__name">{entry.actor}</div></td>
                <td><strong>{entry.title}</strong></td>
                <td><span className="cfg-table__meta">{entry.description}</span></td>
                <td><span className="cfg-badge cfg-badge--open">{entry.category}</span></td>
                <td><span className={`cfg-badge cfg-badge--${entry.outcome === 'success' ? 'active' : 'failed'}`}>{entry.outcome === 'success' ? 'Completed' : 'Failed'}</span></td>
              </tr>
            ))}</tbody>
          </table>
          {filtered.length === 0 && <div className="cfg-empty"><p className="cfg-empty__title">No history matches your search</p></div>}
        </div>
      </div>
    </div>
  );
};
