import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import { MOCK_INVOICES, formatDateTime } from './settingsMockData';

export const BillingSettingsPage: React.FC = () => {
  const invoiceStatusClass = (status: string) => {
    if (status === 'paid') return 'success';
    if (status === 'overdue') return 'failed';
    return 'open';
  };

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="Billing"
        description="Review subscription, invoices, usage limits, and billing status."
        actions={
          <button type="button" className="org-btn org-btn--secondary" disabled title="Contact your account manager to change plans">
            <ExternalLink size={14} /> Manage Plan
          </button>
        }
      />

      <div className="settings-body">
        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Current Subscription</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-subscription">
              <div className="settings-stat">
                <div className="settings-stat__label">Plan</div>
                <div className="settings-stat__value">Business Pro</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat__label">Billing cycle</div>
                <div className="settings-stat__value">Monthly</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat__label">Status</div>
                <div className="settings-stat__value">
                  <span className="cfg-badge cfg-badge--active">Active</span>
                </div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat__label">Renewal date</div>
                <div className="settings-stat__value">1 Jul 2026</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat__label">Confirmed employees</div>
                <div className="settings-stat__value">48 / 60 seats</div>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Usage</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-subscription">
              <div className="settings-stat">
                <div className="settings-stat__label">Active employees</div>
                <div className="settings-stat__value">48</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat__label">Storage</div>
                <div className="settings-stat__value">12.4 GB / 50 GB</div>
              </div>
              <div className="settings-stat">
                <div className="settings-stat__label">AI allowance</div>
                <div className="settings-stat__value">18,200 / 50,000 tokens</div>
              </div>
            </div>
            <div className="org-form-field">
              <label>Add-on modules</label>
              <div className="admin-review-list">
                <span className="admin-review-chip">Monitoring</span>
                <span className="admin-review-chip">Payroll</span>
                <span className="admin-review-chip">Automations</span>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Invoices</h2>
          </header>
          <div className="settings-card__body">
            <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map(inv => (
                  <tr key={inv.id}>
                    <td className="cfg-table__name">{inv.number}</td>
                    <td>{formatDateTime(`${inv.date}T00:00:00Z`).split(',')[0]}</td>
                    <td>{inv.amount}</td>
                    <td>
                      <span className={`cfg-badge cfg-badge--${invoiceStatusClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>{inv.paymentDate ?? '—'}</td>
                    <td>
                      <div className="cfg-row-actions cfg-row-actions--labeled">
                        <button type="button" className="cfg-action-btn">View</button>
                        <button type="button" className="cfg-action-btn">
                          <Download size={13} /> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
