import { useMemo, useState } from 'react';
import { Activity, Archive, ChevronLeft, Fingerprint, Plus, RefreshCw, Search, Settings, ShieldCheck, Trash2, Wifi, WifiOff, X } from 'lucide-react';
import { BRAND_LABELS, EMPTY_DEVICE_DRAFT } from './biometric-device.data';
import { useBiometricDeviceStore } from './biometric-device.store';
import type { BiometricBrand, BiometricDevice, ConnectionTestResult, DeviceDraft, DeviceStatus } from './biometric-device.types';
import './biometric-devices.css';

const BRANDS = Object.entries(BRAND_LABELS) as Array<[BiometricBrand, string]>;
const STATUS_LABELS: Record<DeviceStatus, string> = { online: 'Online', offline: 'Offline', attention: 'Attention', disabled: 'Disabled', archived: 'Archived' };

const relativeTime = (value: string | null) => {
  if (!value) return 'Never';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return new Date(value).toLocaleDateString();
};

const cloneDraft = (): DeviceDraft => JSON.parse(JSON.stringify(EMPTY_DEVICE_DRAFT)) as DeviceDraft;

function DevicesWorkspaceTabs({ active, onChange }: { active: 'biometric' | 'employee'; onChange: (value: 'biometric' | 'employee') => void }) {
  return <div className="bio-workspace-tabs" role="tablist" aria-label="Device categories">
    <button role="tab" aria-selected={active === 'biometric'} className={active === 'biometric' ? 'active' : ''} onClick={() => onChange('biometric')}><Fingerprint size={14} /> Biometric Devices</button>
    <button role="tab" aria-selected={active === 'employee'} className={active === 'employee' ? 'active' : ''} onClick={() => onChange('employee')}><Activity size={14} /> Employee Devices</button>
  </div>;
}

export { DevicesWorkspaceTabs };

export function BiometricDevicesPage() {
  const devices = useBiometricDeviceStore(state => state.devices);
  const setStatus = useBiometricDeviceStore(state => state.setStatus);
  const removeDevice = useBiometricDeviceStore(state => state.removeDevice);
  const [query, setQuery] = useState('');
  const [status, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selected, setSelected] = useState<BiometricDevice | null>(null);

  const summary = useMemo(() => ({
    total: devices.filter(device => device.status !== 'archived').length,
    online: devices.filter(device => device.status === 'online').length,
    offline: devices.filter(device => device.status === 'offline').length,
    attention: devices.filter(device => device.status === 'attention').length
  }), [devices]);
  const visible = useMemo(() => devices.filter(device => {
    const matchesStatus = status === 'all' ? device.status !== 'archived' : device.status === status;
    const haystack = `${device.name} ${BRAND_LABELS[device.brand]} ${device.model} ${device.assignment.branch}`.toLowerCase();
    return matchesStatus && haystack.includes(query.trim().toLowerCase());
  }), [devices, query, status]);

  return <div className="bio-page">
    <header className="bio-page-header">
      <div><h1>Biometric Devices</h1><p>Connect, monitor, and manage attendance terminals across your organization.</p></div>
      <button className="org-btn org-btn--primary" onClick={() => setWizardOpen(true)}><Plus size={15} /> Connect Device</button>
    </header>
    <section className="bio-summary" aria-label="Device summary">
      {[
        ['all', 'Total Devices', summary.total], ['online', 'Online Devices', summary.online],
        ['offline', 'Offline Devices', summary.offline], ['attention', 'Attention Required', summary.attention]
      ].map(([key, label, count]) => <button key={key} className={status === key ? 'active' : ''} onClick={() => setStatusFilter(key as DeviceStatus | 'all')}><span>{label}</span><strong>{count}</strong></button>)}
    </section>
    <section className="bio-panel">
      <div className="bio-toolbar">
        <label><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search devices..." aria-label="Search biometric devices" /></label>
        <select value={status} onChange={event => setStatusFilter(event.target.value as DeviceStatus | 'all')} aria-label="Filter device status"><option value="all">Active devices</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      </div>
      <div className="cfg-table-wrap"><table className="cfg-table bio-table"><thead><tr><th>Device</th><th>Brand / Model</th><th>Branch / Location</th><th>Status</th><th>Health</th><th>Last Sync</th><th>Actions</th></tr></thead>
        <tbody>{visible.map(device => <tr key={device.id} className="bio-table__row" onClick={() => setSelected(device)}><td><span className="bio-device-link">{device.name}</span><small>{device.connection.ipAddress}:{device.connection.port}</small></td><td>{BRAND_LABELS[device.brand]}<small>{device.model}</small></td><td>{device.assignment.branch}<small>{device.assignment.location}</small></td><td><span className={`bio-status bio-status--${device.status}`}>{STATUS_LABELS[device.status]}</span></td><td><strong className={device.healthScore < 70 ? 'bio-score--low' : ''}>{device.healthScore}%</strong></td><td>{relativeTime(device.lastSync)}</td><td><div className="bio-row-actions"><button type="button" className="cfg-action-btn" onClick={event => { event.stopPropagation(); setStatus(device.id, device.status === 'disabled' ? 'online' : 'disabled'); }}>{device.status === 'disabled' ? 'Enable' : 'Disable'}</button></div></td></tr>)}</tbody>
      </table></div>
      {visible.length === 0 && <div className="bio-empty"><Fingerprint size={30} /><h3>No devices found</h3><p>Change the filters or connect a new biometric device.</p></div>}
    </section>
    {wizardOpen && <ConnectDeviceWizard onClose={() => setWizardOpen(false)} onComplete={device => { setWizardOpen(false); setSelected(device); }} />}
    {selected && <DeviceDetail deviceId={selected.id} onClose={() => setSelected(null)} onStatus={setStatus} onRemove={id => { removeDevice(id); setSelected(null); }} />}
  </div>;
}

function ConnectDeviceWizard({ onClose, onComplete }: { onClose: () => void; onComplete: (device: BiometricDevice) => void }) {
  const addDevice = useBiometricDeviceStore(state => state.addDevice);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DeviceDraft>(cloneDraft);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [created, setCreated] = useState<BiometricDevice | null>(null);
  const [error, setError] = useState('');
  const detected = result?.detected;
  const updateConnection = (key: keyof DeviceDraft['connection'], value: string | number) => setDraft(current => ({ ...current, connection: { ...current.connection, [key]: value } }));
  const updateAssignment = (key: keyof DeviceDraft['assignment'], value: string) => setDraft(current => ({ ...current, assignment: { ...current.assignment, [key]: value } }));
  const testConnection = () => {
    if (!draft.name.trim() || !draft.connection.ipAddress.trim() || !draft.connection.port || !draft.connection.communicationKey || !draft.connection.username || !draft.connection.password) { setError('Complete all required connection fields.'); return; }
    setError(''); setTesting(true); setResult(null); setStep(3);
    window.setTimeout(() => { const fail = draft.connection.ipAddress.endsWith('.0'); setResult(fail ? { success: false, checks: [{ label: 'Device reachable', passed: false, message: 'Port unreachable' }, { label: 'Authentication', passed: false }] } : { success: true, checks: ['Device reachable', 'Authentication successful', 'Communication key valid', 'SDK compatible', 'Firmware readable', 'Device time available'].map(label => ({ label, passed: true })), detected: { model: draft.brand === 'hikvision' ? 'DS-K1T341' : 'MB560', serialNumber: `SN-${Date.now().toString().slice(-7)}`, firmware: '8.0.3' } }); setTesting(false); }, 650);
  };
  const activate = () => {
    if (!detected) return;
    if (!draft.assignment.branch.trim() || !draft.assignment.location.trim()) {
      setError('Branch and location are required before activation.');
      setStep(2);
      return;
    }
    setCreated(addDevice(draft, detected));
    setStep(4);
  };

  return <div className="bio-modal-backdrop" role="presentation"><div className="bio-wizard" role="dialog" aria-modal="true" aria-label="Connect new biometric device">
    <header><div><h2>Connect New Device</h2><p>Securely add a biometric attendance terminal.</p></div><button onClick={onClose} aria-label="Close"><X size={18} /></button></header>
    <div className="bio-stepper">{['Brand', 'Connection Details', 'Test Connection', 'Complete'].map((label, index) => <div key={label} className={step > index ? 'active' : ''}><span>{step > index + 1 ? '✓' : index + 1}</span><small>{label}</small></div>)}</div>
    <div className="bio-wizard-body">
      {step === 1 && <><div className="bio-section-heading"><h3>Select Device Brand</h3><p>The brand determines the supported connection and validation method.</p></div><div className="bio-brand-grid">{BRANDS.map(([key, label]) => <button key={key} className={draft.brand === key ? 'active' : ''} onClick={() => setDraft(current => ({ ...current, brand: key }))}><Fingerprint size={23} /><strong>{label}</strong></button>)}</div></>}
      {step === 2 && <><div className="bio-section-heading"><h3>Connection & Organization</h3><p>Enter device credentials and assign its physical location.</p></div><div className="bio-form-grid">
        <label>Device Name *<input value={draft.name} onChange={e => setDraft(c => ({ ...c, name: e.target.value }))} /></label><label>IP Address *<input value={draft.connection.ipAddress} onChange={e => updateConnection('ipAddress', e.target.value)} placeholder="192.168.1.201" /></label>
        <label>Port *<input type="number" value={draft.connection.port} onChange={e => updateConnection('port', Number(e.target.value))} /></label><label>Communication Key *<input type="password" value={draft.connection.communicationKey} onChange={e => updateConnection('communicationKey', e.target.value)} /></label>
        <label>Username *<input value={draft.connection.username} onChange={e => updateConnection('username', e.target.value)} /></label><label>Password *<input type="password" value={draft.connection.password} onChange={e => updateConnection('password', e.target.value)} /></label>
        <label>Company<select value={draft.assignment.company} onChange={e => updateAssignment('company', e.target.value)}><option>OneVo</option></select></label><label>Branch *<input value={draft.assignment.branch} onChange={e => updateAssignment('branch', e.target.value)} placeholder="Head Office" /></label>
        <label>Location *<input value={draft.assignment.location} onChange={e => updateAssignment('location', e.target.value)} placeholder="Main entrance" /></label><label>Timezone<select value={draft.assignment.timezone} onChange={e => updateAssignment('timezone', e.target.value)}><option>Asia/Colombo</option><option>Asia/Kolkata</option><option>UTC</option></select></label>
      </div>{error && <p className="bio-form-error">{error}</p>}</>}
      {step === 3 && <>{testing ? <div className="bio-test-state"><RefreshCw className="spin" size={34} /><h3>Testing connection...</h3><p>Checking network, credentials, SDK, firmware, and device time.</p></div> : result && <div className="bio-test-result"><div className={result.success ? 'success' : 'failed'}><ShieldCheck size={24} /><div><h3>{result.success ? 'Connection Successful!' : 'Connection Failed'}</h3><p>{result.success ? 'The device is ready to configure and activate.' : 'Update the connection details and try again.'}</p></div></div><ul>{result.checks.map(check => <li key={check.label}><span>{check.passed ? '✓' : '×'}</span>{check.label}<small>{check.message}</small></li>)}</ul>{detected && <div className="bio-detected"><div><span>Model</span><strong>{detected.model}</strong></div><div><span>Serial Number</span><strong>{detected.serialNumber}</strong></div><div><span>Firmware</span><strong>{detected.firmware}</strong></div></div>}
        {result.success && <div className="bio-sync-config"><h4>Synchronization</h4><label>Frequency<select value={draft.syncConfig.frequency} onChange={e => setDraft(c => ({ ...c, syncConfig: { ...c.syncConfig, frequency: e.target.value as DeviceDraft['syncConfig']['frequency'] } }))}><option value="realtime">Realtime</option><option value="5-minutes">Every 5 Minutes</option><option value="15-minutes">Every 15 Minutes</option><option value="hourly">Hourly</option><option value="manual">Manual</option></select></label><label>Direction<select value={draft.syncConfig.direction} onChange={e => setDraft(c => ({ ...c, syncConfig: { ...c.syncConfig, direction: e.target.value as DeviceDraft['syncConfig']['direction'] } }))}><option value="device-to-hrms">Device → HRMS</option><option value="hrms-to-device">HRMS → Device</option><option value="two-way">Two-way</option></select></label><label className="bio-check"><input type="checkbox" checked={draft.syncConfig.autoRetry} onChange={e => setDraft(c => ({ ...c, syncConfig: { ...c.syncConfig, autoRetry: e.target.checked } }))} /> Auto retry failed syncs</label></div>}
      </div>}</>}
      {step === 4 && <div className="bio-complete"><div><ShieldCheck size={44} /></div><h3>Device Connected Successfully!</h3><p>“{draft.name}” has been added and is now ready to use.</p></div>}
    </div>
    <footer>{step > 1 && step < 4 && <button className="org-btn org-btn--secondary" onClick={() => { setStep(step - 1); if (step === 3) setResult(null); }}><ChevronLeft size={14} /> Back</button>}<span />{step === 1 && <button className="org-btn org-btn--primary" disabled={!draft.brand} onClick={() => setStep(2)}>Next</button>}{step === 2 && <button className="org-btn org-btn--primary" onClick={testConnection}>Test Connection</button>}{step === 3 && result && !result.success && <button className="org-btn org-btn--primary" onClick={() => setStep(2)}>Update Details</button>}{step === 3 && result?.success && <button className="org-btn org-btn--primary" onClick={activate}>Save & Activate</button>}{step === 4 && <div className="bio-complete-actions"><button className="org-btn org-btn--secondary" onClick={onClose}>Go to Devices</button><button className="org-btn org-btn--primary" onClick={() => created && onComplete(created)}>View Device</button></div>}</footer>
  </div></div>;
}

function DeviceDetail({ deviceId, onClose, onStatus, onRemove }: { deviceId: string; onClose: () => void; onStatus: (id: string, status: DeviceStatus) => void; onRemove: (id: string) => void }) {
  const device = useBiometricDeviceStore(state => state.devices.find(item => item.id === deviceId));
  const syncNow = useBiometricDeviceStore(state => state.syncNow);
  const [tab, setTab] = useState<'overview' | 'health' | 'sync' | 'logs' | 'settings'>('overview');
  if (!device) return null;
  return <div className="bio-modal-backdrop"><div className="bio-detail" role="dialog" aria-modal="true" aria-label={`${device.name} details`}>
    <header><button onClick={onClose} aria-label="Back"><ChevronLeft size={18} /></button><div><h2>{device.name}</h2><span className={`bio-status bio-status--${device.status}`}>{STATUS_LABELS[device.status]}</span></div><button onClick={onClose} aria-label="Close"><X size={18} /></button></header>
    <nav>{(['overview', 'health', 'sync', 'logs', 'settings'] as const).map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item === 'sync' ? 'Attendance Sync' : item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
    <main>
      {tab === 'overview' && <div className="bio-detail-grid">{[['Device Name', device.name], ['Brand', BRAND_LABELS[device.brand]], ['Model', device.model], ['Firmware', device.firmware], ['Serial Number', device.serialNumber], ['IP Address', device.connection.ipAddress], ['Branch', device.assignment.branch], ['Location', device.assignment.location], ['Connected Since', new Date(device.connectedSince).toLocaleString()], ['Last Sync', relativeTime(device.lastSync)]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
      {tab === 'health' && <div className="bio-health"><div><Wifi size={24} /><span>Status</span><strong>{STATUS_LABELS[device.status]}</strong></div><div><ShieldCheck size={24} /><span>Health Score</span><strong>{device.healthScore}%</strong></div><div><Activity size={24} /><span>Last Heartbeat</span><strong>{relativeTime(device.lastHeartbeat)}</strong></div><div><WifiOff size={24} /><span>Network Latency</span><strong>{device.networkLatencyMs ? `${device.networkLatencyMs} ms` : 'Unavailable'}</strong></div></div>}
      {tab === 'sync' && <div className="bio-sync"><div className="bio-detail-grid"><div><span>Last Sync</span><strong>{relativeTime(device.lastSync)}</strong></div><div><span>Next Sync</span><strong>{relativeTime(device.nextSync)}</strong></div><div><span>Frequency</span><strong>{device.syncConfig.frequency}</strong></div><div><span>Direction</span><strong>{device.syncConfig.direction}</strong></div></div><button className="org-btn org-btn--primary" onClick={() => syncNow(device.id)}><RefreshCw size={14} /> {device.syncStatus === 'failed' ? 'Retry Synchronization' : 'Sync Now'}</button></div>}
      {tab === 'logs' && <div className="cfg-table-wrap"><table className="cfg-table"><thead><tr><th>Time</th><th>Event</th><th>Description</th><th>Status</th></tr></thead><tbody>{device.activities.map(activity => <tr key={activity.id}><td>{new Date(activity.timestamp).toLocaleString()}</td><td>{activity.event}</td><td>{activity.description}</td><td><span className={`bio-log-status bio-log-status--${activity.status}`}>{activity.status}</span></td></tr>)}</tbody></table></div>}
      {tab === 'settings' && <div className="bio-settings-actions"><button onClick={() => onStatus(device.id, device.status === 'disabled' ? 'online' : 'disabled')}><Settings size={18} /><span><strong>{device.status === 'disabled' ? 'Enable Device' : 'Disable Device'}</strong><small>Temporarily stop device synchronization.</small></span></button><button onClick={() => onStatus(device.id, 'archived')}><Archive size={18} /><span><strong>Archive Device</strong><small>Hide from active devices while retaining history.</small></span></button><button className="danger" onClick={() => { if (window.confirm(`Remove ${device.name}? Historical attendance records will be retained.`)) onRemove(device.id); }}><Trash2 size={18} /><span><strong>Remove Device</strong><small>Permanently disconnect and remove this configuration.</small></span></button></div>}
    </main>
  </div></div>;
}
