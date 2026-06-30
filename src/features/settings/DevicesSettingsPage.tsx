import React, { useMemo, useState } from 'react';
import { Eye, Ban, Activity, X, Monitor } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import { BiometricDevicesPage } from '../biometric-devices/BiometricDevicesPage';
import {
  MOCK_DEVICES,
  formatDateTime,
  formatRelativeTime,
  type TenantDevice,
} from './settingsMockData';

const STATUS_LABELS: Record<TenantDevice['status'], string> = {
  online: 'Online',
  offline: 'Offline',
  outdated: 'Outdated Agent',
  revoked: 'Revoked',
};

function statusBadgeClass(status: TenantDevice['status']): string {
  if (status === 'online') return 'active';
  if (status === 'offline') return 'inactive';
  if (status === 'outdated') return 'open';
  return 'failed';
}

const EmployeeDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [detail, setDetail] = useState<TenantDevice | null>(null);

  const summary = useMemo(() => ({
    active: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    outdated: devices.filter(d => d.status === 'outdated').length,
    revoked: devices.filter(d => d.status === 'revoked').length,
  }), [devices]);

  const revokeDevice = (id: string) => {
    setDevices(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, status: 'revoked' as const, lastHeartbeat: null }
          : d
      )
    );
    if (detail?.id === id) {
      setDetail(prev => (prev ? { ...prev, status: 'revoked', lastHeartbeat: null } : null));
    }
  };

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="Devices"
        description="Manage registered employee devices, agent status, and monitoring connectivity."
        icon={<Monitor size={15} />}
      />

      <div className="admin-summary-row">
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Active Devices</span>
          <strong>{summary.active}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Offline Devices</span>
          <strong>{summary.offline}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Outdated Agents</span>
          <strong>{summary.outdated}</strong>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-card__label">Revoked Devices</span>
          <strong>{summary.revoked}</strong>
        </div>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Employee</th>
                <th>OS</th>
                <th>Agent Version</th>
                <th>Last Heartbeat</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.id}>
                  <td className="cfg-table__name">{d.name}</td>
                  <td>{d.employeeName}</td>
                  <td>{d.os}</td>
                  <td>
                    {d.agentVersion}
                    {d.agentVersion !== d.latestAgentVersion && (
                      <span className="cfg-table__meta"> (latest {d.latestAgentVersion})</span>
                    )}
                  </td>
                  <td>{formatRelativeTime(d.lastHeartbeat)}</td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${statusBadgeClass(d.status)}`}>
                      {STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      <button type="button" className="cfg-action-btn" onClick={() => setDetail(d)}>
                        <Eye size={13} /> View Device
                      </button>
                      {d.status !== 'revoked' && (
                        <button type="button" className="cfg-action-btn" onClick={() => revokeDevice(d.id)}>
                          <Ban size={13} /> Revoke Device
                        </button>
                      )}
                      <button type="button" className="cfg-action-btn" onClick={() => setDetail(d)}>
                        <Activity size={13} /> View Health
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-hint" style={{ marginTop: 12 }}>
          Device enrollment is login-based. Internal device credentials are managed automatically and are never shown to employees or administrators.
        </p>
      </div>

      {detail && (
        <div className="org-slideover-backdrop" onClick={() => setDetail(null)}>
          <div
            className="org-slideover org-slideover--narrow"
            role="dialog"
            aria-modal="true"
            aria-label="Device detail"
            onClick={e => e.stopPropagation()}
          >
            <header className="org-slideover__header">
              <h2>{detail.name}</h2>
              <button type="button" className="org-slideover__close" onClick={() => setDetail(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="org-slideover__body">
              <div className="admin-detail-grid">
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Employee</span>
                  <span className="admin-detail-row__value">{detail.employeeName}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">OS version</span>
                  <span className="admin-detail-row__value">{detail.os} {detail.osVersion}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Agent version</span>
                  <span className="admin-detail-row__value">{detail.agentVersion}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">First registered</span>
                  <span className="admin-detail-row__value">{formatDateTime(detail.firstRegistered)}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Last heartbeat</span>
                  <span className="admin-detail-row__value">
                    {detail.lastHeartbeat ? formatDateTime(detail.lastHeartbeat) : '—'}
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-row__label">Current status</span>
                  <span className={`cfg-badge cfg-badge--${statusBadgeClass(detail.status)}`}>
                    {STATUS_LABELS[detail.status]}
                  </span>
                </div>
              </div>
              <div className="admin-section">
                <h3>Recent health events</h3>
                {detail.healthEvents.map((ev, i) => (
                  <div key={i} className="admin-access-item">
                    <div className="admin-access-item__time">{formatDateTime(ev.timestamp)}</div>
                    <div>{ev.message}</div>
                  </div>
                ))}
              </div>
            </div>
            <footer className="org-slideover__footer">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setDetail(null)}>
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

interface DevicesSettingsPageProps {
  biometricEnabled?: boolean;
}

export const DevicesSettingsPage: React.FC<DevicesSettingsPageProps> = ({ biometricEnabled = true }) => {
  const [deviceType, setDeviceType] = useState<'biometric' | 'employee'>(biometricEnabled ? 'biometric' : 'employee');

  if (!biometricEnabled) return <EmployeeDevicesPage />;

  return (
    <div className="devices-workspace">
      <nav className="devices-workspace__nav" aria-label="Device categories">
        <button
          type="button"
          className={deviceType === 'biometric' ? 'is-active' : ''}
          onClick={() => setDeviceType('biometric')}
        >
          Biometric Devices
        </button>
        <button
          type="button"
          className={deviceType === 'employee' ? 'is-active' : ''}
          onClick={() => setDeviceType('employee')}
        >
          Employee Devices
        </button>
      </nav>
      {deviceType === 'biometric' ? <BiometricDevicesPage /> : <EmployeeDevicesPage />}
    </div>
  );
};
