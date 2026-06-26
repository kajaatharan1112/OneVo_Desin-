import React, { useState } from 'react';
import { Plus, Trash2, ShieldAlert, ShieldCheck, Zap, Shield } from 'lucide-react';
import { useWork } from '../../context/work-context';
import type { WorkProject, ProjectRisk } from '../../workMockData';

interface Props {
  project: WorkProject;
}

type Severity = 'High' | 'Medium' | 'Low';
type RiskStatus = 'identified' | 'mitigated' | 'triggered' | 'closed';

const STATUS_META: Record<RiskStatus, { label: string; badgeClass: string; Icon: React.ElementType }> = {
  identified: { label: 'Identified', badgeClass: 'open', Icon: ShieldAlert },
  mitigated: { label: 'Mitigated', badgeClass: 'active', Icon: ShieldCheck },
  triggered: { label: 'Triggered', badgeClass: 'failed', Icon: Zap },
  closed: { label: 'Closed', badgeClass: 'inactive', Icon: Shield },
};

const SEVERITY_COLOR: Record<Severity, string> = {
  High: 'var(--clr-danger)',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const BLANK_FORM = { name: '', likelihood: 'Medium' as Severity, impact: 'Medium' as Severity, mitigation: '', status: 'identified' as RiskStatus };

export const ProjectRisksPage: React.FC<Props> = ({ project }) => {
  const { risks, addRisk, updateRisk, deleteRisk } = useWork();

  const projectRisks = risks.filter(r => r.projectId === project.id);
  const [form, setForm] = useState(BLANK_FORM);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const totals = { identified: 0, mitigated: 0, triggered: 0, closed: 0 };
  projectRisks.forEach(r => { totals[r.status]++; });

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      updateRisk(editId, form);
      setEditId(null);
    } else {
      addRisk({ projectId: project.id, ...form });
    }
    setForm(BLANK_FORM);
    setAddOpen(false);
  };

  const startEdit = (risk: ProjectRisk) => {
    setForm({ name: risk.name, likelihood: risk.likelihood, impact: risk.impact, mitigation: risk.mitigation, status: risk.status });
    setEditId(risk.id);
    setAddOpen(true);
  };

  const cancelForm = () => {
    setForm(BLANK_FORM);
    setEditId(null);
    setAddOpen(false);
  };

  return (
    <div className="work-page-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {(Object.keys(STATUS_META) as RiskStatus[]).map(status => {
          const { label, badgeClass, Icon } = STATUS_META[status];
          return (
            <div key={status} className="work-overview-stat-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`cfg-badge cfg-badge--${badgeClass}`} style={{ padding: '0.4rem', borderRadius: 8 }}>
                <Icon size={14} />
              </span>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{totals[status]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk list */}
      <div className="work-overview-stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Risk register</h3>
          <button
            type="button"
            className="org-btn org-btn--primary org-btn--sm"
            onClick={() => setAddOpen(v => !v)}
          >
            <Plus size={14} /> Add risk
          </button>
        </div>

        {addOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1rem',
              background: 'var(--surface-raised)',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem' }}>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Risk description"
                aria-label="Risk name"
              />
              <select value={form.likelihood} onChange={e => setForm(f => ({ ...f, likelihood: e.target.value as Severity }))} aria-label="Likelihood">
                <option value="High">High likelihood</option>
                <option value="Medium">Medium likelihood</option>
                <option value="Low">Low likelihood</option>
              </select>
              <select value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value as Severity }))} aria-label="Impact">
                <option value="High">High impact</option>
                <option value="Medium">Medium impact</option>
                <option value="Low">Low impact</option>
              </select>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as RiskStatus }))} aria-label="Status">
                <option value="identified">Identified</option>
                <option value="mitigated">Mitigated</option>
                <option value="triggered">Triggered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <input
              value={form.mitigation}
              onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))}
              placeholder="Mitigation strategy"
              aria-label="Mitigation"
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={cancelForm}>Cancel</button>
              <button
                type="button"
                className="org-btn org-btn--primary org-btn--sm"
                onClick={handleSave}
                disabled={!form.name.trim()}
              >
                {editId ? 'Update risk' : 'Save risk'}
              </button>
            </div>
          </div>
        )}

        {projectRisks.length === 0 ? (
          <p className="admin-hint" style={{ textAlign: 'center', padding: '1.5rem 0' }}>No risks logged for this project yet.</p>
        ) : (
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Likelihood</th>
                <th>Impact</th>
                <th>Status</th>
                <th>Mitigation</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projectRisks.map(risk => {
                const { label, badgeClass } = STATUS_META[risk.status];
                return (
                  <tr key={risk.id}>
                    <td className="cfg-table__name">{risk.name}</td>
                    <td>
                      <span style={{ color: SEVERITY_COLOR[risk.likelihood], fontWeight: 600, fontSize: '0.8rem' }}>
                        {risk.likelihood}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: SEVERITY_COLOR[risk.impact], fontWeight: 600, fontSize: '0.8rem' }}>
                        {risk.impact}
                      </span>
                    </td>
                    <td>
                      <span className={`cfg-badge cfg-badge--${badgeClass}`}>{label}</span>
                    </td>
                    <td style={{ color: 'var(--clr-text-secondary)', fontSize: '0.8rem', maxWidth: 260 }}>
                      {risk.mitigation || '—'}
                    </td>
                    <td style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                      <button type="button" className="cfg-action-btn" onClick={() => startEdit(risk)} aria-label="Edit risk">
                        Edit
                      </button>
                      <button type="button" className="cfg-action-btn" onClick={() => deleteRisk(risk.id)} aria-label="Delete risk">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
