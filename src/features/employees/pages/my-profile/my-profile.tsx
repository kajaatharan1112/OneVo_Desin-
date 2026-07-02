import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload, X } from 'lucide-react';
import { useEmployeeContext } from '../../context/employee-context';

const profileMeta = {
  alex: {
    email: 'alexander.pierce@onevolanka.com',
    company: 'OneVo Lanka',
    department: 'Engineering',
    startDate: '2026-06-25',
    phone: '+94 77 123 4567',
    address: '1 Nuwara Eliya Road',
    city: 'Nuwaraeliya',
    emergencyName: 'Shila sha',
    relationship: 'Sister',
    emergencyPhone: '+94 770000000',
    secondaryName: 'Vaishnavi',
    secondaryPhone: '+94 701111111'
  },
  marcus: {
    email: 'marcus.chen@onevo.com',
    company: 'OneVo HRMS',
    department: 'Executive',
    startDate: '2025-01-10',
    phone: '+1 212 555 0145',
    address: '400 Madison Avenue',
    city: 'New York',
    emergencyName: 'Lina Chen',
    relationship: 'Spouse',
    emergencyPhone: '+1 212 555 0188',
    secondaryName: 'Aaron Chen',
    secondaryPhone: '+1 212 555 0194'
  },
  manager: {
    email: 'dana.brooks@onevo.com',
    company: 'OneVo UK',
    department: 'People Operations',
    startDate: '2025-08-18',
    phone: '+44 20 7946 0321',
    address: '25 King Street',
    city: 'London',
    emergencyName: 'Mia Brooks',
    relationship: 'Sister',
    emergencyPhone: '+44 20 7946 0456',
    secondaryName: 'Noah Brooks',
    secondaryPhone: '+44 20 7946 0789'
  }
} as const;

const TIMEZONES = [
  '(GMT+05:30) Sri Lanka Time',
  '(GMT+00:00) Greenwich Mean Time',
  '(GMT-05:00) Eastern Time'
];

const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];

export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedEmployee } = useEmployeeContext();
  const data = profileMeta[selectedEmployee.id];
  const [saved, setSaved] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(selectedEmployee.avatarUrl);
  const [photoMessage, setPhotoMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef('');

  const initials = useMemo(
    () => selectedEmployee.name.split(' ').map(part => part[0]).join('').slice(0, 2),
    [selectedEmployee.name]
  );

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);


  const closeProfile = () => {
    navigate('/');
  };

  const saveProfile = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type)) {
      setPhotoMessage('Please upload a JPG or PNG file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      setPhotoMessage('Photo must be 2MB or smaller.');
      event.target.value = '';
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setProfilePhotoUrl(nextUrl);
    setPhotoMessage(file.name);
    event.target.value = '';
  };

  return (
    <section className="my-profile-page" aria-labelledby="my-profile-title">
      {saved && (
        <div className="my-profile-toast" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Profile saved successfully</span>
          <button type="button" onClick={() => setSaved(false)} aria-label="Dismiss saved message">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <header className="my-profile-header">
        <div className="my-profile-header__title-group">

          <h1 id="my-profile-title">My Profile</h1>
        </div>
        <button type="button" className="my-profile-close-btn" onClick={closeProfile} aria-label="Close profile">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="my-profile-layout">
        <div className="my-profile-details">
          <div className="my-profile-card my-profile-card--identity">
            <dl className="my-profile-info-list">
              <div>
                <dt>Full name</dt>
                <dd>{selectedEmployee.name}</dd>
              </div>
              <div>
                <dt>Work email</dt>
                <dd>{data.email}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{data.company}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{data.department}</dd>
              </div>
              <div>
                <dt>Position</dt>
                <dd>{selectedEmployee.role}</dd>
              </div>
              <div>
                <dt>Start date</dt>
                <dd>{data.startDate}</dd>
              </div>
            </dl>
          </div>

          <div className="my-profile-form-grid">
            <label>
              <span>Phone number</span>
              <input defaultValue={data.phone} />
            </label>
            <label>
              <span>Address line</span>
              <input defaultValue={data.address} />
            </label>
            <label>
              <span>City</span>
              <input defaultValue={data.city} />
            </label>
            <label>
              <span>Country</span>
              <select defaultValue={selectedEmployee.country}>
                <option>Sri Lanka</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </label>
            <label>
              <span>Display timezone</span>
              <select defaultValue={TIMEZONES[0]}>
                {TIMEZONES.map(timezone => <option key={timezone}>{timezone}</option>)}
              </select>
            </label>
          </div>
        </div>

        <aside className="my-profile-card my-profile-photo-card" aria-label="Profile photo">
          <h2>Profile photo</h2>
          <div className="my-profile-avatar">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            className="my-profile-file-input"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handlePhotoUpload}
          />
          <button type="button" className="my-profile-upload" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} aria-hidden="true" />
            Upload Photo
          </button>
          <p>{photoMessage || 'JPG, PNG up to 2MB'}</p>
        </aside>
      </div>

      <section className="my-profile-emergency" aria-labelledby="emergency-title">
        <h2 id="emergency-title">Emergency Contact</h2>
        <div className="my-profile-emergency-grid">
          <label>
            <span>Emergency contact name</span>
            <input defaultValue={data.emergencyName} />
          </label>
          <label>
            <span>Secondary contact name (optional)</span>
            <input defaultValue={data.secondaryName} />
          </label>
          <label>
            <span>Relationship</span>
            <select defaultValue={data.relationship}>
              <option>Father</option>
              <option>Mother</option>
              <option>Brother</option>
              <option>Sister</option>
              <option>Spouse</option>
              <option>Friend</option>
              <option>Guardian</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            <span>Secondary contact phone (optional)</span>
            <input defaultValue={data.secondaryPhone} />
          </label>
          <label>
            <span>Emergency contact phone</span>
            <input defaultValue={data.emergencyPhone} />
          </label>
        </div>
      </section>

      <footer className="my-profile-actions">
        <button type="button" className="my-profile-btn my-profile-btn--secondary">
          Save Draft
        </button>
        <button type="button" className="my-profile-btn my-profile-btn--primary" onClick={saveProfile}>
          Save &amp; Continue
        </button>
      </footer>
    </section>
  );
};