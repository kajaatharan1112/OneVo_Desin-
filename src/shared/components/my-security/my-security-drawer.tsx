import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PASSWORD_LOGIN_ENABLED } from '../../../features/settings/settingsMockData';

interface MySecurityDrawerProps {
  onClose: () => void;
}

export const MySecurityDrawer: React.FC<MySecurityDrawerProps> = ({ onClose }) => {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessions, setSessions] = useState([
    { id: 'current', device: 'Chrome on Windows', meta: 'Current session · Last active just now', current: true },
    { id: 'other', device: 'Safari on iPhone', meta: 'Started 2d ago · Last active 1d ago', current: false },
  ]);

  const revokeOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow"
        role="dialog"
        aria-modal="true"
        aria-label="My security"
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>My Security</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="org-slideover__body">
          <div className="admin-section">
            <h3>Multi-Factor Authentication</h3>
            <div className="settings-toggle-row">
              <div>
                <div className="settings-toggle-row__label">Authenticator app (TOTP)</div>
                <div className="settings-toggle-row__desc">Protect your account with a one-time code from your authenticator app</div>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={e => setMfaEnabled(e.target.checked)}
                aria-label="Enable MFA"
              />
            </div>
          </div>

          {PASSWORD_LOGIN_ENABLED && (
            <div className="admin-section">
              <h3>Password</h3>
              <p className="admin-hint">Change your account password.</p>
              <button type="button" className="org-btn org-btn--secondary">Change Password</button>
            </div>
          )}

          <div className="admin-section">
            <h3>Active Sessions</h3>
            {sessions.map(s => (
              <div key={s.id} className="admin-access-item">
                <div>{s.device}</div>
                <div className="cfg-table__meta">{s.meta}</div>
              </div>
            ))}
            {sessions.some(s => !s.current) && (
              <button type="button" className="cfg-action-btn" style={{ marginTop: 8 }} onClick={revokeOtherSessions}>
                Revoke other sessions
              </button>
            )}
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
