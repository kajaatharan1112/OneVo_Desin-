import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Clock, Download, X } from 'lucide-react';
import { DateRangePicker, formatWorklogsDateChip, type DateRange } from './DateRangePicker';
import { employeeById, projectAssignees, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

const DEFAULT_RANGE: DateRange = { start: '2026-06-01', end: '2026-06-18' };

export const ProjectWorklogsSettings: React.FC<Props> = ({ project }) => {
  const [userId, setUserId] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE);
  const [usersOpen, setUsersOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const usersRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usersOpen && !downloadOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (usersOpen && usersRef.current && !usersRef.current.contains(e.target as Node)) {
        setUsersOpen(false);
      }
      if (downloadOpen && downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [usersOpen, downloadOpen]);

  const members = useMemo(() => projectAssignees(project), [project]);

  const selectedUserName = userId ? (employeeById(userId)?.name ?? 'User') : null;

  const rows: never[] = [];

  return (
    <div className="work-worklogs-page">
      <div className="work-worklogs-toolbar">
        <div className="work-worklogs-toolbar__left">
          <div className="work-worklogs-users" ref={usersRef}>
            <button
              type="button"
              className={`work-worklogs-users__trigger${usersOpen ? ' work-worklogs-users__trigger--open' : ''}`}
              onClick={() => setUsersOpen(o => !o)}
              aria-expanded={usersOpen}
            >
              {selectedUserName ?? 'Users'}
              <ChevronDown size={14} />
            </button>
            {usersOpen && (
              <ul className="work-worklogs-users__menu" role="listbox">
                <li>
                  <button
                    type="button"
                    role="option"
                    className={`work-worklogs-users__option${!userId ? ' work-worklogs-users__option--active' : ''}`}
                    onClick={() => { setUserId(''); setUsersOpen(false); }}
                  >
                    All users
                  </button>
                </li>
                {members.map(m => (
                  <li key={m.id}>
                    <button
                      type="button"
                      role="option"
                      className={`work-worklogs-users__option${userId === m.id ? ' work-worklogs-users__option--active' : ''}`}
                      onClick={() => { setUserId(m.id); setUsersOpen(false); }}
                    >
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="work-worklogs-toolbar__right" ref={downloadRef}>
          <div className="work-worklogs-download">
            <button
              type="button"
              className="work-worklogs-download__main"
              disabled={rows.length === 0}
              title={rows.length === 0 ? 'No worklogs to download' : undefined}
            >
              <Download size={14} /> Download
            </button>
            <button
              type="button"
              className="work-worklogs-download__chevron"
              onClick={() => setDownloadOpen(o => !o)}
              aria-expanded={downloadOpen}
              aria-label="Download options"
            >
              <ChevronDown size={14} />
            </button>
            {downloadOpen && (
              <ul className="work-worklogs-download__menu">
                <li><button type="button" disabled>CSV</button></li>
                <li><button type="button" disabled>PDF</button></li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="work-worklogs-filters">
        <span className="work-worklogs-filters__chip">
          <span className="work-worklogs-filters__label">Date</span>
          <span className="work-worklogs-filters__value">{formatWorklogsDateChip(dateRange.start, dateRange.end)}</span>
          <button type="button" className="work-worklogs-filters__clear" onClick={() => setDateRange(DEFAULT_RANGE)} aria-label="Clear date filter">
            <X size={12} />
          </button>
        </span>
        {selectedUserName && (
          <span className="work-worklogs-filters__chip">
            <span className="work-worklogs-filters__label">User</span>
            <span className="work-worklogs-filters__value">{selectedUserName}</span>
            <button type="button" className="work-worklogs-filters__clear" onClick={() => setUserId('')} aria-label="Clear user filter">
              <X size={12} />
            </button>
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="work-worklogs-empty-state">
          <span className="work-worklogs-empty-state__icon" aria-hidden="true">
            <Clock size={32} />
          </span>
          <h3 className="work-worklogs-empty-state__title">Track timesheets for all members</h3>
          <p className="work-worklogs-empty-state__text">
            Log time on work items to view detailed timesheets for any team member across this project.
          </p>
        </div>
      ) : (
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Duration</th>
                <th>Source</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      )}

      <div className="work-worklogs-pagination">
        <span className="work-worklogs-pagination__count">1-0 of 0</span>
        <div className="work-worklogs-pagination__nav">
          <button type="button" className="work-worklogs-pagination__btn" disabled>Prev</button>
          <button type="button" className="work-worklogs-pagination__btn" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};
