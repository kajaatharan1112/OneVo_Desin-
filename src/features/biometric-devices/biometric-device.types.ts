export type BiometricBrand = 'ZKTeco' | 'Hikvision' | 'eSSL' | 'Suprema' | 'Anviz' | 'Others';
export type DeviceStatus = 'online' | 'offline' | 'attention' | 'disabled' | 'archived';
export type SyncFrequency = 'Realtime' | 'Every 5 Minutes' | 'Every 15 Minutes' | 'Hourly' | 'Manual';
export type SyncDirection = 'HRMS → Device' | 'Device → HRMS' | 'Two-Way Synchronization';

export interface DeviceLog {
  id: string;
  at: string;
  event: string;
  description: string;
  status: 'success' | 'info' | 'failed';
}

export interface BiometricDevice {
  id: string;
  name: string;
  brand: BiometricBrand;
  model: string;
  serialNumber: string;
  firmware: string;
  ipAddress: string;
  port: number;
  branch: string;
  location: string;
  timezone: string;
  status: DeviceStatus;
  healthScore: number;
  lastHeartbeat: string;
  lastSync: string;
  nextSync: string;
  connectedSince: string;
  syncFrequency: SyncFrequency;
  syncDirection: SyncDirection;
  autoRetry: boolean;
  retryAttempts: number;
  latency: number;
  logs: DeviceLog[];
}

export interface ConnectDeviceForm {
  brand: BiometricBrand | '';
  name: string;
  ipAddress: string;
  port: string;
  communicationKey: string;
  username: string;
  password: string;
  description: string;
  company: string;
  branch: string;
  location: string;
  timezone: string;
  syncFrequency: SyncFrequency;
  syncDirection: SyncDirection;
  autoRetry: boolean;
  retryAttempts: number;
}

export const EMPTY_CONNECT_DEVICE_FORM: ConnectDeviceForm = {
  brand: '', name: '', ipAddress: '', port: '4370', communicationKey: '', username: '', password: '',
  description: '', company: 'OneVo Holdings', branch: '', location: '', timezone: 'Asia/Colombo',
  syncFrequency: 'Every 5 Minutes', syncDirection: 'Device → HRMS', autoRetry: true, retryAttempts: 3,
};
