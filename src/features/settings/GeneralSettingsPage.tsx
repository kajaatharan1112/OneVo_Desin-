import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import {
  DEFAULT_BRANDING,
  DEFAULT_GENERAL,
  WEEKDAY_OPTIONS,
  type GeneralSettings,
} from './settingsMockData';

export const GeneralSettingsPage: React.FC = () => {
  const [form, setForm] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [saved, setSaved] = useState(false);

  const patch = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="General"
        description="Basic company details used across OneVo."
        icon={<Settings size={15} />}
        actions={
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Changes
          </button>
        }
      />

      <div className="settings-body">
        {saved && (
          <p className="admin-hint admin-hint--info">Company settings saved successfully.</p>
        )}

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Company</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="company-name">Company Name</label>
                <input
                  id="company-name"
                  value={form.companyName}
                  onChange={e => patch('companyName', e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="company-display-name">Company Display Name</label>
                <input
                  id="company-display-name"
                  value={form.displayName}
                  onChange={e => patch('displayName', e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label>Company Logo</label>
                <div className="settings-logo-upload">
                  <div className="settings-logo-preview" aria-hidden>
                    {DEFAULT_BRANDING.hasCustomLogo ? 'ACME' : 'OneVo'}
                  </div>
                  <p className="admin-hint" style={{ margin: 0 }}>Managed in Branding settings.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Localization</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-form-grid settings-form-grid--3">
              <div className="org-form-field">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={form.timezone}
                  onChange={e => patch('timezone', e.target.value)}
                >
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="date-format">Date Format</label>
                <select
                  id="date-format"
                  value={form.dateFormat}
                  onChange={e => patch('dateFormat', e.target.value)}
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="week-start">Week Start Day</label>
                <select
                  id="week-start"
                  value={form.weekStartDay}
                  onChange={e => patch('weekStartDay', e.target.value)}
                >
                  {WEEKDAY_OPTIONS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label htmlFor="language">Default Language</label>
                <select
                  id="language"
                  value={form.language}
                  onChange={e => patch('language', e.target.value)}
                >
                  <option>English (UK)</option>
                  <option>English (US)</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
