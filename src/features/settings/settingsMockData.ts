import { formatDateTime, formatRelativeTime } from '../admin/adminMockData';

export { formatDateTime, formatRelativeTime };

export interface GeneralSettings {
  companyName: string;
  displayName: string;
  timezone: string;
  dateFormat: string;
  weekStartDay: string;
  language: string;
}

export const DEFAULT_GENERAL: GeneralSettings = {
  companyName: 'Acme Corporation',
  displayName: 'Acme',
  timezone: 'Europe/London',
  dateFormat: 'DD/MM/YYYY',
  weekStartDay: 'Mon',
  language: 'English (UK)',
};

export const WEEKDAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  sidebarBg: string;
  sidebarText: string;
  hasCustomLogo: boolean;
}

export const DEFAULT_BRANDING: BrandingSettings = {
  primaryColor: '#2563eb',
  accentColor: '#0ea5e9',
  sidebarBg: '#0f172a',
  sidebarText: '#f8fafc',
  hasCustomLogo: true,
};

/** Whether password login is enabled for the tenant (operator-configured). */
export const PASSWORD_LOGIN_ENABLED = true;

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate: string | null;
}

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv-1', number: 'INV-2026-06', date: '2026-06-01', amount: '£2,450.00', status: 'paid', paymentDate: '2026-06-02' },
  { id: 'inv-2', number: 'INV-2026-05', date: '2026-05-01', amount: '£2,450.00', status: 'paid', paymentDate: '2026-05-02' },
  { id: 'inv-3', number: 'INV-2026-04', date: '2026-04-01', amount: '£2,200.00', status: 'paid', paymentDate: '2026-04-03' },
];

export type DeviceStatus = 'online' | 'offline' | 'outdated' | 'revoked';

export interface TenantDevice {
  id: string;
  name: string;
  employeeName: string;
  os: string;
  agentVersion: string;
  latestAgentVersion: string;
  lastHeartbeat: string | null;
  status: DeviceStatus;
  firstRegistered: string;
  osVersion: string;
  healthEvents: { timestamp: string; message: string }[];
}

export const MOCK_DEVICES: TenantDevice[] = [
  {
    id: 'dev-1',
    name: 'Priya-MacBook',
    employeeName: 'Priya Sharma',
    os: 'macOS',
    osVersion: '14.5',
    agentVersion: '2.4.1',
    latestAgentVersion: '2.4.1',
    lastHeartbeat: '2026-06-12T10:20:00Z',
    status: 'online',
    firstRegistered: '2025-11-10T09:00:00Z',
    healthEvents: [
      { timestamp: '2026-06-12T10:20:00Z', message: 'Heartbeat received' },
      { timestamp: '2026-06-12T08:00:00Z', message: 'Agent started' },
    ],
  },
  {
    id: 'dev-2',
    name: 'James-Win11',
    employeeName: 'James Chen',
    os: 'Windows',
    osVersion: '11 23H2',
    agentVersion: '2.3.8',
    latestAgentVersion: '2.4.1',
    lastHeartbeat: '2026-06-11T22:10:00Z',
    status: 'outdated',
    firstRegistered: '2026-01-15T11:30:00Z',
    healthEvents: [
      { timestamp: '2026-06-11T22:10:00Z', message: 'Heartbeat received' },
      { timestamp: '2026-06-10T09:00:00Z', message: 'Agent update available' },
    ],
  },
  {
    id: 'dev-3',
    name: 'Maria-Laptop',
    employeeName: 'Maria Lopez',
    os: 'Windows',
    osVersion: '11 22H2',
    agentVersion: '2.4.1',
    latestAgentVersion: '2.4.1',
    lastHeartbeat: '2026-06-10T14:00:00Z',
    status: 'offline',
    firstRegistered: '2026-02-20T08:45:00Z',
    healthEvents: [
      { timestamp: '2026-06-10T14:00:00Z', message: 'Heartbeat received' },
      { timestamp: '2026-06-09T18:30:00Z', message: 'Device went offline' },
    ],
  },
  {
    id: 'dev-4',
    name: 'David-OldPC',
    employeeName: 'David Nguyen',
    os: 'Windows',
    osVersion: '10 22H2',
    agentVersion: '2.2.0',
    latestAgentVersion: '2.4.1',
    lastHeartbeat: null,
    status: 'revoked',
    firstRegistered: '2025-08-01T10:00:00Z',
    healthEvents: [
      { timestamp: '2026-05-01T12:00:00Z', message: 'Device revoked by administrator' },
    ],
  },
];
