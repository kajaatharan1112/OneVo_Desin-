import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, Save, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInbox } from '../../../../core/notifications/inbox-context';
import { useEmployeeContext } from '../../context/employee-context';
import type {
  EmployeeOnboardingProfile,
  EmployeeProfileDocument,
  EmployeeProfileEmploymentType,
  EmployeeProfileWorkMode
} from '../../types/employee.types';

const CEO_PROFILE_ID = 'marcus';

const employmentTypeOptions: { value: EmployeeProfileEmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' }
];

const workModeOptions: { value: EmployeeProfileWorkMode; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' }
];
const timeZoneOptions = [
  { value: 'Europe/London', label: 'UK' },
  { value: 'America/New_York', label: 'USA' },
  { value: 'Asia/Colombo', label: 'Sri Lanka' },
  { value: 'Europe/Paris', label: 'Europe' }
];
const relationshipOptions = [
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Other', label: 'Other' }
];

const maritalStatusOptions = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' }
];
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Other', label: 'Other' },
  { value: 'Prefer not to say', label: 'Prefer not to say' }
];

const formatDate = (value: string) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
};

interface TextFieldProps {
  label: string;
  value: string;
  locked?: boolean;
  type?: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({ label, value, locked, type = 'text', multiline, onChange }) => (
  <label className="esp-field">
    <span className="esp-field__label">{label}</span>
    {multiline ? (
      <textarea value={value} disabled={locked} onChange={e => onChange(e.target.value)} rows={3} />
    ) : (
      <input type={type} value={value} disabled={locked} onChange={e => onChange(e.target.value)} />
    )}
  </label>
);

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  locked?: boolean;
  onChange: (value: T) => void;
}

const SelectField = <T extends string,>({ label, value, options, locked, onChange }: SelectFieldProps<T>) => (
  <label className="esp-field">
    <span className="esp-field__label">{label}</span>
    <select value={value} disabled={locked} onChange={e => onChange(e.target.value as T)}>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const Section: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({ title, className = '', children }) => (
  <section className={`esp-section ${className}`.trim()}>
    <h2>{title}</h2>
    <div className="esp-grid">{children}</div>
  </section>
);

export const EmployeeSelfProfile: React.FC = () => {
  const navigate = useNavigate();
  const { addInboxItem } = useInbox();
  const { selectedEmployee } = useEmployeeContext();
  const canEditCeoFields = selectedEmployee.id === CEO_PROFILE_ID;
  const [profile, setProfile] = useState<EmployeeOnboardingProfile>(selectedEmployee.onboardingProfile);
  const [documents, setDocuments] = useState<EmployeeProfileDocument[]>(selectedEmployee.onboardingProfile.documents);
  const [previewDocument, setPreviewDocument] = useState<EmployeeProfileDocument | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [saved]);

  const fullName = useMemo(
    () => `${profile.firstName} ${profile.lastName}`.trim() || selectedEmployee.name,
    [profile.firstName, profile.lastName, selectedEmployee.name]
  );

  const setField = <K extends keyof EmployeeOnboardingProfile>(key: K, value: EmployeeOnboardingProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const uploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocuments(prev => [...prev, {
      id: `doc-${selectedEmployee.id}-${Date.now()}`,
      name: file.name,
      type: file.type || 'Employee Upload',
      uploadedAt: new Date().toISOString().slice(0, 10),
      url: URL.createObjectURL(file)
    }]);
    event.target.value = '';
  };

  const saveProfile = () => {
    setProfile(prev => ({ ...prev, documents }));
    setSaved(true);
    if (!canEditCeoFields) {
      addInboxItem({
        id: `profile-update-${selectedEmployee.id}-${Date.now()}`,
        recipientId: CEO_PROFILE_ID,
        category: 'warning',
        title: 'Employee profile updated',
        message: `${fullName} updated their employee profile.`,
        timeLabel: 'Just now',
        filter: 'new',
        actions: []
      });
    }
  };

  return (
    <div className="esp-overlay" role="presentation" onMouseDown={() => navigate(-1)}>
      <aside className="esp-page" role="dialog" aria-modal="true" aria-labelledby="employee-profile-title" onMouseDown={event => event.stopPropagation()}>
        <header className="esp-header">
          <div className="esp-header__identity">
            <img src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} />
            <div>
              <h1 id="employee-profile-title">Employee Profile</h1>
              <p>{fullName} · {profile.position} · {profile.employeeNumber}</p>
            </div>
          </div>
          <button className="esp-icon-btn" type="button" aria-label="Close profile" title="Close" onClick={() => navigate(-1)}><X size={19} /></button>
        </header>

        <div className="esp-content">
          <Section title="About Me">
            <TextField label="Email Address" value={profile.emailAddress} locked={!canEditCeoFields} onChange={value => setField('emailAddress', value)} />
            <TextField label="First Name" value={profile.firstName} locked={!canEditCeoFields} onChange={value => setField('firstName', value)} />
            <TextField label="Last Name" value={profile.lastName} locked={!canEditCeoFields} onChange={value => setField('lastName', value)} />
            <TextField label="Position" value={profile.position} locked={!canEditCeoFields} onChange={value => setField('position', value)} />
            <TextField label="Employee Number" value={profile.employeeNumber} locked={!canEditCeoFields} onChange={value => setField('employeeNumber', value)} />
            <TextField label="Start Date" type="date" value={profile.startDate} locked={!canEditCeoFields} onChange={value => setField('startDate', value)} />
            <SelectField label="Employment Type" value={profile.employmentType} options={employmentTypeOptions} locked={!canEditCeoFields} onChange={value => setField('employmentType', value)} />
          </Section>

          <Section title="Contact Details">
            <TextField label="Work Email" value={profile.workEmail} locked={!canEditCeoFields} onChange={value => setField('workEmail', value)} />
            <TextField label="Mobile Number" value={profile.mobileNumber} onChange={value => setField('mobileNumber', value)} />
            <TextField label="Emergency Contact Name" value={profile.emergencyContactName} onChange={value => setField('emergencyContactName', value)} />
            <SelectField label="Relationship" value={profile.relationship} options={relationshipOptions} onChange={value => setField('relationship', value)} />
            <TextField label="Emergency Contact Number" value={profile.emergencyContactNumber} onChange={value => setField('emergencyContactNumber', value)} />
            <SelectField label="Work Mode" value={profile.workMode} options={workModeOptions} onChange={value => setField('workMode', value)} />
          </Section>

          <Section title="Personal Details">
            <TextField label="Date of Birth" type="date" value={profile.dateOfBirth} onChange={value => setField('dateOfBirth', value)} />
            <SelectField label="Gender" value={profile.gender} options={genderOptions} onChange={value => setField('gender', value)} />
            <SelectField label="Marital Status" value={profile.maritalStatus} options={maritalStatusOptions} onChange={value => setField('maritalStatus', value)} />
            <TextField label="Current Address" value={profile.currentAddress} multiline onChange={value => setField('currentAddress', value)} />
            <TextField label="Permanent Address" value={profile.permanentAddress} multiline onChange={value => setField('permanentAddress', value)} />
            <SelectField label="Time Zone" value={profile.timeZone} options={timeZoneOptions} onChange={value => setField('timeZone', value)} />
          </Section>

          <section className="esp-section">
            <div className="esp-section__head">
              <h2>Documents</h2>
              <button type="button" className="esp-icon-btn" onClick={() => fileInputRef.current?.click()} aria-label="Upload document" title="Upload document"><Upload size={17} /></button>
              <input ref={fileInputRef} className="esp-file-input" type="file" onChange={uploadDocument} />
            </div>
            <div className="esp-docs">
              {documents.map(document => (
                <div className="esp-doc" key={document.id}>
                  <div><strong>{document.name}</strong><span>{document.type} · Uploaded {formatDate(document.uploadedAt)}</span></div>
                  <button type="button" className="esp-icon-btn" onClick={() => setPreviewDocument(document)} aria-label={`View ${document.name}`} title="View document"><Eye size={17} /></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="esp-footer">
          <button type="button" className="esp-save-btn" onClick={saveProfile}><Save size={16} /> Save changes</button>
        </footer>

        {saved && <div className="esp-success" role="status"><Check size={17} /> Profile successfully updated</div>}
        {previewDocument && (
          <div className="esp-preview-backdrop" onMouseDown={() => setPreviewDocument(null)}>
            <div className="esp-preview" onMouseDown={event => event.stopPropagation()}>
              <button className="esp-icon-btn esp-preview__close" type="button" aria-label="Close preview" onClick={() => setPreviewDocument(null)}><X size={18} /></button>
              <Eye size={32} />
              <h3>{previewDocument.name}</h3>
              <p>{previewDocument.type} · Uploaded {formatDate(previewDocument.uploadedAt)}</p>
              {previewDocument.url && <a href={previewDocument.url} target="_blank" rel="noreferrer">Open uploaded file</a>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};