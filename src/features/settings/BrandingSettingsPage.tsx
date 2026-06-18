import React, { useState } from 'react';
import { Palette, Upload } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import { DEFAULT_BRANDING, type BrandingSettings } from './settingsMockData';

export const BrandingSettingsPage: React.FC = () => {
  const [form, setForm] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [saved, setSaved] = useState(false);

  const patch = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const resetDefaults = () => {
    setForm(DEFAULT_BRANDING);
    setSaved(false);
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="cfg-page">
      <SettingsPageHeader
        title="Branding"
        description="Control the tenant logo, favicon, and brand colors used across OneVo."
        icon={<Palette size={15} />}
        actions={
          <>
            <button type="button" className="org-btn org-btn--secondary" onClick={resetDefaults}>
              Reset to Defaults
            </button>
            <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
              Save Branding
            </button>
          </>
        }
      />

      <div className="settings-body">
        {saved && <p className="admin-hint admin-hint--info">Branding settings saved. Logo applies across all workspaces.</p>}
        <p className="admin-hint">
          Brand identity is tenant-wide. Switching between Employee and Management workspace changes navigation only — not your logo or colors.
        </p>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Logo</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-logo-upload">
              <div>
                <div className="org-form-field">
                  <label>Header Logo</label>
                  <button type="button" className="org-btn org-btn--secondary">
                    <Upload size={14} /> Upload logo
                  </button>
                </div>
                <div className="settings-logo-preview" aria-hidden>
                  {form.hasCustomLogo ? 'ACME' : 'OneVo'}
                </div>
              </div>
              <div>
                <div className="org-form-field">
                  <label>Favicon</label>
                  <button type="button" className="org-btn org-btn--secondary">
                    <Upload size={14} /> Upload favicon
                  </button>
                </div>
                <div className="settings-logo-preview settings-logo-preview--favicon" aria-hidden>
                  {form.hasCustomLogo ? 'A' : 'O'}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="org-btn org-btn--ghost"
              onClick={() => patch('hasCustomLogo', false)}
            >
              Reset logo to OneVo default
            </button>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Brand Colors</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-form-grid">
              {([
                ['primaryColor', 'Primary Color'],
                ['accentColor', 'Accent Color'],
              ] as const).map(([key, label]) => (
                <div key={key} className="org-form-field">
                  <label>{label}</label>
                  <div className="settings-color-row">
                    <input
                      type="color"
                      value={form[key]}
                      onChange={e => patch(key, e.target.value)}
                      aria-label={label}
                    />
                    <input
                      type="text"
                      value={form[key]}
                      onChange={e => patch(key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <h2 className="settings-card__title">Preview</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-preview-grid">
              <div className="settings-preview">
                <div className="settings-preview__label">Header</div>
                <div
                  className="settings-preview__header"
                  style={{ background: form.primaryColor, color: '#fff' }}
                >
                  <span className="settings-preview__logo" />
                  {form.hasCustomLogo ? 'Acme' : 'OneVo'}
                </div>
              </div>
              <div className="settings-preview">
                <div className="settings-preview__label">Login</div>
                <div className="settings-preview--login">
                  <div className="settings-preview__login-card">
                    <div
                      className="settings-preview__login-logo"
                      style={{ background: form.primaryColor }}
                    />
                    <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Sign in</div>
                    <div
                      style={{
                        marginTop: 8,
                        height: 6,
                        borderRadius: 3,
                        background: form.accentColor,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
