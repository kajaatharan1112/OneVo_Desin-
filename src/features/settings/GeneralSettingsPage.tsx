import React, { useState } from 'react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import {
  DEFAULT_GENERAL,
  MONTH_OPTIONS,
  WEEKDAY_OPTIONS,
  type GeneralSettings,
} from './settingsMockData';

export const GeneralSettingsPage: React.FC = () => {
  const [form, setForm] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [saved, setSaved] = useState(false);
  const [fiscalWarning, setFiscalWarning] = useState(false);
  const [workWeekWarning, setWorkWeekWarning] = useState(false);

  const patch = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    if (key === 'fiscalYearStartMonth') setFiscalWarning(true);
    if (key === 'workWeekDays') setWorkWeekWarning(true);
  };

  const toggleWeekday = (day: string) => {
    const next = form.workWeekDays.includes(day)
      ? form.workWeekDays.filter(d => d !== day)
      : [...form.workWeekDays, day];
    patch('workWeekDays', next);
  };

  const handleSave = () => {
    setSaved(true);
    setFiscalWarning(false);
    setWorkWeekWarning(false);
  };

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="General"
        description="Manage company defaults used across dates, schedules, payroll, and reporting."
        actions={
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Changes
          </button>
        }
      />

      <div className="settings-body">
        {(fiscalWarning || workWeekWarning) && (
          <p className="admin-hint admin-hint--warning">
            Changing fiscal year or work week defaults may affect leave balances, payroll periods, and reporting cutoffs.
            Review dependent configurations after saving.
          </p>
        )}
        {saved && (
          <p className="admin-hint admin-hint--info">Company defaults saved successfully.</p>
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
                <label>Tenant URL / slug</label>
                <div className="settings-readonly">onevo.io/{form.tenantSlug}</div>
              </div>
              <div className="org-form-field">
                <label htmlFor="contact-email">Primary Contact Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.primaryContactEmail}
                  onChange={e => patch('primaryContactEmail', e.target.value)}
                />
              </div>
              <div className="org-form-field">
                <label htmlFor="country">Country / Region</label>
                <select
                  id="country"
                  value={form.country}
                  onChange={e => patch('country', e.target.value)}
                >
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>India</option>
                  <option>Singapore</option>
                  <option>Australia</option>
                </select>
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
                <label htmlFor="timezone">Default Timezone</label>
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
                <label htmlFor="time-format">Time Format</label>
                <select
                  id="time-format"
                  value={form.timeFormat}
                  onChange={e => patch('timeFormat', e.target.value)}
                >
                  <option>24-hour</option>
                  <option>12-hour</option>
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
              <div className="org-form-field">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={form.currency}
                  onChange={e => patch('currency', e.target.value)}
                >
                  <option>GBP</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>INR</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Business Calendar Defaults</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-form-grid">
              <div className="org-form-field">
                <label htmlFor="fiscal-month">Fiscal Year Start Month</label>
                <select
                  id="fiscal-month"
                  value={form.fiscalYearStartMonth}
                  onChange={e => patch('fiscalYearStartMonth', Number(e.target.value))}
                >
                  {MONTH_OPTIONS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="org-form-field">
                <label>Work Week Days</label>
                <div className="settings-weekdays">
                  {WEEKDAY_OPTIONS.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`settings-weekday${form.workWeekDays.includes(day) ? ' settings-weekday--active' : ''}`}
                      onClick={() => toggleWeekday(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
