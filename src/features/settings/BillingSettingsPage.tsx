import React from 'react';
import { CreditCard, Download, ExternalLink } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import { MOCK_INVOICES, type Invoice } from './settingsMockData';
import { recordHistory } from '../../store/historyStore';
import { PaymentFlow } from './components/PaymentFlow';
import { createSimplePdf, downloadBlob } from '../../shared/utils/exportUtils';

type Drawer = 'plan' | 'seats' | 'storage' | 'history' | null;
type PlanId = 'starter' | 'business' | 'scale';
type Step = 'configure' | 'payment' | 'success';
interface StorageRecord { id: string; category: string; subcategory: string; name: string; detail: string; year: number; month?: string; week?: string; employee?: string; department?: string; current: boolean; size: number; }
const plans: Record<PlanId, { name: string; price: number; storage: number; description: string }> = {
  starter: { name: 'Starter', price: 8, storage: 20, description: 'Core HR for growing teams' }, business: { name: 'Business Pro', price: 14, storage: 50, description: 'Advanced HR, work and monitoring' }, scale: { name: 'Scale', price: 22, storage: 200, description: 'Enterprise controls and priority support' }
};

export const BillingSettingsPage: React.FC = () => {
  const [drawer, setDrawer] = useState<Drawer>(null); const [step, setStep] = useState<Step>('configure');
  const [currentPlan, setCurrentPlan] = useState<PlanId>('business'); const [selectedPlan, setSelectedPlan] = useState<PlanId>('business');
  const [seatMode, setSeatMode] = useState<'current' | 'upgrade'>('current'); const [seats, setSeats] = useState(60); const [selectedSeats, setSelectedSeats] = useState(60); const [storage, setStorage] = useState(50);
  const [addOns, setAddOns] = useState<string[]>(['Monitoring']); const [contact, setContact] = useState({ name: 'Priya Sharma', email: 'billing@onevo.com', phone: '+94 77 123 4567' }); const [draftContact, setDraftContact] = useState(contact); const [editingContact, setEditingContact] = useState(false); const [cardModal, setCardModal] = useState(false);
  const [openInvoiceMenu, setOpenInvoiceMenu] = useState<string | null>(null); const [invoiceView, setInvoiceView] = useState<Invoice | null>(null); const [exportMenu, setExportMenu] = useState(false);
  const [storageMode, setStorageMode] = useState<'overview' | 'manage' | 'upgrade'>('overview');
  const [storagePeriod, setStoragePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [storageCategory, setStorageCategory] = useState<string | null>(null);
  const [storageSubcategory, setStorageSubcategory] = useState<string | null>(null);
  const [storageFiles, setStorageFiles] = useState<StorageRecord[]>([
    { id: 'leave-2026', category: 'Reports', subcategory: 'Leave', name: 'Leave reports · 2026', detail: 'Current year · 28 reports', year: 2026, current: true, size: 1.3 },
    { id: 'leave-week-jun', category: 'Reports', subcategory: 'Leave', name: '16–22 June 2026', detail: 'Older weekly leave data', year: 2026, current: false, size: .3 },
    { id: 'leave-may-2026', category: 'Reports', subcategory: 'Leave', name: 'May 2026', detail: 'Older monthly leave data', year: 2026, current: false, size: .6 },
    { id: 'leave-2025', category: 'Reports', subcategory: 'Leave', name: 'Leave reports · 2025', detail: 'Archived · 146 reports', year: 2025, current: false, size: 1.8 },
    { id: 'leave-2024', category: 'Reports', subcategory: 'Leave', name: 'Leave reports · 2024', detail: 'Archived · 132 reports', year: 2024, current: false, size: 1.5 },
    { id: 'billing-2026', category: 'Reports', subcategory: 'Billing', name: 'Billing reports · 2026', detail: 'Current year · 6 invoices', year: 2026, current: true, size: .6 },
    { id: 'billing-2025', category: 'Reports', subcategory: 'Billing', name: 'Billing reports · 2025', detail: 'Archived · 12 invoices', year: 2025, current: false, size: .9 },
    { id: 'attendance-2026', category: 'Reports', subcategory: 'Attendance', name: 'Attendance reports · 2026', detail: 'Current year · 26 weekly reports', year: 2026, current: true, size: 1.1 },
    { id: 'attendance-2025', category: 'Reports', subcategory: 'Attendance', name: 'Attendance reports · 2025', detail: 'Archived · 52 weekly reports', year: 2025, current: false, size: 1.7 },
    { id: 'monitor-1', category: 'Monitoring', subcategory: 'Employees', name: 'Alexander Pierce', detail: 'Current monitoring · 286 files', year: 2026, current: true, size: 4.8 },
    { id: 'monitor-2', category: 'Monitoring', subcategory: 'Employees', name: 'Dana Brooks · 2025 archive', detail: 'Archived screenshots · 194 files', year: 2025, current: false, size: 3.6 },
    { id: 'monitor-3', category: 'Monitoring', subcategory: 'Employees', name: 'Marcus Chen · 2025 archive', detail: 'Archived screenshots · 82 files', year: 2025, current: false, size: 1.9 },
    { id: 'employee-1', category: 'Employee details', subcategory: 'Profiles', name: 'Employee avatars', detail: 'Current profile images · 48 files', year: 2026, current: true, size: 1.4 },
    { id: 'employee-2', category: 'Employee details', subcategory: 'Documents', name: 'Employee documents · 2025', detail: 'Archived contracts and IDs', year: 2025, current: false, size: 5.2 },
    { id: 'employee-3', category: 'Employee details', subcategory: 'Onboarding', name: 'Onboarding attachments · 2024', detail: 'Archived forms and evidence', year: 2024, current: false, size: 2.7 },
    { id: 'work-1', category: 'Work files', subcategory: 'Projects', name: 'Active project documents', detail: 'Current workspaces · 342 files', year: 2026, current: true, size: 6.3 },
    { id: 'work-2', category: 'Work files', subcategory: 'Projects', name: 'Closed projects · 2025', detail: 'Archived project files', year: 2025, current: false, size: 4.1 }
  ]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const effectivePlan = drawer === 'seats' && seatMode === 'current' ? currentPlan : selectedPlan;
  const amount = useMemo(() => drawer === 'storage' ? Math.max(0, storage - plans[currentPlan].storage) * .35 : plans[effectivePlan].price * selectedSeats + (seatMode === 'upgrade' || drawer === 'plan' ? addOns.length * 49 : 0), [drawer, storage, currentPlan, effectivePlan, selectedSeats, seatMode, addOns]);
  const open = (value: Drawer) => { setDrawer(value); setStep('configure'); setSelectedPlan(currentPlan); setSelectedSeats(seats); setSeatMode('current'); setStorage(plans[currentPlan].storage); setStorageMode('overview'); setStorageCategory(null); setStorageSubcategory(null); setSelectedFiles([]); };
  const close = () => { setDrawer(null); setStep('configure'); };
  const payItems = drawer === 'storage' ? [{ label: 'Storage package', value: `${storage} GB` }] : [{ label: 'Plan', value: plans[effectivePlan].name }, { label: 'Seats', value: String(selectedSeats) }, ...(seatMode === 'upgrade' || drawer === 'plan' ? [{ label: 'Add-ons', value: addOns.join(', ') || 'None' }] : [])];
  const confirm = () => { if (drawer !== 'storage') { setCurrentPlan(effectivePlan); setSeats(selectedSeats); } recordHistory({ title: drawer === 'storage' ? 'Storage updated' : 'Subscription updated', description: drawer === 'storage' ? `Storage was updated to ${storage} GB.` : `${plans[effectivePlan].name} was confirmed for ${selectedSeats} seats.`, category: 'Billing' }); setStep('success'); };

  const exportHistory = (format: 'csv' | 'pdf') => {
    setExportMenu(false); const rows = MOCK_INVOICES.map(invoice => `${invoice.number},${invoice.date},${invoice.amount},${invoice.status}`).join('\n');
    const blob = format === 'csv'
      ? new Blob([`Invoice,Date,Amount,Status\n${rows}`], { type: 'text/csv' })
      : createSimplePdf(['ONEVO PAYMENT HISTORY', '', ...MOCK_INVOICES.map(invoice => `${invoice.number}   ${invoice.date}   ${invoice.amount}   ${invoice.status.toUpperCase()}`)]);
    downloadBlob(blob, `payment-history.${format}`);
    recordHistory({ title: 'Payment history exported', description: `Payment history was exported as ${format.toUpperCase()}.`, category: 'Billing' });
  };
  const downloadInvoice = (invoice: Invoice) => {
    const blob = createSimplePdf(['ONEVO INVOICE', invoice.number, '', `Billing period: ${invoice.date}`, 'Description: Business Pro subscription, seats and active add-ons', `Status: ${invoice.status.toUpperCase()}`, `Total: ${invoice.amount}`]);
    downloadBlob(blob, `${invoice.number}.pdf`); setOpenInvoiceMenu(null);
  };

  return <div className="cfg-page billing-page"><SettingsPageHeader title="Billing" description="Manage your plan, usage, contact and payments." icon={<CreditCard size={15} />} />
    <div className="settings-body billing-overview">
      <section className="billing-hero settings-card"><div><span className="billing-eyebrow">Current plan</span><h2>{plans[currentPlan].name}</h2><p>{plans[currentPlan].description}</p><span className="cfg-badge cfg-badge--active">Active · Monthly</span></div><div className="billing-hero__price"><strong>${plans[currentPlan].price}</strong><span>per seat / month</span><small>Next payment · 1 Jul 2026</small></div><button className="org-btn org-btn--primary" onClick={() => open('plan')}>Manage Plan</button></section>
      <div className="billing-metric-grid"><button className="billing-metric" onClick={() => open('seats')}><Users /><span>Seats</span><strong>48 / {seats}</strong><small>Manage seats</small></button><button className="billing-metric" onClick={() => open('storage')}><HardDrive /><span>Storage</span><strong>12.4 / {plans[currentPlan].storage} GB</strong><small>Manage storage</small></button><button className="billing-metric" onClick={() => open('history')}><FileText /><span>Next payment</span><strong>${(plans[currentPlan].price * seats).toLocaleString()}</strong><small>View history</small></button></div>

      <section className="settings-card billing-contact-inline"><header><div><h2>Billing contact</h2><p>Invoices, reminders and billing communications are sent here.</p></div>{!editingContact && <button className="org-btn org-btn--secondary" onClick={() => { setDraftContact(contact); setEditingContact(true); }}>Edit</button>}</header><div className="settings-form-grid settings-form-grid--3"><label className="org-form-field"><span>Finance Contact Name</span><input value={draftContact.name} disabled={!editingContact} onChange={event => setDraftContact(value => ({ ...value, name: event.target.value }))} /></label><label className="org-form-field"><span>Finance Email</span><input value={draftContact.email} disabled={!editingContact} onChange={event => setDraftContact(value => ({ ...value, email: event.target.value }))} /></label><label className="org-form-field"><span>Billing Phone</span><input value={draftContact.phone} disabled={!editingContact} onChange={event => setDraftContact(value => ({ ...value, phone: event.target.value }))} /></label></div><button className="billing-contact-card" onClick={() => setCardModal(true)}><CreditCard /><div><span>Payment card</span><strong>Visa •••• 4242</strong><small>Expires 09/28 · Click to manage cards</small></div></button>{editingContact && <footer><button className="org-btn org-btn--secondary" onClick={() => { setDraftContact(contact); setEditingContact(false); }}>Cancel</button><button className="org-btn org-btn--primary" onClick={() => { setContact(draftContact); setEditingContact(false); recordHistory({ title: 'Billing contact updated', description: `Billing contact was updated to ${draftContact.name}.`, category: 'Billing' }); }}>Save</button></footer>}</section>

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="Billing"
        description="Review subscription, invoices, usage limits, and billing status."
        icon={<CreditCard size={15} />}
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
const InvoicePreview = ({ invoice, onClose, onDownload }: { invoice: Invoice; onClose: () => void; onDownload: () => void }) => <div className="billing-inner-modal" onClick={onClose}><div className="billing-inner-modal__card invoice-preview" onClick={event => event.stopPropagation()}><header><div><h3>Invoice {invoice.number}</h3><p>Monthly subscription invoice details.</p></div><button onClick={onClose}><X /></button></header><dl><div><dt>Billing period</dt><dd>{invoice.date}</dd></div><div><dt>Description</dt><dd>Business Pro subscription, seats and active add-ons</dd></div><div><dt>Payment status</dt><dd>{invoice.status}</dd></div><div><dt>Total paid</dt><dd>{invoice.amount}</dd></div></dl><footer><button className="org-btn org-btn--secondary" onClick={onDownload}><Download /> Download invoice</button><button className="org-btn org-btn--primary" onClick={onClose}>Close</button></footer></div></div>;
