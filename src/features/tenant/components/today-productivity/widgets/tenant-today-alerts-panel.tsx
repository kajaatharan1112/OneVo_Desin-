import React, { useState } from 'react';
import { AlertTriangle, User, Briefcase, Check } from 'lucide-react';
import { executiveDashboard } from '../../../data/executive-dashboard.data';
import { tenantTodayAlerts } from '../../../data/tenant-today-productivity.data';

export const TenantTodayAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState(tenantTodayAlerts);
  const { title, alertsCount } = executiveDashboard.companyAlerts;

  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <article className="tto-widget tto-alerts tto-cell--alerts">
      <header className="tto-widget__head">
        <AlertTriangle size={16} aria-hidden="true" />
        <h3 className="tto-widget__title">{title}</h3>
        <span className="tto-widget__tab">{alertsCount} notes</span>
      </header>
      <ul className="tto-alerts__list">
        {alerts.map((alert) => (
          <li key={alert.id} className={`tto-alerts__item tto-alerts__item--${alert.severity}`}>
            <span
              className={`tto-status-icon${
                alert.severity === 'critical' ? ' tto-status-icon--critical' : ' tto-status-icon--warning'
              }`}
              aria-hidden="true"
            >
              <AlertTriangle size={14} />
            </span>
            <div className="tto-alerts__content">
              <span className="tto-alerts__text">{alert.message}</span>
              {(alert.employeeName || alert.employeeDepartment) && (
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
                </div>
              )}
            </div>
            <button
              type="button"
              className="tto-alerts__resolve"
              onClick={() => handleResolve(alert.id)}
              aria-label={`Resolve alert for ${alert.employeeName ?? 'employee'}`}
            >
              <Check size={14} aria-hidden="true" />
              Resolve
            </button>
          </li>
        ))}
        {alerts.length === 0 && (
          <li className="tto-alerts__empty">No alerts for today.</li>
        )}
      </ul>
    </article>
  );
};