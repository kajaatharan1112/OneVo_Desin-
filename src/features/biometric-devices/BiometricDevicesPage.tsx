import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, Archive, ArrowLeft, Building2, Check, ChevronRight,
  Eye, Fingerprint, MoreHorizontal, Plus, RefreshCw, Search, ShieldCheck,
  Trash2, Unplug, Wifi, X, Zap,
} from 'lucide-react';
import { BIOMETRIC_BRANDS, INITIAL_BIOMETRIC_DEVICES } from './biometric-device.data';
import {
  EMPTY_CONNECT_DEVICE_FORM, type BiometricDevice, type ConnectDeviceForm, type DeviceStatus,
  type SyncDirection, type SyncFrequency,
} from './biometric-device.types';
import './biometric-devices.css';

type DetailTab = 'overview' | 'health' | 'sync' | 'logs' | 'settings';
type WizardSection = 0 | 1 | 2 | 3 | 4 | 5;

const STATUS_LABEL: Record<DeviceStatus, string> = {
  online: 'Online', offline: 'Offline', attention: 'Attention', disabled: 'Disabled', archived: 'Archived',
};

function StatusBadge({ status }: { status: DeviceStatus }) {
  return <span className={`bio-status bio-status--${status}`}><span />{STATUS_LABEL[status]}</span>;
}

function SummaryCard({ label, value, tone, active, onClick }: { label: string; value: number; tone: string; active: boolean; onClick: () => void }) {
  return <button type="button" className={`bio-summary bio-summary--${tone}${active ? ' is-active' : ''}`} onClick={onClick}><span>{label}</span><strong>{value}</strong></button>;
}

const requiredConnectionFields: Array<keyof ConnectDeviceForm> = ['name','ipAddress','port','communicationKey','username','password'];
const validIp = (value: string) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split('.').every(part => Number(part) <= 255);

function ConnectDeviceWizard({ onClose, onConnected }: { onClose: () => void; onConnected: (device: BiometricDevice) => void }) {
  const [section, setSection] = useState<WizardSection>(0);
  const [form, setForm] = useState<ConnectDeviceForm>(EMPTY_CONNECT_DEVICE_FORM);
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const [testError, setTestError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = <K extends keyof ConnectDeviceForm>(key: K, value: ConnectDeviceForm[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const connectionValid = requiredConnectionFields.every(key => String(form[key]).trim()) && validIp(form.ipAddress) && Number(form.port) > 0 && Number(form.port) <= 65535;

  const runTest = () => {
    if (!connectionValid) return;
    setTesting(true); setTestError(''); setTested(false);
    window.setTimeout(() => {
      setTesting(false);
      if (form.ipAddress.endsWith('.0')) setTestError('Port unreachable. Check the device network and try again.');
      else if (form.communicationKey.toLowerCase() === 'invalid') setTestError('Invalid communication key. Update the key and retry.');
      else { setTested(true); setSection(2); }
    }, 800);
  };

  const activate = () => {
    setSaving(true);
    window.setTimeout(() => {
      const now = new Date();
      onConnected({
        id: `bio-${now.getTime()}`, name: form.name, brand: form.brand || 'Others', model: form.brand === 'ZKTeco' ? 'MB560' : 'Detected terminal',
        serialNumber: `SN${String(now.getTime()).slice(-9)}`, firmware: 'V1.0.0', ipAddress: form.ipAddress, port: Number(form.port),
        branch: form.branch, location: form.location, timezone: form.timezone, status: 'online', healthScore: 100,
        lastHeartbeat: 'Just now', lastSync: 'Not synced yet', nextSync: form.syncFrequency === 'Manual' ? 'Manual' : 'Scheduled',
        connectedSince: now.toLocaleString(), syncFrequency: form.syncFrequency, syncDirection: form.syncDirection,
        autoRetry: form.autoRetry, retryAttempts: form.retryAttempts, latency: 16,
        logs: [{ id: `log-${now.getTime()}`, at: 'Just now', event: 'Device Connected', description: 'Device registered and health monitoring enabled', status: 'success' }],
      });
      setSaving(false); setSection(5);
    }, 900);
  };

  const visibleStep = section === 0 ? 0 : section === 1 ? 1 : section < 5 ? 2 : 3;
  const stepLabels = ['Brand', 'Connection Details', 'Test Connection', 'Complete'];

  return <div className="bio-modal" role="dialog" aria-modal="true" aria-labelledby="bio-wizard-title">
    <div className="bio-wizard">
      <header className="bio-wizard__header"><div><span className="bio-eyebrow">Secure device onboarding</span><h2 id="bio-wizard-title">Connect New Device</h2></div><button type="button" className="bio-icon-btn" onClick={onClose} disabled={testing || saving} aria-label="Close"><X size={18}/></button></header>
      <div className="bio-stepper" aria-label={`Step ${visibleStep + 1} of 4`}>
        {stepLabels.map((label, index) => <React.Fragment key={label}><div className={`bio-step${index === visibleStep ? ' is-current' : ''}${index < visibleStep ? ' is-done' : ''}`}><span>{index < visibleStep ? <Check size={13}/> : index + 1}</span><b>{label}</b></div>{index < 3 && <div className={`bio-step-line${index < visibleStep ? ' is-done' : ''}`}/>}</React.Fragment>)}
      </div>

      <div className="bio-wizard__body">
        {section === 0 && <section><div className="bio-section-heading"><h3>Select Device Brand</h3><p>The brand determines the secure communication and validation method.</p></div><div className="bio-brand-grid">{BIOMETRIC_BRANDS.map(brand => <button type="button" key={brand.name} className={`bio-brand-card${form.brand === brand.name ? ' is-selected' : ''}`} onClick={() => update('brand', brand.name)}><Fingerprint size={23}/><strong>{brand.name}</strong><small>{brand.hint}</small>{form.brand === brand.name && <Check className="bio-brand-check" size={14}/>}</button>)}</div></section>}

        {section === 1 && <section><div className="bio-section-heading"><h3>Connection Details</h3><p>Enter credentials stored securely by the device service.</p></div><div className="bio-form-grid">
          <label>Device Name<input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Head Office Device"/></label>
          <label>IP Address<input value={form.ipAddress} onChange={e => update('ipAddress', e.target.value)} placeholder="192.168.1.201"/>{form.ipAddress && !validIp(form.ipAddress) && <small className="bio-field-error">Enter a valid IPv4 address.</small>}</label>
          <label>Port<input type="number" value={form.port} onChange={e => update('port', e.target.value)}/></label>
          <label>Communication Key<input type="password" value={form.communicationKey} onChange={e => update('communicationKey', e.target.value)} placeholder="Required"/></label>
          <label>Username<input value={form.username} onChange={e => update('username', e.target.value)} placeholder="admin" autoComplete="username"/></label>
          <label>Password<input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Required" autoComplete="current-password"/></label>
          <label>Timezone<select value={form.timezone} onChange={e => update('timezone', e.target.value)}><option>Asia/Colombo</option><option>Asia/Kolkata</option><option>UTC</option></select></label>
          <label>Description<input value={form.description} onChange={e => update('description', e.target.value)} placeholder="Optional"/></label>
        </div>{testError && <div className="bio-alert bio-alert--error"><AlertTriangle size={16}/><div><strong>Connection failed</strong><span>{testError}</span></div></div>}</section>}

        {section === 2 && <section><div className="bio-success-banner"><ShieldCheck size={22}/><div><strong>Connection Successful</strong><span>Device identity and communication settings were validated.</span></div></div><div className="bio-checks">{['Device Reachable','Authentication Successful','Communication Key Valid','SDK Compatible','Firmware Readable','Device Time Available'].map(item => <div key={item}><Check size={15}/><span>{item}</span><b>Success</b></div>)}</div><div className="bio-detected"><span>Detected device</span><dl><div><dt>Model</dt><dd>{form.brand === 'ZKTeco' ? 'MB560' : 'Compatible terminal'}</dd></div><div><dt>Serial Number</dt><dd>SN982423342</dd></div><div><dt>Firmware</dt><dd>Ver 8.0.3</dd></div></dl></div></section>}

        {section === 3 && <section><div className="bio-section-heading"><h3>Organization & Synchronization</h3><p>Choose where this device belongs and how it exchanges attendance data.</p></div><h4 className="bio-form-subtitle"><Building2 size={15}/> Organization assignment</h4><div className="bio-form-grid">
          <label>Company<select value={form.company} onChange={e => update('company', e.target.value)}><option>OneVo Holdings</option></select></label>
          <label>Branch<select value={form.branch} onChange={e => update('branch', e.target.value)}><option value="">Select branch</option><option>Head Office</option><option>Factory</option><option>Kandy Branch</option><option>Warehouse</option><option>Sales Office</option></select></label>
          <label>Location<input value={form.location} onChange={e => update('location', e.target.value)} placeholder="Main Entrance"/></label>
          <label>Timezone<select value={form.timezone} onChange={e => update('timezone', e.target.value)}><option>Asia/Colombo</option><option>Asia/Kolkata</option><option>UTC</option></select></label>
        </div><h4 className="bio-form-subtitle"><RefreshCw size={15}/> Synchronization</h4><div className="bio-form-grid">
          <label>Frequency<select value={form.syncFrequency} onChange={e => update('syncFrequency', e.target.value as SyncFrequency)}>{['Realtime','Every 5 Minutes','Every 15 Minutes','Hourly','Manual'].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>Direction<select value={form.syncDirection} onChange={e => update('syncDirection', e.target.value as SyncDirection)}>{['HRMS → Device','Device → HRMS','Two-Way Synchronization'].map(v => <option key={v}>{v}</option>)}</select></label>
          <label>Retry Attempts<input type="number" min="1" max="10" value={form.retryAttempts} onChange={e => update('retryAttempts', Number(e.target.value))}/></label>
          <label className="bio-check-field"><input type="checkbox" checked={form.autoRetry} onChange={e => update('autoRetry', e.target.checked)}/><span><strong>Auto Retry</strong><small>Retry temporary connection failures automatically.</small></span></label>
        </div></section>}

        {section === 4 && <section><div className="bio-section-heading"><h3>Review Configuration</h3><p>Confirm the device, assignment, and sync settings before activation.</p></div><div className="bio-review-grid">
          <div><h4>Device Information</h4><p><span>Name</span><b>{form.name}</b></p><p><span>Brand</span><b>{form.brand}</b></p><p><span>Detected model</span><b>{form.brand === 'ZKTeco' ? 'MB560' : 'Compatible terminal'}</b></p></div>
          <div><h4>Connection</h4><p><span>Endpoint</span><b>{form.ipAddress}:{form.port}</b></p><p><span>Username</span><b>{form.username}</b></p><p><span>Credentials</span><b>Configured</b></p></div>
          <div><h4>Organization</h4><p><span>Company</span><b>{form.company}</b></p><p><span>Branch</span><b>{form.branch}</b></p><p><span>Location</span><b>{form.location}</b></p></div>
          <div><h4>Synchronization</h4><p><span>Frequency</span><b>{form.syncFrequency}</b></p><p><span>Direction</span><b>{form.syncDirection}</b></p><p><span>Auto retry</span><b>{form.autoRetry ? `${form.retryAttempts} attempts` : 'Off'}</b></p></div>
        </div></section>}

        {section === 5 && <section className="bio-complete"><div className="bio-complete__icon"><Check size={36}/></div><h3>Device Connected Successfully!</h3><p>“{form.name}” has been registered, monitoring is active, and the device is ready to use.</p></section>}
      </div>

      <footer className="bio-wizard__footer">
        {section < 5 && <button type="button" className="bio-btn bio-btn--secondary" onClick={section === 0 ? onClose : () => setSection((section - 1) as WizardSection)} disabled={testing || saving}>{section === 0 ? 'Cancel' : 'Back'}</button>}
        {section === 0 && <button type="button" className="bio-btn bio-btn--primary" disabled={!form.brand} onClick={() => setSection(1)}>Next <ChevronRight size={15}/></button>}
        {section === 1 && <button type="button" className="bio-btn bio-btn--primary" disabled={!connectionValid || testing} onClick={runTest}>{testing && <RefreshCw className="is-spinning" size={15}/>} {testing ? 'Testing...' : 'Test Connection'}</button>}
        {section === 2 && <button type="button" className="bio-btn bio-btn--primary" onClick={() => setSection(3)}>Continue <ChevronRight size={15}/></button>}
        {section === 3 && <button type="button" className="bio-btn bio-btn--primary" disabled={!form.branch || !form.location || !tested} onClick={() => setSection(4)}>Review <ChevronRight size={15}/></button>}
        {section === 4 && <button type="button" className="bio-btn bio-btn--primary" disabled={saving} onClick={activate}>{saving && <RefreshCw className="is-spinning" size={15}/>} {saving ? 'Activating...' : 'Save & Activate'}</button>}
        {section === 5 && <button type="button" className="bio-btn bio-btn--primary" onClick={onClose}>Go to Devices</button>}
      </footer>
    </div>
  </div>;
}

function DeviceDetail({ device, onBack, onUpdate, onRemove }: { device: BiometricDevice; onBack: () => void; onUpdate: (device: BiometricDevice) => void; onRemove: (id: string) => void }) {
  const [tab, setTab] = useState<DetailTab>('overview');
  const [syncing, setSyncing] = useState(false);
  const tabs: Array<{ id: DetailTab; label: string }> = [{id:'overview',label:'Overview'},{id:'health',label:'Health'},{id:'sync',label:'Attendance Sync'},{id:'logs',label:'Logs'},{id:'settings',label:'Settings'}];
  const syncNow = () => { setSyncing(true); window.setTimeout(() => { onUpdate({...device,lastSync:'Just now',nextSync:'in 5 min',logs:[{id:`l-${Date.now()}`,at:'Just now',event:'Sync Completed',description:'Attendance records synchronized successfully',status:'success'},...device.logs]}); setSyncing(false); },700); };
  const setStatus = (status: DeviceStatus) => onUpdate({...device,status,logs:[{id:`l-${Date.now()}`,at:'Just now',event:status === 'disabled' ? 'Device Disabled' : status === 'archived' ? 'Device Archived' : 'Device Enabled',description:`Status changed to ${status}`,status:'info'},...device.logs]});
  return <div className="bio-page"><header className="bio-detail-header"><div><button type="button" className="bio-back" onClick={onBack}><ArrowLeft size={15}/> Devices</button><div className="bio-detail-title"><div className="bio-device-mark"><Fingerprint size={22}/></div><div><h1>{device.name}</h1><p>{device.brand} · {device.model} · {device.branch}</p></div><StatusBadge status={device.status}/></div></div><button type="button" className="bio-icon-btn"><MoreHorizontal size={18}/></button></header>
    <nav className="bio-tabs" aria-label="Device details">{tabs.map(item => <button type="button" key={item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>
    <main className="bio-detail-body">
      {tab === 'overview' && <div className="bio-detail-grid"><section className="bio-panel bio-panel--wide"><h2>Device Information</h2><dl className="bio-definition-grid">{[['Device Name',device.name],['Brand',device.brand],['Model',device.model],['Serial Number',device.serialNumber],['Firmware',device.firmware],['IP Address',device.ipAddress],['Branch',device.branch],['Location',device.location],['Connected Since',device.connectedSince],['Last Sync',device.lastSync]].map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section><section className="bio-panel"><h2>Current Status</h2><div className="bio-big-status"><Wifi size={24}/><strong>{STATUS_LABEL[device.status]}</strong><span>Last heartbeat {device.lastHeartbeat}</span></div></section></div>}
      {tab === 'health' && <><div className="bio-metric-grid"><div><span>Status</span><strong><StatusBadge status={device.status}/></strong></div><div><span>Health Score</span><strong>{device.healthScore}%</strong><small>{device.healthScore >= 90 ? 'Excellent' : 'Needs attention'}</small></div><div><span>Last Heartbeat</span><strong>{device.lastHeartbeat}</strong></div><div><span>Network Latency</span><strong>{device.latency ? `${device.latency} ms` : 'Unavailable'}</strong></div></div><section className="bio-panel"><h2>Connection Health</h2><div className="bio-health-bars">{[['Authentication',100],['Network stability',device.healthScore],['Firmware compatibility',96],['Clock synchronization',92]].map(([name,value]) => <div key={String(name)}><span>{name}</span><div><i style={{width:`${value}%`}}/></div><b>{value}%</b></div>)}</div></section></>}
      {tab === 'sync' && <><div className="bio-metric-grid"><div><span>Last Sync</span><strong>{device.lastSync}</strong></div><div><span>Next Sync</span><strong>{device.nextSync}</strong></div><div><span>Frequency</span><strong>{device.syncFrequency}</strong></div><div><span>Direction</span><strong>{device.syncDirection}</strong></div></div><section className="bio-panel bio-action-panel"><div><h2>Attendance synchronization</h2><p>Import new attendance records and refresh employee mappings.</p></div><button type="button" className="bio-btn bio-btn--primary" onClick={syncNow} disabled={syncing || device.status !== 'online'}><RefreshCw size={15} className={syncing ? 'is-spinning' : ''}/>{syncing ? 'Synchronizing...' : 'Sync Now'}</button></section></>}
      {tab === 'logs' && <section className="bio-panel"><div className="bio-panel-header"><div><h2>Activity Logs</h2><p>Connection, validation, configuration, and synchronization events.</p></div><button type="button" className="bio-btn bio-btn--secondary">Export</button></div><div className="bio-log-list">{device.logs.length ? device.logs.map(item => <div key={item.id}><span className={`bio-log-dot bio-log-dot--${item.status}`}/><time>{item.at}</time><strong>{item.event}</strong><p>{item.description}</p><em>{item.status}</em></div>) : <div className="bio-empty-row">No activity recorded yet.</div>}</div></section>}
      {tab === 'settings' && <div className="bio-settings-stack"><section className="bio-panel bio-action-panel"><div><h2>Connection</h2><p>Restart the secure connection using the current configuration.</p></div><button type="button" className="bio-btn bio-btn--secondary" onClick={() => onUpdate({...device,lastHeartbeat:'Just now'})}><Zap size={15}/> Restart Connection</button></section><section className="bio-panel bio-action-panel"><div><h2>{device.status === 'disabled' ? 'Enable Device' : 'Disable Device'}</h2><p>Temporarily stop or resume attendance synchronization.</p></div><button type="button" className="bio-btn bio-btn--secondary" onClick={() => setStatus(device.status === 'disabled' ? 'online' : 'disabled')}><Unplug size={15}/>{device.status === 'disabled' ? 'Enable' : 'Disable'}</button></section><section className="bio-panel bio-action-panel"><div><h2>Archive Device</h2><p>Hide this device from the active list while retaining history.</p></div><button type="button" className="bio-btn bio-btn--secondary" onClick={() => setStatus('archived')}><Archive size={15}/> Archive</button></section><section className="bio-panel bio-action-panel bio-danger-zone"><div><h2>Remove Device</h2><p>Permanently remove configuration. Historical attendance records remain retained.</p></div><button type="button" className="bio-btn bio-btn--danger" onClick={() => { if (window.confirm(`Remove ${device.name}? This cannot be undone.`)) onRemove(device.id); }}><Trash2 size={15}/> Remove</button></section></div>}
    </main>
  </div>;
}

export function BiometricDevicesPage() {
  const [devices, setDevices] = useState(INITIAL_BIOMETRIC_DEVICES);
  const [filter, setFilter] = useState<'all' | DeviceStatus>('all');
  const [query, setQuery] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = devices.find(device => device.id === selectedId) ?? null;
  const activeDevices = devices.filter(device => device.status !== 'archived');
  const counts = { all: activeDevices.length, online: activeDevices.filter(d => d.status === 'online').length, offline: activeDevices.filter(d => d.status === 'offline').length, attention: activeDevices.filter(d => d.status === 'attention').length };
  const visible = useMemo(() => activeDevices.filter(device => (filter === 'all' || device.status === filter) && [device.name,device.brand,device.branch,device.location,device.model].some(value => value.toLowerCase().includes(query.toLowerCase().trim()))), [activeDevices,filter,query]);
  const updateDevice = (next: BiometricDevice) => setDevices(current => current.map(device => device.id === next.id ? next : device));
  const removeDevice = (id: string) => { setDevices(current => current.filter(device => device.id !== id)); setSelectedId(null); };
  if (selected) return <DeviceDetail device={selected} onBack={() => setSelectedId(null)} onUpdate={updateDevice} onRemove={removeDevice}/>;

  return <div className="bio-page"><header className="bio-page-header"><div><span className="bio-eyebrow">Settings / Devices</span><h1>Biometric Devices</h1><p>Connect, monitor, and manage attendance terminals across your organization.</p></div><button type="button" className="bio-btn bio-btn--primary" onClick={() => setWizardOpen(true)}><Plus size={16}/> Connect Device</button></header>
    <main className="bio-page-body"><div className="bio-summary-grid"><SummaryCard label="Total Devices" value={counts.all} tone="neutral" active={filter === 'all'} onClick={() => setFilter('all')}/><SummaryCard label="Online" value={counts.online} tone="success" active={filter === 'online'} onClick={() => setFilter('online')}/><SummaryCard label="Offline" value={counts.offline} tone="danger" active={filter === 'offline'} onClick={() => setFilter('offline')}/><SummaryCard label="Attention Required" value={counts.attention} tone="warning" active={filter === 'attention'} onClick={() => setFilter('attention')}/></div>
      <section className="bio-panel bio-device-list"><div className="bio-list-toolbar"><div><h2>Connected Devices</h2><p>{visible.length} device{visible.length === 1 ? '' : 's'} shown</p></div><label className="bio-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search devices..." aria-label="Search devices"/></label></div>
        <div className="bio-table-wrap"><table className="bio-table"><thead><tr><th>Device Name</th><th>Brand / Model</th><th>Branch / Location</th><th>Status</th><th>Health</th><th>Last Sync</th><th aria-label="Actions"/></tr></thead><tbody>{visible.map(device => <tr key={device.id} onClick={() => setSelectedId(device.id)}><td><div className="bio-device-cell"><span><Fingerprint size={17}/></span><div><strong>{device.name}</strong><small>{device.ipAddress}</small></div></div></td><td><strong>{device.brand}</strong><small>{device.model}</small></td><td><strong>{device.branch}</strong><small>{device.location}</small></td><td><StatusBadge status={device.status}/></td><td><div className="bio-health-cell"><strong>{device.healthScore}%</strong><span><i style={{width:`${device.healthScore}%`}}/></span></div></td><td><strong>{device.lastSync}</strong><small>Heartbeat {device.lastHeartbeat}</small></td><td><button type="button" className="bio-icon-btn" onClick={event => {event.stopPropagation();setSelectedId(device.id);}} aria-label={`View ${device.name}`}><Eye size={16}/></button></td></tr>)}</tbody></table>{!visible.length && <div className="bio-empty"><Fingerprint size={30}/><h3>No matching devices</h3><p>Adjust the search or status filter.</p></div>}</div>
      </section>
    </main>{wizardOpen && <ConnectDeviceWizard onClose={() => setWizardOpen(false)} onConnected={device => { setDevices(current => [device,...current]); setSelectedId(device.id); }}/>}</div>;
}
