import React, { useState } from 'react';
import { Building2, Globe2, ImagePlus, MapPin, Save, Settings } from 'lucide-react';
import { SettingsPageHeader } from './components/SettingsPageHeader';
import { DEFAULT_GENERAL, WEEKDAY_OPTIONS, type GeneralSettings } from './settingsMockData';
import { recordHistory } from '../../store/historyStore';

const loadSettings = (): GeneralSettings => {
  try { return { ...DEFAULT_GENERAL, ...JSON.parse(localStorage.getItem('onevo-general-settings') ?? '{}') }; } catch { return DEFAULT_GENERAL; }
};

export const GeneralSettingsPage: React.FC = () => {
  const [form, setForm] = useState<GeneralSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const patch = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => { setForm(current => ({ ...current, [key]: value })); setSaved(false); };
  const save = () => { localStorage.setItem('onevo-general-settings', JSON.stringify(form)); setSaved(true); recordHistory({ title: 'Company settings updated', description: `General company information for ${form.companyName} was updated.`, category: 'Settings', target: form.companyName }); };

  return <div className="cfg-page general-settings-page">
    <SettingsPageHeader title="General Settings" description="Manage your company profile and preferences." icon={<Settings size={15} />} actions={<button className="org-btn org-btn--primary" onClick={save}><Save size={14} /> Save Changes</button>} />
    <div className="settings-body">
      {saved && <p className="admin-hint admin-hint--info">Company settings saved successfully.</p>}
      <section className="settings-card"><header className="settings-card__header"><div><h2 className="settings-card__title"><Building2 size={15} /> Company Information</h2></div></header><div className="settings-card__body general-company-layout">
        <div className="general-logo-card"><div className="general-logo-preview">V</div><strong>Company Logo</strong><span>PNG, JPG or SVG · Max 2MB</span><button className="org-btn org-btn--secondary"><ImagePlus size={14} /> Change Logo</button></div>
        <div className="settings-form-grid">
          <Field label="Company Name" value={form.companyName} onChange={value => patch('companyName', value)} required />
          <Field label="Legal Entity Name" value={form.legalEntityName} onChange={value => patch('legalEntityName', value)} required />
          <Field label="Registration Number" value={form.registrationNumber} onChange={value => patch('registrationNumber', value)} required />
          <Field label="Company Email" value={form.companyEmail} onChange={value => patch('companyEmail', value)} required type="email" />
          <div className="settings-form-grid__full"><Field label="Website" value={form.website} onChange={value => patch('website', value)} /></div>
        </div>
      </div></section>
      <section className="settings-card"><header className="settings-card__header"><div><h2 className="settings-card__title"><MapPin size={15} /> Location</h2></div></header><div className="settings-card__body settings-form-grid settings-form-grid--3">
        <div className="settings-form-grid__full"><Field label="Registered Address" value={form.registeredAddress} onChange={value => patch('registeredAddress', value)} required /></div>
        <Field label="Country" value={form.country} onChange={value => patch('country', value)} required /><Field label="State / Province" value={form.state} onChange={value => patch('state', value)} required /><Field label="City" value={form.city} onChange={value => patch('city', value)} required />
      </div></section>
      <section className="settings-card"><header className="settings-card__header"><div><h2 className="settings-card__title"><Globe2 size={15} /> Regional Preferences</h2></div></header><div className="settings-card__body settings-form-grid settings-form-grid--3">
        <Select label="Timezone" value={form.timezone} onChange={value => patch('timezone', value)} options={['Asia/Colombo', 'Asia/Kolkata', 'Europe/London', 'America/New_York']} /><Select label="Language" value={form.language} onChange={value => patch('language', value)} options={['English (UK)', 'English (US)', 'Tamil', 'Sinhala']} /><Select label="Date Format" value={form.dateFormat} onChange={value => patch('dateFormat', value)} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} /><Select label="Week Starts On" value={form.weekStartDay} onChange={value => patch('weekStartDay', value)} options={WEEKDAY_OPTIONS} />
      </div></section>
    </div>
  </div>;
};

const Field = ({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) => <div className="org-form-field"><label>{label}{required && ' *'}</label><input type={type} value={value} onChange={event => onChange(event.target.value)} required={required} /></div>;
const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) => <div className="org-form-field"><label>{label}</label><select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select></div>;
