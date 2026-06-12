import React, { useMemo, useState } from 'react';
import { Search, RefreshCw, Sparkles, ClipboardList, X } from 'lucide-react';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import type { GeneratePreviewRow, PolicyScope } from './leaveConfigTypes';
import { LeaveConfigToast } from './LeaveConfigToast';

export const LeaveEntitlementsPage: React.FC = () => {
  const {
    entitlements,
    leaveTypes,
    auditLog,
    buildGeneratePreview,
    generateEntitlements,
    recalculateEntitlements,
    adjustEntitlement
  } = useLeaveConfigStore();
  const { employees, departments, positions, assignments } = useOrganizationStore();

  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'entitlements' | 'audit'>('entitlements');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genScope, setGenScope] = useState<PolicyScope | 'all'>('all');
  const [genDeptId, setGenDeptId] = useState('');
  const [genPosId, setGenPosId] = useState('');
  const [preview, setPreview] = useState<GeneratePreviewRow[] | null>(null);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustDays, setAdjustDays] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [auditEntId, setAuditEntId] = useState<string | null>(null);

  const yearEntitlements = useMemo(
    () => entitlements.filter(e => e.year === year),
    [entitlements, year]
  );

  const employeeMap = useMemo(() => {
    const m = new Map<string, { name: string; dept: string; pos: string }>();
    for (const emp of employees) {
      const asgn = assignments.find(a => a.employeeId === emp.id && a.status === 'active' && !a.effectiveTo);
      const pos = asgn ? positions.find(p => p.id === asgn.positionId) : undefined;
      const dept = pos ? departments.find(d => d.id === pos.departmentId) : undefined;
      m.set(emp.id, {
        name: `${emp.firstName} ${emp.lastName}`,
        dept: dept?.name ?? '—',
        pos: pos?.name ?? '—'
      });
    }
    return m;
  }, [employees, assignments, positions, departments]);

  const filtered = useMemo(() => {
    return yearEntitlements.filter(e => {
      const info = employeeMap.get(e.employeeId);
      const typeName = leaveTypes.find(t => t.id === e.leaveTypeId)?.name ?? '';
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        info?.name.toLowerCase().includes(q) ||
        typeName.toLowerCase().includes(q) ||
        (e.policyName ?? '').toLowerCase().includes(q)
      );
    });
  }, [yearEntitlements, employeeMap, leaveTypes, search]);

  const summary = useMemo(() => {
    const covered = new Set(yearEntitlements.map(e => e.employeeId)).size;
    const generated = yearEntitlements.filter(e => e.source === 'generated').length;
    const missing = yearEntitlements.filter(e => e.status === 'missing-policy').length;
    const manual = yearEntitlements.filter(e => e.source === 'manual').length;
    return { covered, generated, missing, manual };
  }, [yearEntitlements]);

  const runPreview = () => {
    const rows = buildGeneratePreview({
      year,
      scope: genScope,
      departmentId: genScope === 'department' ? genDeptId : null,
      positionId: genScope === 'position' ? genPosId : null
    });
    setPreview(rows);
  };

  const confirmGenerate = () => {
    generateEntitlements({
      year,
      scope: genScope,
      departmentId: genScope === 'department' ? genDeptId : null,
      positionId: genScope === 'position' ? genPosId : null
    });
    setGenerateOpen(false);
    setPreview(null);
  };

  const previewStats = useMemo(() => {
    if (!preview) return null;
    return {
      willCreate: preview.filter(r => !r.skipped).length,
      skipped: preview.filter(r => r.skipped && r.skipReason !== 'Missing policy').length,
      missing: preview.filter(r => r.skipReason === 'Missing policy').length
    };
  }, [preview]);

  const displayAudit = tab === 'audit'
    ? auditLog.filter(a => {
        const ent = entitlements.find(e => e.id === a.entitlementId);
        return ent?.year === year;
      })
    : [];

  const openAdjust = (id: string, current: number) => {
    setAdjustId(id);
    setAdjustDays(String(current));
    setAdjustReason('');
  };

  const submitAdjust = () => {
    if (!adjustId) return;
    const ok = adjustEntitlement(adjustId, Number(adjustDays), adjustReason);
    if (ok) {
      setAdjustId(null);
      setAdjustReason('');
    }
  };

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Entitlements</h1>
          <p className="cfg-page__subtitle">
            Generate employee leave balances from leave types and policies.
          </p>
        </div>
        <div className="cfg-page__actions">
          <button type="button" className="org-btn org-btn--secondary" onClick={() => recalculateEntitlements(year)}>
            <RefreshCw size={14} /> Recalculate
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={() => { setGenerateOpen(true); setPreview(null); }}>
            <Sparkles size={14} /> Generate Entitlements
          </button>
        </div>
      </div>

      <div className="cfg-page__toolbar">
        <div className="org-form-field leave-cfg-year-field">
          <label>Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search employees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="leave-cfg-tabs">
          <button
            type="button"
            className={`leave-cfg-tabs__btn${tab === 'entitlements' ? ' leave-cfg-tabs__btn--active' : ''}`}
            onClick={() => setTab('entitlements')}
          >
            Entitlements
          </button>
          <button
            type="button"
            className={`leave-cfg-tabs__btn${tab === 'audit' ? ' leave-cfg-tabs__btn--active' : ''}`}
            onClick={() => setTab('audit')}
          >
            Audit
          </button>
        </div>
      </div>

      <div className="leave-cfg-summary-row">
        <div className="leave-cfg-summary-card">
          <span className="leave-cfg-summary-card__label">Employees Covered</span>
          <strong>{summary.covered}</strong>
        </div>
        <div className="leave-cfg-summary-card">
          <span className="leave-cfg-summary-card__label">Entitlements Generated</span>
          <strong>{summary.generated}</strong>
        </div>
        <div className="leave-cfg-summary-card">
          <span className="leave-cfg-summary-card__label">Missing Entitlements</span>
          <strong>{summary.missing}</strong>
        </div>
        <div className="leave-cfg-summary-card">
          <span className="leave-cfg-summary-card__label">Manual Adjustments</span>
          <strong>{summary.manual}</strong>
        </div>
      </div>

      <div className="cfg-page__body">
        {tab === 'entitlements' ? (
          <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Leave Type</th>
                  <th>Applied Policy</th>
                  <th>Total Days</th>
                  <th>Used</th>
                  <th>Pending</th>
                  <th>Remaining</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="leave-cfg-empty">
                      No entitlements for {year}. Click Generate Entitlements to create balances.
                    </td>
                  </tr>
                )}
                {filtered.map(e => {
                  const info = employeeMap.get(e.employeeId);
                  const typeName = leaveTypes.find(t => t.id === e.leaveTypeId)?.name ?? '—';
                  return (
                    <tr key={e.id}>
                      <td>{info?.name ?? e.employeeId}</td>
                      <td>{info?.dept ?? '—'}</td>
                      <td>{info?.pos ?? '—'}</td>
                      <td>{typeName}</td>
                      <td>{e.policyName ?? '—'}</td>
                      <td>{e.totalDays}</td>
                      <td>{e.used}</td>
                      <td>{e.pending}</td>
                      <td>{e.remaining}</td>
                      <td>{e.source === 'generated' ? 'Generated' : 'Manual Adjustment'}</td>
                      <td>
                        <span className={`cfg-badge cfg-badge--${e.status === 'active' ? 'active' : 'paused'}`}>
                          {e.status === 'missing-policy' ? 'Missing Policy' : e.status}
                        </span>
                      </td>
                      <td>
                        <div className="cfg-row-actions cfg-row-actions--labeled">
                          <button type="button" className="cfg-action-btn" onClick={() => openAdjust(e.id, e.totalDays)}>
                            Adjust
                          </button>
                          <button type="button" className="cfg-action-btn" onClick={() => setAuditEntId(e.id)}>
                            <ClipboardList size={13} /> Audit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Change Type</th>
                  <th>Days Changed</th>
                  <th>Balance After</th>
                  <th>Reason</th>
                  <th>Changed By</th>
                </tr>
              </thead>
              <tbody>
                {displayAudit.length === 0 && (
                  <tr><td colSpan={8} className="leave-cfg-empty">No audit entries for {year}.</td></tr>
                )}
                {displayAudit.map(a => {
                  const info = employeeMap.get(a.employeeId);
                  const typeName = leaveTypes.find(t => t.id === a.leaveTypeId)?.name ?? '—';
                  return (
                    <tr key={a.id}>
                      <td>{new Date(a.date).toLocaleString()}</td>
                      <td>{info?.name ?? a.employeeId}</td>
                      <td>{typeName}</td>
                      <td>{a.changeType}</td>
                      <td>{a.daysChanged > 0 ? `+${a.daysChanged}` : a.daysChanged}</td>
                      <td>{a.balanceAfter}</td>
                      <td>{a.reason}</td>
                      <td>{a.changedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {generateOpen && (
        <div className="leave-cfg-modal-overlay" onClick={() => setGenerateOpen(false)}>
          <div className="leave-cfg-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <header className="leave-cfg-modal__header">
              <h2>Generate Entitlements</h2>
              <button type="button" className="org-slideover__close" onClick={() => setGenerateOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="leave-cfg-modal__body">
              <div className="org-form-field">
                <label>Year</label>
                <select value={year} onChange={e => setYear(Number(e.target.value))}>
                  {[year - 1, year, year + 1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label>Scope</label>
                <select value={genScope} onChange={e => setGenScope(e.target.value as PolicyScope | 'all')}>
                  <option value="all">Full Company</option>
                  <option value="department">Department</option>
                  <option value="position">Position</option>
                </select>
              </div>
              {genScope === 'department' && (
                <div className="org-form-field">
                  <label>Department</label>
                  <select value={genDeptId} onChange={e => setGenDeptId(e.target.value)}>
                    <option value="">— Select —</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {genScope === 'position' && (
                <div className="org-form-field">
                  <label>Position</label>
                  <select value={genPosId} onChange={e => setGenPosId(e.target.value)}>
                    <option value="">— Select —</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button type="button" className="org-btn org-btn--secondary" onClick={runPreview}>
                Preview
              </button>
              {previewStats && (
                <div className="leave-cfg-preview-stats">
                  <p><strong>{previewStats.willCreate}</strong> entitlements to create</p>
                  <p><strong>{previewStats.skipped}</strong> skipped (already exist)</p>
                  <p><strong>{previewStats.missing}</strong> missing policy warnings</p>
                </div>
              )}
              {preview && preview.length > 0 && (
                <div className="leave-cfg-preview-table cfg-table-wrap">
                  <table className="cfg-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Leave Type</th>
                        <th>Policy</th>
                        <th>Days</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 12).map((r, i) => (
                        <tr key={i}>
                          <td>{r.employeeName}</td>
                          <td>{r.leaveTypeName}</td>
                          <td>{r.policyName ?? '—'}</td>
                          <td>{r.days}</td>
                          <td>{r.skipped ? r.skipReason : 'Will create'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 12 && (
                    <p className="leave-cfg-hint">Showing 12 of {preview.length} rows</p>
                  )}
                </div>
              )}
            </div>
            <footer className="leave-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setGenerateOpen(false)}>Cancel</button>
              <button type="button" className="org-btn org-btn--primary" onClick={confirmGenerate} disabled={!preview}>
                Confirm Generation
              </button>
            </footer>
          </div>
        </div>
      )}

      {adjustId && (
        <div className="leave-cfg-modal-overlay" onClick={() => setAdjustId(null)}>
          <div className="leave-cfg-modal leave-cfg-modal--narrow" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <header className="leave-cfg-modal__header">
              <h2>Manual Adjustment</h2>
              <button type="button" className="org-slideover__close" onClick={() => setAdjustId(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="leave-cfg-modal__body">
              <div className="org-form-field">
                <label>Total days</label>
                <input type="number" min={0} value={adjustDays} onChange={e => setAdjustDays(e.target.value)} />
              </div>
              <div className="org-form-field">
                <label>Reason (required)</label>
                <textarea value={adjustReason} onChange={e => setAdjustReason(e.target.value)} rows={3} />
              </div>
            </div>
            <footer className="leave-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setAdjustId(null)}>Cancel</button>
              <button type="button" className="org-btn org-btn--primary" onClick={submitAdjust} disabled={!adjustReason.trim()}>
                Save Adjustment
              </button>
            </footer>
          </div>
        </div>
      )}

      {auditEntId && tab === 'entitlements' && (
        <div className="cfg-drawer-overlay" onClick={() => setAuditEntId(null)}>
          <div className="cfg-drawer" onClick={e => e.stopPropagation()}>
            <header className="cfg-drawer__header">
              <h3>Balance Audit</h3>
              <button type="button" className="org-slideover__close" onClick={() => setAuditEntId(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="cfg-drawer__body">
              {auditLog.filter(a => a.entitlementId === auditEntId).length === 0 && (
                <p className="leave-cfg-hint">No audit history for this entitlement.</p>
              )}
              {auditLog.filter(a => a.entitlementId === auditEntId).map(a => (
                <div key={a.id} className="cfg-run-item">
                  <div className="cfg-run-item__time">{new Date(a.date).toLocaleString()}</div>
                  <div><strong>{a.changeType}</strong> — {a.daysChanged > 0 ? `+${a.daysChanged}` : a.daysChanged} days</div>
                  <div>Balance after: {a.balanceAfter}</div>
                  <div>{a.reason}</div>
                  <div className="cfg-table__meta">By {a.changedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <LeaveConfigToast />
    </div>
  );
};
