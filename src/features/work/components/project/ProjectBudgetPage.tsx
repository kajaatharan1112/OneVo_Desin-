import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWork } from '../../context/work-context';
import type { WorkProject } from '../../workMockData';
import { formatWorkDate } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectBudgetPage: React.FC<Props> = ({ project }) => {
  const { budgetExpenses, addBudgetExpense, deleteBudgetExpense } = useWork();

  const expenses = budgetExpenses.filter(e => e.projectId === project.id);
  const budgetLimit = project.budgetLimit ?? 0;
  const spentBudget = expenses.reduce((sum, e) => sum + e.cost, 0);
  const remaining = budgetLimit - spentBudget;
  const pct = budgetLimit > 0 ? Math.min(100, (spentBudget / budgetLimit) * 100) : 0;
  const isOverBudget = remaining < 0;

  const [form, setForm] = useState({ name: '', category: '', cost: '', date: '' });
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = () => {
    const cost = parseFloat(form.cost);
    if (!form.name.trim() || !form.category.trim() || isNaN(cost) || cost <= 0 || !form.date) return;
    addBudgetExpense({ projectId: project.id, name: form.name, category: form.category, cost, date: form.date });
    setForm({ name: '', category: '', cost: '', date: '' });
    setAddOpen(false);
  };

  const fmtCurrency = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const healthColor = isOverBudget ? 'var(--clr-danger)' : pct > 80 ? '#f59e0b' : 'var(--accent)';

  return (
    <div className="work-page-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Budget limit', value: fmtCurrency(budgetLimit), icon: <DollarSign size={18} />, color: 'var(--accent)' },
          { label: 'Spent', value: fmtCurrency(spentBudget), icon: <TrendingUp size={18} />, color: healthColor },
          { label: 'Remaining', value: fmtCurrency(Math.abs(remaining)), icon: isOverBudget ? <TrendingDown size={18} /> : <Minus size={18} />, color: healthColor },
        ].map(card => (
          <div key={card.label} className="work-overview-stat-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: card.color }}>{card.icon}</span>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', marginBottom: '0.25rem' }}>{card.label}</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 700, color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Spend gauge */}
      <div className="work-overview-stat-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)' }}>
            {isOverBudget ? '⚠️ Over budget' : `${pct.toFixed(0)}% of budget used`}
          </span>
          <span style={{ fontSize: '0.8rem', color: healthColor, fontWeight: 600 }}>
            {fmtCurrency(spentBudget)} / {fmtCurrency(budgetLimit)}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--surface-raised)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, pct)}%`,
              background: healthColor,
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Expense list */}
      <div className="work-overview-stat-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Expenses</h3>
          <button
            type="button"
            className="org-btn org-btn--primary org-btn--sm"
            onClick={() => setAddOpen(v => !v)}
          >
            <Plus size={14} /> Add expense
          </button>
        </div>

        {addOpen && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto auto auto',
              gap: '0.5rem',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--surface-raised)',
              borderRadius: 8,
            }}
          >
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Expense name"
              aria-label="Expense name"
            />
            <input
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="Category"
              aria-label="Category"
            />
            <input
              type="number"
              value={form.cost}
              onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
              placeholder="Cost (USD)"
              aria-label="Cost"
              style={{ width: 110 }}
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              aria-label="Date"
              style={{ width: 130 }}
            />
            <button
              type="button"
              className="org-btn org-btn--primary org-btn--sm"
              onClick={handleAdd}
              disabled={!form.name.trim() || !form.category.trim() || !form.cost || !form.date}
            >
              Save
            </button>
          </div>
        )}

        {expenses.length === 0 ? (
          <p className="admin-hint" style={{ textAlign: 'center', padding: '1.5rem 0' }}>No expenses recorded yet.</p>
        ) : (
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td className="cfg-table__name">{exp.name}</td>
                  <td><span className="cfg-badge cfg-badge--active">{exp.category}</span></td>
                  <td>{formatWorkDate(exp.date)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtCurrency(exp.cost)}</td>
                  <td>
                    <button
                      type="button"
                      className="cfg-action-btn"
                      onClick={() => deleteBudgetExpense(exp.id)}
                      aria-label={`Delete expense ${exp.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
