import React, { useState } from 'react';
import { 
  Settings, Shield, FileText, Laptop, 
  X, ChevronDown, Plus, AlertTriangle, Trash2,
  ShieldAlert, Monitor,
  Download, RefreshCw, Search, Clock, History
} from 'lucide-react';
import { useMonitoringStore } from './monitoringStore';
import { useEmployeeContext } from '../../context/employee-context';
import { useOrganizationStore } from '../../../../store/organizationStore';
import { MonitoringPolicyPage } from './MonitoringPolicyPage';
import { useInbox } from '../../../../core/notifications/inbox-context';
import './employee-monitoring.css';

export const EmployeeMonitoring: React.FC = () => {
  const { selectedEmployee } = useEmployeeContext();
  const { addInboxItem } = useInbox();
  const isManagerOrCeo = selectedEmployee.role === 'Chief Executive Officer' || selectedEmployee.role === 'Manager';

  const { employees: orgEmployees, positions, departments, assignments } = useOrganizationStore();

  // Helper to dynamically resolve employee name and department
  const getEmployeeDetails = (idOrName: string) => {
    let emp = orgEmployees.find(e => e.id === idOrName);
    if (!emp) {
      emp = orgEmployees.find(e => 
        `${e.firstName} ${e.lastName}`.trim().toLowerCase() === idOrName.toLowerCase() ||
        e.firstName.toLowerCase() === idOrName.toLowerCase()
      );
    }

    if (emp) {
      const name = `${emp.firstName} ${emp.lastName}`.trim();
      const activeAsg = assignments.find(a => a.employeeId === emp.id && a.status === 'active');
      const pos = activeAsg ? positions.find(p => p.id === activeAsg.positionId) : null;
      const dept = pos ? departments.find(d => d.id === pos.departmentId) : null;
      return {
        name,
        department: dept ? dept.name : 'General'
      };
    }

    const legacyMap: Record<string, { name: string, department: string }> = {
      'kajaatharan': { name: 'Kajaatharan', department: 'Engineering' },
      'aarathana': { name: 'Aarathana', department: 'Design' },
      'dinesh kumar': { name: 'Dinesh Kumar', department: 'Engineering' },
      'vimal raj': { name: 'Vimal Raj', department: 'Operations' },
      'srinath': { name: 'Srinath', department: 'Quality Assurance' }
    };

    const key = idOrName.toLowerCase();
    return legacyMap[key] || { name: idOrName, department: 'General' };
  };

  // Navigation within page
  const [currentView, setCurrentView] = useState<'dashboard' | 'policy' | 'apps'>('dashboard');
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);

  // Store actions & states
  const store = useMonitoringStore();

  // Modals state
  const [editingPolicy, setEditingPolicy] = useState<'activity' | 'idle' | 'screenshot' | 'webcam' | null>(null);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [zoomScreenshot, setZoomScreenshot] = useState<string | null>(null);

  // Form states
  const [activityForm, setActivityForm] = useState(store.activityPolicy);
  const [idleForm, setIdleForm] = useState(store.idlePolicy);
  const [screenshotForm, setScreenshotForm] = useState(store.screenshotPolicy);
  const [webcamForm, setWebcamForm] = useState(store.webcamPolicy);
  
  const [newApp, setNewApp] = useState({
    name: '',
    executableName: '',
    category: 'Browser',
    allowed: true,
    description: '',
    applyTo: 'All Employees'
  });

  const [requestForm, setRequestForm] = useState({
    oldDevice: '',
    currentDevice: '',
    reason: ''
  });

  // Drawer Tab and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawerTab, setActiveDrawerTab] = useState<'pending' | 'history'>('pending');

  // Compute requests for drawer
  const filteredRequests = store.requests
    .filter(r => {
      if (activeDrawerTab === 'pending') {
        return r.status === 'Pending';
      } else {
        return r.status !== 'Pending';
      }
    })
    .filter(r => {
      const q = searchQuery.toLowerCase();
      const empName = (r.employeeName || '').toLowerCase();
      const oldD = (r.oldDevice || '').toLowerCase();
      const curD = (r.currentDevice || '').toLowerCase();
      const reas = (r.reason || '').toLowerCase();
      return empName.includes(q) || oldD.includes(q) || curD.includes(q) || reas.includes(q);
    });

  const selectedRequest = store.requests.find(r => r.id === store.activeRequestId) || filteredRequests[0] || null;

  // Tray App Simulator state
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [permissions, setPermissions] = useState({
    location: null as boolean | null,
    mic: null as boolean | null,
    camera: null as boolean | null,
    bluetooth: null as boolean | null,
    keyboard: null as boolean | null,
    mouse: null as boolean | null,
    screenshot: null as boolean | null
  });
  const [dismissedDownloadPrompt, setDismissedDownloadPrompt] = useState(false);


  // Toast State
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Filter States for Screenshots
  const [empFilter, setEmpFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Handle policy save
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateActivityPolicy(activityForm);
    setEditingPolicy(null);
    triggerToast('Activity Tracking Policy saved successfully.');
  };

  const handleSaveIdle = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateIdlePolicy(idleForm);
    setEditingPolicy(null);
    triggerToast('Idle Time Policy saved successfully.');
  };

  const handleSaveScreenshot = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateScreenshotPolicy(screenshotForm);
    setEditingPolicy(null);
    triggerToast('Screenshot Policy saved successfully.');
  };

  const handleSaveWebcam = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateWebcamPolicy(webcamForm);
    setEditingPolicy(null);
    triggerToast('Webcam Policy saved successfully.');
  };

  // Handle add app
  const handleAddAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addApp(newApp);
    setShowAddAppModal(false);
    setNewApp({
      name: '',
      executableName: '',
      category: 'Browser',
      allowed: true,
      description: '',
      applyTo: 'All Employees'
    });
    triggerToast('Application successfully added to the allowlist.');
  };

  // Handle device change request
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequestId = 'req-' + Date.now();
    const employeeName = selectedEmployee.name;
    
    // Store request in monitoring store
    store.submitDeviceRequest({
      ...requestForm,
      employeeId: selectedEmployee.id,
      employeeName
    });
    
    // Send a notification to the manager
    addInboxItem({
      id: `dev-req-notif-${Date.now()}`,
      category: 'approval',
      title: 'Device association switch',
      message: `${employeeName} requested a device swap from ${requestForm.oldDevice} to ${requestForm.currentDevice}.`,
      timeLabel: 'Just now',
      filter: 'new',
      actions: [],
      deviceRequestMeta: { requestId: newRequestId }
    });

    setShowRequestModal(false);
    setRequestForm({ oldDevice: '', currentDevice: '', reason: '' });
    triggerToast('Device swap request submitted successfully.');
  };

  // Start Download Simulator
  const startDownloadFlow = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
      triggerToast('Desktop application successfully downloaded!');
    }, 2500);
  };

  // Set permission values
  const setPermissionVal = (key: keyof typeof permissions, val: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: val }));
  };

  // Check if all permissions accepted
  const allPermissionsAccepted = Object.values(permissions).every(val => val === true);

  return (
    <div className="content-card">
      <div className="monitoring-container">
        {toast && (
          <div className="schedules-cfg-toast" role="status">
            {toast}
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss">×</button>
          </div>
        )}

      {/* Header */}
      {currentView === 'dashboard' && (
        <div className="monitoring-header">
          <div className="monitoring-title-wrap">
            <h1>Employee Monitoring & Compliance</h1>
            <p>Configure automated workspace tracking, application restrictions, and presence compliance.</p>
          </div>

          {isManagerOrCeo && (
            <div className="config-dropdown-container">
              <button 
                className="btn-config" 
                onClick={() => setShowConfigDropdown(!showConfigDropdown)}
              >
                <Settings size={16} />
                Configuration
                <ChevronDown size={14} />
              </button>
              {showConfigDropdown && (
                <div className="config-dropdown">
                  <button className="dropdown-item" onClick={() => { setCurrentView('policy'); setShowConfigDropdown(false); }}>
                    <Shield size={14} />
                    Monitoring Policy
                  </button>
                  <button className="dropdown-item" onClick={() => { setCurrentView('apps'); setShowConfigDropdown(false); }}>
                    <FileText size={14} />
                    App Allow List
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------- MANAGER & CEO VIEWS -------------------- */}
      {isManagerOrCeo && (
        <>
          {/* Main Dashboard View */}
          {currentView === 'dashboard' && (
            <>
              {/* Live Employee Status Strip modeled after Time Tracking's KPI strip */}
              <div className="monitoring-kpi-strip" style={{ marginBottom: '1.25rem' }}>
                <div className="monitoring-kpi-card">
                  <span className="monitoring-kpi-card__label">Active</span>
                  <span className="monitoring-kpi-card__value monitoring-kpi-card__value--success">
                    {store.activities.filter(a => a.status === 'Working').length}
                  </span>
                  <span className="monitoring-kpi-card__sub">Currently Active</span>
                </div>
                <div className="monitoring-kpi-card">
                  <span className="monitoring-kpi-card__label">Idle</span>
                  <span className="monitoring-kpi-card__value monitoring-kpi-card__value--warning">
                    {store.activities.filter(a => a.status === 'Idle').length}
                  </span>
                  <span className="monitoring-kpi-card__sub">Currently Idle</span>
                </div>
                <div className="monitoring-kpi-card">
                  <span className="monitoring-kpi-card__label">Offline</span>
                  <span className="monitoring-kpi-card__value" style={{ color: 'var(--nexus-text-muted)' }}>
                    {store.activities.filter(a => a.status === 'Offline').length}
                  </span>
                  <span className="monitoring-kpi-card__sub">Offline Status</span>
                </div>
                <div className="monitoring-kpi-card">
                  <span className="monitoring-kpi-card__label">Break</span>
                  <span className="monitoring-kpi-card__value" style={{ color: 'var(--accent)' }}>
                    {store.activities.filter(a => a.status === 'Break').length}
                  </span>
                  <span className="monitoring-kpi-card__sub">On Break</span>
                </div>
              </div>

              <div className="dashboard-grid">

              {/* Row 1: Workspace Screens (span-2) & Security Violations (span-1) */}
              <div className="dashboard-card span-2">
                <div className="card-header-with-action">
                  <h3 className="card-title">Captured Workspace Screens</h3>
                </div>
                <div className="screenshots-container">
                  <div className="screenshot-filters">
                    <input 
                      type="text" 
                      placeholder="Filter by Employee..." 
                      className="filter-input"
                      value={empFilter}
                      onChange={e => setEmpFilter(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Department..." 
                      className="filter-input"
                      value={deptFilter}
                      onChange={e => setDeptFilter(e.target.value)}
                    />
                    <input 
                      type="date" 
                      className="filter-input"
                      value={dateFilter}
                      onChange={e => setDateFilter(e.target.value)}
                    />
                  </div>
                  <div className="screenshot-grid">
                    {store.screenshots
                      .map(s => {
                        const details = getEmployeeDetails(s.employee);
                        return { ...s, employee: details.name, department: details.department };
                      })
                      .filter(s => s.employee.toLowerCase().includes(empFilter.toLowerCase()))
                      .filter(s => s.department.toLowerCase().includes(deptFilter.toLowerCase()))
                      .filter(s => !dateFilter || s.date === dateFilter)
                      .map(s => (
                        <div key={s.id} className="screenshot-item" onClick={() => setZoomScreenshot(s.employee)}>
                          <div className="screenshot-img-placeholder">
                            <Monitor size={24} style={{ opacity: 0.3 }} />
                            <span>Workspace Screen</span>
                          </div>
                          <div className="screenshot-meta">
                            <span>{s.employee}</span>
                            <span>{s.time}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Security & Compliance Violations</h3>
                <div className="violations-list" style={{ marginTop: '12px' }}>
                  {store.violations.map(v => (
                    <div key={v.id} className="violation-item">
                      <AlertTriangle className="violation-icon" size={16} />
                      <div className="violation-details">
                        <h5>{getEmployeeDetails(v.employee).name} - {v.type}</h5>
                        <p>{v.details} ({v.time})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className="card-title">Device Swap Requests</h3>
                  {store.requests.filter(r => r.status === 'Pending').length > 0 && (
                    <span className="status-badge idle" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {store.requests.filter(r => r.status === 'Pending').length} Pending
                    </span>
                  )}
                </div>
                <div className="violations-list">
                  {store.requests.slice(0, 3).map(r => (
                    <div 
                      key={r.id} 
                      className="violation-item" 
                      onClick={() => {
                        store.setActiveRequestId(r.id);
                        store.setShowRequestDrawer(true);
                      }}
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.03)', 
                        paddingBottom: '8px', 
                        marginBottom: '8px',
                        cursor: 'pointer' 
                      }}
                    >
                      <Laptop className="violation-icon" size={16} style={{ color: 'var(--accent)' }} />
                      <div className="violation-details">
                        <h5 style={{ margin: '0 0 2px 0', fontSize: '13px' }}>
                          {getEmployeeDetails(r.employeeId || r.employeeName || '').name}
                        </h5>
                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                          Swap to: {r.currentDevice}
                        </p>
                        <span className={`status-badge ${r.status === 'Approved' ? 'working' : r.status === 'Pending' ? 'idle' : 'break'}`} style={{ fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {store.requests.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', margin: '20px 0' }}>
                      No device swap requests submitted.
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Raw Engagement Levels (span-2) & Idle Time Overview (span-1) */}
              <div className="dashboard-card span-2">
                <h3 className="card-title">Raw Engagement levels</h3>
                <div className="card-table-container" style={{ marginTop: '12px' }}>
                  <table className="monitoring-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Engagement</th>
                        <th>Activity Breakdown</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.activities.map(a => {
                        const avg = Math.round((a.keyboardActivity + a.mouseActivity) / 2);
                        let level = 'Low';
                        let levelClass = 'low';
                        if (avg >= 70) {
                          level = 'High';
                          levelClass = 'high';
                        } else if (avg >= 35) {
                          level = 'Moderate';
                          levelClass = 'moderate';
                        }
                        
                        return (
                          <tr key={a.id}>
                            <td>{getEmployeeDetails(a.id).name}</td>
                            <td>
                              <span className={`engagement-badge ${levelClass}`}>{level}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className={`activity-badge ${a.keyboardActivity >= 70 ? 'high' : a.keyboardActivity >= 35 ? 'moderate' : 'low'}`}>
                                  KB: {a.keyboardActivity >= 70 ? 'Active' : a.keyboardActivity >= 35 ? 'Moderate' : 'Low'}
                                </span>
                                <span className={`activity-badge ${a.mouseActivity >= 70 ? 'high' : a.mouseActivity >= 35 ? 'moderate' : 'low'}`}>
                                  MS: {a.mouseActivity >= 70 ? 'Active' : a.mouseActivity >= 35 ? 'Moderate' : 'Low'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${a.status.toLowerCase()}`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Idle Time Overview</h3>
                <div className="card-table-container" style={{ marginTop: '12px' }}>
                  <table className="monitoring-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Idle Today</th>
                        <th>Longest Idle</th>
                        <th>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.idleRecords.map(i => (
                        <tr key={i.id}>
                          <td>{getEmployeeDetails(i.employee).name}</td>
                          <td>{i.idleToday}</td>
                          <td>{i.longestIdle}</td>
                          <td>{i.averageIdle}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 3: Application Logs (span-2) & Webcam Photos (span-1) */}
              <div className="dashboard-card span-2">
                <h3 className="card-title">Application Logs</h3>
                <div className="card-table-container" style={{ marginTop: '12px' }}>
                  <table className="monitoring-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Blocked App</th>
                        <th>Allowed App</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.appUsage.map(u => (
                        <tr key={u.id}>
                          <td>{getEmployeeDetails(u.employee).name}</td>
                          <td style={{ color: u.blockedApp !== 'None' ? '#f87171' : '#cbd5e1' }}>
                            {u.blockedApp}
                          </td>
                          <td>{u.allowedApp}</td>
                          <td>{u.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Presence Validation Photos</h3>
                <div className="card-table-container" style={{ marginTop: '12px' }}>
                  <table className="monitoring-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Time</th>
                        <th>Consent Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.webcamPhotos.map(w => (
                        <tr key={w.id}>
                          <td>{getEmployeeDetails(w.employee).name}</td>
                          <td>{w.time}</td>
                          <td>
                            <span className={`status-badge ${w.status === 'Captured' ? 'working' : w.status === 'Pending Consent' ? 'idle' : 'break'}`}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}

          {/* Policy Settings View */}
          {currentView === 'policy' && (
            <MonitoringPolicyPage onBack={() => setCurrentView('dashboard')} />
          )}

          {/* App Allow List View */}
          {currentView === 'apps' && (
            <div className="app-allowlist-view">
              <div className="card-header-with-action">
                <div>
                  <h2>Application Allowlist</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                    Configure which local executables are permitted or flagged as violations.
                  </p>
                </div>
                <div className="section-actions">
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowAddAppModal(true)}>
                    <Plus size={16} />
                    Add App
                  </button>
                  <button className="btn-secondary" onClick={() => setCurrentView('dashboard')}>Back to Dashboard</button>
                </div>
              </div>

              <div className="app-cards-container" style={{ marginTop: '20px' }}>
                <div className="app-cards-grid">
                  {store.appsList.map(a => {
                    const categoryClass = a.category.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <div key={a.id} className="app-grid-card era-panel">
                        <div className="app-card-header-row">
                          <div className={`app-icon-circle category-${categoryClass}`}>
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="app-card-title-area">
                            <h4 className="app-card-title-text">{a.name}</h4>
                            <code className="app-card-executable-text">{a.executableName}</code>
                          </div>
                          <div className="app-card-toggle-wrap">
                            <div className="toggle-switch">
                              <input 
                                type="checkbox" 
                                id={`app-toggle-${a.id}`}
                                checked={a.allowed}
                                onChange={() => store.toggleAppStatus(a.id)}
                              />
                              <label className="toggle-slider" htmlFor={`app-toggle-${a.id}`}></label>
                            </div>
                          </div>
                        </div>
                        <div className="app-card-body-meta">
                          <span className={`pill-badge category-${categoryClass}`}>
                            {a.category}
                          </span>
                          <span className="pill-badge target-assignment">
                            {a.applyTo}
                          </span>
                        </div>
                        <div className="app-card-footer">
                          <button className="btn-icon delete app-card-delete" title="Remove App" onClick={() => store.deleteApp(a.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* -------------------- EMPLOYEE VIEW (BLURRED / TRAY APP DOWNLOAD) -------------------- */}
      {!isManagerOrCeo && (
        <div className="employee-blurred-wrapper">
          <div className={`blur-overlay ${allPermissionsAccepted || dismissedDownloadPrompt ? 'unblurred' : ''}`} style={allPermissionsAccepted || dismissedDownloadPrompt ? { filter: 'none', opacity: 1, pointerEvents: 'all' } : {}}>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Workspace Activity Summary</h3>
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ color: '#cbd5e1' }}><strong>Assigned Policy:</strong> Default Corporate Compliance</p>
                  <p style={{ color: '#cbd5e1' }}><strong>Today's Working Hours:</strong> 7 hrs 42 mins</p>
                  <p style={{ color: '#cbd5e1' }}><strong>Active Status:</strong> Tracking Active</p>
                </div>
              </div>
              <div className="dashboard-card">
                <h3>Assigned App Allowlist</h3>
                <div style={{ marginTop: '12px' }}>
                  {store.appsList.map(app => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{app.name} ({app.executableName})</span>
                      <span style={{ color: app.allowed ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {app.allowed ? 'Allowed' : 'Blocked'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Blur Overlay Card asking for download */}
          {!allPermissionsAccepted && !dismissedDownloadPrompt && (
            <div className="overlay-cta-card" style={{ position: 'absolute' }}>
              <button 
                onClick={() => setDismissedDownloadPrompt(true)}
                className="close-overlay-btn"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--nexus-text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'var(--text-h, #ffffff)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--nexus-text-secondary, #94a3b8)';
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <h2>Desktop Application Required</h2>
              <p>
                To comply with the company's monitoring and attendance guidelines, you must download and run the desktop monitoring application. After setting up permissions, the web dashboard will automatically activate.
              </p>
              
              <div className="cta-button-group">
                <button 
                  className="btn-primary" 
                  onClick={startDownloadFlow}
                  disabled={isDownloading || isDownloaded}
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" style={{ marginRight: '6px' }} />
                      Downloading Tray App...
                    </>
                  ) : isDownloaded ? (
                    'Application Downloaded'
                  ) : (
                    <>
                      <Download size={14} style={{ marginRight: '6px' }} />
                      Download Desktop App
                    </>
                  )}
                </button>
                <button className="btn-secondary" onClick={() => setShowRequestModal(true)}>
                  Request Device Swap
                </button>
              </div>

              {isDownloaded && !allPermissionsAccepted && (
                <div style={{ color: '#fb7185', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} />
                  Please complete the permission checks in the floating tray application in the bottom right corner.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Simulated Desktop Tray App */}
      {isDownloaded && !allPermissionsAccepted && (
        <div className="simulated-tray-app">
          <div className="tray-header">
            <span>OneVo Compliance Tray Application</span>
            <X size={14} style={{ cursor: 'pointer' }} onClick={() => setIsDownloaded(false)} />
          </div>
          <div className="tray-body">
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#94a3b8' }}>
              Select "Accept" on the required system capabilities to complete initial desktop installation.
            </p>

            {/* Location Permission */}
            <div className="permission-request-item">
              <span>Location Tracker Access</span>
              <div className="permission-actions">
                {permissions.location === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('location', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('location', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.location ? 'accepted' : 'denied'}`}>
                    {permissions.location ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

            {/* Microphone Permission */}
            <div className="permission-request-item">
              <span>Microphone Hardware Access</span>
              <div className="permission-actions">
                {permissions.mic === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('mic', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('mic', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.mic ? 'accepted' : 'denied'}`}>
                    {permissions.mic ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

            {/* Webcam Permission */}
            <div className="permission-request-item">
              <span>Webcam / Camera Access</span>
              <div className="permission-actions">
                {permissions.camera === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('camera', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('camera', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.camera ? 'accepted' : 'denied'}`}>
                    {permissions.camera ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

            {/* Bluetooth Permission */}
            <div className="permission-request-item">
              <span>Bluetooth Device Discovery</span>
              <div className="permission-actions">
                {permissions.bluetooth === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('bluetooth', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('bluetooth', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.bluetooth ? 'accepted' : 'denied'}`}>
                    {permissions.bluetooth ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

            {/* Keyboard Logger Permission */}
            <div className="permission-request-item">
              <span>Keyboard Activity Logging</span>
              <div className="permission-actions">
                {permissions.keyboard === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('keyboard', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('keyboard', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.keyboard ? 'accepted' : 'denied'}`}>
                    {permissions.keyboard ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

            {/* Mouse Pointer Permission */}
            <div className="permission-request-item">
              <span>Mouse Pointer Tracking</span>
              <div className="permission-actions">
                {permissions.mouse === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('mouse', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('mouse', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.mouse ? 'accepted' : 'denied'}`}>
                    {permissions.mouse ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

            {/* Screenshot Permission */}
            <div className="permission-request-item">
              <span>Screen Capture Permission</span>
              <div className="permission-actions">
                {permissions.screenshot === null ? (
                  <>
                    <button className="btn-perm accept" onClick={() => setPermissionVal('screenshot', true)}>Accept</button>
                    <button className="btn-perm deny" onClick={() => setPermissionVal('screenshot', false)}>Deny</button>
                  </>
                ) : (
                  <span className={`btn-perm ${permissions.screenshot ? 'accepted' : 'denied'}`}>
                    {permissions.screenshot ? 'Accepted' : 'Denied'}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- MODALS AND OVERLAYS -------------------- */}

      {/* 1. Activity Tracking Edit Modal */}
      {editingPolicy === 'activity' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveActivity} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Edit Activity Tracking Policy</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            
            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Policy Name</label>
                <input 
                  type="text" 
                  value={activityForm.name}
                  onChange={e => setActivityForm({...activityForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Description</label>
                <textarea 
                  rows={2}
                  value={activityForm.description}
                  onChange={e => setActivityForm({...activityForm, description: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Tracking Interval (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={activityForm.trackingInterval}
                  onChange={e => setActivityForm({...activityForm, trackingInterval: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Minimum Activity Level (%)</label>
                <input 
                  type="number" 
                  min={1} 
                  max={100} 
                  value={activityForm.minActivity}
                  onChange={e => setActivityForm({...activityForm, minActivity: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Track Keyboard Activity</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="track-kb" 
                    checked={activityForm.trackKeyboard} 
                    onChange={e => setActivityForm({...activityForm, trackKeyboard: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="track-kb"></label>
                </div>
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Track Mouse Activity</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="track-ms" 
                    checked={activityForm.trackMouse} 
                    onChange={e => setActivityForm({...activityForm, trackMouse: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="track-ms"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Apply To</label>
                <div className="leave-cfg-segmented">
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${activityForm.applyTo === 'All Employees' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setActivityForm({...activityForm, applyTo: 'All Employees'})}
                  >
                    All Employees
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${activityForm.applyTo === 'Engineering' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setActivityForm({...activityForm, applyTo: 'Engineering'})}
                  >
                    Engineering
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${activityForm.applyTo === 'Design Team' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setActivityForm({...activityForm, applyTo: 'Design Team'})}
                  >
                    Design
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${activityForm.applyTo === 'Sales' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setActivityForm({...activityForm, applyTo: 'Sales'})}
                  >
                    Sales
                  </button>
                </div>
              </div>

              <div className="org-form-field">
                <label>Effective Date</label>
                <input 
                  type="date" 
                  value={activityForm.effectiveDate}
                  onChange={e => setActivityForm({...activityForm, effectiveDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Save Changes</button>
            </footer>
          </form>
        </div>
      )}

      {/* 2. Idle Time Edit Modal */}
      {editingPolicy === 'idle' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveIdle} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Edit Idle Time Policy</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Policy Name</label>
                <input 
                  type="text" 
                  value={idleForm.name}
                  onChange={e => setIdleForm({...idleForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Normal Idle Duration (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={idleForm.idleThreshold}
                  onChange={e => setIdleForm({...idleForm, idleThreshold: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Critical Idle Duration (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={idleForm.criticalThreshold}
                  onChange={e => setIdleForm({...idleForm, criticalThreshold: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Send Reminder Notification on Inactivity</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="idle-rem" 
                    checked={idleForm.reminderNotification} 
                    onChange={e => setIdleForm({...idleForm, reminderNotification: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="idle-rem"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Apply To</label>
                <div className="leave-cfg-segmented">
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${idleForm.applyTo === 'All Employees' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setIdleForm({...idleForm, applyTo: 'All Employees'})}
                  >
                    All Employees
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${idleForm.applyTo === 'Engineering' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setIdleForm({...idleForm, applyTo: 'Engineering'})}
                  >
                    Engineering
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${idleForm.applyTo === 'Design Team' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setIdleForm({...idleForm, applyTo: 'Design Team'})}
                  >
                    Design
                  </button>
                </div>
              </div>
            </div>

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Save Changes</button>
            </footer>
          </form>
        </div>
      )}

      {/* 3. Screenshot Policy Edit Modal */}
      {editingPolicy === 'screenshot' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveScreenshot} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Edit Screenshot Policy</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Enable Screenshot Logging</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="ss-enable" 
                    checked={screenshotForm.enabled} 
                    onChange={e => setScreenshotForm({...screenshotForm, enabled: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="ss-enable"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Screenshot Quality</label>
                <select 
                  value={screenshotForm.quality}
                  onChange={e => setScreenshotForm({...screenshotForm, quality: e.target.value as any})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Send Alert Notification to Employee</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="ss-notif" 
                    checked={screenshotForm.notification} 
                    onChange={e => setScreenshotForm({...screenshotForm, notification: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="ss-notif"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Storage Retention Window</label>
                <input 
                  type="text" 
                  value={screenshotForm.retention}
                  onChange={e => setScreenshotForm({...screenshotForm, retention: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Capture Multiple Extended Displays</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="ss-mult" 
                    checked={screenshotForm.captureMultiple} 
                    onChange={e => setScreenshotForm({...screenshotForm, captureMultiple: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="ss-mult"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Apply To</label>
                <div className="leave-cfg-segmented">
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${screenshotForm.applyTo === 'All Employees' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setScreenshotForm({...screenshotForm, applyTo: 'All Employees'})}
                  >
                    All Employees
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${screenshotForm.applyTo === 'Engineering' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setScreenshotForm({...screenshotForm, applyTo: 'Engineering'})}
                  >
                    Engineering
                  </button>
                </div>
              </div>

              <div className="org-form-field" style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 6px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} /> Employee Privacy Warning
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
                  If employee alerts are disabled, the company accepts full liability for local privacy complaints. Please verify compliance guidelines with local legal advisors.
                </p>
              </div>
            </div>

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Save Changes</button>
            </footer>
          </form>
        </div>
      )}

      {/* 4. Webcam Policy Edit Modal */}
      {editingPolicy === 'webcam' && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setEditingPolicy(null)}>
          <form className="schedules-cfg-modal" onSubmit={handleSaveWebcam} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Edit Webcam Verification Policy</h2>
              <button type="button" className="org-slideover__close" onClick={() => setEditingPolicy(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Enable Webcam Verification</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="web-enable" 
                    checked={webcamForm.enabled} 
                    onChange={e => setWebcamForm({...webcamForm, enabled: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="web-enable"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Idle Threshold Trigger (Minutes)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={webcamForm.idleThreshold}
                  onChange={e => setWebcamForm({...webcamForm, idleThreshold: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Notification/Consent Duration (Seconds)</label>
                <input 
                  type="number" 
                  min={1} 
                  value={webcamForm.notificationDuration}
                  onChange={e => setWebcamForm({...webcamForm, notificationDuration: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Webcam Photo Retention Window</label>
                <input 
                  type="text" 
                  value={webcamForm.retention}
                  onChange={e => setWebcamForm({...webcamForm, retention: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Apply To</label>
                <div className="leave-cfg-segmented">
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${webcamForm.applyTo === 'All Employees' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setWebcamForm({...webcamForm, applyTo: 'All Employees'})}
                  >
                    All Employees
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${webcamForm.applyTo === 'Engineering' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setWebcamForm({...webcamForm, applyTo: 'Engineering'})}
                  >
                    Engineering
                  </button>
                </div>
              </div>
            </div>

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setEditingPolicy(null)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Save Changes</button>
            </footer>
          </form>
        </div>
      )}



      {/* 5. Add App Allowlist Modal */}
      {showAddAppModal && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setShowAddAppModal(false)}>
          <form className="schedules-cfg-modal" onSubmit={handleAddAppSubmit} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Add New Application</h2>
              <button type="button" className="org-slideover__close" onClick={() => setShowAddAppModal(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="schedules-cfg-modal__body">
              <div className="org-form-field">
                <label>Application Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Google Chrome"
                  value={newApp.name}
                  onChange={e => setNewApp({...newApp, name: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Executable Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. chrome.exe"
                  value={newApp.executableName}
                  onChange={e => setNewApp({...newApp, executableName: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Category</label>
                <select 
                  value={newApp.category}
                  onChange={e => setNewApp({...newApp, category: e.target.value})}
                >
                  <option value="Browser">Browser</option>
                  <option value="Communication">Communication</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div className="org-form-field" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Allow Application Access</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="add-app-allowed" 
                    checked={newApp.allowed} 
                    onChange={e => setNewApp({...newApp, allowed: e.target.checked})}
                  />
                  <label className="toggle-slider" htmlFor="add-app-allowed"></label>
                </div>
              </div>

              <div className="org-form-field">
                <label>Description</label>
                <input 
                  type="text" 
                  placeholder="Brief purpose"
                  value={newApp.description}
                  onChange={e => setNewApp({...newApp, description: e.target.value})}
                />
              </div>

              <div className="org-form-field">
                <label>Apply To</label>
                <div className="leave-cfg-segmented">
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${newApp.applyTo === 'All Employees' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setNewApp({...newApp, applyTo: 'All Employees'})}
                  >
                    All Employees
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${newApp.applyTo === 'Engineering' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setNewApp({...newApp, applyTo: 'Engineering'})}
                  >
                    Engineering
                  </button>
                  <button
                    type="button"
                    className={`leave-cfg-segmented__btn${newApp.applyTo === 'Design Team' ? ' leave-cfg-segmented__btn--active' : ''}`}
                    onClick={() => setNewApp({...newApp, applyTo: 'Design Team'})}
                  >
                    Design
                  </button>
                </div>
              </div>
            </div>

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setShowAddAppModal(false)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Add Application</button>
            </footer>
          </form>
        </div>
      )}

      {/* 6. Device Request Modal */}
      {showRequestModal && (
        <div className="schedules-cfg-modal-overlay" onClick={() => setShowRequestModal(false)}>
          <form className="schedules-cfg-modal" onSubmit={handleRequestSubmit} onClick={e => e.stopPropagation()}>
            <header className="schedules-cfg-modal__header">
              <h2>Request Device Association Switch</h2>
              <button type="button" className="org-slideover__close" onClick={() => setShowRequestModal(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            
            <div className="schedules-cfg-modal__body">
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '0', marginBottom: '16px', lineHeight: 1.4 }}>
                Submit a request to dissociate the compliance application from your old laptop/device and link it to your current active device.
              </p>

              <div className="org-form-field">
                <label>Old Device Host Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. DESKTOP-OLD98F"
                  value={requestForm.oldDevice}
                  onChange={e => setRequestForm({...requestForm, oldDevice: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Current Device Host Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. MACBOOK-M3PRO"
                  value={requestForm.currentDevice}
                  onChange={e => setRequestForm({...requestForm, currentDevice: e.target.value})}
                  required
                />
              </div>

              <div className="org-form-field">
                <label>Reason for Swap</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Hardware replacement, laptop upgrade"
                  value={requestForm.reason}
                  onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
                  required
                />
              </div>
            </div>

            <footer className="schedules-cfg-modal__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button type="submit" className="org-btn org-btn--primary">Submit Request</button>
            </footer>
          </form>
        </div>
      )}

      {/* Zoom Screenshot Modal */}
      {zoomScreenshot && (
        <div className="modal-overlay" onClick={() => setZoomScreenshot(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', padding: '12px', background: 'var(--surface-panel)' }}>
            <div className="modal-header" style={{ border: 'none', marginBottom: '8px' }}>
              <h2>{zoomScreenshot}'s Workspace Display</h2>
              <button className="modal-close" onClick={() => setZoomScreenshot(null)}>×</button>
            </div>
            <div style={{ aspectRatio: '16/9', width: '100%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <Monitor size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <span>Full Screen Mock Capture (High Resolution)</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Device Requests Slideover Drawer */}
      {store.showRequestDrawer && (
        <div className="org-slideover-backdrop" onClick={() => store.setShowRequestDrawer(false)}>
          <div className="org-slideover org-slideover--narrow" onClick={e => e.stopPropagation()} style={{ width: '450px', maxWidth: '100vw' }}>
            <header className="org-slideover__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={18} style={{ color: 'var(--accent)' }} />
                <h2>Device Swap Requests</h2>
              </div>
              <button type="button" className="org-slideover__close" onClick={() => store.setShowRequestDrawer(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            {/* Slideover Body */}
            <div className="org-slideover__body" style={{ padding: '16px', gap: '16px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              {/* Search Bar */}
              <div className="org-form-field" style={{ margin: 0 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search by employee, device..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px', width: '100%', height: '36px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Segmented Control Tabs */}
              <div className="leave-cfg-segmented" style={{ width: '100%', marginBottom: '4px' }}>
                <button
                  type="button"
                  className={`leave-cfg-segmented__btn${activeDrawerTab === 'pending' ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => setActiveDrawerTab('pending')}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <Clock size={12} />
                  Pending ({store.requests.filter(r => r.status === 'Pending').length})
                </button>
                <button
                  type="button"
                  className={`leave-cfg-segmented__btn${activeDrawerTab === 'history' ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => setActiveDrawerTab('history')}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <History size={12} />
                  History ({store.requests.filter(r => r.status !== 'Pending').length})
                </button>
              </div>

              {/* Requests List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                {filteredRequests.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', margin: '16px 0' }}>
                    No {activeDrawerTab} requests found.
                  </p>
                ) : (
                  filteredRequests.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => store.setActiveRequestId(r.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: store.activeRequestId === r.id ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                        border: store.activeRequestId === r.id ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>
                          {getEmployeeDetails(r.employeeId || r.employeeName || '').name}
                        </span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{r.date}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Swap: {r.oldDevice} → {r.currentDevice}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Active Request Details Form */}
              {selectedRequest ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                    Request Details
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Requester</span>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>
                        {getEmployeeDetails(selectedRequest.employeeId || selectedRequest.employeeName || '').name}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Date</span>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{selectedRequest.date}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Old Device Host Name</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'monospace' }}>{selectedRequest.oldDevice}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Current Device Host Name</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'monospace' }}>{selectedRequest.currentDevice}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Reason for Swap</span>
                    <p style={{ fontSize: '11px', margin: '4px 0 0 0', lineHeight: 1.4, color: '#cbd5e1' }}>{selectedRequest.reason}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Status</span>
                    <span className={`status-badge ${selectedRequest.status === 'Approved' ? 'working' : selectedRequest.status === 'Pending' ? 'idle' : 'break'}`} style={{ fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>
                      {selectedRequest.status}
                    </span>
                  </div>

                  {/* Approve / Reject buttons */}
                  {selectedRequest.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', marginTop: 'auto' }}>
                      <button 
                        type="button" 
                        className="org-btn org-btn--danger" 
                        onClick={() => {
                          store.rejectDeviceRequest(selectedRequest.id);
                          triggerToast('Device swap request rejected.');
                        }}
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                      >
                        Reject
                      </button>
                      <button 
                        type="button" 
                        className="org-btn org-btn--primary" 
                        onClick={() => {
                          store.approveDeviceRequest(selectedRequest.id);
                          triggerToast('Device swap request approved successfully.');
                        }}
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', fontSize: '12px', padding: '24px' }}>
                  <Laptop size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
                  Select a request from the list to view details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
