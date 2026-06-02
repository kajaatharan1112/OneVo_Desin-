import React, { useState } from 'react';
import { AlertTriangle, User, Briefcase, Folder, Check } from 'lucide-react';
import { tenantTodayAlerts } from '../../../data/tenant-today-productivity.data';

export const TenantTodayAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState(tenantTodayAlerts);

  const handleResolve = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <article className="tto-widget tto-alerts tto-cell--alerts">
      <header className="tto-widget__head">
        <AlertTriangle size={16} aria-hidden="true" />
        <h3 className="tto-widget__title">Tenant today alerts</h3>
        <span className="tto-widget__tab">{alerts.length} notes</span>
      </header>
      <ul className="tto-alerts__list">
        {alerts.map((alert) => (
          <li key={alert.id} className={`tto-alerts__item tto-alerts__item--${alert.severity}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span
              className={`tto-status-icon${
                alert.severity === 'critical' ? ' tto-status-icon--critical' : ' tto-status-icon--warning'
              }`}
              aria-hidden="true"
            >
              <AlertTriangle size={14} />
            </span>
            <div className="tto-alerts__content" style={{ flex: 1 }}>
              <span className="tto-alerts__text">{alert.message}</span>
              {(alert.employeeName || alert.employeeDepartment || alert.employeeProject) && (
                <div className="tto-alerts__meta">
                  {alert.employeeName && (
                    <span className="tto-alerts__meta-item">
                      <User size={10} className="tto-alerts__meta-icon" aria-hidden="true" />
                      <span>{alert.employeeName}</span>
                    </span>
                  )}
                  {alert.employeeDepartment && (
                    <span className="tto-alerts__meta-item">
                      <Briefcase size={10} className="tto-alerts__meta-icon" aria-hidden="true" />
                      <span>{alert.employeeDepartment}</span>
                    </span>
                  )}
                  {alert.employeeProject && (
                    <span className="tto-alerts__meta-item">
                      <Folder size={10} className="tto-alerts__meta-icon" aria-hidden="true" />
                      <span>{alert.employeeProject}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => handleResolve(alert.id)}
              aria-label="Resolve alert"
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <Check size={14} />
              Resolve
            </button>
          </li>
        ))}
        {alerts.length === 0 && (
          <li style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            No alerts for today!
          </li>
        )}
      </ul>
    </article>
  );
};
